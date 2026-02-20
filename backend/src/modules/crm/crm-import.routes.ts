import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { logSystemActivity } from "../../utils/system-activity";

const router = Router();

router.use(authRequired);
router.use(requireRole("CRM", "ADMIN"));

function actorFromReq(req: any) {
  const role = req.user?.role;
  if (role === "CRM") return { actorType: "CRM" as const, actorId: String(req.user?.id) };
  if (role === "ADMIN") return { actorType: "ADMIN" as const, actorId: String(req.user?.id) };
  return { actorType: "SYSTEM" as const, actorId: null };
}

function normalizePhone(v: any): string | null {
  if (v === null || v === undefined) return null;
  const digits = String(v).replace(/\D/g, "");
  return digits.length ? digits : null;
}

function normalizeEmail(v: any): string | null {
  if (!v) return null;
  const s = String(v).trim().toLowerCase();
  return s.includes("@") ? s : null;
}

/**
 * POST /crm/import/preview
 * body: { source, filename?, rows: object[], mapping: { primaryName, phone?, email?, preferredCentre?, programmeInterest? } }
 */
router.post("/import/preview", async (req, res) => {
  try {
    if (!(prisma as any).crmImportJob || !(prisma as any).crmImportRow) {
      return res.status(500).json({ message: "CRM import models not available. Please run migrations + prisma generate for CRM." });
    }

    const { source, filename, rows, mapping } = req.body as any;
    if (!source || !Array.isArray(rows)) return res.status(400).json({ message: "source and rows[] are required" });

    const capped = rows.slice(0, 5000);

    const job = await (prisma as any).crmImportJob.create({
      data: {
        source: String(source),
        filename: filename || null,
        status: "DRAFT",
        mapping: mapping ?? null,
        summary: { totalRows: capped.length },
        createdByCrmUserId: req.user?.role === "CRM" ? req.user.id : null,
        updatedAt: new Date(),
      },
    });

    // Insert rows (raw only; validation happens in /validate)
    for (let i = 0; i < capped.length; i++) {
      await (prisma as any).crmImportRow.create({
        data: {
          jobId: job.id,
          rowNumber: i + 1,
          raw: capped[i],
          normalized: null,
          isValid: false,
          error: null,
          dedupeKey: null,
          resolvedLeadId: null,
        },
      });
    }

    const previewRows = await (prisma as any).crmImportRow.findMany({
      where: { jobId: job.id },
      orderBy: { rowNumber: "asc" },
      take: 25,
    });

    return res.status(201).json({ job, previewRows });
  } catch (error: any) {
    console.error("CRM import preview error:", error);
    return res.status(500).json({ message: error.message || "Failed to create import preview" });
  }
});

/**
 * POST /crm/import/:jobId/validate
 * body: { mapping }
 */
router.post("/import/:jobId/validate", async (req, res) => {
  try {
    if (!(prisma as any).crmImportJob || !(prisma as any).crmImportRow) {
      return res.status(500).json({ message: "CRM import models not available. Please run migrations + prisma generate for CRM." });
    }

    const jobId = String(req.params.jobId);
    const { mapping } = req.body as any;

    const job = await (prisma as any).crmImportJob.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: "Import job not found" });

    const finalMapping = mapping ?? job.mapping ?? {};
    const rows = await (prisma as any).crmImportRow.findMany({ where: { jobId }, orderBy: { rowNumber: "asc" }, take: 5000 });

    let validCount = 0;
    let invalidCount = 0;
    let dedupeCandidates = 0;

    for (const r of rows || []) {
      const raw = r.raw || {};
      const primaryName = finalMapping.primaryName ? raw[finalMapping.primaryName] : raw["name"] || raw["Name"];
      const phone = finalMapping.phone ? raw[finalMapping.phone] : raw["phone"] || raw["Phone"];
      const email = finalMapping.email ? raw[finalMapping.email] : raw["email"] || raw["Email"];
      const preferredCentre = finalMapping.preferredCentre ? raw[finalMapping.preferredCentre] : raw["preferredCentre"] || raw["Centre"] || raw["Center"];
      const programmeInterest = finalMapping.programmeInterest ? raw[finalMapping.programmeInterest] : raw["programmeInterest"] || raw["Programme"] || raw["Program"];

      const normalized = {
        primaryName: primaryName ? String(primaryName).trim() : null,
        phone: normalizePhone(phone),
        email: normalizeEmail(email),
        preferredCentre: preferredCentre ? String(preferredCentre).trim() : null,
        programmeInterest: programmeInterest ? String(programmeInterest).trim() : null,
      };

      let isValid = true;
      let errorMsg: string | null = null;
      if (!normalized.primaryName) {
        isValid = false;
        errorMsg = "Missing primaryName";
      }
      if (!normalized.phone && !normalized.email) {
        isValid = false;
        errorMsg = errorMsg ? `${errorMsg}; Missing phone/email` : "Missing phone/email";
      }

      const dedupeKey = normalized.email || normalized.phone;
      if (dedupeKey) dedupeCandidates += 1;

      await (prisma as any).crmImportRow.update({
        where: { id: r.id },
        data: {
          normalized,
          isValid,
          error: isValid ? null : errorMsg,
          dedupeKey: dedupeKey || null,
        },
      });

      if (isValid) validCount += 1;
      else invalidCount += 1;
    }

    const updatedJob = await (prisma as any).crmImportJob.update({
      where: { id: jobId },
      data: {
        status: "VALIDATED",
        mapping: finalMapping,
        summary: {
          ...(job.summary || {}),
          totalRows: rows.length,
          validCount,
          invalidCount,
          dedupeCandidates,
        },
        updatedAt: new Date(),
      },
    });

    const { actorType, actorId } = actorFromReq(req);
    await logSystemActivity({
      actorType,
      actorId,
      action: "CRM_IMPORT_VALIDATED",
      entityType: "CrmImportJob",
      entityId: jobId,
      before: job,
      after: updatedJob,
      metadata: { validCount, invalidCount },
    });

    return res.json({ job: updatedJob, validCount, invalidCount });
  } catch (error: any) {
    console.error("CRM import validate error:", error);
    return res.status(500).json({ message: error.message || "Failed to validate import" });
  }
});

/**
 * POST /crm/import/:jobId/commit
 */
router.post("/import/:jobId/commit", async (req, res) => {
  try {
    if (!(prisma as any).crmImportJob || !(prisma as any).crmImportRow || !(prisma as any).crmLead || !(prisma as any).crmManualLeadSource) {
      return res.status(500).json({ message: "CRM import models not available. Please run migrations + prisma generate for CRM." });
    }

    const jobId = String(req.params.jobId);
    const job = await (prisma as any).crmImportJob.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: "Import job not found" });

    const rows = await (prisma as any).crmImportRow.findMany({
      where: { jobId, isValid: true },
      orderBy: { rowNumber: "asc" },
      take: 5000,
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const r of rows || []) {
      const n = r.normalized || {};
      if (!n.primaryName) {
        skippedCount += 1;
        continue;
      }

      const manual = await (prisma as any).crmManualLeadSource.create({
        data: {
          primaryName: n.primaryName,
          phone: n.phone || null,
          email: n.email || null,
          preferredCentre: n.preferredCentre || null,
          programmeInterest: n.programmeInterest || null,
          raw: r.raw ?? null,
        },
      });

      const lead = await (prisma as any).crmLead.create({
        data: {
          sourceType: "MANUAL",
          sourceId: manual.id,
          primaryName: manual.primaryName,
          phone: manual.phone,
          email: manual.email,
          preferredCentre: manual.preferredCentre,
          programmeInterest: manual.programmeInterest,
          stage: "NEW",
          status: "OPEN",
          priority: 0,
          tags: [],
          customFields: null,
          updatedAt: new Date(),
        },
      });

      if ((prisma as any).crmActivity) {
        await (prisma as any).crmActivity.create({
          data: {
            leadId: lead.id,
            type: "IMPORTED",
            title: "Imported",
            body: `Imported from ${job.source}${job.filename ? ` (${job.filename})` : ""}`,
            occurredAt: new Date(),
            createdByCrmUserId: req.user?.role === "CRM" ? req.user.id : null,
            metadata: { importJobId: jobId, rowId: r.id },
          },
        });
      }

      await (prisma as any).crmImportRow.update({
        where: { id: r.id },
        data: { resolvedLeadId: lead.id },
      });

      createdCount += 1;
    }

    const updatedJob = await (prisma as any).crmImportJob.update({
      where: { id: jobId },
      data: {
        status: "COMMITTED",
        summary: {
          ...(job.summary || {}),
          committedAt: new Date().toISOString(),
          createdCount,
          skippedCount,
        },
        updatedAt: new Date(),
      },
    });

    const { actorType, actorId } = actorFromReq(req);
    await logSystemActivity({
      actorType,
      actorId,
      action: "CRM_IMPORT_COMMITTED",
      entityType: "CrmImportJob",
      entityId: jobId,
      before: job,
      after: updatedJob,
      metadata: { createdCount, skippedCount },
    });

    return res.json({ job: updatedJob, createdCount, skippedCount });
  } catch (error: any) {
    console.error("CRM import commit error:", error);
    return res.status(500).json({ message: error.message || "Failed to commit import" });
  }
});

/**
 * GET /crm/import/jobs
 */
router.get("/import/jobs", async (_req, res) => {
  try {
    if (!(prisma as any).crmImportJob) {
      return res.status(500).json({ message: "CRM import models not available. Please run migrations + prisma generate for CRM." });
    }
    const jobs = await (prisma as any).crmImportJob.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return res.json(jobs || []);
  } catch (error: any) {
    console.error("CRM import jobs list error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch import jobs" });
  }
});

export default router;


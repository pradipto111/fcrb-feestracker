import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { logSystemActivity } from "../../utils/system-activity";
import { DEFAULT_ASSIGNMENT_RULES } from "./crm-settings.routes";

const router = Router();

router.use(authRequired);
router.use(requireRole("CRM", "ADMIN"));

/** All valid CrmLeadStage values (must match schema.prisma enum). Use for validation and raw fallback. */
const VALID_CRM_LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "WILL_JOIN",
  "JOINED",
  "UNINTERESTED_NO_RESPONSE",
] as const;

function actorFromReq(req: any) {
  const role = req.user?.role;
  if (role === "CRM") return { actorType: "CRM" as const, actorId: String(req.user?.id) };
  if (role === "ADMIN") return { actorType: "ADMIN" as const, actorId: String(req.user?.id) };
  return { actorType: "SYSTEM" as const, actorId: null };
}

async function resolveOwnerId(settings: any) {
  const rules = settings?.assignmentRules || DEFAULT_ASSIGNMENT_RULES;
  if (rules.mode !== "ROUND_ROBIN") return { ownerId: null, nextIndex: rules.lastAssignedIndex ?? -1 };
  const ids = Array.isArray(rules.roundRobinUserIds) ? rules.roundRobinUserIds : [];
  if (ids.length === 0) return { ownerId: null, nextIndex: rules.lastAssignedIndex ?? -1 };
  const lastIndex = Number.isFinite(Number(rules.lastAssignedIndex)) ? Number(rules.lastAssignedIndex) : -1;
  const nextIndex = (lastIndex + 1) % ids.length;
  return { ownerId: Number(ids[nextIndex]), nextIndex };
}

/**
 * POST /crm/leads
 * body: { primaryName, sourceType?, sourceId?, phone?, email?, city?, preferredCentre?, programmeInterest?, stage?, status?, priority?, score?, ownerId?, tags?, customFields?, convertedStudentId?, convertedFanId?, convertedOrderId? }
 */
router.post("/", async (req, res) => {
  try {
    if (!(prisma as any).crmLead) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }

    const {
      primaryName,
      sourceType,
      sourceId,
      phone,
      email,
      city,
      preferredCentre,
      programmeInterest,
      stage,
      status,
      priority,
      score,
      ownerId,
      tags,
      customFields,
      convertedStudentId,
      convertedFanId,
      convertedOrderId,
    } = req.body as any;

    if (!primaryName) return res.status(400).json({ message: "primaryName is required" });

    const isManual = !sourceType || sourceType === "MANUAL";
    const finalSourceType = isManual ? "MANUAL" : sourceType;

    if (isManual && (phone === undefined || phone === null || String(phone).trim() === "")) {
      return res.status(400).json({ message: "phone is required for manual leads" });
    }

    if (!isManual && (sourceId === undefined || sourceId === null || sourceId === "")) {
      return res.status(400).json({ message: "sourceId is required for non-manual sourceType" });
    }

    const existing = !isManual
      ? await (prisma as any).crmLead?.findUnique({ where: { sourceType_sourceId: { sourceType: finalSourceType, sourceId: Number(sourceId) } } })
      : null;
    if (existing) return res.status(409).json({ message: "Lead already exists for this source" });

    const settings = await (prisma as any).crmSettings?.findFirst().catch(() => null);
    const { ownerId: assignedOwnerId, nextIndex } = ownerId === undefined || ownerId === null || ownerId === ""
      ? await resolveOwnerId(settings)
      : { ownerId: Number(ownerId), nextIndex: settings?.assignmentRules?.lastAssignedIndex ?? -1 };

    const tagsArr = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    let createdLead: any = null;
    await prisma.$transaction(async (tx) => {
      let finalSourceId = Number(sourceId);
      if (isManual) {
        const manual = await (tx as any).crmManualLeadSource?.create({
          data: {
            primaryName,
            phone: phone || null,
            email: email || null,
            preferredCentre: preferredCentre || null,
            programmeInterest: programmeInterest || null,
            raw: { city, customFields },
          },
        });
        finalSourceId = manual?.id;
      }

      if (!isManual && Number.isNaN(finalSourceId)) {
        throw new Error("Invalid sourceId");
      }

      createdLead = await (tx as any).crmLead?.create({
        data: {
          sourceType: finalSourceType,
          sourceId: finalSourceId,
          primaryName,
          phone: phone || null,
          email: email || null,
          city: city || null,
          preferredCentre: preferredCentre || null,
          programmeInterest: programmeInterest || null,
          stage: stage || "NEW",
          status: status || "OPEN",
          priority: Number.isFinite(Number(priority)) ? Number(priority) : 0,
          score: score !== undefined && score !== null && score !== "" ? Number(score) : null,
          ownerId: assignedOwnerId,
          tags: tagsArr,
          customFields: customFields ?? null,
          convertedStudentId: convertedStudentId ? Number(convertedStudentId) : null,
          convertedFanId: convertedFanId ? Number(convertedFanId) : null,
          convertedOrderId: convertedOrderId ? Number(convertedOrderId) : null,
        },
        include: {
          owner: { select: { id: true, fullName: true, email: true, role: true, status: true } },
        },
      });

      if (settings?.assignmentRules?.mode === "ROUND_ROBIN" && assignedOwnerId && (tx as any).crmSettings) {
        await (tx as any).crmSettings.update({
          where: { id: settings.id },
          data: { assignmentRules: { ...DEFAULT_ASSIGNMENT_RULES, ...settings.assignmentRules, lastAssignedIndex: nextIndex } },
        });
      }
    });

    if ((prisma as any).crmActivity) {
      await (prisma as any).crmActivity.create({
        data: {
          leadId: createdLead.id,
          type: "NOTE",
          title: "Lead created",
          body: `Created lead for ${primaryName}`,
          occurredAt: new Date(),
          createdByCrmUserId: req.user?.role === "CRM" ? req.user.id : null,
        },
      });
    }

    const { actorType, actorId } = actorFromReq(req);
    await logSystemActivity({
      actorType,
      actorId,
      action: "CRM_LEAD_CREATED",
      entityType: "CrmLead",
      entityId: createdLead.id,
      after: createdLead,
      metadata: { sourceType: finalSourceType },
    });

    return res.status(201).json(createdLead);
  } catch (error: any) {
    console.error("CRM lead create error:", error);
    return res.status(500).json({ message: error.message || "Failed to create CRM lead" });
  }
});

/**
 * GET /crm/leads
 * Query leads (list view). Frontend groups into kanban stages.
 * Role-based filtering: CRM AGENTs see only their assigned leads.
 */
router.get("/", async (req, res) => {
  try {
    if (!(prisma as any).crmLead) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }
    const { search, stage, status, sourceType, ownerId, limit, offset } = req.query as any;

    const where: any = {};
    
    // Role-based filtering: CRM AGENTs see only their assigned leads
    if (req.user?.role === "CRM" && req.user?.crmRole === "AGENT") {
      where.ownerId = req.user.id;
    }
    
    if (stage) where.stage = stage;
    if (status) where.status = status;
    if (sourceType) where.sourceType = sourceType;
    if (ownerId) where.ownerId = Number(ownerId);
    if (search) {
      where.OR = [
        { primaryName: { contains: String(search), mode: "insensitive" } },
        { phone: { contains: String(search), mode: "insensitive" } },
        { email: { contains: String(search), mode: "insensitive" } },
        { preferredCentre: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const take = Math.min(Math.max(parseInt(limit || "200", 10), 1), 500);
    const skip = Math.max(parseInt(offset || "0", 10), 0);

    const rows = await (prisma as any).crmLead?.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take,
      skip,
      include: {
        owner: { select: { id: true, fullName: true, email: true, role: true, status: true } },
      },
    });

    return res.json(rows || []);
  } catch (error: any) {
    console.error("CRM leads list error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch CRM leads" });
  }
});

/**
 * GET /crm/leads/:id
 * Role-based access: CRM users can only access their assigned leads.
 */
router.get("/:id", async (req, res) => {
  try {
    if (!(prisma as any).crmLead) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }
    const id = String(req.params.id);
    const lead = await (prisma as any).crmLead?.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, email: true, role: true, status: true } },
        activities: { orderBy: { occurredAt: "desc" }, take: 100 },
        tasks: { orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }], take: 100 },
      },
    });
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    
    // Role-based access: CRM users can only access their assigned leads
    if (req.user?.role === "CRM") {
      if (lead.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Access denied: You can only view your assigned leads" });
      }
    }
    
    return res.json(lead);
  } catch (error: any) {
    console.error("CRM lead get error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch CRM lead" });
  }
});

/**
 * PUT /crm/leads/:id
 * body: { stage?, status?, ownerId?, tags?, priority?, score?, customFields?, nextAction? }
 * nextAction: { type: string, scheduledAt?: string, notes?: string } - optional but recommended on stage change
 */
router.put("/:id", async (req, res) => {
  try {
    if (!(prisma as any).crmLead) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }
    const id = String(req.params.id);
    const { stage, status, ownerId, tags, priority, score, customFields, nextAction } = req.body as any;

    const existing = await (prisma as any).crmLead?.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Lead not found" });

    const updatedAt = new Date();
    const data: any = { updatedAt };
    let stageVal: string | undefined;
    if (stage !== undefined) {
      const s = String(stage).toUpperCase();
      if (VALID_CRM_LEAD_STAGES.includes(s as (typeof VALID_CRM_LEAD_STAGES)[number])) {
        data.stage = s;
        stageVal = s;
      }
    }
    if (status !== undefined) data.status = status;
    if (ownerId !== undefined) data.ownerId = ownerId === null ? null : Number(ownerId);
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (priority !== undefined) data.priority = Number(priority);
    if (score !== undefined) data.score = score === null ? null : Number(score);
    if (customFields !== undefined) data.customFields = customFields === null ? null : customFields;

    let updated: any;
    if (stageVal != null) {
      await (prisma as any).$executeRaw`UPDATE "CrmLead" SET stage = ${stageVal}::"CrmLeadStage", "updatedAt" = ${updatedAt} WHERE id = ${id}`;
      const rest: any = { updatedAt };
      if (status !== undefined) rest.status = data.status;
      if (ownerId !== undefined) rest.ownerId = data.ownerId;
      if (tags !== undefined) rest.tags = data.tags;
      if (priority !== undefined) rest.priority = data.priority;
      if (score !== undefined) rest.score = data.score;
      if (customFields !== undefined) rest.customFields = data.customFields;
      if (Object.keys(rest).length > 1) {
        await (prisma as any).crmLead?.update({ where: { id }, data: rest });
      }
      updated = await (prisma as any).crmLead?.findUnique({
        where: { id },
        include: { owner: { select: { id: true, fullName: true, email: true, role: true, status: true } } },
      });
      if (!updated) return res.status(404).json({ message: "Lead not found" });
    } else {
      updated = await (prisma as any).crmLead?.update({
        where: { id },
        data,
        include: { owner: { select: { id: true, fullName: true, email: true, role: true, status: true } } },
      });
    }

    // Write CRM-native activity entries for key changes (best-effort)
    try {
      if ((prisma as any).crmActivity) {
        const actorCrmUserId = req.user?.role === "CRM" ? req.user.id : null;
        if (stage !== undefined && existing.stage !== updated.stage) {
          // Log stage change with next action if provided
          let stageChangeBody = `${existing.stage} → ${updated.stage}`;
          const metadata: any = { previousStage: existing.stage, newStage: updated.stage };
          
          if (nextAction && nextAction.type) {
            stageChangeBody += ` | Next: ${nextAction.type}`;
            if (nextAction.scheduledAt) {
              stageChangeBody += ` (${new Date(nextAction.scheduledAt).toLocaleString()})`;
              metadata.nextActionScheduledAt = nextAction.scheduledAt;
            }
            if (nextAction.notes) {
              metadata.nextActionNotes = nextAction.notes;
            }
            metadata.nextActionType = nextAction.type;
          }
          
          await (prisma as any).crmActivity.create({
            data: {
              leadId: id,
              type: "STAGE_CHANGED",
              title: "Stage changed",
              body: stageChangeBody,
              metadata: Object.keys(metadata).length > 2 ? metadata : null, // Only store if we have nextAction data
              occurredAt: new Date(),
              createdByCrmUserId: actorCrmUserId,
            },
          });
          
          // If nextAction is provided, also create a task if it's a follow-up type
          if (nextAction && nextAction.type && (nextAction.type === "FOLLOW_UP" || nextAction.type === "Follow-up") && nextAction.scheduledAt && (prisma as any).crmTask) {
            await (prisma as any).crmTask.create({
              data: {
                leadId: id,
                title: `Follow-up: ${nextAction.notes || "Stage moved to " + updated.stage}`,
                description: nextAction.notes || null,
                dueAt: new Date(nextAction.scheduledAt),
                status: "OPEN",
                assignedToCrmUserId: actorCrmUserId,
              },
            });
          }
        }
        if (status !== undefined && existing.status !== updated.status) {
          await (prisma as any).crmActivity.create({
            data: {
              leadId: id,
              type: "STATUS_CHANGED",
              title: "Status changed",
              body: `${existing.status} → ${updated.status}`,
              occurredAt: new Date(),
              createdByCrmUserId: actorCrmUserId,
            },
          });
        }
        if (ownerId !== undefined && existing.ownerId !== updated.ownerId) {
          await (prisma as any).crmActivity.create({
            data: {
              leadId: id,
              type: "OWNER_CHANGED",
              title: "Owner changed",
              body: `${existing.ownerId ?? "Unassigned"} → ${updated.ownerId ?? "Unassigned"}`,
              occurredAt: new Date(),
              createdByCrmUserId: actorCrmUserId,
            },
          });
        }
      }
    } catch (e) {
      console.warn("CRM activity write skipped:", (e as any)?.message || e);
    }

    const { actorType, actorId } = actorFromReq(req);
    await logSystemActivity({
      actorType,
      actorId,
      action: "CRM_LEAD_UPDATED",
      entityType: "CrmLead",
      entityId: id,
      before: existing,
      after: updated,
      metadata: { changedKeys: Object.keys(data).filter((k) => k !== "updatedAt") },
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("CRM lead update error:", error);
    return res.status(500).json({ message: error.message || "Failed to update CRM lead" });
  }
});

export default router;


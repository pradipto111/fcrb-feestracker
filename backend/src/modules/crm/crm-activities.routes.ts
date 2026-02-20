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

/**
 * GET /crm/leads/:leadId/activities
 */
router.get("/leads/:leadId/activities", async (req, res) => {
  try {
    if (!(prisma as any).crmActivity) {
      return res.status(500).json({ message: "CRM database models not available. Please run migrations + prisma generate for CRM." });
    }
    const leadId = String(req.params.leadId);
    const rows = await (prisma as any).crmActivity.findMany({
      where: { leadId },
      orderBy: { occurredAt: "desc" },
      take: 200,
    });
    return res.json(rows || []);
  } catch (error: any) {
    console.error("CRM activities list error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch activities" });
  }
});

/**
 * POST /crm/leads/:leadId/activities
 * body: { type, title?, body?, occurredAt? }
 */
router.post("/leads/:leadId/activities", async (req, res) => {
  try {
    if (!(prisma as any).crmActivity) {
      return res.status(500).json({ message: "CRM database models not available. Please run migrations + prisma generate for CRM." });
    }
    const leadId = String(req.params.leadId);
    const { type, title, body, occurredAt, metadata } = req.body as any;
    if (!type) return res.status(400).json({ message: "type is required" });

    const activity = await (prisma as any).crmActivity.create({
      data: {
        leadId,
        type,
        title: title || null,
        body: body || null,
        metadata: metadata ?? null,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        createdByCrmUserId: req.user?.role === "CRM" ? req.user.id : null,
      },
    });

    const { actorType, actorId } = actorFromReq(req);
    await logSystemActivity({
      actorType,
      actorId,
      action: "CRM_ACTIVITY_CREATED",
      entityType: "CrmActivity",
      entityId: activity.id,
      before: null,
      after: activity,
      metadata: { leadId, type },
    });

    return res.status(201).json(activity);
  } catch (error: any) {
    console.error("CRM activity create error:", error);
    return res.status(500).json({ message: error.message || "Failed to create activity" });
  }
});

export default router;


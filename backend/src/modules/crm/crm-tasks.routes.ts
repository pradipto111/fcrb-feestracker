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
 * GET /crm/tasks?leadId=...
 */
router.get("/tasks", async (req, res) => {
  try {
    if (!(prisma as any).crmTask) {
      return res.status(500).json({ message: "CRM database models not available. Please run migrations + prisma generate for CRM." });
    }
    const { leadId } = req.query as { leadId?: string };
    const where: any = {};
    if (leadId) where.leadId = String(leadId);
    const rows = await (prisma as any).crmTask.findMany({
      where,
      orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
      take: 500,
    });
    return res.json(rows || []);
  } catch (error: any) {
    console.error("CRM tasks list error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch tasks" });
  }
});

/**
 * POST /crm/tasks
 * body: { leadId, title, description?, dueAt?, assignedToCrmUserId? }
 */
router.post("/tasks", async (req, res) => {
  try {
    if (!(prisma as any).crmTask) {
      return res.status(500).json({ message: "CRM database models not available. Please run migrations + prisma generate for CRM." });
    }
    const { leadId, title, description, dueAt, assignedToCrmUserId } = req.body as any;
    if (!leadId || !title) return res.status(400).json({ message: "leadId and title are required" });

    const task = await (prisma as any).crmTask.create({
      data: {
        leadId: String(leadId),
        title: String(title),
        description: description || null,
        dueAt: dueAt ? new Date(dueAt) : null,
        status: "OPEN",
        assignedToCrmUserId: assignedToCrmUserId !== undefined && assignedToCrmUserId !== null ? Number(assignedToCrmUserId) : null,
        updatedAt: new Date(),
      },
    });

    const { actorType, actorId } = actorFromReq(req);
    await logSystemActivity({
      actorType,
      actorId,
      action: "CRM_TASK_CREATED",
      entityType: "CrmTask",
      entityId: task.id,
      after: task,
      metadata: { leadId: task.leadId },
    });

    return res.status(201).json(task);
  } catch (error: any) {
    console.error("CRM task create error:", error);
    return res.status(500).json({ message: error.message || "Failed to create task" });
  }
});

/**
 * PATCH /crm/tasks/:id
 * body: { status?, dueAt?, title?, description?, assignedToCrmUserId? }
 */
router.patch("/tasks/:id", async (req, res) => {
  try {
    if (!(prisma as any).crmTask) {
      return res.status(500).json({ message: "CRM database models not available. Please run migrations + prisma generate for CRM." });
    }
    const id = String(req.params.id);
    const existing = await (prisma as any).crmTask.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const { status, dueAt, title, description, assignedToCrmUserId } = req.body as any;
    const data: any = { updatedAt: new Date() };
    if (status !== undefined) data.status = status;
    if (dueAt !== undefined) data.dueAt = dueAt ? new Date(dueAt) : null;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (assignedToCrmUserId !== undefined) data.assignedToCrmUserId = assignedToCrmUserId === null ? null : Number(assignedToCrmUserId);

    const updated = await (prisma as any).crmTask.update({ where: { id }, data });

    const { actorType, actorId } = actorFromReq(req);
    await logSystemActivity({
      actorType,
      actorId,
      action: "CRM_TASK_UPDATED",
      entityType: "CrmTask",
      entityId: id,
      before: existing,
      after: updated,
      metadata: { changedKeys: Object.keys(data).filter((k) => k !== "updatedAt") },
    });

    return res.json(updated);
  } catch (error: any) {
    console.error("CRM task update error:", error);
    return res.status(500).json({ message: error.message || "Failed to update task" });
  }
});

export default router;


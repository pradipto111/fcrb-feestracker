import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

type FeedItem = {
  id: string;
  createdAt: string;
  source: "SYSTEM_ACTIVITY" | "AUDIT_LOG";
  actorType: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  metadata?: any;
};

/**
 * GET /activity?limit=200&actorType=CRM&entityType=CrmLead
 * Admin-only unified activity feed.
 */
router.get("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { limit, actorType, entityType } = req.query as {
      limit?: string;
      actorType?: string;
      entityType?: string;
    };

    const take = Math.min(Math.max(parseInt(limit || "200", 10), 1), 500);

    const systemWhere: any = {};
    if (actorType) systemWhere.actorType = actorType;
    if (entityType) systemWhere.entityType = entityType;

    // Pull slightly more from each source, then merge-sort in memory.
    const [systemRows, auditRows] = await Promise.all([
      (prisma as any).systemActivityLog?.findMany({
        where: systemWhere,
        orderBy: { createdAt: "desc" },
        take,
      }).catch(() => []) as Promise<any[]>,
      (prisma as any).auditLog?.findMany({
        where: entityType ? { entityType } : undefined,
        orderBy: { createdAt: "desc" },
        take,
      }).catch(() => []) as Promise<any[]>,
    ]);

    const systemItems: FeedItem[] = (systemRows || []).map((r) => ({
      id: r.id,
      createdAt: new Date(r.createdAt).toISOString(),
      source: "SYSTEM_ACTIVITY",
      actorType: r.actorType,
      actorId: r.actorId ?? null,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      before: r.before ?? null,
      after: r.after ?? null,
      metadata: r.metadata ?? null,
    }));

    const auditItems: FeedItem[] = (auditRows || []).map((r) => ({
      id: String(r.id),
      createdAt: new Date(r.createdAt).toISOString(),
      source: "AUDIT_LOG",
      actorType: "ADMIN",
      actorId: r.actorAdminId !== undefined && r.actorAdminId !== null ? String(r.actorAdminId) : null,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId,
      before: r.before ?? null,
      after: r.after ?? null,
      metadata: null,
    }));

    const merged = [...systemItems, ...auditItems].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply actorType filter across merged (so ADMIN catches AuditLog rows too)
    const filtered = actorType ? merged.filter((x) => x.actorType === actorType) : merged;

    return res.json(filtered.slice(0, take));
  } catch (error: any) {
    console.error("Activity feed error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch activity feed" });
  }
});

export default router;


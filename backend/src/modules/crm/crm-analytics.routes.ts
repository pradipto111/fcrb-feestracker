import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

router.use(authRequired);
router.use(requireRole("CRM", "ADMIN"));

const touchTypes = new Set(["NOTE", "CALL", "EMAIL", "WHATSAPP", "MEETING"]);
const moveTypes = new Set(["STAGE_CHANGED", "STATUS_CHANGED", "OWNER_CHANGED"]);

function isConversionActivity(body?: string | null) {
  if (!body) return false;
  return /→\s*JOINED$/.test(body) || /->\s*JOINED$/.test(body) || /→\s*WON$/.test(body) || /->\s*WON$/.test(body);
}

function startOfDay(d: Date) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

router.get("/analytics/summary", async (_req, res) => {
  try {
    if (!(prisma as any).crmActivity) {
      return res.status(500).json({ message: "CRM database models not available. Please run migrations + prisma generate for CRM." });
    }

    const now = new Date();
    const startToday = startOfDay(now);
    const startWeek = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

    const activities = await (prisma as any).crmActivity.findMany({
      where: { occurredAt: { gte: startWeek } },
      select: { type: true, body: true, occurredAt: true },
    });

    const summary = {
      conversionsToday: 0,
      conversionsWeek: 0,
      touchesToday: 0,
      touchesWeek: 0,
      movesToday: 0,
      movesWeek: 0,
      followUpsOverdue: 0,
      hotLeadsCount: 0,
      openByStage: {} as Record<string, number>,
    };

    activities.forEach((a: any) => {
      const isToday = a.occurredAt >= startToday;
      if (touchTypes.has(a.type)) {
        summary.touchesWeek += 1;
        if (isToday) summary.touchesToday += 1;
      }
      if (moveTypes.has(a.type)) {
        summary.movesWeek += 1;
        if (isToday) summary.movesToday += 1;
      }
      if (a.type === "STAGE_CHANGED" && isConversionActivity(a.body)) {
        summary.conversionsWeek += 1;
        if (isToday) summary.conversionsToday += 1;
      }
    });

    if ((prisma as any).crmLead) {
      const openLeads = await (prisma as any).crmLead.findMany({
        where: { status: "OPEN" },
        select: { stage: true, priority: true },
      });
      openLeads.forEach((l: any) => {
        summary.openByStage[l.stage] = (summary.openByStage[l.stage] || 0) + 1;
        // Hot leads: P0 or P1 in NEW, CONTACTED, or FOLLOW_UP stages
        if ((l.priority === 0 || l.priority === 1) && (l.stage === "NEW" || l.stage === "CONTACTED" || l.stage === "FOLLOW_UP")) {
          summary.hotLeadsCount += 1;
        }
      });
    }

    // Count overdue follow-ups (tasks with dueAt in the past and status OPEN)
    if ((prisma as any).crmTask) {
      const overdueTasks = await (prisma as any).crmTask.findMany({
        where: {
          status: "OPEN",
          dueAt: { lt: now },
        },
        select: { leadId: true },
      });
      // Count unique leads with overdue tasks
      const uniqueLeadIds = new Set(overdueTasks.map((t: any) => t.leadId));
      summary.followUpsOverdue = uniqueLeadIds.size;
    }

    return res.json(summary);
  } catch (error: any) {
    console.error("CRM analytics summary error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch analytics summary" });
  }
});

router.get("/analytics/agents", async (_req, res) => {
  try {
    if (!(prisma as any).crmActivity || !(prisma as any).crmUser) {
      return res.status(500).json({ message: "CRM database models not available. Please run migrations + prisma generate for CRM." });
    }

    const now = new Date();
    const startToday = startOfDay(now);
    const startWeek = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));

    const [users, activities, openLeads] = await Promise.all([
      (prisma as any).crmUser.findMany({
        select: { id: true, fullName: true, role: true, status: true },
        orderBy: { fullName: "asc" },
      }),
      (prisma as any).crmActivity.findMany({
        where: { occurredAt: { gte: startWeek } },
        select: { type: true, body: true, occurredAt: true, createdByCrmUserId: true },
      }),
      (prisma as any).crmLead?.findMany({
        where: { status: "OPEN" },
        select: { ownerId: true },
      }) || [],
    ]);

    const stats: Record<number, any> = {};
    users.forEach((u: any) => {
      stats[u.id] = {
        userId: u.id,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        conversionsToday: 0,
        conversionsWeek: 0,
        touchesToday: 0,
        touchesWeek: 0,
        movesToday: 0,
        movesWeek: 0,
        openLeads: 0,
      };
    });

    activities.forEach((a: any) => {
      if (!a.createdByCrmUserId || !stats[a.createdByCrmUserId]) return;
      const bucket = stats[a.createdByCrmUserId];
      const isToday = a.occurredAt >= startToday;
      if (touchTypes.has(a.type)) {
        bucket.touchesWeek += 1;
        if (isToday) bucket.touchesToday += 1;
      }
      if (moveTypes.has(a.type)) {
        bucket.movesWeek += 1;
        if (isToday) bucket.movesToday += 1;
      }
      if (a.type === "STAGE_CHANGED" && isConversionActivity(a.body)) {
        bucket.conversionsWeek += 1;
        if (isToday) bucket.conversionsToday += 1;
      }
    });

    openLeads.forEach((l: any) => {
      if (l.ownerId && stats[l.ownerId]) {
        stats[l.ownerId].openLeads += 1;
      }
    });

    return res.json(Object.values(stats));
  } catch (error: any) {
    console.error("CRM analytics agents error:", error);
    return res.status(500).json({ message: error.message || "Failed to fetch analytics agents" });
  }
});

export default router;

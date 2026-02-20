import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired } from "../../auth/auth.middleware";

const router = Router();

const DEFAULT_STAGES = ["NEW", "CONTACTED", "FOLLOW_UP", "WILL_JOIN", "JOINED", "UNINTERESTED_NO_RESPONSE"];
const DEFAULT_SLA_HOURS: Record<string, number> = {
  NEW: 48,
  CONTACTED: 72,
  FOLLOW_UP: 168,
  WILL_JOIN: 168,
  JOINED: 0,
  UNINTERESTED_NO_RESPONSE: 0,
};

const DEFAULT_ASSIGNMENT_RULES = {
  mode: "MANUAL",
  roundRobinUserIds: [] as number[],
  lastAssignedIndex: -1,
};

const allowedStages = new Set(DEFAULT_STAGES);

function canManageSettings(req: any) {
  if (req.user?.role === "ADMIN") return true;
  return false;
}

router.use(authRequired);

router.get("/", async (_req, res) => {
  try {
    const row = await (prisma as any).crmSettings?.findFirst();
    if (!row) {
      return res.json({
        stages: DEFAULT_STAGES,
        tags: [],
        slaHoursByStage: DEFAULT_SLA_HOURS,
        assignmentRules: DEFAULT_ASSIGNMENT_RULES,
        persisted: false,
      });
    }
    return res.json({
      stages: row.stages ?? DEFAULT_STAGES,
      tags: row.tags ?? [],
      slaHoursByStage: row.slaHoursByStage ?? DEFAULT_SLA_HOURS,
      assignmentRules: row.assignmentRules ?? DEFAULT_ASSIGNMENT_RULES,
      persisted: true,
      updatedAt: row.updatedAt,
    });
  } catch (error: any) {
    console.error("CRM settings get error:", error);
    return res.status(500).json({ message: error.message || "Failed to load CRM settings" });
  }
});

router.put("/", async (req, res) => {
  try {
    if (!canManageSettings(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!(prisma as any).crmSettings) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }

    const { stages, tags, slaHoursByStage, assignmentRules } = req.body as any;
    const sanitizedStages = Array.isArray(stages)
      ? stages.filter((s) => typeof s === "string" && allowedStages.has(s))
      : DEFAULT_STAGES;

    const sanitizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const sanitizedSla = typeof slaHoursByStage === "object" && slaHoursByStage
      ? Object.fromEntries(
          Object.entries(slaHoursByStage).filter(([k, v]) => allowedStages.has(k) && Number.isFinite(Number(v)))
        )
      : DEFAULT_SLA_HOURS;

    const sanitizedRules = assignmentRules && typeof assignmentRules === "object"
      ? {
          mode: assignmentRules.mode === "ROUND_ROBIN" ? "ROUND_ROBIN" : "MANUAL",
          roundRobinUserIds: Array.isArray(assignmentRules.roundRobinUserIds)
            ? assignmentRules.roundRobinUserIds.map((id: any) => Number(id)).filter((id: number) => Number.isFinite(id))
            : [],
          lastAssignedIndex: Number.isFinite(Number(assignmentRules.lastAssignedIndex))
            ? Number(assignmentRules.lastAssignedIndex)
            : -1,
        }
      : DEFAULT_ASSIGNMENT_RULES;

    const updated = await (prisma as any).crmSettings.upsert({
      where: { id: 1 },
      update: {
        stages: sanitizedStages,
        tags: sanitizedTags,
        slaHoursByStage: sanitizedSla,
        assignmentRules: sanitizedRules,
      },
      create: {
        id: 1,
        stages: sanitizedStages,
        tags: sanitizedTags,
        slaHoursByStage: sanitizedSla,
        assignmentRules: sanitizedRules,
      },
    });

    return res.json({
      stages: updated.stages ?? DEFAULT_STAGES,
      tags: updated.tags ?? [],
      slaHoursByStage: updated.slaHoursByStage ?? DEFAULT_SLA_HOURS,
      assignmentRules: updated.assignmentRules ?? DEFAULT_ASSIGNMENT_RULES,
      persisted: true,
      updatedAt: updated.updatedAt,
    });
  } catch (error: any) {
    console.error("CRM settings update error:", error);
    return res.status(500).json({ message: error.message || "Failed to update CRM settings" });
  }
});

export { DEFAULT_STAGES, DEFAULT_SLA_HOURS, DEFAULT_ASSIGNMENT_RULES };
export default router;

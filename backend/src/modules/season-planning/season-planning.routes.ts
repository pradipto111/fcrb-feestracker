import { Router } from "express";
import { PrismaClient } from "@prisma/client";

// Type definitions (will be available after Prisma generate)
type TrainingIntensity = "LOW" | "MEDIUM" | "HIGH";
type TrainingFocus = "TECHNICAL" | "TACTICAL" | "PHYSICAL" | "RECOVERY";
type SeasonPhaseType = "PREPARATION" | "COMPETITIVE" | "RECOVERY" | "TRANSITION";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import {
  calculateEstimatedLoad,
  recalculatePlayerWeeklyLoad,
  getPlayerLoadTrends,
  getReadinessLoadCorrelation,
  getWeekBoundaries,
} from "./season-planning.service";

const prisma = new PrismaClient();
const router = Router();

// Helper to get coach's center IDs
async function getCoachCenterIds(coachId: number): Promise<number[]> {
  const coachCenters = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true },
  });
  return coachCenters.map((cc) => cc.centerId);
}

// ============================================
// SEASON PLANS
// ============================================

// Get all season plans for a center
router.get("/plans", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    const { centerId } = req.query;

    let centerIds: number[] = [];
    if (role === "COACH") {
      centerIds = await getCoachCenterIds(id);
      if (centerId && !centerIds.includes(Number(centerId))) {
        return res.status(403).json({ message: "Access denied to this center" });
      }
    } else if (centerId) {
      centerIds = [Number(centerId)];
    }

    const where: any = {};
    if (centerIds.length > 0) {
      where.centerId = { in: centerIds };
    }

    const plans = await (prisma as any).seasonPlan.findMany({
      where,
      include: {
        center: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
        phases: true,
        developmentBlocks: true,
        _count: { select: { sessionLoads: true } },
      },
      orderBy: { seasonStart: "desc" },
    });

    res.json(plans);
  } catch (error: any) {
    console.error("Error fetching season plans:", error);
    res.status(500).json({ message: error.message || "Failed to fetch season plans" });
  }
});

// Get single season plan
router.get("/plans/:id", authRequired, async (req, res) => {
  try {
    const { role, id: userId } = req.user!;
    const planId = Number(req.params.id);

    const plan = await prisma.seasonPlan.findUnique({
      where: { id: planId },
      include: {
        center: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        phases: { orderBy: { startDate: "asc" } },
        developmentBlocks: { orderBy: { startDate: "asc" } },
        sessionLoads: {
          include: {
            session: {
              include: {
                center: { select: { id: true, name: true } },
                coach: { select: { id: true, fullName: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Season plan not found" });
    }

    // Check access
    if (role === "COACH") {
      const coachCenterIds = await getCoachCenterIds(userId);
      if (!coachCenterIds.includes(plan.centerId)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(plan);
  } catch (error: any) {
    console.error("Error fetching season plan:", error);
    res.status(500).json({ message: error.message || "Failed to fetch season plan" });
  }
});

// Create season plan
router.post("/plans", authRequired, requireRole(["ADMIN", "COACH"]), async (req, res) => {
  try {
    const { role, id } = req.user!;
    const { centerId, name, seasonStart, seasonEnd, description, phases } = req.body;

    if (!centerId || !name || !seasonStart || !seasonEnd) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check access
    if (role === "COACH") {
      const coachCenterIds = await getCoachCenterIds(id);
      if (!coachCenterIds.includes(Number(centerId))) {
        return res.status(403).json({ message: "Access denied to this center" });
      }
    }

    const plan = await (prisma as any).seasonPlan.create({
      data: {
        centerId: Number(centerId),
        name,
        seasonStart: new Date(seasonStart),
        seasonEnd: new Date(seasonEnd),
        description: description || null,
        createdByUserId: id,
        createdByRole: role,
        phases: phases
          ? {
              create: phases.map((phase: any) => ({
                name: phase.name,
                phaseType: phase.phaseType,
                startDate: new Date(phase.startDate),
                endDate: new Date(phase.endDate),
                description: phase.description || null,
                targetLoadRange: phase.targetLoadRange || null,
              })),
            }
          : undefined,
      },
      include: {
        center: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
        phases: true,
      },
    });

    res.status(201).json(plan);
  } catch (error: any) {
    console.error("Error creating season plan:", error);
    res.status(500).json({ message: error.message || "Failed to create season plan" });
  }
});

// Update season plan
router.put("/plans/:id", authRequired, requireRole(["ADMIN", "COACH"]), async (req, res) => {
  try {
    const { role, id: userId } = req.user!;
    const planId = Number(req.params.id);
    const { name, seasonStart, seasonEnd, description, phases } = req.body;

    const existingPlan = await (prisma as any).seasonPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return res.status(404).json({ message: "Season plan not found" });
    }

    // Check access
    if (role === "COACH") {
      const coachCenterIds = await getCoachCenterIds(userId);
      if (!coachCenterIds.includes(existingPlan.centerId)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const plan = await (prisma as any).seasonPlan.update({
      where: { id: planId },
      data: {
        ...(name && { name }),
        ...(seasonStart && { seasonStart: new Date(seasonStart) }),
        ...(seasonEnd && { seasonEnd: new Date(seasonEnd) }),
        ...(description !== undefined && { description }),
        ...(phases && {
          phases: {
            deleteMany: {},
            create: phases.map((phase: any) => ({
              name: phase.name,
              phaseType: phase.phaseType,
              startDate: new Date(phase.startDate),
              endDate: new Date(phase.endDate),
              description: phase.description || null,
              targetLoadRange: phase.targetLoadRange || null,
            })),
          },
        }),
      },
      include: {
        center: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
        phases: true,
      },
    });

    res.json(plan);
  } catch (error: any) {
    console.error("Error updating season plan:", error);
    res.status(500).json({ message: error.message || "Failed to update season plan" });
  }
});

// Delete season plan
router.delete("/plans/:id", authRequired, requireRole(["ADMIN", "COACH"]), async (req, res) => {
  try {
    const { role, id: userId } = req.user!;
    const planId = Number(req.params.id);

    const existingPlan = await (prisma as any).seasonPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return res.status(404).json({ message: "Season plan not found" });
    }

    // Check access
    if (role === "COACH") {
      const coachCenterIds = await getCoachCenterIds(userId);
      if (!coachCenterIds.includes(existingPlan.centerId)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await (prisma as any).seasonPlan.delete({
      where: { id: planId },
    });

    res.json({ message: "Season plan deleted" });
  } catch (error: any) {
    console.error("Error deleting season plan:", error);
    res.status(500).json({ message: error.message || "Failed to delete season plan" });
  }
});

// ============================================
// TRAINING SESSION LOAD
// ============================================

// Create or update session load
router.post("/sessions/:sessionId/load", authRequired, requireRole(["ADMIN", "COACH"]), async (req, res) => {
  try {
    const { role, id } = req.user!;
    const sessionId = Number(req.params.sessionId);
    const { intensity, duration, focusTags, notes, seasonPlanId } = req.body;

    if (!intensity || !duration || !Array.isArray(focusTags)) {
      return res.status(400).json({ message: "Missing required fields: intensity, duration, focusTags" });
    }

    // Get session to check access
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { center: true },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check access
    if (role === "COACH") {
      const coachCenterIds = await getCoachCenterIds(id);
      if (!coachCenterIds.includes(session.centerId)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const estimatedLoad = calculateEstimatedLoad(duration, intensity);

    const sessionLoad = await (prisma as any).trainingSessionLoad.upsert({
      where: { sessionId },
      create: {
        sessionId,
        seasonPlanId: seasonPlanId ? Number(seasonPlanId) : null,
        intensity,
        duration: Number(duration),
        focusTags,
        estimatedLoad,
        notes: notes || null,
        createdByUserId: id,
        createdByRole: role,
      },
      update: {
        intensity,
        duration: Number(duration),
        focusTags,
        estimatedLoad,
        notes: notes || null,
        updatedAt: new Date(),
      },
      include: {
        session: {
          include: {
            center: { select: { id: true, name: true } },
            coach: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    // Recalculate weekly loads for all students who attended this session
    const { weekStart } = getWeekBoundaries(session.sessionDate);
    const attendees = await prisma.attendance.findMany({
      where: {
        sessionId,
        status: "PRESENT",
      },
      select: { studentId: true },
    });

    await Promise.all(
      attendees.map((a) =>
        recalculatePlayerWeeklyLoad(a.studentId, session.centerId, weekStart).catch((err) =>
          console.error(`Failed to recalculate load for student ${a.studentId}:`, err)
        )
      )
    );

    res.json(sessionLoad);
  } catch (error: any) {
    console.error("Error creating/updating session load:", error);
    res.status(500).json({ message: error.message || "Failed to create/update session load" });
  }
});

// Get session load
router.get("/sessions/:sessionId/load", authRequired, async (req, res) => {
  try {
    const sessionId = Number(req.params.sessionId);

    const sessionLoad = await (prisma as any).trainingSessionLoad.findUnique({
      where: { sessionId },
      include: {
        session: {
          include: {
            center: { select: { id: true, name: true } },
            coach: { select: { id: true, fullName: true } },
          },
        },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    if (!sessionLoad) {
      return res.status(404).json({ message: "Session load not found" });
    }

    res.json(sessionLoad);
  } catch (error: any) {
    console.error("Error fetching session load:", error);
    res.status(500).json({ message: error.message || "Failed to fetch session load" });
  }
});

// ============================================
// PLAYER LOAD DASHBOARD
// ============================================

// Get player load trends
router.get("/players/:studentId/load-trends", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    const studentId = Number(req.params.studentId);
    const weeks = req.query.weeks ? Number(req.query.weeks) : 12;

    // Check access - coaches/admins can view any, students can only view their own
    if (role === "STUDENT" && id !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const trends = await getPlayerLoadTrends(studentId, weeks);
    res.json(trends);
  } catch (error: any) {
    console.error("Error fetching load trends:", error);
    res.status(500).json({ message: error.message || "Failed to fetch load trends" });
  }
});

// Get player weekly load
router.get("/players/:studentId/weekly-load", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    const studentId = Number(req.params.studentId);
    const { weekStart } = req.query;

    // Check access
    if (role === "STUDENT" && id !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const week = weekStart ? new Date(weekStart as string) : new Date();
    const { weekStart: start } = getWeekBoundaries(week);

    const weeklyLoad = await (prisma as any).playerWeeklyLoad.findUnique({
      where: {
        studentId_weekStart: {
          studentId,
          weekStart: start,
        },
      },
    });

    if (!weeklyLoad) {
      return res.status(404).json({ message: "Weekly load not found" });
    }

    res.json(weeklyLoad);
  } catch (error: any) {
    console.error("Error fetching weekly load:", error);
    res.status(500).json({ message: error.message || "Failed to fetch weekly load" });
  }
});

// Get readiness and load correlation
router.get("/players/:studentId/readiness-load-correlation", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    const studentId = Number(req.params.studentId);
    const weeks = req.query.weeks ? Number(req.query.weeks) : 8;

    // Check access
    if (role === "STUDENT" && id !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const correlation = await getReadinessLoadCorrelation(studentId, weeks);
    res.json(correlation);
  } catch (error: any) {
    console.error("Error fetching readiness-load correlation:", error);
    res.status(500).json({ message: error.message || "Failed to fetch correlation" });
  }
});

// ============================================
// DEVELOPMENT BLOCKS
// ============================================

// Create development block
router.post("/plans/:planId/development-blocks", authRequired, requireRole(["ADMIN", "COACH"]), async (req, res) => {
  try {
    const { role, id } = req.user!;
    const planId = Number(req.params.planId);
    const { name, startDate, endDate, focusArea, targetMetrics, suggestedLoadRange, sessionFocusDistribution, description } = req.body;

    if (!name || !startDate || !endDate || !focusArea) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const plan = await (prisma as any).seasonPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ message: "Season plan not found" });
    }

    // Check access
    if (role === "COACH") {
      const coachCenterIds = await getCoachCenterIds(id);
      if (!coachCenterIds.includes(plan.centerId)) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const block = await (prisma as any).developmentBlock.create({
      data: {
        seasonPlanId: planId,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        focusArea,
        targetMetrics: targetMetrics || [],
        suggestedLoadRange: suggestedLoadRange || null,
        sessionFocusDistribution: sessionFocusDistribution || null,
        description: description || null,
        createdByUserId: id,
        createdByRole: role,
      },
    });

    res.status(201).json(block);
  } catch (error: any) {
    console.error("Error creating development block:", error);
    res.status(500).json({ message: error.message || "Failed to create development block" });
  }
});

// Get player simplified workload message (for player/parent view)
router.get("/players/:studentId/workload-message", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    const studentId = Number(req.params.studentId);

    // Check access
    if (role === "STUDENT" && id !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const now = new Date();
    const { weekStart } = getWeekBoundaries(now);

    const weeklyLoad = await (prisma as any).playerWeeklyLoad.findUnique({
      where: {
        studentId_weekStart: {
          studentId,
          weekStart,
        },
      },
    });

    if (!weeklyLoad) {
      return res.json({
        message: "No training data available for this week",
        status: "UNKNOWN",
      });
    }

    // Generate simplified message
    let message = "";
    let status = "NORMAL";

    if (weeklyLoad.loadStatus === "LOW") {
      message = "Recovery-focused week";
      status = "LOW";
    } else if (weeklyLoad.loadStatus === "HIGH" || weeklyLoad.loadStatus === "CRITICAL") {
      message = "High training week";
      status = "HIGH";
    } else {
      message = "Regular training week";
      status = "NORMAL";
    }

    res.json({
      message,
      status,
      weekStart: weeklyLoad.weekStart,
    });
  } catch (error: any) {
    console.error("Error fetching workload message:", error);
    res.status(500).json({ message: error.message || "Failed to fetch workload message" });
  }
});

export default router;


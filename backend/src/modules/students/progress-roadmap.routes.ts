import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

/**
 * GET /progress-roadmap/student/my-roadmap
 * Get student's own progress roadmap (STUDENT only, read-only)
 */
router.get("/student/my-roadmap", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  try {
    const roadmap = await (prisma as any).progressRoadmap?.findUnique({
      where: { studentId: id },
    });

    if (!roadmap) {
      // Return default roadmap structure if none exists
      return res.json({
        currentLevel: "Not Set",
        nextPotentialLevel: null,
        attendanceRequirement: null,
        physicalBenchmark: null,
        tacticalRequirement: null,
        coachRecommendation: false,
        isEligible: false,
        // Do NOT expose eligibilityNotes to students
      });
    }

    // Return roadmap without internal notes
    res.json({
      currentLevel: roadmap.currentLevel,
      nextPotentialLevel: roadmap.nextPotentialLevel,
      attendanceRequirement: roadmap.attendanceRequirement,
      physicalBenchmark: roadmap.physicalBenchmark,
      tacticalRequirement: roadmap.tacticalRequirement,
      coachRecommendation: roadmap.coachRecommendation,
      isEligible: roadmap.isEligible,
      // Do NOT expose eligibilityNotes to students
    });
  } catch (error: any) {
    if (error.message && error.message.includes("progressRoadmap")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error fetching progress roadmap:", error);
    res.status(500).json({ message: error.message || "Failed to fetch progress roadmap" });
  }
});

/**
 * GET /progress-roadmap/student/:studentId
 * Get progress roadmap for a specific student (COACH/ADMIN only)
 */
router.get("/student/:studentId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const studentId = Number(req.params.studentId);

  try {
    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { center: true },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Coach can only view students in their centers
    if (role === "COACH") {
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: userId },
        select: { centerId: true },
      });
      const centerIds = coachCenters.map((cc) => cc.centerId);
      if (!centerIds.includes(student.centerId)) {
        return res.status(403).json({ message: "Forbidden: You can only view roadmaps for students in your centers" });
      }
    }

    const roadmap = await (prisma as any).progressRoadmap?.findUnique({
      where: { studentId },
    });

    if (!roadmap) {
      return res.json({
        currentLevel: "Not Set",
        nextPotentialLevel: null,
        attendanceRequirement: null,
        physicalBenchmark: null,
        tacticalRequirement: null,
        coachRecommendation: false,
        isEligible: false,
        eligibilityNotes: null,
      });
    }

    // Coaches/admins can see eligibilityNotes
    res.json(roadmap);
  } catch (error: any) {
    if (error.message && error.message.includes("progressRoadmap")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error fetching progress roadmap:", error);
    res.status(500).json({ message: error.message || "Failed to fetch progress roadmap" });
  }
});

/**
 * POST /progress-roadmap/student/:studentId
 * Create or update progress roadmap (ADMIN only - defines criteria)
 */
router.post("/student/:studentId", authRequired, requireRole("ADMIN"), async (req, res) => {
  const { id: userId } = req.user!;
  const studentId = Number(req.params.studentId);
  const {
    currentLevel,
    nextPotentialLevel,
    attendanceRequirement,
    physicalBenchmark,
    tacticalRequirement,
    eligibilityNotes,
  } = req.body;

  try {
    if (!currentLevel) {
      return res.status(400).json({ message: "currentLevel is required" });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const roadmap = await (prisma as any).progressRoadmap?.upsert({
      where: { studentId },
      update: {
        currentLevel,
        nextPotentialLevel: nextPotentialLevel || null,
        attendanceRequirement: attendanceRequirement || null,
        physicalBenchmark: physicalBenchmark || null,
        tacticalRequirement: tacticalRequirement || null,
        eligibilityNotes: eligibilityNotes || null,
        updatedByRole: "ADMIN",
        updatedById: userId,
      },
      create: {
        studentId,
        currentLevel,
        nextPotentialLevel: nextPotentialLevel || null,
        attendanceRequirement: attendanceRequirement || null,
        physicalBenchmark: physicalBenchmark || null,
        tacticalRequirement: tacticalRequirement || null,
        coachRecommendation: false,
        isEligible: false,
        eligibilityNotes: eligibilityNotes || null,
        updatedByRole: "ADMIN",
        updatedById: userId,
      },
    });

    res.json(roadmap);
  } catch (error: any) {
    if (error.message && error.message.includes("progressRoadmap")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error creating/updating progress roadmap:", error);
    res.status(500).json({ message: error.message || "Failed to create/update progress roadmap" });
  }
});

/**
 * PUT /progress-roadmap/:roadmapId/flag-eligible
 * Flag student as eligible for next level (COACH/ADMIN only)
 */
router.put("/:roadmapId/flag-eligible", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const roadmapId = Number(req.params.roadmapId);
  const { isEligible, coachRecommendation, eligibilityNotes } = req.body;

  try {
    const existing = await (prisma as any).progressRoadmap?.findUnique({
      where: { id: roadmapId },
      include: {
        student: {
          include: { center: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Progress roadmap not found" });
    }

    // Coach can only flag students in their centers
    if (role === "COACH") {
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: userId },
        select: { centerId: true },
      });
      const centerIds = coachCenters.map((cc) => cc.centerId);
      if (!centerIds.includes(existing.student.centerId)) {
        return res.status(403).json({ message: "Forbidden: You can only flag eligibility for students in your centers" });
      }
    }

    const updated = await (prisma as any).progressRoadmap?.update({
      where: { id: roadmapId },
      data: {
        isEligible: isEligible !== undefined ? isEligible : existing.isEligible,
        coachRecommendation: coachRecommendation !== undefined ? coachRecommendation : existing.coachRecommendation,
        eligibilityNotes: role === "ADMIN" && eligibilityNotes !== undefined ? eligibilityNotes : existing.eligibilityNotes,
        updatedByRole: role,
        updatedById: userId,
      },
    });

    res.json(updated);
  } catch (error: any) {
    if (error.message && error.message.includes("progressRoadmap")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error updating progress roadmap:", error);
    res.status(500).json({ message: error.message || "Failed to update progress roadmap" });
  }
});

export default router;


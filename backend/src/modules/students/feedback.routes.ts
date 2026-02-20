import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

/**
 * GET /feedback/student/my-feedback
 * Get student's own published feedback (STUDENT only, read-only)
 */
router.get("/student/my-feedback", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  try {
    const feedbacks = await (prisma as any).monthlyFeedback?.findMany({
      where: {
        studentId: id,
        isPublished: true, // Only show published feedback
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    res.json({ feedbacks: feedbacks || [] });
  } catch (error: any) {
    if (error.message && error.message.includes("monthlyFeedback")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: error.message || "Failed to fetch feedback" });
  }
});

/**
 * GET /feedback/student/:studentId
 * Get feedback for a specific student (COACH/ADMIN only)
 * Coaches can only view students in their centers
 */
router.get("/student/:studentId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const studentId = Number(req.params.studentId);
  const includeUnpublished = req.query.includeUnpublished === "true";

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
        return res.status(403).json({ message: "Forbidden: You can only view feedback for students in your centers" });
      }
    }

    const where: any = { studentId };
    if (!includeUnpublished) {
      where.isPublished = true;
    }

    const feedbacks = await (prisma as any).monthlyFeedback?.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
          },
        },
        publishedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
      ],
    });

    res.json({ feedbacks: feedbacks || [] });
  } catch (error: any) {
    if (error.message && error.message.includes("monthlyFeedback")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: error.message || "Failed to fetch feedback" });
  }
});

/**
 * POST /feedback/student/:studentId
 * Create feedback draft (COACH/ADMIN only)
 */
router.post("/student/:studentId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const studentId = Number(req.params.studentId);
  const { month, year, strengths, areasToImprove, focusGoal, overallNote } = req.body;

  try {
    // Validate required fields
    if (!month || !year || !strengths || !areasToImprove || !focusGoal) {
      return res.status(400).json({ message: "month, year, strengths, areasToImprove, and focusGoal are required" });
    }

    if (!Array.isArray(strengths) || strengths.length === 0 || strengths.length > 2) {
      return res.status(400).json({ message: "strengths must be an array with 1-2 items" });
    }

    if (!Array.isArray(areasToImprove) || areasToImprove.length === 0 || areasToImprove.length > 2) {
      return res.status(400).json({ message: "areasToImprove must be an array with 1-2 items" });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { center: true },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Coach can only add feedback for students in their centers
    if (role === "COACH") {
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: userId },
        select: { centerId: true },
      });
      const centerIds = coachCenters.map((cc) => cc.centerId);
      if (!centerIds.includes(student.centerId)) {
        return res.status(403).json({ message: "Forbidden: You can only add feedback for students in your centers" });
      }
    }

    // Check if feedback already exists for this month/year
    const existing = await (prisma as any).monthlyFeedback?.findUnique({
      where: {
        studentId_month_year: {
          studentId,
          month: Number(month),
          year: Number(year),
        },
      },
    });

    if (existing) {
      return res.status(400).json({ message: "Feedback already exists for this month/year. Use PUT to update." });
    }

    // Create feedback draft (not published)
    const feedback = await (prisma as any).monthlyFeedback?.create({
      data: {
        studentId,
        coachId: userId,
        month: Number(month),
        year: Number(year),
        strengths,
        areasToImprove,
        focusGoal,
        overallNote: overallNote || null,
        isPublished: false, // Draft by default
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.status(201).json(feedback);
  } catch (error: any) {
    if (error.message && error.message.includes("monthlyFeedback")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error creating feedback:", error);
    res.status(500).json({ message: error.message || "Failed to create feedback" });
  }
});

/**
 * PUT /feedback/:feedbackId
 * Update feedback draft (COACH/ADMIN only, cannot edit published feedback)
 */
router.put("/:feedbackId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const feedbackId = Number(req.params.feedbackId);
  const { strengths, areasToImprove, focusGoal, overallNote } = req.body;

  try {
    const existing = await (prisma as any).monthlyFeedback?.findUnique({
      where: { id: feedbackId },
      include: {
        student: {
          include: { center: true },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Cannot edit published feedback (governance rule: no silent edits)
    if (existing.isPublished) {
      return res.status(400).json({ message: "Cannot edit published feedback. Once published, feedback is locked." });
    }

    // Coach can only edit their own feedback for students in their centers
    if (role === "COACH") {
      if (existing.coachId !== userId) {
        return res.status(403).json({ message: "Forbidden: You can only edit your own feedback" });
      }
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: userId },
        select: { centerId: true },
      });
      const centerIds = coachCenters.map((cc) => cc.centerId);
      if (!centerIds.includes(existing.student.centerId)) {
        return res.status(403).json({ message: "Forbidden: You can only edit feedback for students in your centers" });
      }
    }

    const updated = await (prisma as any).monthlyFeedback?.update({
      where: { id: feedbackId },
      data: {
        strengths: strengths || existing.strengths,
        areasToImprove: areasToImprove || existing.areasToImprove,
        focusGoal: focusGoal || existing.focusGoal,
        overallNote: overallNote !== undefined ? overallNote : existing.overallNote,
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.json(updated);
  } catch (error: any) {
    if (error.message && error.message.includes("monthlyFeedback")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: error.message || "Failed to update feedback" });
  }
});

/**
 * POST /feedback/:feedbackId/publish
 * Publish feedback (ADMIN only)
 */
router.post("/:feedbackId/publish", authRequired, requireRole("ADMIN"), async (req, res) => {
  const { id: userId } = req.user!;
  const feedbackId = Number(req.params.feedbackId);

  try {
    const existing = await (prisma as any).monthlyFeedback?.findUnique({
      where: { id: feedbackId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (existing.isPublished) {
      return res.status(400).json({ message: "Feedback is already published" });
    }

    const published = await (prisma as any).monthlyFeedback?.update({
      where: { id: feedbackId },
      data: {
        isPublished: true,
        publishedById: userId,
        publishedAt: new Date(),
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
          },
        },
        publishedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.json(published);
  } catch (error: any) {
    if (error.message && error.message.includes("monthlyFeedback")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error publishing feedback:", error);
    res.status(500).json({ message: error.message || "Failed to publish feedback" });
  }
});

/**
 * POST /feedback/:feedbackId/unpublish
 * Unpublish feedback (ADMIN only)
 */
router.post("/:feedbackId/unpublish", authRequired, requireRole("ADMIN"), async (req, res) => {
  const feedbackId = Number(req.params.feedbackId);

  try {
    const existing = await (prisma as any).monthlyFeedback?.findUnique({
      where: { id: feedbackId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const unpublished = await (prisma as any).monthlyFeedback?.update({
      where: { id: feedbackId },
      data: {
        isPublished: false,
        publishedById: null,
        publishedAt: null,
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.json(unpublished);
  } catch (error: any) {
    if (error.message && error.message.includes("monthlyFeedback")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error unpublishing feedback:", error);
    res.status(500).json({ message: error.message || "Failed to unpublish feedback" });
  }
});

export default router;


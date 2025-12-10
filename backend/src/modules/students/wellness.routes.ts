import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /wellness/check
 * Submit wellness check (STUDENT only, once per day)
 */
router.post("/check", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;
  const { sessionId, exertionLevel, muscleSoreness, energyLevel, comment } = req.body;

  try {
    // Validate required fields
    if (!exertionLevel || !energyLevel) {
      return res.status(400).json({ message: "exertionLevel and energyLevel are required" });
    }

    if (exertionLevel < 1 || exertionLevel > 5) {
      return res.status(400).json({ message: "exertionLevel must be between 1 and 5" });
    }

    if (muscleSoreness !== undefined && (muscleSoreness < 1 || muscleSoreness > 5)) {
      return res.status(400).json({ message: "muscleSoreness must be between 1 and 5" });
    }

    if (!["LOW", "MEDIUM", "HIGH"].includes(energyLevel)) {
      return res.status(400).json({ message: "energyLevel must be LOW, MEDIUM, or HIGH" });
    }

    // Check if student already submitted for today
    const today = getSystemDate();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheck = await (prisma as any).wellnessCheck?.findFirst({
      where: {
        studentId: id,
        checkDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingCheck) {
      return res.status(400).json({ message: "You have already submitted a wellness check for today. Only one check per day is allowed." });
    }

    // Verify session exists if sessionId provided
    if (sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: Number(sessionId) },
      });
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
    }

    // Create wellness check
    const wellnessCheck = await (prisma as any).wellnessCheck?.create({
      data: {
        studentId: id,
        sessionId: sessionId ? Number(sessionId) : null,
        checkDate: getSystemDate(),
        exertionLevel: Number(exertionLevel),
        muscleSoreness: muscleSoreness ? Number(muscleSoreness) : null,
        energyLevel,
        comment: comment || null,
      },
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    res.status(201).json(wellnessCheck);
  } catch (error: any) {
    if (error.message && error.message.includes("wellnessCheck")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error creating wellness check:", error);
    res.status(500).json({ message: error.message || "Failed to create wellness check" });
  }
});

/**
 * GET /wellness/student/my-checks
 * Get student's own wellness checks (STUDENT only, read-only)
 */
router.get("/student/my-checks", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;
  const { days = 30 } = req.query; // Default to last 30 days

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const checks = await (prisma as any).wellnessCheck?.findMany({
      where: {
        studentId: id,
        checkDate: {
          gte: startDate,
        },
      },
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        checkDate: "desc",
      },
    });

    res.json({ checks: checks || [] });
  } catch (error: any) {
    if (error.message && error.message.includes("wellnessCheck")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error fetching wellness checks:", error);
    res.status(500).json({ message: error.message || "Failed to fetch wellness checks" });
  }
});

/**
 * GET /wellness/student/:studentId
 * Get wellness checks for a specific student (COACH/ADMIN only)
 * Coaches can only view students in their centers
 */
router.get("/student/:studentId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const studentId = Number(req.params.studentId);
  const { days = 30 } = req.query;

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
        return res.status(403).json({ message: "Forbidden: You can only view wellness data for students in your centers" });
      }
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const checks = await (prisma as any).wellnessCheck?.findMany({
      where: {
        studentId,
        checkDate: {
          gte: startDate,
        },
      },
      include: {
        session: {
          select: {
            id: true,
            sessionDate: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: {
        checkDate: "desc",
      },
    });

    res.json({ checks: checks || [] });
  } catch (error: any) {
    if (error.message && error.message.includes("wellnessCheck")) {
      return res.status(500).json({
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_student_features && npx prisma generate",
      });
    }
    console.error("Error fetching wellness checks:", error);
    res.status(500).json({ message: error.message || "Failed to fetch wellness checks" });
  }
});

export default router;


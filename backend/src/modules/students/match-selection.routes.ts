import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

/**
 * GET /match-selection/student/my-selections
 * Get student's own match selection status (STUDENT only, read-only)
 */
router.get("/student/my-selections", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  try {
    const selections = await prisma.fixturePlayer.findMany({
      where: {
        studentId: id,
      },
      include: {
        fixture: {
          include: {
            center: {
              select: {
                id: true,
                name: true,
              },
            },
            coach: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        fixture: {
          matchDate: "desc",
        },
      },
    });

    // Format response - only show reason category, not internal notes
    const formatted = selections.map((selection) => ({
      id: selection.id,
      fixture: {
        id: selection.fixture.id,
        matchType: selection.fixture.matchType,
        opponent: selection.fixture.opponent,
        matchDate: selection.fixture.matchDate,
        matchTime: selection.fixture.matchTime,
        venue: selection.fixture.venue,
        status: selection.fixture.status,
        competition: selection.fixture.matchType, // Use matchType as competition
      },
      selectionStatus: selection.selectionStatus || "NOT_SELECTED",
      selectionReason: selection.selectionReason || null, // Only category, not notes
      position: selection.position,
      role: selection.role,
      // Do NOT expose selection.notes (internal coach comments)
    }));

    res.json({ selections: formatted });
  } catch (error: any) {
    console.error("Error fetching match selections:", error);
    res.status(500).json({ message: error.message || "Failed to fetch match selections" });
  }
});

/**
 * GET /match-selection/fixture/:fixtureId
 * Get all selections for a fixture (COACH/ADMIN only)
 */
router.get("/fixture/:fixtureId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const fixtureId = Number(req.params.fixtureId);

  try {
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        center: true,
        coach: true,
      },
    });

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Coach can only view fixtures for their centers
    if (role === "COACH") {
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: userId },
        select: { centerId: true },
      });
      const centerIds = coachCenters.map((cc) => cc.centerId);
      if (!centerIds.includes(fixture.centerId)) {
        return res.status(403).json({ message: "Forbidden: You can only view fixtures for your centers" });
      }
    }

    const selections = await prisma.fixturePlayer.findMany({
      where: { fixtureId },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            programType: true,
          },
        },
      },
      orderBy: [
        { selectionStatus: "asc" }, // SELECTED first
        { student: { fullName: "asc" } },
      ],
    });

    // Count squad size
    const squadSize = selections.filter((s) => s.selectionStatus === "SELECTED" || s.selectionStatus === "RESERVE").length;

    res.json({
      fixture: {
        id: fixture.id,
        matchType: fixture.matchType,
        opponent: fixture.opponent,
        matchDate: fixture.matchDate,
        matchTime: fixture.matchTime,
        venue: fixture.venue,
        status: fixture.status,
        squadSize,
      },
      selections: selections.map((s) => ({
        id: s.id,
        student: s.student,
        selectionStatus: s.selectionStatus || "NOT_SELECTED",
        selectionReason: s.selectionReason || null,
        position: s.position,
        role: s.role,
        notes: s.notes, // Coaches/admins can see notes
      })),
    });
  } catch (error: any) {
    console.error("Error fetching fixture selections:", error);
    res.status(500).json({ message: error.message || "Failed to fetch fixture selections" });
  }
});

/**
 * PUT /match-selection/fixture/:fixtureId/student/:studentId
 * Update match selection status (COACH/ADMIN only)
 */
router.put("/fixture/:fixtureId/student/:studentId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const fixtureId = Number(req.params.fixtureId);
  const studentId = Number(req.params.studentId);
  const { selectionStatus, selectionReason, position, role: playerRole, notes } = req.body;

  try {
    // Verify fixture exists
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        center: true,
      },
    });

    if (!fixture) {
      return res.status(404).json({ message: "Fixture not found" });
    }

    // Coach can only update fixtures for their centers
    if (role === "COACH") {
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: userId },
        select: { centerId: true },
      });
      const centerIds = coachCenters.map((cc) => cc.centerId);
      if (!centerIds.includes(fixture.centerId)) {
        return res.status(403).json({ message: "Forbidden: You can only update selections for fixtures in your centers" });
      }
    }

    // Verify student exists and is in the same center
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.centerId !== fixture.centerId) {
      return res.status(400).json({ message: "Student is not in the same center as the fixture" });
    }

    // Update or create selection
    const selection = await prisma.fixturePlayer.upsert({
      where: {
        fixtureId_studentId: {
          fixtureId,
          studentId,
        },
      },
      update: {
        selectionStatus: selectionStatus || undefined,
        selectionReason: selectionReason || undefined,
        position: position !== undefined ? position : undefined,
        role: playerRole !== undefined ? playerRole : undefined,
        notes: notes !== undefined ? notes : undefined, // Internal notes (not visible to students)
      },
      create: {
        fixtureId,
        studentId,
        selectionStatus: selectionStatus || "NOT_SELECTED",
        selectionReason: selectionReason || null,
        position: position || null,
        role: playerRole || null,
        notes: notes || null,
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            programType: true,
          },
        },
      },
    });

    res.json(selection);
  } catch (error: any) {
    console.error("Error updating match selection:", error);
    res.status(500).json({ message: error.message || "Failed to update match selection" });
  }
});

export default router;


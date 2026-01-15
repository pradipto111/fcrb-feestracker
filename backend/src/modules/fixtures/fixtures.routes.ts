import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

function normalizeScore(score?: string | null): string | null {
  if (!score) return null;
  const s = String(score).trim();
  const m = s.match(/(\d+)\s*[-:]\s*(\d+)/);
  return m ? `${m[1]}-${m[2]}` : null;
}

function mergeScoreIntoNotes(score?: string | null, notes?: string | null): string | null {
  const normalized = normalizeScore(score);
  const base = (notes ?? "").trim();
  if (!normalized) return base.length ? base : null;

  // Strip any existing leading score token to avoid duplication
  const stripped = base.replace(/^score:\s*\d+\s*[-:]\s*\d+\s*(?:•\s*)?/i, "").trim();
  return `Score: ${normalized}${stripped ? ` • ${stripped}` : ""}`;
}

function extractScore(notes?: string | null): string | null {
  return normalizeScore(notes);
}

// PUBLIC: Get fixtures for landing page (no auth required)
router.get("/public", async (req, res) => {
  try {
    const now = new Date();
    
    // Get upcoming fixtures (next 10)
    const upcomingFixtures = await prisma.fixture.findMany({
      where: {
        status: "UPCOMING",
        matchDate: { gte: now }
      },
      include: {
        center: {
          select: { name: true, shortName: true }
        }
      },
      orderBy: { matchDate: "asc" },
      take: 10
    });

    // Get recent completed fixtures (last 10)
    const recentResults = await prisma.fixture.findMany({
      where: {
        status: "COMPLETED"
      },
      include: {
        center: {
          select: { name: true, shortName: true }
        }
      },
      orderBy: { matchDate: "desc" },
      take: 10
    });

    // Transform to simpler format for public display
    const transformFixture = (f: any) => ({
      id: f.id,
      opponent: f.opponent || "TBD",
      matchDate: f.matchDate,
      matchTime: f.matchTime,
      venue: f.venue || "TBD",
      matchType: f.matchType,
      status: f.status,
      center: f.center?.shortName || f.center?.name || "FCRB",
      score: extractScore(f.notes)
    });

    res.json({
      upcoming: upcomingFixtures.map(transformFixture),
      results: recentResults.map(transformFixture)
    });
  } catch (error: any) {
    console.error("Error fetching public fixtures:", error);
    res.status(500).json({ message: "Failed to fetch fixtures" });
  }
});

// Helper function to get coach's center IDs
async function getCoachCenterIds(coachId: number): Promise<number[]> {
  const coachCenters = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return coachCenters.map(cc => cc.centerId);
}

// Create a fixture (Admin or Coach)
router.post("/", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { centerId, matchType, opponent, matchDate, matchTime, venue, notes, score, status, playerIds } = req.body;

  if (!centerId || !matchType || !matchDate || !matchTime) {
    return res.status(400).json({ message: "Missing required fields: centerId, matchType, matchDate, matchTime" });
  }

  // Coaches can only create fixtures for their assigned centers
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(Number(centerId))) {
      return res.status(403).json({ message: "You don't have access to this center" });
    }
  }

  // Verify all players belong to the center
  if (playerIds && Array.isArray(playerIds) && playerIds.length > 0) {
    const players = await prisma.student.findMany({
      where: {
        id: { in: playerIds.map((pid: any) => Number(pid)) },
        centerId: Number(centerId)
      }
    });

    if (players.length !== playerIds.length) {
      return res.status(400).json({ message: "Some players do not belong to this center" });
    }
  }

  const fixture = await prisma.fixture.create({
    data: {
      centerId: Number(centerId),
      coachId: id,
      matchType,
      opponent: opponent || null,
      matchDate: new Date(matchDate),
      matchTime,
      venue: venue || null,
      notes: mergeScoreIntoNotes(score, notes),
      status: status || undefined,
      players: playerIds && Array.isArray(playerIds) ? {
        create: playerIds.map((playerId: any, index: number) => ({
          studentId: Number(playerId),
          position: req.body.positions?.[index] || null,
          role: req.body.roles?.[index] || null,
          notes: req.body.playerNotes?.[index] || null
        }))
      } : undefined
    },
    include: {
      center: true,
      coach: true,
      players: {
        include: {
          student: true
        }
      }
    }
  });

  res.status(201).json(fixture);
});

// Get fixtures (filtered by center, date range, status)
router.get("/", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { centerId, fromDate, toDate, status, upcoming } = req.query;

  let centerIds: number[] = [];

  if (role === "ADMIN") {
    // Admin can see all centers
    if (centerId) {
      centerIds = [Number(centerId)];
    } else {
      const allCenters = await prisma.center.findMany({ select: { id: true } });
      centerIds = allCenters.map(c => c.id);
    }
  } else if (role === "COACH") {
    // Coach can only see their assigned centers
    centerIds = await getCoachCenterIds(id);
    if (centerId && !centerIds.includes(Number(centerId))) {
      return res.status(403).json({ message: "You don't have access to this center" });
    }
    if (centerId) {
      centerIds = [Number(centerId)];
    }
  } else if (role === "STUDENT") {
    // Students can only see fixtures for their center
    const student = await prisma.student.findUnique({
      where: { id }
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    centerIds = [student.centerId];
  } else {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Build where clause
  const where: any = { centerId: { in: centerIds } };

  if (status) {
    where.status = status;
  } else if (upcoming === "true") {
    where.status = "UPCOMING";
    where.matchDate = { gte: new Date() };
  }

  if (fromDate && toDate) {
    where.matchDate = {
      gte: new Date(fromDate as string),
      lte: new Date(toDate as string)
    };
  } else if (fromDate) {
    where.matchDate = { gte: new Date(fromDate as string) };
  } else if (toDate) {
    where.matchDate = { lte: new Date(toDate as string) };
  }

  const fixtures = await prisma.fixture.findMany({
    where,
    include: {
      center: true,
      coach: true,
      players: {
        include: {
          student: true
        }
      }
    },
    orderBy: {
      matchDate: "asc"
    }
  });

  res.json(fixtures);
});

// Get a specific fixture
router.get("/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const fixtureId = Number(req.params.id);

  const fixture = await prisma.fixture.findUnique({
    where: { id: fixtureId },
    include: {
      center: true,
      coach: true,
      players: {
        include: {
          student: true
        }
      }
    }
  });

  if (!fixture) {
    return res.status(404).json({ message: "Fixture not found" });
  }

  // Check access
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(fixture.centerId)) {
      return res.status(403).json({ message: "You don't have access to this fixture" });
    }
  } else if (role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id }
    });
    if (!student || student.centerId !== fixture.centerId) {
      return res.status(403).json({ message: "You don't have access to this fixture" });
    }
  }

  res.json(fixture);
});

// Update a fixture
router.put("/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const fixtureId = Number(req.params.id);
  const { matchType, opponent, matchDate, matchTime, venue, notes, score, status, playerIds } = req.body;

  const existingFixture = await prisma.fixture.findUnique({
    where: { id: fixtureId }
  });

  if (!existingFixture) {
    return res.status(404).json({ message: "Fixture not found" });
  }

  // Check access - only the coach who created it or admin can update
  if (role === "COACH" && existingFixture.coachId !== id) {
    return res.status(403).json({ message: "You can only update your own fixtures" });
  }

  // If updating players, verify they belong to the center
  if (playerIds && Array.isArray(playerIds)) {
    const players = await prisma.student.findMany({
      where: {
        id: { in: playerIds.map((pid: any) => Number(pid)) },
        centerId: existingFixture.centerId
      }
    });

    if (players.length !== playerIds.length) {
      return res.status(400).json({ message: "Some players do not belong to this center" });
    }
  }

  // Update fixture
  const fixture = await prisma.fixture.update({
    where: { id: fixtureId },
    data: {
      matchType,
      opponent,
      matchDate: matchDate ? new Date(matchDate) : undefined,
      matchTime,
      venue,
      notes: mergeScoreIntoNotes(score, notes),
      status
    },
    include: {
      center: true,
      coach: true,
      players: {
        include: {
          student: true
        }
      }
    }
  });

  // Update players if provided
  if (playerIds && Array.isArray(playerIds)) {
    // Delete existing players
    await prisma.fixturePlayer.deleteMany({
      where: { fixtureId }
    });

    // Create new players
    if (playerIds.length > 0) {
      await prisma.fixturePlayer.createMany({
        data: playerIds.map((playerId: any, index: number) => ({
          fixtureId,
          studentId: Number(playerId),
          position: req.body.positions?.[index] || null,
          role: req.body.roles?.[index] || null,
          notes: req.body.playerNotes?.[index] || null
        }))
      });
    }

    // Fetch updated fixture with players
    const updatedFixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        center: true,
        coach: true,
        players: {
          include: {
            student: true
          }
        }
      }
    });

    return res.json(updatedFixture);
  }

  res.json(fixture);
});

// Delete a fixture
router.delete("/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const fixtureId = Number(req.params.id);

  const existingFixture = await prisma.fixture.findUnique({
    where: { id: fixtureId }
  });

  if (!existingFixture) {
    return res.status(404).json({ message: "Fixture not found" });
  }

  // Check access - only the coach who created it or admin can delete
  if (role === "COACH" && existingFixture.coachId !== id) {
    return res.status(403).json({ message: "You can only delete your own fixtures" });
  }

  await prisma.fixture.delete({
    where: { id: fixtureId }
  });

  res.json({ message: "Fixture deleted" });
});

// Get student's fixtures (for students)
router.get("/student/my-fixtures", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  const student = await prisma.student.findUnique({
    where: { id }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Get all fixtures where student is a player
  const fixtures = await prisma.fixture.findMany({
    where: {
      centerId: student.centerId,
      players: {
        some: {
          studentId: id
        }
      }
    },
    include: {
      center: true,
      coach: true,
      players: {
        include: {
          student: true
        }
      }
    },
    orderBy: {
      matchDate: "asc"
    }
  });

  res.json(fixtures);
});

export default router;










import { Router } from "express";
import { PrismaClient, ClubEventType, ClubEventStatus } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { seedDemoClubEvents } from "./seed-demo-events";

const prisma = new PrismaClient();
const router = Router();

// PUBLIC: Get events for website (no auth required)
router.get("/public", async (req, res) => {
  try {
    const now = new Date();
    
    // Get upcoming events (next 20)
    const upcomingEvents = await prisma.clubEvent.findMany({
      where: {
        startAt: { gte: now },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      include: {
        center: {
          select: { name: true, shortName: true },
        },
        players: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { startAt: "asc" },
      take: 20,
    });

    // Get recent completed events (last 10)
    const recentEvents = await prisma.clubEvent.findMany({
      where: {
        status: "COMPLETED",
      },
      include: {
        center: {
          select: { name: true, shortName: true },
        },
        players: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { startAt: "desc" },
      take: 10,
    });

    // Transform to simpler format for public display
    const transformEvent = (e: any) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      startAt: e.startAt,
      endAt: e.endAt,
      allDay: e.allDay,
      venueName: e.venueName || "TBD",
      opponent: e.opponent || null,
      competition: e.competition || null,
      homeAway: e.homeAway || null,
      status: e.status,
      center: e.center?.shortName || e.center?.name || "FCRB",
      notes: e.notes,
      playerCount: e.players?.length || 0,
    });

    res.json({
      upcoming: upcomingEvents.map(transformEvent),
      recent: recentEvents.map(transformEvent),
    });
  } catch (error: any) {
    console.error("Error fetching public events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

async function getCoachCenterIds(coachId: number): Promise<number[]> {
  const coachCenters = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true },
  });
  return coachCenters.map((cc) => cc.centerId);
}

function parseDateParam(v: any): Date | null {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseTypeParam(v: any): ClubEventType[] | null {
  if (!v) return null;
  const raw = Array.isArray(v) ? v.join(",") : String(v);
  const parts = raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const allowed = new Set(Object.values(ClubEventType));
  const types = parts.filter((p) => allowed.has(p as any)) as ClubEventType[];
  return types.length ? types : null;
}

// PUBLIC READ: GET /events?from=YYYY-MM-DD&to=YYYY-MM-DD&type=...
router.get("/", async (req, res) => {
  try {
    const from = parseDateParam(req.query.from) ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = parseDateParam(req.query.to) ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    const types = parseTypeParam(req.query.type);

    const where: any = {
      startAt: { gte: from, lte: to },
    };
    if (types) where.type = { in: types };

    const events = await prisma.clubEvent.findMany({
      where,
      orderBy: { startAt: "asc" },
      include: {
        center: {
          select: {
            id: true,
            name: true,
            shortName: true,
          },
        },
        players: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                programType: true,
              },
            },
          },
        },
      },
    });

    res.json(events);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// CREATE: POST /events (ADMIN/COACH only)
router.post("/", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const { role, id } = req.user!;
  try {
    const {
      type,
      title,
      startAt,
      endAt,
      allDay,
      venueName,
      venueAddress,
      googleMapsUrl,
      competition,
      opponent,
      homeAway,
      teamId,
      centerId,
      status,
      notes,
      playerIds,
      positions,
      roles,
      playerNotes,
    } = req.body ?? {};

    if (!type || !title || !startAt) {
      return res.status(400).json({ message: "Missing required fields: type, title, startAt" });
    }

    // Coaches can only create events for their centers when centerId is provided
    if (role === "COACH" && centerId) {
      const coachCenterIds = await getCoachCenterIds(id);
      if (!coachCenterIds.includes(Number(centerId))) {
        return res.status(403).json({ message: "You don't have access to this center" });
      }
    }

    // Verify all players belong to the center (if players are provided)
    if (centerId && playerIds && Array.isArray(playerIds) && playerIds.length > 0) {
      const players = await prisma.student.findMany({
        where: {
          id: { in: playerIds.map((pid: any) => Number(pid)) },
          centerId: Number(centerId),
        },
      });

      if (players.length !== playerIds.length) {
        return res.status(400).json({ message: "Some players do not belong to this center" });
      }
    }

    const created = await prisma.clubEvent.create({
      data: {
        type,
        title,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        allDay: !!allDay,
        venueName: venueName ?? null,
        venueAddress: venueAddress ?? null,
        googleMapsUrl: googleMapsUrl ?? null,
        competition: competition ?? null,
        opponent: opponent ?? null,
        homeAway: homeAway ?? null,
        teamId: teamId ?? null,
        centerId: centerId ? Number(centerId) : null,
        status: status ?? ClubEventStatus.SCHEDULED,
        notes: notes ?? null,
        createdByUserId: id,
        players:
          playerIds && Array.isArray(playerIds) && playerIds.length > 0
            ? {
                create: playerIds.map((playerId: any, index: number) => ({
                  studentId: Number(playerId),
                  position: positions?.[index] || null,
                  role: roles?.[index] || null,
                  notes: playerNotes?.[index] || null,
                })),
              }
            : undefined,
      },
      include: {
        center: true,
        players: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                programType: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(created);
  } catch (error: any) {
    console.error("Error creating event:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ message: "An event with the same title and start time already exists" });
    }
    res.status(500).json({ message: "Failed to create event" });
  }
});

// UPDATE: PATCH /events/:id (ADMIN/COACH only)
router.patch("/:id", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const { role, id: userId } = req.user!;
  const eventId = String(req.params.id);

  try {
    const existing = await prisma.clubEvent.findUnique({ where: { id: eventId } });
    if (!existing) return res.status(404).json({ message: "Event not found" });

    // Coaches: allow update if they created it, or if it's scoped to their center
    if (role === "COACH") {
      if (existing.createdByUserId !== userId) {
        if (existing.centerId) {
          const coachCenterIds = await getCoachCenterIds(userId);
          if (!coachCenterIds.includes(existing.centerId)) {
            return res.status(403).json({ message: "Forbidden" });
          }
        } else {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
    }

    const patch = req.body ?? {};
    if (role === "COACH" && patch.centerId) {
      const coachCenterIds = await getCoachCenterIds(userId);
      if (!coachCenterIds.includes(Number(patch.centerId))) {
        return res.status(403).json({ message: "You don't have access to this center" });
      }
    }

    // Verify all players belong to the center (if players are being updated)
    if (existing.centerId && patch.playerIds && Array.isArray(patch.playerIds) && patch.playerIds.length > 0) {
      const players = await prisma.student.findMany({
        where: {
          id: { in: patch.playerIds.map((pid: any) => Number(pid)) },
          centerId: existing.centerId,
        },
      });

      if (players.length !== patch.playerIds.length) {
        return res.status(400).json({ message: "Some players do not belong to this center" });
      }
    }

    const updated = await prisma.clubEvent.update({
      where: { id: eventId },
      data: {
        type: patch.type ?? undefined,
        title: patch.title ?? undefined,
        startAt: patch.startAt ? new Date(patch.startAt) : undefined,
        endAt: patch.endAt !== undefined ? (patch.endAt ? new Date(patch.endAt) : null) : undefined,
        allDay: patch.allDay !== undefined ? !!patch.allDay : undefined,
        venueName: patch.venueName !== undefined ? patch.venueName : undefined,
        venueAddress: patch.venueAddress !== undefined ? patch.venueAddress : undefined,
        googleMapsUrl: patch.googleMapsUrl !== undefined ? patch.googleMapsUrl : undefined,
        competition: patch.competition !== undefined ? patch.competition : undefined,
        opponent: patch.opponent !== undefined ? patch.opponent : undefined,
        homeAway: patch.homeAway !== undefined ? patch.homeAway : undefined,
        teamId: patch.teamId !== undefined ? patch.teamId : undefined,
        centerId: patch.centerId !== undefined ? (patch.centerId ? Number(patch.centerId) : null) : undefined,
        status: patch.status !== undefined ? patch.status : undefined,
        notes: patch.notes !== undefined ? patch.notes : undefined,
      },
      include: {
        center: true,
        players: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                programType: true,
              },
            },
          },
        },
      },
    });

    // Update players if provided
    if (patch.playerIds !== undefined && Array.isArray(patch.playerIds)) {
      // Delete existing players
      await prisma.clubEventPlayer.deleteMany({
        where: { eventId },
      });

      // Create new players
      if (patch.playerIds.length > 0) {
        await prisma.clubEventPlayer.createMany({
          data: patch.playerIds.map((playerId: any, index: number) => ({
            eventId,
            studentId: Number(playerId),
            position: patch.positions?.[index] || null,
            role: patch.roles?.[index] || null,
            notes: patch.playerNotes?.[index] || null,
          })),
        });

        // Fetch updated event with players
        const finalEvent = await prisma.clubEvent.findUnique({
          where: { id: eventId },
          include: {
            center: true,
            players: {
              include: {
                student: {
                  select: {
                    id: true,
                    fullName: true,
                    programType: true,
                  },
                },
              },
            },
          },
        });

        return res.json(finalEvent);
      }
    }

    res.json(updated);
  } catch (error: any) {
    console.error("Error updating event:", error);
    if (error.code === "P2002") {
      return res.status(409).json({ message: "An event with the same title and start time already exists" });
    }
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE: DELETE /events/:id (ADMIN/COACH only)
router.delete("/:id", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const { role, id: userId } = req.user!;
  const eventId = String(req.params.id);

  try {
    const existing = await prisma.clubEvent.findUnique({ where: { id: eventId } });
    if (!existing) return res.status(404).json({ message: "Event not found" });

    if (role === "COACH") {
      if (existing.createdByUserId !== userId) {
        if (existing.centerId) {
          const coachCenterIds = await getCoachCenterIds(userId);
          if (!coachCenterIds.includes(existing.centerId)) {
            return res.status(403).json({ message: "Forbidden" });
          }
        } else {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
    }

    await prisma.clubEvent.delete({ where: { id: eventId } });
    res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// ADMIN ONLY: Seed demo fixtures/events (idempotent)
router.post("/seed", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { count } = await seedDemoClubEvents({ createdByUserId: req.user!.id });
    res.json({ message: "Demo fixtures created", count });
  } catch (error: any) {
    console.error("Error seeding demo events:", error);
    res.status(500).json({ message: "Failed to seed demo fixtures" });
  }
});

export default router;



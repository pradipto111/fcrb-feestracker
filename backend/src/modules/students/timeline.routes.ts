import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

/**
 * GET /timeline/student/:studentId
 * Get timeline for a specific student (COACH/ADMIN only)
 * Coaches can only view timelines for students in their centers
 */
router.get("/student/:studentId", authRequired, async (req, res) => {
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
        return res.status(403).json({ message: "Forbidden: You can only view timelines for students in your centers" });
      }
    }

    // Reuse the same logic as student timeline endpoint
    // (This could be refactored into a shared function)
    const events: any[] = [];

    // 1. Date joined academy
    if (student.joiningDate) {
      events.push({
        eventType: "JOINED_ACADEMY",
        title: "Joined FC Real Bengaluru",
        description: `Started training at ${student.center.name}`,
        eventDate: student.joiningDate,
        icon: "🎯",
        color: "#00E6FF",
      });
    }

    // 2. Get attendance milestones
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: studentId, status: "PRESENT" },
      include: { session: { include: { center: true } } },
      orderBy: { session: { sessionDate: "asc" } },
    });

    if (attendanceRecords.length > 0) {
      const totalSessions = await prisma.attendance.count({
        where: { studentId: studentId },
      });
      const attendanceRate = totalSessions > 0 ? (attendanceRecords.length / totalSessions) * 100 : 0;

      if (attendanceRate >= 90 && attendanceRecords.length >= 10) {
        const milestoneDate = attendanceRecords[Math.floor(attendanceRecords.length * 0.9) - 1]?.session.sessionDate;
        if (milestoneDate) {
          events.push({
            eventType: "ATTENDANCE_MILESTONE",
            title: "90% Attendance Milestone",
            description: `Maintained 90% attendance over ${attendanceRecords.length} sessions`,
            eventDate: milestoneDate,
            icon: "✅",
            color: "#27ae60",
            metadata: { attendanceRate: Math.round(attendanceRate), totalSessions: attendanceRecords.length },
          });
        }
      }

      if (attendanceRecords.length >= 50) {
        const milestoneDate = attendanceRecords[49]?.session.sessionDate;
        if (milestoneDate) {
          events.push({
            eventType: "ATTENDANCE_MILESTONE",
            title: "50 Training Sessions",
            description: `Completed 50 training sessions`,
            eventDate: milestoneDate,
            icon: "💪",
            color: "#27ae60",
            metadata: { sessionCount: 50 },
          });
        }
      }

      if (attendanceRecords.length >= 100) {
        const milestoneDate = attendanceRecords[99]?.session.sessionDate;
        if (milestoneDate) {
          events.push({
            eventType: "ATTENDANCE_MILESTONE",
            title: "100 Training Sessions",
            description: `Completed 100 training sessions`,
            eventDate: milestoneDate,
            icon: "🏆",
            color: "#f39c12",
            metadata: { sessionCount: 100 },
          });
        }
      }
    }

    // 3. Get fixture appearances
    const fixtureAppearances = await prisma.fixturePlayer.findMany({
      where: { studentId: studentId },
      include: {
        fixture: {
          include: { center: true },
        },
      },
      orderBy: { fixture: { matchDate: "asc" } },
    });

    if (fixtureAppearances.length > 0) {
      const firstMatch = fixtureAppearances[0];
      events.push({
        eventType: "MATCH_APPEARANCE",
        title: "First Match Appearance",
        description: `Played against ${firstMatch.fixture.opponent || "opponent"} (${firstMatch.fixture.matchType})`,
        eventDate: firstMatch.fixture.matchDate,
        icon: "⚽",
        color: "#3498db",
        metadata: {
          opponent: firstMatch.fixture.opponent,
          matchType: firstMatch.fixture.matchType,
          position: firstMatch.position,
          role: firstMatch.role,
        },
      });
    }

    const leagueMatches = fixtureAppearances.filter(
      (fp) => fp.fixture.matchType && fp.fixture.matchType.toLowerCase().includes("league")
    );
    if (leagueMatches.length > 0) {
      const firstLeagueMatch = leagueMatches[0];
      events.push({
        eventType: "LEAGUE_PARTICIPATION",
        title: "First League Match",
        description: `Started participating in ${firstLeagueMatch.fixture.matchType}`,
        eventDate: firstLeagueMatch.fixture.matchDate,
        icon: "🏅",
        color: "#9b59b6",
        metadata: { matchType: firstLeagueMatch.fixture.matchType },
      });
    }

    // 4. Get badges
    const badges = await prisma.badge.findMany({
      where: { studentStats: { studentId: studentId } },
      include: { studentStats: true },
      orderBy: { earnedAt: "asc" },
    });

    const badgeTitles: Record<string, string> = {
      FIRST_VOTE: "First Recognition",
      TOP_WEEKLY: "Top Performer of the Week",
      TOP_MONTHLY: "Top Performer of the Month",
      STREAK_5: "5 Session Streak",
      STREAK_10: "10 Session Streak",
      STREAK_20: "20 Session Streak",
      CENTURY: "100 Points Milestone",
      FIVE_HUNDRED: "500 Points Milestone",
      THOUSAND: "1000 Points Milestone",
      COACH_FAVORITE: "Coach's Favorite",
      PEER_FAVORITE: "Peer Favorite",
      CONSISTENT: "Consistency Award",
    };

    badges.forEach((badge) => {
      events.push({
        eventType: "BADGE_EARNED",
        title: badgeTitles[badge.badgeType] || badge.badgeType,
        description: `Earned ${badgeTitles[badge.badgeType] || badge.badgeType} badge`,
        eventDate: badge.earnedAt,
        icon: "🏅",
        color: "#e74c3c",
        metadata: { badgeType: badge.badgeType },
      });
    });

    // 5. Get student stats
    const studentStats = await prisma.studentStats.findMany({
      where: { studentId: studentId },
      orderBy: { updatedAt: "desc" },
    });

    studentStats.forEach((stat) => {
      if (stat.totalPoints > 0 && stat.lastVotedAt) {
        const existingFirstVote = events.find(
          (e) => e.eventType === "BADGE_EARNED" && e.metadata?.badgeType === "FIRST_VOTE"
        );
        if (!existingFirstVote) {
          events.push({
            eventType: "PERFORMANCE_EVALUATION",
            title: "First Performance Recognition",
            description: `Received first vote from peers or coaches`,
            eventDate: stat.lastVotedAt,
            icon: "⭐",
            color: "#f39c12",
            metadata: { totalPoints: stat.totalPoints },
          });
        }
      }
    });

    // 6. Payment milestones
    const payments = await prisma.payment.findMany({
      where: { studentId: studentId },
      orderBy: { paymentDate: "asc" },
    });

    if (payments.length > 0) {
      events.push({
        eventType: "PAYMENT_MILESTONE",
        title: "First Payment",
        description: `Completed first payment of ₹${payments[0].amount.toLocaleString()}`,
        eventDate: payments[0].paymentDate,
        icon: "💰",
        color: "#27ae60",
        metadata: { amount: payments[0].amount },
      });

      if (payments.length >= 6) {
        const sixMonthDate = payments[5]?.paymentDate;
        if (sixMonthDate) {
          events.push({
            eventType: "PAYMENT_MILESTONE",
            title: "6 Months of Consistent Payments",
            description: `Maintained consistent payment record`,
            eventDate: sixMonthDate,
            icon: "💎",
            color: "#27ae60",
            metadata: { paymentCount: 6 },
          });
        }
      }
    }

    // 7. Get manual timeline events
    try {
      const manualEvents = await (prisma as any).timelineEvent?.findMany({
        where: { studentId: studentId },
        orderBy: { eventDate: "asc" },
      });

      if (manualEvents && manualEvents.length > 0) {
        const eventIcons: Record<string, string> = {
          JOINED_ACADEMY: "🎯",
          ATTENDANCE_MILESTONE: "✅",
          LEAGUE_PARTICIPATION: "🏅",
          MATCH_APPEARANCE: "⚽",
          PERFORMANCE_EVALUATION: "⭐",
          PROMOTION: "📈",
          COACH_FEEDBACK: "💬",
          BADGE_EARNED: "🏅",
          PAYMENT_MILESTONE: "💰",
          CUSTOM: "📝",
        };

        const eventColors: Record<string, string> = {
          JOINED_ACADEMY: "#00E6FF",
          ATTENDANCE_MILESTONE: "#27ae60",
          LEAGUE_PARTICIPATION: "#9b59b6",
          MATCH_APPEARANCE: "#3498db",
          PERFORMANCE_EVALUATION: "#f39c12",
          PROMOTION: "#e74c3c",
          COACH_FEEDBACK: "#3498db",
          BADGE_EARNED: "#e74c3c",
          PAYMENT_MILESTONE: "#27ae60",
          CUSTOM: "#95a5a6",
        };

        manualEvents.forEach((event: any) => {
          events.push({
            id: event.id,
            eventType: event.eventType,
            title: event.title,
            description: event.description,
            eventDate: event.eventDate,
            icon: eventIcons[event.eventType] || "📝",
            color: eventColors[event.eventType] || "#95a5a6",
            metadata: event.metadata,
            isManual: true,
            createdByRole: event.createdByRole,
          });
        });
      }
    } catch (error) {
      // TimelineEvent model might not exist yet
      console.log("TimelineEvent model not available yet");
    }

    events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    res.json({ events });
  } catch (error: any) {
    console.error("Error fetching timeline:", error);
    res.status(500).json({ message: error.message || "Failed to fetch timeline" });
  }
});

/**
 * POST /timeline/student/:studentId/events
 * Create a timeline event (COACH/ADMIN only)
 */
router.post("/student/:studentId/events", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  const { id: userId, role } = req.user!;
  const studentId = Number(req.params.studentId);
  const { eventType, title, description, eventDate, metadata } = req.body;

  try {
    // Validate required fields
    if (!eventType || !title || !eventDate) {
      return res.status(400).json({ message: "eventType, title, and eventDate are required" });
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { center: true },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Coach can only add events for students in their centers
    if (role === "COACH") {
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: userId },
        select: { centerId: true },
      });
      const centerIds = coachCenters.map((cc) => cc.centerId);
      if (!centerIds.includes(student.centerId)) {
        return res.status(403).json({ message: "Forbidden: You can only add timeline events for students in your centers" });
      }
    }

    // Create timeline event
    try {
      const event = await (prisma as any).timelineEvent?.create({
        data: {
          studentId,
          eventType,
          title,
          description: description || null,
          eventDate: new Date(eventDate),
          metadata: metadata || null,
          createdByRole: role,
          createdById: userId,
        },
      });

      res.status(201).json(event);
    } catch (error: any) {
      if (error.message && error.message.includes("timelineEvent")) {
        return res.status(500).json({
          message: "TimelineEvent model not available. Please run: cd backend && npx prisma migrate dev --name add_timeline_events && npx prisma generate",
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error creating timeline event:", error);
    res.status(500).json({ message: error.message || "Failed to create timeline event" });
  }
});

/**
 * PUT /timeline/events/:eventId
 * Update a timeline event (ADMIN only - for audit trail)
 */
router.put("/events/:eventId", authRequired, requireRole("ADMIN"), async (req, res) => {
  const eventId = Number(req.params.eventId);
  const { title, description, eventDate, metadata } = req.body;

  try {
    const existingEvent = await (prisma as any).timelineEvent?.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Timeline event not found" });
    }

    // Only allow editing manual events (not auto-generated ones)
    if (!existingEvent.createdByRole) {
      return res.status(400).json({ message: "Cannot edit auto-generated timeline events" });
    }

    const updatedEvent = await (prisma as any).timelineEvent?.update({
      where: { id: eventId },
      data: {
        title: title || existingEvent.title,
        description: description !== undefined ? description : existingEvent.description,
        eventDate: eventDate ? new Date(eventDate) : existingEvent.eventDate,
        metadata: metadata !== undefined ? metadata : existingEvent.metadata,
        updatedAt: new Date(),
      },
    });

    res.json(updatedEvent);
  } catch (error: any) {
    if (error.message && error.message.includes("timelineEvent")) {
      return res.status(500).json({
        message: "TimelineEvent model not available. Please run: cd backend && npx prisma migrate dev --name add_timeline_events && npx prisma generate",
      });
    }
    console.error("Error updating timeline event:", error);
    res.status(500).json({ message: error.message || "Failed to update timeline event" });
  }
});

/**
 * DELETE /timeline/events/:eventId
 * Delete a timeline event (ADMIN only)
 */
router.delete("/events/:eventId", authRequired, requireRole("ADMIN"), async (req, res) => {
  const eventId = Number(req.params.eventId);

  try {
    const existingEvent = await (prisma as any).timelineEvent?.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Timeline event not found" });
    }

    await (prisma as any).timelineEvent?.delete({
      where: { id: eventId },
    });

    res.json({ message: "Timeline event deleted successfully" });
  } catch (error: any) {
    if (error.message && error.message.includes("timelineEvent")) {
      return res.status(500).json({
        message: "TimelineEvent model not available. Please run: cd backend && npx prisma migrate dev --name add_timeline_events && npx prisma generate",
      });
    }
    console.error("Error deleting timeline event:", error);
    res.status(500).json({ message: error.message || "Failed to delete timeline event" });
  }
});

export default router;


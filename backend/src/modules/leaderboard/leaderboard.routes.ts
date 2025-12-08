import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Helper function to update student stats
async function updateStudentStats(studentId: number, centerId: number, points: number, isCoachVote: boolean) {
  // Get or create student stats
  let stats = await prisma.studentStats.findUnique({
    where: {
      studentId_centerId: {
        studentId,
        centerId
      }
    }
  });

  if (!stats) {
    stats = await prisma.studentStats.create({
      data: {
        studentId,
        centerId,
        totalPoints: 0,
        studentVotes: 0,
        coachVotes: 0,
        sessionsVoted: 0,
        currentStreak: 0,
        longestStreak: 0,
        weeklyPoints: 0,
        monthlyPoints: 0
      }
    });
  }

  // Calculate time periods
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Check if this is a new session (for streak calculation)
  const lastVoteDate = stats.lastVotedAt ? new Date(stats.lastVotedAt) : null;
  const sessionDate = new Date();
  sessionDate.setHours(0, 0, 0, 0);
  
  let newStreak = stats.currentStreak;
  if (!lastVoteDate || lastVoteDate.getTime() < sessionDate.getTime() - 86400000) {
    // New day, increment streak
    newStreak = stats.currentStreak + 1;
  }

  // Update stats
  const updatedStats = await prisma.studentStats.update({
    where: { id: stats.id },
    data: {
      totalPoints: stats.totalPoints + points,
      studentVotes: isCoachVote ? stats.studentVotes : stats.studentVotes + 1,
      coachVotes: isCoachVote ? stats.coachVotes + 1 : stats.coachVotes,
      sessionsVoted: stats.sessionsVoted + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      weeklyPoints: stats.lastVotedAt && new Date(stats.lastVotedAt) >= weekStart 
        ? stats.weeklyPoints + points 
        : points,
      monthlyPoints: stats.lastVotedAt && new Date(stats.lastVotedAt) >= monthStart 
        ? stats.monthlyPoints + points 
        : points,
      lastVotedAt: now
    }
  });

  // Check and award badges
  await checkAndAwardBadges(updatedStats);

  return updatedStats;
}

// Helper function to check and award badges
async function checkAndAwardBadges(stats: any) {
  const badges: string[] = [];

  // Check existing badges
  const existingBadges = await prisma.badge.findMany({
    where: { studentStatsId: stats.id },
    select: { badgeType: true }
  });
  const existingBadgeTypes = existingBadges.map((b: { badgeType: string }) => b.badgeType);

  // First vote badge
  if (stats.sessionsVoted === 1 && !existingBadgeTypes.includes("FIRST_VOTE")) {
    badges.push("FIRST_VOTE");
  }

  // Streak badges
  if (stats.currentStreak >= 5 && !existingBadgeTypes.includes("STREAK_5")) {
    badges.push("STREAK_5");
  }
  if (stats.currentStreak >= 10 && !existingBadgeTypes.includes("STREAK_10")) {
    badges.push("STREAK_10");
  }
  if (stats.currentStreak >= 20 && !existingBadgeTypes.includes("STREAK_20")) {
    badges.push("STREAK_20");
  }

  // Points milestones
  if (stats.totalPoints >= 100 && !existingBadgeTypes.includes("CENTURY")) {
    badges.push("CENTURY");
  }
  if (stats.totalPoints >= 500 && !existingBadgeTypes.includes("FIVE_HUNDRED")) {
    badges.push("FIVE_HUNDRED");
  }
  if (stats.totalPoints >= 1000 && !existingBadgeTypes.includes("THOUSAND")) {
    badges.push("THOUSAND");
  }

  // Consistent badge (voted in 10+ sessions)
  if (stats.sessionsVoted >= 10 && !existingBadgeTypes.includes("CONSISTENT")) {
    badges.push("CONSISTENT");
  }

  // Award new badges
  if (badges.length > 0) {
    await prisma.badge.createMany({
      data: badges.map(badgeType => ({
        studentStatsId: stats.id,
        badgeType: badgeType as any
      }))
    });
  }
}

// Submit votes for a session
router.post("/vote", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { sessionId, votedForIds } = req.body;

  if (!sessionId || !Array.isArray(votedForIds) || votedForIds.length === 0) {
    return res.status(400).json({ message: "Session ID and at least one vote is required" });
  }

  if (votedForIds.length > 5) {
    return res.status(400).json({ message: "Maximum 5 votes allowed" });
  }

  // Verify session exists
  const session = await prisma.session.findUnique({
    where: { id: Number(sessionId) },
    include: { center: true }
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Verify user has access to this center
  if (role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id }
    });
    if (!student || student.centerId !== session.centerId) {
      return res.status(403).json({ message: "You don't have access to this session" });
    }
    // Students can't vote for themselves
    if (votedForIds.includes(id)) {
      return res.status(400).json({ message: "Students cannot vote for themselves" });
    }
  } else if (role === "COACH" || role === "ADMIN") {
    // Verify coach has access to this center
    const coachCenters = await prisma.coachCenter.findMany({
      where: { coachId: id }
    });
    const coachCenterIds = coachCenters.map(cc => cc.centerId);
    if (role === "COACH" && !coachCenterIds.includes(session.centerId)) {
      return res.status(403).json({ message: "You don't have access to this center" });
    }
  }

  // Verify all voted students belong to the same center
  const students = await prisma.student.findMany({
    where: {
      id: { in: votedForIds.map((id: any) => Number(id)) },
      centerId: session.centerId,
      status: "ACTIVE"
    }
  });

  if (students.length !== votedForIds.length) {
    return res.status(400).json({ message: "Some selected students are invalid or don't belong to this center" });
  }

  // Check if user already voted for this session
  const existingVotes = await prisma.vote.findMany({
    where: {
      sessionId: Number(sessionId),
      voterId: id,
      voterRole: role
    }
  });

  if (existingVotes.length > 0) {
    return res.status(400).json({ message: "You have already voted for this session" });
  }

  // Determine points per vote
  const pointsPerVote = (role === "COACH" || role === "ADMIN") ? 2 : 1;
  const isCoachVote = role === "COACH" || role === "ADMIN";

  // Create votes
  const votes = await prisma.vote.createMany({
    data: votedForIds.map((votedForId: any) => ({
      sessionId: Number(sessionId),
      voterRole: role,
      voterId: id,
      votedForId: Number(votedForId),
      points: pointsPerVote,
      centerId: session.centerId
    }))
  });

  // Update stats for each voted student
  for (const votedForId of votedForIds) {
    await updateStudentStats(Number(votedForId), session.centerId, pointsPerVote, isCoachVote);
  }

  // Check for weekly/monthly top performers and award badges
  await checkWeeklyMonthlyBadges(session.centerId);

  res.status(201).json({ message: "Votes submitted successfully", votesCount: votes.count });
});

// Get leaderboard for a center
router.get("/:centerId", authRequired, async (req, res) => {
  const centerId = Number(req.params.centerId);
  const { period = "all" } = req.query; // all, weekly, monthly

  // Verify center exists
  const center = await prisma.center.findUnique({
    where: { id: centerId }
  });

  if (!center) {
    return res.status(404).json({ message: "Center not found" });
  }

  // Get leaderboard based on period
  let orderBy: any = {};
  if (period === "weekly") {
    orderBy = { weeklyPoints: "desc" };
  } else if (period === "monthly") {
    orderBy = { monthlyPoints: "desc" };
  } else {
    orderBy = { totalPoints: "desc" };
  }

  const stats = await prisma.studentStats.findMany({
    where: { centerId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          programType: true
        }
      },
      badges: {
        orderBy: {
          earnedAt: "desc"
        },
        take: 5 // Latest 5 badges
      }
    },
    orderBy
  });

  // Add rank
  const leaderboard = stats.map((stat: any, index: number) => ({
    rank: index + 1,
    student: stat.student,
    totalPoints: stat.totalPoints,
    studentVotes: stat.studentVotes,
    coachVotes: stat.coachVotes,
    sessionsVoted: stat.sessionsVoted,
    currentStreak: stat.currentStreak,
    longestStreak: stat.longestStreak,
    weeklyPoints: stat.weeklyPoints,
    monthlyPoints: stat.monthlyPoints,
    badges: stat.badges,
    lastVotedAt: stat.lastVotedAt
  }));

  res.json({
    center: {
      id: center.id,
      name: center.name
    },
    period,
    leaderboard
  });
});

// Get student's own stats
router.get("/student/my-stats", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      center: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const stats = await prisma.studentStats.findUnique({
    where: {
      studentId_centerId: {
        studentId: id,
        centerId: student.centerId
      }
    },
    include: {
      badges: {
        orderBy: {
          earnedAt: "desc"
        }
      }
    }
  });

  if (!stats) {
    return res.json({
      student: {
        id: student.id,
        fullName: student.fullName,
        center: student.center
      },
      totalPoints: 0,
      studentVotes: 0,
      coachVotes: 0,
      sessionsVoted: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyPoints: 0,
      monthlyPoints: 0,
      badges: [],
      rank: null
    });
  }

  // Get rank
  const allStats = await prisma.studentStats.findMany({
    where: { centerId: student.centerId },
    orderBy: { totalPoints: "desc" }
  });
  const rank = allStats.findIndex((s: any) => s.id === stats.id) + 1;

  res.json({
    student: {
      id: student.id,
      fullName: student.fullName,
      center: student.center
    },
    ...stats,
    rank
  });
});

// Get students available for voting (for a session)
router.get("/session/:sessionId/students", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.sessionId);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { center: true }
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Get all active students from the center
  const students = await prisma.student.findMany({
    where: {
      centerId: session.centerId,
      status: "ACTIVE"
    },
    select: {
      id: true,
      fullName: true,
      programType: true
    },
    orderBy: {
      fullName: "asc"
    }
  });

  // Filter out the voter if they're a student
  const availableStudents = role === "STUDENT" 
    ? students.filter(s => s.id !== id)
    : students;

  res.json(availableStudents);
});

// Check if user has already voted for a session
router.get("/session/:sessionId/voted", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.sessionId);

  const votes = await prisma.vote.findMany({
    where: {
      sessionId,
      voterId: id,
      voterRole: role
    },
    include: {
      session: {
        select: {
          id: true,
          sessionDate: true
        }
      }
    }
  });

  res.json({
    hasVoted: votes.length > 0,
    votes: votes.map((v: any) => ({
      votedForId: v.votedForId,
      points: v.points
    }))
  });
});

// Helper function to check and award weekly/monthly badges
async function checkWeeklyMonthlyBadges(centerId: number) {
  // Get top weekly performer
  const weeklyTop = await prisma.studentStats.findFirst({
    where: { centerId },
    orderBy: { weeklyPoints: "desc" },
    include: {
      badges: {
        select: { badgeType: true }
      }
    }
  });

  if (weeklyTop && weeklyTop.weeklyPoints > 0) {
    const hasWeeklyBadge = weeklyTop.badges.some((b: { badgeType: string }) => b.badgeType === "TOP_WEEKLY");
    if (!hasWeeklyBadge) {
      // Remove old weekly badges for this center
      await prisma.badge.deleteMany({
        where: {
          studentStats: {
            centerId
          },
          badgeType: "TOP_WEEKLY"
        }
      });
      // Award new weekly badge
      await prisma.badge.create({
        data: {
          studentStatsId: weeklyTop.id,
          badgeType: "TOP_WEEKLY"
        }
      });
    }
  }

  // Get top monthly performer
  const monthlyTop = await prisma.studentStats.findFirst({
    where: { centerId },
    orderBy: { monthlyPoints: "desc" },
    include: {
      badges: {
        select: { badgeType: true }
      }
    }
  });

  if (monthlyTop && monthlyTop.monthlyPoints > 0) {
    const hasMonthlyBadge = monthlyTop.badges.some((b: { badgeType: string }) => b.badgeType === "TOP_MONTHLY");
    if (!hasMonthlyBadge) {
      // Remove old monthly badges for this center
      await prisma.badge.deleteMany({
        where: {
          studentStats: {
            centerId
          },
          badgeType: "TOP_MONTHLY"
        }
      });
      // Award new monthly badge
      await prisma.badge.create({
        data: {
          studentStatsId: monthlyTop.id,
          badgeType: "TOP_MONTHLY"
        }
      });
    }
  }
}

export default router;





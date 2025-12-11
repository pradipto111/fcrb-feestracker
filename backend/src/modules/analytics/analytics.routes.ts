import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Helper: Get coach's center IDs
async function getCoachCenterIds(coachId: number): Promise<number[]> {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true },
  });
  return links.map((l) => l.centerId);
}

// Helper: Calculate attendance rate
function calculateAttendanceRate(
  attended: number,
  scheduled: number
): number {
  if (scheduled === 0) return 0;
  return Math.round((attended / scheduled) * 100);
}

// Helper: Get attendance label
function getAttendanceLabel(rate: number): string {
  if (rate >= 85) return "Strong";
  if (rate >= 70) return "Moderate";
  return "Needs Work";
}

// ============================================
// ADMIN ANALYTICS
// ============================================

/**
 * GET /analytics/admin/summary
 * System-wide KPIs for Admin
 */
router.get(
  "/admin/summary",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { centerId, startDate, endDate } = req.query as {
        centerId?: string;
        startDate?: string;
        endDate?: string;
      };

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);

      const studentFilter: any = { status: "ACTIVE" };
      if (centerId) studentFilter.centerId = Number(centerId);

      // Total Active Players
      const totalActivePlayers = await prisma.student.count({
        where: studentFilter,
      });

      // Average Attendance %
      const sessions = await prisma.session.findMany({
        where: {
          ...(dateFilter.gte || dateFilter.lte
            ? { sessionDate: dateFilter }
            : {}),
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
        include: {
          attendance: true,
        },
      });

      let totalScheduled = 0;
      let totalAttended = 0;
      sessions.forEach((session) => {
        totalScheduled += totalActivePlayers;
        totalAttended += session.attendance.filter(
          (a) => a.status === "PRESENT"
        ).length;
      });

      const avgAttendance =
        totalScheduled > 0
          ? calculateAttendanceRate(totalAttended, totalScheduled)
          : 0;

      // Sessions (Last 30 Days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sessionsLast30Days = await prisma.session.count({
        where: {
          sessionDate: { gte: thirtyDaysAgo },
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
      });

      // Matches (Season - last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const matchesSeason = await prisma.fixture.count({
        where: {
          matchDate: { gte: sixMonthsAgo },
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
      });

      // Fee Collection % (This Month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const studentsThisMonth = await prisma.student.findMany({
        where: studentFilter,
      });

      const expectedFees = studentsThisMonth.reduce(
        (sum, s) => sum + s.monthlyFeeAmount,
        0
      );

      const collectedThisMonth = await prisma.payment.aggregate({
        where: {
          paymentDate: { gte: monthStart, lte: monthEnd },
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
        _sum: { amount: true },
      });

      const feeCollectionRate =
        expectedFees > 0
          ? Math.round((collectedThisMonth._sum.amount || 0) / expectedFees) *
            100
          : 0;

      // Wellness Average (Last 14 Days)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const wellnessChecks = await prisma.wellnessCheck.findMany({
        where: {
          checkDate: { gte: fourteenDaysAgo },
        },
      });

      const avgWellness =
        wellnessChecks.length > 0
          ? Math.round(
              wellnessChecks.reduce((sum, w) => sum + w.exertionLevel, 0) /
                wellnessChecks.length
            )
          : 0;

      res.json({
        totalActivePlayers,
        avgAttendance,
        sessionsLast30Days,
        matchesSeason,
        feeCollectionRate,
        avgWellness,
      });
    } catch (error: any) {
      console.error("Error fetching admin analytics summary:", error);
      res.status(500).json({ message: error.message || "Failed to fetch analytics" });
    }
  }
);

/**
 * GET /analytics/admin/attendance
 * Attendance analytics over time
 */
router.get(
  "/admin/attendance",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { centerId, groupBy = "week" } = req.query as {
        centerId?: string;
        groupBy?: "week" | "month";
      };

      // Get sessions with attendance
      const sessions = await prisma.session.findMany({
        where: {
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
        include: {
          attendance: true,
          center: true,
        },
        orderBy: { sessionDate: "asc" },
      });

      // Group by week or month
      const grouped: Record<string, { scheduled: number; attended: number }> =
        {};

      sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        let key: string;

        if (groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!grouped[key]) {
          grouped[key] = { scheduled: 0, attended: 0 };
        }

        const activeStudents = session.attendance.length;
        grouped[key].scheduled += activeStudents;
        grouped[key].attended += session.attendance.filter(
          (a) => a.status === "PRESENT"
        ).length;
      });

      const data = Object.entries(grouped).map(([period, stats]) => ({
        period,
        scheduled: stats.scheduled,
        attended: stats.attended,
        rate: calculateAttendanceRate(stats.attended, stats.scheduled),
      }));

      res.json(data);
    } catch (error: any) {
      console.error("Error fetching attendance analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch attendance analytics" });
    }
  }
);

/**
 * GET /analytics/admin/attendance-by-centre
 */
router.get(
  "/admin/attendance-by-centre",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const centers = await prisma.center.findMany({
        where: { isActive: true },
      });

      const results = await Promise.all(
        centers.map(async (center) => {
          const sessions = await prisma.session.findMany({
            where: { centerId: center.id },
            include: { attendance: true },
          });

          let scheduled = 0;
          let attended = 0;

          sessions.forEach((session) => {
            scheduled += session.attendance.length;
            attended += session.attendance.filter(
              (a) => a.status === "PRESENT"
            ).length;
          });

          return {
            centreId: center.id,
            centreName: center.name,
            scheduled,
            attended,
            rate: calculateAttendanceRate(attended, scheduled),
          };
        })
      );

      res.json(results);
    } catch (error: any) {
      console.error("Error fetching attendance by centre:", error);
      res.status(500).json({ message: error.message || "Failed to fetch attendance by centre" });
    }
  }
);

/**
 * GET /analytics/admin/pipeline
 * Player pipeline & retention
 */
router.get(
  "/admin/pipeline",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const students = await prisma.student.findMany({
        where: { status: "ACTIVE" },
        include: {
          progressRoadmap: true,
        },
      });

      const pipeline: Record<string, number> = {};
      students.forEach((student) => {
        const level =
          student.progressRoadmap?.currentLevel || "Youth League";
        pipeline[level] = (pipeline[level] || 0) + 1;
      });

      res.json({
        pipeline,
        totalActive: students.length,
      });
    } catch (error: any) {
      console.error("Error fetching pipeline analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch pipeline analytics" });
    }
  }
);

/**
 * GET /analytics/admin/finance
 * Finance analytics
 */
router.get(
  "/admin/finance",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { months = "12" } = req.query as { months?: string };
      const monthsCount = Number(months);

      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - monthsCount);

      const payments = await prisma.payment.findMany({
        where: {
          paymentDate: { gte: startDate },
        },
        orderBy: { paymentDate: "asc" },
      });

      // Group by month
      const monthly: Record<string, number> = {};
      payments.forEach((payment) => {
        const date = new Date(payment.paymentDate);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthly[key] = (monthly[key] || 0) + payment.amount;
      });

      const data = Object.entries(monthly).map(([month, amount]) => ({
        month,
        amount,
      }));

      // Outstanding calculation
      const students = await prisma.student.findMany({
        where: { status: "ACTIVE" },
      });

      const expectedMonthly = students.reduce(
        (sum, s) => sum + s.monthlyFeeAmount,
        0
      );

      const collectedThisMonth = await prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
          },
        },
        _sum: { amount: true },
      });

      res.json({
        monthlyTrend: data,
        expectedMonthly,
        collectedThisMonth: collectedThisMonth._sum.amount || 0,
        outstanding: Math.max(0, expectedMonthly - (collectedThisMonth._sum.amount || 0)),
      });
    } catch (error: any) {
      console.error("Error fetching finance analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch finance analytics" });
    }
  }
);

/**
 * GET /analytics/admin/sessions
 * Session & load analytics
 */
router.get(
  "/admin/sessions",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { centerId } = req.query as { centerId?: string };

      const sessions = await prisma.session.findMany({
        where: {
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
        include: {
          center: true,
        },
        orderBy: { sessionDate: "desc" },
        take: 100,
      });

      // Get wellness checks for these sessions
      const sessionIds = sessions.map((s) => s.id);
      const wellnessChecks = await prisma.wellnessCheck.findMany({
        where: {
          sessionId: { in: sessionIds },
        },
      });

      // Group by week
      const weekly: Record<string, { sessions: number; avgExertion: number }> =
        {};

      sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toISOString().split("T")[0];

        if (!weekly[key]) {
          weekly[key] = { sessions: 0, avgExertion: 0 };
        }

        weekly[key].sessions += 1;

        const sessionWellness = wellnessChecks.filter(
          (w) => w.sessionId === session.id
        );
        if (sessionWellness.length > 0) {
          const avg =
            sessionWellness.reduce((sum, w) => sum + w.exertionLevel, 0) /
            sessionWellness.length;
          weekly[key].avgExertion =
            (weekly[key].avgExertion + avg) / 2; // Simple average
        }
      });

      const data = Object.entries(weekly).map(([week, stats]) => ({
        week,
        sessions: stats.sessions,
        avgExertion: Math.round(stats.avgExertion * 10) / 10,
      }));

      res.json(data);
    } catch (error: any) {
      console.error("Error fetching session analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch session analytics" });
    }
  }
);

/**
 * GET /analytics/admin/matches
 * Match & selection analytics
 */
router.get(
  "/admin/matches",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const fixtures = await prisma.fixture.findMany({
        include: {
          players: true,
        },
        orderBy: { matchDate: "desc" },
      });

      const byCompetition: Record<string, number> = {};
      const participationDistribution = {
        "0": 0,
        "1-5": 0,
        "6-10": 0,
        "10+": 0,
      };

      const playerMatchCounts: Record<number, number> = {};

      fixtures.forEach((fixture) => {
        const comp = fixture.matchType || "Other";
        byCompetition[comp] = (byCompetition[comp] || 0) + 1;

        fixture.players.forEach((fp) => {
          if (fp.selectionStatus === "SELECTED") {
            playerMatchCounts[fp.studentId] =
              (playerMatchCounts[fp.studentId] || 0) + 1;
          }
        });
      });

      Object.values(playerMatchCounts).forEach((count) => {
        if (count === 0) participationDistribution["0"]++;
        else if (count <= 5) participationDistribution["1-5"]++;
        else if (count <= 10) participationDistribution["6-10"]++;
        else participationDistribution["10+"]++;
      });

      res.json({
        byCompetition: Object.entries(byCompetition).map(([comp, count]) => ({
          competition: comp,
          matches: count,
        })),
        participationDistribution,
      });
    } catch (error: any) {
      console.error("Error fetching match analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch match analytics" });
    }
  }
);

// ============================================
// COACH ANALYTICS
// ============================================

/**
 * GET /analytics/coach/summary
 * Coach overview KPIs
 */
router.get(
  "/coach/summary",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);

      // Players under coach
      const students = await prisma.student.findMany({
        where: {
          centerId: { in: centerIds },
          status: "ACTIVE",
        },
      });

      // Avg attendance
      const sessions = await prisma.session.findMany({
        where: {
          centerId: { in: centerIds },
          coachId,
        },
        include: { attendance: true },
      });

      let scheduled = 0;
      let attended = 0;
      sessions.forEach((session) => {
        scheduled += students.length;
        attended += session.attendance.filter(
          (a) => a.status === "PRESENT"
        ).length;
      });

      const avgAttendance = calculateAttendanceRate(attended, scheduled);

      // Sessions this week
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const sessionsThisWeek = await prisma.session.count({
        where: {
          centerId: { in: centerIds },
          coachId,
          sessionDate: { gte: weekStart },
        },
      });

      // Wellness flags (high exertion + low energy)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const wellnessFlags = await prisma.wellnessCheck.count({
        where: {
          studentId: { in: students.map((s) => s.id) },
          checkDate: { gte: fourteenDaysAgo },
          exertionLevel: { gte: 4 },
          energyLevel: "LOW",
        },
      });

      res.json({
        playersUnderCoach: students.length,
        avgAttendance,
        sessionsThisWeek,
        wellnessFlags,
      });
    } catch (error: any) {
      console.error("Error fetching coach analytics summary:", error);
      res.status(500).json({ message: error.message || "Failed to fetch coach analytics" });
    }
  }
);

/**
 * GET /analytics/coach/player-engagement
 * Attendance by player (coach view)
 */
router.get(
  "/coach/player-engagement",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);

      const students = await prisma.student.findMany({
        where: {
          centerId: { in: centerIds },
          status: "ACTIVE",
        },
      });

      const sessions = await prisma.session.findMany({
        where: {
          centerId: { in: centerIds },
          coachId,
        },
        include: { attendance: true },
      });

      const results = await Promise.all(
        students.map(async (student) => {
          const studentSessions = sessions.filter((s) =>
            s.attendance.some((a) => a.studentId === student.id)
          );

          let attended = 0;
          sessions.forEach((session) => {
            const att = session.attendance.find(
              (a) => a.studentId === student.id
            );
            if (att && att.status === "PRESENT") attended++;
          });

          const rate = calculateAttendanceRate(attended, sessions.length);

          return {
            studentId: student.id,
            studentName: student.fullName,
            programType: student.programType,
            sessionsAttended: attended,
            sessionsScheduled: sessions.length,
            attendanceRate: rate,
            label: getAttendanceLabel(rate),
          };
        })
      );

      res.json(results);
    } catch (error: any) {
      console.error("Error fetching player engagement:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player engagement" });
    }
  }
);

/**
 * GET /analytics/coach/feedback-queue
 * Feedback queue based on analytics
 */
router.get(
  "/coach/feedback-queue",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);

      const students = await prisma.student.findMany({
        where: {
          centerId: { in: centerIds },
          status: "ACTIVE",
        },
        include: {
          monthlyFeedbacks: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          attendance: {
            include: {
              session: true,
            },
          },
        },
      });

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const queue = await Promise.all(
        students.map(async (student) => {
          const reasons: string[] = [];

          // Check for no feedback in last 60 days
          const lastFeedback = student.monthlyFeedbacks[0];
          if (
            !lastFeedback ||
            !lastFeedback.publishedAt ||
            new Date(lastFeedback.publishedAt) < sixtyDaysAgo
          ) {
            reasons.push("No feedback in last 60 days");
          }

          // Check attendance
          const sessions = await prisma.session.findMany({
            where: {
              centerId: { in: centerIds },
            },
            include: {
              attendance: {
                where: { studentId: student.id },
              },
            },
          });

          const attended = sessions.filter(
            (s) => s.attendance[0]?.status === "PRESENT"
          ).length;
          const rate = calculateAttendanceRate(attended, sessions.length);

          if (rate < 70) {
            reasons.push(`Attendance ${rate}% (below 70%)`);
          }

          // Check wellness flags
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          const highLoadFlags = await prisma.wellnessCheck.count({
            where: {
              studentId: student.id,
              checkDate: { gte: fourteenDaysAgo },
              exertionLevel: { gte: 4 },
              energyLevel: "LOW",
            },
          });

          if (highLoadFlags >= 3) {
            reasons.push("High load signals detected");
          }

          if (reasons.length === 0) return null;

          return {
            studentId: student.id,
            studentName: student.fullName,
            programType: student.programType,
            reasons,
            primaryReason: reasons[0],
            attendanceRate: rate,
          };
        })
      );

      res.json(queue.filter((item) => item !== null));
    } catch (error: any) {
      console.error("Error fetching feedback queue:", error);
      res.status(500).json({ message: error.message || "Failed to fetch feedback queue" });
    }
  }
);

/**
 * GET /analytics/coach/wellness
 * Training load & wellness
 */
router.get(
  "/coach/wellness",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);

      const students = await prisma.student.findMany({
        where: {
          centerId: { in: centerIds },
          status: "ACTIVE",
        },
      });

      const sessions = await prisma.session.findMany({
        where: {
          centerId: { in: centerIds },
          coachId,
        },
      });

      const sessionIds = sessions.map((s) => s.id);
      const wellnessChecks = await prisma.wellnessCheck.findMany({
        where: {
          sessionId: { in: sessionIds },
          studentId: { in: students.map((s) => s.id) },
        },
        orderBy: { checkDate: "desc" },
      });

      // Group by session
      const sessionData: Record<number, number[]> = {};
      wellnessChecks.forEach((check) => {
        if (check.sessionId) {
          if (!sessionData[check.sessionId]) {
            sessionData[check.sessionId] = [];
          }
          sessionData[check.sessionId].push(check.exertionLevel);
        }
      });

      const avgExertionBySession = Object.entries(sessionData).map(
        ([sessionId, levels]) => ({
          sessionId: Number(sessionId),
          avgExertion:
            levels.reduce((sum, l) => sum + l, 0) / levels.length,
        })
      );

      res.json({
        avgExertionBySession,
        flaggedSessions: wellnessChecks.filter(
          (w) => w.exertionLevel >= 4 && w.energyLevel === "LOW"
        ).length,
      });
    } catch (error: any) {
      console.error("Error fetching wellness analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch wellness analytics" });
    }
  }
);

// ============================================
// PLAYER ANALYTICS
// ============================================

/**
 * GET /analytics/player/summary
 * Player personal overview
 */
router.get(
  "/player/summary",
  authRequired,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const studentId = req.user!.id;

      // Get all sessions student was scheduled for
      const sessions = await prisma.session.findMany({
        where: {
          centerId: (await prisma.student.findUnique({ where: { id: studentId } }))?.centerId,
        },
        include: {
          attendance: {
            where: { studentId },
          },
        },
      });

      const attended = sessions.filter(
        (s) => s.attendance[0]?.status === "PRESENT"
      ).length;
      const rate = calculateAttendanceRate(attended, sessions.length);

      // Sessions attended (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sessionsLast30Days = sessions.filter(
        (s) =>
          new Date(s.sessionDate) >= thirtyDaysAgo &&
          s.attendance[0]?.status === "PRESENT"
      ).length;

      // Matches selected (season - last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const matchesSelected = await prisma.fixturePlayer.count({
        where: {
          studentId,
          selectionStatus: "SELECTED",
          fixture: {
            matchDate: { gte: sixMonthsAgo },
          },
        },
      });

      res.json({
        attendanceRate: rate,
        attendanceLabel: getAttendanceLabel(rate),
        sessionsAttended30Days: sessionsLast30Days,
        matchesSelected,
      });
    } catch (error: any) {
      console.error("Error fetching player analytics summary:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player analytics" });
    }
  }
);

/**
 * GET /analytics/player/attendance
 * Player attendance over time
 */
router.get(
  "/player/attendance",
  authRequired,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const studentId = req.user!.id;
      const student = await prisma.student.findUnique({
        where: { id: studentId },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const sessions = await prisma.session.findMany({
        where: { centerId: student.centerId },
        include: {
          attendance: {
            where: { studentId },
          },
        },
        orderBy: { sessionDate: "asc" },
      });

      // Group by week
      const weekly: Record<string, { scheduled: number; attended: number }> =
        {};

      sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toISOString().split("T")[0];

        if (!weekly[key]) {
          weekly[key] = { scheduled: 0, attended: 0 };
        }

        weekly[key].scheduled += 1;
        if (session.attendance[0]?.status === "PRESENT") {
          weekly[key].attended += 1;
        }
      });

      const data = Object.entries(weekly).map(([week, stats]) => ({
        week,
        scheduled: stats.scheduled,
        attended: stats.attended,
        rate: calculateAttendanceRate(stats.attended, stats.scheduled),
      }));

      // Calculate longest streak
      let longestStreak = 0;
      let currentStreak = 0;
      sessions.forEach((session) => {
        if (session.attendance[0]?.status === "PRESENT") {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });

      res.json({
        weeklyData: data,
        longestStreak,
      });
    } catch (error: any) {
      console.error("Error fetching player attendance:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player attendance" });
    }
  }
);

/**
 * GET /analytics/player/wellness
 * Player wellness over time
 */
router.get(
  "/player/wellness",
  authRequired,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const studentId = req.user!.id;
      const { weeks = "4" } = req.query as { weeks?: string };

      const weeksCount = Number(weeks);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - weeksCount * 7);

      const wellnessChecks = await prisma.wellnessCheck.findMany({
        where: {
          studentId,
          checkDate: { gte: startDate },
        },
        orderBy: { checkDate: "asc" },
      });

      const data = wellnessChecks.map((check) => ({
        date: check.checkDate.toISOString().split("T")[0],
        exertion: check.exertionLevel,
        energy: check.energyLevel,
      }));

      res.json(data);
    } catch (error: any) {
      console.error("Error fetching player wellness:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player wellness" });
    }
  }
);

/**
 * GET /analytics/player/matches
 * Player match exposure
 */
router.get(
  "/player/matches",
  authRequired,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const studentId = req.user!.id;

      const fixtures = await prisma.fixture.findMany({
        include: {
          players: {
            where: { studentId },
          },
        },
        orderBy: { matchDate: "desc" },
      });

      const totalMatches = fixtures.length;
      const selectedMatches = fixtures.filter(
        (f) => f.players[0]?.selectionStatus === "SELECTED"
      ).length;

      const recentMatches = fixtures.slice(0, 10).map((fixture) => ({
        matchDate: fixture.matchDate.toISOString().split("T")[0],
        opponent: fixture.opponent,
        competition: fixture.matchType,
        status: fixture.players[0]?.selectionStatus || "NOT_SELECTED",
        reason: fixture.players[0]?.selectionReason || null,
      }));

      res.json({
        totalMatches,
        selectedMatches,
        exposureRate: totalMatches > 0 ? Math.round((selectedMatches / totalMatches) * 100) : 0,
        recentMatches,
      });
    } catch (error: any) {
      console.error("Error fetching player matches:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player matches" });
    }
  }
);

/**
 * GET /analytics/player/progress
 * Player progress indicators
 */
router.get(
  "/player/progress",
  authRequired,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const studentId = req.user!.id;

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          progressRoadmap: true,
          monthlyFeedbacks: {
            where: { isPublished: true },
            orderBy: { publishedAt: "desc" },
            take: 12,
          },
        },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Calculate attendance vs target (85%)
      const sessions = await prisma.session.findMany({
        where: { centerId: student.centerId },
        include: {
          attendance: {
            where: { studentId },
          },
        },
      });

      const attended = sessions.filter(
        (s) => s.attendance[0]?.status === "PRESENT"
      ).length;
      const attendanceRate = calculateAttendanceRate(attended, sessions.length);
      const attendanceTarget = 85;

      // Feedback frequency
      const feedbackFrequency = student.monthlyFeedbacks.length;

      // Readiness label
      let readinessLabel = "Needs Focus";
      if (
        attendanceRate >= 85 &&
        feedbackFrequency >= 3 &&
        student.progressRoadmap?.coachRecommendation
      ) {
        readinessLabel = "On Track";
      } else if (
        attendanceRate >= 70 &&
        feedbackFrequency >= 1
      ) {
        readinessLabel = "Nearly There";
      }

      res.json({
        currentLevel: student.progressRoadmap?.currentLevel || "Youth League",
        nextLevel: student.progressRoadmap?.nextPotentialLevel,
        attendanceRate,
        attendanceTarget,
        feedbackFrequency,
        readinessLabel,
        requirements: {
          attendance: student.progressRoadmap?.attendanceRequirement,
          physical: student.progressRoadmap?.physicalBenchmark,
          tactical: student.progressRoadmap?.tacticalRequirement,
          coachRecommendation: student.progressRoadmap?.coachRecommendation,
        },
      });
    } catch (error: any) {
      console.error("Error fetching player progress:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player progress" });
    }
  }
);

// ============================================
// CENTRE-WISE ANALYTICS ENDPOINTS
// ============================================

/**
 * GET /analytics/overview
 * Global/club-wide analytics summary
 */
router.get(
  "/overview",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      
      const dateRange = {
        from: from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 6)),
        to: to ? new Date(to) : new Date(),
      };

      // Get all centres
      const centres = await prisma.center.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          shortName: true,
          locality: true,
          city: true,
        },
      });

      // Calculate metrics per centre
      const centreMetrics = await Promise.all(
        centres.map(async (centre) => {
          // Active players
          const activePlayers = await prisma.student.count({
            where: {
              centerId: centre.id,
              status: "ACTIVE",
            },
          });

          // Sessions in period
          const sessions = await prisma.session.count({
            where: {
              centerId: centre.id,
              sessionDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
          });

          // Attendance rate
          const sessionsWithAttendance = await prisma.session.findMany({
            where: {
              centerId: centre.id,
              sessionDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
            include: {
              attendance: true,
            },
          });

          let totalScheduled = 0;
          let totalPresent = 0;
          sessionsWithAttendance.forEach((s) => {
            totalScheduled += s.attendance.length;
            totalPresent += s.attendance.filter((a) => a.status === "PRESENT").length;
          });

          const attendanceRate = totalScheduled > 0
            ? Math.round((totalPresent / totalScheduled) * 100)
            : 0;

          // Revenue
          const payments = await prisma.payment.aggregate({
            where: {
              centerId: centre.id,
              paymentDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
            _sum: { amount: true },
          });

          return {
            centreId: centre.id,
            centreName: centre.name,
            centreShortName: centre.shortName,
            locality: centre.locality,
            city: centre.city,
            activePlayers,
            sessions,
            attendanceRate,
            revenue: payments._sum?.amount || 0,
          };
        })
      );

      // Calculate totals
      const totalActivePlayers = centreMetrics.reduce((sum, m) => sum + m.activePlayers, 0);
      const totalSessions = centreMetrics.reduce((sum, m) => sum + m.sessions, 0);
      const totalRevenue = centreMetrics.reduce((sum, m) => sum + m.revenue, 0);
      const avgAttendance = centreMetrics.length > 0
        ? Math.round(centreMetrics.reduce((sum, m) => sum + m.attendanceRate, 0) / centreMetrics.length)
        : 0;

      res.json({
        totalActivePlayers,
        totalCentres: centres.length,
        avgClubAttendance: avgAttendance,
        monthlyRevenue: totalRevenue,
        centreBreakdown: centreMetrics,
      });
    } catch (error: any) {
      console.error("Error fetching global analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch global analytics" });
    }
  }
);

/**
 * GET /analytics/centres
 * High-level metrics per centre
 */
router.get(
  "/centres",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      
      const dateRange = {
        from: from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 1)),
        to: to ? new Date(to) : new Date(),
      };

      const centres = await prisma.center.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          shortName: true,
          locality: true,
          city: true,
        },
      });

      const results = await Promise.all(
        centres.map(async (centre) => {
          const activePlayers = await prisma.student.count({
            where: {
              centerId: centre.id,
              status: "ACTIVE",
            },
          });

          const sessions = await prisma.session.findMany({
            where: {
              centerId: centre.id,
              sessionDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
            include: {
              attendance: true,
            },
          });

          let totalScheduled = 0;
          let totalPresent = 0;
          sessions.forEach((s) => {
            totalScheduled += s.attendance.length;
            totalPresent += s.attendance.filter((a) => a.status === "PRESENT").length;
          });

          const attendanceRate = totalScheduled > 0
            ? Math.round((totalPresent / totalScheduled) * 100)
            : 0;

          const revenue = await prisma.payment.aggregate({
            where: {
              centerId: centre.id,
              paymentDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
            _sum: { amount: true },
          });

          return {
            centreId: centre.id,
            centreName: centre.name,
            activePlayers,
            attendanceRate,
            sessions: sessions.length,
            revenue: revenue._sum?.amount || 0,
          };
        })
      );

      res.json(results);
    } catch (error: any) {
      console.error("Error fetching centres analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch centres analytics" });
    }
  }
);

/**
 * GET /analytics/centres/:centreId
 * Full analytics for a specific centre
 */
router.get(
  "/centres/:centreId",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const centreId = Number(req.params.centreId);
      const { from, to } = req.query as { from?: string; to?: string };
      
      const dateRange = {
        from: from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 6)),
        to: to ? new Date(to) : new Date(),
      };

      const centre = await prisma.center.findUnique({
        where: { id: centreId },
      });

      if (!centre) {
        return res.status(404).json({ message: "Centre not found" });
      }

      // Import analytics service
      const { calculateCentreMetrics } = await import("../../services/analytics.service");
      const metrics = await calculateCentreMetrics(centreId, dateRange);

      // Get program breakdown
      const students = await prisma.student.findMany({
        where: { centerId: centreId },
        select: {
          id: true,
          fullName: true,
          programType: true,
          status: true,
          monthlyFeeAmount: true,
        },
      });

      const programBreakdown: Record<string, {
        program: string;
        activePlayers: number;
        sessions: number;
        attendanceRate: number;
        revenue: number;
      }> = {};

      students.forEach((student) => {
        const program = student.programType || "Unknown";
        if (!programBreakdown[program]) {
          programBreakdown[program] = {
            program,
            activePlayers: 0,
            sessions: 0,
            attendanceRate: 0,
            revenue: 0,
          };
        }
        if (student.status === "ACTIVE") {
          programBreakdown[program].activePlayers += 1;
        }
      });

      // Get sessions by program
      const sessions = await prisma.session.findMany({
        where: {
          centerId: centreId,
          sessionDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        include: {
          attendance: {
            include: {
              student: true,
            },
          },
        },
      });

      sessions.forEach((session) => {
        session.attendance.forEach((att) => {
          const program = att.student.programType || "Unknown";
          if (programBreakdown[program]) {
            programBreakdown[program].sessions += 1;
          }
        });
      });

      // Calculate attendance by program
      Object.keys(programBreakdown).forEach((program) => {
        const programAttendance = sessions.flatMap((s) =>
          s.attendance.filter((a) => (a.student.programType || "Unknown") === program)
        );
        const present = programAttendance.filter((a) => a.status === "PRESENT").length;
        programBreakdown[program].attendanceRate =
          programAttendance.length > 0 ? Math.round((present / programAttendance.length) * 100) : 0;
      });

      // Get payments by program
      const payments = await prisma.payment.findMany({
        where: {
          centerId: centreId,
          paymentDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        include: {
          student: true,
        },
      });

      payments.forEach((payment) => {
        const program = payment.student?.programType || "Unknown";
        if (programBreakdown[program]) {
          programBreakdown[program].revenue += payment.amount;
        }
      });

      // Get coach load
      const coachLoad = await prisma.session.groupBy({
        by: ["coachId"],
        where: {
          centerId: centreId,
          sessionDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        _count: {
          id: true,
        },
      });

      const coachDetails = await Promise.all(
        coachLoad.map(async (cl) => {
          const coach = await prisma.coach.findUnique({
            where: { id: cl.coachId },
            select: { id: true, fullName: true },
          });
          return {
            coachId: cl.coachId,
            coachName: coach?.fullName || "Unknown",
            sessions: cl._count.id,
          };
        })
      );

      // Get outstanding fees
      const activeStudents = students.filter((s) => s.status === "ACTIVE");
      const expectedMonthly = activeStudents.reduce((sum, s) => sum + s.monthlyFeeAmount, 0);
      const collectedThisMonth = await prisma.payment.aggregate({
        where: {
          centerId: centreId,
          paymentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lte: new Date(),
          },
        },
        _sum: { amount: true },
      });

      const outstandingDues = Math.max(0, expectedMonthly - (collectedThisMonth._sum?.amount || 0));

      // Get trials
      const trials = await (prisma as any).websiteLead?.findMany({
        where: {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
      }) || [];

      const trialConversionRate = trials.length > 0
        ? Math.round((trials.filter((t: any) => t.convertedPlayerId).length / trials.length) * 100)
        : 0;

      res.json({
        centre: {
          id: centre.id,
          name: centre.name,
          shortName: centre.shortName,
          locality: centre.locality,
          city: centre.city,
          isActive: centre.isActive,
        },
        summary: {
          activePlayers: metrics.activePlayers,
          newPlayers: metrics.newPlayers,
          droppedPlayers: metrics.droppedPlayers,
          totalSessions: metrics.totalSessions,
          avgSessionsPerPlayer: metrics.avgSessionsPerPlayer,
          avgAttendanceRate: metrics.avgAttendanceRate,
          totalRevenue: metrics.totalRevenue,
          outstandingDues,
          collectionRate: metrics.collectionRate,
          totalTrials: metrics.totalTrials,
          trialConversionRate,
        },
        programBreakdown: Object.values(programBreakdown),
        coachLoad: coachDetails,
        dateRange: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        },
      });
    } catch (error: any) {
      console.error("Error fetching centre analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch centre analytics" });
    }
  }
);

/**
 * GET /analytics/centres/:centreId/attendance-breakdown
 */
router.get(
  "/centres/:centreId/attendance-breakdown",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const centreId = Number(req.params.centreId);
      const { from, to, groupBy = "week" } = req.query as {
        from?: string;
        to?: string;
        groupBy?: "day" | "week" | "month";
      };

      const dateRange = {
        from: from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 3)),
        to: to ? new Date(to) : new Date(),
      };

      const sessions = await prisma.session.findMany({
        where: {
          centerId: centreId,
          sessionDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        include: {
          attendance: true,
        },
        orderBy: { sessionDate: "asc" },
      });

      const grouped: Record<string, { scheduled: number; present: number }> = {};

      sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        let key: string;

        if (groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!grouped[key]) {
          grouped[key] = { scheduled: 0, present: 0 };
        }

        grouped[key].scheduled += session.attendance.length;
        grouped[key].present += session.attendance.filter((a) => a.status === "PRESENT").length;
      });

      const data = Object.entries(grouped).map(([period, stats]) => ({
        period,
        scheduled: stats.scheduled,
        present: stats.present,
        rate: stats.scheduled > 0 ? Math.round((stats.present / stats.scheduled) * 100) : 0,
      }));

      res.json(data);
    } catch (error: any) {
      console.error("Error fetching attendance breakdown:", error);
      res.status(500).json({ message: error.message || "Failed to fetch attendance breakdown" });
    }
  }
);

/**
 * GET /analytics/centres/:centreId/payments-breakdown
 */
router.get(
  "/centres/:centreId/payments-breakdown",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const centreId = Number(req.params.centreId);
      const { from, to } = req.query as { from?: string; to?: string };

      const dateRange = {
        from: from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 6)),
        to: to ? new Date(to) : new Date(),
      };

      const payments = await prisma.payment.findMany({
        where: {
          centerId: centreId,
          paymentDate: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
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
        orderBy: { paymentDate: "asc" },
      });

      // Group by month
      const monthly: Record<string, { paid: number; pending: number; overdue: number }> = {};

      payments.forEach((payment) => {
        const date = new Date(payment.paymentDate);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthly[key]) {
          monthly[key] = { paid: 0, pending: 0, overdue: 0 };
        }

        // All payments are considered paid since Payment model doesn't have status field
        monthly[key].paid += payment.amount;
      });

      const data = Object.entries(monthly).map(([month, amounts]) => ({
        month,
        paid: amounts.paid,
        pending: amounts.pending,
        overdue: amounts.overdue,
        total: amounts.paid + amounts.pending + amounts.overdue,
      }));

      // Outstanding by player
      const students = await prisma.student.findMany({
        where: {
          centerId: centreId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          fullName: true,
          programType: true,
          monthlyFeeAmount: true,
        },
      });

      const outstandingByPlayer = await Promise.all(
        students.map(async (student) => {
          const paidThisMonth = await prisma.payment.aggregate({
            where: {
              studentId: student.id,
              paymentDate: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lte: new Date(),
              },
              status: "PAID",
            },
            _sum: { amount: true },
          });

          const outstanding = Math.max(0, student.monthlyFeeAmount - (paidThisMonth._sum?.amount || 0));

          return {
            playerId: student.id,
            playerName: student.fullName,
            programType: student.programType,
            monthlyFee: student.monthlyFeeAmount,
            paid: paidThisMonth._sum?.amount || 0,
            outstanding,
          };
        })
      );

      res.json({
        monthlyTrend: data,
        outstandingByPlayer: outstandingByPlayer.filter((p) => p.outstanding > 0),
      });
    } catch (error: any) {
      console.error("Error fetching payments breakdown:", error);
      res.status(500).json({ message: error.message || "Failed to fetch payments breakdown" });
    }
  }
);

/**
 * GET /analytics/centres/:centreId/trials-breakdown
 */
router.get(
  "/centres/:centreId/trials-breakdown",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const centreId = Number(req.params.centreId);
      const { from, to } = req.query as { from?: string; to?: string };

      const dateRange = {
        from: from ? new Date(from) : new Date(new Date().setMonth(new Date().getMonth() - 6)),
        to: to ? new Date(to) : new Date(),
      };

      const leads = await (prisma as any).websiteLead?.findMany({
        where: {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        },
        orderBy: { createdAt: "desc" },
      }) || [];

      const totalTrials = leads.length;
      const attended = leads.filter((l: any) => l.status === "ATTENDED").length;
      const noShow = leads.filter((l: any) => l.status === "NO_SHOW").length;
      const converted = leads.filter((l: any) => l.convertedPlayerId !== null).length;

      const conversionRate = totalTrials > 0 ? Math.round((converted / totalTrials) * 100) : 0;

      res.json({
        totalTrials,
        attended,
        noShow,
        converted,
        conversionRate,
        trials: leads.map((lead: any) => ({
          id: lead.id,
          name: lead.playerName,
          contact: lead.phone || lead.email,
          program: lead.programmeInterest,
          status: lead.status,
          converted: lead.convertedPlayerId !== null,
          date: lead.createdAt,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching trials breakdown:", error);
      res.status(500).json({ message: error.message || "Failed to fetch trials breakdown" });
    }
  }
);

export default router;


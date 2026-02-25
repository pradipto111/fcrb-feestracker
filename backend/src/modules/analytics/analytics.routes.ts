import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

// Default date ranges to avoid unbounded full-table scans
const DEFAULT_ATTENDANCE_DAYS = 365;
const DEFAULT_SESSIONS_DAYS = 90;
const DEFAULT_FINANCE_MONTHS = 12;
const MAX_SESSIONS_TAKE = 500;
const MAX_FIXTURES_TAKE = 500;
const MAX_PAYMENTS_TAKE = 5000;

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
      const { centerId, startDate, endDate, includeInactive } = req.query as {
        centerId?: string;
        startDate?: string;
        endDate?: string;
        includeInactive?: string;
      };

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);

      // Use same logic as dashboard/summary: default to including inactive for ADMIN
      const shouldIncludeInactive = includeInactive !== undefined 
        ? includeInactive === "true" 
        : true;

      const studentFilter: any = {};
      if (!shouldIncludeInactive) {
        studentFilter.status = "ACTIVE";
      }
      if (centerId) studentFilter.centerId = Number(centerId);

      // Total Students (all or active based on includeInactive)
      const totalStudents = await prisma.student.count({
        where: studentFilter,
      });

      // Total Active Players (always count only active)
      const activeStudentFilter: any = { status: "ACTIVE" };
      if (centerId) activeStudentFilter.centerId = Number(centerId);
      const totalActivePlayers = await prisma.student.count({
        where: activeStudentFilter,
      });

      // Average Attendance % - Use aggregation instead of fetching all records
      // Limit to last 90 days to avoid loading too much data
      const attendanceDateFilter = dateFilter.gte || dateFilter.lte 
        ? dateFilter 
        : { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }; // Last 90 days default
      
      const attendanceWhere: any = {
        session: {
          sessionDate: attendanceDateFilter,
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
      };

      // Use aggregation for better performance
      const totalScheduled = await prisma.attendance.count({
        where: attendanceWhere,
      });

      const totalAttended = await prisma.attendance.count({
        where: {
          ...attendanceWhere,
          status: "PRESENT",
        },
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

      // Fee Collection % (This Month) - use aggregate instead of loading all students
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const expectedFeesAgg = await prisma.student.aggregate({
        where: studentFilter,
        _sum: { monthlyFeeAmount: true },
      });
      const expectedFees = expectedFeesAgg._sum?.monthlyFeeAmount ?? 0;

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

      // Wellness Average (Last 14 Days) - use aggregate instead of loading all rows
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const wellnessAgg = await prisma.wellnessCheck.aggregate({
        where: { checkDate: { gte: fourteenDaysAgo } },
        _avg: { exertionLevel: true },
        _count: true,
      });

      const avgWellness =
        wellnessAgg._count > 0 && wellnessAgg._avg?.exertionLevel != null
          ? Math.round(wellnessAgg._avg.exertionLevel)
          : 0;

      res.json({
        totalStudents, // Total students (includes inactive if includeInactive=true)
        totalActivePlayers, // Always only active students
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
 * Attendance analytics over time (bounded by date range, uses aggregations)
 */
router.get(
  "/admin/attendance",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { centerId, groupBy = "week", days } = req.query as {
        centerId?: string;
        groupBy?: "week" | "month";
        days?: string;
      };

      const daysBack = Math.min(Number(days) || DEFAULT_ATTENDANCE_DAYS, 730);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const sessionWhere = {
        sessionDate: { gte: startDate },
        ...(centerId ? { centerId: Number(centerId) } : {}),
      };

      // Lightweight: only session id + date for grouping
      const sessions = await prisma.session.findMany({
        where: sessionWhere,
        select: { id: true, sessionDate: true },
        orderBy: { sessionDate: "asc" },
      });

      const sessionIds = sessions.map((s) => s.id);
      if (sessionIds.length === 0) {
        return res.json([]);
      }

      // Aggregated counts per session (no loading full attendance rows)
      const [scheduledBySession, presentBySession] = await Promise.all([
        prisma.attendance.groupBy({
          by: ["sessionId"],
          where: { sessionId: { in: sessionIds } },
          _count: { id: true },
        }),
        prisma.attendance.groupBy({
          by: ["sessionId"],
          where: { sessionId: { in: sessionIds }, status: "PRESENT" },
          _count: { id: true },
        }),
      ]);

      const scheduledMap = Object.fromEntries(scheduledBySession.map((r) => [r.sessionId, r._count.id]));
      const presentMap = Object.fromEntries(presentBySession.map((r) => [r.sessionId, r._count.id]));

      const grouped: Record<string, { scheduled: number; attended: number }> = {};
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
        if (!grouped[key]) grouped[key] = { scheduled: 0, attended: 0 };
        grouped[key].scheduled += scheduledMap[session.id] ?? 0;
        grouped[key].attended += presentMap[session.id] ?? 0;
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
 * Uses count aggregations per centre (no loading all sessions/attendance)
 */
router.get(
  "/admin/attendance-by-centre",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { days } = req.query as { days?: string };
      const daysBack = Math.min(Number(days) || DEFAULT_ATTENDANCE_DAYS, 730);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const centers = await prisma.center.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      });

      const results = await Promise.all(
        centers.map(async (center) => {
          const [scheduled, attended] = await Promise.all([
            prisma.attendance.count({
              where: {
                session: {
                  centerId: center.id,
                  sessionDate: { gte: startDate },
                },
              },
            }),
            prisma.attendance.count({
              where: {
                session: {
                  centerId: center.id,
                  sessionDate: { gte: startDate },
                },
                status: "PRESENT",
              },
            }),
          ]);

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
 * Player pipeline & retention (uses groupBy + count, no full student load)
 */
router.get(
  "/admin/pipeline",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const [totalActive, roadmapLevels] = await Promise.all([
        prisma.student.count({ where: { status: "ACTIVE" } }),
        prisma.progressRoadmap.groupBy({
          by: ["currentLevel"],
          where: { student: { status: "ACTIVE" } },
          _count: { currentLevel: true },
        }),
      ]);

      const pipeline: Record<string, number> = {};
      roadmapLevels.forEach((r) => {
        pipeline[r.currentLevel] = r._count.currentLevel;
      });

      // Students without a roadmap (optional: count and add to "Youth League")
      const withRoadmap = roadmapLevels.reduce((s, r) => s + r._count.currentLevel, 0);
      if (withRoadmap < totalActive) {
        const noRoadmap = totalActive - withRoadmap;
        pipeline["Youth League"] = (pipeline["Youth League"] ?? 0) + noRoadmap;
      }

      res.json({
        pipeline,
        totalActive,
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
      const { months = String(DEFAULT_FINANCE_MONTHS) } = req.query as { months?: string };
      const monthsCount = Math.min(Number(months) || DEFAULT_FINANCE_MONTHS, 24);

      const now = new Date();
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - monthsCount);

      // Monthly trend via raw aggregation (no loading all payment rows)
      const monthlyRows = await prisma.$queryRaw<{ month: Date; amount: bigint }[]>`
        SELECT date_trunc('month', "paymentDate")::date AS month, SUM(amount)::bigint AS amount
        FROM "Payment"
        WHERE "paymentDate" >= ${startDate}
        GROUP BY date_trunc('month', "paymentDate")
        ORDER BY month ASC
      `;
      const data = monthlyRows.map((row) => ({
        month: `${new Date(row.month).getFullYear()}-${String(new Date(row.month).getMonth() + 1).padStart(2, "0")}`,
        amount: Number(row.amount),
      }));

      const [expectedAgg, collectedThisMonth] = await Promise.all([
        prisma.student.aggregate({
          where: { status: "ACTIVE" },
          _sum: { monthlyFeeAmount: true },
        }),
        prisma.payment.aggregate({
          where: {
            paymentDate: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
      ]);

      const expectedMonthly = expectedAgg._sum?.monthlyFeeAmount ?? 0;
      const collected = collectedThisMonth._sum?.amount ?? 0;

      res.json({
        monthlyTrend: data,
        expectedMonthly,
        collectedThisMonth: collected,
        outstanding: Math.max(0, expectedMonthly - collected),
      });
    } catch (error: any) {
      console.error("Error fetching finance analytics:", error);
      res.status(500).json({ message: error.message || "Failed to fetch finance analytics" });
    }
  }
);

/**
 * GET /analytics/admin/sessions
 * Session & load analytics (date-bounded, limited take)
 */
router.get(
  "/admin/sessions",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const { centerId, days } = req.query as { centerId?: string; days?: string };
      const daysBack = Math.min(Number(days) || DEFAULT_SESSIONS_DAYS, 365);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const sessions = await prisma.session.findMany({
        where: {
          sessionDate: { gte: startDate },
          ...(centerId ? { centerId: Number(centerId) } : {}),
        },
        include: {
          center: true,
        },
        orderBy: { sessionDate: "desc" },
        take: MAX_SESSIONS_TAKE,
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
 * Match & selection analytics (date-bounded, aggregations)
 */
router.get(
  "/admin/matches",
  authRequired,
  requireRole("ADMIN"),
  async (req, res) => {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [byCompetitionRows, selectedCounts, allPlayersInPeriod] = await Promise.all([
        prisma.fixture.groupBy({
          by: ["matchType"],
          where: { matchDate: { gte: sixMonthsAgo } },
          _count: { id: true },
        }),
        prisma.fixturePlayer.groupBy({
          by: ["studentId"],
          where: {
            selectionStatus: "SELECTED",
            fixture: { matchDate: { gte: sixMonthsAgo } },
          },
          _count: { id: true },
        }),
        prisma.fixturePlayer.groupBy({
          by: ["studentId"],
          where: { fixture: { matchDate: { gte: sixMonthsAgo } } },
        }),
      ]);

      const byCompetition: Record<string, number> = {};
      byCompetitionRows.forEach((r) => {
        byCompetition[r.matchType || "Other"] = r._count.id;
      });

      const selectedMap = Object.fromEntries(selectedCounts.map((r) => [r.studentId, r._count.id]));
      const participationDistribution = { "0": 0, "1-5": 0, "6-10": 0, "10+": 0 };
      allPlayersInPeriod.forEach((r) => {
        const count = selectedMap[r.studentId] ?? 0;
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
 * Coach overview KPIs (uses counts/aggregations, date-bounded)
 */
router.get(
  "/coach/summary",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);
      const daysBack = DEFAULT_ATTENDANCE_DAYS;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      const [playersUnderCoach, totalScheduled, totalAttended, sessionsThisWeek, wellnessFlags] = await Promise.all([
        prisma.student.count({
          where: { centerId: { in: centerIds }, status: "ACTIVE" },
        }),
        prisma.attendance.count({
          where: {
            session: {
              centerId: { in: centerIds },
              coachId,
              sessionDate: { gte: startDate },
            },
          },
        }),
        prisma.attendance.count({
          where: {
            session: {
              centerId: { in: centerIds },
              coachId,
              sessionDate: { gte: startDate },
            },
            status: "PRESENT",
          },
        }),
        (() => {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          return prisma.session.count({
            where: {
              centerId: { in: centerIds },
              coachId,
              sessionDate: { gte: weekStart },
            },
          });
        })(),
        (() => {
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          return prisma.wellnessCheck.count({
            where: {
              student: { centerId: { in: centerIds }, status: "ACTIVE" },
              checkDate: { gte: fourteenDaysAgo },
              exertionLevel: { gte: 4 },
              energyLevel: "LOW",
            },
          });
        })(),
      ]);

      const avgAttendance = calculateAttendanceRate(totalAttended, totalScheduled);

      res.json({
        playersUnderCoach,
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
 * Attendance by player (coach view) - uses aggregations, date-bounded
 */
router.get(
  "/coach/player-engagement",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - DEFAULT_ATTENDANCE_DAYS);

      const sessionIds = await prisma.session.findMany({
        where: {
          centerId: { in: centerIds },
          coachId,
          sessionDate: { gte: startDate },
        },
        select: { id: true },
      }).then((rows) => rows.map((r) => r.id));

      if (sessionIds.length === 0) {
        const students = await prisma.student.findMany({
          where: { centerId: { in: centerIds }, status: "ACTIVE" },
          select: { id: true, fullName: true, programType: true },
        });
        return res.json(students.map((s) => ({
          studentId: s.id,
          studentName: s.fullName,
          programType: s.programType,
          sessionsAttended: 0,
          sessionsScheduled: 0,
          attendanceRate: 0,
          label: getAttendanceLabel(0),
        })));
      }

      const [students, scheduledByStudent, presentByStudent] = await Promise.all([
        prisma.student.findMany({
          where: { centerId: { in: centerIds }, status: "ACTIVE" },
          select: { id: true, fullName: true, programType: true },
        }),
        prisma.attendance.groupBy({
          by: ["studentId"],
          where: { sessionId: { in: sessionIds } },
          _count: { id: true },
        }),
        prisma.attendance.groupBy({
          by: ["studentId"],
          where: { sessionId: { in: sessionIds }, status: "PRESENT" },
          _count: { id: true },
        }),
      ]);

      const scheduledMap = Object.fromEntries(scheduledByStudent.map((r) => [r.studentId, r._count.id]));
      const presentMap = Object.fromEntries(presentByStudent.map((r) => [r.studentId, r._count.id]));
      const sessionCount = sessionIds.length;

      const results = students.map((student) => {
        const attended = presentMap[student.id] ?? 0;
        const scheduled = scheduledMap[student.id] ?? 0;
        const rate = calculateAttendanceRate(attended, sessionCount);
        return {
          studentId: student.id,
          studentName: student.fullName,
          programType: student.programType,
          sessionsAttended: attended,
          sessionsScheduled: sessionCount,
          attendanceRate: rate,
          label: getAttendanceLabel(rate),
        };
      });

      res.json(results);
    } catch (error: any) {
      console.error("Error fetching player engagement:", error);
      res.status(500).json({ message: error.message || "Failed to fetch player engagement" });
    }
  }
);

/**
 * GET /analytics/coach/feedback-queue
 * Feedback queue (date-bounded, uses counts/aggregations)
 */
router.get(
  "/coach/feedback-queue",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const students = await prisma.student.findMany({
        where: { centerId: { in: centerIds }, status: "ACTIVE" },
        select: {
          id: true,
          fullName: true,
          programType: true,
          monthlyFeedbacks: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { publishedAt: true },
          },
        },
      });

      const studentIds = students.map((s) => s.id);
      const sessionIds = await prisma.session.findMany({
        where: { centerId: { in: centerIds }, sessionDate: { gte: sixtyDaysAgo } },
        select: { id: true },
      }).then((rows) => rows.map((r) => r.id));

      const [presentByStudent, wellnessFlagsByStudent] = await Promise.all([
        sessionIds.length > 0
          ? prisma.attendance.groupBy({
              by: ["studentId"],
              where: {
                sessionId: { in: sessionIds },
                studentId: { in: studentIds },
                status: "PRESENT",
              },
              _count: { id: true },
            })
          : [],
        prisma.wellnessCheck.groupBy({
          by: ["studentId"],
          where: {
            studentId: { in: studentIds },
            checkDate: { gte: fourteenDaysAgo },
            exertionLevel: { gte: 4 },
            energyLevel: "LOW",
          },
          _count: { id: true },
        }),
      ]);

      const presentMap = Object.fromEntries(presentByStudent.map((r) => [r.studentId, r._count.id]));
      const wellnessMap = Object.fromEntries(wellnessFlagsByStudent.map((r) => [r.studentId, r._count.id]));
      const sessionCount = sessionIds.length;

      const queue = students
        .map((student) => {
          const reasons: string[] = [];
          const lastFeedback = student.monthlyFeedbacks[0];
          if (
            !lastFeedback?.publishedAt ||
            new Date(lastFeedback.publishedAt) < sixtyDaysAgo
          ) {
            reasons.push("No feedback in last 60 days");
          }

          const attended = presentMap[student.id] ?? 0;
          const rate = calculateAttendanceRate(attended, sessionCount);
          if (rate < 70 && sessionCount > 0) {
            reasons.push(`Attendance ${rate}% (below 70%)`);
          }

          if ((wellnessMap[student.id] ?? 0) >= 3) {
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
        .filter((item): item is NonNullable<typeof item> => item !== null);

      res.json(queue);
    } catch (error: any) {
      console.error("Error fetching feedback queue:", error);
      res.status(500).json({ message: error.message || "Failed to fetch feedback queue" });
    }
  }
);

/**
 * GET /analytics/coach/wellness
 * Training load & wellness (date-bounded, uses groupBy)
 */
router.get(
  "/coach/wellness",
  authRequired,
  requireRole("COACH"),
  async (req, res) => {
    try {
      const coachId = req.user!.id;
      const centerIds = await getCoachCenterIds(coachId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - DEFAULT_SESSIONS_DAYS);

      const sessionIds = await prisma.session.findMany({
        where: {
          centerId: { in: centerIds },
          coachId,
          sessionDate: { gte: startDate },
        },
        select: { id: true },
      }).then((rows) => rows.map((r) => r.id));

      if (sessionIds.length === 0) {
        return res.json({ avgExertionBySession: [], flaggedSessions: 0 });
      }

      const [avgBySession, flaggedSessions] = await Promise.all([
        prisma.wellnessCheck.groupBy({
          by: ["sessionId"],
          where: {
            sessionId: { in: sessionIds },
          },
          _avg: { exertionLevel: true },
          _count: true,
        }),
        prisma.wellnessCheck.count({
          where: {
            sessionId: { in: sessionIds },
            exertionLevel: { gte: 4 },
            energyLevel: "LOW",
          },
        }),
      ]);

      const avgExertionBySession = avgBySession
        .filter((r) => r.sessionId != null && r._avg?.exertionLevel != null)
        .map((r) => ({
          sessionId: r.sessionId!,
          avgExertion: Math.round((r._avg!.exertionLevel ?? 0) * 10) / 10,
        }));

      res.json({
        avgExertionBySession,
        flaggedSessions,
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
 * Player personal overview (uses counts, date-bounded)
 */
router.get(
  "/player/summary",
  authRequired,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const studentId = req.user!.id;
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { centerId: true },
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - DEFAULT_ATTENDANCE_DAYS);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [totalScheduled, totalAttended, attendedLast30Days, matchesSelected] = await Promise.all([
        prisma.attendance.count({
          where: {
            studentId,
            session: { centerId: student.centerId, sessionDate: { gte: startDate } },
          },
        }),
        prisma.attendance.count({
          where: {
            studentId,
            status: "PRESENT",
            session: { centerId: student.centerId, sessionDate: { gte: startDate } },
          },
        }),
        prisma.attendance.count({
          where: {
            studentId,
            status: "PRESENT",
            session: { centerId: student.centerId, sessionDate: { gte: thirtyDaysAgo } },
          },
        }),
        prisma.fixturePlayer.count({
          where: {
            studentId,
            selectionStatus: "SELECTED",
            fixture: { matchDate: { gte: sixMonthsAgo } },
          },
        }),
      ]);

      const rate = calculateAttendanceRate(totalAttended, totalScheduled);

      res.json({
        attendanceRate: rate,
        attendanceLabel: getAttendanceLabel(rate),
        sessionsAttended30Days: attendedLast30Days,
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
 * Player attendance over time (date-bounded, minimal session load for streak)
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
        select: { centerId: true },
      });

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - DEFAULT_ATTENDANCE_DAYS);

      const sessions = await prisma.session.findMany({
        where: {
          centerId: student.centerId,
          sessionDate: { gte: startDate },
        },
        select: {
          id: true,
          sessionDate: true,
          attendance: {
            where: { studentId },
            select: { status: true },
          },
        },
        orderBy: { sessionDate: "asc" },
      });

      const weekly: Record<string, { scheduled: number; attended: number }> = {};
      sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toISOString().split("T")[0];
        if (!weekly[key]) weekly[key] = { scheduled: 0, attended: 0 };
        weekly[key].scheduled += 1;
        if (session.attendance[0]?.status === "PRESENT") weekly[key].attended += 1;
      });

      const data = Object.entries(weekly).map(([week, stats]) => ({
        week,
        scheduled: stats.scheduled,
        attended: stats.attended,
        rate: calculateAttendanceRate(stats.attended, stats.scheduled),
      }));

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
        select: { checkDate: true, exertionLevel: true, energyLevel: true },
        orderBy: { checkDate: "asc" },
        take: 200,
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
 * Player match exposure (date-bounded, limited take)
 */
router.get(
  "/player/matches",
  authRequired,
  requireRole("STUDENT"),
  async (req, res) => {
    try {
      const studentId = req.user!.id;
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [totalMatches, selectedMatches, recentFixtures] = await Promise.all([
        prisma.fixturePlayer.count({
          where: {
            studentId,
            fixture: { matchDate: { gte: sixMonthsAgo } },
          },
        }),
        prisma.fixturePlayer.count({
          where: {
            studentId,
            selectionStatus: "SELECTED",
            fixture: { matchDate: { gte: sixMonthsAgo } },
          },
        }),
        prisma.fixture.findMany({
          where: { matchDate: { gte: sixMonthsAgo } },
          include: {
            players: {
              where: { studentId },
              select: { selectionStatus: true, selectionReason: true },
            },
          },
          orderBy: { matchDate: "desc" },
          take: 10,
        }),
      ]);

      const recentMatches = recentFixtures.map((fixture) => ({
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

      // Attendance vs target (85%) - date-bounded counts
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - DEFAULT_ATTENDANCE_DAYS);
      const [scheduled, attended] = await Promise.all([
        prisma.attendance.count({
          where: {
            studentId,
            session: { centerId: student.centerId, sessionDate: { gte: startDate } },
          },
        }),
        prisma.attendance.count({
          where: {
            studentId,
            status: "PRESENT",
            session: { centerId: student.centerId, sessionDate: { gte: startDate } },
          },
        }),
      ]);
      const attendanceRate = calculateAttendanceRate(attended, scheduled);
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

          // Attendance rate - Use aggregation instead of fetching all records
          const sessionIds = await prisma.session.findMany({
            where: {
              centerId: centre.id,
              sessionDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
            select: { id: true },
            take: 1000, // Limit to prevent excessive queries
          });

          const sessionIdList = sessionIds.map(s => s.id);
          
          const totalScheduled = sessionIdList.length > 0 
            ? await prisma.attendance.count({
                where: {
                  sessionId: { in: sessionIdList },
                },
              })
            : 0;

          const totalPresent = sessionIdList.length > 0
            ? await prisma.attendance.count({
                where: {
                  sessionId: { in: sessionIdList },
                  status: "PRESENT",
                },
              })
            : 0;

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

          // Optimize: Only get session IDs first, then count attendance
          const sessionIds = await prisma.session.findMany({
            where: {
              centerId: centre.id,
              sessionDate: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            },
            select: { id: true },
            take: 1000, // Limit to prevent excessive queries
          });

          const sessionIdList = sessionIds.map(s => s.id);
          
          const totalScheduled = sessionIdList.length > 0
            ? await prisma.attendance.count({
                where: {
                  sessionId: { in: sessionIdList },
                },
              })
            : 0;

          const totalPresent = sessionIdList.length > 0
            ? await prisma.attendance.count({
                where: {
                  sessionId: { in: sessionIdList },
                  status: "PRESENT",
                },
              })
            : 0;

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
            sessions: sessionIds.length,
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

      // Program breakdown: use groupBy/counts instead of loading all students/sessions/attendance
      const [programCounts, sessionIds, revenueByProgram] = await Promise.all([
        prisma.student.groupBy({
          by: ["programType"],
          where: { centerId: centreId },
          _count: { id: true },
        }),
        prisma.session.findMany({
          where: {
            centerId: centreId,
            sessionDate: { gte: dateRange.from, lte: dateRange.to },
          },
          select: { id: true },
          take: MAX_SESSIONS_TAKE,
        }).then((rows) => rows.map((r) => r.id)),
        prisma.$queryRaw<{ program_type: string | null; revenue: bigint }[]>`
          SELECT s."programType" AS program_type, SUM(p.amount)::bigint AS revenue
          FROM "Payment" p
          INNER JOIN "Student" s ON p."studentId" = s.id
          WHERE p."centerId" = ${centreId}
            AND p."paymentDate" >= ${dateRange.from}
            AND p."paymentDate" <= ${dateRange.to}
          GROUP BY s."programType"
        `,
      ]);

      const programBreakdown: Record<string, { program: string; activePlayers: number; sessions: number; attendanceRate: number; revenue: number }> = {};
      programCounts.forEach((r) => {
        const program = r.programType || "Unknown";
        programBreakdown[program] = {
          program,
          activePlayers: r._count.id,
          sessions: 0,
          attendanceRate: 0,
          revenue: 0,
        };
      });
      revenueByProgram.forEach((r) => {
        const program = r.program_type ?? "Unknown";
        if (!programBreakdown[program]) programBreakdown[program] = { program, activePlayers: 0, sessions: 0, attendanceRate: 0, revenue: 0 };
        programBreakdown[program].revenue = Number(r.revenue);
      });

      if (sessionIds.length > 0) {
        const attendanceRows = await prisma.attendance.findMany({
          where: { sessionId: { in: sessionIds } },
          select: { status: true, student: { select: { programType: true } } },
          take: 5000,
        });
        const programScheduled: Record<string, number> = {};
        const programPresent: Record<string, number> = {};
        attendanceRows.forEach((att) => {
          const program = att.student?.programType || "Unknown";
          programScheduled[program] = (programScheduled[program] ?? 0) + 1;
          if (att.status === "PRESENT") programPresent[program] = (programPresent[program] ?? 0) + 1;
        });
        Object.keys(programBreakdown).forEach((program) => {
          const scheduled = programScheduled[program] ?? 0;
          const present = programPresent[program] ?? 0;
          programBreakdown[program].sessions = scheduled;
          programBreakdown[program].attendanceRate = scheduled > 0 ? Math.round((present / scheduled) * 100) : 0;
        });
      }

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

      // Get outstanding fees (aggregate)
      const [expectedAgg, collectedThisMonth] = await Promise.all([
        prisma.student.aggregate({
          where: { centerId: centreId, status: "ACTIVE" },
          _sum: { monthlyFeeAmount: true },
        }),
        prisma.payment.aggregate({
          where: {
            centerId: centreId,
            paymentDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              lte: new Date(),
            },
          },
          _sum: { amount: true },
        }),
      ]);
      const expectedMonthly = expectedAgg._sum?.monthlyFeeAmount ?? 0;
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
          sessionDate: { gte: dateRange.from, lte: dateRange.to },
        },
        select: { id: true, sessionDate: true },
        orderBy: { sessionDate: "asc" },
      });

      const sessionIds = sessions.map((s) => s.id);
      if (sessionIds.length === 0) {
        return res.json([]);
      }

      const [scheduledBySession, presentBySession] = await Promise.all([
        prisma.attendance.groupBy({
          by: ["sessionId"],
          where: { sessionId: { in: sessionIds } },
          _count: { id: true },
        }),
        prisma.attendance.groupBy({
          by: ["sessionId"],
          where: { sessionId: { in: sessionIds }, status: "PRESENT" },
          _count: { id: true },
        }),
      ]);

      const scheduledMap = Object.fromEntries(scheduledBySession.map((r) => [r.sessionId, r._count.id]));
      const presentMap = Object.fromEntries(presentBySession.map((r) => [r.sessionId, r._count.id]));
      const grouped: Record<string, { scheduled: number; present: number }> = {};

      sessions.forEach((session) => {
        const date = new Date(session.sessionDate);
        let key: string;
        if (groupBy === "day") key = date.toISOString().split("T")[0];
        else if (groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!grouped[key]) grouped[key] = { scheduled: 0, present: 0 };
        grouped[key].scheduled += scheduledMap[session.id] ?? 0;
        grouped[key].present += presentMap[session.id] ?? 0;
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

      // Monthly trend via raw aggregation (no full payment load)
      const monthlyRows = await prisma.$queryRaw<{ month: Date; paid: bigint }[]>`
        SELECT date_trunc('month', "paymentDate")::date AS month, SUM(amount)::bigint AS paid
        FROM "Payment"
        WHERE "centerId" = ${centreId}
          AND "paymentDate" >= ${dateRange.from}
          AND "paymentDate" <= ${dateRange.to}
        GROUP BY date_trunc('month', "paymentDate")
        ORDER BY month ASC
      `;
      const data = monthlyRows.map((row) => {
        const paid = Number(row.paid);
        return {
          month: `${new Date(row.month).getFullYear()}-${String(new Date(row.month).getMonth() + 1).padStart(2, "0")}`,
          paid,
          pending: 0,
          overdue: 0,
          total: paid,
        };
      });

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthEnd = new Date();
      const [students, paymentsThisMonth] = await Promise.all([
        prisma.student.findMany({
          where: { centerId: centreId, status: "ACTIVE" },
          select: { id: true, fullName: true, programType: true, monthlyFeeAmount: true },
        }),
        prisma.payment.findMany({
          where: {
            centerId: centreId,
            paymentDate: { gte: monthStart, lte: monthEnd },
          },
          select: { studentId: true, amount: true },
        }),
      ]);

      const paidByStudent: Record<number, number> = {};
      paymentsThisMonth.forEach((p) => {
        paidByStudent[p.studentId] = (paidByStudent[p.studentId] ?? 0) + p.amount;
      });

      const outstandingByPlayer = students.map((student) => {
        const paid = paidByStudent[student.id] ?? 0;
        const outstanding = Math.max(0, student.monthlyFeeAmount - paid);
        return {
          playerId: student.id,
          playerName: student.fullName,
          programType: student.programType,
          monthlyFee: student.monthlyFeeAmount,
          paid,
          outstanding,
        };
      });

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
        take: 500,
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


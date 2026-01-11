import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /student/dashboard
 * Get student's own dashboard data
 */
router.get("/dashboard", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { center: true }
  });

  if (!student) return res.status(404).json({ message: "Student not found" });

  // Wallet-based payment system
  const payments = await prisma.payment.findMany({
    where: { studentId: id },
    orderBy: { paymentDate: "desc" }
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Calculate fees accrued so far
  let feesAccrued = 0;
  if (student.joiningDate) {
    const now = getSystemDate();
    const joining = new Date(student.joiningDate);
    const paymentFrequency = student.paymentFrequency || 1;
    const feePerCycle = student.monthlyFeeAmount * paymentFrequency;
    
    // Calculate months since joining (including current month)
    // Fee is due at the START of each cycle, not at the end
    const monthsElapsed = Math.max(
      1, // At least 1 month (the joining month itself incurs fees)
      (now.getFullYear() - joining.getFullYear()) * 12 + 
      (now.getMonth() - joining.getMonth()) + 1 // +1 to include current month
    );
    
    // Calculate payment cycles that have passed (including current cycle)
    const cyclesAccrued = Math.ceil(monthsElapsed / paymentFrequency);
    
    // Fees accrued for all cycles up to now (including current cycle)
    feesAccrued = cyclesAccrued * feePerCycle;
  }
  
  // Wallet balance = total paid - fees accrued
  const walletBalance = totalPaid - feesAccrued;
  const outstanding = walletBalance < 0 ? Math.abs(walletBalance) : 0;
  const creditBalance = walletBalance > 0 ? walletBalance : 0;

  res.json({
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth,
      programType: student.programType,
      monthlyFeeAmount: student.monthlyFeeAmount,
      paymentFrequency: student.paymentFrequency,
      status: student.status,
      joiningDate: student.joiningDate,
      walletBalance,
      center: student.center
    },
    payments,
    summary: {
      totalPaid,
      walletBalance,
      creditBalance,
      outstanding,
      feesAccrued,
      paymentCount: payments.length,
      lastPaymentDate: payments[0]?.paymentDate || null
    }
  });
});

/**
 * GET /student/profile
 * Get student's own profile
 */
router.get("/profile", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { center: true }
  });

  if (!student) return res.status(404).json({ message: "Student not found" });

  // Don't send password hash
  const { passwordHash, ...studentData } = student;

  res.json(studentData);
});

/**
 * GET /student/timeline
 * Get student's development timeline
 */
router.get("/timeline", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { center: true }
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

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

    // 2. Get attendance data for milestones
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: id, status: "PRESENT" },
      include: { session: { include: { center: true } } },
      orderBy: { session: { sessionDate: "asc" } },
    });

    // Calculate attendance milestones
    if (attendanceRecords.length > 0) {
      const totalSessions = await prisma.attendance.count({
        where: { studentId: id },
      });
      const attendanceRate = totalSessions > 0 ? (attendanceRecords.length / totalSessions) * 100 : 0;

      // 90% attendance milestone (if achieved)
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

      // 50 sessions milestone
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

      // 100 sessions milestone
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
      where: { studentId: id },
      include: {
        fixture: {
          include: { center: true },
        },
      },
      orderBy: { fixture: { matchDate: "asc" } },
    });

    // First match appearance
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

    // League participation milestones
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

    // 4. Get badges earned
    const badges = await prisma.badge.findMany({
      where: { studentStats: { studentId: id } },
      include: { studentStats: true },
      orderBy: { earnedAt: "asc" },
    });

    badges.forEach((badge) => {
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

    // 5. Get student stats for performance milestones
    const studentStats = await prisma.studentStats.findMany({
      where: { studentId: id },
      orderBy: { updatedAt: "desc" },
    });

    studentStats.forEach((stat) => {
      // First vote milestone
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

    // 6. Payment milestones (first payment, consistent payments)
    const payments = await prisma.payment.findMany({
      where: { studentId: id },
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

      // 6 months of consistent payments
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

    // 7. Get manually created timeline events
    try {
      const manualEvents = await (prisma as any).timelineEvent?.findMany({
        where: { studentId: id },
        orderBy: { eventDate: "asc" },
      });

      if (manualEvents && manualEvents.length > 0) {
        manualEvents.forEach((event: any) => {
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
          });
        });
      }
    } catch (error) {
      // TimelineEvent model might not exist yet, ignore
      console.log("TimelineEvent model not available yet");
    }

    // Sort events by date (oldest first)
    events.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

    res.json({ events });
  } catch (error: any) {
    console.error("Error fetching timeline:", error);
    res.status(500).json({ message: error.message || "Failed to fetch timeline" });
  }
});

export default router;


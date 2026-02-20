import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";
import bcrypt from "bcryptjs";

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
    
    // If student is churned, only calculate fees up to churn date
    const endDate = student.churnedDate ? new Date(student.churnedDate) : now;
    
    // Calculate months since joining up to churn date (or current date)
    // Fee is due at the START of each cycle, not at the end
    const monthsElapsed = Math.max(
      1, // At least 1 month (the joining month itself incurs fees)
      (endDate.getFullYear() - joining.getFullYear()) * 12 + 
      (endDate.getMonth() - joining.getMonth()) + 1 // +1 to include the churn month
    );
    
    // Calculate payment cycles that have passed up to churn date
    const cyclesAccrued = Math.ceil(monthsElapsed / paymentFrequency);
    
    // Fees accrued for all cycles up to churn date (or current date)
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

/**
 * PUT /student/change-password
 * Allow student to change their own password
 */
router.put("/change-password", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { id } = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Get student with password hash
    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, passwordHash: true }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify current password
    if (!student.passwordHash) {
      return res.status(400).json({ message: "No password set. Please contact admin to set your password." });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, student.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.student.update({
      where: { id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: error.message || "Failed to change password" });
  }
});

/**
 * GET /student/training-calendar
 * Get student's training sessions (only sessions where student is a participant)
 */
router.get("/training-calendar", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;
  const { month, year } = req.query;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { center: true }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Build date filter for sessions where student is a participant
  const sessionWhere: any = {
    participants: {
      some: {
        studentId: id
      }
    }
  };

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    sessionWhere.sessionDate = {
      gte: startDate,
      lte: endDate
    };
  }

  const sessions = await prisma.session.findMany({
    where: sessionWhere,
    include: {
      center: {
        select: {
          id: true,
          name: true,
          shortName: true
        }
      },
      coach: {
        select: {
          id: true,
          fullName: true
        }
      },
      attendance: {
        where: { studentId: id },
        include: {
          markedByCoach: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      }
    },
    orderBy: {
      sessionDate: "asc"
    }
  });

  // Format sessions with attendance status
  const formattedSessions = sessions.map((session: any) => {
    const attendanceRecord = session.attendance[0];
    const sessionDate = new Date(session.sessionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);
    
    return {
      id: session.id,
      title: session.title,
      description: session.description,
      programmeId: session.programmeId,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      notes: session.notes,
      center: session.center,
      coach: session.coach,
      attendanceStatus: attendanceRecord ? attendanceRecord.status : "PENDING",
      attendanceNotes: attendanceRecord?.notes || null,
      markedBy: attendanceRecord?.markedByCoach || null,
      markedAt: attendanceRecord?.markedAt || null,
      isPast: sessionDate < today,
      isToday: sessionDate.getTime() === today.getTime(),
      isFuture: sessionDate > today
    };
  });

  res.json({
    sessions: formattedSessions,
    student: {
      id: student.id,
      fullName: student.fullName,
      center: student.center
    }
  });
});

/**
 * GET /student/attendance-metrics
 * Calculate attendance metrics for student
 */
router.get("/attendance-metrics", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;

  const student = await prisma.student.findUnique({
    where: { id }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Get all sessions where student is a participant (past sessions only for metrics)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastSessions = await prisma.session.findMany({
    where: {
      participants: {
        some: {
          studentId: id
        }
      },
      sessionDate: {
        lt: today
      }
    },
    include: {
      attendance: {
        where: { studentId: id }
      }
    },
    orderBy: {
      sessionDate: "desc"
    }
  });

  const totalSessions = pastSessions.length;
  const attendanceRecords = pastSessions.filter(s => s.attendance.length > 0);
  const presentCount = attendanceRecords.filter(s => s.attendance[0]?.status === "PRESENT").length;
  const absentCount = attendanceRecords.filter(s => s.attendance[0]?.status === "ABSENT").length;
  const excusedCount = attendanceRecords.filter(s => s.attendance[0]?.status === "EXCUSED").length;
  const pendingCount = totalSessions - attendanceRecords.length;

  const attendancePercentage = totalSessions > 0 
    ? Math.round((presentCount / totalSessions) * 100) 
    : 0;

  // Get recent 5 sessions with status
  const recentSessions = pastSessions.slice(0, 5).map(session => {
    const attendanceRecord = session.attendance[0];
    return {
      id: session.id,
      title: session.title,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      status: attendanceRecord ? attendanceRecord.status : "PENDING",
      markedAt: attendanceRecord?.markedAt || null
    };
  });

  res.json({
    summary: {
      totalSessions,
      presentCount,
      absentCount,
      excusedCount,
      pendingCount,
      attendancePercentage
    },
    recentSessions
  });
});

export default router;


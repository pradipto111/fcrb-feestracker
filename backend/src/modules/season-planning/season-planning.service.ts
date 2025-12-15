import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// Type definitions (will be available after Prisma generate)
type TrainingIntensity = "LOW" | "MEDIUM" | "HIGH";
type TrainingFocus = "TECHNICAL" | "TACTICAL" | "PHYSICAL" | "RECOVERY";

// Intensity multipliers for load calculation
const INTENSITY_MULTIPLIERS: Record<TrainingIntensity, number> = {
  LOW: 0.5,
  MEDIUM: 1.0,
  HIGH: 1.5,
};

/**
 * Calculate estimated load score from duration and intensity
 * Formula: Load = Duration × Intensity Multiplier
 */
export function calculateEstimatedLoad(
  duration: number,
  intensity: TrainingIntensity
): number {
  return duration * INTENSITY_MULTIPLIERS[intensity];
}

/**
 * Get week boundaries (Monday to Sunday) for a given date
 */
export function getWeekBoundaries(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}

/**
 * Recalculate weekly load for a player based on attended sessions
 */
export async function recalculatePlayerWeeklyLoad(
  studentId: number,
  centerId: number,
  weekStart: Date
): Promise<void> {
  const { weekEnd } = getWeekBoundaries(weekStart);

  // Get all sessions in this week with load data
  const sessions = await prisma.session.findMany({
    where: {
      centerId,
      sessionDate: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      attendance: {
        where: {
          studentId,
          status: "PRESENT",
        },
      },
    },
  });

  // Get session loads separately
  const sessionIds = sessions.map((s) => s.id);
  const sessionLoads = await (prisma as any).trainingSessionLoad.findMany({
    where: { sessionId: { in: sessionIds } },
  });
  const loadMap = new Map(sessionLoads.map((sl: any) => [sl.sessionId, sl]));

  // Filter to sessions where player was present and has load data
  const attendedSessionsWithLoad = sessions
    .map((s) => ({
      session: s,
      load: loadMap.get(s.id) as any,
    }))
    .filter((item) => item.session.attendance.length > 0 && item.load);

  const totalLoad = attendedSessionsWithLoad.reduce(
    (sum, item) => sum + ((item.load?.estimatedLoad as number) || 0),
    0
  );

  const sessionCount = attendedSessionsWithLoad.length;

  // Calculate average intensity
  const intensities = attendedSessionsWithLoad
    .map((item) => item.load?.intensity as TrainingIntensity | undefined)
    .filter((int): int is TrainingIntensity => int !== undefined);
  const averageIntensity =
    intensities.length > 0
      ? intensities.reduce((acc, curr) => {
          const values: Record<TrainingIntensity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
          return acc + values[curr];
        }, 0) / intensities.length
      : null;
  const avgIntensity: TrainingIntensity | null =
    averageIntensity !== null
      ? averageIntensity <= 1.5
        ? "LOW"
        : averageIntensity <= 2.5
        ? "MEDIUM"
        : "HIGH"
      : null;

  // Calculate focus distribution
  const focusCounts: Record<TrainingFocus, number> = {
    TECHNICAL: 0,
    TACTICAL: 0,
    PHYSICAL: 0,
    RECOVERY: 0,
  };
  attendedSessionsWithLoad.forEach((item) => {
    const tags = (item.load?.focusTags as TrainingFocus[] | undefined) || [];
    tags.forEach((tag: TrainingFocus) => {
      focusCounts[tag] = (focusCounts[tag] || 0) + 1;
    });
  });

  // Calculate squad average for this week
  const allStudents = await prisma.student.findMany({
    where: { centerId, status: { in: ["ACTIVE", "TRIAL"] } },
  });

  const squadLoads = await Promise.all(
    allStudents.map(async (student) => {
      const studentSessions = await prisma.session.findMany({
        where: {
          centerId,
          sessionDate: { gte: weekStart, lte: weekEnd },
        },
        include: {
          attendance: {
            where: {
              studentId: student.id,
              status: "PRESENT",
            },
          },
        },
      });

      const studentSessionIds = studentSessions
        .filter((s) => s.attendance.length > 0)
        .map((s) => s.id);
      
      const studentSessionLoads = await (prisma as any).trainingSessionLoad.findMany({
        where: { sessionId: { in: studentSessionIds } },
      });

      const studentLoad = studentSessionLoads.reduce(
        (sum: number, sl: any) => sum + (sl?.estimatedLoad || 0),
        0
      );

      return studentLoad;
    })
  );

  const squadAverage =
    squadLoads.length > 0
      ? squadLoads.reduce((a, b) => a + b, 0) / squadLoads.length
      : null;

  // Determine load status (soft indicator)
  let loadStatus: string | null = null;
  if (squadAverage !== null) {
    if (totalLoad < squadAverage * 0.7) {
      loadStatus = "LOW";
    } else if (totalLoad > squadAverage * 1.3) {
      loadStatus = "HIGH";
    } else if (totalLoad > squadAverage * 1.5) {
      loadStatus = "CRITICAL";
    } else {
      loadStatus = "NORMAL";
    }
  }

  // Get age group recommendation (simplified - can be enhanced)
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { dateOfBirth: true },
  });

  let ageGroupRange: { min: number; max: number } | null = null;
  if (student?.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
    // Simple age-based recommendations (can be made more sophisticated)
    if (age < 13) {
      ageGroupRange = { min: 50, max: 150 };
    } else if (age < 16) {
      ageGroupRange = { min: 100, max: 250 };
    } else {
      ageGroupRange = { min: 150, max: 350 };
    }
  }

  // Upsert weekly load
  await (prisma as any).playerWeeklyLoad.upsert({
    where: {
      studentId_weekStart: {
        studentId,
        weekStart,
      },
    },
    create: {
      studentId,
      centerId,
      weekStart,
      weekEnd,
      totalLoad,
      sessionCount,
      averageIntensity: avgIntensity,
      focusDistribution: focusCounts,
      squadAverage,
      ageGroupRange,
      loadStatus,
    },
    update: {
      totalLoad,
      sessionCount,
      averageIntensity: avgIntensity,
      focusDistribution: focusCounts,
      squadAverage,
      ageGroupRange,
      loadStatus,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get player load trends (weekly and monthly)
 */
export async function getPlayerLoadTrends(
  studentId: number,
  weeks: number = 12
): Promise<{
  weekly: Array<{
    weekStart: Date;
    totalLoad: number;
    sessionCount: number;
    loadStatus: string | null;
  }>;
  monthly: Array<{
    month: string;
    totalLoad: number;
    sessionCount: number;
    averageWeeklyLoad: number;
  }>;
}> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const weeklyLoads = await (prisma as any).playerWeeklyLoad.findMany({
    where: {
      studentId,
      weekStart: { gte: startDate, lte: endDate },
    },
    orderBy: { weekStart: "asc" },
  });

  const weekly = weeklyLoads.map((w: any) => ({
    weekStart: w.weekStart,
    totalLoad: w.totalLoad,
    sessionCount: w.sessionCount,
    loadStatus: w.loadStatus,
  }));

  // Group by month
  const monthlyMap = new Map<string, { loads: number[]; sessions: number[] }>();
  weeklyLoads.forEach((w: any) => {
    const monthKey = `${w.weekStart.getFullYear()}-${String(w.weekStart.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { loads: [], sessions: [] });
    }
    const monthData = monthlyMap.get(monthKey)!;
    monthData.loads.push(w.totalLoad);
    monthData.sessions.push(w.sessionCount);
  });

  const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    totalLoad: data.loads.reduce((a, b) => a + b, 0),
    sessionCount: data.sessions.reduce((a, b) => a + b, 0),
    averageWeeklyLoad: data.loads.length > 0 ? data.loads.reduce((a, b) => a + b, 0) / data.loads.length : 0,
  }));

  return { weekly, monthly };
}

/**
 * Get readiness and load correlation data
 */
export async function getReadinessLoadCorrelation(
  studentId: number,
  weeks: number = 8
): Promise<Array<{
  date: Date;
  readiness: number | null;
  load: number;
  hasInjuryNote: boolean;
}>> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  // Get weekly loads
  const weeklyLoads = await (prisma as any).playerWeeklyLoad.findMany({
    where: {
      studentId,
      weekStart: { gte: startDate, lte: endDate },
    },
    orderBy: { weekStart: "asc" },
  });

  // Get readiness indices (from snapshots)
  const snapshots = await prisma.playerMetricSnapshot.findMany({
    where: {
      studentId,
      createdAt: { gte: startDate, lte: endDate },
    },
    include: {
      readiness: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Get injury notes (coach notes with "injury" tag)
  const injuryNotes = await prisma.playerCoachNote.findMany({
    where: {
      studentId,
      tags: { has: "injury" },
      createdAt: { gte: startDate, lte: endDate },
    },
    select: { createdAt: true },
  });

  // Combine data by week
  const correlationData = weeklyLoads.map((load: any) => {
    // Find closest readiness snapshot
    const closestSnapshot = snapshots.reduce((closest, snapshot) => {
      if (!closest) return snapshot;
      const loadDiff = Math.abs(load.weekStart.getTime() - load.weekStart.getTime());
      const snapshotDiff = Math.abs(load.weekStart.getTime() - snapshot.createdAt.getTime());
      return snapshotDiff < loadDiff ? snapshot : closest;
    }, null as typeof snapshots[0] | null);

    const readiness = closestSnapshot?.readiness?.overall || null;

    // Check for injury notes in this week
    const weekEnd = new Date(load.weekEnd);
    const hasInjuryNote = injuryNotes.some(
      (note) => note.createdAt >= load.weekStart && note.createdAt <= weekEnd
    );

    return {
      date: load.weekStart,
      readiness,
      load: load.totalLoad,
      hasInjuryNote,
    };
  });

  return correlationData;
}


// mockAnalyticsService.ts

import {
  mockCentres,
  mockSquads,
  mockPathwayLevels,
  mockPlayers,
  mockCoaches,
  mockSessions,
  mockAttendanceRecords,
  mockMatches,
  mockMatchSelections,
  mockWellnessEntries,
  mockPlayerFeedback,
} from "./analyticsMockData";

// -----------------
// Shared Types
// -----------------

export type DateRange = {
  from: Date;
  to: Date;
};

export type AdminAnalyticsFilters = {
  dateRange?: DateRange;
  centreId?: string;
  squadId?: string;
};

export type CoachAnalyticsFilters = {
  dateRange?: DateRange;
  squadId?: string;
};

export type PlayerAnalyticsFilters = {
  dateRange?: DateRange;
};

// Utility: check if date in range
const inRange = (date: Date, range?: DateRange) => {
  if (!range) return true;
  return date >= range.from && date <= range.to;
};

// Utility: group by function
const groupBy = <T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> =>
  arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);

// Utility: unique count
const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr));

// -----------------
// Metric helpers
// -----------------

// Attendance rate for a given player
const getPlayerAttendanceRate = (playerId: string, range?: DateRange) => {
  const playerSessions = mockSessions.filter((s) => inRange(s.date, range));

  if (playerSessions.length === 0) {
    return { attendanceRate: 0, label: "No Data" as const };
  }

  const sessionIds = playerSessions.map((s) => s.id);
  const records = mockAttendanceRecords.filter(
    (r) => r.playerId === playerId && sessionIds.includes(r.sessionId)
  );

  const scheduled = playerSessions.length;
  const attended = records.filter((r) => r.status === "PRESENT").length;
  const rate = Math.round((attended / scheduled) * 100);

  let label: "Strong" | "Moderate" | "Needs Work" | "No Data";
  if (rate >= 85) label = "Strong";
  else if (rate >= 70) label = "Moderate";
  else label = "Needs Work";

  return { attendanceRate: rate || 0, label };
};

// Longest consecutive attendance streak
const getLongestAttendanceStreak = (playerId: string) => {
  // Sort sessions by date
  const sessions = [...mockSessions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const attendedSessionIds = new Set(
    mockAttendanceRecords
      .filter((r) => r.playerId === playerId && r.status === "PRESENT")
      .map((r) => r.sessionId)
  );

  let longest = 0;
  let current = 0;

  for (const session of sessions) {
    if (attendedSessionIds.has(session.id)) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
};

// Player match exposure
const getPlayerMatchExposure = (playerId: string, range?: DateRange) => {
  // Find squad of player
  const player = mockPlayers.find((p) => p.id === playerId);
  if (!player) return { exposureRate: 0, available: 0, selected: 0 };

  const squadMatches = mockMatches.filter(
    (m) =>
      m.squadId === player.squadId &&
      inRange(m.date, range)
  );

  const available = squadMatches.length;
  if (available === 0) {
    return { exposureRate: 0, available: 0, selected: 0 };
  }

  const matchIds = squadMatches.map((m) => m.id);
  const selections = mockMatchSelections.filter(
    (s) => s.playerId === playerId && matchIds.includes(s.matchId)
  );
  const selected = selections.filter((s) => s.status === "SELECTED").length;

  return {
    exposureRate: Math.round((selected / available) * 100),
    available,
    selected,
  };
};

// Player wellness summary
const getPlayerWellnessSummary = (playerId: string, range?: DateRange) => {
  const entries = mockWellnessEntries.filter(
    (w) => w.playerId === playerId && inRange(w.date, range)
  );
  if (entries.length === 0) {
    return {
      avgExertion: 0,
      avgEnergy: "N/A",
    };
  }

  const avgExertion =
    Math.round((entries.reduce((sum, e) => sum + e.exertion, 0) / entries.length) * 10) / 10;

  const energyCounts: Record<string, number> = {};
  entries.forEach((e) => {
    energyCounts[e.energy] = (energyCounts[e.energy] || 0) + 1;
  });

  const energySorted = Object.entries(energyCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const avgEnergy = energySorted[0]?.[0] ?? "N/A";

  return {
    avgExertion,
    avgEnergy,
  };
};

// -----------------
// ADMIN ANALYTICS
// -----------------

export const getAdminKPIs = (filters: AdminAnalyticsFilters = {}) => {
  const { dateRange, centreId, squadId } = filters;

  const players = mockPlayers.filter((p) => p.status === "ACTIVE");
  const activePlayersCount = players.length;

  const sessions = mockSessions.filter(
    (s) =>
      inRange(s.date, dateRange) &&
      (!centreId || s.centreId === centreId) &&
      (!squadId || s.squadId === squadId)
  );
  const sessionsInRange = sessions.length;

  const matches = mockMatches.filter(
    (m) =>
      inRange(m.date, dateRange) &&
      (!centreId || m.centreId === centreId) &&
      (!squadId || m.squadId === squadId)
  );
  const matchesInRange = matches.length;

  // Attendance: avg attendance across all active players
  let totalRate = 0;
  players.forEach((p) => {
    const { attendanceRate } = getPlayerAttendanceRate(p.id, dateRange);
    totalRate += attendanceRate;
  });
  const avgAttendanceRate = players.length
    ? Math.round(totalRate / players.length)
    : 0;

  // Placeholder fee collection (since we have no finance data yet)
  const feeCollectionPct = null; // TODO: plug into real finance data when available

  // Simple wellness average
  const wellnessInRange = mockWellnessEntries.filter((w) =>
    inRange(w.date, dateRange)
  );
  const avgExertion =
    wellnessInRange.length > 0
      ? Math.round((wellnessInRange.reduce((sum, e) => sum + e.exertion, 0) /
        wellnessInRange.length) * 10) / 10
      : 0;

  return {
    totalActivePlayers: activePlayersCount,
    avgAttendance: avgAttendanceRate,
    sessionsLast30Days: sessionsInRange,
    matchesSeason: matchesInRange,
    feeCollectionRate: feeCollectionPct || 0,
    avgWellness: Math.round(avgExertion),
  };
};

export const getAdminAttendanceByCentre = (filters: AdminAnalyticsFilters = {}) => {
  const { dateRange } = filters;
  const result: { centreId: string; centreName: string; attendanceRate: number }[] = [];

  mockCentres.forEach((centre) => {
    const centreSessions = mockSessions.filter(
      (s) => s.centreId === centre.id && inRange(s.date, dateRange)
    );
    if (centreSessions.length === 0) {
      result.push({ centreId: centre.id, centreName: centre.name, attendanceRate: 0 });
      return;
    }

    const sessionIds = centreSessions.map((s) => s.id);
    const centreAttendance = mockAttendanceRecords.filter((r) =>
      sessionIds.includes(r.sessionId)
    );
    const attended = centreAttendance.filter(
      (r) => r.status === "PRESENT"
    ).length;

    const scheduled =
      centreSessions.length *
      unique(centreAttendance.map((r) => r.playerId)).length || 1; // avoid divide by zero

    const attendanceRate = Math.round((attended / scheduled) * 100);
    result.push({ centreId: centre.id, centreName: centre.name, attendanceRate });
  });

  return result;
};

export const getAdminAttendanceOverTime = (filters: AdminAnalyticsFilters = {}, groupBy: "week" | "month" = "week") => {
  const { dateRange } = filters;
  
  const sessions = mockSessions.filter((s) => inRange(s.date, dateRange));
  const grouped: Record<string, { scheduled: number; attended: number }> = {};

  sessions.forEach((session) => {
    const date = new Date(session.date);
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

    const sessionAttendance = mockAttendanceRecords.filter((r) => r.sessionId === session.id);
    grouped[key].scheduled += sessionAttendance.length;
    grouped[key].attended += sessionAttendance.filter((r) => r.status === "PRESENT").length;
  });

  return Object.entries(grouped).map(([period, stats]) => ({
    period,
    scheduled: stats.scheduled,
    attended: stats.attended,
    rate: stats.scheduled > 0 ? Math.round((stats.attended / stats.scheduled) * 100) : 0,
  }));
};

export const getAdminPlayersPerPathwayLevel = () => {
  const byLevel: Record<string, number> = {};

  mockPathwayLevels.forEach((lvl) => {
    const count = mockPlayers.filter(
      (p) => p.pathwayLevelId === lvl.id && p.status === "ACTIVE"
    ).length;
    byLevel[lvl.name] = count;
  });

  return {
    pipeline: byLevel,
    totalActive: mockPlayers.filter((p) => p.status === "ACTIVE").length,
  };
};

export const getAdminSessionsAndLoad = (filters: AdminAnalyticsFilters = {}) => {
  const { dateRange, centreId } = filters;
  
  const sessions = mockSessions.filter(
    (s) =>
      inRange(s.date, dateRange) &&
      (!centreId || s.centreId === centreId)
  );

  // Group by week
  const weekly: Record<string, { sessions: number; avgExertion: number }> = {};

  sessions.forEach((session) => {
    const date = new Date(session.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split("T")[0];

    if (!weekly[key]) {
      weekly[key] = { sessions: 0, avgExertion: 0 };
    }

    weekly[key].sessions += 1;

    const sessionWellness = mockWellnessEntries.filter(
      (w) => w.sessionId === session.id
    );
    if (sessionWellness.length > 0) {
      const avg =
        sessionWellness.reduce((sum, w) => sum + w.exertion, 0) /
        sessionWellness.length;
      weekly[key].avgExertion = weekly[key].avgExertion === 0 
        ? avg 
        : (weekly[key].avgExertion + avg) / 2;
    }
  });

  return Object.entries(weekly).map(([week, stats]) => ({
    week,
    sessions: stats.sessions,
    avgExertion: Math.round(stats.avgExertion * 10) / 10,
  }));
};

export const getAdminMatches = () => {
  const byCompetition: Record<string, number> = {};
  const participationDistribution = {
    "0": 0,
    "1-5": 0,
    "6-10": 0,
    "10+": 0,
  };

  const playerMatchCounts: Record<string, number> = {};

  mockMatches.forEach((fixture) => {
    const comp = fixture.competitionName || "Other";
    byCompetition[comp] = (byCompetition[comp] || 0) + 1;

    mockMatchSelections.forEach((fp) => {
      if (fp.status === "SELECTED") {
        playerMatchCounts[fp.playerId] =
          (playerMatchCounts[fp.playerId] || 0) + 1;
      }
    });
  });

  Object.values(playerMatchCounts).forEach((count) => {
    if (count === 0) participationDistribution["0"]++;
    else if (count <= 5) participationDistribution["1-5"]++;
    else if (count <= 10) participationDistribution["6-10"]++;
    else participationDistribution["10+"]++;
  });

  return {
    byCompetition: Object.entries(byCompetition).map(([comp, count]) => ({
      competition: comp,
      matches: count,
    })),
    participationDistribution,
  };
};

// Basic linear forecast for active players count
export const getAdminActivePlayersForecast = () => {
  // Mock simple forecast: just project current count with +5% over next 6 months
  const nowCount = mockPlayers.filter((p) => p.status === "ACTIVE").length;

  const forecast3Months = Math.round(nowCount * 1.05);
  const forecast6Months = Math.round(nowCount * 1.1);

  return {
    current: nowCount,
    in3Months: forecast3Months,
    in6Months: forecast6Months,
  };
};

// -----------------
// COACH ANALYTICS
// -----------------

export const getCoachAnalytics = (
  coachId: string,
  filters: CoachAnalyticsFilters = {}
) => {
  const { dateRange, squadId } = filters;

  // Sessions of coach
  const sessions = mockSessions.filter(
    (s) =>
      s.coachId === coachId &&
      inRange(s.date, dateRange) &&
      (!squadId || s.squadId === squadId)
  );

  const sessionIds = sessions.map((s) => s.id);

  // Players under this coach (via sessions & attendance)
  const coachAttendance = mockAttendanceRecords.filter((r) =>
    sessionIds.includes(r.sessionId)
  );
  const playerIds = unique(coachAttendance.map((r) => r.playerId));

  const players = mockPlayers.filter((p) => playerIds.includes(p.id));

  // Attendance per player
  const playerAttendance = players.map((p) => ({
    studentId: p.id,
    studentName: p.fullName,
    programType: mockSquads.find((s) => s.id === p.squadId)?.name || "",
    sessionsAttended: mockAttendanceRecords.filter(
      (r) => r.playerId === p.id && sessionIds.includes(r.sessionId) && r.status === "PRESENT"
    ).length,
    sessionsScheduled: sessions.length,
    attendanceRate: getPlayerAttendanceRate(p.id, dateRange).attendanceRate,
    label: getPlayerAttendanceRate(p.id, dateRange).label,
  }));

  // Squad-level attendance
  const squads = unique(players.map((p) => p.squadId));
  const squadAttendance = squads.map((sid) => {
    const squadPlayers = players.filter((p) => p.squadId === sid);
    let totalRate = 0;
    squadPlayers.forEach((p) => {
      totalRate += getPlayerAttendanceRate(p.id, dateRange).attendanceRate;
    });
    return {
      squadId: sid,
      attendanceRate: squadPlayers.length
        ? Math.round(totalRate / squadPlayers.length)
        : 0,
    };
  });

  // Wellness trends
  const wellness = mockWellnessEntries.filter(
    (w) =>
      playerIds.includes(w.playerId) && inRange(w.date, dateRange)
  );
  const avgExertion =
    wellness.length > 0
      ? Math.round((wellness.reduce((sum, w) => sum + w.exertion, 0) / wellness.length) * 10) / 10
      : 0;

  // Sessions this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const sessionsThisWeek = sessions.filter((s) => s.date >= weekStart).length;

  // Wellness flags
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const wellnessFlags = mockWellnessEntries.filter(
    (w) =>
      playerIds.includes(w.playerId) &&
      w.date >= fourteenDaysAgo &&
      w.exertion >= 4 &&
      w.energy === "LOW"
  ).length;

  return {
    playersUnderCoach: players.length,
    avgAttendance: squadAttendance.length > 0
      ? Math.round(squadAttendance.reduce((sum, s) => sum + s.attendanceRate, 0) / squadAttendance.length)
      : 0,
    sessionsThisWeek,
    wellnessFlags,
    playerEngagement: playerAttendance,
    wellness: {
      avgExertionBySession: sessions.map((s) => {
        const sessionWellness = mockWellnessEntries.filter((w) => w.sessionId === s.id);
        return {
          sessionId: s.id,
          avgExertion: sessionWellness.length > 0
            ? Math.round((sessionWellness.reduce((sum, w) => sum + w.exertion, 0) / sessionWellness.length) * 10) / 10
            : 0,
        };
      }),
      flaggedSessions: wellnessFlags,
    },
  };
};

export const getCoachFeedbackQueue = (coachId: string) => {
  const coach = mockCoaches.find((c) => c.id === coachId);
  if (!coach) return [];

  const coachSessions = mockSessions.filter((s) => s.coachId === coachId);
  const sessionIds = coachSessions.map((s) => s.id);
  const coachAttendance = mockAttendanceRecords.filter((r) =>
    sessionIds.includes(r.sessionId)
  );
  const playerIds = unique(coachAttendance.map((r) => r.playerId));
  const players = mockPlayers.filter((p) => playerIds.includes(p.id));

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const queue = players
    .map((player) => {
      const reasons: string[] = [];

      // Check for no feedback in last 60 days
      const lastFeedback = mockPlayerFeedback
        .filter((f) => f.playerId === player.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      if (
        !lastFeedback ||
        !lastFeedback.status ||
        lastFeedback.createdAt < sixtyDaysAgo
      ) {
        reasons.push("No feedback in last 60 days");
      }

      // Check attendance
      const { attendanceRate } = getPlayerAttendanceRate(player.id);
      if (attendanceRate < 70) {
        reasons.push(`Attendance ${attendanceRate}% (below 70%)`);
      }

      // Check wellness flags
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const highLoadFlags = mockWellnessEntries.filter(
        (w) =>
          w.playerId === player.id &&
          w.date >= fourteenDaysAgo &&
          w.exertion >= 4 &&
          w.energy === "LOW"
      ).length;

      if (highLoadFlags >= 3) {
        reasons.push("High load signals detected");
      }

      if (reasons.length === 0) return null;

      return {
        studentId: player.id,
        studentName: player.fullName,
        programType: mockSquads.find((s) => s.id === player.squadId)?.name || "",
        reasons,
        primaryReason: reasons[0],
        attendanceRate,
      };
    })
    .filter((item) => item !== null);

  return queue;
};

// -----------------
// PLAYER ANALYTICS
// -----------------

export const getPlayerAnalytics = (
  playerId: string,
  filters: PlayerAnalyticsFilters = {}
) => {
  const { dateRange } = filters;

  const player = mockPlayers.find((p) => p.id === playerId);
  if (!player) {
    throw new Error("Player not found in mock data");
  }

  // Attendance & consistency
  const { attendanceRate, label } = getPlayerAttendanceRate(
    playerId,
    dateRange
  );
  const longestStreak = getLongestAttendanceStreak(playerId);

  // Sessions attended last 30 days
  const now = new Date();
  const last30Range: DateRange = {
    from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    to: now,
  };
  const last30Sessions = mockSessions.filter((s) =>
    inRange(s.date, last30Range)
  );
  const last30SessionIds = last30Sessions.map((s) => s.id);
  const last30Attendance = mockAttendanceRecords.filter(
    (r) =>
      r.playerId === playerId &&
      last30SessionIds.includes(r.sessionId) &&
      r.status === "PRESENT"
  );
  const sessionsAttendedLast30 = last30Attendance.length;

  // Match exposure
  const { exposureRate, available, selected } = getPlayerMatchExposure(
    playerId,
    dateRange
  );

  // Wellness
  const wellnessEntries = mockWellnessEntries
    .filter((w) => w.playerId === playerId && inRange(w.date, dateRange))
    .map((w) => ({
      date: w.date.toISOString().split("T")[0],
      exertion: w.exertion,
      energy: w.energy,
    }));

  // Feedback
  const feedback = mockPlayerFeedback
    .filter((f) => f.playerId === playerId && f.status === "PUBLISHED")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Progress indicator
  const pathwayLevel = mockPathwayLevels.find((l) => l.id === player.pathwayLevelId);
  const nextLevel = mockPathwayLevels.find((l) => l.order === (pathwayLevel?.order || 0) + 1);

  let readinessLabel: "On Track" | "Nearly There" | "Needs Focus";
  if (attendanceRate >= 85 && exposureRate >= 50) {
    readinessLabel = "On Track";
  } else if (attendanceRate >= 70) {
    readinessLabel = "Nearly There";
  } else {
    readinessLabel = "Needs Focus";
  }

  // Recent matches
  const recentMatches = mockMatches
    .filter((m) => m.squadId === player.squadId)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)
    .map((match) => {
      const selection = mockMatchSelections.find(
        (s) => s.matchId === match.id && s.playerId === playerId
      );
      return {
        matchDate: match.date.toISOString().split("T")[0],
        opponent: match.competitionName.split("–")[1]?.trim() || "TBD",
        competition: match.competitionName.split("–")[0]?.trim() || match.competitionName,
        status: selection?.status || "NOT_SELECTED",
        reason: selection?.reasonCategory || null,
      };
    });

  return {
    attendanceRate,
    attendanceLabel: label,
    sessionsAttended30Days: sessionsAttendedLast30,
    matchesSelected: selected,
    longestStreak,
    weeklyData: getAdminAttendanceOverTime({ dateRange }, "week").map((d) => ({
      week: d.period,
      scheduled: d.scheduled,
      attended: d.attended,
      rate: d.rate,
    })),
    wellnessData: wellnessEntries,
    totalMatches: available,
    selectedMatches: selected,
    exposureRate,
    recentMatches,
    currentLevel: pathwayLevel?.name || "Youth League",
    nextLevel: nextLevel?.name,
    readinessLabel,
    attendanceTarget: 85,
    feedbackFrequency: feedback.length,
    requirements: {
      attendance: pathwayLevel?.criteria?.minAttendanceRate
        ? `${pathwayLevel.criteria.minAttendanceRate}% attendance`
        : undefined,
      physical: undefined,
      tactical: undefined,
      coachRecommendation: false,
    },
  };
};


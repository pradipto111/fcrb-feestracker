/**
 * Analytics Service
 * 
 * Provides read-only analytics queries on top of existing transactional data.
 * All queries are safe and do not modify any data.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface DateRange {
  from: Date;
  to: Date;
}

export interface CentreAnalyticsFilters {
  centreId?: number;
  dateRange?: DateRange;
  programType?: string;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get dimension: Centre details
 */
export async function getDimCentre(centreId: number) {
  const centre = await prisma.center.findUnique({
    where: { id: centreId },
    select: {
      id: true,
      name: true,
      shortName: true,
      locality: true,
      city: true,
      state: true,
      isActive: true,
    },
  });

  if (!centre) return null;

  return {
    centre_id: centre.id,
    centre_name: centre.name,
    centre_short_name: centre.shortName,
    locality: centre.locality,
    city: centre.city,
    state: centre.state,
    is_active: centre.isActive,
  };
}

/**
 * Get dimension: All centres
 */
export async function getDimCentres() {
  const centres = await prisma.center.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      shortName: true,
      locality: true,
      city: true,
      state: true,
      isActive: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  return centres.map((c) => ({
    centre_id: c.id,
    centre_name: c.name,
    centre_short_name: c.shortName,
    locality: c.locality,
    city: c.city,
    state: c.state,
    is_active: c.isActive,
  }));
}

/**
 * Get dimension: Players
 */
export async function getDimPlayers(filters?: CentreAnalyticsFilters) {
  const where: any = {};
  if (filters?.centreId) where.centerId = filters.centreId;
  if (filters?.programType) where.programType = filters.programType;

  const students = await prisma.student.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      dateOfBirth: true,
      centerId: true,
      programType: true,
      joiningDate: true,
      status: true,
    },
  });

  return students.map((s) => ({
    player_id: s.id,
    full_name: s.fullName,
    date_of_birth: s.dateOfBirth,
    age: calculateAge(s.dateOfBirth),
    centre_id: s.centerId,
    program_id: s.programType,
    join_date: s.joiningDate,
    status: s.status,
  }));
}

/**
 * Get fact: Sessions
 */
export async function getFactSessions(filters?: CentreAnalyticsFilters) {
  const where: any = {};
  if (filters?.centreId) where.centerId = filters.centreId;
  if (filters?.dateRange) {
    where.sessionDate = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  const sessions = await prisma.session.findMany({
    where,
    include: {
      attendance: true,
      center: true,
      coach: true,
    },
    orderBy: { sessionDate: "asc" },
  });

  return sessions.map((s) => {
    const start = new Date(`2000-01-01T${s.startTime}`);
    const end = new Date(`2000-01-01T${s.endTime}`);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    return {
      session_id: s.id,
      centre_id: s.centerId,
      program_id: null, // Not directly linked, would need to derive from students
      coach_id: s.coachId,
      date: s.sessionDate,
      start_time: s.startTime,
      duration_minutes: durationMinutes,
      scheduled_player_count: null, // Would need to calculate from active students
      actual_player_count: s.attendance.filter((a) => a.status === "PRESENT").length,
      is_cancelled: false, // Not tracked in current schema
      session_type: null, // Not tracked in current schema
    };
  });
}

/**
 * Get fact: Attendance
 */
export async function getFactAttendance(filters?: CentreAnalyticsFilters) {
  const sessionWhere: any = {};
  if (filters?.centreId) sessionWhere.centerId = filters.centreId;
  if (filters?.dateRange) {
    sessionWhere.sessionDate = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  const sessions = await prisma.session.findMany({
    where: sessionWhere,
    include: {
      attendance: {
        include: {
          student: true,
        },
      },
    },
  });

  const attendanceRecords: any[] = [];
  sessions.forEach((session) => {
    session.attendance.forEach((att) => {
      attendanceRecords.push({
        attendance_id: att.id,
        session_id: session.id,
        player_id: att.studentId,
        centre_id: session.centerId,
        program_id: att.student.programType,
        date: session.sessionDate,
        status: att.status,
        check_in_time: null, // Not tracked
      });
    });
  });

  return attendanceRecords;
}

/**
 * Get fact: Payments
 */
export async function getFactPayments(filters?: CentreAnalyticsFilters) {
  const where: any = {};
  if (filters?.centreId) where.centerId = filters.centreId;
  if (filters?.dateRange) {
    where.paymentDate = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  const payments = await prisma.payment.findMany({
    where,
    include: {
      student: true,
    },
    orderBy: { paymentDate: "asc" },
  });

  return payments.map((p) => ({
    payment_id: p.id,
    player_id: p.studentId,
    centre_id: p.centerId,
    program_id: p.student.programType,
    invoice_id: null, // Not tracked
    date: p.paymentDate,
    amount: p.amount,
    currency: "INR",
    status: "PAID", // Payment model doesn't have status field
    payment_method: p.paymentMode || null,
  }));
}

/**
 * Get fact: Trials/Leads
 */
export async function getFactTrials(filters?: CentreAnalyticsFilters) {
  const where: any = {};
  if (filters?.centreId) where.centerId = filters.centreId;
  if (filters?.dateRange) {
    where.createdAt = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  const leads = await (prisma as any).websiteLead?.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      phoneNumber: true,
      email: true,
      centerId: true,
      programType: true,
      createdAt: true,
      status: true,
      convertedToPlayerId: true,
    },
  }) || [];

  return leads.map((lead: any) => ({
    trial_id: lead.id,
    lead_name: lead.fullName,
    contact: lead.phoneNumber || lead.email,
    centre_id: lead.centerId,
    program_id: lead.programType,
    trial_date: lead.createdAt,
    status: lead.status || "PENDING",
    converted_to_player: lead.convertedToPlayerId !== null,
  }));
}

/**
 * Get fact: Matches
 */
export async function getFactMatches(filters?: CentreAnalyticsFilters) {
  const where: any = {};
  if (filters?.centreId) where.centerId = filters.centreId;
  if (filters?.dateRange) {
    where.matchDate = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  const fixtures = await prisma.fixture.findMany({
    where,
    include: {
      players: true,
    },
    orderBy: { matchDate: "asc" },
  });

  return fixtures.map((f) => ({
    match_id: f.id,
    team_id: null, // Not tracked
    squad_id: null, // Not tracked
    opposition: f.opponent,
    centre_id: f.centerId,
    date: f.matchDate,
    competition_type: f.matchType,
    result: null, // Not tracked in current schema
    goals_for: null,
    goals_against: null,
  }));
}

/**
 * Get fact: Coach Load
 */
export async function getFactCoachLoad(filters?: CentreAnalyticsFilters) {
  const sessionWhere: any = {};
  if (filters?.centreId) sessionWhere.centerId = filters.centreId;
  if (filters?.dateRange) {
    sessionWhere.sessionDate = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  const sessions = await prisma.session.findMany({
    where: sessionWhere,
    include: {
      attendance: true,
      coach: true,
    },
  });

  // Group by coach and date
  const coachLoadMap: Record<string, {
    centre_id: number;
    coach_id: number;
    date: Date;
    total_sessions: number;
    total_minutes: number;
    unique_players_coached: Set<number>;
  }> = {};

  sessions.forEach((session) => {
    const dateKey = session.sessionDate.toISOString().split("T")[0];
    const key = `${session.coachId}-${dateKey}`;

    if (!coachLoadMap[key]) {
      coachLoadMap[key] = {
        centre_id: session.centerId,
        coach_id: session.coachId,
        date: session.sessionDate,
        total_sessions: 0,
        total_minutes: 0,
        unique_players_coached: new Set(),
      };
    }

    const start = new Date(`2000-01-01T${session.startTime}`);
    const end = new Date(`2000-01-01T${session.endTime}`);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    coachLoadMap[key].total_sessions += 1;
    coachLoadMap[key].total_minutes += durationMinutes;
    session.attendance.forEach((att) => {
      coachLoadMap[key].unique_players_coached.add(att.studentId);
    });
  });

  return Object.values(coachLoadMap).map((load) => ({
    centre_id: load.centre_id,
    coach_id: load.coach_id,
    date: load.date,
    total_sessions: load.total_sessions,
    total_minutes: load.total_minutes,
    unique_players_coached: load.unique_players_coached.size,
  }));
}

/**
 * Get Centre Daily Summary (materialized view equivalent)
 */
export async function getCentreDailySummary(centreId: number, dateRange: DateRange) {
  // Get all relevant data for this centre and date range
  const [sessions, students, payments, leads] = await Promise.all([
    getFactSessions({ centreId, dateRange }),
    getDimPlayers({ centreId }),
    getFactPayments({ centreId, dateRange }),
    getFactTrials({ centreId, dateRange }),
  ]);

  // Group by date
  const dailyMap: Record<string, {
    centre_id: number;
    date: Date;
    total_sessions: number;
    total_players_scheduled: number;
    total_players_present: number;
    attendance_rate: number;
    new_players_joined: number;
    players_dropped: number;
    total_revenue_collected: number;
    total_outstanding_dues: number;
    number_of_trials: number;
    trial_conversion_rate: number;
  }> = {};

  // Process sessions
  sessions.forEach((session) => {
    const dateKey = session.date.toISOString().split("T")[0];
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        centre_id: centreId,
        date: session.date,
        total_sessions: 0,
        total_players_scheduled: 0,
        total_players_present: 0,
        attendance_rate: 0,
        new_players_joined: 0,
        players_dropped: 0,
        total_revenue_collected: 0,
        total_outstanding_dues: 0,
        number_of_trials: 0,
        trial_conversion_rate: 0,
      };
    }
    dailyMap[dateKey].total_sessions += 1;
    dailyMap[dateKey].total_players_present += session.actual_player_count || 0;
  });

  // Process payments
  payments.forEach((payment) => {
    const dateKey = payment.date.toISOString().split("T")[0];
    if (dailyMap[dateKey]) {
      dailyMap[dateKey].total_revenue_collected += payment.amount;
    }
  });

  // Process trials
  leads.forEach((lead: any) => {
    const dateKey = lead.trial_date.toISOString().split("T")[0];
    if (dailyMap[dateKey]) {
      dailyMap[dateKey].number_of_trials += 1;
    }
  });

  // Calculate attendance rates
  Object.values(dailyMap).forEach((day) => {
    if (day.total_players_scheduled > 0) {
      day.attendance_rate = (day.total_players_present / day.total_players_scheduled) * 100;
    }
  });

  return Object.values(dailyMap).sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate centre metrics
 */
export async function calculateCentreMetrics(centreId: number, dateRange: DateRange) {
  const [sessions, students, payments, attendance, leads, matches] = await Promise.all([
    getFactSessions({ centreId, dateRange }),
    getDimPlayers({ centreId }),
    getFactPayments({ centreId, dateRange }),
    getFactAttendance({ centreId, dateRange }),
    getFactTrials({ centreId, dateRange }),
    getFactMatches({ centreId, dateRange }),
  ]);

  const activeStudents = students.filter((s) => s.status === "ACTIVE");
  const newStudents = students.filter(
    (s) => s.join_date && s.join_date >= dateRange.from && s.join_date <= dateRange.to
  );
  const droppedStudents = students.filter(
    (s) => s.status === "INACTIVE" && s.join_date && s.join_date < dateRange.to
  );

  // Calculate attendance
  const totalScheduled = attendance.length;
  const totalPresent = attendance.filter((a) => a.status === "PRESENT").length;
  const avgAttendanceRate = totalScheduled > 0 ? (totalPresent / totalScheduled) * 100 : 0;

  // Calculate revenue
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const expectedRevenue = activeStudents.reduce((sum, s) => {
    // Estimate expected revenue based on monthly fee
    const monthsInRange = Math.ceil(
      (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return sum + (s.program_id ? 5000 : 0) * monthsInRange; // Placeholder calculation
  }, 0);
  const outstandingDues = Math.max(0, expectedRevenue - totalRevenue);

  // Calculate trial conversion
  const totalTrials = leads.length;
  const convertedTrials = leads.filter((l: any) => l.converted_to_player).length;
  const trialConversionRate = totalTrials > 0 ? (convertedTrials / totalTrials) * 100 : 0;

  // Calculate sessions per player
  const avgSessionsPerPlayer = activeStudents.length > 0
    ? sessions.length / activeStudents.length
    : 0;

  // Group by program
  const programMetrics: Record<string, {
    program: string;
    activePlayers: number;
    sessions: number;
    attendanceRate: number;
    revenue: number;
  }> = {};

  students.forEach((student) => {
    const program = student.program_id || "Unknown";
    if (!programMetrics[program]) {
      programMetrics[program] = {
        program,
        activePlayers: 0,
        sessions: 0,
        attendanceRate: 0,
        revenue: 0,
      };
    }
    if (student.status === "ACTIVE") {
      programMetrics[program].activePlayers += 1;
    }
  });

  attendance.forEach((att) => {
    const program = att.program_id || "Unknown";
    if (programMetrics[program]) {
      programMetrics[program].sessions += 1;
      if (att.status === "PRESENT") {
        // Track for attendance calculation
      }
    }
  });

  payments.forEach((payment) => {
    const program = payment.program_id || "Unknown";
    if (programMetrics[program]) {
      programMetrics[program].revenue += payment.amount;
    }
  });

  // Calculate attendance by program
  Object.keys(programMetrics).forEach((program) => {
    const programAttendance = attendance.filter((a) => a.program_id === program);
    const programPresent = programAttendance.filter((a) => a.status === "PRESENT").length;
    programMetrics[program].attendanceRate =
      programAttendance.length > 0 ? (programPresent / programAttendance.length) * 100 : 0;
  });

  return {
    activePlayers: activeStudents.length,
    newPlayers: newStudents.length,
    droppedPlayers: droppedStudents.length,
    totalSessions: sessions.length,
    avgSessionsPerPlayer: Math.round(avgSessionsPerPlayer * 10) / 10,
    avgAttendanceRate: Math.round(avgAttendanceRate * 10) / 10,
    totalRevenue,
    outstandingDues,
    collectionRate: expectedRevenue > 0 ? Math.round((totalRevenue / expectedRevenue) * 100) : 0,
    totalTrials,
    trialConversionRate: Math.round(trialConversionRate * 10) / 10,
    totalMatches: matches.length,
    programMetrics: Object.values(programMetrics),
  };
}

/**
 * Calculate global/club-wide metrics
 */
export async function calculateGlobalMetrics(dateRange: DateRange) {
  const centres = await getDimCentres();
  
  const centreMetrics = await Promise.all(
    centres.map((c) => calculateCentreMetrics(c.centre_id, dateRange))
  );

  const totalActivePlayers = centreMetrics.reduce((sum, m) => sum + m.activePlayers, 0);
  const totalSessions = centreMetrics.reduce((sum, m) => sum + m.totalSessions, 0);
  const totalRevenue = centreMetrics.reduce((sum, m) => sum + m.totalRevenue, 0);
  const totalTrials = centreMetrics.reduce((sum, m) => sum + m.totalTrials, 0);
  const avgAttendanceRate =
    centreMetrics.length > 0
      ? centreMetrics.reduce((sum, m) => sum + m.avgAttendanceRate, 0) / centreMetrics.length
      : 0;

  return {
    totalActivePlayers,
    totalCentres: centres.length,
    avgClubAttendance: Math.round(avgAttendanceRate * 10) / 10,
    monthlyRevenue: totalRevenue,
    totalTrials,
    centreBreakdown: centres.map((c, idx) => ({
      centreId: c.centre_id,
      centreName: c.centre_name,
      ...centreMetrics[idx],
    })),
  };
}


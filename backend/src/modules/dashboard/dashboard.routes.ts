import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";
import { withCache } from "../../utils/response-cache";

const router = Router();
const dashboardCache = withCache(60 * 1000, "/dashboard");
const isDev = process.env.NODE_ENV !== "production";

async function getCoachCenterIds(coachId: number) {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return links.map((l) => l.centerId);
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}

function parseCsvNumbers(input?: string): number[] {
  if (!input) return [];
  return input
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v) && v > 0);
}

function parseCsvStrings(input?: string): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((v) => decodeURIComponent(v.trim()))
    .filter(Boolean);
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getMonthStarts(from: Date, to: Date): Date[] {
  const start = startOfMonth(from);
  const end = startOfMonth(to);
  const months: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

function getFinancialYearRange(anchor: Date): { from: Date; to: Date } {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  if (month >= 3) {
    return {
      from: new Date(year, 3, 1, 0, 0, 0, 0),
      to: new Date(year + 1, 2, 31, 23, 59, 59, 999),
    };
  }
  return {
    from: new Date(year - 1, 3, 1, 0, 0, 0, 0),
    to: new Date(year, 2, 31, 23, 59, 59, 999),
  };
}

function resolveDateRange(
  presetRaw: string | undefined,
  now: Date,
  customFrom?: string,
  customTo?: string
): { preset: string; from: Date; to: Date } {
  const preset = (presetRaw || "last_12_months").toLowerCase();
  if (preset === "this_month") {
    return { preset, from: startOfMonth(now), to: endOfMonth(now) };
  }
  if (preset === "last_3_months") {
    return { preset, from: startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1)), to: endOfMonth(now) };
  }
  if (preset === "last_6_months") {
    return { preset, from: startOfMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1)), to: endOfMonth(now) };
  }
  if (preset === "this_financial_year") {
    const fy = getFinancialYearRange(now);
    return { preset, from: fy.from, to: fy.to };
  }
  if (preset === "last_financial_year") {
    const thisFy = getFinancialYearRange(now);
    const prevAnchor = new Date(thisFy.from.getFullYear() - 1, 3, 1);
    const prevFy = getFinancialYearRange(prevAnchor);
    return { preset, from: prevFy.from, to: prevFy.to };
  }
  if (preset === "custom_range" || preset === "custom") {
    const from = customFrom ? startOfDay(new Date(customFrom)) : startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1));
    const to = customTo ? endOfDay(new Date(customTo)) : endOfMonth(now);
    return { preset: "custom_range", from: from <= to ? from : to, to: to >= from ? to : from };
  }
  return { preset: "last_12_months", from: startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1)), to: endOfMonth(now) };
}

function monthlyEquivalent(feeAmount: number, paymentFrequency: number): number {
  const frequency = Math.max(1, Number(paymentFrequency || 1));
  return feeAmount / frequency;
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function intersectsMonth(joiningDate: Date | null, churnedDate: Date | null, monthStart: Date, monthEnd: Date): boolean {
  const activeFrom = joiningDate ? startOfDay(joiningDate) : new Date(0);
  const activeTo = churnedDate ? endOfDay(churnedDate) : new Date(8640000000000000);
  return activeFrom <= monthEnd && activeTo >= monthStart;
}

type RevenueFilterMeta = {
  centers: Array<{ id: number; name: string }>;
  programmes: string[];
  statuses: string[];
  paymentFrequencies: number[];
  dateBounds: {
    min: string | null;
    max: string | null;
  };
};

function asDateOnly(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function minDate(values: Array<Date | null | undefined>): Date | null {
  const valid = values.filter((value): value is Date => value instanceof Date);
  if (valid.length === 0) return null;
  return new Date(Math.min(...valid.map((value) => value.getTime())));
}

function maxDate(values: Array<Date | null | undefined>): Date | null {
  const valid = values.filter((value): value is Date => value instanceof Date);
  if (valid.length === 0) return null;
  return new Date(Math.max(...valid.map((value) => value.getTime())));
}

async function getRevenueFilterMeta(role: string, allowedCenterIds?: number[]): Promise<RevenueFilterMeta> {
  const studentScopeWhere: any = {};
  const paymentScopeWhere: any = {};
  if (role === "COACH") {
    studentScopeWhere.centerId = { in: allowedCenterIds || [] };
    paymentScopeWhere.centerId = { in: allowedCenterIds || [] };
  }

  const [centersMeta, programmeMetaRows, statusMetaRows, frequencyMetaRows, studentDateAggregate, paymentDateAggregate] = await Promise.all([
    prisma.center.findMany({
      where: role === "COACH" ? { id: { in: allowedCenterIds || [] }, isActive: true } : { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.student.findMany({
      where: { ...studentScopeWhere, programType: { not: null } },
      select: { programType: true },
      distinct: ["programType"],
      orderBy: { programType: "asc" },
    }),
    prisma.student.findMany({
      where: studentScopeWhere,
      select: { status: true },
      distinct: ["status"],
    }),
    prisma.student.findMany({
      where: studentScopeWhere,
      select: { paymentFrequency: true },
      distinct: ["paymentFrequency"],
      orderBy: { paymentFrequency: "asc" },
    }),
    prisma.student.aggregate({
      where: studentScopeWhere,
      _min: { joiningDate: true, createdAt: true },
      _max: { churnedDate: true, updatedAt: true, createdAt: true },
    }),
    prisma.payment.aggregate({
      where: paymentScopeWhere,
      _min: { paymentDate: true },
      _max: { paymentDate: true },
    }),
  ]);

  const minBound = minDate([
    studentDateAggregate._min.joiningDate,
    studentDateAggregate._min.createdAt,
    paymentDateAggregate._min.paymentDate,
  ]);
  const maxBound = maxDate([
    studentDateAggregate._max.churnedDate,
    studentDateAggregate._max.updatedAt,
    studentDateAggregate._max.createdAt,
    paymentDateAggregate._max.paymentDate,
  ]);

  const statuses = Array.from(new Set(["ACTIVE", "INACTIVE", "TRIAL", ...statusMetaRows.map((row) => String(row.status || "").toUpperCase())]))
    .filter(Boolean)
    .sort();
  const paymentFrequencies = Array.from(
    new Set(
      frequencyMetaRows
        .map((row) => Number(row.paymentFrequency))
        .filter((value) => Number.isFinite(value) && value > 0)
    )
  ).sort((a, b) => a - b);

  return {
    centers: centersMeta,
    programmes: programmeMetaRows
      .map((row) => row.programType)
      .filter((value): value is string => Boolean(value)),
    statuses,
    paymentFrequencies,
    dateBounds: {
      min: asDateOnly(minBound),
      max: asDateOnly(maxBound),
    },
  };
}

/**
 * GET /dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&centerId=optional&includeInactive=optional
 * Canonical endpoint for dashboard summary data
 * For ADMIN: includeInactive defaults to true (shows all students)
 * For COACH: includeInactive defaults to false (shows only active students)
 */
router.get("/summary", authRequired, dashboardCache(async (req, res) => {
  const { id: userId, role } = req.user!;
  const { from, to, centerId, includeInactive } = req.query as {
    from?: string;
    to?: string;
    centerId?: string;
    includeInactive?: string;
  };

  // Default includeInactive based on role: true for ADMIN, false for COACH
  const shouldIncludeInactive = includeInactive !== undefined 
    ? includeInactive === "true" 
    : role === "ADMIN";

  const wherePayments: any = {};
  if (from) wherePayments.paymentDate = { gte: new Date(from) };
  if (to) {
    wherePayments.paymentDate = {
      ...(wherePayments.paymentDate || {}),
      lte: new Date(to)
    };
  }

  let centerFilterIds: number[] | undefined;
  if (role === "COACH") {
    centerFilterIds = await getCoachCenterIds(userId);
    wherePayments.centerId = { in: centerFilterIds };
  } else if (centerId) {
    wherePayments.centerId = Number(centerId);
  }

  // Use aggregate for total collected instead of fetching all payments
  const paymentAggregate = await prisma.payment.aggregate({
    where: wherePayments,
    _sum: { amount: true }
  });
  const totalCollected = paymentAggregate._sum.amount || 0;

  const studentWhere: any = {};
  if (centerFilterIds) studentWhere.centerId = { in: centerFilterIds };
  if (centerId && role === "ADMIN") studentWhere.centerId = Number(centerId);
  
  // Apply status filter only if includeInactive is false
  if (!shouldIncludeInactive) {
    studentWhere.status = "ACTIVE";
  }

  // Use count for student counts instead of fetching all
  const studentCount = await prisma.student.count({
    where: studentWhere
  });
  
  const activeStudentCount = await prisma.student.count({
    where: { ...studentWhere, status: "ACTIVE" }
  });

  // Only fetch students if we need to calculate outstanding (cap for performance)
  let totalOutstanding = 0;
  if (studentCount > 0 && studentCount <= 500) {
    const students = await prisma.student.findMany({
      where: studentWhere,
      take: 500,
      select: {
        id: true,
        status: true,
        joiningDate: true,
        monthlyFeeAmount: true,
        paymentFrequency: true,
        churnedDate: true
      }
    });

    const now = getSystemDate();
    const studentIds = students.map(s => s.id);
    if (studentIds.length > 0) {
      // Only load payments from last 3 years to avoid huge query
      const paymentsStart = new Date(now.getFullYear() - 3, now.getMonth(), 1);
      const allStudentPayments = await prisma.payment.findMany({
        where: {
          studentId: { in: studentIds },
          paymentDate: { gte: paymentsStart }
        }
      });
  
      // Group payments by student ID for quick lookup
      const paymentsByStudent: { [key: number]: number } = {};
      allStudentPayments.forEach(p => {
        paymentsByStudent[p.studentId] = (paymentsByStudent[p.studentId] || 0) + p.amount;
      });
      
      // Calculate outstanding for each student
      for (const student of students) {
        if (student.joiningDate) {
          const joining = new Date(student.joiningDate);
          
          // If student is churned, only calculate fees up to churn date
          const endDate = (student as any).churnedDate ? new Date((student as any).churnedDate) : now;
          
          // Calculate months including the churn month (or current month if not churned)
          // Payment is due at the beginning of each month
          const monthsElapsed = Math.max(
            1, // At least 1 month (the joining month itself)
            (endDate.getFullYear() - joining.getFullYear()) * 12 + 
            (endDate.getMonth() - joining.getMonth()) + 1 // +1 to include churn month or current month
          );
          
          // Calculate how many COMPLETE payment cycles have passed up to churn date
          // Use Math.floor to only count complete cycles
          const paymentFrequency = student.paymentFrequency || 1;
          const cyclesCompleted = Math.floor(monthsElapsed / paymentFrequency);
          const expectedAmount = cyclesCompleted * (student.monthlyFeeAmount * paymentFrequency);
          
          // Get student's total paid from the pre-fetched data
          const studentTotalPaid = paymentsByStudent[student.id] || 0;
          
          const studentOutstanding = Math.max(0, expectedAmount - studentTotalPaid);
          totalOutstanding += studentOutstanding;
        }
      }
    }
  }

  res.json({
    totalCollected,
    studentCount,
    activeStudentCount,
    approxOutstanding: totalOutstanding
  });
}));

/**
 * GET /dashboard/revenue-collections?months=12&centerId=1&paymentMode=UPI
 * Chart 1: Revenue Collections - Simple sum of payments by payment date
 */
router.get("/revenue-collections", authRequired, dashboardCache(async (req, res) => {
  const { id: userId, role } = req.user!;
  const { months, centerId, paymentMode } = req.query as {
    months?: string;
    centerId?: string;
    paymentMode?: string;
  };

  if (isDev) console.log(`[REVENUE-DEBUG] Revenue collections request:`, { months, centerId, paymentMode, role, userId });

  // Parse number of months (default 12, max 24)
  const numMonths = Math.min(Math.max(parseInt(months || "12"), 1), 24);

  let centerFilterIds: number[] | undefined;
  if (role === "COACH") {
    centerFilterIds = await getCoachCenterIds(userId);
  }

  const wherePayments: any = {};
  
  // Center filter
  if (centerId && role === "ADMIN") {
    wherePayments.centerId = Number(centerId);
  } else if (centerFilterIds) {
    wherePayments.centerId = { in: centerFilterIds };
  }

  // Payment mode filter
  if (paymentMode && paymentMode !== "all") {
    wherePayments.paymentMode = paymentMode;
  }

  // Calculate date range for the last N months from SYSTEM DATE
  // For 12 months: include current month + previous 11 months
  const now = getSystemDate();
  // Start from the first day of the month that is (numMonths-1) months ago
  const startDate = new Date(now.getFullYear(), now.getMonth() - (numMonths - 1), 1);
  startDate.setHours(0, 0, 0, 0);
  // End at the last moment of the current month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Add date filter to payment query
  wherePayments.paymentDate = {
    gte: startDate,
    lte: endDate
  };

  console.log(`[REVENUE-DEBUG] Payment where clause:`, JSON.stringify(wherePayments));
  console.log(`[REVENUE-DEBUG] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  console.log(`[REVENUE-DEBUG] Requested ${numMonths} months, current date: ${now.toISOString()}`);

  // OPTIMIZED: Use aggregation to get monthly totals instead of fetching all payments
  // This prevents loading thousands of records into memory
  try {
    // First, get a count to see if we have data
    const paymentCount = await prisma.payment.count({ where: wherePayments });
    if (isDev) console.log(`[REVENUE-DEBUG] Found ${paymentCount} payments in date range`);
    
    if (paymentCount === 0) {
      // Return empty months array
      const monthsArray = [];
      for (let i = numMonths - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthsArray.push({ month: monthName, monthKey: monthKey, amount: 0 });
      }
      return res.json(monthsArray);
    }

    // Get payments with safety limit to prevent loading too many records
    const payments = await prisma.payment.findMany({
      where: wherePayments,
      select: {
        paymentDate: true,
        amount: true
      },
      orderBy: { paymentDate: "asc" },
      take: 10000, // Safety limit to prevent timeouts
    });

    if (payments.length > 0) {
      const firstPayment = payments[0];
      const lastPayment = payments[payments.length - 1];
      if (isDev) {
        console.log(`[REVENUE-DEBUG] Payment date range: ${firstPayment.paymentDate.toISOString()} to ${lastPayment.paymentDate.toISOString()}`);
        console.log(`[REVENUE-DEBUG] Total payment amount: ${payments.reduce((sum, p) => sum + p.amount, 0)}`);
      }
    }

    // Group payments by payment date month (simple sum)
    const monthlyData: { [key: string]: number } = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
    });

    if (isDev) console.log(`[REVENUE-DEBUG] Monthly data grouped:`, Object.keys(monthlyData).length, 'months');

    // Get last N months from SYSTEM DATE
    const monthsArray = [];
    
    for (let i = numMonths - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      monthsArray.push({
        month: monthName,
        monthKey: monthKey,
        amount: monthlyData[monthKey] || 0
      });
    }

    const totalAmount = monthsArray.reduce((sum, m) => sum + m.amount, 0);
    if (isDev) console.log(`[REVENUE-DEBUG] Returning ${monthsArray.length} months, total amount: ${totalAmount}`);

    res.json(monthsArray);
  } catch (error: any) {
    console.error("Error fetching revenue collections:", error);
    res.status(500).json({ 
      message: error.message || "Failed to fetch revenue collections",
      error: "Database query failed or timed out"
    });
  }
}));

/**
 * GET /dashboard/monthly-collections?months=12&centerId=1&paymentMode=UPI
 * Chart 2: Monthly Collections - Allocated across months based on student frequency
 */
router.get("/monthly-collections", authRequired, dashboardCache(async (req, res) => {
  const { id: userId, role } = req.user!;
  const { months, centerId, paymentMode } = req.query as {
    months?: string;
    centerId?: string;
    paymentMode?: string;
  };

  // Parse number of months (default 12, max 24)
  const numMonths = Math.min(Math.max(parseInt(months || "12"), 1), 24);

  let centerFilterIds: number[] | undefined;
  if (role === "COACH") {
    centerFilterIds = await getCoachCenterIds(userId);
  }

  const wherePayments: any = {};
  
  // Center filter
  if (centerId && role === "ADMIN") {
    wherePayments.centerId = Number(centerId);
  } else if (centerFilterIds) {
    wherePayments.centerId = { in: centerFilterIds };
  }

  // Payment mode filter
  if (paymentMode && paymentMode !== "all") {
    wherePayments.paymentMode = paymentMode;
  }

  // Get all students that match the filter (cap for performance)
  const studentWhere: any = {};
  if (centerId && role === "ADMIN") {
    studentWhere.centerId = Number(centerId);
  } else if (centerFilterIds) {
    studentWhere.centerId = { in: centerFilterIds };
  }

  // Only load payments in a bounded date range (chart shows last numMonths; allow extra for late allocation)
  const now = getSystemDate();
  const paymentsStart = new Date(now.getFullYear(), now.getMonth() - (numMonths + 24), 1);
  const paymentsEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const paymentWhere: any = {
    paymentDate: { gte: paymentsStart, lte: paymentsEnd }
  };
  if (paymentMode && paymentMode !== "all") {
    paymentWhere.paymentMode = paymentMode;
  }

  const students = await prisma.student.findMany({
    where: studentWhere,
    take: 5000,
    include: {
      payments: {
        where: paymentWhere,
        orderBy: { paymentDate: "asc" }
      }
    }
  });

  // Initialize monthly allocation
  const monthlyAllocated: { [key: string]: number } = {};
  
  // Process each student's payments independently
  for (const student of students) {
    if (student.payments.length === 0) continue;
    
    const monthlyFee = student.monthlyFeeAmount;
    const joiningDate = student.joiningDate ? new Date(student.joiningDate) : new Date(student.payments[0].paymentDate);
    const churnedDate = (student as any).churnedDate ? new Date((student as any).churnedDate) : null;
    
    // Start allocation from the payment month (not joining month)
    // This is because payment for a month is done at the beginning of that month
    let nextMonthToAllocate = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), 1);
    
    // Process each payment in chronological order
    for (const payment of student.payments) {
      const paymentDate = new Date(payment.paymentDate);
      const paymentMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
      let remainingAmount = payment.amount;
      
      // If churned, don't allocate beyond churn date
      if (churnedDate && paymentMonth > churnedDate) {
        continue; // Skip payments after churn date
      }
      
      // Calculate how many months are outstanding between nextMonthToAllocate and paymentMonth
      const monthsGap = (paymentMonth.getFullYear() - nextMonthToAllocate.getFullYear()) * 12 +
                        (paymentMonth.getMonth() - nextMonthToAllocate.getMonth());
      
      // Fill outstanding months first (if payment is late), but not beyond churn date
      if (monthsGap > 0) {
        for (let i = 0; i < monthsGap && remainingAmount >= monthlyFee; i++) {
          // Stop if we've reached churn date
          if (churnedDate && nextMonthToAllocate > churnedDate) {
            break;
          }
          const monthKey = `${nextMonthToAllocate.getFullYear()}-${String(nextMonthToAllocate.getMonth() + 1).padStart(2, '0')}`;
          monthlyAllocated[monthKey] = (monthlyAllocated[monthKey] || 0) + monthlyFee;
          remainingAmount -= monthlyFee;
          nextMonthToAllocate.setMonth(nextMonthToAllocate.getMonth() + 1);
        }
      }
      
      // Allocate remaining amount starting from payment month (or next unpaid month)
      // Stop if we've reached churn date
      while (remainingAmount >= monthlyFee) {
        // Stop if we've reached churn date
        if (churnedDate && nextMonthToAllocate > churnedDate) {
          break;
        }
        const monthKey = `${nextMonthToAllocate.getFullYear()}-${String(nextMonthToAllocate.getMonth() + 1).padStart(2, '0')}`;
        monthlyAllocated[monthKey] = (monthlyAllocated[monthKey] || 0) + monthlyFee;
        remainingAmount -= monthlyFee;
        nextMonthToAllocate.setMonth(nextMonthToAllocate.getMonth() + 1);
      }
      
      // Allocate any remainder (only if before churn date)
      if (remainingAmount > 0) {
        if (!churnedDate || nextMonthToAllocate <= churnedDate) {
          const monthKey = `${nextMonthToAllocate.getFullYear()}-${String(nextMonthToAllocate.getMonth() + 1).padStart(2, '0')}`;
          monthlyAllocated[monthKey] = (monthlyAllocated[monthKey] || 0) + remainingAmount;
        }
      }
    }
  }

  // Get all months that have allocations (including future months)
  const allMonthKeys = Object.keys(monthlyAllocated).sort();
  
  if (allMonthKeys.length === 0) {
    return res.json([]);
  }
  
  // Find the range from earliest to latest month with allocation
  const firstMonthKey = allMonthKeys[0];
  const lastMonthKey = allMonthKeys[allMonthKeys.length - 1];
  
  const [firstYear, firstMonth] = firstMonthKey.split('-').map(Number);
  const [lastYear, lastMonth] = lastMonthKey.split('-').map(Number);
  
  const startDate = new Date(firstYear, firstMonth - 1, 1);
  const endDate = new Date(lastYear, lastMonth - 1, 1);
  
  // Generate array of all months in range
  const monthsArray = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    monthsArray.push({
      month: monthName,
      monthKey: monthKey,
      amount: monthlyAllocated[monthKey] || 0
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  res.json(monthsArray);
}));

/**
 * GET /dashboard/revenue-filter-options
 * Metadata-only endpoint used to populate Revenue Dashboard filters.
 */
router.get("/revenue-filter-options", authRequired, dashboardCache(async (req, res) => {
  const { id: userId, role } = req.user!;

  let allowedCenterIds: number[] | undefined;
  if (role === "COACH") {
    allowedCenterIds = await getCoachCenterIds(userId);
  }

  const filtersMeta = await getRevenueFilterMeta(role, allowedCenterIds);
  res.json(filtersMeta);
}));

/**
 * GET /dashboard/revenue-analytics
 * Full revenue analytics payload for admin revenue dashboard.
 */
router.get("/revenue-analytics", authRequired, dashboardCache(async (req, res) => {
  const { id: userId, role } = req.user!;
  const {
    centerIds,
    programmes,
    statuses,
    paymentFrequency,
    datePreset,
    dateFrom,
    dateTo,
  } = req.query as {
    centerIds?: string;
    programmes?: string;
    statuses?: string;
    paymentFrequency?: string;
    datePreset?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  const now = getSystemDate();
  const resolved = resolveDateRange(datePreset, now, dateFrom, dateTo);
  const monthStarts = getMonthStarts(resolved.from, resolved.to);
  const monthCount = Math.max(1, monthStarts.length);

  let allowedCenterIds: number[] | undefined;
  if (role === "COACH") {
    allowedCenterIds = await getCoachCenterIds(userId);
  }

  const requestedCenterIds = parseCsvNumbers(centerIds);
  const requestedProgrammes = parseCsvStrings(programmes);
  const requestedStatuses = parseCsvStrings(statuses).map((s) => s.toUpperCase());
  const requestedFrequency = paymentFrequency && paymentFrequency !== "all" ? Number(paymentFrequency) : undefined;

  const studentWhere: any = {};
  if (requestedCenterIds.length > 0) {
    studentWhere.centerId = { in: requestedCenterIds };
  }
  if (allowedCenterIds) {
    if (studentWhere.centerId?.in) {
      studentWhere.centerId = { in: studentWhere.centerId.in.filter((id: number) => allowedCenterIds!.includes(id)) };
    } else {
      studentWhere.centerId = { in: allowedCenterIds };
    }
  }
  if (requestedProgrammes.length > 0) {
    studentWhere.programType = { in: requestedProgrammes };
  }
  if (requestedStatuses.length > 0) {
    studentWhere.status = { in: requestedStatuses };
  }
  if (requestedFrequency !== undefined && Number.isFinite(requestedFrequency)) {
    studentWhere.paymentFrequency = requestedFrequency;
  }

  const [filtersMeta, students] = await Promise.all([
    getRevenueFilterMeta(role, allowedCenterIds),
    prisma.student.findMany({
      where: studentWhere,
      include: {
        center: { select: { id: true, name: true } },
      },
      orderBy: { fullName: "asc" },
      take: 10000,
    }),
  ]);

  const studentIds = students.map((s) => s.id);
  const inRangePaymentsWhere: any = {
    paymentDate: { gte: resolved.from, lte: resolved.to },
  };
  if (studentIds.length > 0) {
    inRangePaymentsWhere.studentId = { in: studentIds };
  } else {
    inRangePaymentsWhere.studentId = -1;
  }

  const previousTo = new Date(resolved.from.getTime() - 1);
  const previousFrom = addMonths(resolved.from, -monthCount);
  const previousPaymentsWhere: any = {
    paymentDate: { gte: previousFrom, lte: previousTo },
  };
  if (studentIds.length > 0) {
    previousPaymentsWhere.studentId = { in: studentIds };
  } else {
    previousPaymentsWhere.studentId = -1;
  }

  const [paymentsInRange, previousPayments, lastPaymentsByStudent] = await Promise.all([
    prisma.payment.findMany({
      where: inRangePaymentsWhere,
      select: { studentId: true, amount: true, paymentDate: true },
      orderBy: { paymentDate: "asc" },
      take: 100000,
    }),
    prisma.payment.findMany({
      where: previousPaymentsWhere,
      select: { amount: true },
      take: 100000,
    }),
    studentIds.length > 0
      ? prisma.payment.groupBy({
          by: ["studentId"],
          where: { studentId: { in: studentIds } },
          _max: { paymentDate: true },
        })
      : Promise.resolve([] as any[]),
  ]);

  const totalCollected = paymentsInRange.reduce((sum, p) => sum + p.amount, 0);
  const previousCollected = previousPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRevenueDeltaPct = previousCollected > 0 ? ((totalCollected - previousCollected) / previousCollected) * 100 : 0;

  const paidByStudent = new Map<number, number>();
  const paidByMonth = new Map<string, number>();
  const paidByStudentMonth = new Map<string, number>();
  const payingPlayersByMonth = new Map<string, Set<number>>();
  for (const payment of paymentsInRange) {
    const monthKey = getMonthKey(payment.paymentDate);
    paidByStudent.set(payment.studentId, (paidByStudent.get(payment.studentId) || 0) + payment.amount);
    paidByMonth.set(monthKey, (paidByMonth.get(monthKey) || 0) + payment.amount);
    paidByStudentMonth.set(`${payment.studentId}:${monthKey}`, (paidByStudentMonth.get(`${payment.studentId}:${monthKey}`) || 0) + payment.amount);
    if (!payingPlayersByMonth.has(monthKey)) payingPlayersByMonth.set(monthKey, new Set<number>());
    payingPlayersByMonth.get(monthKey)!.add(payment.studentId);
  }

  const lastPaymentByStudent = new Map<number, Date>();
  for (const row of lastPaymentsByStudent) {
    if (row._max.paymentDate) {
      lastPaymentByStudent.set(row.studentId, row._max.paymentDate);
    }
  }

  const expectedByMonth = new Map<string, number>();
  const playerRows: Array<{
    id: number;
    fullName: string;
    centerId: number;
    centerName: string;
    programme: string;
    monthlyFeeAmount: number;
    paymentFrequency: number;
    status: string;
    monthsInPeriod: number;
    expected: number;
    paid: number;
    outstanding: number;
    collectionPct: number;
    lastPaymentDate: string | null;
    isActive: boolean;
  }> = [];

  for (const student of students) {
    const frequency = Math.max(1, student.paymentFrequency || 1);
    const monthlyEq = monthlyEquivalent(student.monthlyFeeAmount || 0, frequency);
    let activeMonthCount = 0;
    let expectedForStudent = 0;

    for (const monthStart of monthStarts) {
      const monthEnd = endOfMonth(monthStart);
      const isActiveInMonth = student.status === "ACTIVE" && intersectsMonth(student.joiningDate, (student as any).churnedDate, monthStart, monthEnd);
      if (isActiveInMonth) {
        activeMonthCount += 1;
        expectedForStudent += monthlyEq;
        const key = getMonthKey(monthStart);
        expectedByMonth.set(key, (expectedByMonth.get(key) || 0) + monthlyEq);
      }
    }

    const paid = paidByStudent.get(student.id) || 0;
    const expected = round2(expectedForStudent);
    const outstanding = Math.max(0, round2(expected - paid));
    const collectionPct = expected > 0 ? round2((paid / expected) * 100) : 0;

    playerRows.push({
      id: student.id,
      fullName: student.fullName,
      centerId: student.centerId,
      centerName: student.center?.name || "Unknown",
      programme: student.programType || "Unassigned",
      monthlyFeeAmount: student.monthlyFeeAmount || 0,
      paymentFrequency: frequency,
      status: student.status,
      monthsInPeriod: activeMonthCount,
      expected,
      paid,
      outstanding,
      collectionPct,
      lastPaymentDate: lastPaymentByStudent.get(student.id)?.toISOString() || null,
      isActive: student.status === "ACTIVE",
    });
  }

  const totalExpected = round2(playerRows.reduce((sum, row) => sum + row.expected, 0));
  const totalOutstanding = Math.max(0, round2(totalExpected - totalCollected));
  const collectionRate = totalExpected > 0 ? round2((totalCollected / totalExpected) * 100) : 0;
  const fullyPaidPlayers = playerRows.filter((row) => row.expected > 0 && row.outstanding <= 0).length;
  const pendingPlayers = playerRows.filter((row) => row.outstanding > 0).length;
  const activePlayers = playerRows.filter((row) => row.isActive).length;
  const avgMonthlyCollection = round2(totalCollected / monthCount);

  let peakMonth = { month: "-", monthKey: "", collected: 0 };
  const monthlyTrend = monthStarts.map((monthStart) => {
    const monthKey = getMonthKey(monthStart);
    const collected = paidByMonth.get(monthKey) || 0;
    const expected = round2(expectedByMonth.get(monthKey) || 0);
    const collectionPct = expected > 0 ? round2((collected / expected) * 100) : 0;
    const payingPlayers = payingPlayersByMonth.get(monthKey)?.size || 0;
    if (collected > peakMonth.collected) {
      peakMonth = { month: getMonthLabel(monthStart), monthKey, collected };
    }
    return {
      month: getMonthLabel(monthStart),
      monthKey,
      collected,
      expected,
      collectionPct,
      payingPlayers,
    };
  });

  const centerMap = new Map<string, { centerId: number; centerName: string; players: number; expected: number; collected: number; outstanding: number }>();
  const programmeMap = new Map<string, { programme: string; players: number; totalMonthlyFee: number; expected: number; collected: number; outstanding: number }>();
  for (const row of playerRows) {
    const centerKey = `${row.centerId}:${row.centerName}`;
    if (!centerMap.has(centerKey)) {
      centerMap.set(centerKey, { centerId: row.centerId, centerName: row.centerName, players: 0, expected: 0, collected: 0, outstanding: 0 });
    }
    const centerAgg = centerMap.get(centerKey)!;
    centerAgg.players += 1;
    centerAgg.expected += row.expected;
    centerAgg.collected += row.paid;
    centerAgg.outstanding += row.outstanding;

    const programmeKey = row.programme || "Unassigned";
    if (!programmeMap.has(programmeKey)) {
      programmeMap.set(programmeKey, { programme: programmeKey, players: 0, totalMonthlyFee: 0, expected: 0, collected: 0, outstanding: 0 });
    }
    const programmeAgg = programmeMap.get(programmeKey)!;
    programmeAgg.players += 1;
    programmeAgg.totalMonthlyFee += row.monthlyFeeAmount;
    programmeAgg.expected += row.expected;
    programmeAgg.collected += row.paid;
    programmeAgg.outstanding += row.outstanding;
  }

  const centerTable = Array.from(centerMap.values()).map((row) => ({
    centerId: row.centerId,
    centerName: row.centerName,
    players: row.players,
    expected: round2(row.expected),
    collected: round2(row.collected),
    outstanding: round2(row.outstanding),
    collectionPct: row.expected > 0 ? round2((row.collected / row.expected) * 100) : 0,
  }));

  const centreMonthlyBreakdown = monthStarts.map((monthStart) => {
    const monthKey = getMonthKey(monthStart);
    const centres = centerTable.map((center) => {
      const centerStudents = playerRows.filter((row) => row.centerId === center.centerId);
      const collected = centerStudents.reduce((sum, row) => sum + (paidByStudentMonth.get(`${row.id}:${monthKey}`) || 0), 0);
      return {
        centerId: center.centerId,
        centerName: center.centerName,
        collected,
      };
    });
    return {
      month: getMonthLabel(monthStart),
      monthKey,
      centres,
    };
  });

  const programmeBreakdown = Array.from(programmeMap.values())
    .map((row) => ({
      programme: row.programme,
      players: row.players,
      monthlyFee: row.players > 0 ? round2(row.totalMonthlyFee / row.players) : 0,
      totalExpected: round2(row.expected),
      totalCollected: round2(row.collected),
      outstanding: round2(row.outstanding),
      collectionPct: row.expected > 0 ? round2((row.collected / row.expected) * 100) : 0,
    }))
    .sort((a, b) => b.totalCollected - a.totalCollected);

  const topProgramme = programmeBreakdown[0] || null;
  const revenuePerPlayer = activePlayers > 0 ? round2(totalCollected / activePlayers) : 0;

  const currentMonthStart = startOfMonth(resolved.to);
  const currentMonthEnd = endOfMonth(resolved.to);
  const newThisMonth = students.filter((s) =>
    s.status === "ACTIVE" &&
    s.joiningDate &&
    new Date(s.joiningDate) >= currentMonthStart &&
    new Date(s.joiningDate) <= currentMonthEnd
  ).length;
  const droppedThisMonth = students.filter((s) =>
    (s as any).churnedDate &&
    new Date((s as any).churnedDate) >= currentMonthStart &&
    new Date((s as any).churnedDate) <= currentMonthEnd
  ).length;

  const outstandingPlayers = [...playerRows]
    .filter((row) => row.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .map((row) => ({
      playerId: row.id,
      playerName: row.fullName,
      center: row.centerName,
      programme: row.programme,
      amountDue: round2(row.outstanding),
      lastPaymentDate: row.lastPaymentDate,
    }));

  res.json({
    filtersMeta,
    applied: {
      centerIds: requestedCenterIds,
      programmes: requestedProgrammes,
      statuses: requestedStatuses,
      paymentFrequency: requestedFrequency || "all",
      datePreset: resolved.preset,
      dateFrom: resolved.from.toISOString(),
      dateTo: resolved.to.toISOString(),
    },
    period: {
      months: monthCount,
      from: resolved.from.toISOString(),
      to: resolved.to.toISOString(),
      previousFrom: previousFrom.toISOString(),
      previousTo: previousTo.toISOString(),
    },
    summary: {
      totalRevenue: round2(totalCollected),
      previousPeriodRevenue: round2(previousCollected),
      revenueChangePct: round2(totalRevenueDeltaPct),
      averageMonthlyCollection: avgMonthlyCollection,
      peakMonth,
      collectionRate,
      fullyPaidPlayers,
      totalPlayersConsidered: playerRows.length,
      activePlayers,
      activePlayersDeltaThisMonth: { new: newThisMonth, dropped: droppedThisMonth },
      outstandingDues: totalOutstanding,
      pendingPlayers,
      revenuePerPlayer,
      topProgramme: topProgramme
        ? { name: topProgramme.programme, monthlyFee: topProgramme.monthlyFee }
        : null,
    },
    tabs: {
      monthlyTrend,
      centerMonthlyBreakdown: centreMonthlyBreakdown,
      centerTable,
      programmeBreakdown,
      playerDetails: playerRows,
      outstandingPlayers,
    },
    updatedAt: new Date().toISOString(),
  });
}));

/**
 * GET /dashboard/payment-mode-breakdown
 * Get payment breakdown by payment mode
 */
router.get("/payment-mode-breakdown", authRequired, dashboardCache(async (req, res) => {
  const { role, id: userId } = req.user!;

  try {
    let whereClause: any = {};

    // Coach can only see their centers
    if (role === "COACH") {
      const centerIds = await getCoachCenterIds(userId);
      whereClause.centerId = { in: centerIds };
    }

    // Get all payments grouped by payment mode
    const payments = await prisma.payment.findMany({
      where: whereClause,
      select: {
        paymentMode: true,
        amount: true
      }
    });

    // Group by payment mode
    const modeMap = new Map<string, { total: number; count: number }>();
    let grandTotal = 0;

    payments.forEach(payment => {
      const mode = payment.paymentMode || "Unknown";
      const existing = modeMap.get(mode) || { total: 0, count: 0 };
      modeMap.set(mode, {
        total: existing.total + payment.amount,
        count: existing.count + 1
      });
      grandTotal += payment.amount;
    });

    // Convert to array with percentages
    const breakdown = Array.from(modeMap.entries()).map(([mode, data]) => ({
      mode,
      total: data.total,
      count: data.count,
      percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0
    }));

    // Sort by total descending
    breakdown.sort((a, b) => b.total - a.total);

    res.json(breakdown);
  } catch (error: any) {
    console.error("Error fetching payment mode breakdown:", error);
    res.status(500).json({ message: error.message || "Failed to fetch payment mode breakdown" });
  }
}));

/**
 * GET /dashboard/fan-club-revenue
 * Get fan club revenue analytics (tier subscriptions)
 */
router.get("/fan-club-revenue", authRequired, async (req, res) => {
  try {
    const tiers = await (prisma as any).fanTier?.findMany({
      where: { isActive: true },
      select: { id: true, name: true, monthlyPriceINR: true, yearlyPriceINR: true, sortOrder: true },
      orderBy: { sortOrder: "asc" }
    }) || [];

    const profiles = await (prisma as any).fanProfile?.findMany({
      where: {
        tierId: { not: null },
        user: { status: "ACTIVE" }
      },
      select: {
        id: true,
        tierId: true,
        joinedAt: true,
        user: { select: { status: true } }
      }
    }) || [];

    // Calculate revenue by tier
    interface RevenueByTier {
      tierId: number;
      tierName: string;
      fanCount: number;
      monthlyPrice: number;
      yearlyPrice: number;
      projectedMonthlyRevenue: number;
      projectedYearlyRevenue: number;
    }

    const revenueByTier: RevenueByTier[] = tiers.map((tier: any) => {
      const fansInTier = profiles.filter((p: any) => p.tierId === tier.id);
      const monthlyRevenue = fansInTier.length * tier.monthlyPriceINR;
      const yearlyRevenue = fansInTier.length * tier.yearlyPriceINR;
      
      return {
        tierId: tier.id,
        tierName: tier.name,
        fanCount: fansInTier.length,
        monthlyPrice: tier.monthlyPriceINR,
        yearlyPrice: tier.yearlyPriceINR,
        projectedMonthlyRevenue: monthlyRevenue,
        projectedYearlyRevenue: yearlyRevenue
      };
    });

    const totalFans = profiles.length;
    const totalProjectedMonthly = revenueByTier.reduce((sum: number, t: RevenueByTier) => sum + t.projectedMonthlyRevenue, 0);
    const totalProjectedYearly = revenueByTier.reduce((sum: number, t: RevenueByTier) => sum + t.projectedYearlyRevenue, 0);

    res.json({
      totalFans,
      totalProjectedMonthlyRevenue: totalProjectedMonthly,
      totalProjectedYearlyRevenue: totalProjectedYearly,
      revenueByTier,
      tierDistribution: revenueByTier.map((t: RevenueByTier) => ({
        tierName: t.tierName,
        fanCount: t.fanCount,
        percentage: totalFans > 0 ? (t.fanCount / totalFans) * 100 : 0
      }))
    });
  } catch (error: any) {
    console.error("Error fetching fan club revenue:", error);
    res.status(500).json({ message: error.message || "Failed to fetch fan club revenue" });
  }
});

/**
 * GET /dashboard/comprehensive-finance
 * Get comprehensive financial overview including all revenue streams
 */
router.get("/comprehensive-finance", authRequired, async (req, res) => {
  try {
    const { centerId } = req.query as { centerId?: string };

    // Get student finance summary
    const studentSummary = await prisma.payment.aggregate({
      where: centerId ? { centerId: Number(centerId) } : {},
      _sum: { amount: true },
      _count: { id: true }
    });

    const students = await prisma.student.findMany({
      where: centerId ? { centerId: Number(centerId) } : {},
      select: {
        id: true,
        joiningDate: true,
        monthlyFeeAmount: true,
        paymentFrequency: true,
        churnedDate: true,
        centerId: true
      }
    });

    // Calculate outstanding (same logic as summary endpoint)
    const allPayments = await prisma.payment.findMany({
      where: centerId ? { centerId: Number(centerId) } : {}
    });
    const paymentsByStudent: { [key: number]: number } = {};
    allPayments.forEach(p => {
      paymentsByStudent[p.studentId] = (paymentsByStudent[p.studentId] || 0) + p.amount;
    });

    const now = getSystemDate();
    let totalOutstanding = 0;
    for (const student of students) {
      if (!student.joiningDate) continue;
      const joining = new Date(student.joiningDate);
      const endDate = student.churnedDate ? new Date(student.churnedDate) : now;
      const monthsElapsed = Math.max(1, (endDate.getFullYear() - joining.getFullYear()) * 12 + (endDate.getMonth() - joining.getMonth()) + 1);
      const paymentFrequency = student.paymentFrequency || 1;
      const cyclesCompleted = Math.floor(monthsElapsed / paymentFrequency);
      const expectedAmount = cyclesCompleted * (student.monthlyFeeAmount * paymentFrequency);
      const studentTotalPaid = paymentsByStudent[student.id] || 0;
      const studentOutstanding = Math.max(0, expectedAmount - studentTotalPaid);
      totalOutstanding += studentOutstanding;
    }

    // Get fan club revenue
    const fanProfiles = await (prisma as any).fanProfile?.findMany({
      where: {
        tierId: { not: null },
        user: { status: "ACTIVE" }
      },
      include: {
        tier: {
          select: { monthlyPriceINR: true, yearlyPriceINR: true }
        }
      }
    }) || [];

    const fanMonthlyRevenue = fanProfiles.reduce((sum: number, p: any) => 
      sum + (p.tier?.monthlyPriceINR || 0), 0);
    const fanYearlyRevenue = fanProfiles.reduce((sum: number, p: any) => 
      sum + (p.tier?.yearlyPriceINR || 0), 0);

    // Total revenue
    const totalRevenue = (studentSummary._sum.amount || 0) + fanMonthlyRevenue;

    res.json({
      studentFinance: {
        totalCollected: studentSummary._sum.amount || 0,
        studentCount: students.length,
        outstanding: totalOutstanding,
        collectionRate: (studentSummary._sum.amount || 0) > 0 
          ? ((studentSummary._sum.amount || 0) / ((studentSummary._sum.amount || 0) + totalOutstanding)) * 100 
          : 0
      },
      fanClubFinance: {
        totalFans: fanProfiles.length,
        projectedMonthlyRevenue: fanMonthlyRevenue,
        projectedYearlyRevenue: fanYearlyRevenue
      },
      totalRevenue,
      revenueBreakdown: {
        student: studentSummary._sum.amount || 0,
        fanClub: fanMonthlyRevenue
      }
    });
  } catch (error: any) {
    console.error("Error fetching comprehensive finance:", error);
    res.status(500).json({ message: error.message || "Failed to fetch comprehensive finance" });
  }
});

export default router;


import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";

const router = Router();

async function getCoachCenterIds(coachId: number) {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return links.map((l) => l.centerId);
}

/**
 * GET /dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&centerId=optional&includeInactive=optional
 * Canonical endpoint for dashboard summary data
 * For ADMIN: includeInactive defaults to true (shows all students)
 * For COACH: includeInactive defaults to false (shows only active students)
 */
router.get("/summary", authRequired, async (req, res) => {
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

  // Only fetch students if we need to calculate outstanding
  // For now, skip outstanding calculation if there are too many students (performance)
  let totalOutstanding = 0;
  if (studentCount <= 1000) { // Only calculate if reasonable number of students
    const students = await prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        status: true,
        joiningDate: true,
        monthlyFeeAmount: true,
        paymentFrequency: true,
        churnedDate: true
      }
    });

    // Calculate total outstanding based on payment frequency and time elapsed
    // Payment is made at the BEGINNING of the month for that month's service
    const now = getSystemDate(); // Use system date for calculations
    
    // Fetch all payments for all students in one query (much faster)
    const studentIds = students.map(s => s.id);
    if (studentIds.length > 0) {
      const allStudentPayments = await prisma.payment.findMany({
        where: { 
          studentId: { in: studentIds }
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
});

/**
 * GET /dashboard/revenue-collections?months=12&centerId=1&paymentMode=UPI
 * Chart 1: Revenue Collections - Simple sum of payments by payment date
 */
router.get("/revenue-collections", authRequired, async (req, res) => {
  const { id: userId, role } = req.user!;
  const { months, centerId, paymentMode } = req.query as {
    months?: string;
    centerId?: string;
    paymentMode?: string;
  };

  console.log(`[REVENUE-DEBUG] Revenue collections request:`, { months, centerId, paymentMode, role, userId });

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
    console.log(`[REVENUE-DEBUG] Found ${paymentCount} payments in date range`);
    
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
      console.log(`[REVENUE-DEBUG] Payment date range: ${firstPayment.paymentDate.toISOString()} to ${lastPayment.paymentDate.toISOString()}`);
      console.log(`[REVENUE-DEBUG] Total payment amount: ${payments.reduce((sum, p) => sum + p.amount, 0)}`);
    }

    // Group payments by payment date month (simple sum)
    const monthlyData: { [key: string]: number } = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
    });

    console.log(`[REVENUE-DEBUG] Monthly data grouped:`, Object.keys(monthlyData).length, 'months');

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
    console.log(`[REVENUE-DEBUG] Returning ${monthsArray.length} months, total amount: ${totalAmount}`);

    res.json(monthsArray);
  } catch (error: any) {
    console.error(`[REVENUE-DEBUG] Error fetching revenue collections:`, error);
    res.status(500).json({ 
      message: error.message || "Failed to fetch revenue collections",
      error: "Database query failed or timed out"
    });
  }
});

/**
 * GET /dashboard/monthly-collections?months=12&centerId=1&paymentMode=UPI
 * Chart 2: Monthly Collections - Allocated across months based on student frequency
 */
router.get("/monthly-collections", authRequired, async (req, res) => {
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

  // Get all students that match the filter
  const studentWhere: any = {};
  if (centerId && role === "ADMIN") {
    studentWhere.centerId = Number(centerId);
  } else if (centerFilterIds) {
    studentWhere.centerId = { in: centerFilterIds };
  }

  const students = await prisma.student.findMany({
    where: studentWhere,
    include: {
      payments: {
        where: paymentMode && paymentMode !== "all" ? { paymentMode } : {},
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
});

/**
 * GET /dashboard/payment-mode-breakdown
 * Get payment breakdown by payment mode
 */
router.get("/payment-mode-breakdown", authRequired, async (req, res) => {
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
});

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
 * GET /dashboard/shop-revenue
 * Get shop/order revenue analytics
 */
router.get("/shop-revenue", authRequired, async (req, res) => {
  try {
    const { months } = req.query as { months?: string };
    const numMonths = Math.min(Math.max(parseInt(months || "12"), 1), 24);

    // Get date range
    const now = getSystemDate();
    const startDate = new Date(now.getFullYear(), now.getMonth() - numMonths, 1);

    // Get all orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, category: true }
            }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    // Calculate totals
    const paidOrders = orders.filter(o => o.status === "PAID");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const paidOrdersCount = paidOrders.length;
    const pendingOrders = orders.filter(o => o.status === "PENDING_PAYMENT");
    const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.total, 0);

    // Group by month
    const monthlyRevenue: { [key: string]: number } = {};
    const monthlyOrders: { [key: string]: number } = {};
    
    paidOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + order.total;
      monthlyOrders[monthKey] = (monthlyOrders[monthKey] || 0) + 1;
    });

    // Generate month array
    const monthsArray = [];
    for (let i = numMonths - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      monthsArray.push({
        month: monthName,
        monthKey: monthKey,
        revenue: monthlyRevenue[monthKey] || 0,
        orders: monthlyOrders[monthKey] || 0
      });
    }

    // Product category breakdown
    const categoryRevenue: { [key: string]: number } = {};
    paidOrders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product?.category || "Uncategorized";
        categoryRevenue[category] = (categoryRevenue[category] || 0) + item.totalPrice;
      });
    });

    const categoryBreakdown = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.revenue - a.revenue);

    // Average order value
    const avgOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

    res.json({
      totalRevenue,
      totalOrders,
      paidOrdersCount,
      pendingOrdersCount: pendingOrders.length,
      pendingRevenue,
      avgOrderValue,
      monthlyTrend: monthsArray,
      categoryBreakdown,
      conversionRate: totalOrders > 0 ? (paidOrdersCount / totalOrders) * 100 : 0
    });
  } catch (error: any) {
    console.error("Error fetching shop revenue:", error);
    res.status(500).json({ message: error.message || "Failed to fetch shop revenue" });
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

    // Get shop revenue
    const paidOrders = await prisma.order.findMany({
      where: { status: "PAID" }
    });
    const shopRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // Total revenue
    const totalRevenue = (studentSummary._sum.amount || 0) + fanMonthlyRevenue + shopRevenue;

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
      shopFinance: {
        totalRevenue: shopRevenue,
        totalOrders: paidOrders.length,
        avgOrderValue: paidOrders.length > 0 ? Math.round(shopRevenue / paidOrders.length) : 0
      },
      totalRevenue,
      revenueBreakdown: {
        student: studentSummary._sum.amount || 0,
        fanClub: fanMonthlyRevenue,
        shop: shopRevenue
      }
    });
  } catch (error: any) {
    console.error("Error fetching comprehensive finance:", error);
    res.status(500).json({ message: error.message || "Failed to fetch comprehensive finance" });
  }
});

export default router;


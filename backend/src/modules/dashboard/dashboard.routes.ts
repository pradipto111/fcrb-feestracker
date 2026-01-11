import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";

const prisma = new PrismaClient();
const router = Router();

async function getCoachCenterIds(coachId: number) {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return links.map((l) => l.centerId);
}

/**
 * GET /dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&centerId=optional
 */
router.get("/summary", authRequired, async (req, res) => {
  const { id: userId, role } = req.user!;
  const { from, to, centerId } = req.query as {
    from?: string;
    to?: string;
    centerId?: string;
  };

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

  const payments = await prisma.payment.findMany({
    where: wherePayments
  });

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  const studentWhere: any = {};
  if (centerFilterIds) studentWhere.centerId = { in: centerFilterIds };
  if (centerId && role === "ADMIN") studentWhere.centerId = Number(centerId);

  const students = await prisma.student.findMany({
    where: studentWhere
  });

  const studentCount = students.length;

  // Calculate total outstanding based on payment frequency and time elapsed
  // Payment is made at the BEGINNING of the month for that month's service
  let totalOutstanding = 0;
  const now = getSystemDate(); // Use system date for calculations
  
  for (const student of students) {
    if (student.joiningDate) {
      const joining = new Date(student.joiningDate);
      
      // Calculate months including the current month
      // Payment is due at the beginning of each month
      const monthsElapsed = Math.max(
        1, // At least 1 month (the joining month itself)
        (now.getFullYear() - joining.getFullYear()) * 12 + 
        (now.getMonth() - joining.getMonth()) + 1 // +1 to include current month
      );
      
      // Calculate how many COMPLETE payment cycles have passed
      // Use Math.floor to only count complete cycles
      const paymentFrequency = student.paymentFrequency || 1;
      const cyclesCompleted = Math.floor(monthsElapsed / paymentFrequency);
      const expectedAmount = cyclesCompleted * (student.monthlyFeeAmount * paymentFrequency);
      
      // Get student's total paid
      const studentPayments = await prisma.payment.findMany({
        where: { studentId: student.id }
      });
      const studentTotalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const studentOutstanding = Math.max(0, expectedAmount - studentTotalPaid);
      totalOutstanding += studentOutstanding;
    }
  }

  res.json({
    totalCollected,
    studentCount,
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

  // Get all payments
  const payments = await prisma.payment.findMany({
    where: wherePayments,
    orderBy: { paymentDate: "asc" }
  });

  // Group payments by payment date month (simple sum)
  const monthlyData: { [key: string]: number } = {};
  
  payments.forEach(payment => {
    const date = new Date(payment.paymentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
  });

  // Get last N months from SYSTEM DATE
  const now = getSystemDate();
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

  res.json(monthsArray);
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
    
    // Start allocation from the payment month (not joining month)
    // This is because payment for a month is done at the beginning of that month
    let nextMonthToAllocate = new Date(joiningDate.getFullYear(), joiningDate.getMonth(), 1);
    
    // Process each payment in chronological order
    for (const payment of student.payments) {
      const paymentDate = new Date(payment.paymentDate);
      const paymentMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
      let remainingAmount = payment.amount;
      
      // Calculate how many months are outstanding between nextMonthToAllocate and paymentMonth
      const monthsGap = (paymentMonth.getFullYear() - nextMonthToAllocate.getFullYear()) * 12 +
                        (paymentMonth.getMonth() - nextMonthToAllocate.getMonth());
      
      // Fill outstanding months first (if payment is late)
      if (monthsGap > 0) {
        for (let i = 0; i < monthsGap && remainingAmount >= monthlyFee; i++) {
          const monthKey = `${nextMonthToAllocate.getFullYear()}-${String(nextMonthToAllocate.getMonth() + 1).padStart(2, '0')}`;
          monthlyAllocated[monthKey] = (monthlyAllocated[monthKey] || 0) + monthlyFee;
          remainingAmount -= monthlyFee;
          nextMonthToAllocate.setMonth(nextMonthToAllocate.getMonth() + 1);
        }
      }
      
      // Allocate remaining amount starting from payment month (or next unpaid month)
      while (remainingAmount >= monthlyFee) {
        const monthKey = `${nextMonthToAllocate.getFullYear()}-${String(nextMonthToAllocate.getMonth() + 1).padStart(2, '0')}`;
        monthlyAllocated[monthKey] = (monthlyAllocated[monthKey] || 0) + monthlyFee;
        remainingAmount -= monthlyFee;
        nextMonthToAllocate.setMonth(nextMonthToAllocate.getMonth() + 1);
      }
      
      // Allocate any remainder
      if (remainingAmount > 0) {
        const monthKey = `${nextMonthToAllocate.getFullYear()}-${String(nextMonthToAllocate.getMonth() + 1).padStart(2, '0')}`;
        monthlyAllocated[monthKey] = (monthlyAllocated[monthKey] || 0) + remainingAmount;
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

export default router;


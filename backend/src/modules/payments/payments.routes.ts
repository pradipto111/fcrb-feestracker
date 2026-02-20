import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";
import { logSystemActivity } from "../../utils/system-activity";

const router = Router();

async function getCoachCenterIds(coachId: number) {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return links.map((l) => l.centerId);
}

/**
 * POST /payments
 * body: { studentId, amount, paymentDate?, paymentMode, upiOrTxnReference?, notes? }
 * centerId inferred from student
 */
router.post("/", authRequired, async (req, res) => {
  const { id: userId, role } = req.user!;
  const { studentId, amount, paymentDate, paymentMode, upiOrTxnReference, notes } =
    req.body as {
      studentId: number;
      amount: number;
      paymentDate?: string;
      paymentMode: string;
      upiOrTxnReference?: string;
      notes?: string;
    };

  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });
  if (!student) return res.status(404).json({ message: "Student not found" });

  if (role === "COACH") {
    const centerIds = await getCoachCenterIds(userId);
    if (!centerIds.includes(student.centerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  // Create payment (wallet balance is calculated dynamically from totalPaid - feesAccrued)
  const payment = await prisma.payment.create({
    data: {
      studentId,
      centerId: student.centerId,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : getSystemDate(),
      paymentMode,
      upiOrTxnReference,
      notes
    }
  });

  // Log payment creation activity
  await logSystemActivity({
    actorType: role === "ADMIN" ? "ADMIN" : role === "COACH" ? "COACH" : role === "CRM" ? "CRM" : "ADMIN",
    actorId: userId,
    action: "PAYMENT_CREATED",
    entityType: "PAYMENT",
    entityId: payment.id,
    before: null,
    after: {
      amount,
      paymentMode,
      paymentDate: payment.paymentDate,
      studentId,
      centerId: student.centerId
    },
    metadata: {
      studentName: student.fullName,
      studentId,
      centerId: student.centerId,
      upiOrTxnReference,
      notes
    }
  });

  res.status(201).json(payment);
});

/**
 * POST /payments/deduct-fees
 * Manually trigger fee deduction for all eligible students
 * Only ADMIN can trigger this
 */
router.post("/deduct-fees", authRequired, async (req, res) => {
  const { role } = req.user!;
  
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Only admins can trigger fee deductions" });
  }

  try {
    const now = getSystemDate();
    
    // Get all active students (exclude churned students)
    const students = await prisma.student.findMany({
      where: {
        status: "ACTIVE",
        joiningDate: { not: null },
        churnedDate: null // Exclude churned students
      }
    });

    const deductionResults = [];

    for (const student of students) {
      const joining = new Date(student.joiningDate!);
      const paymentFrequency = student.paymentFrequency || 1;
      
      // Calculate months since joining (up to now, since student is not churned)
      const monthsElapsed = Math.max(
        0,
        (now.getFullYear() - joining.getFullYear()) * 12 + 
        (now.getMonth() - joining.getMonth())
      );

      // Check if we need to deduct fees for this student
      const lastDeduction = student.lastFeeDeduction ? new Date(student.lastFeeDeduction) : joining;
      const monthsSinceLastDeduction = Math.max(
        0,
        (now.getFullYear() - lastDeduction.getFullYear()) * 12 + 
        (now.getMonth() - lastDeduction.getMonth())
      );

      // If enough months have passed for a payment cycle, deduct the fees
      if (monthsSinceLastDeduction >= paymentFrequency) {
        const cyclesDeduct = Math.floor(monthsSinceLastDeduction / paymentFrequency);
        const feeAmount = student.monthlyFeeAmount * paymentFrequency * cyclesDeduct;

        // Deduct from wallet
        await prisma.student.update({
          where: { id: student.id },
          data: {
            walletBalance: {
              decrement: feeAmount
            },
            lastFeeDeduction: now
          }
        });

        deductionResults.push({
          studentId: student.id,
          studentName: student.fullName,
          feeDeducted: feeAmount,
          cyclesDeducted: cyclesDeduct,
          newBalance: student.walletBalance - feeAmount
        });
      }
    }

    res.json({
      message: "Fee deduction completed",
      studentsProcessed: students.length,
      deductionsMade: deductionResults.length,
      deductions: deductionResults
    });
  } catch (error: any) {
    console.error("Error deducting fees:", error);
    res.status(500).json({ message: error.message || "Failed to deduct fees" });
  }
});

/**
 * GET /payments/logs
 * Admin-only: Get payment activity logs
 */
router.get("/logs", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { page = 1, limit = 50, actorType, dateFrom, dateTo } = req.query as {
      page?: string;
      limit?: string;
      actorType?: string;
      dateFrom?: string;
      dateTo?: string;
    };

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      OR: [
        { entityType: "PAYMENT" },
        { entityType: "STUDENT", action: { contains: "PAYMENT" } },
        { entityType: "STUDENT", action: { contains: "FEES" } }
      ]
    };

    if (actorType) {
      where.actorType = actorType.toUpperCase();
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const [logs, total] = await Promise.all([
      (prisma as any).systemActivityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limitNum,
        skip
      }),
      (prisma as any).systemActivityLog.count({ where })
    ]);

    // Enrich logs with actor names
    const enrichedLogs = await Promise.all(
      logs.map(async (log: any) => {
        let actorName = "Unknown";
        let actorRole = log.actorType;

        if (log.actorId) {
          if (log.actorType === "ADMIN" || log.actorType === "COACH") {
            const coach = await prisma.coach.findUnique({
              where: { id: parseInt(log.actorId) },
              select: { fullName: true, role: true }
            });
            if (coach) {
              actorName = coach.fullName;
              actorRole = coach.role;
            }
          } else if (log.actorType === "CRM") {
            const crmUser = await (prisma as any).crmUser?.findUnique({
              where: { id: parseInt(log.actorId) },
              select: { fullName: true, role: true }
            });
            if (crmUser) {
              actorName = crmUser.fullName;
              actorRole = crmUser.role;
            }
          }
        }

        // Get student name from metadata or entity
        let studentName = "Unknown";
        if (log.metadata?.studentName) {
          studentName = log.metadata.studentName;
        } else if (log.entityType === "STUDENT") {
          const student = await prisma.student.findUnique({
            where: { id: parseInt(log.entityId) },
            select: { fullName: true }
          });
          if (student) {
            studentName = student.fullName;
          }
        } else if (log.entityType === "PAYMENT" && log.metadata?.studentId) {
          const student = await prisma.student.findUnique({
            where: { id: log.metadata.studentId },
            select: { fullName: true }
          });
          if (student) {
            studentName = student.fullName;
          }
        }

        return {
          id: log.id,
          timestamp: log.createdAt,
          actorType: log.actorType,
          actorName,
          actorRole,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          studentName,
          amount: log.after?.amount || log.metadata?.amount || null,
          before: log.before,
          after: log.after,
          metadata: log.metadata
        };
      })
    );

    res.json({
      logs: enrichedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    console.error("Error fetching payment logs:", error);
    res.status(500).json({ message: error.message || "Failed to fetch payment logs" });
  }
});

export default router;



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
    
    // Get all active students
    const students = await prisma.student.findMany({
      where: {
        status: "ACTIVE",
        joiningDate: { not: null }
      }
    });

    const deductionResults = [];

    for (const student of students) {
      const joining = new Date(student.joiningDate!);
      const paymentFrequency = student.paymentFrequency || 1;
      
      // Calculate months since joining
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

export default router;



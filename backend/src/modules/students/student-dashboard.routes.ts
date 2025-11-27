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

  // Get all payments for this student
  const payments = await prisma.payment.findMany({
    where: { studentId: id },
    orderBy: { paymentDate: "desc" }
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Calculate outstanding based on payment frequency and time elapsed
  // Payment is made at the BEGINNING of the month for that month's service
  let totalDue = 0;
  let monthsSinceJoining = 0;
  
  if (student.joiningDate) {
    const now = getSystemDate(); // Use system date for calculations
    const joining = new Date(student.joiningDate);
    
    // Calculate months including the current month
    // Payment is due at the beginning of each month
    monthsSinceJoining = Math.max(
      1, // At least 1 month (the joining month itself)
      (now.getFullYear() - joining.getFullYear()) * 12 + 
      (now.getMonth() - joining.getMonth()) + 1 // +1 to include current month
    );
    
    // Calculate how many COMPLETE payment cycles have passed
    // Use Math.floor to only count complete cycles
    const paymentFrequency = student.paymentFrequency || 1;
    const cyclesCompleted = Math.floor(monthsSinceJoining / paymentFrequency);
    totalDue = cyclesCompleted * (student.monthlyFeeAmount * paymentFrequency);
  } else {
    // Fallback if no joining date
    totalDue = student.monthlyFeeAmount;
    monthsSinceJoining = 1;
  }
  
  const outstanding = Math.max(0, totalDue - totalPaid);

  res.json({
    student: {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber,
      dateOfBirth: student.dateOfBirth,
      programType: student.programType,
      monthlyFeeAmount: student.monthlyFeeAmount,
      status: student.status,
      joiningDate: student.joiningDate,
      center: student.center
    },
    payments,
    summary: {
      totalPaid,
      totalDue,
      outstanding,
      monthsSinceJoining,
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

export default router;


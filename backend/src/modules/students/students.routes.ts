import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired } from "../../auth/auth.middleware";
import bcrypt from "bcryptjs";
import { getSystemDate } from "../../utils/system-date";

const prisma = new PrismaClient();
const router = Router();

/**
 * Helper to get coach's center IDs
 */
async function getCoachCenterIds(coachId: number) {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return links.map((l) => l.centerId);
}

// Admin: list all students with filters
router.get("/", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { q, centerId } = req.query as { q?: string; centerId?: string };

  const where: any = {};
  if (q) {
    where.fullName = { contains: q, mode: "insensitive" };
  }
  if (centerId) {
    where.centerId = Number(centerId);
  }

  // If coach, limit to their centers
  if (role === "COACH") {
    const centerIds = await getCoachCenterIds(id);
    where.centerId = { in: centerIds };
  }

  const students = await prisma.student.findMany({
    where,
    orderBy: { fullName: "asc" }
  });

  res.json(students);
});

// Admin: create student
router.post("/", authRequired, async (req, res) => {
  const { role } = req.user!;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { password, ...data } = req.body;
  
  // Convert empty email to null to avoid unique constraint issues
  if (data.email === "" || data.email === undefined) {
    data.email = null;
  }
  
  // Hash password if provided
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  
  try {
    const student = await prisma.student.create({ data });
    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "A student with this email already exists" });
    }
    throw error;
  }
});

// Admin: update student
router.put("/:id", authRequired, async (req, res) => {
  const { role } = req.user!;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const studentId = Number(req.params.id);
  const { password, ...data } = req.body;
  
  // Convert empty email to null to avoid unique constraint issues
  if (data.email === "" || data.email === undefined) {
    data.email = null;
  }
  
  // Hash password if provided
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  
  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data
    });
    res.json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "A student with this email already exists" });
    }
    throw error;
  }
});

// Get single student (coach scoped)
router.get("/:id", authRequired, async (req, res) => {
  const { id: userId, role } = req.user!;
  const studentId = Number(req.params.id);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { center: true }
  });

  if (!student) return res.status(404).json({ message: "Not found" });

  if (role === "COACH") {
    const centerIds = await getCoachCenterIds(userId);
    if (!centerIds.includes(student.centerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  // Wallet-based payment system
  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
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
    
    // Calculate months since joining (including current month)
    // Fee is due at the START of each cycle, not at the end
    const monthsElapsed = Math.max(
      1, // At least 1 month (the joining month itself incurs fees)
      (now.getFullYear() - joining.getFullYear()) * 12 + 
      (now.getMonth() - joining.getMonth()) + 1 // +1 to include current month
    );
    
    // Calculate payment cycles that have passed (including current cycle)
    const cyclesAccrued = Math.ceil(monthsElapsed / paymentFrequency);
    
    // Fees accrued for all cycles up to now (including current cycle)
    feesAccrued = cyclesAccrued * feePerCycle;
  }
  
  // Wallet balance = total paid - fees accrued
  const walletBalance = totalPaid - feesAccrued;
  const outstanding = walletBalance < 0 ? Math.abs(walletBalance) : 0;
  const creditBalance = walletBalance > 0 ? walletBalance : 0;

  res.json({ 
    student, 
    payments, 
    totalPaid, 
    outstanding,
    walletBalance,
    creditBalance,
    feesAccrued
  });
});

export default router;


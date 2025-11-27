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

  // compute totals
  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { paymentDate: "desc" }
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate outstanding based on payment frequency and time elapsed
  // Payment is made at the BEGINNING of the month for that month's service
  let outstanding = 0;
  if (student.joiningDate) {
    const now = getSystemDate(); // Use system date for calculations
    const joining = new Date(student.joiningDate);
    
    // Calculate months including the current month
    // If joined Jan and now is Feb, that's 2 months (Jan + Feb)
    const monthsElapsed = Math.max(
      1, // At least 1 month (the joining month itself)
      (now.getFullYear() - joining.getFullYear()) * 12 + 
      (now.getMonth() - joining.getMonth()) + 1 // +1 to include current month
    );
    
    // Calculate how many COMPLETE payment cycles have passed
    // Payment is made at beginning of cycle for that cycle
    const paymentFrequency = student.paymentFrequency || 1;
    const cyclesCompleted = Math.floor(monthsElapsed / paymentFrequency);
    
    // Expected amount = completed cycles * (monthly fee * frequency)
    // Example: Bi-monthly, joined Jan, now Mar (3 months)
    //          Cycles = floor(3/2) = 1 cycle = payment for Jan-Feb due
    // Example: Bi-monthly, joined Jan, now May (5 months)
    //          Cycles = floor(5/2) = 2 cycles = payment for Jan-Feb and Mar-Apr due
    const expectedAmount = cyclesCompleted * (student.monthlyFeeAmount * paymentFrequency);
    
    outstanding = Math.max(0, expectedAmount - totalPaid);
  } else {
    // Fallback if no joining date
    outstanding = Math.max(0, student.monthlyFeeAmount - totalPaid);
  }

  res.json({ student, payments, totalPaid, outstanding });
});

export default router;


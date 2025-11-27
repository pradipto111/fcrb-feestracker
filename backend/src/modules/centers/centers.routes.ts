import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// List centers (admin sees all, coach sees their assigned centers)
router.get("/", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  
  if (role === "ADMIN") {
    // Admin sees all centers
    const centers = await prisma.center.findMany();
    return res.json(centers);
  }
  
  if (role === "COACH") {
    // Coach sees only their assigned centers
    const coachCenters = await prisma.coachCenter.findMany({
      where: { coachId: id },
      include: { center: true }
    });
    const centers = coachCenters.map(cc => cc.center);
    return res.json(centers);
  }
  
  res.json([]);
});

// Admin only: create center
router.post("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  const { name, location, city, address } = req.body;
  const center = await prisma.center.create({
    data: { name, location, city, address }
  });
  
  // Automatically assign ALL coaches to the new center
  const coaches = await prisma.coach.findMany({
    where: { role: "COACH" }
  });
  
  for (const coach of coaches) {
    await prisma.coachCenter.create({
      data: {
        coachId: coach.id,
        centerId: center.id
      }
    });
  }
  
  res.status(201).json(center);
});

// Admin only: get center details with stats
router.get("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  const centerId = Number(req.params.id);
  
  const center = await prisma.center.findUnique({
    where: { id: centerId }
  });
  
  if (!center) {
    return res.status(404).json({ message: "Center not found" });
  }
  
  const students = await prisma.student.findMany({
    where: { centerId }
  });
  
  const payments = await prisma.payment.findMany({
    where: { centerId }
  });
  
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const activeStudents = students.filter(s => s.status === "ACTIVE").length;
  const totalRevenue = students.reduce((sum, s) => sum + s.monthlyFeeAmount, 0);
  
  res.json({
    center,
    students,
    stats: {
      totalStudents: students.length,
      activeStudents,
      trialStudents: students.filter(s => s.status === "TRIAL").length,
      inactiveStudents: students.filter(s => s.status === "INACTIVE").length,
      totalCollected,
      totalPayments: payments.length,
      monthlyRevenuePotential: totalRevenue
    }
  });
});

export default router;


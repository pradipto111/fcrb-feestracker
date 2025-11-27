import { Router } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Admin: create coach + assign to ALL centers automatically
router.post("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  const {
    fullName,
    email,
    password,
    role
  }: {
    fullName: string;
    email: string;
    password: string;
    role: Role;
  } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  
  // Get all centers
  const allCenters = await prisma.center.findMany();
  
  const coach = await prisma.coach.create({
    data: {
      fullName,
      email,
      passwordHash,
      role,
      centers: {
        create: allCenters.map((center) => ({ centerId: center.id }))
      }
    },
    include: {
      centers: { include: { center: true } }
    }
  });
  res.status(201).json(coach);
});

// Admin: list coaches
router.get("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  const coaches = await prisma.coach.findMany({
    include: {
      centers: { include: { center: true } }
    }
  });
  res.json(coaches);
});

export default router;


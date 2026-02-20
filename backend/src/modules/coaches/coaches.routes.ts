import { Router } from "express";
import { Role } from "@prisma/client";
import prisma from "../../db/prisma";
import bcrypt from "bcryptjs";
import { authRequired, requireRole } from "../../auth/auth.middleware";

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

const DB_QUERY_TIMEOUT_MS = 12000;

// Admin: list coaches
router.get("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database request timed out")), DB_QUERY_TIMEOUT_MS)
    );
    const coachesPromise = prisma.coach.findMany({
      include: {
        centers: { include: { center: true } }
      }
    });
    const coaches = await Promise.race([coachesPromise, timeoutPromise]);
    res.json(coaches);
  } catch (error: any) {
    if (error.message === "Database request timed out") {
      return res.status(503).json({ message: "Database is slow or unreachable. Check backend logs and DATABASE_URL." });
    }
    throw error;
  }
});

export default router;


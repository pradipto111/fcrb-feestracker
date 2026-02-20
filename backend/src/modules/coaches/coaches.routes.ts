import { Router } from "express";
import { Role } from "@prisma/client";
import prisma from "../../db/prisma";
import bcrypt from "bcryptjs";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

// Admin: create coach + assign to selected centers (or all if centerIds not provided)
router.post("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  const {
    fullName,
    email,
    password,
    role,
    centerIds
  }: {
    fullName: string;
    email: string;
    password: string;
    role?: Role;
    centerIds?: number[];
  } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  let centerIdsToAssign: number[];
  if (Array.isArray(centerIds) && centerIds.length > 0) {
    const existing = await prisma.center.findMany({ where: { id: { in: centerIds } }, select: { id: true } });
    centerIdsToAssign = existing.map((c) => c.id);
  } else {
    const allCenters = await prisma.center.findMany({ select: { id: true } });
    centerIdsToAssign = allCenters.map((c) => c.id);
  }

  const coach = await prisma.coach.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: role ?? "COACH",
      centers: {
        create: centerIdsToAssign.map((centerId) => ({ centerId }))
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


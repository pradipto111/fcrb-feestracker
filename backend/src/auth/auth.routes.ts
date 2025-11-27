import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET } from "../config";

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /auth/register-admin
 * body: { email, password, fullName }
 * TEMPORARY: Creates first admin user (only works if no admins exist)
 */
router.post("/register-admin", async (req, res) => {
  try {
    const { email, password, fullName } = req.body as { 
      email: string; 
      password: string; 
      fullName: string;
    };

    // Check if any admin already exists
    const existingAdmin = await prisma.coach.findFirst({
      where: { role: "ADMIN" }
    });

    if (existingAdmin) {
      return res.status(403).json({ 
        message: "Admin already exists. Use seed script or contact administrator." 
      });
    }

    // Create first admin
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await prisma.coach.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: "ADMIN"
      }
    });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: { id: admin.id, role: admin.role, fullName: admin.fullName },
      message: "Admin user created successfully"
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

/**
 * POST /auth/login
 * body: { email, password }
 * Supports login for Admin, Coach, and Student
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  
  // Try to find coach/admin first
  const coach = await prisma.coach.findUnique({ where: { email } });
  if (coach) {
    const ok = await bcrypt.compare(password, coach.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: coach.id, role: coach.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: coach.id, role: coach.role, fullName: coach.fullName }
    });
  }

  // Try to find student
  const student = await prisma.student.findUnique({ where: { email } });
  if (student && student.passwordHash) {
    const ok = await bcrypt.compare(password, student.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: student.id, role: "STUDENT" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: student.id, role: "STUDENT", fullName: student.fullName }
    });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

export default router;


import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import prisma from "../db/prisma";
import { JWT_SECRET } from "../config";

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

const LOGIN_DB_TIMEOUT_MS = 15000; // Fail fast so client gets 503 instead of hanging (e.g. cold DB on Render)
const LOGIN_UNAVAILABLE_MESSAGE =
  "Login is temporarily unavailable because the database is slow or unreachable. Please try again in a moment.";
type FanUserLike = {
  id: string;
  passwordHash: string;
  status: string;
};
type FanProfileLike = {
  fullName: string | null;
};
type CrmUserLike = {
  id: string;
  passwordHash: string;
  fullName: string;
  role: string;
  status: string;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, code: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      const err = new Error(code);
      reject(err);
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

function isDatabaseUnavailableError(error: any): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  const msg = String(error?.message || "");
  return /(can't reach database|database server|authentication failed|connect_timeout|econnrefused|p1000|p1001|timed out)/i.test(msg);
}

/**
 * POST /auth/login
 * body: { email, password } (optional role for legacy clients)
 * Single login flow: looks up Coach/Admin, Fan, Student, then CRM by email and returns the matching user's role.
 */
router.post("/login", async (req, res) => {
  const loginStartedAt = Date.now();
  res.once("finish", () => {
    console.log(`[auth/login] status=${res.statusCode} duration=${Date.now() - loginStartedAt}ms`);
  });

  const { email, password, role } = req.body as { email: string; password: string; role?: "ADMIN" | "COACH" | "STUDENT" | "FAN" | "CRM" };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("LOGIN_TIMEOUT")), LOGIN_DB_TIMEOUT_MS)
  );

  const runLogin = async () => {
  // Try to find coach/admin first
  const coach = await withTimeout(
    prisma.coach.findUnique({ where: { email } }),
    LOGIN_DB_TIMEOUT_MS,
    "LOGIN_DB_QUERY_TIMEOUT"
  );
  if (coach) {
    // Allow both ADMIN and COACH to log in as staff (so "Admin dashboard" login works for coach accounts too)
    const staffRoles: Array<string> = ["ADMIN", "COACH"];
    if (role && role !== coach.role && !(staffRoles.includes(role) && staffRoles.includes(coach.role))) {
      return res.status(403).json({ message: "Access denied" });
    }
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

  // Try to find fan user (Fan Club)
  const prismaAny = prisma as any;
  const fanQuery: Promise<FanUserLike | null> =
    prismaAny.fanUser?.findUnique({ where: { email } }) ?? Promise.resolve(null);
  const fan = await withTimeout<FanUserLike | null>(
    fanQuery,
    LOGIN_DB_TIMEOUT_MS,
    "LOGIN_DB_QUERY_TIMEOUT"
  );
  if (fan) {
    if (role && role !== "FAN") return res.status(403).json({ message: "Access denied" });
    if (fan.status === "SUSPENDED") return res.status(403).json({ message: "Account suspended" });
    const ok = await bcrypt.compare(password, fan.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const fanProfileQuery: Promise<FanProfileLike | null> =
      prismaAny.fanProfile?.findUnique({
        where: { userId: fan.id },
        select: { fullName: true },
      }) ?? Promise.resolve(null);
    const profile = await withTimeout<FanProfileLike | null>(
      fanProfileQuery,
      LOGIN_DB_TIMEOUT_MS,
      "LOGIN_DB_QUERY_TIMEOUT"
    );

    const token = jwt.sign(
      { id: fan.id, role: "FAN" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: { id: fan.id, role: "FAN", fullName: profile?.fullName || "Fan Club Member" }
    });
  }

  // Try to find student
  const student = await withTimeout(
    prisma.student.findUnique({ where: { email } }),
    LOGIN_DB_TIMEOUT_MS,
    "LOGIN_DB_QUERY_TIMEOUT"
  );
  if (student && student.passwordHash) {
    if (role && role !== "STUDENT") return res.status(403).json({ message: "Access denied" });
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

  // Try CRM user (unified login – single flow, no role selection)
  const crmUserQuery: Promise<CrmUserLike | null> =
    prismaAny.crmUser?.findUnique({ where: { email } }) ?? Promise.resolve(null);
  const crmUser = await withTimeout<CrmUserLike | null>(
    crmUserQuery,
    LOGIN_DB_TIMEOUT_MS,
    "LOGIN_DB_QUERY_TIMEOUT"
  );
  if (crmUser) {
    if (role && role !== "CRM") return res.status(403).json({ message: "Access denied" });
    if (crmUser.status === "DISABLED") return res.status(403).json({ message: "Account disabled" });
    const ok = await bcrypt.compare(password, crmUser.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: crmUser.id, role: "CRM", crmRole: crmUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({
      token,
      user: { id: crmUser.id, role: "CRM", fullName: crmUser.fullName, crmRole: crmUser.role }
    });
  }

  return res.status(401).json({ message: "Invalid credentials" });
  };

  try {
    await Promise.race([runLogin(), timeoutPromise]);
  } catch (err: any) {
    if (res.headersSent) return;
    if (err.message === "LOGIN_TIMEOUT" || err.message === "LOGIN_DB_QUERY_TIMEOUT") {
      return res.status(503).json({
        message: LOGIN_UNAVAILABLE_MESSAGE,
      });
    }
    if (isDatabaseUnavailableError(err)) {
      return res.status(503).json({ message: LOGIN_UNAVAILABLE_MESSAGE });
    }
    console.error("[auth/login] Unexpected error:", err);
    return res.status(500).json({ message: "Login failed due to an unexpected server error." });
  }
});

export default router;


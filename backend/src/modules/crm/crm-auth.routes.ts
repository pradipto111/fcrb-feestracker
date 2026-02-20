import { Router } from "express";
import prisma from "../../db/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";

const router = Router();

/**
 * POST /crm/auth/login
 * body: { email, password }
 * CRM-only login (separate from student/coach/admin/fan logins).
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

    if (!(prisma as any).crmUser) {
      return res.status(500).json({
        message:
          "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }

    const crmUser = await (prisma as any).crmUser?.findUnique({ where: { email } });
    if (!crmUser) return res.status(401).json({ message: "Invalid credentials" });
    if (crmUser.status && crmUser.status === "DISABLED") return res.status(403).json({ message: "Account disabled" });

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
  } catch (error: any) {
    console.error("CRM login error:", error);
    return res.status(500).json({ message: error.message || "Login failed" });
  }
});

export default router;


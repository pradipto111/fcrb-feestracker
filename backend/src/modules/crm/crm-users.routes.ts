import { Router } from "express";
import prisma from "../../db/prisma";
import bcrypt from "bcryptjs";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

// Admin-managed CRM users (CRM users can read list for assignment)
router.use(authRequired);
router.use(requireRole("ADMIN", "CRM"));

/**
 * GET /crm/users
 * List CRM users. Uses raw query so we can normalize role (MANAGER removed; any legacy value returned as AGENT).
 */
router.get("/", async (_req, res) => {
  try {
    if (!(prisma as any).crmUser) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }
    const rows = await prisma.$queryRaw<
      Array<{ id: number; fullName: string; email: string; role: string; status: string; createdAt: Date; updatedAt: Date }>
    >`SELECT id, "fullName", email, role, status, "createdAt", "updatedAt" FROM "CrmUser" ORDER BY "createdAt" DESC`;
    const users = (rows || []).map((r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      role: "AGENT" as const,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    return res.json(users);
  } catch (error: any) {
    console.error("List CRM users error:", error);
    return res.status(500).json({ message: error.message || "Failed to list CRM users" });
  }
});

/**
 * POST /crm/users
 * Create CRM user (admin only)
 * body: { fullName, email, password, role?: "AGENT" }
 */
router.post("/", requireRole("ADMIN"), async (req, res) => {
  try {
    if (!(prisma as any).crmUser) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }
    const { fullName, email, password, role } = req.body as {
      fullName?: string;
      email?: string;
      password?: string;
      role?: "AGENT";
    };

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Missing fullName, email, or password" });
    }

    const existing = await (prisma as any).crmUser?.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "CRM user already exists for this email" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await (prisma as any).crmUser?.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: role || "AGENT",
        status: "ACTIVE",
      },
      select: { id: true, fullName: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });

    return res.status(201).json(user);
  } catch (error: any) {
    console.error("Create CRM user error:", error);
    return res.status(500).json({ message: error.message || "Failed to create CRM user" });
  }
});

/**
 * PATCH /crm/users/:id/status
 * body: { status: "ACTIVE"|"DISABLED" }
 */
router.patch("/:id/status", requireRole("ADMIN"), async (req, res) => {
  try {
    if (!(prisma as any).crmUser) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }
    const id = Number(req.params.id);
    const { status } = req.body as { status?: "ACTIVE" | "DISABLED" };
    if (!status) return res.status(400).json({ message: "Missing status" });
    if (!["ACTIVE", "DISABLED"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const user = await (prisma as any).crmUser?.update({
      where: { id },
      data: { status },
      select: { id: true, fullName: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
    return res.json(user);
  } catch (error: any) {
    console.error("Update CRM user status error:", error);
    return res.status(500).json({ message: error.message || "Failed to update CRM user status" });
  }
});

/**
 * POST /crm/users/:id/reset-password
 * body: { password }
 */
router.post("/:id/reset-password", requireRole("ADMIN"), async (req, res) => {
  try {
    if (!(prisma as any).crmUser) {
      return res.status(500).json({
        message: "CRM database models not available. Please run migrations + prisma generate for CRM.",
      });
    }
    const id = Number(req.params.id);
    const { password } = req.body as { password?: string };
    if (!password) return res.status(400).json({ message: "Missing password" });

    const passwordHash = await bcrypt.hash(password, 10);
    await (prisma as any).crmUser?.update({
      where: { id },
      data: { passwordHash },
    });
    return res.json({ ok: true });
  } catch (error: any) {
    console.error("Reset CRM user password error:", error);
    return res.status(500).json({ message: error.message || "Failed to reset password" });
  }
});

export default router;


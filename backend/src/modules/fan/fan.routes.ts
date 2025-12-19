import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Fan-only endpoints (Fan Club HQ)
router.use(authRequired);
router.use(requireRole("FAN"));

async function getFanProfileByUserId(userId: number) {
  const profile = await (prisma as any).fanProfile?.findUnique({
    where: { userId },
    include: {
      tier: true,
      user: { select: { status: true, email: true } },
      onboarding: { include: { assignedTier: true } },
      badgesEarned: { orderBy: { earnedAt: "desc" }, take: 50 },
    },
  });
  return profile;
}

router.get("/me", async (req, res) => {
  try {
    const profile = await getFanProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });
    return res.json(profile);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to load fan profile" });
  }
});

router.get("/onboarding", async (req, res) => {
  try {
    if (!(prisma as any).fanOnboarding) return res.status(501).json({ message: "Onboarding model not available. Run prisma generate/migrate." });
    const profile = await getFanProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });
    return res.json(profile.onboarding || null);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to load onboarding" });
  }
});

router.post("/onboarding", async (req, res) => {
  try {
    if (!(prisma as any).fanOnboarding) return res.status(501).json({ message: "Onboarding model not available. Run prisma generate/migrate." });
    const { persona, favoritePlayer, locality, goals } = req.body as {
      persona?: "PURE_FAN" | "ASPIRING_PLAYER" | "ANALYST" | "COMMUNITY_SUPPORTER";
      favoritePlayer?: string;
      locality?: string;
      goals?: string[];
    };

    const profile = await getFanProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    // Auto-assign a starting tier if none is set (first active by sortOrder).
    let assignedTierId: number | null = null;
    if (!profile.tierId) {
      const firstTier = await (prisma as any).fanTier?.findFirst({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      assignedTierId = firstTier?.id ?? null;
      if (assignedTierId) {
        await (prisma as any).fanProfile?.update({
          where: { id: profile.id },
          data: { tierId: assignedTierId },
        });
      }
    }

    const saved = await (prisma as any).fanOnboarding?.upsert({
      where: { fanId: profile.id },
      create: {
        fanId: profile.id,
        persona: persona || null,
        favoritePlayer: favoritePlayer || null,
        locality: locality || null,
        goals: Array.isArray(goals) ? goals.filter(Boolean) : [],
        assignedTierId: assignedTierId || profile.tierId || null,
        completedAt: new Date(),
      },
      update: {
        persona: persona || null,
        favoritePlayer: favoritePlayer || null,
        locality: locality || null,
        goals: Array.isArray(goals) ? goals.filter(Boolean) : [],
        assignedTierId: assignedTierId || profile.tierId || null,
      },
      include: { assignedTier: true },
    });

    const updatedProfile = await getFanProfileByUserId(req.user!.id);
    return res.status(201).json({ onboarding: saved, profile: updatedProfile });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to save onboarding" });
  }
});

router.get("/matchday/moments", async (_req, res) => {
  try {
    if (!(prisma as any).matchdayMoment) return res.status(501).json({ message: "MatchdayMoment model not available. Run prisma generate/migrate." });
    const rows = await (prisma as any).matchdayMoment?.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 40,
    });
    const now = new Date();
    const normalized = (rows || []).map((m: any) => ({
      ...m,
      // If unlockAt is in the future, treat as locked even if isLocked is false.
      isLocked: Boolean(m.isLocked || (m.unlockAt && new Date(m.unlockAt) > now)),
    }));
    return res.json(normalized);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch matchday moments" });
  }
});

router.get("/dynamic-rewards", async (_req, res) => {
  try {
    if (!(prisma as any).dynamicRewardRule) return res.status(501).json({ message: "DynamicRewardRule model not available. Run prisma generate/migrate." });
    const rows = await (prisma as any).dynamicRewardRule?.findMany({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    return res.json(rows || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch dynamic rewards" });
  }
});

router.get("/tiers", async (_req, res) => {
  try {
    const tiers = await (prisma as any).fanTier?.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return res.json(tiers || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch tiers" });
  }
});

router.get("/sponsors", async (_req, res) => {
  try {
    const sponsors = await (prisma as any).fanSponsor?.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return res.json(sponsors || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch sponsors" });
  }
});

router.get("/rewards", async (req, res) => {
  try {
    const profile = await getFanProfileByUserId(req.user!.id);
    const tierId = profile?.tierId || null;
    const now = new Date();

    const campaigns = await (prisma as any).rewardCampaign?.findMany({
      where: {
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { validTo: null },
              { validTo: { gte: now } },
            ],
          },
          tierId
            ? {
                OR: [{ tierEligibility: { equals: [] } }, { tierEligibility: { has: tierId } }],
              }
            : { tierEligibility: { equals: [] } },
        ],
      },
      include: { sponsor: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return res.json(campaigns || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch rewards" });
  }
});

router.get("/coupons", async (req, res) => {
  try {
    const profile = await getFanProfileByUserId(req.user!.id);
    const tierId = profile?.tierId || null;
    const now = new Date();

    const pools = await (prisma as any).couponPool?.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
          ...(tierId
            ? [{ OR: [{ tierEligibility: { equals: [] } }, { tierEligibility: { has: tierId } }] }]
            : [{ tierEligibility: { equals: [] } }]),
        ],
      },
      include: {
        sponsor: true,
        codes: { where: { isUsed: false }, select: { id: true }, take: 1 },
        redemptions: { where: { fanId: profile?.id || 0 }, select: { id: true, redeemedAt: true, status: true } },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const normalized = (pools || []).map((p: any) => ({
      ...p,
      hasAvailableCode: p.codeType === "MULTI_USE" ? !!p.multiUseCode : (p.codes?.length || 0) > 0,
      myRedemption: p.redemptions?.[0] || null,
    }));

    return res.json(normalized);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch coupons" });
  }
});

router.get("/quests", async (req, res) => {
  try {
    const profile = await getFanProfileByUserId(req.user!.id);
    const tierId = profile?.tierId || null;

    const quests = await (prisma as any).fanQuest?.findMany({
      where: {
        isActive: true,
        ...(tierId
          ? { OR: [{ tierEligibility: { equals: [] } }, { tierEligibility: { has: tierId } }] }
          : { tierEligibility: { equals: [] } }),
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(quests || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch quests" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const profile = await getFanProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    const [redemptions, gameSessions, leads] = await Promise.all([
      (prisma as any).couponRedemption?.findMany({
        where: { fanId: profile.id },
        include: { pool: { include: { sponsor: true } } },
        orderBy: { redeemedAt: "desc" },
        take: 50,
      }),
      (prisma as any).fanGameSession?.findMany({
        where: { fanId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      (prisma as any).fanConversionLead?.findMany({
        where: { fanId: profile.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return res.json({ redemptions: redemptions || [], gameSessions: gameSessions || [], leads: leads || [] });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch history" });
  }
});

router.post("/redeem", async (req, res) => {
  try {
    const { couponPoolId } = req.body as { couponPoolId: number };
    if (!couponPoolId) return res.status(400).json({ message: "couponPoolId is required" });

    const profile = await getFanProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    const pool = await (prisma as any).couponPool?.findUnique({
      where: { id: Number(couponPoolId) },
      include: { sponsor: true },
    });
    if (!pool || !pool.isActive) return res.status(404).json({ message: "Coupon pool not found" });

    // Enforce single redemption per fan per pool
    const existing = await (prisma as any).couponRedemption?.findUnique({
      where: { fanId_couponPoolId: { fanId: profile.id, couponPoolId: pool.id } },
    });
    if (existing) return res.status(409).json({ message: "Already redeemed" });

    let codeUsed = "";
    if (pool.codeType === "MULTI_USE") {
      if (!pool.multiUseCode) return res.status(409).json({ message: "No code available" });
      codeUsed = pool.multiUseCode;
    } else {
      const code = await (prisma as any).couponCode?.findFirst({
        where: { couponPoolId: pool.id, isUsed: false },
        orderBy: { id: "asc" },
      });
      if (!code) return res.status(409).json({ message: "No codes left" });
      codeUsed = code.code;
      await (prisma as any).couponCode?.update({
        where: { id: code.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    }

    const redemption = await (prisma as any).couponRedemption?.create({
      data: {
        fanId: profile.id,
        couponPoolId: pool.id,
        codeUsed,
        status: "REDEEMED",
      },
      include: { pool: { include: { sponsor: true } } },
    });

    return res.status(201).json(redemption);
  } catch (error: any) {
    // Unique constraint safety
    if (String(error?.code) === "P2002") return res.status(409).json({ message: "Already redeemed" });
    return res.status(500).json({ message: error.message || "Failed to redeem coupon" });
  }
});

router.post("/game/session", async (req, res) => {
  try {
    const { gameType, input, result, pointsEarned } = req.body as { gameType: string; input?: any; result?: any; pointsEarned?: number };
    if (!gameType) return res.status(400).json({ message: "gameType is required" });

    const profile = await getFanProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    const session = await (prisma as any).fanGameSession?.create({
      data: {
        fanId: profile.id,
        gameType,
        input: input ?? null,
        result: result ?? null,
        pointsEarned: Number(pointsEarned || 0),
      },
    });

    // Update points + streak (simple placeholder)
    const updated = await (prisma as any).fanProfile?.update({
      where: { id: profile.id },
      data: {
        points: { increment: Number(pointsEarned || 0) },
        streakDays: { increment: 1 },
      },
      include: { tier: true, user: { select: { status: true, email: true } } },
    });

    return res.status(201).json({ session, profile: updated });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to submit game session" });
  }
});

router.post("/program-interest", async (req, res) => {
  try {
    const { programInterest, notes } = req.body as { programInterest: string; notes?: string };
    if (!programInterest) return res.status(400).json({ message: "programInterest is required" });

    const profile = await getFanProfileByUserId(req.user!.id);
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    const lead = await (prisma as any).fanConversionLead?.create({
      data: {
        fanId: profile.id,
        programInterest,
        status: "NEW",
        notes: notes || null,
      },
    });
    return res.status(201).json(lead);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create program interest" });
  }
});

export default router;




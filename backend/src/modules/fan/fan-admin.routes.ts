import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Admin-only control plane for Fan Club
router.use(authRequired);
router.use(requireRole("ADMIN"));

async function audit(actorAdminId: number, action: string, entityType: string, entityId: string, before?: any, after?: any) {
  try {
    await (prisma as any).auditLog?.create({
      data: {
        actorAdminId,
        action,
        entityType,
        entityId,
        before: before ?? null,
        after: after ?? null,
      },
    });
  } catch {
    // Audit should never break core operations
  }
}

// ===== Fans =====

router.get("/", async (_req, res) => {
  try {
    const fans = await (prisma as any).fanUser?.findMany({
      include: { profile: { include: { tier: true, onboarding: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return res.json(fans || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch fans" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, fullName, phone, city, centerPreference, tierId, password } = req.body as any;
    if (!email || !fullName) return res.status(400).json({ message: "email and fullName are required" });

    const tempPassword = password || `FCRB${Math.random().toString(36).slice(2, 8)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const created = await (prisma as any).fanUser?.create({
      data: {
        email,
        passwordHash,
        role: "FAN",
        status: "ACTIVE",
        profile: {
          create: {
            fullName,
            phone: phone || null,
            city: city || null,
            centerPreference: centerPreference || null,
            tierId: tierId ? Number(tierId) : null,
            points: 0,
            badges: [],
            streakDays: 0,
          },
        },
      },
      include: { profile: { include: { tier: true } } },
    });

    await audit(req.user!.id, "FAN_CREATE", "FanUser", String(created.id), null, { email, fullName, tierId: tierId || null });
    // Return temp password for admin-controlled credentials (UI should show once)
    return res.status(201).json({ fan: created, tempPassword });
  } catch (error: any) {
    if (String(error?.code) === "P2002") return res.status(409).json({ message: "Email already exists" });
    return res.status(500).json({ message: error.message || "Failed to create fan" });
  }
});

router.patch("/:fanUserId/status", async (req, res) => {
  try {
    const fanUserId = Number(req.params.fanUserId);
    const { status } = req.body as { status: "ACTIVE" | "SUSPENDED" };
    if (!status) return res.status(400).json({ message: "status is required" });

    const before = await (prisma as any).fanUser?.findUnique({ where: { id: fanUserId } });
    const updated = await (prisma as any).fanUser?.update({
      where: { id: fanUserId },
      data: { status },
      include: { profile: true },
    });

    await audit(req.user!.id, "FAN_STATUS_UPDATE", "FanUser", String(fanUserId), before, { status });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update status" });
  }
});

router.patch("/:fanUserId/tier", async (req, res) => {
  try {
    const fanUserId = Number(req.params.fanUserId);
    const { tierId } = req.body as { tierId: number | null };

    const profile = await (prisma as any).fanProfile?.findUnique({ where: { userId: fanUserId } });
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    const before = { tierId: profile.tierId };
    const updated = await (prisma as any).fanProfile?.update({
      where: { id: profile.id },
      data: { tierId: tierId ? Number(tierId) : null },
      include: { tier: true, user: true },
    });

    await audit(req.user!.id, "FAN_TIER_ASSIGN", "FanProfile", String(profile.id), before, { tierId: tierId ?? null });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to assign tier" });
  }
});

router.post("/:fanUserId/points", async (req, res) => {
  try {
    if (!(prisma as any).fanPointLedger) return res.status(501).json({ message: "FanPointLedger model not available. Run prisma generate/migrate." });
    const fanUserId = Number(req.params.fanUserId);
    const { delta, reason } = req.body as { delta: number; reason?: string };
    if (!Number.isFinite(delta) || Number(delta) === 0) return res.status(400).json({ message: "delta must be a non-zero number" });

    const profile = await (prisma as any).fanProfile?.findUnique({ where: { userId: fanUserId } });
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    const ledger = await (prisma as any).fanPointLedger?.create({
      data: {
        fanId: profile.id,
        delta: Number(delta),
        reason: reason || "Admin adjustment",
        source: "ADMIN_ADJUST",
        actorId: req.user!.id,
      },
    });

    const updated = await (prisma as any).fanProfile?.update({
      where: { id: profile.id },
      data: { points: { increment: Number(delta) } },
      include: { tier: true, user: true, onboarding: { include: { assignedTier: true } }, badgesEarned: { orderBy: { earnedAt: "desc" }, take: 50 } },
    });

    await audit(req.user!.id, "FAN_POINTS_ADJUST", "FanProfile", String(profile.id), { points: profile.points }, { delta, reason: reason || null });
    return res.status(201).json({ ledger, profile: updated });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to adjust points" });
  }
});

router.post("/:fanUserId/badges", async (req, res) => {
  try {
    if (!(prisma as any).fanBadgeEarned) return res.status(501).json({ message: "FanBadgeEarned model not available. Run prisma generate/migrate." });
    const fanUserId = Number(req.params.fanUserId);
    const { badgeKey, badgeName, source } = req.body as { badgeKey: string; badgeName?: string; source?: string };
    if (!badgeKey) return res.status(400).json({ message: "badgeKey is required" });

    const profile = await (prisma as any).fanProfile?.findUnique({ where: { userId: fanUserId } });
    if (!profile) return res.status(404).json({ message: "Fan profile not found" });

    const earned = await (prisma as any).fanBadgeEarned?.upsert({
      where: { fanId_badgeKey: { fanId: profile.id, badgeKey } },
      create: { fanId: profile.id, badgeKey, badgeName: badgeName || null, source: source || "ADMIN_ASSIGN" },
      update: { badgeName: badgeName || null, source: source || "ADMIN_ASSIGN" },
    });

    const updated = await (prisma as any).fanProfile?.update({
      where: { id: profile.id },
      data: { badges: { set: Array.from(new Set([...(profile.badges || []), badgeKey])) } },
      include: { tier: true, user: true, badgesEarned: { orderBy: { earnedAt: "desc" }, take: 50 } },
    });

    await audit(req.user!.id, "FAN_BADGE_ASSIGN", "FanProfile", String(profile.id), null, { badgeKey, badgeName: badgeName || null });
    return res.status(201).json({ earned, profile: updated });
  } catch (error: any) {
    if (String(error?.code) === "P2002") return res.status(409).json({ message: "Badge already assigned" });
    return res.status(500).json({ message: error.message || "Failed to assign badge" });
  }
});

router.post("/:fanUserId/reset-password", async (req, res) => {
  try {
    const fanUserId = Number(req.params.fanUserId);
    const { password } = req.body as { password?: string };
    const newPassword = password || `FCRB${Math.random().toString(36).slice(2, 8)}!`;
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await (prisma as any).fanUser?.update({ where: { id: fanUserId }, data: { passwordHash } });
    await audit(req.user!.id, "FAN_PASSWORD_RESET", "FanUser", String(fanUserId), null, { rotated: true });
    return res.json({ fanUserId, tempPassword: newPassword });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to reset password" });
  }
});

// ===== Matchday moments + dynamic reward rules =====

router.get("/moments", async (_req, res) => {
  try {
    if (!(prisma as any).matchdayMoment) return res.status(501).json({ message: "MatchdayMoment model not available. Run prisma generate/migrate." });
    const rows = await (prisma as any).matchdayMoment?.findMany({
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 300,
    });
    return res.json(rows || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch moments" });
  }
});

router.post("/moments", async (req, res) => {
  try {
    if (!(prisma as any).matchdayMoment) return res.status(501).json({ message: "MatchdayMoment model not available. Run prisma generate/migrate." });
    const created = await (prisma as any).matchdayMoment?.create({ data: req.body });
    await audit(req.user!.id, "FAN_MOMENT_CREATE", "MatchdayMoment", String(created.id), null, created);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create moment" });
  }
});

router.put("/moments/:momentId", async (req, res) => {
  try {
    if (!(prisma as any).matchdayMoment) return res.status(501).json({ message: "MatchdayMoment model not available. Run prisma generate/migrate." });
    const momentId = Number(req.params.momentId);
    const before = await (prisma as any).matchdayMoment?.findUnique({ where: { id: momentId } });
    const updated = await (prisma as any).matchdayMoment?.update({ where: { id: momentId }, data: req.body });
    await audit(req.user!.id, "FAN_MOMENT_UPDATE", "MatchdayMoment", String(momentId), before, updated);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update moment" });
  }
});

router.get("/dynamic-rewards", async (_req, res) => {
  try {
    if (!(prisma as any).dynamicRewardRule) return res.status(501).json({ message: "DynamicRewardRule model not available. Run prisma generate/migrate." });
    const rows = await (prisma as any).dynamicRewardRule?.findMany({ orderBy: { updatedAt: "desc" } });
    return res.json(rows || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch dynamic reward rules" });
  }
});

router.post("/dynamic-rewards", async (req, res) => {
  try {
    if (!(prisma as any).dynamicRewardRule) return res.status(501).json({ message: "DynamicRewardRule model not available. Run prisma generate/migrate." });
    const created = await (prisma as any).dynamicRewardRule?.create({ data: req.body });
    await audit(req.user!.id, "FAN_DYNAMIC_REWARD_CREATE", "DynamicRewardRule", String(created.id), null, created);
    return res.status(201).json(created);
  } catch (error: any) {
    if (String(error?.code) === "P2002") return res.status(409).json({ message: "Key already exists" });
    return res.status(500).json({ message: error.message || "Failed to create dynamic reward rule" });
  }
});

router.put("/dynamic-rewards/:ruleId", async (req, res) => {
  try {
    if (!(prisma as any).dynamicRewardRule) return res.status(501).json({ message: "DynamicRewardRule model not available. Run prisma generate/migrate." });
    const ruleId = Number(req.params.ruleId);
    const before = await (prisma as any).dynamicRewardRule?.findUnique({ where: { id: ruleId } });
    const updated = await (prisma as any).dynamicRewardRule?.update({ where: { id: ruleId }, data: req.body });
    await audit(req.user!.id, "FAN_DYNAMIC_REWARD_UPDATE", "DynamicRewardRule", String(ruleId), before, updated);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update dynamic reward rule" });
  }
});

// ===== Tiers =====

router.get("/tiers", async (_req, res) => {
  try {
    const tiers = await (prisma as any).fanTier?.findMany({ orderBy: { sortOrder: "asc" } });
    return res.json(tiers || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch tiers" });
  }
});

router.post("/tiers", async (req, res) => {
  try {
    const { name, monthlyPriceINR, yearlyPriceINR, benefitsJson, featureFlags, sortOrder, isActive } = req.body as any;
    if (!name) return res.status(400).json({ message: "name is required" });

    const created = await (prisma as any).fanTier?.create({
      data: {
        name,
        monthlyPriceINR: Number(monthlyPriceINR || 0),
        yearlyPriceINR: Number(yearlyPriceINR || 0),
        benefitsJson: benefitsJson ?? [],
        featureFlags: featureFlags ?? {},
        sortOrder: Number(sortOrder || 0),
        isActive: isActive !== undefined ? !!isActive : true,
      },
    });
    await audit(req.user!.id, "FAN_TIER_CREATE", "FanTier", String(created.id), null, created);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create tier" });
  }
});

router.put("/tiers/:tierId", async (req, res) => {
  try {
    const tierId = Number(req.params.tierId);
    const before = await (prisma as any).fanTier?.findUnique({ where: { id: tierId } });
    const updated = await (prisma as any).fanTier?.update({
      where: { id: tierId },
      data: { ...req.body },
    });
    await audit(req.user!.id, "FAN_TIER_UPDATE", "FanTier", String(tierId), before, updated);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to update tier" });
  }
});

// ===== Sponsors / Rewards / Coupons / Quests (minimal CRUD for demo) =====

router.get("/sponsors", async (_req, res) => {
  try {
    const sponsors = await (prisma as any).fanSponsor?.findMany({ orderBy: { name: "asc" } });
    return res.json(sponsors || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch sponsors" });
  }
});

router.post("/sponsors", async (req, res) => {
  try {
    const created = await (prisma as any).fanSponsor?.create({ data: req.body });
    await audit(req.user!.id, "FAN_SPONSOR_CREATE", "FanSponsor", String(created.id), null, created);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create sponsor" });
  }
});

router.get("/campaigns", async (_req, res) => {
  try {
    const campaigns = await (prisma as any).rewardCampaign?.findMany({ include: { sponsor: true }, orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
    return res.json(campaigns || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch campaigns" });
  }
});

router.post("/campaigns", async (req, res) => {
  try {
    const created = await (prisma as any).rewardCampaign?.create({ data: req.body });
    await audit(req.user!.id, "FAN_CAMPAIGN_CREATE", "RewardCampaign", String(created.id), null, created);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create campaign" });
  }
});

router.get("/coupon-pools", async (_req, res) => {
  try {
    const pools = await (prisma as any).couponPool?.findMany({ include: { sponsor: true }, orderBy: { createdAt: "desc" } });
    return res.json(pools || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch coupon pools" });
  }
});

router.post("/coupon-pools", async (req, res) => {
  try {
    const { codes, ...rest } = req.body as any;
    const created = await (prisma as any).couponPool?.create({
      data: {
        ...rest,
        codes: Array.isArray(codes) && codes.length > 0 ? { create: codes.map((c: string) => ({ code: c })) } : undefined,
      },
      include: { sponsor: true },
    });
    await audit(req.user!.id, "FAN_COUPONPOOL_CREATE", "CouponPool", String(created.id), null, created);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create coupon pool" });
  }
});

router.get("/quests", async (_req, res) => {
  try {
    const quests = await (prisma as any).fanQuest?.findMany({ orderBy: { createdAt: "desc" } });
    return res.json(quests || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch quests" });
  }
});

router.post("/quests", async (req, res) => {
  try {
    const created = await (prisma as any).fanQuest?.create({ data: req.body });
    await audit(req.user!.id, "FAN_QUEST_CREATE", "FanQuest", String(created.id), null, created);
    return res.status(201).json(created);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to create quest" });
  }
});

router.get("/analytics/summary", async (_req, res) => {
  try {
    const [fanCount, activeFans, redemptionCount, leadsCount, tiers, profiles, leads, redemptions] = await Promise.all([
      (prisma as any).fanUser?.count(),
      (prisma as any).fanUser?.count({ where: { status: "ACTIVE" } }),
      (prisma as any).couponRedemption?.count(),
      (prisma as any).fanConversionLead?.count(),
      (prisma as any).fanTier?.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
      (prisma as any).fanProfile?.findMany({ select: { tierId: true, city: true } }),
      (prisma as any).fanConversionLead?.findMany({ select: { programInterest: true, status: true } }),
      (prisma as any).couponRedemption?.findMany({ include: { pool: { include: { sponsor: true } } } }),
    ]);

    const tierDistribution: Record<string, number> = {};
    for (const t of tiers || []) tierDistribution[t.name] = 0;
    for (const p of profiles || []) {
      const t = (tiers || []).find((x: any) => x.id === p.tierId);
      if (!t) continue;
      tierDistribution[t.name] = (tierDistribution[t.name] || 0) + 1;
    }

    const programInterestCounts: Record<string, number> = {};
    for (const l of leads || []) {
      programInterestCounts[l.programInterest] = (programInterestCounts[l.programInterest] || 0) + 1;
    }

    const redemptionsBySponsor: Record<string, number> = {};
    for (const r of redemptions || []) {
      const sponsorName = r?.pool?.sponsor?.name || "Unknown";
      redemptionsBySponsor[sponsorName] = (redemptionsBySponsor[sponsorName] || 0) + 1;
    }

    return res.json({
      fanCount: fanCount || 0,
      activeFans: activeFans || 0,
      redemptionCount: redemptionCount || 0,
      leadsCount: leadsCount || 0,
      tierDistribution,
      programInterestCounts,
      redemptionsBySponsor,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch analytics summary" });
  }
});

router.get("/redemptions", async (_req, res) => {
  try {
    const rows = await (prisma as any).couponRedemption?.findMany({
      include: {
        pool: { include: { sponsor: true } },
        fan: { select: { id: true, fullName: true, city: true, tier: { select: { name: true } } } },
      },
      orderBy: { redeemedAt: "desc" },
      take: 500,
    });
    return res.json(rows || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch redemptions" });
  }
});

router.get("/leads", async (_req, res) => {
  try {
    const rows = await (prisma as any).fanConversionLead?.findMany({
      include: { fan: { select: { id: true, fullName: true, city: true, tier: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return res.json(rows || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch leads" });
  }
});

router.get("/audit", async (_req, res) => {
  try {
    const logs = await (prisma as any).auditLog?.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    return res.json(logs || []);
  } catch (error: any) {
    return res.status(500).json({ message: error.message || "Failed to fetch audit logs" });
  }
});

export default router;



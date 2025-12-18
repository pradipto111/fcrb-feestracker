export type FanClubTierId = "rookie" | "regular" | "inner";

/**
 * Schema-ready placeholder entities (UI-only for now).
 * These are intentionally simple so they can be mapped to Prisma / Mongo later.
 */
export type FanClubTier = {
  id: FanClubTierId;
  name: string;
  priceINRYearly: number;
  recommended?: boolean;
};

export type FanClubMember = {
  /** Future: auth user id */
  id: string;
  joinedAt: string; // ISO
  tierId: FanClubTierId;
  /** Future: referral attribution */
  source?: "header_cta" | "homepage_section" | "unknown";
};

export type SponsorReward = {
  id: string;
  sponsorId: string;
  title: string;
  /** Minimum tier required to unlock this reward (placeholder) */
  minTier?: FanClubTierId;
  /** Context tag used in UI (placeholder) */
  incentiveTag?: "WIN_BONUS" | "MATCHDAY_SPECIAL" | "TRAINING_BOOST";
};

export type RewardViewEvent = {
  id: string;
  at: string; // ISO
  sponsorId: string;
  rewardId?: string;
  type: "impression" | "hover";
};

export type FanClubCTAEvent = {
  id: string;
  at: string; // ISO
  ctaId: string;
  type: "click" | "hover";
  durationMs?: number;
};



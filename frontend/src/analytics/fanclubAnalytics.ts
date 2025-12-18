import type { FanClubTierId } from "../types/fanclub";

type FanClubEvent =
  | { id: string; at: string; type: "fanclub_section_view"; sectionId: string }
  | { id: string; at: string; type: "fanclub_scroll_depth"; sectionId: string; depthPct: number }
  | { id: string; at: string; type: "fanclub_tier_selected"; tierId: FanClubTierId }
  | { id: string; at: string; type: "fanclub_join_clicked"; tierId: FanClubTierId; source: "header_cta" | "homepage_section" | "unknown" }
  | { id: string; at: string; type: "fanclub_onboarding_step"; step: 1 | 2 | 3 | 4 }
  | { id: string; at: string; type: "fanclub_cta_hover"; ctaId: string; durationMs: number }
  | { id: string; at: string; type: "fanclub_reward_hover"; sponsorId: string }
  | { id: string; at: string; type: "fanclub_sponsor_card_view"; sponsorId: string; incentiveTag?: string };

const STORAGE_KEY = "rv_fanclub_events_v1";

function safeNowISO() {
  return new Date().toISOString();
}

function safeId() {
  // crypto.randomUUID is not always available (older browsers / http)
  try {
    return crypto.randomUUID();
  } catch {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function readEvents(): FanClubEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FanClubEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: FanClubEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-2000))); // cap growth
  } catch {
    // ignore quota / disabled storage
  }
}

function pushEvent(event: FanClubEvent) {
  const events = readEvents();
  events.push(event);
  writeEvents(events);
}

export function trackFanClubSectionView(sectionId: string) {
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_section_view", sectionId });
}

export function trackFanClubScrollDepth(sectionId: string, depthPct: number) {
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_scroll_depth", sectionId, depthPct: Math.max(0, Math.min(100, Math.round(depthPct))) });
}

export function trackFanClubTierSelected(tierId: FanClubTierId) {
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_tier_selected", tierId });
}

export function trackFanClubJoinClicked(tierId: FanClubTierId, source: "header_cta" | "homepage_section" | "unknown" = "unknown") {
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_join_clicked", tierId, source });
}

export function trackFanClubOnboardingStep(step: 1 | 2 | 3 | 4) {
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_onboarding_step", step });
}

export function trackFanClubCtaHover(ctaId: string, durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs <= 0) return;
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_cta_hover", ctaId, durationMs: Math.round(durationMs) });
}

export function trackFanClubRewardHover(sponsorId: string) {
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_reward_hover", sponsorId });
}

export function trackFanClubSponsorCardView(sponsorId: string, incentiveTag?: string) {
  pushEvent({ id: safeId(), at: safeNowISO(), type: "fanclub_sponsor_card_view", sponsorId, incentiveTag });
}

export type FanClubAnalyticsSnapshot = {
  // Growth
  totalMembers: number;
  newMembers7d: number;
  newMembers30d: number;
  tierDistribution: Record<FanClubTierId, number>;
  upgradeRatePlaceholder: string;
  // Engagement
  sectionViews: number;
  rewardHovers: number;
  ctaHoverMs: number;
  maxScrollDepthPct: number;
  // Sponsor exposure
  sponsorCardViews: Record<string, number>;
  rewardImpressionsPerSponsor: Record<string, number>;
  topSponsorByViews: string | null;
  incentiveVisibility: Record<string, number>;
  // Funnel
  funnel: { visited: number; viewedBenefits: number; selectedTier: number; joined: number };
};

function isWithinDays(atISO: string, days: number): boolean {
  const at = new Date(atISO).getTime();
  if (!Number.isFinite(at)) return false;
  const ms = days * 24 * 60 * 60 * 1000;
  return Date.now() - at <= ms;
}

export function getFanClubAnalyticsSnapshot(): FanClubAnalyticsSnapshot {
  const events = readEvents();

  const tierDistribution: Record<FanClubTierId, number> = { rookie: 0, regular: 0, inner: 0 };
  const joins = events.filter((e) => e.type === "fanclub_join_clicked") as Extract<FanClubEvent, { type: "fanclub_join_clicked" }>[];

  for (const j of joins) tierDistribution[j.tierId] += 1;

  const totalMembers = joins.length;
  const newMembers7d = joins.filter((j) => isWithinDays(j.at, 7)).length;
  const newMembers30d = joins.filter((j) => isWithinDays(j.at, 30)).length;

  const sectionViews = events.filter((e) => e.type === "fanclub_section_view").length;
  const rewardHovers = events.filter((e) => e.type === "fanclub_reward_hover").length;
  const ctaHoverMs = (events.filter((e) => e.type === "fanclub_cta_hover") as Extract<FanClubEvent, { type: "fanclub_cta_hover" }>[])
    .reduce((sum, e) => sum + (e.durationMs || 0), 0);

  const scrollDepthEvents = events.filter((e) => e.type === "fanclub_scroll_depth") as Extract<FanClubEvent, { type: "fanclub_scroll_depth" }>[];
  const maxScrollDepthPct = scrollDepthEvents.reduce((m, e) => Math.max(m, e.depthPct), 0);

  const sponsorCardViews: Record<string, number> = {};
  const incentiveVisibility: Record<string, number> = {};
  for (const ev of events) {
    if (ev.type === "fanclub_sponsor_card_view") {
      sponsorCardViews[ev.sponsorId] = (sponsorCardViews[ev.sponsorId] || 0) + 1;
      if (ev.incentiveTag) incentiveVisibility[ev.incentiveTag] = (incentiveVisibility[ev.incentiveTag] || 0) + 1;
    }
  }

  // Reward impressions per sponsor is approximated by reward hovers for now (UI-only).
  const rewardImpressionsPerSponsor: Record<string, number> = {};
  for (const ev of events) {
    if (ev.type === "fanclub_reward_hover") {
      rewardImpressionsPerSponsor[ev.sponsorId] = (rewardImpressionsPerSponsor[ev.sponsorId] || 0) + 1;
    }
  }

  const topSponsorByViews =
    Object.entries(sponsorCardViews).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const viewedBenefits = events.filter((e) => e.type === "fanclub_onboarding_step" && e.step === 3).length;
  const selectedTier = events.filter((e) => e.type === "fanclub_tier_selected").length;

  return {
    totalMembers,
    newMembers7d,
    newMembers30d,
    tierDistribution,
    upgradeRatePlaceholder: "—",
    sectionViews,
    rewardHovers,
    ctaHoverMs,
    maxScrollDepthPct,
    sponsorCardViews,
    rewardImpressionsPerSponsor,
    topSponsorByViews,
    incentiveVisibility,
    funnel: {
      visited: sectionViews,
      viewedBenefits,
      selectedTier,
      joined: totalMembers,
    },
  };
}



/**
 * Fan Club Benefits Page - Full Overhaul
 * Football-first design with sponsor carousels, tier system, and dynamic rewards
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Button } from "../components/ui/Button";
import { FAN_CLUB_TIERS, SPONSOR_BENEFITS, type IncentiveTag, type SponsorBenefit } from "../data/fanclubBenefits";
import { SponsorLogoWall } from "../components/home/SponsorLogoWall";
import { SectionBackground } from "../components/shared/SectionBackground";
import { ArrowRightIcon, CalendarIcon, DumbbellIcon, TrophyIcon, LinkIcon, StarIcon, LockIcon } from "../components/icons/IconSet";
import { galleryAssets } from "../config/assets";

const IncentiveBadge = ({ tag, accent }: { tag: IncentiveTag; accent: string }) => {
  const meta = useMemo(() => {
    if (tag === "WIN_BONUS") return { label: "Win Bonus", Icon: TrophyIcon };
    if (tag === "MATCHDAY_SPECIAL") return { label: "Matchday Special", Icon: CalendarIcon };
    return { label: "Training Boost", Icon: DumbbellIcon };
  }, [tag]);
  const Icon = meta.Icon;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 999,
        border: `1px solid ${accent}33`,
        background: "rgba(0,0,0,0.18)",
        color: colors.text.secondary,
        ...typography.caption,
        fontSize: typography.fontSize.xs,
        letterSpacing: "0.12em",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} color={accent} />
      {meta.label}
    </div>
  );
};

const RewardTile = ({ text, accent, accent2 }: { text: string; accent: string; accent2: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={!reduce ? { y: -2, scale: 1.01 } : undefined}
      style={{
        scrollSnapAlign: "start",
        flex: "0 0 auto",
        width: 320,
        borderRadius: borderRadius.card, // 16px - football-first
        border: "1px solid rgba(255,255,255,0.10)",
        background: colors.surface.card, // Football-first card background
        boxShadow: shadows.card, // Sports broadcast style
        overflow: "hidden",
        position: "relative",
        minHeight: 88,
        padding: spacing.cardPadding, // 32px minimum - readable text zones (no text touching borders)
        paddingTop: spacing.lg, // Extra top padding
        paddingBottom: spacing.lg, // Extra bottom padding
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 18% 22%, ${accent}1E 0%, transparent 60%), radial-gradient(circle at 88% 18%, ${accent2}18 0%, transparent 62%)`,
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: spacing.xs }}>
        <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em", lineHeight: 1.4 }}>MEMBER REWARD</div>
        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.4 }}>{text}</div>
      </div>
    </motion.div>
  );
};

const LockMark = ({ color = "rgba(255,255,255,0.92)" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block" }}>
    <path
      fill={color}
      d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm7 12H7v-8h10v8Z"
    />
  </svg>
);

// Sponsor Carousel Component - Auto-scrolling horizontal carousel
const SponsorCarousel: React.FC<{
  sponsor: SponsorBenefit;
  previewTier: "rookie" | "regular" | "inner";
  isMobile: boolean;
}> = ({ sponsor, previewTier, isMobile }) => {
  const reduce = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const currentRank = useMemo(() => {
    const tierRank: Record<"rookie" | "regular" | "inner", number> = { rookie: 0, regular: 1, inner: 2 };
    return tierRank[previewTier];
  }, [previewTier]);

  const rewardTierLabel: Record<number, string> = { 0: "Rookie Fan", 1: "Matchday Regular", 2: "Inner Circle" };

  return (
    <div
      style={{
        display: "flex",
        gap: spacing.md,
        overflowX: "auto",
        paddingBottom: spacing.sm, // 8px padding
        paddingLeft: spacing.sm, // 8px padding to prevent clipping
        paddingRight: spacing.sm, // 8px padding
        paddingTop: spacing.xs, // 4px top padding
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        position: "relative",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={carouselRef}
    >
      {sponsor.rewards.map((r, idx) => {
        const locked = idx > currentRank;
        const unlockAt = rewardTierLabel[idx] || "Higher tier";
        return (
          <div key={`${sponsor.id}-${idx}`} style={{ position: "relative" }}>
            <RewardTile text={r} accent={sponsor.accent} accent2={sponsor.accent2} />
            {locked ? (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: borderRadius.card, // 16px - football-first
                  background: colors.surface.dark,
                  border: `1px solid ${sponsor.accent}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: spacing.cardPadding,
                  textAlign: "center",
                  boxShadow: shadows.card,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      border: `1px solid ${sponsor.accent}33`,
                      background: `${sponsor.accent}14`,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: `0 0 26px ${sponsor.glow}`,
                    }}
                  >
                    <LockMark />
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.25 }}>
                    Locked
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>Unlocks at {unlockAt}</div>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const SponsorRewardsCardWithLocks = ({
  sponsor,
  isMobile,
  previewTier,
}: {
  sponsor: SponsorBenefit;
  isMobile: boolean;
  previewTier: "rookie" | "regular" | "inner";
}) => {
  const reduce = useReducedMotion();
  const tooltip = "Coming soon — Fan Club unlocks perks";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!reduce ? { y: -4 } : undefined}
      style={{
        borderRadius: borderRadius.card, // 16px - football-first
        border: `1px solid ${sponsor.accent}40`, // Sponsor-branded border
        background: colors.surface.card, // Football-first card background
        backdropFilter: "blur(14px)",
        boxShadow: shadows.card, // Sports broadcast style
        overflow: "hidden",
        position: "relative",
        minWidth: 0,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 14% 18%, ${sponsor.accent}22 0%, transparent 58%), radial-gradient(circle at 88% 22%, ${sponsor.accent2}1C 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.55) 0%, rgba(10,22,51,0.45) 45%, rgba(5,11,32,0.62) 100%)`,
          opacity: 0.95,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, ${sponsor.accent}AA, ${sponsor.accent2}AA)`,
          opacity: 0.55,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: spacing.cardPadding, display: "flex", flexDirection: "column", gap: spacing.md }}>
        {/* Header with Logo, Name, and Website CTA */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md, paddingBottom: spacing.xs }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
            {/* Logo Container - Clickable to sponsor website */}
            <a
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label={`Visit ${sponsor.name} website`}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: borderRadius.card, // 16px - football-first
                  border: `1px solid rgba(255,255,255,0.12)`,
                  background: "rgba(255,255,255,0.04)",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!reduce) {
                    e.currentTarget.style.borderColor = sponsor.accent;
                    e.currentTarget.style.background = `${sponsor.accent}14`;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <img
                  src={sponsor.logoSrc}
                  alt={`${sponsor.name} logo`}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = "none";
                  }}
                  style={{
                    width: "90%",
                    height: "90%",
                    objectFit: "contain",
                    filter: "grayscale(100%) brightness(1.35)",
                    transition: "filter 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!reduce) {
                      e.currentTarget.style.filter = "grayscale(0%) brightness(1.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = "grayscale(100%) brightness(1.35)";
                  }}
                />
              </div>
            </a>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ ...typography.overline, color: sponsor.accent2, letterSpacing: "0.14em", marginBottom: 4 }}>{sponsor.roleLabel}</div>
              <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.15 }}>{sponsor.name}</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>{sponsor.themeLabel}</div>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <IncentiveBadge tag={sponsor.incentiveTag} accent={sponsor.accent} />
          </div>
        </div>

        {/* Sponsor Website CTA - Prominent but secondary */}
        <a
          href={sponsor.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: spacing.xs,
            padding: `${spacing.xs} ${spacing.sm}`,
            borderRadius: borderRadius.button,
            border: `1px solid ${sponsor.accent}40`,
            background: `${sponsor.accent}08`,
            color: sponsor.accent2,
            textDecoration: "none",
            ...typography.caption,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.semibold,
            letterSpacing: "0.08em",
            transition: "all 0.2s ease",
            alignSelf: "flex-start",
          }}
          onMouseEnter={(e) => {
            if (!reduce) {
              e.currentTarget.style.background = `${sponsor.accent}18`;
              e.currentTarget.style.borderColor = sponsor.accent;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `${sponsor.accent}08`;
            e.currentTarget.style.borderColor = `${sponsor.accent}40`;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Visit {sponsor.name} <LinkIcon size={12} color={sponsor.accent2} />
        </a>

        {/* Sponsor Carousel */}
        <SponsorCarousel sponsor={sponsor} previewTier={previewTier} isMobile={isMobile} />

        {/* Dynamic Offers Section - Better padding */}
        <div
          style={{
            padding: spacing.lg, // 24px padding - proper spacing from borders
            borderRadius: borderRadius.card,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm, // 8px gap between items
          }}
        >
          <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em", lineHeight: 1.5 }}>{sponsor.incentiveCopy}</div>
          {sponsor.secondaryIncentiveCopy ? (
            <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.92, lineHeight: 1.5 }}>Also: {sponsor.secondaryIncentiveCopy}</div>
          ) : null}
          <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.9, marginTop: spacing.xs, lineHeight: 1.5 }}>
            Dynamic rewards (rolling soon)
          </div>
        </div>

        {/* Primary CTA */}
        <div title={tooltip} style={{ marginTop: spacing.xs }}>
          <Button
            variant="primary"
            size="md"
            disabled
            aria-disabled="true"
            style={{
              borderRadius: 999,
              padding: isMobile ? "12px 18px" : "12px 22px",
              background: `linear-gradient(135deg, ${sponsor.accent2} 0%, ${sponsor.accent} 100%)`,
              boxShadow: `0 8px 26px ${sponsor.glow}`,
              width: "100%",
            }}
          >
            Join the Fan Club to Unlock Your First Gift
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const FanClubBenefitsPreviewPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [previewTier, setPreviewTier] = useState<"rookie" | "regular" | "inner">("regular");
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const [tierHint, setTierHint] = useState<null | string>(null);

  useEffect(() => {
    document.title = "Fan Club Benefits • FC Real Bengaluru";
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const onExploreBenefits = () => {
    if (!pricingRef.current) return;
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(pricingRef.current, { offset: -100, duration: 1.0 });
    } else {
      pricingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.club.deep, // Football-first background
        position: "relative",
      }}
    >
      <PublicHeader />

      {/* Lively Background */}
      <SectionBackground
        variant="fanclub"
        type="image"
        src={galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium}
        overlayIntensity="medium"
        style={{ position: "absolute", inset: 0 }}
      />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          position: "relative",
          zIndex: 3,
          padding: isMobile ? `${spacing.xl} ${spacing.lg}` : `${spacing["3xl"]} ${spacing.xl}`,
          paddingTop: isMobile ? "110px" : "120px", // Keep clear of sticky header
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Section identity */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 0.7fr", gap: spacing.lg, alignItems: "center", marginBottom: spacing.xl }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>FAN CLUB ECOSYSTEM</div>
                <h1 style={{ ...typography.h1, fontSize: `clamp(2.2rem, 4.4vw, 3.2rem)`, margin: 0, color: colors.text.primary, lineHeight: 1.08 }}>
                  Your Benefits for Backing FC Real Bengaluru
                </h1>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.7, marginTop: spacing.md, maxWidth: "70ch" }}>
                  Backing the club comes with real rewards — on and off the pitch. Explore exclusive perks from our partners and unlock member-only benefits.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end", gap: spacing.sm, flexWrap: "wrap" }}>
                <div title="Coming soon — Fan Club unlocks perks">
                  <Button variant="primary" size="md" disabled aria-disabled="true" style={{ borderRadius: 999 }}>
                    Join the Fan Club to Unlock Your First Gift
                  </Button>
                </div>
                <Button variant="secondary" size="md" onClick={onExploreBenefits} style={{ borderRadius: 999 }}>
                  Explore All Fan Benefits
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Sponsors announcement + logos */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              style={{
                borderRadius: borderRadius.card, // 16px - football-first
                border: "1px solid rgba(255,255,255,0.10)",
                background: colors.surface.card, // Football-first card background
                backdropFilter: "blur(14px)",
                boxShadow: shadows.card, // Sports broadcast style
                overflow: "hidden",
                padding: spacing.cardPadding, // 32px minimum - proper padding
                position: "relative",
                marginBottom: spacing["2xl"],
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 20% 20%, rgba(0,224,255,0.08) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.08) 0%, transparent 55%), linear-gradient(135deg, rgba(5,11,32,0.62) 0%, rgba(10,22,51,0.48) 45%, rgba(5,11,32,0.68) 100%)",
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.lg, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, lineHeight: 1.1 }}>Perks from Our Sponsors</div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                      Click any logo to visit our partner's website
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.04)",
                      color: colors.text.secondary,
                    }}
                  >
                    <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.9 }}>OFFICIAL SPONSORS 2025</span>
                    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: colors.accent.main, boxShadow: "0 0 18px rgba(255,169,0,0.35)" }} />
                    <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.85 }}>MEMBERS-ONLY REWARDS</span>
                  </div>
                </div>
                <SponsorLogoWall
                  sponsors={SPONSOR_BENEFITS.map((s) => ({
                    id: s.id,
                    name: s.name,
                    logoSrc: s.logoSrc,
                    accent: s.accent,
                    accent2: s.accent2,
                    glow: s.glow,
                    tagline: "",
                    websiteUrl: s.websiteUrl, // Include website URL for clickable logos
                  }))}
                  isMobile={isMobile}
                />
              </div>
            </div>
          </motion.div>

          {/* Tier Preview */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: spacing.lg }}
          >
            <div
              style={{
                display: "flex",
                alignItems: isMobile ? "stretch" : "center",
                justifyContent: "space-between",
                gap: spacing.md,
                flexDirection: isMobile ? "column" : "row",
                padding: spacing.md, // Extra padding
                borderRadius: borderRadius.card,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.15em", marginBottom: 6 }}>TIER PREVIEW</div>
                <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.5 }}>
                  Rewards appear locked above your tier. Preview what each tier unlocks.
                </div>
              </div>

              <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { id: "rookie" as const, label: "Rookie Fan" },
                  { id: "regular" as const, label: "Matchday Regular" },
                  { id: "inner" as const, label: "Inner Circle" },
                ].map((t) => {
                  const active = previewTier === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPreviewTier(t.id)}
                      style={{
                        ...typography.caption,
                        fontSize: typography.fontSize.sm,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: active ? "1px solid rgba(0,224,255,0.40)" : "1px solid rgba(255,255,255,0.12)",
                        background: active ? "rgba(0,224,255,0.10)" : "rgba(255,255,255,0.04)",
                        color: active ? colors.text.primary : colors.text.secondary,
                        cursor: "pointer",
                        boxShadow: active ? "0 12px 32px rgba(0,0,0,0.35), 0 0 24px rgba(0,224,255,0.10)" : "none",
                        transition: "all 0.18s ease",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* What Unlocks Inside RealVerse */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: spacing["2xl"] }}
          >
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
                REALVERSE INTEGRATION
              </div>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>What Unlocks Inside RealVerse</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                Your Fan Club membership integrates seamlessly with RealVerse — the club's digital ecosystem
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))",
                gap: spacing.md,
              }}
            >
              {[
                { label: "Sponsors", sub: "Exclusive partner perks", Icon: TrophyIcon, accent: colors.accent.main },
                { label: "Community", sub: "Discussions & polls", Icon: CalendarIcon, accent: colors.primary.main },
                { label: "Progression", sub: "Tier unlocks & badges", Icon: ArrowRightIcon, accent: colors.success.main },
                { label: "Programs", sub: "Pathway access", Icon: DumbbellIcon, accent: colors.accent.main },
              ].map(({ label, sub, Icon, accent }) => (
                <div
                  key={label}
                  style={{
                    borderRadius: borderRadius.card,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.03)",
                    padding: spacing.lg,
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.sm,
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.card,
                      border: `1px solid ${accent}40`,
                      background: `${accent}14`,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: `0 0 24px ${accent}20`,
                      marginBottom: spacing.xs,
                    }}
                  >
                    <Icon size={24} color={accent} />
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                    {label}
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.5 }}>{sub}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sponsor Reward Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: spacing["3xl"] }}
          >
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
                SPONSOR BENEFITS
              </div>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Partner Rewards & Offers</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                Each sponsor offers unique perks that unlock based on your Fan Club tier
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: spacing.lg, alignItems: "stretch" }}>
              {SPONSOR_BENEFITS.map((s) => (
                <SponsorRewardsCardWithLocks key={s.id} sponsor={s} isMobile={isMobile} previewTier={previewTier} />
              ))}
            </div>
          </motion.div>

          {/* Pricing & Benefits matrix */}
          <div ref={pricingRef} style={{ marginTop: spacing["3xl"] }}>
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap", marginBottom: spacing.lg }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>FAN CLUB TIERS</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Pricing & Benefits</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>1 membership → perks from all partners</div>
                </div>
                {tierHint ? <div style={{ ...typography.caption, color: colors.text.muted }}>{tierHint}</div> : null}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
                {FAN_CLUB_TIERS.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      borderRadius: borderRadius["2xl"],
                      border: t.highlight ? `1px solid rgba(0,224,255,0.28)` : "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.03)",
                      boxShadow: t.highlight ? "0 24px 70px rgba(0,0,0,0.45), 0 0 36px rgba(0,224,255,0.10)" : "0 18px 56px rgba(0,0,0,0.40)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                    onMouseEnter={() => setTierHint(t.name)}
                    onMouseLeave={() => setTierHint(null)}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: t.highlight
                          ? "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.14) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.10) 0%, transparent 55%)"
                          : "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.06) 0%, transparent 55%)",
                        opacity: 0.95,
                        pointerEvents: "none",
                      }}
                    />
                    <div style={{ position: "relative", zIndex: 1, padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.md }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{t.name}</div>
                        {t.highlight ? (
                          <div style={{ ...typography.caption, color: colors.primary.main, letterSpacing: "0.14em", fontWeight: 800 }}>RECOMMENDED</div>
                        ) : null}
                      </div>
                      <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>{t.priceLabel}</div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {t.benefits.map((b) => (
                          <div key={b} style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.5 }}>
                            • {b}
                          </div>
                        ))}
                      </div>

                      <div title="Coming soon — Fan Club unlocks perks" style={{ marginTop: "auto" }}>
                        <Button variant={t.highlight ? "primary" : "secondary"} size="md" disabled aria-disabled="true" style={{ width: "100%", borderRadius: 999 }}>
                          {t.ctaLabel}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fan Club Onboarding Preview */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginTop: spacing["3xl"], marginBottom: spacing["2xl"] }}
          >
            <div style={{ marginBottom: spacing.lg }}>
              <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
                ONBOARDING PREVIEW
              </div>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>The FC Real Bengaluru Fan Club</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                More than a membership — it's how you stay part of the journey.
              </div>
            </div>

            <div
              style={{
                borderRadius: borderRadius["2xl"],
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(10,16,32,0.34)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 22px 64px rgba(0,0,0,0.42)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.14) 0%, transparent 56%), radial-gradient(circle at 82% 16%, rgba(255,169,0,0.12) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.70) 0%, rgba(10,22,51,0.44) 42%, rgba(5,11,32,0.72) 100%)",
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1, padding: isMobile ? spacing.lg : spacing["2xl"] }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", gap: spacing.xl, alignItems: "stretch" }}>
                  {/* Left: Preview Info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                      Start Your Fan Club Journey
                    </div>
                    <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.75, marginBottom: spacing.lg }}>
                      A premium Fan Club built for belonging, progress, and real rewards — without clutter or long forms.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.sm, marginBottom: spacing.lg }}>
                      {[
                        { label: "Belonging", sub: "Badge + community preview", Icon: StarIcon, accent: "rgba(0,224,255,0.55)" },
                        { label: "Rewards", sub: "Sponsor perks (dynamic soon)", Icon: TrophyIcon, accent: "rgba(255,169,0,0.60)" },
                        { label: "Progress", sub: "Next unlock hints", Icon: ArrowRightIcon, accent: "rgba(34,197,94,0.60)" },
                      ].map(({ label, sub, Icon, accent }) => (
                        <div
                          key={label}
                          style={{
                            borderRadius: borderRadius.xl,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.03)",
                            padding: spacing.md,
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 14,
                              border: `1px solid ${accent}`,
                              background: "rgba(0,0,0,0.20)",
                              display: "grid",
                              placeItems: "center",
                              boxShadow: `0 0 24px ${accent.replace("0.55", "0.14").replace("0.60", "0.14")}`,
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={18} color={accent.replace("0.55", "1").replace("0.60", "1")} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>
                              {label}
                            </div>
                            <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                      <Button variant="primary" size="md" disabled aria-disabled="true" style={{ borderRadius: 999 }}>
                        Join the Fan Club
                      </Button>
                      <Button variant="secondary" size="md" onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth" })} style={{ borderRadius: 999 }}>
                        View Pricing
                      </Button>
                    </div>
                  </div>

                  {/* Right: Fan Hub Preview */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: spacing.sm }}>
                      FAN CLUB HUB PREVIEW
                    </div>

                    {/* Status card */}
                    <div
                      style={{
                        borderRadius: borderRadius["2xl"],
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.03)",
                        padding: spacing.lg,
                        marginBottom: spacing.md,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.12) 0%, transparent 60%), radial-gradient(circle at 82% 18%, rgba(255,169,0,0.10) 0%, transparent 62%)",
                          opacity: 0.95,
                        }}
                      />
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, marginBottom: spacing.md }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>Tier</div>
                            <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>
                              {FAN_CLUB_TIERS.find((t) => t.id === previewTier)?.name || "Matchday Regular"}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              borderRadius: 999,
                              border: `1px solid ${previewTier === "inner" ? colors.accent.main : colors.primary.main}33`,
                              background: "rgba(255,255,255,0.04)",
                              boxShadow: `0 12px 32px rgba(0,0,0,0.35), 0 0 26px ${previewTier === "inner" ? "rgba(255,169,0,0.14)" : "rgba(0,224,255,0.12)"}`,
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.14)",
                                display: "grid",
                                placeItems: "center",
                                background: "rgba(0,0,0,0.18)",
                              }}
                            >
                              {previewTier === "inner" ? (
                                <TrophyIcon size={18} color={colors.accent.main} />
                              ) : (
                                <StarIcon size={18} color={colors.primary.main} />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em", fontSize: typography.fontSize.xs }}>
                                FAN BADGE
                              </div>
                              <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.1 }}>
                                {FAN_CLUB_TIERS.find((t) => t.id === previewTier)?.name || "Matchday Regular"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: spacing.md }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: spacing.sm }}>
                            <div style={{ ...typography.caption, color: colors.text.muted }}>Progress</div>
                            <div style={{ ...typography.caption, color: colors.text.muted }}>Visual only</div>
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              height: 10,
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${(previewTier === "rookie" ? 1 : previewTier === "regular" ? 2 : 3) / 3 * 100}%`,
                                background: "linear-gradient(90deg, rgba(0,224,255,0.75), rgba(255,169,0,0.65))",
                              }}
                            />
                          </div>
                          <div style={{ marginTop: spacing.sm, ...typography.caption, color: colors.text.muted }}>
                            Next unlock:{" "}
                            {previewTier === "inner"
                              ? "Inner Circle recognition (future)"
                              : previewTier === "regular"
                                ? "Upgrade to Inner Circle for maximum perks"
                                : "Move to Matchday Regular for win bonuses"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rewards snapshot */}
                    <div
                      style={{
                        borderRadius: borderRadius["2xl"],
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.03)",
                        padding: spacing.lg,
                        marginBottom: spacing.md,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm, marginBottom: spacing.sm }}>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>Rewards Snapshot</div>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>Top 3 perks</div>
                      </div>
                      <div style={{ display: "grid", gap: spacing.sm }}>
                        {SPONSOR_BENEFITS.slice(0, 3).map((s, idx) => {
                          const tierRank = previewTier === "rookie" ? 1 : previewTier === "regular" ? 2 : 3;
                          const unlocked = tierRank >= (idx === 0 ? 1 : idx === 1 ? 2 : 3);
                          return (
                            <div
                              key={s.id}
                              style={{
                                borderRadius: borderRadius.xl,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(0,0,0,0.16)",
                                padding: "12px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background: `radial-gradient(circle at 16% 18%, ${s.accent}12 0%, transparent 65%)`,
                                  opacity: 0.9,
                                }}
                              />
                              <div
                                style={{
                                  position: "relative",
                                  zIndex: 1,
                                  width: 36,
                                  height: 36,
                                  borderRadius: 14,
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  background: "rgba(255,255,255,0.04)",
                                  display: "grid",
                                  placeItems: "center",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <img
                                  src={s.logoSrc}
                                  alt=""
                                  aria-hidden="true"
                                  style={{ width: "88%", height: "88%", objectFit: "contain", filter: "grayscale(100%) brightness(1.25)" }}
                                />
                              </div>
                              <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                                <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{s.incentiveCopy}</div>
                                <div
                                  style={{
                                    ...typography.body,
                                    color: colors.text.primary,
                                    fontWeight: typography.fontWeight.semibold,
                                    lineHeight: 1.25,
                                    marginTop: 4,
                                    opacity: unlocked ? 1 : 0.55,
                                  }}
                                >
                                  {s.rewards[0]}
                                </div>
                              </div>
                              <div style={{ marginLeft: "auto", position: "relative", zIndex: 1 }}>
                                {unlocked ? (
                                  <div style={{ ...typography.caption, color: "#22C55E", fontWeight: 700 }}>Unlocked</div>
                                ) : (
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, ...typography.caption, color: colors.text.muted }}>
                                    <LockIcon size={14} color={colors.text.muted} /> Locked
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Community preview */}
                    <div
                      style={{
                        borderRadius: borderRadius["2xl"],
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.03)",
                        padding: spacing.lg,
                      }}
                    >
                      <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, marginBottom: spacing.sm }}>Community Preview</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: spacing.sm }}>
                        {["Fan discussions", "Matchday polls", "Club updates"].map((t) => (
                          <div
                            key={t}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              borderRadius: borderRadius.lg,
                              border: "1px solid rgba(255,255,255,0.10)",
                              background: "rgba(0,0,0,0.14)",
                            }}
                          >
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: "rgba(0,224,255,0.55)",
                                boxShadow: "0 0 18px rgba(0,224,255,0.18)",
                              }}
                            />
                            <div style={{ ...typography.body, color: colors.text.secondary }}>{t}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.6, marginBottom: spacing.sm }}>
                          Preview only — join the Fan Club to activate rewards and identity.
                        </div>
                        <Button variant="primary" size="md" disabled aria-disabled="true" style={{ width: "100%", borderRadius: 999 }}>
                          Join the Fan Club
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default FanClubBenefitsPreviewPage;

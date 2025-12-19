/**
 * Fan Club Benefits Page - Full Overhaul
 * Football-first design with sponsor carousels, tier system, and dynamic rewards
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { FAN_CLUB_TIERS, SPONSOR_BENEFITS, type IncentiveTag, type SponsorBenefit } from "../data/fanclubBenefits";
import { SponsorLogoWall } from "../components/home/SponsorLogoWall";
import { ArrowRightIcon, ArrowDownIcon, CalendarIcon, DumbbellIcon, TrophyIcon, LinkIcon, StarIcon, LockIcon } from "../components/icons/IconSet";
import { galleryAssets, heroAssets } from "../config/assets";

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
        ...glass.card,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!reduce ? { y: -4 } : undefined}
      style={{
        borderRadius: borderRadius.card, // 16px - football-first
        ...glass.card,
        border: `1px solid ${sponsor.accent}40`, // Sponsor-branded border
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
        <motion.a
          href={sponsor.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...heroCTAPillStyles.base,
            ...heroCTAPillStyles.gold,
            padding: "8px 12px",
            textDecoration: "none",
            alignSelf: "flex-start",
          }}
          whileHover={!reduce ? { y: -2 } : undefined}
          whileTap={!reduce ? { scale: 0.98 } : undefined}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Visit {sponsor.name} <LinkIcon size={12} color={colors.accent.main} />
          </span>
        </motion.a>

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

        {/* Less repetitive: one compact status strip (CTA lives outside cards) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            paddingTop: spacing.sm,
            marginTop: spacing.xs,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.5 }}>
            Perks unlock when Fan Club memberships go live.
          </div>
          <div
            style={{
              ...typography.caption,
              color: colors.text.secondary,
              letterSpacing: "0.14em",
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.04)",
              whiteSpace: "nowrap",
            }}
          >
            COMING SOON
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FanClubBenefitsPreviewPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [previewTier, setPreviewTier] = useState<"rookie" | "regular" | "inner">("regular");
  const [showAllPartners, setShowAllPartners] = useState(false);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const partnersRef = useRef<HTMLDivElement | null>(null);
  const [tierHint, setTierHint] = useState<null | string>(null);
  const reduceMotion = useReducedMotion();
  const heroVideoRef = useRef<HTMLIFrameElement>(null);
  const accentColor = colors.accent.main;
  const sectionPadding = isMobile ? `${spacing["3xl"]} ${spacing.lg}` : `${spacing["4xl"]} ${spacing.xl}`;
  const hoverLift = reduceMotion ? undefined : { y: -2 };
  const hoverLiftShadow = reduceMotion ? undefined : { y: -2, boxShadow: shadows.buttonHover };
  const tapPress = reduceMotion ? undefined : { scale: 0.98 };

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

  const onScrollToPartners = () => {
    if (!partnersRef.current) return;
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(partnersRef.current, { offset: -100, duration: 0.9 });
    } else {
      partnersRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <PublicHeader />

      {/* Programs-style page background stack (single source of truth)
          Video stays (desktop), image fallback on mobile. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
                  zIndex: 0,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
        {!isMobile ? (
                <iframe
                  ref={heroVideoRef}
                  src={`${heroAssets.backgroundVideoEmbed}&fs=0&cc_load_policy=0&mute=1&autoplay=1&loop=1&playlist=_iplvxf8JCo&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=0`}
                  style={{
                    position: "absolute",
              top: "50%",
              left: "50%",
              width: "100vw",
              height: "56.25vw",
              minWidth: "177.77777778vh",
              minHeight: "100vh",
              transform: "translate(-50%, -50%) scale(1.2)",
                    border: "none",
              opacity: 0.8,
                  }}
            allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen={false}
                  loading="eager"
                  title="Fan Club Benefits Background Video"
                />
        ) : (
          <div
              style={{
                position: "absolute",
              inset: 0,
                backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || heroAssets.teamBackground1024 || heroAssets.teamBackground})`,
                backgroundSize: "cover",
              backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
        )}
      </div>

      {/* Heavy gradient overlay (Programs cinematic style) */}
      <div
        aria-hidden="true"
              style={{
          position: "fixed",
                inset: 0,
                zIndex: 1,
                pointerEvents: "none",
          background: `linear-gradient(135deg, rgba(5, 11, 32, 0.85) 0%, rgba(10, 22, 51, 0.75) 50%, rgba(5, 11, 32, 0.85) 100%), radial-gradient(circle at 30% 30%, ${accentColor}15 0%, transparent 50%)`,
                }}
              />

      {/* Subtle grain (Programs cinematic style) */}
              <div
        aria-hidden="true"
                style={{
          position: "fixed",
                  inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
        }}
      />

      <main
                style={{
          position: "relative",
          zIndex: 3,
          padding: isMobile ? `0 ${spacing.lg}` : `0 ${spacing.xl}`, // hero handles header clearance
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Hero (homepage-style: video/parallax → lockup → staggered headline → CTAs → scroll cue) */}
          <motion.section
            id="fanclub-benefits-hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
                style={{
              position: "relative",
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: isMobile ? `${spacing["3xl"]} ${spacing.lg}` : `${spacing["4xl"]} ${spacing.xl}`,
              paddingTop: isMobile ? "120px" : "140px", // keep clear of sticky header
              // Reserve space for the scroll cue so it never overlaps CTAs
              paddingBottom: spacing["4xl"],
              overflow: "hidden",
              // Full-bleed background while keeping page content constrained
              width: "100vw",
              marginLeft: "calc(50% - 50vw)",
              marginRight: "calc(50% - 50vw)",
            }}
          >
            {/* Background media + overlays are page-level (Programs-style) */}

            {/* Content */}
            <div
              style={{
                maxWidth: "1400px",
                width: "100%",
                margin: "0 auto",
                padding: isMobile ? `0 ${spacing.md}` : `0 ${spacing.xl}`,
                position: "relative",
                zIndex: 10,
                display: "grid",
                gridTemplateColumns: "1fr",
                alignItems: "center",
                minHeight: "100%",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ maxWidth: 900 }}
              >
                {/* Club identity lockup + section label */}
                <motion.div
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: spacing.md,
                    padding: isMobile ? "8px 12px" : "10px 14px",
                    borderRadius: borderRadius.full,
                    background: "rgba(10, 16, 32, 0.42)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "0 18px 56px rgba(0,0,0,0.55)",
                    backdropFilter: "blur(14px)",
                    marginBottom: spacing.lg,
                  }}
                  aria-label="FC Real Bengaluru Fan Club Benefits"
                >
                  <img
                    src="/fcrb-logo.png"
                    alt="FC Real Bengaluru logo"
                    style={{
                      width: isMobile ? 34 : 40,
                      height: isMobile ? 34 : 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow: "0 10px 26px rgba(0,0,0,0.45), 0 0 18px rgba(0,224,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(255,255,255,0.06)",
                      flexShrink: 0,
                    }}
                    loading="eager"
                  />
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, minWidth: 0 }}>
                    <div
                      style={{
                        ...typography.overline,
                        color: colors.accent.main,
                        letterSpacing: "0.18em",
                        opacity: 0.95,
                      }}
                    >
                      FAN CLUB BENEFITS
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                        letterSpacing: "-0.01em",
                        fontSize: isMobile ? typography.fontSize.lg : typography.fontSize.xl,
                        textShadow: "0 6px 28px rgba(0,0,0,0.65)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      FC Real Bengaluru
                    </div>
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  style={{
                    ...typography.display,
                    fontSize: `clamp(2.8rem, 6.8vw, 5.3rem)`,
                    color: colors.text.primary,
                    marginBottom: spacing.lg,
                    lineHeight: 1.02,
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: "-0.03em",
                    textShadow: "0 6px 50px rgba(0, 0, 0, 0.85), 0 0 70px rgba(0, 224, 255, 0.18)",
                  }}
                >
                  {["Your", "Benefits", "for", "Backing"].map((word, idx) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + idx * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      style={{ display: "inline-block", marginRight: idx === 3 ? 0 : "0.22em" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                  <br />
                  {["FC", "Real"].map((word, idx) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 + idx * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      style={{ display: "inline-block", marginRight: "0.22em" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + 2 * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: "inline-block",
                      background: `linear-gradient(90deg, ${colors.accent.main}, rgba(255, 194, 51, 0.95))`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      textShadow: "none",
                    }}
                  >
                    Bengaluru.
                  </motion.span>
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 0.92, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    ...typography.body,
                    fontSize: `clamp(${typography.fontSize.lg}, 2vw, ${typography.fontSize.xl})`,
                    color: colors.text.secondary,
                    marginBottom: spacing.lg,
                    lineHeight: 1.75,
                    maxWidth: "780px",
                    textShadow: "0 2px 24px rgba(0, 0, 0, 0.65)",
                  }}
                >
                  A clean, football-first membership: earn status, unlock partner perks, and stay connected to the club — with a clear progression from top to bottom.
                </motion.p>

                {/* Hero highlights (captures below-the-fold essentials) */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.72, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    marginBottom: spacing.xl,
                    maxWidth: "920px",
                  }}
                >
                  {[
                    "Partner perks (tier unlocks)",
                    "Pricing + benefits matrix",
                    "Fan badge + progression",
                    "Community hub preview",
                  ].map((t) => (
                    <div
                      key={t}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "rgba(10, 16, 32, 0.32)",
                        backdropFilter: "blur(10px)",
                        color: colors.text.secondary,
                        ...typography.caption,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </motion.div>

                {/* Primary CTA row */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: spacing.md,
                    alignItems: "stretch",
                    maxWidth: isMobile ? "100%" : "720px",
                  }}
                >
                  {/* Join (coming soon) */}
                  <div title="Coming soon — Fan Club unlocks perks">
                    <div
                      aria-disabled="true"
                      style={{
                        ...heroCTAStyles.yellow,
                        width: "100%",
                        minHeight: 72,
                        padding: `${spacing.lg} ${spacing.xl}`,
                        opacity: 0.65,
                        cursor: "not-allowed",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                        <span style={heroCTAStyles.yellow.textStyle}>Join the Fan Club</span>
                        <span style={heroCTAStyles.yellow.subtitleStyle}>Unlock your first gift (coming soon)</span>
                      </div>
                      <LockIcon size={18} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                    </div>
                  </div>

                  {/* Explore pricing */}
                  <motion.button
                    type="button"
                    onClick={onExploreBenefits}
                    whileHover={hoverLiftShadow}
                    whileTap={tapPress}
                    style={{
                      ...heroCTAStyles.darkWithBorder,
                      width: "100%",
                      minHeight: 72,
                      padding: `${spacing.lg} ${spacing.xl}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing.md,
                      cursor: "pointer",
                    }}
                    aria-label="Explore pricing and tiers"
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                      <span style={heroCTAStyles.darkWithBorder.textStyle}>Explore Pricing</span>
                      <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>Compare tiers + benefits</span>
                    </div>
                    <motion.div
                      animate={!reduceMotion ? { x: [0, 3, 0] } : undefined}
                      transition={!reduceMotion ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
                      style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
                    >
                      <ArrowRightIcon size={20} color={colors.accent.main} />
                    </motion.div>
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            {/* Scroll indicator (match scoreboard ticker style) */}
            <motion.div
              style={{
                position: "absolute",
                bottom: spacing.xl,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: spacing.sm,
                pointerEvents: "none",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                style={{
                  padding: `${spacing.xs} ${spacing.md}`,
                  borderRadius: borderRadius.button,
                  background: "rgba(10,61,145,0.85)",
                  border: `1px solid ${colors.accent.main}`,
                  boxShadow: shadows.button,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: colors.accent.main,
                    boxShadow: `0 0 8px ${colors.accent.main}`,
                  }}
                />
                <span
                  style={{
                    ...typography.caption,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: "0.1em",
                    fontSize: "11px",
                  }}
                >
                  SCROLL
                </span>
              </div>
              <motion.div animate={!reduceMotion ? { y: [0, 6, 0] } : undefined} transition={!reduceMotion ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}>
                <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: colors.accent.main }}>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.div>
            </motion.div>

            {/* Bottom fade for seamless transition */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "200px",
                background: `linear-gradient(to bottom, transparent 0%, rgba(5, 11, 32, 0.3) 50%, rgba(5, 11, 32, 0.6) 100%)`,
                zIndex: 5,
                pointerEvents: "none",
              }}
            />

          </motion.section>

          {/* Page sections (Programs-style: transparent sections over one background stack) */}

          {/* Pathway cards (reference image language) */}
          <section style={{ padding: sectionPadding }}>
          <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ marginTop: 0 }}>
            <div
              style={{
                borderRadius: borderRadius["2xl"],
                border: "1px solid rgba(255,255,255,0.10)",
                ...glass.panel,
                overflow: "hidden",
                position: "relative",
                padding: isMobile ? spacing.lg : spacing["2xl"],
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "saturate(1.08) contrast(1.05)",
                  opacity: 0.22,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.10) 0%, transparent 60%), radial-gradient(circle at 82% 16%, rgba(255,169,0,0.10) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.78) 0%, rgba(10,22,51,0.52) 45%, rgba(5,11,32,0.82) 100%)",
                  opacity: 0.98,
                }}
              />
              <div aria-hidden="true" style={glass.overlayStrong} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                    FAN CLUB PATHWAY
                  </div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>A simple flow: join → unlock → enjoy</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs, lineHeight: 1.6 }}>
                    Clear progression so the page feels like one story, not scattered blocks.
                  </div>
                </div>

                <div style={{ marginTop: spacing.xl, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
                  {[
                    { n: 1, kicker: "STEP 1", title: "Join & get your badge", desc: "Pick a tier and claim your Fan Club identity inside RealVerse.", accent: "rgba(255,169,0,0.85)" },
                    { n: 2, kicker: "STEP 2", title: "Show up & level up", desc: "Matchdays, wins, and community activity move you forward.", accent: "rgba(0,224,255,0.80)" },
                    { n: 3, kicker: "STEP 3", title: "Unlock partner rewards", desc: "Perks from sponsors open up as your tier increases.", accent: "rgba(34,197,94,0.80)" },
                  ].map((s) => (
                    <div
                      key={s.n}
                      style={{
                        borderRadius: borderRadius["2xl"],
                        border: "1px solid rgba(255,255,255,0.12)",
                        ...glass.card,
                        overflow: "hidden",
                        position: "relative",
                        minHeight: 168,
                        padding: spacing.lg,
                      }}
                    >
                      <div aria-hidden="true" style={glass.overlaySoft} />
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `radial-gradient(circle at 22% 18%, ${s.accent}18 0%, transparent 62%)`,
                          opacity: 0.9,
                        }}
                      />
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                          <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em" }}>{s.kicker}</div>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 999,
                              border: `1px solid ${s.accent}55`,
                              background: "rgba(0,0,0,0.22)",
                              display: "grid",
                              placeItems: "center",
                              boxShadow: `0 0 26px ${s.accent.replace("0.80", "0.18").replace("0.85", "0.18")}`,
                              color: colors.text.primary,
                              fontWeight: 800,
                            }}
                          >
                            {s.n}
                          </div>
                        </div>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.1 }}>{s.title}</div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 10, lineHeight: 1.6 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: spacing.xl, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: spacing.md }}>
                  {[
                    { label: "Official Sponsors", sub: "Member-only partner perks", Icon: TrophyIcon, accent: colors.accent.main },
                    { label: "Community", sub: "Discussions + polls", Icon: CalendarIcon, accent: colors.primary.main },
                    { label: "Progression", sub: "Tier unlocks + badges", Icon: ArrowRightIcon, accent: "rgba(34,197,94,0.9)" },
                    { label: "Programs", sub: "Future pathway access", Icon: DumbbellIcon, accent: colors.accent.main },
                  ].map(({ label, sub, Icon, accent }) => (
                    <div
                      key={label}
                      style={{
                        borderRadius: borderRadius.xl,
                        border: "1px solid rgba(255,255,255,0.10)",
                        ...glass.inset,
                        padding: spacing.md,
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div aria-hidden="true" style={glass.overlaySoft} />
                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          width: 44,
                          height: 44,
                          borderRadius: 16,
                          border: `1px solid ${accent}40`,
                          background: `${accent}14`,
                          display: "grid",
                          placeItems: "center",
                          boxShadow: `0 0 24px ${accent}20`,
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} color={accent} />
                      </div>
                      <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>{label}</div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginTop: spacing.lg }}>
                  <motion.button
                    type="button"
                    onClick={onScrollToPartners}
                    whileHover={hoverLift}
                    whileTap={tapPress}
                    aria-label="Scroll to partner perks"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: "rgba(0,0,0,0.22)",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      boxShadow: "0 18px 48px rgba(0,0,0,0.40)",
                    }}
                  >
                    <ArrowDownIcon size={18} color={colors.accent.main} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
          </section>

          {/* Partner perks (tier switch + featured partners, then full wall) */}
          <section style={{ padding: sectionPadding }}>
          <div ref={partnersRef} style={{ marginTop: 0, scrollMarginTop: 120 }}>
            <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: spacing.lg }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                    PARTNER PERKS
                  </div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Perks from our sponsors</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs, lineHeight: 1.6 }}>
                    Pick a tier to preview what unlocks. Each sponsor opens up rewards as you level up.
                  </div>
                </div>

                <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { id: "rookie" as const, label: "Rookie" },
                    { id: "regular" as const, label: "Regular" },
                    { id: "inner" as const, label: "Inner Circle" },
                  ].map((t) => {
                    const active = previewTier === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        type="button"
                        onClick={() => setPreviewTier(t.id)}
                        whileHover={hoverLift}
                        whileTap={tapPress}
                        style={{
                          ...heroCTAPillStyles.base,
                          padding: "10px 14px",
                          boxShadow: "none",
                          border: active ? `2px solid ${colors.accent.main}` : "1px solid rgba(255,255,255,0.14)",
                          background: active ? "rgba(245,179,0,0.08)" : "rgba(255,255,255,0.03)",
                          color: active ? colors.text.primary : colors.text.secondary,
                        }}
                      >
                        {t.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: spacing.lg, alignItems: "stretch" }}>
                {(showAllPartners ? SPONSOR_BENEFITS : SPONSOR_BENEFITS.slice(0, isMobile ? 3 : 4)).map((s) => (
                  <SponsorRewardsCardWithLocks key={s.id} sponsor={s} isMobile={isMobile} previewTier={previewTier} />
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: spacing.lg }}>
                <motion.button
                  type="button"
                  onClick={() => setShowAllPartners((v) => !v)}
                  whileHover={hoverLift}
                  whileTap={tapPress}
                  style={{
                    ...heroCTAPillStyles.base,
                    ...heroCTAPillStyles.gold,
                    padding: "12px 14px",
                  }}
                  aria-label={showAllPartners ? "Show fewer partners" : "Show all partners"}
                >
                  {showAllPartners ? "Show fewer partners" : `Show all partners (${SPONSOR_BENEFITS.length})`}
                </motion.button>
              </div>

              <div style={{ marginTop: spacing["2xl"] }}>
                <div
                  style={{
                    borderRadius: borderRadius["2xl"],
                    border: "1px solid rgba(255,255,255,0.10)",
                    ...glass.panel,
                    overflow: "hidden",
                    padding: isMobile ? spacing.md : spacing.lg,
                    position: "relative",
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
                  <div aria-hidden="true" style={glass.overlayStrong} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>All partners</div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>Click a logo to visit their website</div>
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
                        <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.9 }}>OFFICIAL SPONSORS</span>
                        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: colors.accent.main, boxShadow: "0 0 18px rgba(255,169,0,0.35)" }} />
                        <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.85 }}>PERKS INSIDE</span>
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
                        websiteUrl: s.websiteUrl,
                      }))}
                      isMobile={isMobile}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          </section>

          {/* Pricing & Benefits matrix */}
          <section style={{ padding: sectionPadding }}>
          <div ref={pricingRef} style={{ marginTop: 0, scrollMarginTop: 120 }}>
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
                      ...glass.cardStrong,
                      border: t.highlight ? `1px solid rgba(0,224,255,0.30)` : glass.cardStrong.border,
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
                        opacity: 0.75,
                        pointerEvents: "none",
                      }}
                    />
                    {/* Blue glass wash overlay (reference style) */}
                    <div aria-hidden="true" style={glass.overlayStrong} />
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
                        <div
                          aria-disabled="true"
                          style={{
                            ...heroCTAPillStyles.base,
                            ...(t.highlight ? heroCTAPillStyles.gold : heroCTAPillStyles.blue),
                            width: "100%",
                            justifyContent: "space-between",
                            padding: "12px 14px",
                            opacity: 0.65,
                            cursor: "not-allowed",
                          }}
                        >
                          <span>{t.ctaLabel}</span>
                          <LockIcon size={16} color={colors.text.muted} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          </section>

          {/* Fan Club Onboarding Preview */}
          <section style={{ padding: sectionPadding }}>
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginTop: 0, marginBottom: 0 }}
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
                ...glass.panel,
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
              {/* Blue glass wash for readability */}
              <div aria-hidden="true" style={glass.overlayStrong} />

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
                            ...glass.inset,
                            padding: spacing.md,
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div aria-hidden="true" style={glass.overlaySoft} />
                          <div
                            style={{
                              position: "relative",
                              zIndex: 1,
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
                          <div style={{ minWidth: 0, position: "relative", zIndex: 1 }}>
                            <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>
                              {label}
                            </div>
                            <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap", alignItems: "center" }}>
                      <motion.button
                        type="button"
                        onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth" })}
                        whileHover={hoverLift}
                        whileTap={tapPress}
                        style={{
                          ...heroCTAPillStyles.base,
                          ...heroCTAPillStyles.gold,
                          padding: "12px 14px",
                          width: isMobile ? "100%" : "auto",
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          View Pricing <ArrowRightIcon size={16} style={{ color: colors.accent.main }} />
                        </span>
                      </motion.button>

                      <div
                        style={{
                          ...typography.caption,
                          color: colors.text.muted,
                          padding: "10px 12px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.04)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Memberships launching soon
                      </div>
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
                        ...glass.card,
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
                          opacity: 0.75,
                        }}
                      />
                      <div aria-hidden="true" style={glass.overlayStrong} />
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
                        ...glass.card,
                        padding: spacing.lg,
                        marginBottom: spacing.md,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div aria-hidden="true" style={glass.overlayStrong} />
                      <div style={{ position: "relative", zIndex: 1 }}>
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
                                ...glass.inset,
                                padding: "12px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <div aria-hidden="true" style={glass.overlaySoft} />
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
                    </div>

                    {/* Community preview */}
                    <div
                      style={{
                        borderRadius: borderRadius["2xl"],
                        border: "1px solid rgba(255,255,255,0.10)",
                        ...glass.card,
                        padding: spacing.lg,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div aria-hidden="true" style={glass.overlayStrong} />
                      <div style={{ position: "relative", zIndex: 1 }}>
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
                              ...glass.inset,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div aria-hidden="true" style={glass.overlaySoft} />
                            <div
                              style={{
                                position: "relative",
                                zIndex: 1,
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: "rgba(0,224,255,0.55)",
                                boxShadow: "0 0 18px rgba(0,224,255,0.18)",
                              }}
                            />
                            <div style={{ ...typography.body, color: colors.text.secondary, position: "relative", zIndex: 1 }}>{t}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.6, marginBottom: spacing.sm }}>
                          Preview only — join the Fan Club to activate rewards and identity.
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.sm, flexWrap: "wrap", alignItems: "center" }}>
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.text.secondary,
                              padding: "10px 12px",
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,0.12)",
                              background: "rgba(0,0,0,0.18)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            COMING SOON • Fan Club activation
                          </div>
                          <motion.button
                            type="button"
                            onClick={onScrollToPartners}
                            whileHover={hoverLift}
                            whileTap={tapPress}
                            style={{
                              ...heroCTAPillStyles.base,
                              ...heroCTAPillStyles.gold,
                              padding: "10px 12px",
                            }}
                          >
                            Explore partner perks <ArrowRightIcon size={14} style={{ color: colors.accent.main }} />
                          </motion.button>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </section>

          {/* Final CTA (single, consistent end-cap) */}
          <section style={{ padding: sectionPadding }}>
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginTop: 0, paddingBottom: 0 }}
          >
            <div
              style={{
                borderRadius: borderRadius["2xl"],
                border: "1px solid rgba(255,255,255,0.10)",
                ...glass.panel,
                overflow: "hidden",
                position: "relative",
                padding: isMobile ? spacing.lg : spacing["2xl"],
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 16% 22%, rgba(255,169,0,0.12) 0%, transparent 58%), radial-gradient(circle at 88% 18%, rgba(0,224,255,0.10) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.70) 0%, rgba(10,22,51,0.44) 42%, rgba(5,11,32,0.72) 100%)",
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />
              <div aria-hidden="true" style={glass.overlayStrong} />
              <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 0.7fr", gap: spacing.xl, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                    READY TO BACK THE CLUB?
                  </div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>One membership. All partner perks.</div>
                  <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.75, marginTop: spacing.sm }}>
                    When Fan Club memberships go live, you’ll unlock rewards, identity, and community — with a clear tier progression.
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: spacing.md }}>
                    {["Tier-based unlocks", "Matchday specials", "Partner discounts", "RealVerse badge"].map((t) => (
                      <div
                        key={t}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "rgba(255,255,255,0.04)",
                          color: colors.text.secondary,
                          ...typography.caption,
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm, alignItems: "stretch" }}>
                  <div title="Coming soon — Fan Club unlocks perks">
                    <div
                      aria-disabled="true"
                      style={{
                        ...heroCTAStyles.yellow,
                        width: "100%",
                        minHeight: 56,
                        padding: "12px 18px",
                        opacity: 0.65,
                        cursor: "not-allowed",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                        <span style={heroCTAStyles.yellow.textStyle}>Join the Fan Club</span>
                        <span style={heroCTAStyles.yellow.subtitleStyle}>Memberships (coming soon)</span>
                      </div>
                      <LockIcon size={18} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={onExploreBenefits}
                    whileHover={hoverLift}
                    whileTap={tapPress}
                    style={{
                      ...heroCTAStyles.darkWithBorder,
                      width: "100%",
                      minHeight: 56,
                      padding: "12px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing.md,
                      cursor: "pointer",
                    }}
                    aria-label="Compare pricing and benefits"
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                      <span style={heroCTAStyles.darkWithBorder.textStyle}>Compare Tiers</span>
                      <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>Pricing + benefits</span>
                    </div>
                    <ArrowRightIcon size={20} color={colors.accent.main} style={{ flexShrink: 0 }} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FanClubBenefitsPreviewPage;

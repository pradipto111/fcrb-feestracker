/**
 * Fan Club Benefits Page - Nike-style, conversion-focused narrative experience
 * Fully redesigned with unique backgrounds per section and exact microcopy
 */

import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { FAN_CLUB_TIERS, SPONSOR_BENEFITS, type IncentiveTag, type SponsorBenefit } from "../data/fanclubBenefits";
import { SponsorLogoWall } from "../components/home/SponsorLogoWall";
import { ArrowRightIcon, LockIcon, CalendarIcon, DumbbellIcon, TrophyIcon, LinkIcon, FacebookIcon, InstagramIcon, TwitterIcon, YouTubeIcon, PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/IconSet";
import { galleryAssets, heroAssets, clubAssets } from "../config/assets";
import { clubInfo } from "../data/club";

// Helper components for sponsor rewards section
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
        borderRadius: borderRadius.card,
        border: "1px solid rgba(255,255,255,0.10)",
        ...glass.card,
        boxShadow: shadows.card,
        overflow: "hidden",
        position: "relative",
        minHeight: 88,
        padding: spacing.cardPadding,
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

const tierRank: Record<"rookie" | "regular" | "inner", number> = { rookie: 0, regular: 1, inner: 2 };
const rewardTierLabel: Record<number, string> = { 0: "Rookie Fan", 1: "Matchday Regular", 2: "Inner Circle" };

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
  const currentRank = tierRank[previewTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!reduce ? { y: -4 } : undefined}
      style={{
        borderRadius: borderRadius.card,
        border: `1px solid ${sponsor.accent}40`,
        ...glass.card,
        boxShadow: shadows.card,
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
        {/* Header with Logo and Name */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
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
                  borderRadius: borderRadius.card,
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

        {/* Sponsor Website CTA */}
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

        {/* Sponsor Rewards Carousel */}
        <div
          style={{
            display: "flex",
            gap: spacing.md,
            overflowX: "auto",
            paddingBottom: spacing.sm,
            paddingLeft: spacing.sm,
            paddingRight: spacing.sm,
            paddingTop: spacing.xs,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            position: "relative",
          }}
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
                      borderRadius: borderRadius.card,
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

        {/* Dynamic Offers Section */}
        <div
          style={{
            padding: spacing.lg,
            borderRadius: borderRadius.card,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
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
      </div>
    </motion.div>
  );
};

const FanClubBenefitsPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [previewTier, setPreviewTier] = useState<"rookie" | "regular" | "inner">("regular");
  const reduceMotion = useReducedMotion();
  const hoverLift = reduceMotion ? undefined : { y: -2 };
  const tapPress = reduceMotion ? undefined : { scale: 0.98 };

  const handleJoinClick = () => {
    navigate("/fan-club/join");
  };

  useEffect(() => {
    document.title = "Fan Club Benefits • FC Real Bengaluru";
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sectionPaddingVertical = isMobile ? spacing["3xl"] : spacing["4xl"];
  const sectionPaddingHorizontal = isMobile ? spacing.lg : spacing.xl;
  const maxWidth = "1400px";

  // Scroll to pricing function
  const scrollToPricing = () => {
    const element = document.getElementById("pricing-tiers");
    if (element) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(element, { offset: -100, duration: 1.0 });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Scroll to partners function
  const scrollToPartners = () => {
    const element = document.getElementById("partner-perks");
    if (element) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(element, { offset: -100, duration: 1.0 });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        overflowY: "visible",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      {/* Fixed header that stays visible */}
      <div
        style={{
          position: "fixed",
          top: spacing.sm,
          left: 0,
          right: 0,
          zIndex: 1200,
          padding: `0 ${spacing.md}`,
          pointerEvents: "auto",
          background: "transparent",
        }}
      >
        <PublicHeader />
      </div>

      <main
        style={{
          position: "relative",
          zIndex: 3,
          padding: 0,
          maxWidth: maxWidth,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ============================================
            SECTION 1 — HERO
            PURPOSE: Identity & Emotional Buy-in
            Background: High-energy matchday celebration
        ============================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: isMobile ? "120px" : "140px",
            paddingBottom: spacing["4xl"],
            paddingLeft: 0,
            paddingRight: 0,
            overflow: "hidden",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          {/* Background Image - Matchday celebration */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(/assets/DSC09918.JPG)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 1,
            }}
          />
          
          {/* Background overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 18% 25%, rgba(0,224,255,0.20) 0%, transparent 55%), radial-gradient(circle at 78% 70%, rgba(255,169,0,0.14) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.82) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.86) 100%)",
              opacity: 0.98,
            }}
          />

          {/* Content */}
          <div
            style={{
              maxWidth: maxWidth,
              width: "100%",
              margin: "0 auto",
              padding: isMobile ? `0 ${sectionPaddingHorizontal}` : `0 ${sectionPaddingHorizontal}`,
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: spacing.lg,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ maxWidth: 900 }}
            >
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{
                  ...typography.overline,
                  color: colors.accent.main,
                  letterSpacing: "0.18em",
                  marginBottom: spacing.md,
                }}
              >
                Fan Club Benefits
              </motion.div>

              {/* H1 */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
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
                Your Benefits for Backing FC Real Bengaluru
              </motion.h1>

              {/* Supporting line */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 0.92, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  ...typography.body,
                  fontSize: `clamp(${typography.fontSize.lg}, 2vw, ${typography.fontSize.xl})`,
                  color: colors.text.secondary,
                  marginBottom: spacing.xl,
                  lineHeight: 1.75,
                  maxWidth: "780px",
                  textShadow: "0 2px 24px rgba(0, 0, 0, 0.65)",
                }}
              >
                A football-first membership built on loyalty, community, and real rewards — with a clear progression from fan to inner circle.
              </motion.p>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <motion.button
                  type="button"
                  onClick={handleJoinClick}
                  whileHover={!reduceMotion ? { y: -2, boxShadow: shadows.buttonHover } : undefined}
                  whileTap={!reduceMotion ? { scale: 0.98 } : undefined}
                  style={{
                    ...heroCTAStyles.yellow,
                    maxWidth: "400px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  <span style={heroCTAStyles.yellow.textStyle}>Join the Fan Club</span>
                  <ArrowRightIcon size={18} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              style={{
                position: "absolute",
                bottom: spacing.md,
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
              transition={{ delay: 1.6, duration: 0.8 }}
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
              <motion.div
                animate={!reduceMotion ? { y: [0, 6, 0] } : undefined}
                transition={!reduceMotion ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
              >
                <motion.svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: colors.accent.main }}>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* ============================================
            SECTION 2 — HOW IT WORKS
            PURPOSE: Reduce friction, make it feel simple
            Background: Pre-match tunnel / training ritual
        ============================================ */}
        <section
          style={{
            paddingTop: sectionPaddingVertical,
            paddingBottom: sectionPaddingVertical,
            paddingLeft: 0,
            paddingRight: 0,
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: 120,
            backgroundImage: `url(/assets/DSC00893.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "scroll",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          {/* Blurred background overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(/assets/DSC00893.jpg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px)",
              opacity: 0.18,
              transform: "scale(1.06)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 18% 25%, rgba(0,224,255,0.20) 0%, transparent 55%), radial-gradient(circle at 78% 70%, rgba(255,169,0,0.14) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.82) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.86) 100%)",
              opacity: 0.98,
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: maxWidth, margin: "0 auto", paddingLeft: sectionPaddingHorizontal, paddingRight: sectionPaddingHorizontal }}>
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Section label */}
              <div style={{ textAlign: "center", marginBottom: spacing.md }}>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                  Fan Club Pathway
                </div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.xl }}>
                  A simple flow: join → unlock → enjoy
                </h2>
              </div>

              {/* Steps */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                  gap: spacing.lg,
                  marginBottom: spacing.xl,
                }}
              >
                {[
                  {
                    step: 1,
                    title: "Join & Get Recognised",
                    description: "Pick a tier and become an official part of the club.",
                    accent: "rgba(255,169,0,0.85)",
                  },
                  {
                    step: 2,
                    title: "Show Up & Level Up",
                    description: "Matchdays, wins, and community activity move you forward.",
                    accent: "rgba(0,224,255,0.80)",
                  },
                  {
                    step: 3,
                    title: "Unlock Real Rewards",
                    description: "Partner perks and recognition grow as your tier increases.",
                    accent: "rgba(34,197,94,0.80)",
                  },
                ].map((s) => (
                  <div
                    key={s.step}
                    style={{
                      borderRadius: borderRadius["2xl"],
                      border: "1px solid rgba(255,255,255,0.12)",
                      ...glass.card,
                      overflow: "hidden",
                      position: "relative",
                      minHeight: 200,
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
                        <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em" }}>STEP {s.step}</div>
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
                            ...typography.body,
                          }}
                        >
                          {s.step}
                        </div>
                      </div>
                      <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.1, marginBottom: spacing.sm }}>
                        {s.title}
                      </div>
                      <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.6 }}>
                        {s.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supporting microcopy */}
              <div style={{ textAlign: "center" }}>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.7 }}>
                  The more you show up, the more you unlock.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 3 — PRICING & TIERS
            PURPOSE: Comparison without overwhelm
            Background: Crowd-first / fan-stand imagery
        ============================================ */}
        <section
          id="pricing-tiers"
          style={{
            paddingTop: sectionPaddingVertical,
            paddingBottom: sectionPaddingVertical,
            paddingLeft: 0,
            paddingRight: 0,
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: 120,
            backgroundImage: `url(/assets/DSC09723.JPG)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "scroll",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          {/* Blurred background overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(/assets/DSC09723.JPG)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px)",
              opacity: 0.18,
              transform: "scale(1.06)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 18% 25%, rgba(0,224,255,0.20) 0%, transparent 55%), radial-gradient(circle at 78% 70%, rgba(255,169,0,0.14) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.82) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.86) 100%)",
              opacity: 0.98,
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: maxWidth, margin: "0 auto", paddingLeft: sectionPaddingHorizontal, paddingRight: sectionPaddingHorizontal }}>
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Section header */}
              <div style={{ textAlign: "center", marginBottom: spacing.xl }}>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                  Fan Club Tiers
                </div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>
                  Choose how close you want to be
                </h2>
              </div>

              {/* Tier Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                  gap: spacing.lg,
                  marginBottom: spacing.xl,
                }}
              >
                {FAN_CLUB_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    style={{
                      borderRadius: borderRadius["2xl"],
                      ...glass.card,
                      border: tier.highlight ? `1px solid rgba(0,224,255,0.30)` : glass.card.border,
                      boxShadow: tier.highlight ? "0 24px 70px rgba(0,0,0,0.45), 0 0 36px rgba(0,224,255,0.10)" : shadows.card,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: tier.highlight
                          ? "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.14) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.10) 0%, transparent 55%)"
                          : "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.06) 0%, transparent 55%)",
                        opacity: 0.75,
                        pointerEvents: "none",
                      }}
                    />
                    <div aria-hidden="true" style={glass.overlaySoft} />
                    <div style={{ position: "relative", zIndex: 1, padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.md }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{tier.name}</div>
                        {tier.highlight ? (
                          <div style={{ ...typography.caption, color: colors.primary.main, letterSpacing: "0.14em", fontWeight: 800 }}>
                            RECOMMENDED
                          </div>
                        ) : null}
                      </div>
                      <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>{tier.priceLabel}</div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {tier.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            style={{
                              ...typography.body,
                              color: colors.text.secondary,
                              fontSize: typography.fontSize.sm,
                              lineHeight: 1.5,
                            }}
                          >
                            • {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 4 — PARTNER PERKS
            PURPOSE: Tangible real-world value
            Background: Lifestyle / city / off-pitch visuals
        ============================================ */}
        <section
          id="partner-perks"
          style={{
            paddingTop: sectionPaddingVertical,
            paddingBottom: sectionPaddingVertical,
            paddingLeft: 0,
            paddingRight: 0,
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: 120,
            backgroundImage: `url(/assets/DSC09828.JPG)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "scroll",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          {/* Blurred background overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(/assets/DSC09828.JPG)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px)",
              opacity: 0.18,
              transform: "scale(1.06)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 18% 25%, rgba(0,224,255,0.20) 0%, transparent 55%), radial-gradient(circle at 78% 70%, rgba(255,169,0,0.14) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.82) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.86) 100%)",
              opacity: 0.98,
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: maxWidth, margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Section header */}
              <div style={{ marginBottom: spacing.xl }}>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                  Partner Perks
                </div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.sm }}>
                  Rewards that matter beyond the stadium
                </h2>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.7, maxWidth: "700px" }}>
                  Each tier unlocks access to trusted partners — from performance and recovery to lifestyle and dining.
                </p>
              </div>

              {/* Sponsor Logo Wall */}
              <div style={{ marginBottom: spacing.xl }}>
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

              {/* Section CTA */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <motion.button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById("sponsor-offers");
                    if (element) {
                      const lenis = (window as any).lenis;
                      if (lenis) {
                        lenis.scrollTo(element, { offset: -100, duration: 1.0 });
                      } else {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }
                  }}
                  whileHover={hoverLift}
                  whileTap={tapPress}
                  style={{
                    ...heroCTAPillStyles.base,
                    ...heroCTAPillStyles.gold,
                    padding: "12px 18px",
                  }}
                >
                  <span>Explore Partner Perks</span>
                  <ArrowRightIcon size={16} color={colors.accent.main} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            SECTION 4B — SPONSOR OFFERS & PERKS (DETAILED)
            PURPOSE: Show tier-based sponsor rewards with locks/unlocks
            Background: Same as Partner Perks section
        ============================================ */}
        <section
          id="sponsor-offers"
          style={{
            paddingTop: sectionPaddingVertical,
            paddingBottom: sectionPaddingVertical,
            paddingLeft: 0,
            paddingRight: 0,
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: 120,
            backgroundImage: `url(/assets/DSC09957.JPG)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "scroll",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          {/* Blurred background overlay */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(/assets/DSC09957.JPG)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px)",
              opacity: 0.18,
              transform: "scale(1.06)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: maxWidth, margin: "0 auto", paddingLeft: sectionPaddingHorizontal, paddingRight: sectionPaddingHorizontal }}>
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Section header */}
              <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap", marginBottom: spacing.lg }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                      Sponsor Offers & Perks
                    </div>
                    <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.sm }}>
                      Pick a tier to preview what unlocks
                    </h2>
                    <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.7, maxWidth: "700px", marginTop: spacing.sm }}>
                      Each sponsor opens up rewards as you level up. Select a tier below to see what's available.
                    </p>
                  </div>

                  {/* Tier Selector */}
                  <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      { id: "rookie" as const, label: "Rookie Fan" },
                      { id: "regular" as const, label: "Matchday Regular" },
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
              </div>

              {/* Sponsor Cards with Rewards */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: spacing.lg, alignItems: "stretch" }}>
                {SPONSOR_BENEFITS.map((s) => (
                  <SponsorRewardsCardWithLocks key={s.id} sponsor={s} isMobile={isMobile} previewTier={previewTier} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================
            FINAL SECTION — DECISION STRIP
            PURPOSE: Catch late deciders
            Background: Minimal gradient / abstract club texture
        ============================================ */}
        <section
          style={{
            paddingTop: sectionPaddingVertical,
            paddingBottom: sectionPaddingVertical,
            paddingLeft: 0,
            paddingRight: 0,
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: 120,
            background: "linear-gradient(135deg, rgba(5,11,32,0.95) 0%, rgba(10,22,51,0.85) 50%, rgba(5,11,32,0.95) 100%)",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, maxWidth: maxWidth, margin: "0 auto", paddingLeft: sectionPaddingHorizontal, paddingRight: sectionPaddingHorizontal }}>
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                style={{
                  textAlign: "center",
                  maxWidth: "800px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.lg,
                  alignItems: "center",
                }}
              >
                <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>
                  One membership. One club. All the benefits.
                </h2>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.75 }}>
                  Join the FC Real Bengaluru Fan Club and be part of the story — not just a spectator.
                </p>

                {/* Final CTA */}
                <motion.button
                  type="button"
                  onClick={handleJoinClick}
                  whileHover={!reduceMotion ? { y: -2, boxShadow: shadows.buttonHover } : undefined}
                  whileTap={!reduceMotion ? { scale: 0.98 } : undefined}
                  style={{
                    ...heroCTAStyles.yellow,
                    maxWidth: "400px",
                    cursor: "pointer",
                    border: "none",
                    marginTop: spacing.md,
                  }}
                >
                  <span style={heroCTAStyles.yellow.textStyle}>Join the Fan Club</span>
                  <ArrowRightIcon size={18} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <section
        id="footer"
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(4,8,18,0.95) 0%, rgba(4,8,18,0.98) 100%)",
        }}
      >
        <motion.footer
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", marginTop: "auto", marginBottom: 0, paddingBottom: 0 }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  maxWidth: "1400px",
                  margin: "0 auto",
                  paddingTop: isMobile ? 40 : 48,
                  paddingBottom: 0,
                  paddingLeft: isMobile ? 16 : 32,
                  paddingRight: isMobile ? 16 : 32,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                    opacity: 0.6,
                    marginBottom: isMobile ? 20 : 24,
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr 1.2fr",
                    gap: isMobile ? 20 : 24,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Logo + Social */}
                  <div>
                    <img
                      src={clubAssets.logo.crestCropped}
                      alt="FC Real Bengaluru"
                      style={{ width: isMobile ? 90 : 100, height: "auto", marginBottom: isMobile ? spacing.sm : spacing.md }}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: spacing.sm, flexWrap: "wrap" }}>
                      {[
                        { name: "Facebook", url: clubInfo.social.facebook, Icon: FacebookIcon },
                        { name: "Instagram", url: clubInfo.social.instagram, Icon: InstagramIcon },
                        { name: "Twitter", url: clubInfo.social.twitter || "#", Icon: TwitterIcon },
                        { name: "YouTube", url: clubInfo.social.youtube, Icon: YouTubeIcon },
                      ].map((social) => {
                        const Icon = social.Icon;
                        return (
                          <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "rgba(255,255,255,0.08)",
                              color: colors.text.primary,
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `${colors.primary.soft}`;
                              e.currentTarget.style.color = colors.primary.main;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                              e.currentTarget.style.color = colors.text.primary;
                            }}
                            title={social.name}
                          >
                            <Icon size={18} />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* About Clubs */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      About Clubs
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                      {[
                        { label: "Homepage", to: "/" },
                        { label: "About Us", to: "/about" },
                        { label: "Latest News", to: "/#content-stream" },
                      ].map((link) => (
                        <Link
                          key={link.label}
                          to={link.to}
                          style={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Teams Info */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      Teams Info
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                      {[
                        { label: "Player & Coach", to: "/student" },
                        { label: "Player Profile", to: "/players" },
                        { label: "Fixtures", to: "/#matches" },
                        { label: "Tournament", to: "/tournaments" },
                      ].map((link) => (
                        <Link
                          key={link.label}
                          to={link.to}
                          style={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Contact Us */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      Contact Us
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 10 }}>
                      <a
                        href={`tel:${clubInfo.contact.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <PhoneIcon size={16} />
                        <span>{clubInfo.contact.phone}</span>
                      </a>
                      <a
                        href={`mailto:${clubInfo.contact.email}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <EmailIcon size={16} />
                        <span>{clubInfo.contact.email}</span>
                      </a>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          color: colors.text.secondary,
                          fontSize: 13,
                          lineHeight: 1.6,
                          opacity: 0.9,
                        }}
                      >
                        <LocationIcon size={16} style={{ marginTop: 2 }} />
                        <span>{clubInfo.contact.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: isMobile ? 20 : 24,
                    paddingTop: isMobile ? 16 : 18,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    justifyContent: "center",
                    color: colors.text.muted,
                    fontSize: 12,
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  © {new Date().getFullYear()} FC Real Bengaluru. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </section>
    </div>
  );
};

export default FanClubBenefitsPreviewPage;

/**
 * Fan Club Join Page - Package Selection & Comparison
 * Allows users to choose from 3 packages and compare benefits
 * UI matches /fan-club/benefits for uniformity
 */

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { CheckIcon, ArrowRightIcon, LockIcon, CalendarIcon, DumbbellIcon, TrophyIcon, LinkIcon } from "../components/icons/IconSet";
import { useCart } from "../context/CartContext";
import { api } from "../api/client";
import { FAN_CLUB_TIERS, SPONSOR_BENEFITS, type IncentiveTag, type SponsorBenefit } from "../data/fanclubBenefits";

type FanClubTierId = "rookie" | "regular" | "inner";

interface PackageTier {
  id: FanClubTierId;
  name: string;
  priceLabel: string;
  priceValue: number; // in rupees (not paise)
  highlight?: boolean;
  benefits: string[];
}

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

const MOBILE_BREAKPOINT = 768;
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

const FanClubJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
  const [packages, setPackages] = useState<PackageTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<FanClubTierId | null>(null);
  const [previewTier, setPreviewTier] = useState<"rookie" | "regular" | "inner">("regular");
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Join the Fan Club • FC Real Bengaluru";
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      // Try to fetch from API first (admin-configured)
      const apiTiers = await api.getFanTiers().catch(() => null);
      
      if (apiTiers && Array.isArray(apiTiers) && apiTiers.length > 0) {
        // Use API tiers if available
        const mapped = apiTiers
          .filter((t: any) => t.isActive)
          .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .slice(0, 3)
          .map((t: any, idx: number) => {
            const benefits = Array.isArray(t.benefitsJson) 
              ? t.benefitsJson.map((b: any) => typeof b === 'string' ? b : (b.title || b.note || ''))
              : [];
            
            return {
              id: (t.id === 1 ? "rookie" : t.id === 2 ? "regular" : "inner") as FanClubTierId,
              name: t.name || "Fan Club Tier",
              priceLabel: `₹${t.yearlyPriceINR || 0} / Year`,
              priceValue: t.yearlyPriceINR || 0,
              highlight: idx === 1, // Middle tier is recommended
              benefits: benefits.length > 0 ? benefits : ["Access to sponsor rewards", "Fan Club digital badge"],
            };
          });
        
        if (mapped.length >= 3) {
          setPackages(mapped);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to static data
      const staticPackages: PackageTier[] = FAN_CLUB_TIERS.map((tier) => ({
        id: tier.id,
        name: tier.name,
        priceLabel: tier.priceLabel,
        priceValue: tier.priceValue,
        highlight: tier.highlight,
        benefits: tier.benefits,
      }));
      
      setPackages(staticPackages);
    } catch (error) {
      console.error("Failed to load packages:", error);
      // Fallback to static data
      const staticPackages: PackageTier[] = FAN_CLUB_TIERS.map((tier) => ({
        id: tier.id,
        name: tier.name,
        priceLabel: tier.priceLabel,
        priceValue: tier.priceValue,
        highlight: tier.highlight,
        benefits: tier.benefits,
      }));
      setPackages(staticPackages);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (pkg: PackageTier) => {
    setSelectedPackage(pkg.id);
    // Display-only: Fan Club is Coming Soon — do not add to cart or navigate
    setComingSoonMessage("Coming soon — membership is not yet available.");
    setTimeout(() => setComingSoonMessage(null), 4000);
  };

  const sectionPaddingVertical = isMobile ? spacing["3xl"] : spacing["4xl"];
  const sectionPaddingHorizontal = isMobile ? spacing.lg : spacing.xl;
  const maxWidth = "1400px";

  // Get all unique benefits for comparison
  const allBenefits = useMemo(() => {
    const benefitSet = new Set<string>();
    packages.forEach((pkg) => {
      pkg.benefits.forEach((benefit) => benefitSet.add(benefit));
    });
    return Array.from(benefitSet);
  }, [packages]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: colors.club.deep,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ ...typography.body, color: colors.text.secondary }}>Loading packages...</div>
      </div>
    );
  }

  return (
    <div
      data-realverse-page
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        overflowY: "visible",
        width: "100%",
        maxWidth: "100vw",
        background: colors.club.deep,
      }}
    >
      {/* Fixed header */}
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
          boxSizing: "border-box",
        }}
      >
        {/* Coming Soon banner */}
        <div
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: `${spacing.sm} ${spacing.xl}`,
            background: colors.warning.soft,
            borderBottom: `1px solid ${colors.warning.main}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          <span style={{ ...typography.caption, color: colors.warning.main, fontWeight: typography.fontWeight.bold, letterSpacing: "0.12em" }}>FAN CLUB</span>
          <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Coming Soon.</span>
          <span style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.sm }}>Information below is for display only.</span>
        </div>
        {comingSoonMessage && (
          <div
            style={{
              position: "fixed",
              bottom: spacing.xl,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1300,
              padding: `${spacing.md} ${spacing.xl}`,
              borderRadius: borderRadius.lg,
              border: `1px solid ${colors.warning.main}60`,
              background: colors.warning.soft,
              color: colors.text.primary,
              ...typography.body,
              fontWeight: typography.fontWeight.medium,
              boxShadow: shadows.card,
            }}
          >
            {comingSoonMessage}
          </div>
        )}
        {/* Hero Section */}
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
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            backgroundImage: `url(/assets/DSC09918.JPG)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
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
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ maxWidth: 900, textAlign: "center", margin: "0 auto" }}
            >
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
                Join the Fan Club
              </motion.div>

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
                Choose Your Membership Tier
              </motion.h1>

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
                  margin: "0 auto",
                  textShadow: "0 2px 24px rgba(0, 0, 0, 0.65)",
                }}
              >
                Select a package that fits your level of engagement. Compare benefits and choose the tier that's right for you.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        {/* Package Selection & Comparison Section */}
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
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Background overlay */}
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
              {/* Section header */}
              <div style={{ textAlign: "center", marginBottom: spacing.xl }}>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                  Fan Club Packages
                </div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>
                  Compare and Choose Your Tier
                </h2>
              </div>

              {/* Package Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                  gap: spacing.lg,
                  marginBottom: spacing.xl,
                }}
              >
                {packages.map((pkg) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    whileHover={!reduceMotion ? { y: -4 } : undefined}
                    style={{
                      borderRadius: borderRadius["2xl"],
                      ...glass.card,
                      border: pkg.highlight ? `1px solid rgba(0,224,255,0.30)` : glass.card.border,
                      boxShadow: pkg.highlight ? "0 24px 70px rgba(0,0,0,0.45), 0 0 36px rgba(0,224,255,0.10)" : shadows.card,
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => handleSelectPackage(pkg)}
                    onMouseEnter={(e) => {
                      if (!reduceMotion) {
                        e.currentTarget.style.borderColor = pkg.highlight ? "rgba(0,224,255,0.50)" : "rgba(255,255,255,0.20)";
                        e.currentTarget.style.transform = "translateY(-4px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = pkg.highlight ? "rgba(0,224,255,0.30)" : glass.card.border;
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: pkg.highlight
                          ? "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.14) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.10) 0%, transparent 55%)"
                          : "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.06) 0%, transparent 55%)",
                        opacity: 0.75,
                        pointerEvents: "none",
                      }}
                    />
                    <div aria-hidden="true" style={glass.overlaySoft} />
                    <div style={{ position: "relative", zIndex: 1, padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.md, height: "100%" }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{pkg.name}</div>
                        {pkg.highlight ? (
                          <div style={{ ...typography.caption, color: colors.primary.main, letterSpacing: "0.14em", fontWeight: 800 }}>
                            RECOMMENDED
                          </div>
                        ) : null}
                      </div>
                      <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>{pkg.priceLabel}</div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: spacing.sm, flex: 1 }}>
                        {pkg.benefits.map((benefit) => (
                          <div
                            key={benefit}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: spacing.xs,
                              ...typography.body,
                              color: colors.text.secondary,
                              fontSize: typography.fontSize.sm,
                              lineHeight: 1.5,
                            }}
                          >
                            <CheckIcon size={16} color={colors.accent.main} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <motion.button
                        type="button"
                        onClick={() => handleSelectPackage(pkg)}
                        whileHover={!reduceMotion ? { scale: 1.02 } : undefined}
                        whileTap={!reduceMotion ? { scale: 0.98 } : undefined}
                        style={{
                          marginTop: spacing.md,
                          padding: `${spacing.md} ${spacing.lg}`,
                          borderRadius: borderRadius.button,
                          minHeight: 44,
                          background: pkg.highlight
                            ? `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`
                            : "rgba(255,255,255,0.08)",
                          border: pkg.highlight ? "none" : "1px solid rgba(255,255,255,0.15)",
                          color: pkg.highlight ? colors.brand.charcoal : colors.text.primary,
                          ...typography.body,
                          fontWeight: typography.fontWeight.semibold,
                          cursor: "pointer",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: spacing.xs,
                          boxShadow: pkg.highlight ? shadows.button : "none",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: spacing.xs, lineHeight: 1 }}>
                          <span>Select Package</span>
                          <span style={{ display: "flex", alignItems: "center" }}>
                            <ArrowRightIcon size={14} color={pkg.highlight ? colors.brand.charcoal : colors.text.primary} />
                          </span>
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Comparison Table */}
              {allBenefits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{
                    borderRadius: borderRadius["2xl"],
                    ...glass.panel,
                    padding: spacing.xl,
                    marginTop: spacing.xl,
                  }}
                >
                  <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg, textAlign: "center" }}>
                    Compare Benefits
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        ...typography.body,
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              ...typography.overline,
                              color: colors.text.muted,
                              textAlign: "left",
                              padding: spacing.md,
                              borderBottom: "1px solid rgba(255,255,255,0.10)",
                            }}
                          >
                            Benefit
                          </th>
                          {packages.map((pkg) => (
                            <th
                              key={pkg.id}
                              style={{
                                ...typography.overline,
                                color: pkg.highlight ? colors.accent.main : colors.text.muted,
                                textAlign: "center",
                                padding: spacing.md,
                                borderBottom: "1px solid rgba(255,255,255,0.10)",
                              }}
                            >
                              {pkg.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allBenefits.map((benefit) => (
                          <tr key={benefit}>
                            <td
                              style={{
                                color: colors.text.secondary,
                                padding: spacing.md,
                                borderBottom: "1px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              {benefit}
                            </td>
                            {packages.map((pkg) => (
                              <td
                                key={pkg.id}
                                style={{
                                  textAlign: "center",
                                  padding: spacing.md,
                                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                                }}
                              >
                                {pkg.benefits.includes(benefit) ? (
                                  <CheckIcon size={20} color={colors.accent.main} />
                                ) : (
                                  <span style={{ color: colors.text.muted, opacity: 0.3 }}>—</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </motion.div>
          </div>
        </section>

        {/* Sponsor Offers & Perks Section */}
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
                          whileHover={!reduceMotion ? { y: -2 } : undefined}
                          whileTap={!reduceMotion ? { scale: 0.98 } : undefined}
                          style={{
                            ...heroCTAPillStyles.base,
                            padding: "10px 14px",
                            minHeight: 44,
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
      </main>
    </div>
  );
};

export default FanClubJoinPage;


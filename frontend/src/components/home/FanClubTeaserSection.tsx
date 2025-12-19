/**
 * Fan Club Teaser Section - Homepage
 * Concise single-screen teaser with tier cards and sponsor strip
 * Links to /fan-club/benefits for full details
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { heroCTAStyles, heroOverlayGradient, heroTypography } from "../../theme/hero-design-patterns";
import { Button } from "../ui/Button";
import { FAN_CLUB_TIERS, SPONSOR_BENEFITS } from "../../data/fanclubBenefits";
import { ArrowRightIcon, CheckIcon, StarIcon } from "../icons/IconSet";
import { SponsorLogoWall } from "./SponsorLogoWall";

export const FanClubTeaserSection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: isMobile ? `${spacing.xl} ${spacing.lg}` : `${spacing["3xl"]} ${spacing.xl}`,
        minHeight: isMobile ? "auto" : "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: spacing["2xl"],
      }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
        <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
          FAN CLUB ECOSYSTEM
        </div>
        <h2
          style={{
            ...heroTypography.heading,
            fontSize: `clamp(2.2rem, 4.4vw, 3.2rem)`,
            margin: 0,
            marginBottom: spacing.md,
          }}
        >
          Your Benefits for Backing FC Real Bengaluru
        </h2>
        <p
          style={{
            ...heroTypography.subheading,
            fontSize: typography.fontSize.lg,
            maxWidth: "70ch",
            margin: "0 auto",
          }}
        >
          Backing the club comes with real rewards — on and off the pitch. Explore sponsor perks, tier benefits, and exclusive member rewards.
        </p>
      </motion.div>

      {/* Tier Cards Row */}
      <motion.div
        variants={itemVariants}
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          gap: spacing.lg,
          marginBottom: spacing.lg,
        }}
      >
        {FAN_CLUB_TIERS.map((tier, idx) => {
          const recommended = tier.highlight;
          const accent = recommended ? colors.primary.main : tier.id === "inner" ? colors.accent.main : "rgba(255,255,255,0.14)";

          return (
            <motion.div
              key={tier.id}
              variants={itemVariants}
              whileHover={!reduce ? { y: -4, scale: 1.02 } : undefined}
              style={{
                borderRadius: borderRadius["2xl"],
                border: recommended ? `1px solid ${accent}40` : "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                backdropFilter: "blur(12px)",
                boxShadow: recommended
                  ? `0 12px 40px rgba(0,0,0,0.25), 0 0 24px ${accent}15`
                  : `0 8px 24px rgba(0,0,0,0.20)`,
                overflow: "hidden",
                position: "relative",
                padding: spacing.cardPadding, // 32px padding
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
              }}
            >
              {/* Background gradient - reduced opacity for better background visibility */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: recommended
                    ? "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.08) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.06) 0%, transparent 55%)"
                    : tier.id === "inner"
                      ? "radial-gradient(circle at 16% 18%, rgba(255,169,0,0.10) 0%, transparent 58%), radial-gradient(circle at 88% 22%, rgba(0,224,255,0.08) 0%, transparent 62%)"
                      : "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.03) 0%, transparent 55%)",
                  opacity: 0.7,
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                {/* Badge */}
                {recommended && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(0,224,255,0.28)",
                      background: "rgba(0,224,255,0.10)",
                      color: colors.text.primary,
                      ...typography.caption,
                      fontSize: typography.fontSize.xs,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Recommended
                  </div>
                )}

                {/* Tier Name & Price */}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.sm }}>
                  <div>
                    <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{tier.name}</div>
                    <div style={{ ...typography.overline, marginTop: 4, color: colors.text.muted, letterSpacing: "0.14em" }}>
                      {tier.id.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ ...typography.h3, color: colors.text.primary }}>{tier.priceLabel}</div>
                </div>

                {/* Benefits (3-4 bullets max) */}
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs, marginTop: spacing.md }}>
                  {tier.benefits.slice(0, 4).map((benefit) => (
                    <div key={benefit} style={{ display: "flex", gap: spacing.xs, alignItems: "flex-start" }}>
                      <CheckIcon size={16} color={colors.success.main} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.5 }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sponsor Strip */}
      <motion.div variants={itemVariants} style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            borderRadius: borderRadius.card,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.20)",
            padding: spacing.lg,
            textAlign: "center",
          }}
        >
          <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em", marginBottom: spacing.md, opacity: 0.85 }}>
            Powered by our partners
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
      </motion.div>

      {/* Primary CTA - Matching Hero Style */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto", width: "100%" }}>
        <Link to="/fan-club/benefits" style={{ textDecoration: "none", display: "block", width: "100%" }}>
          <motion.div
            whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...heroCTAStyles.darkWithBorder,
              display: "flex",
              alignItems: "center",
              gap: spacing.md,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: colors.accent.main,
                border: `2px solid ${colors.accent.main}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: shadows.sm,
                flexShrink: 0,
              }}
            >
              <StarIcon size={20} style={{ color: colors.text.onAccent }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={heroCTAStyles.darkWithBorder.textStyle}>
                Explore all Fan Club benefits
              </div>
              <div style={heroCTAStyles.darkWithBorder.subtitleStyle}>
                Exclusive gifts, <span style={{ color: colors.accent.main, fontWeight: typography.fontWeight.semibold }}>VIP access</span>, member-only drops
              </div>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <ArrowRightIcon size={20} color={colors.accent.main} />
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>
    </motion.section>
  );
};


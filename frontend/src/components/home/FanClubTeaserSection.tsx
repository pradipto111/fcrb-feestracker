/**
 * Fan Club Teaser Section - Homepage
 * Beautifully redesigned section with enhanced tier cards and sponsor integration
 * Fan Club teaser section (benefits page removed)
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { heroCTAStyles, heroTypography } from "../../theme/hero-design-patterns";
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
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: isMobile ? `${spacing["2xl"]} ${spacing.lg}` : `${spacing["4xl"]} ${spacing.xl}`,
        minHeight: isMobile ? "auto" : "85vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: spacing["3xl"],
      }}
    >
      {/* Header Section - Enhanced */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", marginBottom: spacing.md }}>
        <h2
          style={{
            ...heroTypography.heading,
            fontSize: `clamp(2.5rem, 5vw, 3.75rem)`,
            margin: 0,
            marginBottom: spacing.lg,
            background: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.text.secondary} 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
          }}
        >
          Your Benefits for Backing FC Real Bengaluru
        </h2>
        <p
          style={{
            ...heroTypography.subheading,
            fontSize: typography.fontSize.lg,
            maxWidth: "72ch",
            margin: "0 auto",
            lineHeight: 1.75,
            color: colors.text.secondary,
          }}
        >
          Backing the club comes with real rewards — on and off the pitch. Explore sponsor perks, tier benefits, and exclusive member rewards.
        </p>
      </motion.div>

      {/* Tier Cards Row - Redesigned */}
      <motion.div
        variants={itemVariants}
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
          gap: isMobile ? spacing.lg : spacing.xl,
          marginBottom: spacing["2xl"],
        }}
      >
        {FAN_CLUB_TIERS.map((tier, idx) => {
          const recommended = tier.highlight;
          const isInner = tier.id === "inner";
          const isRookie = tier.id === "rookie";
          
          // Brand color assignments
          const primaryAccent = recommended 
            ? colors.primary.main 
            : isInner 
              ? colors.accent.main 
              : colors.text.muted;
          const secondaryAccent = recommended 
            ? colors.accent.main 
            : isInner 
              ? colors.primary.main 
              : colors.text.muted;

          return (
            <motion.div
              key={tier.id}
              variants={itemVariants}
              whileHover={!reduce ? { y: -8, scale: 1.03, transition: { duration: 0.3 } } : undefined}
              style={{
                borderRadius: borderRadius["2xl"],
                border: recommended 
                  ? `2px solid ${primaryAccent}60` 
                  : `1px solid rgba(255,255,255,0.12)`,
                background: recommended
                  ? `linear-gradient(135deg, rgba(10, 61, 145, 0.15) 0%, rgba(5, 11, 32, 0.25) 100%)`
                  : `linear-gradient(135deg, rgba(28, 36, 48, 0.4) 0%, rgba(10, 22, 51, 0.3) 100%)`,
                backdropFilter: "blur(16px)",
                boxShadow: recommended
                  ? `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${primaryAccent}20, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : `0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
                overflow: "hidden",
                position: "relative",
                padding: spacing.cardPadding,
                display: "flex",
                flexDirection: "column",
                gap: spacing.lg,
                minHeight: isMobile ? "auto" : "480px",
              }}
            >
              {/* Enhanced Background Gradients */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: recommended
                    ? `radial-gradient(circle at 20% 20%, ${primaryAccent}25 0%, transparent 60%), 
                        radial-gradient(circle at 85% 15%, ${secondaryAccent}20 0%, transparent 65%),
                        linear-gradient(135deg, rgba(10, 61, 145, 0.08) 0%, transparent 50%)`
                    : isInner
                      ? `radial-gradient(circle at 18% 22%, ${colors.accent.main}20 0%, transparent 58%), 
                          radial-gradient(circle at 88% 18%, ${colors.primary.main}15 0%, transparent 62%)`
                      : `radial-gradient(circle at 18% 18%, rgba(255,255,255,0.05) 0%, transparent 55%)`,
                  opacity: 0.9,
                  pointerEvents: "none",
                }}
              />

              {/* Accent Border Glow */}
              {recommended && (
                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    inset: -2,
                    borderRadius: borderRadius["2xl"],
                    background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.25))`,
                    zIndex: -1,
                    filter: "blur(8px)",
                    opacity: 0.4,
                  }}
                />
              )}

              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Tier Name & Subtitle - Enhanced */}
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ 
                    ...typography.overline, 
                    color: tier.id === "regular" ? colors.text.muted : (recommended ? primaryAccent : colors.text.muted), 
                    letterSpacing: "0.16em",
                    marginBottom: spacing.xs,
                    fontWeight: typography.fontWeight.bold,
                  }}>
                    {tier.id.toUpperCase()}
                  </div>
                  <div style={{ 
                    ...typography.h3, 
                    color: colors.text.primary, 
                    margin: 0,
                    marginBottom: spacing.sm,
                    fontWeight: typography.fontWeight.extrabold,
                  }}>
                    {tier.name}
                  </div>
                  <div style={{ 
                    ...typography.h2, 
                    color: tier.id === "regular" ? colors.text.primary : (recommended ? primaryAccent : colors.text.primary),
                    margin: 0,
                    fontSize: typography.fontSize["2xl"],
                    fontWeight: typography.fontWeight.bold,
                  }}>
                    {tier.priceLabel}
                  </div>
                </div>

                {/* Benefits - Enhanced */}
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: spacing.sm, 
                  flex: 1,
                  marginTop: spacing.md,
                }}>
                  {tier.benefits.slice(0, 4).map((benefit, benefitIdx) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * benefitIdx }}
                      style={{ 
                        display: "flex", 
                        gap: spacing.sm, 
                        alignItems: "flex-start",
                        padding: `${spacing.xs} 0`,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${colors.success.main}, ${colors.success.light})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 2,
                          boxShadow: `0 2px 8px ${colors.success.main}30`,
                        }}
                      >
                        <CheckIcon size={12} color={colors.text.onPrimary} />
                      </div>
                      <span style={{ 
                        ...typography.body, 
                        color: colors.text.secondary, 
                        fontSize: typography.fontSize.sm, 
                        lineHeight: 1.6,
                        flex: 1,
                      }}>
                        {benefit}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sponsor Strip - Enhanced */}
      <motion.div variants={itemVariants} style={{ marginBottom: spacing.xl }}>
        <div
          style={{
            borderRadius: borderRadius.xl,
            border: `1px solid rgba(255,255,255,0.12)`,
            background: `linear-gradient(135deg, rgba(28, 36, 48, 0.5) 0%, rgba(10, 22, 51, 0.4) 100%)`,
            backdropFilter: "blur(16px)",
            boxShadow: `0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)`,
            padding: spacing.xl,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background accent */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 50%, ${colors.accent.main}08 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ 
              ...typography.overline, 
              color: colors.accent.main, 
              letterSpacing: "0.16em", 
              marginBottom: spacing.lg,
              fontWeight: typography.fontWeight.bold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
            }}>
              <StarIcon size={14} color={colors.accent.main} />
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
        </div>
      </motion.div>

    </motion.section>
  );
};


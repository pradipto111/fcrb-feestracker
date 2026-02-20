/**
 * Hero Section Design Patterns
 * Reference constants extracted from the hero section for unified design across homepage
 */

import { colors, typography, spacing, borderRadius, shadows, ctaDimensions } from "./design-tokens";

/**
 * Background overlay gradient matching hero section
 * Dark blue-grey overlay to ensure text visibility on background images
 */
export const heroOverlayGradient = "linear-gradient(135deg, rgba(5, 11, 32, 0.85) 0%, rgba(5, 11, 32, 0.4) 50%, rgba(5, 11, 32, 0.85) 100%)";

/**
 * CTA Button Styles - Matching Hero Section
 */
export const heroCTAStyles = {
  // Blue CTA: "Support the Club" style
  blue: {
    padding: ctaDimensions.paddingLg,
    borderRadius: borderRadius.button,
    background: colors.primary.main, // Royal blue
    border: "none",
    boxShadow: shadows.button,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    cursor: "pointer",
    width: "100%",
    minHeight: ctaDimensions.minHeightHero,
    transition: "all 0.2s ease",
    textStyle: {
      ...typography.body,
      color: colors.text.onPrimary,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg,
    },
    subtitleStyle: {
      ...typography.caption,
      color: "rgba(255,255,255,0.85)",
      fontSize: typography.fontSize.sm,
    },
  },
  
  // Yellow CTA: "Train With Us" style
  yellow: {
    padding: ctaDimensions.paddingLg,
    borderRadius: borderRadius.button,
    background: colors.accent.main, // FC Real Bengaluru gold
    border: "none",
    boxShadow: shadows.button,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    cursor: "pointer",
    width: "100%",
    minHeight: ctaDimensions.minHeightHero,
    transition: "all 0.2s ease",
    textStyle: {
      ...typography.body,
      color: colors.text.onAccent,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg,
    },
    subtitleStyle: {
      ...typography.caption,
      color: "rgba(2,12,27,0.85)",
      fontSize: typography.fontSize.sm,
    },
  },
  
  // Dark with border CTA: "Join the Journey" style
  darkWithBorder: {
    padding: ctaDimensions.paddingLg,
    borderRadius: borderRadius.button,
    background: colors.surface.card, // Dark card background
    border: `2px solid ${colors.accent.main}`, // Gold border
    boxShadow: shadows.button,
    position: "relative" as const,
    overflow: "hidden" as const,
    transition: "all 0.2s ease",
    textStyle: {
      ...typography.body,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg,
      lineHeight: 1.25,
    },
    subtitleStyle: {
      ...typography.body,
      color: colors.text.secondary,
      fontSize: typography.fontSize.sm,
      lineHeight: 1.5,
    },
  },
};

/**
 * Compact CTA (pill) styles matching hero language.
 * Used for in-module actions like "View Gallery", "Programmes", "View Fixtures".
 */
export const heroCTAPillStyles = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 999,
    background: colors.surface.card,
    boxShadow: shadows.button,
    cursor: "pointer",
    userSelect: "none" as const,
    WebkitTapHighlightColor: "transparent" as const,
    transition: "all 0.2s ease",
    border: "1px solid rgba(255,255,255,0.14)",
    color: colors.text.primary,
    ...typography.caption,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: "0.02em",
    whiteSpace: "nowrap" as const,
  },
  gold: {
    border: `2px solid ${colors.accent.main}`,
  },
  blue: {
    border: `2px solid ${colors.primary.main}`,
  },
};

/**
 * Typography styles matching hero section
 */
export const heroTypography = {
  heading: {
    ...typography.display,
    fontSize: `clamp(3.2rem, 8.6vw, 6.2rem)`,
    color: colors.text.primary,
    lineHeight: 1.02,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: "-0.03em",
    textShadow: "0 6px 50px rgba(0, 0, 0, 0.85), 0 0 70px rgba(0, 224, 255, 0.18)",
  },
  subheading: {
    ...typography.body,
    fontSize: `clamp(${typography.fontSize.lg}, 2vw, ${typography.fontSize.xl})`,
    color: colors.text.secondary,
    lineHeight: 1.75,
    textShadow: "0 2px 24px rgba(0, 0, 0, 0.65)",
  },
  accentText: {
    background: `linear-gradient(90deg, ${colors.accent.main}, rgba(255, 194, 51, 0.95))`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    textShadow: "none",
  },
};

/**
 * Section background overlay for consistent text readability
 */
export const sectionBackgroundOverlay = {
  position: "absolute" as const,
  inset: 0,
  background: heroOverlayGradient,
  zIndex: 1,
  pointerEvents: "none" as const,
};

/**
 * Programme card overlay (Balanced preset)
 * Improves text readability on photo cards while staying on-brand (blue + gold).
 */
export const programCardOverlay = (accent: string) => {
  const secondary = accent === colors.primary.main ? colors.accent.main : colors.primary.main;
  // Enhanced blue gradient for better visibility when accent is blue
  const accentIntensity = accent === colors.primary.main ? '28' : '1A';
  const accentGlow = accent === colors.primary.main ? 'rgba(45, 127, 214, 0.15)' : `${accent}1A`;
  return {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
    // Subtle blur for busy photos (balanced)
    backdropFilter: "blur(6px)",
    // Dark club wash + branded highlights (blue/gold) - enhanced blue gradients for visibility
    background: `linear-gradient(135deg, rgba(5,11,32,0.78) 0%, rgba(10,22,51,0.62) 45%, rgba(5,11,32,0.86) 100%),
      radial-gradient(circle at 18% 18%, ${secondary}22 0%, transparent 58%),
      radial-gradient(circle at 82% 14%, ${accentGlow} 0%, transparent 60%),
      ${accent === colors.primary.main ? `radial-gradient(circle at 50% 50%, rgba(10, 61, 145, 0.12) 0%, transparent 70%)` : ''}`,
    opacity: 0.9,
  };
};

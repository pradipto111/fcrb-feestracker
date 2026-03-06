import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { heroOverlayGradient, heroTypography } from "../../theme/hero-design-patterns";

export type SupportCelebrateBelongResult = {
  opponent: string;
  venue?: string;
  matchType?: string;
  score?: string | null;
};

export const SupportCelebrateBelongSection: React.FC<{
  isMobile: boolean;
  latestResult: SupportCelebrateBelongResult | null;
  compact?: boolean;
}> = ({ isMobile, latestResult, compact = false }) => {
  const reduceMotion = useReducedMotion();
  const hasResult = Boolean(latestResult?.score);

  const content = (
    <div style={{ display: "grid", gap: spacing.md }}>
      <div style={{ marginBottom: spacing.xs }}>
        <div
          style={{
            ...heroTypography.heading,
            fontSize: isMobile ? "clamp(22px, 6vw, 26px)" : "clamp(28px, 2.6vw, 34px)",
            lineHeight: 1.12,
            margin: 0,
          }}
        >
          Support, Celebrate &amp; Belong
        </div>
        <div style={{ ...heroTypography.subheading, marginTop: 8 }}>
          Matchday moments and community energy, all in one place.
        </div>
      </div>

      <div
        style={{
          borderRadius: borderRadius.card,
          border: "1px solid rgba(255,255,255,0.12)",
          background: colors.surface.card,
          boxShadow: shadows.card,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: heroOverlayGradient,
            opacity: 0.9,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", padding: isMobile ? spacing.md : spacing.lg }}>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.12em", marginBottom: spacing.xs }}>
            LATEST RESULT
          </div>
          <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
            {latestResult ? `FC Real Bengaluru vs ${latestResult.opponent}` : "Result update coming soon"}
          </div>
          <div style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.sm }}>
            {latestResult?.venue || "Venue update pending"}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "8px 14px",
              background: "rgba(255,255,255,0.06)",
              color: hasResult ? colors.text.primary : colors.text.muted,
              ...typography.body,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {hasResult ? latestResult?.score : "Final score pending"}
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.35 }}
      >
        {content}
      </motion.div>
    );
  }

  return <section id="support-celebrate-belong">{content}</section>;
};

export default SupportCelebrateBelongSection;

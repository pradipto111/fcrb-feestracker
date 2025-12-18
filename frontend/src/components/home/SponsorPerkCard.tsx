import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import type { SponsorOffer, SponsorTheme } from "../../data/sponsors";
import { OfferCarousel } from "../ui/OfferCarousel";
import { OfferTile } from "../ui/OfferTile";
import { Button } from "../ui/Button";

const LockMark = ({ color = "rgba(255,255,255,0.92)" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block" }}>
    <path
      fill={color}
      d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm7 12H7v-8h10v8Z"
    />
  </svg>
);

export const SponsorPerkCard: React.FC<{
  sponsor: SponsorTheme;
  offers: SponsorOffer[];
  isMobile: boolean;
}> = ({ sponsor, offers, isMobile }) => {
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
        borderRadius: borderRadius["2xl"],
        border: `1px solid rgba(255,255,255,0.10)`,
        background: "rgba(10,16,32,0.34)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 22px 64px rgba(0,0,0,0.42)",
        overflow: "hidden",
        position: "relative",
        minWidth: 0,
      }}
    >
      {/* Sponsor accent wash */}
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

      <div style={{ position: "relative", zIndex: 1, padding: isMobile ? spacing.md : spacing.lg, display: "flex", flexDirection: "column", gap: spacing.md }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                border: `1px solid rgba(255,255,255,0.12)`,
                background: "rgba(255,255,255,0.04)",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img src={sponsor.logoSrc} alt={`${sponsor.name} logo`} loading="lazy" style={{ width: "92%", height: "92%", objectFit: "contain", filter: "grayscale(100%) brightness(1.35)" }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ ...typography.overline, color: sponsor.accent2, letterSpacing: "0.14em", marginBottom: 4 }}>SPONSOR PERKS</div>
              <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.15 }}>{sponsor.name}</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>{sponsor.tagline}</div>
            </div>
          </div>
        </div>

        {/* Offers carousel */}
        <OfferCarousel title="Available after joining Fan Club" accent={sponsor.accent} isMobile={isMobile}>
          {offers.map((o) => (
            <motion.div
              key={o.id}
              whileHover={!reduce ? { scale: 1.02, y: -2, boxShadow: `0 0 0 1px ${sponsor.accent}3A, 0 18px 42px rgba(0,0,0,0.45)` } : undefined}
              style={{ borderRadius: borderRadius.xl }}
            >
              <OfferTile offer={o} accent={sponsor.accent} accent2={sponsor.accent2} />
            </motion.div>
          ))}
        </OfferCarousel>

        {/* Locked CTA band (non-reactive) */}
        <motion.div
          animate={
            reduce
              ? undefined
              : {
                  boxShadow: [
                    `0 16px 46px rgba(0,0,0,0.45), 0 0 0 1px ${sponsor.accent}22`,
                    `0 16px 46px rgba(0,0,0,0.45), 0 0 0 1px ${sponsor.accent}38`,
                    `0 16px 46px rgba(0,0,0,0.45), 0 0 0 1px ${sponsor.accent}22`,
                  ],
                }
          }
          transition={reduce ? undefined : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            borderRadius: borderRadius.xl,
            border: `1px solid ${sponsor.accent}2D`,
            background: "rgba(0,0,0,0.18)",
            padding: isMobile ? 12 : 14,
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: spacing.md,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={{ minWidth: 0, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: `1px solid ${sponsor.accent}33`,
                background: `${sponsor.accent}12`,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <LockMark />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.25 }}>
                Join the Fan Club to unlock your first gift
              </div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>
                Fan Club members get rotating perks every month.
              </div>
            </div>
          </div>

          <div title={tooltip} style={{ flexShrink: 0 }}>
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
                width: isMobile ? "100%" : "auto",
              }}
            >
              Unlock Your First Perk (Join Fan Club)
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};



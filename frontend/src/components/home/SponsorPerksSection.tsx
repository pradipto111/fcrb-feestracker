import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { SPONSORS, DUMMY_OFFERS } from "../../data/sponsors";
import { SponsorLogoWall } from "./SponsorLogoWall";
import { SponsorPerkCard } from "./SponsorPerkCard";
import { Button } from "../ui/Button";

export const SponsorPerksSection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const reduce = useReducedMotion();
  const tooltip = "Coming soon — Fan Club unlocks perks";

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  } as const;

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
      }}
    >
      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        {/* Announcement strip */}
        <motion.div variants={item} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.25fr 0.75fr", gap: spacing.lg, alignItems: "center", marginBottom: spacing.xl }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              FAN CLUB PERKS
            </div>
            <h2 style={{ ...typography.h1, fontSize: `clamp(2.2rem, 4.4vw, 3.2rem)`, margin: 0, color: colors.text.primary, lineHeight: 1.08 }}>
              Perks from Our Sponsors
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.7, marginTop: spacing.md, maxWidth: "70ch" }}>
              Join the Fan Club to unlock exclusive offers all season.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
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
                boxShadow: "0 18px 48px rgba(0,0,0,0.35)",
              }}
            >
              <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.9 }}>OFFICIAL SPONSORS 2025</span>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: colors.accent.main, boxShadow: "0 0 18px rgba(255,169,0,0.35)" }} />
              <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.85 }}>MEMBERS-ONLY</span>
            </div>
          </div>
        </motion.div>

        {/* Logo wall */}
        <motion.div variants={item} style={{ marginBottom: spacing["2xl"] }}>
          <div
            style={{
              borderRadius: borderRadius["2xl"],
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(8,12,24,0.22)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 22px 64px rgba(0,0,0,0.40)",
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
            <div style={{ position: "relative", zIndex: 1 }}>
              <SponsorLogoWall sponsors={SPONSORS} isMobile={isMobile} />
            </div>
          </div>
        </motion.div>

        {/* Sponsor blocks */}
        <motion.div variants={item}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
              gap: spacing.lg,
              alignItems: "stretch",
            }}
          >
            {SPONSORS.map((s) => (
              <SponsorPerkCard key={s.id} sponsor={s} offers={DUMMY_OFFERS[s.id] || []} isMobile={isMobile} />
            ))}
          </div>
        </motion.div>

        {/* Global CTA summary (disabled) */}
        <motion.div variants={item} style={{ marginTop: spacing["2xl"] }}>
          <div
            style={{
              borderRadius: borderRadius["2xl"],
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              padding: isMobile ? spacing.md : spacing.lg,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 22px 64px rgba(0,0,0,0.42)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 16% 22%, rgba(255,169,0,0.12) 0%, transparent 58%), radial-gradient(circle at 88% 18%, rgba(0,224,255,0.10) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.58) 0%, rgba(10,22,51,0.46) 45%, rgba(5,11,32,0.65) 100%)",
                opacity: 0.95,
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 0.6fr", gap: spacing.lg, alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, lineHeight: 1.15 }}>
                  1 membership → perks from all sponsors
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                  {["New gifts monthly", "Early tickets", "Member-only merch drops"].map((t) => (
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

              <div title={tooltip} style={{ display: "flex", justifyContent: isMobile ? "stretch" : "flex-end" }}>
                <Button
                  variant="primary"
                  size="lg"
                  disabled
                  aria-disabled="true"
                  style={{
                    borderRadius: 999,
                    width: isMobile ? "100%" : "auto",
                    background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.main} 100%)`,
                    boxShadow: `0 10px 30px rgba(0,224,255,0.22)`,
                  }}
                >
                  Join Fan Club (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};



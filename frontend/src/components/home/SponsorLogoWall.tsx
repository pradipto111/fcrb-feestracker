import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import type { SponsorTheme } from "../../data/sponsors";

export const SponsorLogoWall: React.FC<{
  sponsors: SponsorTheme[];
  isMobile: boolean;
}> = ({ sponsors, isMobile }) => {
  const reduce = useReducedMotion();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  } as const;

  return (
    <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
          gap: spacing.md,
        }}
      >
        {sponsors.map((s) => {
          const websiteUrl = (s as any).websiteUrl;
          const logoContainer = (
            <div
              style={{
                borderRadius: borderRadius.xl,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.03)",
                padding: isMobile ? 12 : 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: isMobile ? 74 : 84,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 12px 34px rgba(0,0,0,0.32)",
                cursor: websiteUrl ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (websiteUrl && !reduce) {
                  e.currentTarget.style.borderColor = s.accent;
                  e.currentTarget.style.background = `${s.accent}08`;
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (websiteUrl) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 18% 18%, ${s.accent}14 0%, transparent 55%), radial-gradient(circle at 88% 22%, ${s.accent2}12 0%, transparent 62%)`,
                  opacity: 0.8,
                  pointerEvents: "none",
                }}
              />
              <img
                src={s.logoSrc}
                alt={`${s.name} logo`}
                loading="lazy"
                onError={(e) => {
                  // Fallback if image fails to load
                  console.warn(`Failed to load logo for ${s.name}: ${s.logoSrc}`);
                }}
                style={{
                  width: "100%",
                  maxWidth: 220,
                  height: 44,
                  objectFit: "contain",
                  filter: "grayscale(100%) brightness(1.25)",
                  opacity: 0.92,
                  position: "relative",
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  if (reduce) return;
                  e.currentTarget.style.filter = `grayscale(0%) brightness(1.2) drop-shadow(0 0 14px ${s.glow})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "grayscale(100%) brightness(1.25)";
                }}
              />
            </div>
          );

          return (
            <motion.div key={s.id} variants={item}>
              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", display: "block" }}
                  aria-label={`Visit ${s.name} website`}
                >
                  {logoContainer}
                </a>
              ) : (
                logoContainer
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};



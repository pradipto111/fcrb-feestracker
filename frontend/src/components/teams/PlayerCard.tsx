import React from "react";
import { motion } from "framer-motion";
import { colors, spacing, borderRadius, shadows, typography } from "../../theme/design-tokens";
import type { Player } from "../../types/teams";
import { FootballIcon } from "../icons/IconSet";

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const { name, number, position, nationality, image, appearances, goals } = player;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: borderRadius.card,
        background: colors.surface.card,
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: shadows.card,
        padding: spacing.cardPadding,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 260,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.16) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(245,179,0,0.14) 0%, transparent 60%)",
          opacity: 0.95,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: spacing.md, minHeight: "100%" }}>
        {/* Top: number + avatar */}
        <div style={{ display: "flex", gap: spacing.md, alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: borderRadius.full,
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.16)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {image ? (
              <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <FootballIcon size={26} color={colors.accent.main} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm }}>
              <h3 style={{ ...typography.h4, color: colors.text.primary, margin: 0, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {name}
              </h3>
              {number && (
                <div
                  style={{
                    ...typography.h4,
                    color: colors.accent.main,
                    fontWeight: typography.fontWeight.extrabold,
                    margin: 0,
                  }}
                >
                  #{number}
                </div>
              )}
            </div>
            <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em", marginTop: 4, textTransform: "uppercase" }}>
              {position}
              {nationality ? ` • ${nationality}` : null}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {(appearances !== undefined || goals !== undefined) && (
          <div
            style={{
              borderRadius: borderRadius.lg,
              background: "rgba(0,0,0,0.28)",
              border: "1px solid rgba(255,255,255,0.10)",
              padding: spacing.sm,
              display: "flex",
              gap: spacing.md,
              justifyContent: "space-between",
            }}
          >
            {appearances !== undefined && (
              <div>
                <div style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>Appearances</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{appearances}</div>
              </div>
            )}
            {goals !== undefined && (
              <div>
                <div style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>Goals</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{goals}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};



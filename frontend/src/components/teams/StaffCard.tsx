import React from "react";
import { motion } from "framer-motion";
import { colors, spacing, borderRadius, shadows, typography } from "../../theme/design-tokens";
import type { Staff } from "../../types/teams";
import { UsersIcon } from "../icons/IconSet";

interface StaffCardProps {
  staff: Staff;
}

export const StaffCard: React.FC<StaffCardProps> = ({ staff }) => {
  const { name, role, bio, image, team } = staff;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
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
        minHeight: 220,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.10) 0%, transparent 55%), radial-gradient(circle at 82% 0%, rgba(245,179,0,0.10) 0%, transparent 60%)",
          opacity: 0.95,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: spacing.md, minHeight: "100%" }}>
        <div style={{ display: "flex", gap: spacing.md, alignItems: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
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
              <UsersIcon size={24} color={colors.accent.main} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, margin: 0, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
              {name}
            </h3>
            <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em", marginTop: 4, textTransform: "uppercase" }}>{role}</div>
            <div style={{ ...typography.caption, color: colors.text.secondary, marginTop: 4 }}>{team}</div>
          </div>
        </div>

        {bio && (
          <p
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
              lineHeight: 1.6,
              marginTop: spacing.sm,
            }}
          >
            {bio}
          </p>
        )}
      </div>
    </motion.div>
  );
};



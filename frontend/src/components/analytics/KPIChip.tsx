import React from "react";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";

interface KPIChipProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

export const KPIChip: React.FC<KPIChipProps> = ({
  label,
  value,
  trend,
  onClick,
}) => {
  const getTrendColor = () => {
    if (trend === "up") return colors.success.main;
    if (trend === "down") return colors.warning.main;
    return colors.text.muted;
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: spacing.md,
        background: colors.surface.soft,
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.surface.card}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        ...(onClick && {
          ":hover": {
            background: colors.surface.card,
            borderColor: colors.primary.main,
          },
        }),
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = colors.surface.card;
          e.currentTarget.style.borderColor = colors.primary.main;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.background = colors.surface.soft;
          e.currentTarget.style.borderColor = colors.surface.card;
        }
      }}
    >
      <div
        style={{
          ...typography.caption,
          color: colors.text.muted,
          marginBottom: spacing.xs,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.xs,
        }}
      >
        <span
          style={{
            ...typography.h3,
            color: colors.text.primary,
            fontWeight: typography.fontWeight.bold,
          }}
        >
          {value}
        </span>
        {trend && (
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: getTrendColor(),
            }}
          >
            {getTrendIcon()}
          </span>
        )}
      </div>
    </div>
  );
};


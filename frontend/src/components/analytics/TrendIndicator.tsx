import React from "react";
import { colors, typography } from "../../theme/design-tokens";

interface TrendIndicatorProps {
  trend: "up" | "down" | "neutral";
  value?: number | string;
  label?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  value,
  label,
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        color: getTrendColor(),
        fontSize: typography.fontSize.sm,
      }}
    >
      <span>{getTrendIcon()}</span>
      {value !== undefined && <span>{value}</span>}
      {label && <span>{label}</span>}
    </div>
  );
};


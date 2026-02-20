import React from "react";
import { colors, spacing, typography, borderRadius, shadows } from "../../theme/design-tokens";

export type CrmAnalyticsSummary = {
  conversionsToday: number;
  conversionsWeek: number;
  touchesToday: number;
  touchesWeek: number;
  movesToday: number;
  movesWeek: number;
  followUpsOverdue: number;
  hotLeadsCount: number;
  openByStage: Record<string, number>;
};

type TopPerformanceStripProps = {
  analytics: CrmAnalyticsSummary | null;
  onMetricClick: (filterType: string) => void;
  loading?: boolean;
};

type MetricCardProps = {
  label: string;
  value: string | number;
  onClick?: () => void;
  isPrimary?: boolean;
  isLoading?: boolean;
  icon?: string;
  color?: string;
  trend?: "up" | "down" | "neutral";
};

// Icon components using Unicode/Emoji for simplicity
const MetricIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => (
  <div
    style={{
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      background: `${color}15`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      marginBottom: spacing.sm,
    }}
  >
    {icon}
  </div>
);

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  onClick,
  isPrimary = false,
  isLoading = false,
  icon = "📊",
  color = colors.accent.main,
  trend,
}) => {
  const getTrendColor = () => {
    if (trend === "up") return colors.success.main;
    if (trend === "down") return colors.danger.main;
    return colors.text.muted;
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        background: isPrimary
          ? `linear-gradient(135deg, rgba(245, 179, 0, 0.12) 0%, rgba(245, 179, 0, 0.05) 100%)`
          : "rgba(8, 12, 24, 0.6)",
        border: isPrimary
          ? `2px solid ${colors.accent.main}40`
          : "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: isPrimary ? shadows.cardHover : shadows.card,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
          e.currentTarget.style.boxShadow = shadows.cardHover;
          e.currentTarget.style.borderColor = isPrimary ? colors.accent.main : color + "60";
          e.currentTarget.style.background = isPrimary
            ? `linear-gradient(135deg, rgba(245, 179, 0, 0.18) 0%, rgba(245, 179, 0, 0.08) 100%)`
            : "rgba(8, 12, 24, 0.8)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = isPrimary ? shadows.cardHover : shadows.card;
          e.currentTarget.style.borderColor = isPrimary ? `${colors.accent.main}40` : "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.background = isPrimary
            ? `linear-gradient(135deg, rgba(245, 179, 0, 0.12) 0%, rgba(245, 179, 0, 0.05) 100%)`
            : "rgba(8, 12, 24, 0.6)";
        }
      }}
    >
      {/* Accent bar for primary metrics */}
      {isPrimary && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${colors.accent.main}, ${colors.accent.light})`,
          }}
        />
      )}

      {/* Icon */}
      <MetricIcon icon={icon} color={color} />

      {/* Value */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: spacing.xs,
          marginBottom: spacing.xs,
        }}
      >
        <div
          style={{
            ...typography.h2,
            fontSize: "2rem",
            color: isPrimary ? colors.accent.main : color,
            fontWeight: typography.fontWeight.bold,
            lineHeight: 1.2,
          }}
        >
          {isLoading ? "—" : typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {trend && (
          <span
            style={{
              fontSize: "0.875rem",
              color: getTrendColor(),
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
        )}
      </div>

      {/* Label */}
      <div
        style={{
          ...typography.body,
          fontSize: "0.875rem",
          color: colors.text.secondary,
          fontWeight: typography.fontWeight.medium,
          marginBottom: onClick ? spacing.xs : 0,
        }}
      >
        {label}
      </div>

      {/* Click hint */}
      {onClick && (
        <div
          style={{
            ...typography.caption,
            color: colors.text.muted,
            fontSize: "0.75rem",
            opacity: 0.6,
            display: "flex",
            alignItems: "center",
            gap: spacing.xs,
          }}
        >
          <span>Click to filter</span>
          <span style={{ fontSize: "0.7rem" }}>→</span>
        </div>
      )}
    </div>
  );
};

export const TopPerformanceStrip: React.FC<TopPerformanceStripProps> = ({
  analytics,
  onMetricClick,
  loading = false,
}) => {
  if (loading && !analytics) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <MetricCard key={i} label="Loading..." value="—" isLoading={true} />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Conversions Today",
      value: analytics?.conversionsToday ?? 0,
      onClick: () => onMetricClick("conversions"),
      isPrimary: true,
      icon: "🎯",
      color: colors.success.main,
      trend: (analytics?.conversionsToday ?? 0) > 0 ? "up" : "neutral",
    },
    {
      label: "Conversions (7d)",
      value: analytics?.conversionsWeek ?? 0,
      onClick: () => onMetricClick("conversions"),
      icon: "📈",
      color: colors.success.main,
    },
    {
      label: "Touches Today",
      value: analytics?.touchesToday ?? 0,
      onClick: () => onMetricClick("touches"),
      icon: "👋",
      color: colors.primary.main,
    },
    {
      label: "Touches (7d)",
      value: analytics?.touchesWeek ?? 0,
      onClick: () => onMetricClick("touches"),
      icon: "💬",
      color: colors.primary.main,
    },
    {
      label: "Moves Today",
      value: analytics?.movesToday ?? 0,
      onClick: () => onMetricClick("moves"),
      icon: "🔄",
      color: colors.info.main,
    },
    {
      label: "Moves (7d)",
      value: analytics?.movesWeek ?? 0,
      onClick: () => onMetricClick("moves"),
      icon: "⚡",
      color: colors.info.main,
    },
    {
      label: "Follow-ups Overdue",
      value: analytics?.followUpsOverdue ?? 0,
      onClick: () => onMetricClick("overdue"),
      isPrimary: (analytics?.followUpsOverdue ?? 0) > 0,
      icon: "⏰",
      color: colors.danger.main,
      trend: (analytics?.followUpsOverdue ?? 0) > 0 ? "down" : "neutral",
    },
    {
      label: "Hot Leads",
      value: analytics?.hotLeadsCount ?? 0,
      onClick: () => onMetricClick("hot"),
      isPrimary: (analytics?.hotLeadsCount ?? 0) > 0,
      icon: "🔥",
      color: colors.warning.main,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: spacing.lg,
        marginBottom: spacing.xl,
      }}
    >
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          label={metric.label}
          value={metric.value}
          onClick={metric.onClick}
          isPrimary={metric.isPrimary}
          isLoading={loading}
          icon={metric.icon}
          color={metric.color}
          trend={metric.trend}
        />
      ))}
    </div>
  );
};

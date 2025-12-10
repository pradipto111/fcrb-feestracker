import React from "react";
import { Card } from "../ui/Card";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  fullWidth?: boolean;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  subtitle,
  children,
  action,
  fullWidth = false,
}) => {
  return (
    <Card
      style={{
        padding: spacing.xl,
        width: fullWidth ? "100%" : "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing.md,
        }}
      >
        <div>
          <h3
            style={{
              ...typography.h4,
              color: colors.text.primary,
              margin: 0,
              marginBottom: subtitle ? spacing.xs : 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                ...typography.caption,
                color: colors.text.muted,
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div>{children}</div>
    </Card>
  );
};


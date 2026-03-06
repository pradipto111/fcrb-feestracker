import React from "react";
import { colors, typography, spacing } from "../../theme/design-tokens";

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  height?: number;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  height = 300,
  emptyMessage = "No data available",
  isEmpty = false,
}) => {
  if (isEmpty) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.text.muted,
          ...typography.body,
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        padding: spacing.md,
      }}
    >
      {title && (
        <h4
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginTop: 0,
            marginBottom: spacing.md,
          }}
        >
          {title}
        </h4>
      )}
      <div style={{ height }}>
        {children}
      </div>
    </div>
  );
};


import React from "react";
import { colors, typography, spacing } from "../../theme/design-tokens";

interface ChartContainerProps {
  children: React.ReactNode;
  height?: number;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
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
        height,
        width: "100%",
        padding: spacing.md,
      }}
    >
      {children}
    </div>
  );
};


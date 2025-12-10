import React from "react";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: Array<{
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: spacing.md,
        flexWrap: "wrap",
        marginBottom: spacing.lg,
        padding: spacing.md,
        background: colors.surface.soft,
        borderRadius: borderRadius.md,
      }}
    >
      {filters.map((filter, idx) => (
        <div key={idx} style={{ minWidth: "150px" }}>
          <label
            style={{
              display: "block",
              marginBottom: spacing.xs,
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}
          >
            {filter.label}
          </label>
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            style={{
              width: "100%",
              padding: `${spacing.sm} ${spacing.md}`,
              border: `2px solid ${colors.surface.card}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.sm,
              cursor: "pointer",
              background: colors.surface.main,
              color: colors.text.primary,
            }}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};


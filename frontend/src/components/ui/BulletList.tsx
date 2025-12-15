import React from "react";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";

interface BulletListProps {
  items: string[];
}

export const BulletList: React.FC<BulletListProps> = ({ items }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: colors.accent.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.text.onPrimary,
              fontSize: "11px",
              fontWeight: typography.fontWeight.bold,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            ✓
          </div>
          <div
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            {item}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BulletList;


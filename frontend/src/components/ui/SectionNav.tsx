import React from "react";
import { colors, spacing, borderRadius, typography } from "../../theme/design-tokens";

export interface SectionNavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
  /** Optional aria-label for the nav landmark */
  ariaLabel?: string;
  style?: React.CSSProperties;
}

/**
 * SectionNav
 * Lightweight in-page navigation (anchor links) for long internal pages.
 * Keeps navigation friction low without changing routing.
 */
export const SectionNav: React.FC<SectionNavProps> = ({ items, ariaLabel = "On this page", style }) => {
  if (!items.length) return null;

  return (
    <nav
      aria-label={ariaLabel}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        background: colors.surface.section,
        border: `1px solid rgba(255,255,255,0.08)`,
        marginBottom: spacing.lg,
        ...style,
      }}
    >
      <div style={{ ...typography.caption, color: colors.text.muted, marginRight: spacing.sm, letterSpacing: "0.08em" }}>
        ON THIS PAGE
      </div>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          style={{
            ...typography.caption,
            textDecoration: "none",
            color: colors.text.secondary,
            padding: "8px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            lineHeight: 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.text.primary;
            e.currentTarget.style.borderColor = "rgba(0,224,255,0.22)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text.secondary;
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
};


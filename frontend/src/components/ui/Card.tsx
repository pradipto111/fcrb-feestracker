import React from "react";
import { borderRadius, shadows, spacing } from "../../theme/design-tokens";
import { glass } from "../../theme/glass";

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'outlined';
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  style?: React.CSSProperties;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  className,
  onClick,
}) => {
  const paddingMap = {
    none: '0',
    sm: spacing.md, // 16px
    md: spacing.cardPadding, // 32px - minimum card padding (football-first)
    lg: spacing.xl, // 32px
    xl: spacing['40'], // 40px for large cards
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    // Default surface: blue glass overlay for readability over busy backgrounds
    default: {
      ...glass.card,
      boxShadow: shadows.card,
      borderRadius: borderRadius.card,
    },
    // Elevated: same surface but stronger lift
    elevated: {
      ...glass.card,
      boxShadow: shadows.cardHover,
      borderRadius: borderRadius.card,
    },
    // Glass: explicit glass surface (same as default; kept for API compatibility)
    glass: {
      ...glass.card,
      boxShadow: shadows.card,
      borderRadius: borderRadius.card,
    },
    // Outlined: inset surface for secondary blocks
    outlined: {
      ...glass.inset,
      boxShadow: shadows.sm,
      borderRadius: borderRadius.card,
    },
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: borderRadius.card, // 16px - football-first
    padding: paddingMap[padding], // Minimum 32px for readable text zones
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth sports feel
    ...variantStyles[variant],
    ...(onClick ? { cursor: 'pointer' } : {}),
    ...style,
  };

  const [isHovered, setIsHovered] = React.useState(false);
  // If the caller provides a custom background, assume they control readability.
  // This prevents double-overlays on special cards (error states, media cards, etc).
  const hasCustomBackground = Boolean(style?.background || style?.backgroundColor || (style as any)?.backgroundImage);
  const showOverlay = variant !== "outlined" && !hasCustomBackground;
  const overlayStyle = glass.overlay;

  return (
    <div
      className={className}
      style={{
        ...cardStyle,
        ...(isHovered && onClick
          ? {
              transform: 'translateY(-2px)', // Subtle lift - football-first
              boxShadow: shadows.cardHover, // Sports broadcast hover shadow
            }
          : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showOverlay && <div aria-hidden="true" style={overlayStyle} />}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};


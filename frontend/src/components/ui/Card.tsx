import React from 'react';
import { colors, borderRadius, shadows, spacing } from '../../theme/design-tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
    // Section surface - main content panels (football-first)
    default: {
      background: colors.surface.card, // Football-first card background
      backdropFilter: 'blur(14px)',
      boxShadow: shadows.card, // Sports broadcast style
      border: `1px solid rgba(255, 255, 255, 0.10)`, // Subtle border
      borderRadius: borderRadius.card, // 16px - football-first
    },
    // Card surface - floating cards (football-first)
    elevated: {
      background: colors.surface.card, // Football-first card background
      backdropFilter: 'blur(14px)',
      boxShadow: shadows.cardHover, // Sports broadcast hover shadow
      border: `1px solid rgba(255, 255, 255, 0.10)`, // Subtle border
      borderRadius: borderRadius.card, // 16px - football-first
    },
    // Glass effect - for overlays (football-first)
    glass: {
      background: colors.surface.card, // Football-first card background
      backdropFilter: 'blur(14px)',
      boxShadow: shadows.card, // Sports broadcast style
      border: `1px solid rgba(255, 255, 255, 0.10)`, // Subtle border
      borderRadius: borderRadius.card, // 16px - football-first
    },
    // Outlined - subtle borders (football-first)
    outlined: {
      background: colors.surface.soft, // Soft background
      backdropFilter: 'blur(10px)',
      border: `1px solid rgba(255, 255, 255, 0.10)`, // Subtle border
      boxShadow: shadows.sm, // Subtle shadow
      borderRadius: borderRadius.card, // 16px - football-first
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
      {children}
    </div>
  );
};


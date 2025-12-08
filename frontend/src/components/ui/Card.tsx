import React from 'react';
import { colors, borderRadius, shadows, spacing } from '../../theme/design-tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
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
    sm: spacing.md,
    md: spacing.lg,
    lg: spacing.xl,
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    // Section surface - main content panels
    default: {
      background: colors.surface.section,
      backdropFilter: 'blur(20px)',
      boxShadow: shadows.glassDark,
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      borderRadius: borderRadius['3xl'],
    },
    // Card surface - floating cards
    elevated: {
      background: colors.surface.card,
      backdropFilter: 'blur(20px)',
      boxShadow: shadows.glassDark,
      border: `1px solid rgba(255, 255, 255, 0.15)`,
      borderRadius: borderRadius.xl,
    },
    // Glass effect - for overlays
    glass: {
      background: colors.surface.card,
      backdropFilter: 'blur(20px)',
      boxShadow: shadows.glass,
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      borderRadius: borderRadius.xl,
    },
    // Outlined - subtle borders
    outlined: {
      background: colors.surface.soft,
      backdropFilter: 'blur(10px)',
      border: `1px solid rgba(255, 255, 255, 0.15)`,
      boxShadow: 'none',
      borderRadius: borderRadius.xl,
    },
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: borderRadius.xl,
    padding: paddingMap[padding],
    transition: 'all 0.2s ease',
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
              transform: 'translateY(-4px)',
              boxShadow: shadows['2xl'],
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


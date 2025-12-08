import React from 'react';
import { colors, borderRadius, typography } from '../../theme/design-tokens';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: colors.primary.soft,
      color: colors.primary.main,
      border: `1px solid ${colors.primary.outline}`,
    },
    accent: {
      background: colors.accent.soft,
      color: colors.accent.dark,
      border: `1px solid ${colors.accent.outline}`,
    },
    success: {
      background: colors.success.soft,
      color: colors.success.main,
      border: `1px solid ${colors.success.soft}`,
    },
    warning: {
      background: colors.warning.soft,
      color: colors.warning.dark,
      border: `1px solid ${colors.warning.outline}`,
    },
    danger: {
      background: colors.danger.soft,
      color: colors.danger.main,
      border: `1px solid ${colors.danger.soft}`,
    },
    info: {
      background: colors.info.soft,
      color: colors.info.main,
      border: `1px solid ${colors.info.outline}`,
    },
    neutral: {
      background: colors.surface.soft,
      color: colors.text.secondary,
      border: `1px solid ${colors.border.light}`,
    },
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '4px 8px',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    md: {
      padding: '6px 12px',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: borderRadius.full,
        fontFamily: typography.fontFamily.primary,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
};



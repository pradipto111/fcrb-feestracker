import React from 'react';
import { colors, borderRadius, typography, spacing } from '../../theme/design-tokens';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  variant = 'primary',
  showLabel = true,
  height = 'md',
}) => {
  const heightMap = {
    sm: '4px',
    md: '8px',
    lg: '12px',
  };

  const variantGradients = {
    primary: `linear-gradient(90deg, #00D4FF 0%, ${colors.primary.main} 100%)`,
    accent: `linear-gradient(90deg, ${colors.accent.main} 0%, #FFD700 100%)`,
    success: `linear-gradient(90deg, ${colors.success.main} 0%, ${colors.success.light} 100%)`,
    warning: `linear-gradient(90deg, ${colors.warning.main} 0%, ${colors.warning.light} 100%)`,
    danger: `linear-gradient(90deg, ${colors.danger.main} 0%, ${colors.danger.light} 100%)`,
  };

  return (
    <div style={{ width: '100%' }}>
      {label && showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xs,
        }}>
          <span style={{
            ...typography.caption,
            color: colors.text.secondary,
          }}>
            {label}
          </span>
          <span style={{
            ...typography.caption,
            color: colors.text.primary,
            fontWeight: typography.fontWeight.semibold,
          }}>
            {Math.round(value)}%
          </span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: heightMap[height],
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            height: '100%',
            background: variantGradients[variant],
            borderRadius: borderRadius.full,
            transition: 'width 0.6s ease-out',
            boxShadow: `0 0 10px ${variant === 'primary' ? 'rgba(0, 212, 255, 0.5)' : variant === 'accent' ? 'rgba(255, 169, 0, 0.5)' : 'rgba(42, 153, 107, 0.5)'}`,
          }}
        />
      </div>
    </div>
  );
};







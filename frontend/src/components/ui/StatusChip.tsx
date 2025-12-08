import React from 'react';
import { colors, borderRadius, typography, spacing } from '../../theme/design-tokens';

interface StatusChipProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'trial' | 'success' | 'warning' | 'danger';
  label: string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const statusConfig = {
    active: {
      background: 'rgba(42, 153, 107, 0.2)',
      border: '1px solid rgba(42, 153, 107, 0.5)',
      color: colors.success.light,
      glow: 'rgba(42, 153, 107, 0.4)',
    },
    inactive: {
      background: 'rgba(165, 165, 165, 0.2)',
      border: '1px solid rgba(165, 165, 165, 0.3)',
      color: colors.text.muted,
      glow: 'transparent',
    },
    pending: {
      background: 'rgba(255, 169, 0, 0.2)',
      border: '1px solid rgba(255, 169, 0, 0.5)',
      color: colors.warning.light,
      glow: 'rgba(255, 169, 0, 0.4)',
    },
    completed: {
      background: 'rgba(0, 212, 255, 0.2)',
      border: '1px solid rgba(0, 212, 255, 0.5)',
      color: '#00D4FF',
      glow: 'rgba(0, 212, 255, 0.4)',
    },
    trial: {
      background: 'rgba(255, 169, 0, 0.2)',
      border: '1px solid rgba(255, 169, 0, 0.5)',
      color: colors.warning.light,
      glow: 'rgba(255, 169, 0, 0.4)',
    },
    success: {
      background: 'rgba(42, 153, 107, 0.2)',
      border: '1px solid rgba(42, 153, 107, 0.5)',
      color: colors.success.light,
      glow: 'rgba(42, 153, 107, 0.4)',
    },
    warning: {
      background: 'rgba(255, 169, 0, 0.2)',
      border: '1px solid rgba(255, 169, 0, 0.5)',
      color: colors.warning.light,
      glow: 'rgba(255, 169, 0, 0.4)',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      color: colors.danger.light,
      glow: 'rgba(239, 68, 68, 0.4)',
    },
  };

  const config = statusConfig[status];
  const sizeStyles = {
    sm: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.fontSize.xs,
    },
    md: {
      padding: `${spacing.xs} ${spacing.md}`,
      fontSize: typography.fontSize.sm,
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        borderRadius: borderRadius.full,
        background: config.background,
        border: config.border,
        color: config.color,
        fontWeight: typography.fontWeight.semibold,
        fontFamily: typography.fontFamily.primary,
        boxShadow: config.glow !== 'transparent' ? `0 0 8px ${config.glow}` : 'none',
        ...sizeStyles[size],
      }}
    >
      {config.glow !== 'transparent' && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: config.color,
            boxShadow: `0 0 6px ${config.glow}`,
          }}
        />
      )}
      {label}
    </span>
  );
};



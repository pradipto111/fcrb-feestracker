import React from 'react';
import { Card } from './Card';
import { colors, typography, spacing } from '../../theme/design-tokens';
import '../../styles/animations.css';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'primary',
}) => {
  const variantGradients: Record<string, string> = {
    primary: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
    accent: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.accent.dark} 100%)`,
    success: `linear-gradient(135deg, ${colors.success.main} 0%, ${colors.success.dark} 100%)`,
    warning: `linear-gradient(135deg, ${colors.warning.main} 0%, ${colors.warning.dark} 100%)`,
    danger: `linear-gradient(135deg, ${colors.danger.main} 0%, ${colors.danger.dark} 100%)`,
    info: `linear-gradient(135deg, ${colors.info.main} 0%, ${colors.info.dark} 100%)`,
  };

  return (
    <Card
      variant="elevated"
      style={{
        background: variantGradients[variant],
        color: colors.text.onPrimary,
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeIn 0.6s ease-out both',
      }}
    >
      {/* Space-themed background accent with animation */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing.md,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                ...typography.caption,
                opacity: 0.9,
                marginBottom: spacing.xs,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              {title}
            </div>
            <div
              style={{
                ...typography.display,
                fontSize: typography.fontSize['4xl'],
                fontWeight: typography.fontWeight.extrabold,
                lineHeight: 1,
                marginBottom: spacing.sm,
              }}
            >
              {value}
            </div>
            {subtitle && (
              <div
                style={{
                  ...typography.caption,
                  opacity: 0.8,
                  fontSize: typography.fontSize.xs,
                }}
              >
                {subtitle}
              </div>
            )}
            {trend && (
              <div
                style={{
                  marginTop: spacing.sm,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  opacity: 0.9,
                }}
              >
                <span>{trend.isPositive ? '↑' : '↓'}</span>{' '}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {icon && (
            <div
              style={{
                fontSize: '2.5rem',
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};


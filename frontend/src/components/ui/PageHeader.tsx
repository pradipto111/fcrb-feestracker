import React from 'react';
import { typography, spacing, colors } from '../../theme/design-tokens';
import '../../styles/animations.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  /**
   * `light`: for light surfaces (default; preserves existing behavior)
   * `dark`: for dark surfaces (student + homepage-like pages)
   */
  tone?: 'light' | 'dark';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  children,
  tone = 'light',
}) => {
  const titleColor = tone === 'dark' ? colors.text.primary : colors.text.inverted;
  const subtitleColor = tone === 'dark' ? colors.text.secondary : colors.text.muted;
  const titleShadow =
    tone === 'dark'
      ? '0 6px 30px rgba(0, 0, 0, 0.65)'
      : '0 2px 8px rgba(0, 0, 0, 0.5)';
  const subtitleShadow = tone === 'dark' ? '0 2px 18px rgba(0, 0, 0, 0.55)' : '0 1px 4px rgba(0, 0, 0, 0.5)';

  return (
    <div
      style={{
        marginBottom: spacing.xl,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: spacing.md,
      }}
    >
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h1
          style={{
            ...typography.h1,
            color: titleColor,
            marginBottom: subtitle ? spacing.sm : 0,
            textShadow: titleShadow,
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              ...typography.body,
              color: subtitleColor,
              margin: 0,
              textShadow: subtitleShadow,
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
};


import React from 'react';
import { typography, spacing, colors } from '../../theme/design-tokens';
import '../../styles/animations.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
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
            color: colors.text.inverted,
            marginBottom: subtitle ? spacing.sm : 0,
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              ...typography.body,
              color: colors.text.muted,
              margin: 0,
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
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


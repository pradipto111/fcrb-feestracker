/**
 * CardHeader - Consistent header for cards with title, description, and actions
 * Enforces: Clear hierarchy, proper spacing, action placement
 * 
 * Laws of UX: Serial Position Effect, Fitts's Law
 */
import React from 'react';
import { colors, spacing, typography } from '../../theme/design-tokens';

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  description,
  actions,
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        paddingBottom: spacing.md,
        borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        gap: spacing.md,
        ...style,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginBottom: description ? spacing.xs : 0,
            lineHeight: 1.4,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              ...typography.caption,
              color: colors.text.muted,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            flexShrink: 0,
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
};



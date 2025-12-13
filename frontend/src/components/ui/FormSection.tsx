/**
 * FormSection - Standardized form section with consistent spacing and grouping
 * Enforces: Label+input grouping, proper spacing, helper text, error handling
 * 
 * Laws of UX: Law of Proximity, Cognitive Load, Postel's Law
 */
import React from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/design-tokens';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  error?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  error,
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        marginBottom: spacing.xl,
        ...style,
      }}
    >
      {title && (
        <div style={{ marginBottom: spacing.md }}>
          <h3
            style={{
              ...typography.h5,
              color: colors.text.primary,
              marginBottom: description ? spacing.xs : 0,
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
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
        }}
      >
        {children}
      </div>
      {error && (
        <div
          style={{
            marginTop: spacing.sm,
            padding: spacing.sm,
            background: colors.danger.soft,
            border: `1px solid ${colors.danger.main}40`,
            borderRadius: borderRadius.md,
            color: colors.danger.main,
            ...typography.caption,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};



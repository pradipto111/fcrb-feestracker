/**
 * FormField - Standardized form field with label, input, helper text, and error
 * Enforces: Consistent spacing, clear labels, helpful errors, accessible structure
 * 
 * Laws of UX: Cognitive Load, Postel's Law, Fitts's Law
 */
import React from 'react';
import { colors, spacing, typography } from '../../theme/design-tokens';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  children,
  style,
  className,
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xs,
        ...style,
      }}
    >
      <label
        style={{
          ...typography.body,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: error ? colors.danger.main : colors.text.primary,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
        }}
      >
        {label}
        {required && (
          <span style={{ color: colors.danger.main }} aria-label="required">
            *
          </span>
        )}
      </label>
      {children}
      {helperText && !error && (
        <p
          style={{
            ...typography.caption,
            fontSize: typography.fontSize.xs,
            color: colors.text.muted,
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {helperText}
        </p>
      )}
      {error && (
        <p
          style={{
            ...typography.caption,
            fontSize: typography.fontSize.xs,
            color: colors.danger.main,
            margin: 0,
            lineHeight: 1.4,
          }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};



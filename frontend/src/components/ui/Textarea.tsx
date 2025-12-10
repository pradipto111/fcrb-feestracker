import React from 'react';
import { colors, borderRadius, spacing, typography } from '../../theme/design-tokens';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  style,
  ...props
}) => {
  const textareaStyle: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${spacing.md} ${spacing.lg}`, // 16px vertical, 24px horizontal
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text.primary,
    background: colors.surface.card,
    border: `1px solid ${error ? colors.danger.main : colors.border.medium}`,
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '100px',
    lineHeight: typography.lineHeight.normal,
    ...style,
  };

  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: spacing.md }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: spacing.sm,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            fontFamily: typography.fontFamily.primary,
          }}
        >
          {label}
        </label>
      )}
      <textarea
        {...props}
        style={{
          ...textareaStyle,
          ...(isFocused
            ? {
                borderColor: error ? colors.danger.main : colors.primary.main,
                boxShadow: `0 0 0 3px ${error ? colors.danger.soft : colors.primary.soft}`,
              }
            : {}),
        }}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      />
      {error && (
        <div
          style={{
            marginTop: spacing.xs,
            fontSize: typography.fontSize.sm,
            color: colors.danger.light,
            fontFamily: typography.fontFamily.primary,
          }}
        >
          {error}
        </div>
      )}
      {helperText && !error && (
        <div
          style={{
            marginTop: spacing.xs,
            fontSize: typography.fontSize.sm,
            color: colors.text.muted,
            fontFamily: typography.fontFamily.primary,
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};


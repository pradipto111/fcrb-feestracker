import React from 'react';
import { colors, borderRadius, spacing, typography } from '../../theme/design-tokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  style,
  ...props
}) => {
  const inputStyle: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: `${spacing.md} ${spacing.lg}`, // 16px vertical, 24px horizontal - proper spacing from borders
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text.primary,
    background: colors.surface.card, // Visible background
    border: `1px solid ${error ? colors.danger.main : 'rgba(255, 255, 255, 0.2)'}`, // Visible border
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box', // Ensure padding is included in width
    lineHeight: typography.lineHeight.normal, // Proper line height for text
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
      <input
        {...props}
        style={{
          ...inputStyle,
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


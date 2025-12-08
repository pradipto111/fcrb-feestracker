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
    padding: `${spacing.md} ${spacing.lg}`,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text.inverted,
    background: 'rgba(255, 255, 255, 0.1)',
    border: `2px solid ${error ? colors.danger.main : 'rgba(255, 255, 255, 0.2)'}`,
    borderRadius: borderRadius.lg,
    outline: 'none',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
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
            color: colors.text.inverted,
            fontFamily: typography.fontFamily.primary,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
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
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
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
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  );
};


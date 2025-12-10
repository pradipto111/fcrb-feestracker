import React from 'react';
import { colors, borderRadius, spacing, typography } from '../../theme/design-tokens';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options?: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  options,
  children,
  style,
  ...props
}) => {
  const selectStyle: React.CSSProperties = {
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
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23${colors.text.primary.replace('#', '')}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${spacing.md} center`,
    paddingRight: spacing.xl, // Extra padding for dropdown arrow
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
      <select
        {...props}
        style={{
          ...selectStyle,
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
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
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


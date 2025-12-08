import React from 'react';
import { colors, borderRadius, shadows, transitions, typography, spacing } from '../../theme/design-tokens';
import '../../styles/animations.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'utility' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    border: 'none',
    borderRadius: borderRadius.lg,
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: transitions.fast,
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      minHeight: '32px',
    },
    md: {
      padding: '12px 24px',
      fontSize: '1rem',
      minHeight: '40px',
    },
    lg: {
      padding: '16px 32px',
      fontSize: '1.125rem',
      minHeight: '48px',
    },
  };

  // STRICT 4-Button System (RealVerse Specification)
  const variantStyles: Record<string, React.CSSProperties> = {
    // 1. PRIMARY ACTION - Only one per section, gradient (Cyan → Blue or Orange → Yellow) with glow
    primary: {
      background: `linear-gradient(135deg, #00E6FF 0%, ${colors.primary.main} 100%)`,
      color: colors.text.onPrimary,
      boxShadow: `0 4px 20px rgba(0, 230, 255, 0.4), ${shadows.md}`,
      border: 'none',
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700,
      borderRadius: borderRadius.lg,
    },
    // 2. SECONDARY ACTION - Dark fill or transparent, neon outline on hover
    secondary: {
      background: colors.surface.card,
      color: colors.text.primary,
      border: `2px solid rgba(0, 230, 255, 0.3)`,
      boxShadow: shadows.sm,
      backdropFilter: 'blur(10px)',
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
    },
    // 3. UTILITY ACTION - Small, icon + label, low-contrast background
    utility: {
      background: 'rgba(255, 255, 255, 0.05)',
      color: colors.text.muted,
      border: `1px solid rgba(255, 255, 255, 0.1)`,
      boxShadow: 'none',
      fontSize: typography.fontSize.sm,
      padding: `${spacing.xs} ${spacing.sm}`,
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
    },
    // 4. DANGER - Outline by default, filled red on hover
    danger: {
      background: 'transparent',
      color: colors.danger.main,
      border: `2px solid rgba(239, 68, 68, 0.3)`,
      boxShadow: 'none',
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: {
      transform: 'translateY(-1px) scale(1.02)',
      boxShadow: `0 0 18px rgba(0, 230, 255, 0.4), 0 6px 30px rgba(0, 230, 255, 0.6)`,
    },
    secondary: {
      borderColor: 'rgba(0, 230, 255, 0.6)',
      boxShadow: `0 0 15px rgba(0, 230, 255, 0.3), ${shadows.md}`,
      color: '#CDE7FF',
    },
    utility: {
      background: 'rgba(255, 255, 255, 0.08)',
      color: colors.text.secondary,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    danger: {
      background: colors.danger.main,
      borderColor: colors.danger.main,
      color: colors.text.onPrimary,
      boxShadow: `0 4px 20px rgba(239, 68, 68, 0.4)`,
      transform: 'translateY(-1px)',
    },
  };

  const disabledStyles: React.CSSProperties = {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const combinedStyle: React.CSSProperties = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(props.disabled ? disabledStyles : {}),
    ...(isHovered && !props.disabled ? hoverStyles[variant] : {}),
    ...(fullWidth ? { width: '100%' } : {}),
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && !props.disabled) {
      e.currentTarget.style.transform = 'scale(0.96)';
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary' && !props.disabled) {
      setTimeout(() => {
        e.currentTarget.style.transform = isHovered ? 'translateY(-1px) scale(1.02)' : 'scale(1)';
      }, 100);
    }
  };

  return (
    <button
      {...props}
      className={variant === 'primary' ? 'rv-btn-primary' : undefined}
      style={combinedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </button>
  );
};


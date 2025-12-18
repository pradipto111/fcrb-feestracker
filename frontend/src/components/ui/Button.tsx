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
    gap: spacing.sm, // 8px
    fontFamily: typography.fontFamily.primary,
    fontWeight: 700, // Bold for sports feel
    border: 'none',
    borderRadius: borderRadius.button, // 8px - sports badge feel
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // Smooth sports feel
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    // Ensure text is centered, never touching borders
    textAlign: 'center',
    whiteSpace: 'nowrap',
    ...style,
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      fontSize: '0.875rem',
      minHeight: '36px', // Increased tap area
      // Padding handled in variantStyles
    },
    md: {
      fontSize: '1rem',
      minHeight: '44px', // Increased tap area
      // Padding handled in variantStyles
    },
    lg: {
      fontSize: '1.125rem',
      minHeight: '52px', // Increased tap area
      // Padding handled in variantStyles
    },
  };

  // Football Club Button System - Solid, Bold, Sports-Badge Feel
  const variantStyles: Record<string, React.CSSProperties> = {
    // 1. PRIMARY ACTION - Football gradient (Royal Blue → Gold), sports badge feel
    primary: {
      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`, // Football-first gradient
      color: colors.text.onPrimary,
      boxShadow: shadows.button, // Sports broadcast style
      border: 'none',
      fontFamily: typography.fontFamily.heading, // Bold football typography
      fontWeight: typography.fontWeight.bold, // 700 - Bold
      borderRadius: borderRadius.button, // 8px - football-first
      // Ensure text is centered, never touching borders (minimum 16px padding)
      padding: size === 'sm' ? `${spacing['10']} ${spacing['20']}` : size === 'md' ? `${spacing.md} ${spacing['28']}` : `${spacing['18']} ${spacing['36']}`,
    },
    // 2. SECONDARY ACTION - Outline with subtle drop-shadow, football-first
    secondary: {
      background: 'transparent', // Transparent background
      color: colors.accent.main, // FC Real Bengaluru gold text
      border: `2px solid ${colors.accent.main}`, // Gold border
      boxShadow: shadows.button, // Sports broadcast style
      fontFamily: typography.fontFamily.heading, // Bold football typography
      fontWeight: typography.fontWeight.bold, // 700 - Bold
      borderRadius: borderRadius.button, // 8px - football-first
      padding: size === 'sm' ? `${spacing['10']} ${spacing['20']}` : size === 'md' ? `${spacing.md} ${spacing['28']}` : `${spacing['18']} ${spacing['36']}`,
    },
    // 3. UTILITY ACTION - Outline style, low-contrast
    utility: {
      background: 'transparent',
      color: colors.text.secondary,
      border: `2px solid rgba(255, 255, 255, 0.2)`,
      boxShadow: 'none',
      fontSize: typography.fontSize.sm,
      padding: `${spacing.sm} ${spacing.md}`,
      fontFamily: typography.fontFamily.primary,
      fontWeight: 600,
      borderRadius: borderRadius.button,
    },
    // 4. DANGER - Outline by default, filled red on hover
    danger: {
      background: 'transparent',
      color: colors.danger.main,
      border: `2px solid ${colors.danger.main}`,
      boxShadow: 'none',
      fontFamily: typography.fontFamily.primary,
      fontWeight: 700,
      borderRadius: borderRadius.button,
    },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: {
      transform: 'translateY(-2px)',
      boxShadow: shadows.buttonHover, // Sports broadcast hover shadow
      background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.accent.light} 100%)`, // Lighter gradient on hover
    },
    secondary: {
      transform: 'translateY(-2px)',
      boxShadow: shadows.buttonHover, // Sports broadcast hover shadow
      background: colors.accent.soft, // Subtle gold background on hover
      border: `2px solid ${colors.accent.light}`, // Lighter gold border
    },
    utility: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: colors.text.primary,
      border: `2px solid rgba(255, 255, 255, 0.3)`,
    },
    danger: {
      background: colors.danger.main,
      border: `2px solid ${colors.danger.main}`,
      color: colors.text.onPrimary,
      boxShadow: shadows.buttonHover,
      transform: 'translateY(-2px)',
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
      const target = e.currentTarget;
      setTimeout(() => {
        // Check if element still exists before accessing style
        if (target && target.style) {
          target.style.transform = isHovered ? 'translateY(-1px) scale(1.02)' : 'scale(1)';
        }
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


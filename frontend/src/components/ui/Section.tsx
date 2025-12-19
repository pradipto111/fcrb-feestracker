/**
 * Section - Content section with consistent spacing and chunking
 * Enforces: Clear visual separation, consistent margins, chunked content
 * 
 * Laws of UX: Chunking, Law of Proximity, Miller's Law
 */
import React from 'react';
import { colors, spacing, borderRadius } from '../../theme/design-tokens';
import { glass } from '../../theme/glass';

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated' | 'subtle';
  style?: React.CSSProperties;
  className?: string;
  id?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  description,
  variant = 'default',
  style,
  className,
  id,
}) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'transparent',
      padding: 0,
    },
    elevated: {
      ...glass.panel,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
    },
    subtle: {
      ...glass.inset,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
  };

  return (
    <section
      id={id}
      className={className}
      style={{
        marginBottom: spacing.xl,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {variant !== 'default' && (
        <div
          aria-hidden="true"
          style={variant === 'subtle' ? glass.overlaySoft : glass.overlay}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      {(title || description) && (
        <div style={{ marginBottom: spacing.lg }}>
          {title && (
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: spacing.xs,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h2>
          )}
          {description && (
            <p
              style={{
                fontSize: '0.875rem',
                color: colors.text.muted,
                lineHeight: 1.6,
                maxWidth: '75ch', // Readability: 60-75ch for body text
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}
      {children}
      </div>
    </section>
  );
};



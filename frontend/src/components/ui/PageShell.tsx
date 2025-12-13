/**
 * PageShell - Global page container with consistent padding
 * Enforces: No text touching borders, responsive padding, max-width for readability
 * 
 * Laws of UX: Aesthetic-Usability Effect, Law of Proximity
 */
import React from 'react';
import { colors, spacing } from '../../theme/design-tokens';

interface PageShellProps {
  children: React.ReactNode;
  maxWidth?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  children,
  maxWidth = '1400px',
  style,
  className,
}) => {
  return (
    <div
      className={`page-shell ${className || ''}`}
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: `${spacing.md} ${spacing.md}`, // 16px mobile (default)
        background: colors.surface.bg,
        minHeight: '100vh',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .page-shell {
            padding: ${spacing.lg} ${spacing.lg} !important; /* 24px tablet */
          }
        }
        @media (min-width: 1024px) {
          .page-shell {
            padding: ${spacing.xl} ${spacing.xl} !important; /* 32px desktop */
          }
        }
      `}</style>
      {children}
    </div>
  );
};


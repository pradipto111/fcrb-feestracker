/**
 * CardBody - Content area for cards with consistent padding
 * Enforces: No text touching borders, readable line length
 * 
 * Laws of UX: Aesthetic-Usability Effect
 */
import React from 'react';
import { spacing } from '../../theme/design-tokens';

interface CardBodyProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  padding = 'md',
  style,
  className,
}) => {
  const paddingMap = {
    none: '0',
    sm: spacing.sm, // 8px mobile, 12px desktop
    md: spacing.md, // 16px mobile, 20px desktop
    lg: spacing.lg, // 24px mobile, 32px desktop
  };

  return (
    <div
      className={className}
      style={{
        padding: paddingMap[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
};



/**
 * DataTableCard - Standardized table container with header, body, and footer
 * Enforces: Tables always in padded cards, consistent structure, empty states
 * 
 * Laws of UX: Aesthetic-Usability Effect, Chunking, Jakob's Law
 */
import React from 'react';
import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { colors, spacing, typography } from '../../theme/design-tokens';

interface DataTableCardProps {
  title: string;
  description?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;
  isEmpty?: boolean;
  loading?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const DataTableCard: React.FC<DataTableCardProps> = ({
  title,
  description,
  filters,
  actions,
  children,
  footer,
  emptyState,
  isEmpty = false,
  loading = false,
  style,
  className,
}) => {
  return (
    <Card variant="elevated" padding="none" style={style} className={className}>
      <CardHeader
        title={title}
        description={description}
        actions={
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            {filters}
            {actions}
          </div>
        }
      />
      <CardBody padding="md">
        {loading ? (
          <div
            style={{
              padding: spacing.xl,
              textAlign: 'center',
              color: colors.text.muted,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: `3px solid ${colors.surface.soft}`,
                borderTopColor: colors.primary.main,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ marginTop: spacing.md, ...typography.body }}>
              Loading...
            </p>
          </div>
        ) : isEmpty ? (
          emptyState || (
            <div
              style={{
                padding: spacing['2xl'],
                textAlign: 'center',
                color: colors.text.muted,
              }}
            >
              <p style={{ ...typography.body }}>No data available</p>
            </div>
          )
        ) : (
          <div
            style={{
              overflowX: 'auto',
              // Ensure table has padding
              padding: spacing.xs,
              margin: `-${spacing.xs}`,
            }}
          >
            {children}
          </div>
        )}
      </CardBody>
      {footer && (
        <div
          style={{
            padding: spacing.md,
            borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
            background: colors.surface.soft,
          }}
        >
          {footer}
        </div>
      )}
    </Card>
  );
};



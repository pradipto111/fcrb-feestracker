import React from 'react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';

export interface PlayerHeaderCardProps {
  name: string;
  avatar?: string;
  ageGroup?: string;
  centre?: string;
  primaryPosition?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  team?: string;
  onViewPublicProfile?: () => void;
}

export const PlayerHeaderCard: React.FC<PlayerHeaderCardProps> = ({
  name,
  avatar,
  ageGroup,
  centre,
  primaryPosition,
  preferredFoot,
  team,
  onViewPublicProfile,
}) => {
  return (
    <Card variant="elevated" padding="lg" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, ${colors.primary.main}20 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: spacing.xl, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: borderRadius.full,
            background: colors.surface.soft,
            border: `3px solid ${colors.primary.main}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: shadows.md,
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                ...typography.display,
                fontSize: '3rem',
                color: colors.primary.main,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {name && name.length > 0 ? name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing.sm,
              marginTop: 0,
            }}
          >
            {name}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.md,
              marginBottom: spacing.md,
            }}
          >
            {primaryPosition && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  ...typography.body,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M6 10h8M10 6v8" />
                </svg>
                {primaryPosition}
              </div>
            )}

            {ageGroup && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  ...typography.body,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="14" height="14" rx="2" />
                  <path d="M16 2v4M4 2v4M3 10h14" />
                </svg>
                {ageGroup}
              </div>
            )}

            {centre && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  ...typography.body,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 2C6 2 3 5 3 9c0 4 7 8 7 8s7-4 7-8c0-4-3-7-7-7z" />
                  <circle cx="10" cy="9" r="2.5" />
                </svg>
                {centre}
              </div>
            )}

            {preferredFoot && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  ...typography.body,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 2L3 8h4v8h6V8h4L10 2z" />
                </svg>
                {preferredFoot}
              </div>
            )}

            {team && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs,
                  ...typography.body,
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                {team}
              </div>
            )}
          </div>

          {onViewPublicProfile && (
            <button
              onClick={onViewPublicProfile}
              style={{
                background: 'transparent',
                border: `1px solid ${colors.primary.main}`,
                borderRadius: borderRadius.md,
                padding: `${spacing.sm} ${spacing.md}`,
                color: colors.primary.main,
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontFamily: typography.fontFamily.primary,
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing.xs,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.primary.soft;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              View Public Profile
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};


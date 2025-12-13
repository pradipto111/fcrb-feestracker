import React from 'react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, borderRadius } from '../../theme/design-tokens';
import { Card } from '../ui/Card';

export interface PositionSuitability {
  position: string;
  suitability: number; // 0-100
  comment?: string;
}

export interface PositionSuitabilityGridProps {
  positions: PositionSuitability[];
  editable?: boolean;
  onPositionChange?: (position: string, suitability: number) => void;
  onCommentClick?: (position: string) => void;
}

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeeper',
  CB: 'Centre Back',
  FB: 'Full Back',
  WB: 'Wing Back',
  DM: 'Defensive Mid',
  CM: 'Central Mid',
  AM: 'Attacking Mid',
  W: 'Winger',
  ST: 'Striker',
};

const POSITION_ORDER = ['GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'W', 'ST'];

export const PositionSuitabilityGrid: React.FC<PositionSuitabilityGridProps> = ({
  positions,
  editable = false,
  onPositionChange,
  onCommentClick,
}) => {
  const positionMap = new Map(positions.map(p => [p.position, p]));

  const getSuitabilityColor = (value: number) => {
    if (value >= 80) return colors.success.main;
    if (value >= 60) return colors.accent.main;
    if (value >= 40) return colors.warning.main;
    return colors.danger.main;
  };

  return (
    <Card variant="default" padding="lg">
      <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.lg }}>
        Position Suitability
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing.md,
        }}
      >
        {POSITION_ORDER.map((posKey) => {
          const position = positionMap.get(posKey) || { position: posKey, suitability: 0 };
          const color = getSuitabilityColor(position.suitability);

          return (
            <motion.div
              key={posKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                padding: spacing.md,
                background: colors.surface.soft,
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.surface.card}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <div>
                  <div
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    {POSITION_LABELS[posKey] || posKey}
                  </div>
                  {position.comment && (
                    <div
                      style={{
                        ...typography.caption,
                        fontSize: typography.fontSize.xs,
                        color: colors.text.muted,
                        marginTop: spacing.xs / 2,
                      }}
                    >
                      {position.comment}
                    </div>
                  )}
                </div>
                {onCommentClick && (
                  <button
                    onClick={() => onCommentClick(posKey)}
                    style={{
                      background: position.comment ? colors.accent.soft : 'transparent',
                      border: `1px solid ${position.comment ? colors.accent.main : colors.surface.card}`,
                      borderRadius: borderRadius.sm,
                      padding: spacing.xs,
                      cursor: 'pointer',
                      color: position.comment ? colors.accent.main : colors.text.muted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                    }}
                    title={position.comment || 'Add comment'}
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h14v12l-4-4H3V3z" />
                    </svg>
                  </button>
                )}
              </div>

              <div style={{ marginBottom: spacing.xs }}>
                <div
                  style={{
                    height: '8px',
                    background: colors.surface.dark,
                    borderRadius: borderRadius.full,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${position.suitability}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: color,
                      borderRadius: borderRadius.full,
                      boxShadow: `0 0 8px ${color}40`,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: color,
                  }}
                >
                  {position.suitability}
                </div>
                {editable && (
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={position.suitability}
                    onChange={(e) => onPositionChange?.(posKey, parseInt(e.target.value, 10))}
                    style={{
                      width: '100px',
                      cursor: 'pointer',
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};



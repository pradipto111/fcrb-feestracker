/**
 * Calibration Hint Component
 * 
 * Shows contextual averages and gentle suggestions when coaches enter metric values.
 * Non-blocking, supportive, and informative.
 */

import React from 'react';
import { colors, typography, spacing, borderRadius } from '../../theme/design-tokens';

export interface CalibrationHintData {
  metricKey: string;
  enteredValue: number;
  clubAverage?: number;
  centerAverage?: number;
  positionAverage?: number;
  ageGroupAverage?: number;
  percentile?: number;
  isExtreme?: boolean;
  suggestion?: string;
}

interface CalibrationHintProps {
  hint: CalibrationHintData | null;
  show?: boolean;
}

export const CalibrationHint: React.FC<CalibrationHintProps> = ({ hint, show = true }) => {
  if (!hint || !show) return null;

  const getPercentileLabel = (percentile?: number) => {
    if (!percentile) return null;
    if (percentile >= 95) return 'Top 5%';
    if (percentile >= 90) return 'Top 10%';
    if (percentile >= 75) return 'Top 25%';
    if (percentile <= 5) return 'Bottom 5%';
    if (percentile <= 10) return 'Bottom 10%';
    if (percentile <= 25) return 'Bottom 25%';
    return null;
  };

  const percentileLabel = getPercentileLabel(hint.percentile);

  return (
    <div
      style={{
        marginTop: spacing.sm,
        padding: spacing.sm,
        background: hint.isExtreme ? colors.warning?.soft || colors.accent.soft : colors.surface.soft,
        border: `1px solid ${hint.isExtreme ? colors.warning?.main || colors.accent.main : colors.surface.card}`,
        borderRadius: borderRadius.md,
        ...typography.caption,
        fontSize: typography.fontSize.xs,
      }}
    >
      {/* Contextual Averages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs, marginBottom: hint.suggestion ? spacing.xs : 0 }}>
        {hint.clubAverage !== undefined && (
          <div style={{ color: colors.text.secondary }}>
            Club average: <strong style={{ color: colors.text.primary }}>{hint.clubAverage.toFixed(0)}</strong>
          </div>
        )}
        {hint.centerAverage !== undefined && (
          <div style={{ color: colors.text.secondary }}>
            Centre average: <strong style={{ color: colors.text.primary }}>{hint.centerAverage.toFixed(0)}</strong>
          </div>
        )}
        {hint.positionAverage !== undefined && (
          <div style={{ color: colors.text.secondary }}>
            Position average: <strong style={{ color: colors.text.primary }}>{hint.positionAverage.toFixed(0)}</strong>
          </div>
        )}
        {percentileLabel && (
          <div style={{ color: colors.primary.main, fontWeight: typography.fontWeight.semibold }}>
            {percentileLabel} for this metric
          </div>
        )}
      </div>

      {/* Gentle Suggestion */}
      {hint.suggestion && (
        <div
          style={{
            marginTop: spacing.xs,
            paddingTop: spacing.xs,
            borderTop: `1px solid ${colors.surface.card}`,
            color: colors.text.secondary,
            fontStyle: 'italic',
          }}
        >
          💡 {hint.suggestion}
        </div>
      )}
    </div>
  );
};



import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { colors, typography, spacing, borderRadius } from '../../theme/design-tokens';
import { Tooltip } from '../ui/Tooltip';
import { CalibrationHint, CalibrationHintData } from './CalibrationHint';

export interface MetricBarRowProps {
  name: string;
  value: number; // 0-100
  delta?: number; // Change since last snapshot (+/-)
  tooltip?: string;
  definition?: string;
  editable?: boolean;
  onValueChange?: (value: number) => void;
  onCommentClick?: () => void;
  comment?: string;
  confidence?: number; // 0-100
  showDelta?: boolean;
  category?: string;
  metricKey?: string; // For calibration hints
  calibrationHint?: CalibrationHintData | null; // Calibration context
}

export const MetricBarRow: React.FC<MetricBarRowProps> = ({
  name,
  value,
  delta,
  tooltip,
  definition,
  editable = false,
  onValueChange,
  onCommentClick,
  comment,
  confidence,
  showDelta = true,
  category,
  metricKey,
  calibrationHint,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const getValueColor = (val: number) => {
    if (val >= 80) return colors.success.main;
    if (val >= 60) return colors.accent.main;
    if (val >= 40) return colors.warning.main;
    return colors.danger.main;
  };

  const getDeltaColor = (delta?: number) => {
    if (!delta) return colors.text.muted;
    if (delta > 0) return colors.success.main;
    if (delta < 0) return colors.danger.main;
    return colors.text.muted;
  };

  const handleSave = () => {
    const numValue = parseInt(editValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      onValueChange?.(numValue);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value.toString());
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: `${spacing.sm} ${spacing.md}`,
        borderRadius: borderRadius.md,
        background: colors.surface.soft,
        marginBottom: spacing.xs,
        position: 'relative',
      }}
    >
      {/* Metric Name */}
      <div style={{ minWidth: '140px', flexShrink: 0 }}>
        <div
          style={{
            ...typography.body,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing.xs / 2,
          }}
        >
          {name}
        </div>
        {category && (
          <div
            style={{
              ...typography.caption,
              fontSize: typography.fontSize.xs,
              color: colors.text.muted,
            }}
          >
            {category}
          </div>
        )}
      </div>

      {/* Value Bar */}
      <div style={{ flex: 1, position: 'relative' }}>
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
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${getValueColor(value)} 0%, ${getValueColor(value)}CC 100%)`,
              borderRadius: borderRadius.full,
              boxShadow: `0 0 8px ${getValueColor(value)}40`,
            }}
          />
          {confidence !== undefined && confidence < 70 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 4px,
                  rgba(255, 255, 255, 0.1) 4px,
                  rgba(255, 255, 255, 0.1) 8px
                )`,
                pointerEvents: 'none',
              }}
              title={`Low confidence: ${confidence}%`}
            />
          )}
        </div>
      </div>

      {/* Value Display / Edit */}
      <div style={{ minWidth: '80px', display: 'flex', alignItems: 'center', gap: spacing.xs }}>
        {isEditing && editable ? (
          <input
            type="number"
            min="0"
            max="100"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyPress}
            autoFocus
            style={{
              width: '60px',
              padding: `${spacing.xs} ${spacing.sm}`,
              background: colors.surface.card,
              border: `1px solid ${colors.primary.main}`,
              borderRadius: borderRadius.sm,
              color: colors.text.primary,
              fontSize: typography.fontSize.sm,
              fontFamily: typography.fontFamily.primary,
              textAlign: 'center',
            }}
          />
        ) : (
          <div
            style={{
              ...typography.body,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              color: getValueColor(value),
              minWidth: '40px',
              textAlign: 'right',
              cursor: editable ? 'pointer' : 'default',
            }}
            onClick={() => editable && setIsEditing(true)}
            title={editable ? 'Click to edit' : undefined}
          >
            {value}
          </div>
        )}

        {/* Delta */}
        {showDelta && delta !== undefined && delta !== 0 && (
          <div
            style={{
              ...typography.caption,
              fontSize: typography.fontSize.xs,
              color: getDeltaColor(delta),
              fontWeight: typography.fontWeight.semibold,
              minWidth: '32px',
              textAlign: 'right',
            }}
          >
            {delta > 0 ? '+' : ''}{delta}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: spacing.xs, alignItems: 'center' }}>
        {onCommentClick && (
          <button
            onClick={onCommentClick}
            style={{
              background: comment ? colors.accent.soft : 'transparent',
              border: `1px solid ${comment ? colors.accent.main : colors.surface.card}`,
              borderRadius: borderRadius.sm,
              padding: spacing.xs,
              cursor: 'pointer',
              color: comment ? colors.accent.main : colors.text.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
            }}
            title={comment || 'Add comment'}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h14v12l-4-4H3V3z" />
              <path d="M7 7h6M7 10h4" />
            </svg>
          </button>
        )}

        {(tooltip || definition) && (
          <Tooltip content={definition || tooltip || ''}>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: borderRadius.sm,
                padding: spacing.xs,
                cursor: 'help',
                color: colors.text.muted,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v4M10 14h.01" />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>
    </motion.div>
  );
};


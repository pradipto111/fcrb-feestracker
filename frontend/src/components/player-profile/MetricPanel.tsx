import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, typography, spacing, borderRadius } from '../../theme/design-tokens';
import { Card } from '../ui/Card';
import { MetricBarRow, MetricBarRowProps } from './MetricBarRow';

export interface MetricPanelProps {
  title: string;
  metrics: Array<MetricBarRowProps & { id: string }>;
  showDelta?: boolean;
  editable?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  searchable?: boolean;
  onMetricChange?: (metricId: string, value: number) => void;
  onCommentClick?: (metricId: string) => void;
  calibrationHints?: Record<string, any>; // Map of metricKey -> CalibrationHintData
}

export const MetricPanel: React.FC<MetricPanelProps> = ({
  title,
  metrics,
  showDelta = true,
  editable = false,
  collapsible = true,
  defaultCollapsed = false,
  searchable = false,
  onMetricChange,
  onCommentClick,
  calibrationHints = {},
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMetrics = searchable
    ? metrics.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : metrics;

  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    // Sort by value descending
    return b.value - a.value;
  });

  return (
    <Card variant="default" padding="none" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: spacing.lg,
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1 }}>
          <h3 style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{title}</h3>
          <div
            style={{
              ...typography.caption,
              color: colors.text.muted,
              padding: `${spacing.xs} ${spacing.sm}`,
              background: colors.surface.soft,
              borderRadius: borderRadius.md,
            }}
          >
            {metrics.length} metrics
          </div>
        </div>

        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.text.muted,
              cursor: 'pointer',
              padding: spacing.xs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M5 7l5 5 5-5" />
            </motion.svg>
          </button>
        )}
      </div>

      {/* Search */}
      {searchable && !isCollapsed && (
        <div style={{ padding: `${spacing.md} ${spacing.lg}`, borderBottom: `1px solid rgba(255, 255, 255, 0.1)` }}>
          <input
            type="text"
            placeholder="Search metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: `${spacing.sm} ${spacing.md}`,
              background: colors.surface.soft,
              border: `1px solid ${colors.surface.card}`,
              borderRadius: borderRadius.md,
              color: colors.text.primary,
              fontSize: typography.fontSize.sm,
              fontFamily: typography.fontFamily.primary,
            }}
          />
        </div>
      )}

      {/* Metrics List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: spacing.md }}>
              {sortedMetrics.length > 0 ? (
                <div>
                  {sortedMetrics.map((metric) => (
                    <MetricBarRow
                      key={metric.id}
                      {...metric}
                      showDelta={showDelta}
                      editable={editable}
                      onValueChange={(value) => onMetricChange?.(metric.id, value)}
                      onCommentClick={() => onCommentClick?.(metric.id)}
                      metricKey={metric.id}
                      calibrationHint={calibrationHints[metric.id] || null}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: spacing.xl,
                    textAlign: 'center',
                    color: colors.text.muted,
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {searchQuery ? 'No metrics found' : 'No metrics available'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};


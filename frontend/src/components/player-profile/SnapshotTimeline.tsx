import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { SnapshotCompareModal } from './SnapshotCompareModal';

export interface SnapshotTimelineItem {
  id: number;
  createdAt: string;
  createdBy: {
    fullName: string;
  };
  sourceContext: string;
  notes?: string;
  readiness?: {
    overall: number;
  };
}

export interface SnapshotTimelineProps {
  snapshots: SnapshotTimelineItem[];
  onSnapshotClick?: (snapshotId: number) => void;
  onCompareClick?: (snapshotId1: number, snapshotId2: number) => void;
}

const CONTEXT_LABELS: Record<string, string> = {
  MONTHLY_REVIEW: 'Monthly Review',
  TRAINING_BLOCK: 'Training Block',
  MATCH_BLOCK: 'Match Block',
  TRIAL: 'Trial',
};

const CONTEXT_COLORS: Record<string, string> = {
  MONTHLY_REVIEW: colors.primary.main,
  TRAINING_BLOCK: colors.accent.main,
  MATCH_BLOCK: colors.success.main,
  TRIAL: colors.warning.main,
};

export const SnapshotTimeline: React.FC<SnapshotTimelineProps> = ({
  snapshots,
  onSnapshotClick,
  onCompareClick,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(null);
  const [compareSnapshot1, setCompareSnapshot1] = useState<number | null>(null);
  const [compareSnapshot2, setCompareSnapshot2] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCompare = (snapshotId: number) => {
    if (!compareSnapshot1) {
      setCompareSnapshot1(snapshotId);
    } else if (!compareSnapshot2 && compareSnapshot1 !== snapshotId) {
      setCompareSnapshot2(snapshotId);
      onCompareClick?.(compareSnapshot1, snapshotId);
    } else {
      setCompareSnapshot1(snapshotId);
      setCompareSnapshot2(null);
    }
  };

  if (snapshots.length === 0) {
    return (
      <Card variant="default" padding="lg">
        <div style={{ textAlign: 'center', color: colors.text.muted, padding: spacing.xl }}>
          <div style={{ fontSize: '3rem', marginBottom: spacing.md }}>📊</div>
          <div style={{ ...typography.body, marginBottom: spacing.sm }}>No snapshots yet</div>
          <div style={{ ...typography.caption, color: colors.text.muted }}>
            Create your first snapshot to start tracking progress
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card variant="default" padding="lg">
        <div style={{ marginBottom: spacing.lg }}>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
            Snapshot Timeline
          </h3>
          <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
            View all snapshots and compare changes over time
          </p>
        </div>

        <div style={{ position: 'relative', paddingLeft: spacing.xl }}>
          {/* Timeline line */}
          <div
            style={{
              position: 'absolute',
              left: spacing.lg,
              top: 0,
              bottom: 0,
              width: '2px',
              background: colors.surface.soft,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {snapshots.map((snapshot, idx) => (
              <motion.div
                key={snapshot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{ position: 'relative', paddingLeft: spacing.xl }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: spacing.md - 6,
                    top: spacing.md,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: CONTEXT_COLORS[snapshot.sourceContext] || colors.primary.main,
                    border: `2px solid ${colors.surface.section}`,
                    zIndex: 1,
                  }}
                />

                <Card
                  variant="outlined"
                  padding="md"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    setSelectedSnapshot(snapshot.id);
                    onSnapshotClick?.(snapshot.id);
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                        <div
                          style={{
                            padding: `${spacing.xs} ${spacing.sm}`,
                            background: `${CONTEXT_COLORS[snapshot.sourceContext] || colors.primary.main}20`,
                            borderRadius: borderRadius.sm,
                            ...typography.caption,
                            color: CONTEXT_COLORS[snapshot.sourceContext] || colors.primary.main,
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.semibold,
                          }}
                        >
                          {CONTEXT_LABELS[snapshot.sourceContext] || snapshot.sourceContext}
                        </div>
                        {snapshot.readiness && (
                          <div
                            style={{
                              ...typography.body,
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.semibold,
                              color: snapshot.readiness.overall >= 75 ? colors.success.main : 
                                     snapshot.readiness.overall >= 60 ? colors.accent.main : colors.text.muted,
                            }}
                          >
                            Readiness: {snapshot.readiness.overall}
                          </div>
                        )}
                      </div>
                      <div style={{ ...typography.body, fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing.xs }}>
                        {formatDate(snapshot.createdAt)}
                      </div>
                      <div style={{ ...typography.caption, color: colors.text.muted }}>
                        by {snapshot.createdBy.fullName}
                      </div>
                      {snapshot.notes && (
                        <div
                          style={{
                            marginTop: spacing.sm,
                            padding: spacing.sm,
                            background: colors.surface.soft,
                            borderRadius: borderRadius.md,
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            color: colors.text.secondary,
                          }}
                        >
                          {snapshot.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: spacing.xs }}>
                      <Button
                        variant="utility"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompare(snapshot.id);
                        }}
                        style={{
                          background: compareSnapshot1 === snapshot.id || compareSnapshot2 === snapshot.id
                            ? colors.primary.soft
                            : 'transparent',
                        }}
                      >
                        {compareSnapshot1 === snapshot.id ? '1st' : compareSnapshot2 === snapshot.id ? '2nd' : 'Compare'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {compareSnapshot1 && compareSnapshot2 && (
          <div style={{ marginTop: spacing.lg, padding: spacing.md, background: colors.primary.soft, borderRadius: borderRadius.md }}>
            <div style={{ ...typography.body, color: colors.primary.main, marginBottom: spacing.sm }}>
              Comparing snapshots {compareSnapshot1} and {compareSnapshot2}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onCompareClick?.(compareSnapshot1, compareSnapshot2);
              }}
            >
              View Comparison
            </Button>
          </div>
        )}
      </Card>

      {selectedSnapshot && (
        <SnapshotCompareModal
          snapshotId1={selectedSnapshot}
          snapshotId2={snapshots[0]?.id}
          onClose={() => setSelectedSnapshot(null)}
        />
      )}
    </>
  );
};



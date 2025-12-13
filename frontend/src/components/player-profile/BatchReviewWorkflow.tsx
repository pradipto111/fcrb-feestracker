import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SnapshotEditor, MetricSourceContext } from './SnapshotEditor';

export interface BatchReviewWorkflowProps {
  centerId?: number;
  context: MetricSourceContext;
  onComplete?: () => void;
}

interface ReviewQueueItem {
  studentId: number;
  studentName: string;
  centerName: string;
  lastSnapshotDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
}

export const BatchReviewWorkflow: React.FC<BatchReviewWorkflowProps> = ({
  centerId,
  context,
  onComplete,
}) => {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQueue();
  }, [centerId, context]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      // Load students for the selected center
      const students = centerId
        ? await api.getStudentsByCenter?.(centerId) || []
        : await api.getStudents() || [];
      
      const queueItems: ReviewQueueItem[] = students.map((s: any) => ({
        studentId: s.id,
        studentName: s.fullName,
        centerName: s.center?.name || 'Unknown',
        lastSnapshotDate: s.lastSnapshotDate,
        status: 'pending' as const,
      }));

      setQueue(queueItems);
    } catch (err: any) {
      setError(err.message || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const currentStudent = queue[currentIndex];
  const completedCount = queue.filter(q => q.status === 'completed').length;
  const skippedCount = queue.filter(q => q.status === 'skipped').length;
  const remainingCount = queue.length - completedCount - skippedCount;

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // All done
      onComplete?.();
    }
  };

  const handleSkip = () => {
    const updated = [...queue];
    updated[currentIndex].status = 'skipped';
    setQueue(updated);
    handleNext();
  };

  const handleComplete = (snapshotId: number) => {
    const updated = [...queue];
    updated[currentIndex].status = 'completed';
    setQueue(updated);
    handleNext();
  };

  if (loading) {
    return (
      <Card variant="default" padding="lg">
        <div style={{ textAlign: 'center', color: colors.text.muted }}>
          Loading review queue...
        </div>
      </Card>
    );
  }

  if (queue.length === 0) {
    return (
      <Card variant="default" padding="lg">
        <div style={{ textAlign: 'center', color: colors.text.muted }}>
          No students found for review
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
      {/* Progress Header */}
      <Card variant="elevated" padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <div>
            <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs }}>
              Batch Review: {context.replace(/_/g, ' ')}
            </h3>
            <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
              Player {currentIndex + 1} of {queue.length}
            </p>
          </div>
          <div style={{ display: 'flex', gap: spacing.md }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...typography.h4, color: colors.success.main }}>{completedCount}</div>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Completed</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...typography.h4, color: colors.text.muted }}>{remainingCount}</div>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Remaining</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ ...typography.h4, color: colors.warning.main }}>{skippedCount}</div>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Skipped</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: '8px',
            background: colors.surface.soft,
            borderRadius: borderRadius.full,
            overflow: 'hidden',
            marginBottom: spacing.md,
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / queue.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: colors.success.main,
              borderRadius: borderRadius.full,
            }}
          />
        </div>

        {/* Queue List */}
        <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
          {queue.map((item, idx) => (
            <button
              key={item.studentId}
              onClick={() => setCurrentIndex(idx)}
              style={{
                padding: `${spacing.xs} ${spacing.sm}`,
                background: idx === currentIndex
                  ? colors.primary.main
                  : item.status === 'completed'
                  ? colors.success.soft
                  : item.status === 'skipped'
                  ? colors.warning.soft
                  : colors.surface.soft,
                border: `1px solid ${idx === currentIndex ? colors.primary.main : colors.surface.card}`,
                borderRadius: borderRadius.md,
                color: idx === currentIndex
                  ? colors.text.onPrimary
                  : item.status === 'completed'
                  ? colors.success.main
                  : item.status === 'skipped'
                  ? colors.warning.main
                  : colors.text.secondary,
                cursor: 'pointer',
                fontSize: typography.fontSize.xs,
                fontFamily: typography.fontFamily.primary,
                transition: 'all 0.2s ease',
              }}
            >
              {item.studentName.split(' ')[0]}
            </button>
          ))}
        </div>
      </Card>

      {/* Current Student Editor */}
      {currentStudent && (
        <div>
          <Card variant="default" padding="md" style={{ marginBottom: spacing.md }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                  {currentStudent.studentName}
                </h4>
                <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                  {currentStudent.centerName}
                  {currentStudent.lastSnapshotDate && (
                    <> • Last snapshot: {new Date(currentStudent.lastSnapshotDate).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: spacing.sm }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                <Button
                  variant="utility"
                  size="sm"
                  onClick={handleNext}
                >
                  Next →
                </Button>
              </div>
            </div>
          </Card>

          <SnapshotEditor
            studentId={currentStudent.studentId}
            initialContext={context}
            onSave={(snapshotId) => {
              handleComplete(snapshotId);
            }}
            onCancel={handleSkip}
          />
        </div>
      )}

      {/* Completion Message */}
      {completedCount + skippedCount === queue.length && (
        <Card variant="elevated" padding="lg" style={{ background: colors.success.soft, borderColor: colors.success.main }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...typography.h3, color: colors.success.main, marginBottom: spacing.sm }}>
              Review Complete!
            </div>
            <div style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
              Completed {completedCount} reviews, skipped {skippedCount}
            </div>
            <Button variant="primary" onClick={onComplete}>
              Finish
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};



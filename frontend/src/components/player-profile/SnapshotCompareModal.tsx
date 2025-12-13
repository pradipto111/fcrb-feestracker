import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface SnapshotCompareModalProps {
  snapshotId1: number;
  snapshotId2?: number;
  onClose: () => void;
}

interface SnapshotData {
  id: number;
  createdAt: string;
  values: Array<{
    metricDefinition: {
      key: string;
      displayName: string;
      category: string;
    };
    valueNumber: number;
  }>;
  positional: Array<{
    position: string;
    suitability: number;
  }>;
  readiness?: {
    overall: number;
    technical: number;
    physical: number;
    mental: number;
    attitude: number;
    tacticalFit: number;
  };
}

export const SnapshotCompareModal: React.FC<SnapshotCompareModalProps> = ({
  snapshotId1,
  snapshotId2,
  onClose,
}) => {
  const [snapshot1, setSnapshot1] = useState<SnapshotData | null>(null);
  const [snapshot2, setSnapshot2] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSnapshots();
  }, [snapshotId1, snapshotId2]);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch both snapshots
      // For now, we'll use the latest snapshot as snapshot2 if not provided
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load snapshots');
      setLoading(false);
    }
  };

  const getDelta = (val1: number, val2: number) => val1 - val2;
  const getDeltaColor = (delta: number) => {
    if (delta > 0) return colors.success.main;
    if (delta < 0) return colors.danger.main;
    return colors.text.muted;
  };

  if (loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.surface.section,
              borderRadius: borderRadius['2xl'],
              padding: spacing['2xl'],
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: shadows['2xl'],
            }}
          >
            <div style={{ textAlign: 'center', color: colors.text.muted }}>
              Loading comparison...
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.surface.section,
            borderRadius: borderRadius['2xl'],
            padding: spacing['2xl'],
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: shadows['2xl'],
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
            <h3 style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Snapshot Comparison</h3>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.text.muted,
                cursor: 'pointer',
                fontSize: '1.5rem',
                padding: spacing.xs,
              }}
            >
              ×
            </button>
          </div>

          {error ? (
            <div style={{ color: colors.danger.main }}>{error}</div>
          ) : (
            <div style={{ color: colors.text.muted }}>
              Comparison view coming soon. This will show side-by-side differences between snapshots.
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};



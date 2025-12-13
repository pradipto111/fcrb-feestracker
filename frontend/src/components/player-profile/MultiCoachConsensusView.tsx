/**
 * Multi-Coach Consensus View
 * 
 * Admin tool to view consensus ratings when multiple coaches have rated the same player.
 * Shows average ratings, ranges, and coach-wise breakdowns.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../api/client';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Section } from '../ui/Section';

interface MetricConsensus {
  metricKey: string;
  metricDisplayName: string;
  category: string;
  averageRating: number;
  minRating: number;
  maxRating: number;
  ratingCount: number;
  coachRatings: Array<{
    coachId: number;
    coachName?: string;
    rating: number;
    confidence?: number;
    createdAt: string;
  }>;
  standardDeviation: number;
}

interface PlayerConsensus {
  studentId: number;
  studentName: string;
  totalSnapshots: number;
  uniqueCoaches: number;
  metrics: MetricConsensus[];
  overallReadiness?: {
    average: number;
    min: number;
    max: number;
    coachReadiness: Array<{
      coachId: number;
      coachName?: string;
      overall: number;
      createdAt: string;
    }>;
  };
}

interface MultiCoachConsensusViewProps {
  studentId: number;
  anonymize?: boolean;
  onClose?: () => void;
}

export const MultiCoachConsensusView: React.FC<MultiCoachConsensusViewProps> = ({
  studentId,
  anonymize = true,
  onClose,
}) => {
  const [consensus, setConsensus] = useState<PlayerConsensus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNames, setShowNames] = useState(!anonymize);

  useEffect(() => {
    loadConsensus();
  }, [studentId, anonymize]);

  const loadConsensus = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPlayerConsensus(studentId, anonymize);
      setConsensus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load consensus data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
          Loading consensus data...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated" padding="lg">
        <div style={{ color: colors.danger.main, marginBottom: spacing.md }}>
          {error}
        </div>
        <Button variant="secondary" onClick={loadConsensus}>
          Retry
        </Button>
      </Card>
    );
  }

  if (!consensus) {
    return (
      <Card variant="elevated" padding="lg">
        <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
          No consensus data available. This player needs to be rated by at least 2 coaches.
        </div>
      </Card>
    );
  }

  // Group metrics by category
  const metricsByCategory: Record<string, MetricConsensus[]> = {};
  consensus.metrics.forEach(metric => {
    if (!metricsByCategory[metric.category]) {
      metricsByCategory[metric.category] = [];
    }
    metricsByCategory[metric.category].push(metric);
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return colors.success.main;
    if (rating >= 60) return colors.primary.main;
    if (rating >= 40) return colors.warning?.main || colors.accent.main;
    return colors.danger.main;
  };

  const getSpreadColor = (stdDev: number) => {
    if (stdDev < 5) return colors.success.main;
    if (stdDev < 10) return colors.warning?.main || colors.accent.main;
    return colors.danger.main;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card variant="elevated" padding="lg">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl }}>
          <div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>
              Multi-Coach Consensus: {consensus.studentName}
            </h2>
            <div style={{ display: 'flex', gap: spacing.md, ...typography.body, color: colors.text.secondary }}>
              <span>{consensus.uniqueCoaches} coaches</span>
              <span>•</span>
              <span>{consensus.totalSnapshots} snapshots</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <Button
              variant="utility"
              size="sm"
              onClick={() => setShowNames(!showNames)}
            >
              {showNames ? '🔒 Anonymize' : '👁️ Show Names'}
            </Button>
            {onClose && (
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Overall Readiness Consensus */}
        {consensus.overallReadiness && (
          <Section variant="default" style={{ marginBottom: spacing.xl }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              Overall Readiness Consensus
            </h3>
            <Card variant="outlined" padding="md" style={{ background: colors.surface.soft }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md }}>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Average
                  </div>
                  <div style={{ ...typography.h3, color: getRatingColor(consensus.overallReadiness.average) }}>
                    {consensus.overallReadiness.average.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Range
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {consensus.overallReadiness.min.toFixed(0)} - {consensus.overallReadiness.max.toFixed(0)}
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Spread
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {(consensus.overallReadiness.max - consensus.overallReadiness.min).toFixed(1)} points
                  </div>
                </div>
              </div>

              {/* Coach-wise breakdown */}
              <div style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTop: `1px solid ${colors.surface.card}` }}>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.sm }}>
                  Coach Ratings:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                  {consensus.overallReadiness.coachReadiness.map((cr, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: colors.surface.card,
                        borderRadius: borderRadius.sm,
                        ...typography.caption,
                        color: colors.text.secondary,
                      }}
                    >
                      {showNames && cr.coachName ? cr.coachName : `Coach ${idx + 1}`}: {cr.overall.toFixed(0)}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </Section>
        )}

        {/* Metrics by Category */}
        {Object.entries(metricsByCategory).map(([category, metrics]) => (
          <Section key={category} variant="default" style={{ marginBottom: spacing.xl }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              {category}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {metrics.map(metric => (
                <Card key={metric.metricKey} variant="outlined" padding="md" style={{ background: colors.surface.soft }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                        {metric.metricDisplayName}
                      </div>
                      <div style={{ display: 'flex', gap: spacing.md, ...typography.caption, color: colors.text.muted }}>
                        <span>{metric.ratingCount} ratings</span>
                        <span>•</span>
                        <span style={{ color: getSpreadColor(metric.standardDeviation) }}>
                          Std Dev: {metric.standardDeviation.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ ...typography.h4, color: getRatingColor(metric.averageRating) }}>
                        {metric.averageRating.toFixed(1)}
                      </div>
                      <div style={{ ...typography.caption, color: colors.text.muted }}>
                        {metric.minRating} - {metric.maxRating}
                      </div>
                    </div>
                  </div>

                  {/* Rating bar visualization */}
                  <div style={{ marginBottom: spacing.sm }}>
                    <div style={{ height: '8px', background: colors.surface.dark, borderRadius: borderRadius.full, overflow: 'hidden', position: 'relative' }}>
                      {/* Average line */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${metric.averageRating}%`,
                          width: '2px',
                          height: '100%',
                          background: colors.text.primary,
                          zIndex: 2,
                        }}
                      />
                      {/* Range band */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${metric.minRating}%`,
                          width: `${metric.maxRating - metric.minRating}%`,
                          height: '100%',
                          background: colors.primary.soft,
                          opacity: 0.3,
                          zIndex: 1,
                        }}
                      />
                    </div>
                  </div>

                  {/* Coach ratings breakdown */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                    {metric.coachRatings.map((cr, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          background: colors.surface.card,
                          borderRadius: borderRadius.sm,
                          ...typography.caption,
                          color: colors.text.secondary,
                          border: `1px solid ${getRatingColor(cr.rating)}40`,
                        }}
                        title={`${showNames && cr.coachName ? cr.coachName : `Coach ${idx + 1}`}: ${cr.rating}${cr.confidence ? ` (confidence: ${cr.confidence}%)` : ''}`}
                      >
                        {showNames && cr.coachName ? cr.coachName : `C${idx + 1}`}: {cr.rating}
                        {cr.confidence && (
                          <span style={{ opacity: 0.7, marginLeft: spacing.xs }}>
                            ({cr.confidence}%)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        ))}

        {/* Summary Stats */}
        <Section variant="default" style={{ marginTop: spacing.xl }}>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Consensus Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md }}>
            <Card variant="outlined" padding="md">
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Metrics with High Agreement (Std Dev &lt; 5)
              </div>
              <div style={{ ...typography.h3, color: colors.success.main }}>
                {consensus.metrics.filter(m => m.standardDeviation < 5).length}
              </div>
            </Card>
            <Card variant="outlined" padding="md">
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Metrics with Disagreement (Std Dev &gt; 10)
              </div>
              <div style={{ ...typography.h3, color: colors.danger.main }}>
                {consensus.metrics.filter(m => m.standardDeviation > 10).length}
              </div>
            </Card>
            <Card variant="outlined" padding="md">
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Average Spread
              </div>
              <div style={{ ...typography.h3, color: colors.text.primary }}>
                {(consensus.metrics.reduce((sum, m) => sum + (m.maxRating - m.minRating), 0) / consensus.metrics.length).toFixed(1)}
              </div>
            </Card>
          </div>
        </Section>
      </Card>
    </motion.div>
  );
};



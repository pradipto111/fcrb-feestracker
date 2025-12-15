/**
 * Player Comparison Page
 * 
 * Allows coaches/admins to compare 2-5 players with contextual filters
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';

interface ComparisonContext {
  position: string;
  ageGroup?: string;
  level?: string;
  snapshotType: 'latest' | 'specific' | 'average';
  snapshotDate?: string;
  averageSnapshots?: number;
}

interface ComparisonPlayer {
  studentId: number;
  studentName: string;
  centerName?: string;
  ageGroup?: string;
  snapshotId: number;
  snapshotDate: string;
  readiness: {
    overall: number;
    technical: number;
    physical: number;
    mental: number;
    attitude: number;
    tacticalFit: number;
    statusBand: string;
    explanation: any;
  };
  metrics: Array<{
    metricKey: string;
    displayName: string;
    category: string;
    value: number;
    confidence?: number;
    comment?: string;
  }>;
  positionalSuitability: Array<{
    position: string;
    suitability: number;
    comment?: string;
  }>;
  trends: {
    direction: 'improving' | 'plateau' | 'declining';
    metricsImproved: number;
    metricsDeclined: number;
  };
  coachNotes: Array<{
    title: string;
    tags: string[];
    createdAt: string;
  }>;
}

interface ComparisonResult {
  context: ComparisonContext;
  players: ComparisonPlayer[];
  insights: string[];
  warnings: string[];
}

const PlayerComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [context, setContext] = useState<ComparisonContext>({
    position: searchParams.get('position') || '',
    ageGroup: searchParams.get('ageGroup') || undefined,
    level: searchParams.get('level') || undefined,
    snapshotType: (searchParams.get('snapshotType') as any) || 'latest',
    snapshotDate: searchParams.get('snapshotDate') || undefined,
    averageSnapshots: searchParams.get('averageSnapshots') ? Number(searchParams.get('averageSnapshots')) : undefined,
  });
  const [playerIds, setPlayerIds] = useState<number[]>(
    searchParams.get('playerIds')?.split(',').map(Number).filter(Boolean) || []
  );

  // Only allow COACH/ADMIN
  useEffect(() => {
    if (user && user.role !== 'COACH' && user.role !== 'ADMIN') {
      navigate('/realverse');
    }
  }, [user, navigate]);

  const handleCompare = async () => {
    if (playerIds.length < 2) {
      setError('Please select at least 2 players');
      return;
    }
    if (playerIds.length > 5) {
      setError('Maximum 5 players can be compared');
      return;
    }
    if (!context.position) {
      setError('Position is required for comparison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.comparePlayers({
        playerIds,
        position: context.position,
        ageGroup: context.ageGroup,
        level: context.level,
        snapshotType: context.snapshotType,
        snapshotDate: context.snapshotDate,
        averageSnapshots: context.averageSnapshots,
      });
      setComparison(result);
    } catch (err: any) {
      setError(err.message || 'Failed to compare players');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBandColor = (band: string) => {
    switch (band) {
      case 'Ready': return colors.success.main;
      case 'Advanced': return colors.primary.main;
      case 'Competitive': return colors.warning.main;
      case 'Developing': return colors.info.main;
      default: return colors.text.muted;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return '↑';
      case 'declining': return '↓';
      default: return '→';
    }
  };

  if (!user || (user.role !== 'COACH' && user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: colors.surface.bg,
        minHeight: '100vh',
        padding: spacing.xl,
      }}
    >
      <Section>
        <div style={{ marginBottom: spacing.xl }}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
            style={{ marginBottom: spacing.lg }}
          >
            ← Back
          </Button>
          <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.md }}>
            Player Comparison
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            Compare players within shared context (position, age group, level)
          </p>
        </div>

        {error && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
            <div style={{ color: colors.danger.main }}>{error}</div>
          </Card>
        )}

        {!comparison ? (
          <Card variant="default" padding="lg">
            <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
              Comparison Context
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, marginBottom: spacing.lg }}>
              <div>
                <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                  Position (Required) *
                </label>
                <select
                  value={context.position}
                  onChange={(e) => setContext({ ...context, position: e.target.value })}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    background: colors.surface.elevated,
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  <option value="">Select position</option>
                  <option value="GK">Goalkeeper (GK)</option>
                  <option value="CB">Centre Back (CB)</option>
                  <option value="FB">Full Back (FB)</option>
                  <option value="WB">Wing Back (WB)</option>
                  <option value="DM">Defensive Midfielder (DM)</option>
                  <option value="CM">Central Midfielder (CM)</option>
                  <option value="AM">Attacking Midfielder (AM)</option>
                  <option value="W">Winger (W)</option>
                  <option value="ST">Striker (ST)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Age Group
                  </label>
                  <input
                    type="text"
                    value={context.ageGroup || ''}
                    onChange={(e) => setContext({ ...context, ageGroup: e.target.value || undefined })}
                    placeholder="e.g., U13, U15"
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                </div>

                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Level
                  </label>
                  <input
                    type="text"
                    value={context.level || ''}
                    onChange={(e) => setContext({ ...context, level: e.target.value || undefined })}
                    placeholder="e.g., Youth, D, C"
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                  Snapshot Selection
                </label>
                <select
                  value={context.snapshotType}
                  onChange={(e) => setContext({ ...context, snapshotType: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    background: colors.surface.elevated,
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  <option value="latest">Latest Snapshot</option>
                  <option value="specific">Specific Date</option>
                  <option value="average">Average of Last N Snapshots</option>
                </select>
              </div>

              {context.snapshotType === 'specific' && (
                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Snapshot Date
                  </label>
                  <input
                    type="date"
                    value={context.snapshotDate || ''}
                    onChange={(e) => setContext({ ...context, snapshotDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                </div>
              )}

              {context.snapshotType === 'average' && (
                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Number of Snapshots
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={context.averageSnapshots || 3}
                    onChange={(e) => setContext({ ...context, averageSnapshots: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.sm,
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                  Player IDs (comma-separated, 2-5 players)
                </label>
                <input
                  type="text"
                  value={playerIds.join(', ')}
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map(s => Number(s.trim())).filter(Boolean);
                    setPlayerIds(ids);
                  }}
                  placeholder="e.g., 1, 2, 3"
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    background: colors.surface.elevated,
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleCompare}
              disabled={loading || !context.position || playerIds.length < 2}
            >
              {loading ? 'Comparing...' : 'Compare Players'}
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
            {/* Context & Warnings */}
            <Card variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>
                    Comparing {comparison.players.length} players for {comparison.context.position}
                  </div>
                  {comparison.context.ageGroup && (
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      Age Group: {comparison.context.ageGroup}
                    </div>
                  )}
                </div>
                <Button variant="secondary" size="sm" onClick={() => setComparison(null)}>
                  New Comparison
                </Button>
              </div>
              {comparison.warnings.length > 0 && (
                <div style={{ padding: spacing.sm, background: colors.warning.soft, borderRadius: borderRadius.md, marginTop: spacing.md }}>
                  {comparison.warnings.map((w, i) => (
                    <div key={i} style={{ color: colors.warning.main, fontSize: typography.fontSize.sm }}>
                      ⚠️ {w}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Insights */}
            {comparison.insights.length > 0 && (
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                  Key Insights
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {comparison.insights.map((insight, i) => (
                    <div
                      key={i}
                      style={{
                        padding: spacing.md,
                        background: colors.primary.soft,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                        lineHeight: 1.6,
                      }}
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Readiness Comparison */}
            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.lg }}>
                Readiness Index Comparison
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.players.length}, 1fr)`, gap: spacing.md }}>
                {comparison.players.map((player) => (
                  <div key={player.studentId} style={{ textAlign: 'center' }}>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                      {player.studentName}
                    </div>
                    <div
                      style={{
                        fontSize: typography.fontSize['2xl'],
                        fontWeight: typography.fontWeight.bold,
                        color: getStatusBandColor(player.readiness.statusBand),
                        marginBottom: spacing.xs,
                      }}
                    >
                      {player.readiness.overall}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {player.readiness.statusBand}
                    </div>
                    <div style={{ marginTop: spacing.sm, fontSize: typography.fontSize.xs, color: colors.text.muted }}>
                      {getTrendIcon(player.trends.direction)} {player.trends.metricsImproved} improved
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Detailed Metrics Comparison */}
            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.lg }}>
                Attribute Comparison
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border.default}` }}>
                      <th style={{ ...typography.caption, color: colors.text.muted, textAlign: 'left', padding: spacing.sm }}>
                        Metric
                      </th>
                      {comparison.players.map((player) => (
                        <th key={player.studentId} style={{ ...typography.caption, color: colors.text.muted, textAlign: 'center', padding: spacing.sm }}>
                          {player.studentName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.players[0].metrics.slice(0, 20).map((metric) => (
                      <tr key={metric.metricKey} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                        <td style={{ padding: spacing.sm, color: colors.text.primary, fontSize: typography.fontSize.sm }}>
                          {metric.displayName}
                        </td>
                        {comparison.players.map((player) => {
                          const playerMetric = player.metrics.find(m => m.metricKey === metric.metricKey);
                          const value = playerMetric?.value || 0;
                          const maxValue = Math.max(...comparison.players.map(p => p.metrics.find(m => m.metricKey === metric.metricKey)?.value || 0));
                          const isBest = value === maxValue && value > 0;
                          return (
                            <td key={player.studentId} style={{ padding: spacing.sm, textAlign: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, justifyContent: 'center' }}>
                                <div
                                  style={{
                                    width: '60px',
                                    height: '8px',
                                    background: colors.surface.elevated,
                                    borderRadius: borderRadius.sm,
                                    overflow: 'hidden',
                                    position: 'relative',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${value}%`,
                                      height: '100%',
                                      background: isBest ? colors.primary.main : colors.border.default,
                                      transition: 'all 0.3s',
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    ...typography.caption,
                                    color: isBest ? colors.primary.main : colors.text.primary,
                                    fontWeight: isBest ? typography.fontWeight.semibold : typography.fontWeight.normal,
                                    minWidth: '30px',
                                  }}
                                >
                                  {value}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </Section>
    </motion.main>
  );
};

export default PlayerComparisonPage;


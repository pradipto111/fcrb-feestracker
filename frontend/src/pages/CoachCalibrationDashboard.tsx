/**
 * Coach Calibration Dashboard
 * 
 * Helps coaches self-correct bias and understand their scoring patterns.
 * Shows scoring profile, comparisons, and calibration insights.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { PageShell } from '../components/ui/PageShell';
import { MultiCoachConsensusView } from '../components/player-profile/MultiCoachConsensusView';

interface CoachScoringProfile {
  coachId: number;
  totalSnapshots: number;
  averageOverallScore: number;
  averageTechnicalScore: number;
  averagePhysicalScore: number;
  averageMentalScore: number;
  averageAttitudeScore: number;
  standardDeviation: number;
  percentAbove70: number;
  percentBelow40: number;
  averageConfidence: number;
  largeJumpFrequency: number;
  scoreDistribution: Record<string, number>;
  lastSnapshotDate: string | null;
}

const CoachCalibrationDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoachScoringProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Array<CoachScoringProfile & { coachName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'comparison' | 'outliers' | 'consensus'>('profile');
  const [multiCoachPlayers, setMultiCoachPlayers] = useState<Array<{
    studentId: number;
    studentName: string;
    uniqueCoaches: number;
    totalSnapshots: number;
    latestSnapshotDate: string;
  }>>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
      if (user.role === 'ADMIN') {
        loadAllProfiles();
        loadMultiCoachPlayers();
      }
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getCoachScoringProfile(user!.id);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load calibration profile');
    } finally {
      setLoading(false);
    }
  };

  const loadAllProfiles = async () => {
    try {
      const data = await api.getAllCoachProfiles();
      setAllProfiles(data);
    } catch (err: any) {
      console.error('Failed to load all coach profiles:', err);
    }
  };

  const loadMultiCoachPlayers = async () => {
    try {
      const data = await api.getMultiCoachPlayers(2);
      setMultiCoachPlayers(data.players || []);
    } catch (err: any) {
      console.error('Failed to load multi-coach players:', err);
    }
  };

  const refreshProfile = async () => {
    try {
      setLoading(true);
      await api.refreshCoachProfile(user!.id);
      await loadProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading calibration profile...
        </div>
      </PageShell>
    );
  }

  if (error && !profile) {
    return (
      <PageShell>
        <Card variant="default" padding="lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ color: colors.danger.main, marginBottom: spacing.md }}>
            {error}
          </div>
          <Button variant="secondary" onClick={loadProfile}>
            Retry
          </Button>
        </Card>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell>
        <Card variant="default" padding="lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
              No Calibration Data Yet
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl }}>
              Create some player metric snapshots to see your scoring profile and calibration insights.
            </p>
            <Button variant="primary" onClick={() => navigate('/realverse/admin/students')}>
              Start Creating Snapshots →
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  const distribution = profile.scoreDistribution || {};
  const distributionEntries = Object.entries(distribution).map(([range, count]) => ({
    range,
    count: count as number,
    percentage: (count as number / profile.totalSnapshots) * 100,
  }));

  return (
    <PageShell>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Section variant="default" style={{ marginBottom: spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md }}>
            <div>
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                Coach Calibration Dashboard
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary }}>
                Understand your scoring patterns and maintain consistency across players
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={refreshProfile}>
              🔄 Refresh Data
            </Button>
          </div>
        </Section>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.xl, borderBottom: `1px solid ${colors.surface.soft}` }}>
          {[
            { key: 'profile' as const, label: 'Your Scoring Pattern' },
            { key: 'comparison' as const, label: 'Comparison' },
            { key: 'outliers' as const, label: 'Review Points' },
            ...(user?.role === 'ADMIN' ? [{ key: 'consensus' as const, label: 'Multi-Coach Consensus' }] : []),
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                background: activeTab === tab.key ? colors.primary.main + '15' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.key ? `3px solid ${colors.primary.main}` : '3px solid transparent',
                color: activeTab === tab.key ? colors.text.primary : colors.text.secondary,
                cursor: 'pointer',
                ...typography.body,
                fontWeight: activeTab === tab.key ? typography.fontWeight.semibold : typography.fontWeight.medium,
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.lg }}>
            {/* Overall Stats */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Overall Statistics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Total Snapshots
                  </div>
                  <div style={{ ...typography.h3, color: colors.text.primary }}>
                    {profile.totalSnapshots}
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Average Overall Score
                  </div>
                  <div style={{ ...typography.h3, color: colors.primary.main }}>
                    {profile.averageOverallScore.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Standard Deviation
                  </div>
                  <div style={{ ...typography.body, color: colors.text.secondary }}>
                    {profile.standardDeviation.toFixed(1)}
                  </div>
                </div>
              </div>
            </Card>

            {/* Category Averages */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Category Averages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {[
                  { label: 'Technical', value: profile.averageTechnicalScore, color: colors.primary.main },
                  { label: 'Physical', value: profile.averagePhysicalScore, color: colors.accent.main },
                  { label: 'Mental', value: profile.averageMentalScore, color: colors.success.main },
                  { label: 'Attitude', value: profile.averageAttitudeScore, color: colors.warning?.main || colors.accent.main },
                ].map((cat) => (
                  <div key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                    <div style={{ minWidth: '100px', ...typography.body, fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      {cat.label}
                    </div>
                    <div style={{ flex: 1, height: '8px', background: colors.surface.dark, borderRadius: borderRadius.full, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${cat.value}%`,
                          background: cat.color,
                          borderRadius: borderRadius.full,
                        }}
                      />
                    </div>
                    <div style={{ minWidth: '50px', textAlign: 'right', ...typography.body, fontWeight: typography.fontWeight.semibold, color: cat.color }}>
                      {cat.value.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Score Distribution */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Score Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {distributionEntries.map((item) => (
                  <div key={item.range}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                      <span style={{ ...typography.caption, color: colors.text.secondary }}>{item.range}</span>
                      <span style={{ ...typography.caption, color: colors.text.muted }}>{item.count} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: '6px', background: colors.surface.dark, borderRadius: borderRadius.full, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.percentage}%`,
                          background: colors.primary.main,
                          borderRadius: borderRadius.full,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Insights */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Insights
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Scores Above 70
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {profile.percentAbove70.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Scores Below 40
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {profile.percentBelow40.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Average Confidence
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {profile.averageConfidence.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Large Jump Frequency
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {profile.largeJumpFrequency.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && user?.role === 'ADMIN' && (
          <Card variant="elevated" padding="lg">
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              Coach Comparison
            </h3>
            {allProfiles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {allProfiles.map((p) => (
                  <div
                    key={p.coachId}
                    style={{
                      padding: spacing.md,
                      background: colors.surface.soft,
                      borderRadius: borderRadius.md,
                      border: p.coachId === user.id ? `2px solid ${colors.primary.main}` : `1px solid ${colors.surface.card}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                      <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                        {p.coachName} {p.coachId === user.id && '(You)'}
                      </div>
                      <div style={{ ...typography.body, color: colors.primary.main, fontWeight: typography.fontWeight.semibold }}>
                        Avg: {p.averageOverallScore.toFixed(1)}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.sm, ...typography.caption, color: colors.text.muted }}>
                      <div>Snapshots: {p.totalSnapshots}</div>
                      <div>Std Dev: {p.standardDeviation.toFixed(1)}</div>
                      <div>Above 70: {p.percentAbove70.toFixed(1)}%</div>
                      <div>Below 40: {p.percentBelow40.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
                No other coach profiles available yet.
              </div>
            )}
          </Card>
        )}

        {/* Outliers Tab */}
        {activeTab === 'outliers' && (
          <Card variant="elevated" padding="lg">
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              Review Points
            </h3>
            <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
              These are not errors, but opportunities to review and add context to your ratings.
            </p>
            <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
              Outlier review feature coming soon. This will show players where your ratings deviate significantly from club baselines.
            </div>
          </Card>
        )}

        {/* Multi-Coach Consensus Tab (Admin Only) */}
        {activeTab === 'consensus' && user?.role === 'ADMIN' && (
          <div>
            {selectedPlayerId ? (
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedPlayerId(null)}
                  style={{ marginBottom: spacing.md }}
                >
                  ← Back to List
                </Button>
                <MultiCoachConsensusView
                  studentId={selectedPlayerId}
                  anonymize={false}
                />
              </div>
            ) : (
              <Card variant="elevated" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                  Players Rated by Multiple Coaches
                </h3>
                <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
                  View consensus ratings when multiple coaches have assessed the same player. This helps identify agreement and disagreement patterns.
                </p>
                {multiCoachPlayers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                    {multiCoachPlayers.map((player) => (
                      <Card
                        key={player.studentId}
                        variant="outlined"
                        padding="md"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          ':hover': { background: colors.surface.soft },
                        }}
                        onClick={() => setSelectedPlayerId(player.studentId)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                              {player.studentName}
                            </div>
                            <div style={{ display: 'flex', gap: spacing.md, ...typography.caption, color: colors.text.muted }}>
                              <span>{player.uniqueCoaches} coaches</span>
                              <span>•</span>
                              <span>{player.totalSnapshots} snapshots</span>
                              <span>•</span>
                              <span>Latest: {new Date(player.latestSnapshotDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button variant="primary" size="sm">
                            View Consensus →
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
                    No players with multi-coach ratings yet. Players need to be rated by at least 2 coaches to appear here.
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CoachCalibrationDashboard;


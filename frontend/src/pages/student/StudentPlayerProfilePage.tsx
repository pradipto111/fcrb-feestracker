import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../theme/design-tokens';
import { useHomepageAnimation } from '../../hooks/useHomepageAnimation';
import { PlayerHeaderCard } from '../../components/player-profile/PlayerHeaderCard';
import { ReadinessCard, ReadinessData } from '../../components/player-profile/ReadinessCard';
import { PositionSuitabilityGrid, PositionSuitability } from '../../components/player-profile/PositionSuitabilityGrid';
import { MetricPanel } from '../../components/player-profile/MetricPanel';
import { CoachNotesPanel } from '../../components/player-profile/CoachNotesPanel';
import { SnapshotTimeline } from '../../components/player-profile/SnapshotTimeline';
import { Card } from '../../components/ui/Card';
import { Section } from '../../components/ui/Section';

type Tab = 'overview' | 'attributes' | 'development' | 'notes';

interface PlayerData {
  id: number;
  fullName: string;
  dateOfBirth?: string;
  center?: { name: string };
  primaryPosition?: string;
  preferredFoot?: string;
  ageGroup?: string;
  team?: string;
  avatar?: string;
}

interface MetricSnapshot {
  id: number;
  createdAt: string;
  sourceContext: string;
  notes?: string;
  values: Array<{
    id: string;
    metricDefinition: {
      key: string;
      displayName: string;
      category: string;
      definition?: string;
      isCoachOnly?: boolean;
    };
    valueNumber: number;
    confidence?: number;
    comment?: string;
    delta?: number;
  }>;
  positional: PositionSuitability[];
  readiness?: ReadinessData;
  createdBy: {
    fullName: string;
  };
}

const StudentPlayerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.id || 0;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<MetricSnapshot | null>(null);
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    sectionVariants,
    cardVariants,
    viewportOnce,
  } = useHomepageAnimation();

  useEffect(() => {
    if (!studentId) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    loadPlayerData();
  }, [studentId]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load player info
      const playerData = await api.getStudentDashboard();
      setPlayer({
        id: playerData.student.id,
        fullName: playerData.student.fullName,
        dateOfBirth: playerData.student.dateOfBirth,
        center: { name: playerData.student.center?.name || 'Unknown' },
        primaryPosition: playerData.student.primaryPosition,
        preferredFoot: playerData.student.preferredFoot,
        ageGroup: playerData.student.ageGroup,
        team: playerData.student.team,
        avatar: playerData.student.avatar,
      });

      // Load latest snapshot (student's own)
      try {
        const snapshotData = await api.getMyLatestMetricSnapshot();
        
        if (snapshotData?.snapshot) {
          setLatestSnapshot(snapshotData.snapshot);
        }
      } catch (err: any) {
        // No snapshot yet is not an error
        console.log('No snapshot found:', err.message);
      }

      // Load snapshot history for development tab
      try {
        const historyData = await api.getMyMetricSnapshots({ limit: 20 }) || { snapshots: [] };
        setSnapshots(historyData.snapshots || []);
      } catch (err: any) {
        console.log('No snapshot history:', err.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const getAgeGroup = (dob?: string) => {
    if (!dob) return undefined;
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    if (age < 13) return 'U13';
    if (age < 15) return 'U15';
    if (age < 17) return 'U17';
    if (age < 19) return 'U19';
    return 'Senior';
  };

  const groupMetricsByCategory = (metrics: MetricSnapshot['values']) => {
    const groups: Record<string, typeof metrics> = {};
    metrics.forEach((metric) => {
      // Filter out coach-only metrics for students
      if (metric.metricDefinition.isCoachOnly) return;
      const category = metric.metricDefinition.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(metric);
    });
    return groups;
  };

  const getTopStrengths = (snapshot: MetricSnapshot | null): string[] => {
    if (!snapshot?.readiness?.explanationJson?.topStrengths) return [];
    const strengths = snapshot.readiness.explanationJson.topStrengths;
    return Array.isArray(strengths) ? strengths : [];
  };

  const getFocusAreas = (snapshot: MetricSnapshot | null): string[] => {
    if (!snapshot?.readiness?.explanationJson?.topRisks) return [];
    const risks = snapshot.readiness.explanationJson.topRisks;
    return Array.isArray(risks) ? risks : [];
  };

  if (loading) {
    return (
      <div style={{ padding: spacing['2xl'], textAlign: 'center', color: colors.text.muted }}>
        Loading your profile...
      </div>
    );
  }

  if (error || !player) {
    return (
      <Card variant="default" padding="lg">
        <div style={{ color: colors.danger.main }}>Error: {error || 'Unable to load profile'}</div>
      </Card>
    );
  }

  const metricGroups = latestSnapshot ? groupMetricsByCategory(latestSnapshot.values) : {};

  return (
    <motion.main
      variants={sectionVariants}
      initial="offscreen"
      animate="onscreen"
      viewport={viewportOnce}
      style={{
        background: colors.surface.bg,
        minHeight: '100%',
        padding: spacing.xl,
      }}
    >
      {/* Header */}
      <PlayerHeaderCard
        name={player.fullName}
        avatar={player.avatar}
        ageGroup={getAgeGroup(player.dateOfBirth) || player.ageGroup}
        centre={player.center?.name}
        primaryPosition={player.primaryPosition}
        preferredFoot={player.preferredFoot as 'Left' | 'Right' | 'Both' | undefined}
        team={player.team}
      />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: spacing.sm,
          marginTop: spacing.xl,
          marginBottom: spacing.xl,
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        {[
          { key: 'overview' as Tab, label: 'Overview' },
          { key: 'attributes' as Tab, label: 'Attributes' },
          { key: 'development' as Tab, label: 'Development' },
          { key: 'notes' as Tab, label: 'Coach Notes' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? `3px solid ${colors.primary.main}` : '3px solid transparent',
              color: activeTab === tab.key ? colors.primary.main : colors.text.muted,
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: activeTab === tab.key ? typography.fontWeight.semibold : typography.fontWeight.medium,
              fontFamily: typography.fontFamily.primary,
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xl }}>
              {/* Readiness Card */}
              {latestSnapshot?.readiness && (
                <ReadinessCard
                  readiness={latestSnapshot.readiness}
                  onWhyClick={() => {
                    // Open explanation modal
                  }}
                />
              )}

              {/* Strengths & Focus Areas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.lg }}>
                <Card variant="default" padding="lg">
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                    Top Strengths
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                    {getTopStrengths(latestSnapshot).map((strength, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          background: colors.success.soft,
                          borderRadius: borderRadius.md,
                          ...typography.caption,
                          color: colors.success.main,
                        }}
                      >
                        {strength}
                      </div>
                    ))}
                    {getTopStrengths(latestSnapshot).length === 0 && (
                      <div style={{ color: colors.text.muted, ...typography.body, fontSize: typography.fontSize.sm }}>
                        No data available yet. Your coach will add your first assessment soon.
                      </div>
                    )}
                  </div>
                </Card>

                <Card variant="default" padding="lg">
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                    Focus Areas
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                    {getFocusAreas(latestSnapshot).map((area, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          background: colors.danger.soft,
                          borderRadius: borderRadius.md,
                          ...typography.caption,
                          color: colors.danger.main,
                        }}
                      >
                        {area}
                      </div>
                    ))}
                    {getFocusAreas(latestSnapshot).length === 0 && (
                      <div style={{ color: colors.text.muted, ...typography.body, fontSize: typography.fontSize.sm }}>
                        No data available yet.
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Position Suitability */}
              {latestSnapshot?.positional && latestSnapshot.positional.length > 0 && (
                <PositionSuitabilityGrid positions={latestSnapshot.positional} />
              )}

              {/* Recent Coach Notes */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                  Recent Coach Notes
                </h3>
                <div style={{ color: colors.text.muted, ...typography.body, fontSize: typography.fontSize.sm }}>
                  {latestSnapshot?.notes || 'No notes available yet.'}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'attributes' && (
          <motion.div
            key="attributes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              {Object.entries(metricGroups).map(([category, metrics]) => (
                <MetricPanel
                  key={category}
                  title={category}
                  metrics={metrics.map((m) => ({
                    id: m.id,
                    name: m.metricDefinition.displayName,
                    value: m.valueNumber,
                    delta: m.delta,
                    definition: m.metricDefinition.definition,
                    confidence: m.confidence,
                    comment: m.comment,
                    category: m.metricDefinition.category,
                    showDelta: true,
                    editable: false,
                  }))}
                  showDelta={true}
                  searchable={true}
                />
              ))}
              {Object.keys(metricGroups).length === 0 && (
                <Card variant="default" padding="lg">
                  <div style={{ textAlign: 'center', color: colors.text.muted }}>
                    No metrics available yet. Your coach will add your first assessment soon.
                  </div>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'development' && (
          <motion.div
            key="development"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Development Timeline
              </h3>
              <div style={{ color: colors.text.muted, ...typography.body, fontSize: typography.fontSize.sm }}>
                Timeline view coming soon...
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CoachNotesPanel
              studentId={studentId}
              isOwnView={true}
              canEdit={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};

export default StudentPlayerProfilePage;


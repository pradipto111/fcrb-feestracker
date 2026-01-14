import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { useHomepageAnimation } from '../hooks/useHomepageAnimation';
import { PlayerHeaderCard } from '../components/player-profile/PlayerHeaderCard';
import { ReadinessCard, ReadinessData } from '../components/player-profile/ReadinessCard';
import { PositionSuitabilityGrid, PositionSuitability } from '../components/player-profile/PositionSuitabilityGrid';
import { MetricPanel } from '../components/player-profile/MetricPanel';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { SnapshotEditor } from '../components/player-profile/SnapshotEditor';
import { SnapshotTimeline } from '../components/player-profile/SnapshotTimeline';
import { CoachNotesPanel } from '../components/player-profile/CoachNotesPanel';

type Tab = 'overview' | 'attributes' | 'development' | 'notes' | 'edit';

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
  values?: Array<{
    id: string;
    metricDefinition?: {
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
  positional?: PositionSuitability[];
  readiness?: ReadinessData;
  createdBy?: {
    fullName: string;
  };
}

const PlayerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentId = id ? parseInt(id, 10) : 0;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [latestSnapshot, setLatestSnapshot] = useState<MetricSnapshot | null>(null);
  const [snapshots, setSnapshots] = useState<MetricSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canEdit = user?.role === 'COACH' || user?.role === 'ADMIN';
  const isOwnView = user?.role === 'STUDENT' && user?.id === studentId;

  const {
    sectionVariants,
    cardVariants,
    viewportOnce,
  } = useHomepageAnimation();

  useEffect(() => {
    if (!studentId) {
      setError('Invalid player ID');
      setLoading(false);
      return;
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Loading timeout - setting error');
        setError('Request timed out. Please try again.');
        setLoading(false);
      }
    }, 30000); // 30 second timeout

    loadPlayerData();

    return () => clearTimeout(timeoutId);
  }, [studentId]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Loading player data for studentId:', studentId);

      // Load player info
      let playerData;
      try {
        const response = await api.getStudent(studentId);
        console.log('Player data loaded:', response);
        
        // Handle different response formats
        // API might return {student: {...}, payments: ...} or just the student object
        if (response?.student) {
          playerData = response.student;
        } else if (response && typeof response === 'object' && 'id' in response) {
          playerData = response;
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (apiError: any) {
        console.error('API error loading student:', apiError);
        throw new Error(`Failed to load student: ${apiError.message || 'Unknown error'}`);
      }
      
      if (!playerData) {
        throw new Error('Player data is null or undefined');
      }
      
      setPlayer(playerData);

      // Load latest snapshot
      try {
        const snapshotData = isOwnView
          ? await api.getMyLatestMetricSnapshot()
          : await api.getStudentMetricSnapshot(studentId);
        
        console.log('Snapshot data loaded:', snapshotData);
        
        if (snapshotData?.snapshot) {
          // Ensure snapshot has required structure
          const snapshot = snapshotData.snapshot;
          if (snapshot && typeof snapshot === 'object') {
            // Ensure values is an array
            if (!Array.isArray(snapshot.values)) {
              snapshot.values = [];
            }
            setLatestSnapshot(snapshot);
          }
        } else if (snapshotData && typeof snapshotData === 'object' && !snapshotData.snapshot) {
          // API might return the snapshot directly
          const snapshot = snapshotData as any;
          if (!Array.isArray(snapshot.values)) {
            snapshot.values = [];
          }
          setLatestSnapshot(snapshot);
        }
      } catch (err: any) {
        // No snapshot yet is not an error
        console.log('No snapshot found:', err.message);
        setLatestSnapshot(null);
      }

      // Load snapshot history for development tab
      try {
        const historyData = await api.getStudentSnapshots(studentId);
        console.log('Snapshot history loaded:', historyData);
        if (historyData && Array.isArray(historyData.snapshots)) {
          setSnapshots(historyData.snapshots);
        } else if (Array.isArray(historyData)) {
          // API might return array directly
          setSnapshots(historyData);
        } else {
          setSnapshots([]);
        }
      } catch (err: any) {
        console.log('No snapshot history:', err.message);
        setSnapshots([]);
      }
    } catch (err: any) {
      console.error('Error loading player data:', err);
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

  const groupMetricsByCategory = (metrics: MetricSnapshot['values'] | undefined) => {
    const groups: Record<string, typeof metrics> = {};
    if (!metrics || !Array.isArray(metrics)) {
      return groups;
    }
    metrics.forEach((metric) => {
      const category = metric.metricDefinition?.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(metric);
    });
    return groups;
  };

  const getTopStrengths = (snapshot: MetricSnapshot | null): string[] => {
    if (!snapshot?.readiness?.explanationJson?.topStrengths) return [];
    return snapshot.readiness.explanationJson.topStrengths;
  };

  const getFocusAreas = (snapshot: MetricSnapshot | null): string[] => {
    if (!snapshot?.readiness?.explanationJson?.topRisks) return [];
    return snapshot.readiness.explanationJson.topRisks;
  };

  // Early returns for loading and error states
  if (loading) {
    return (
      <div style={{ 
        padding: spacing['2xl'], 
        textAlign: 'center', 
        color: colors.text.muted,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.surface.bg,
        width: '100%',
      }}>
        <div>
          <div style={{ marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>Loading player profile...</div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.disabled }}>
            Student ID: {studentId}
          </div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div style={{ 
        padding: spacing['2xl'],
        background: colors.surface.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}>
        <Card variant="default" padding="lg" style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{ color: colors.danger.main, marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
            Error: {error || 'Player not found'}
          </div>
          <div style={{ color: colors.text.muted, fontSize: typography.fontSize.sm, marginBottom: spacing.md }}>
            Student ID: {studentId}
          </div>
          <Button 
            variant="secondary" 
            size="md"
            onClick={() => navigate('/realverse/admin/students')}
          >
            ← Back to Students List
          </Button>
        </Card>
      </div>
    );
  }

  const metricGroups = latestSnapshot?.values ? groupMetricsByCategory(latestSnapshot.values) : {};

  return (
    <motion.main
      variants={sectionVariants}
      initial="offscreen"
      animate="onscreen"
      viewport={viewportOnce}
      style={{
        background: colors.surface.bg,
        minHeight: '100vh',
        padding: spacing.xl,
        width: '100%',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.xl }}>
        <div style={{ flex: 1 }}>
          <PlayerHeaderCard
            name={player.fullName || 'Unknown Player'}
            avatar={player.avatar}
            ageGroup={getAgeGroup(player.dateOfBirth) || player.ageGroup}
            centre={player.center?.name}
            primaryPosition={player.primaryPosition}
            preferredFoot={player.preferredFoot as 'Left' | 'Right' | 'Both' | undefined}
            team={player.team}
          />
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: spacing.sm, marginLeft: spacing.lg, flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/realverse/scouting/compare?playerIds=${studentId}&position=${latestSnapshot?.positional?.[0]?.position || 'CM'}`)}
            >
              Compare Player
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/realverse/scouting/board')}
            >
              Scouting Board
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate(`/realverse/parent-reports/manage/${studentId}`)}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/realverse/admin/season-planning/load-dashboard/${studentId}`)}
            >
              📊 Load Dashboard
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/realverse/parent-reports/manage/${studentId}`)}
            >
              Generate Parent Report
            </Button>
          </div>
        )}
      </div>

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
          { key: 'notes' as Tab, label: 'Notes & Feedback' },
          ...(canEdit ? [{ key: 'edit' as Tab, label: 'Create Snapshot' }] : []),
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
              {latestSnapshot?.readiness && latestSnapshot.readiness.overall !== undefined && (
                <ReadinessCard
                  readiness={{
                    overall: latestSnapshot.readiness.overall || 0,
                    technical: latestSnapshot.readiness.technical || 0,
                    physical: latestSnapshot.readiness.physical || 0,
                    mental: latestSnapshot.readiness.mental || 0,
                    attitude: latestSnapshot.readiness.attitude || 0,
                    tacticalFit: latestSnapshot.readiness.tacticalFit || 0,
                    explanationJson: latestSnapshot.readiness.explanationJson,
                  }}
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
                        No data available
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
                        No data available
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Position Suitability */}
              {latestSnapshot?.positional && Array.isArray(latestSnapshot.positional) && latestSnapshot.positional.length > 0 && (
                <PositionSuitabilityGrid positions={latestSnapshot.positional} />
              )}

              {/* Recent Coach Notes */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                  Recent Coach Notes
                </h3>
                <div style={{ color: colors.text.muted, ...typography.body, fontSize: typography.fontSize.sm }}>
                  {latestSnapshot?.notes || 'No notes available'}
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
                  metrics={(metrics || []).map((m) => ({
                    id: m.id,
                    name: m.metricDefinition?.displayName || 'Unknown',
                    value: m.valueNumber,
                    delta: m.delta,
                    definition: m.metricDefinition?.definition,
                    confidence: m.confidence,
                    comment: m.comment,
                    category: m.metricDefinition?.category || category,
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
                    No metrics available. {canEdit && 'Create a snapshot to add metrics.'}
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
            <SnapshotTimeline
              snapshots={(snapshots || []).map(s => ({
                id: s.id,
                createdAt: s.createdAt,
                createdBy: s.createdBy || { fullName: 'Unknown' },
                sourceContext: s.sourceContext,
                notes: s.notes,
                readiness: s.readiness,
              }))}
              onSnapshotClick={(id) => {
                // Could open detailed view
                console.log('Snapshot clicked:', id);
              }}
              onCompareClick={(id1, id2) => {
                // Open comparison modal
                console.log('Compare:', id1, id2);
              }}
            />
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
              isOwnView={isOwnView}
              canEdit={canEdit}
            />
          </motion.div>
        )}

        {activeTab === 'edit' && canEdit && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SnapshotEditor
              studentId={studentId}
              onSave={(snapshotId) => {
                // Reload data after saving
                loadPlayerData();
                setActiveTab('overview');
              }}
              onCancel={() => setActiveTab('overview')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};

export default PlayerProfilePage;


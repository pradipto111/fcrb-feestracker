/**
 * Trial Board Page
 * 
 * Decision workspace for comparing trialists and making decisions
 * Supports grid, table, and compare views
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

interface TrialistCard {
  trialistId: number;
  trialistName: string;
  age?: number;
  primaryPosition?: string;
  preferredFoot?: string;
  overallScore?: number;
  recommendedAction?: string;
  latestReportDate?: string;
  keyMetrics: Array<{ key: string; displayName: string; value: number }>;
}

type ViewMode = 'grid' | 'table' | 'compare';

const TrialBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTrialists, setSelectedTrialists] = useState<number[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    searchParams.get('eventId') ? Number(searchParams.get('eventId')) : null
  );
  const [filters, setFilters] = useState({
    position: '',
    ageGroup: '',
    recommendedAction: '',
    confidenceMin: undefined as number | undefined,
  });
  const [trialists, setTrialists] = useState<TrialistCard[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [showAddTrialistModal, setShowAddTrialistModal] = useState(false);
  const [availableTrialists, setAvailableTrialists] = useState<any[]>([]);
  const [newTrialistForm, setNewTrialistForm] = useState({
    fullName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    primaryPosition: '',
    preferredFoot: '',
    ageGroup: '',
  });
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    if (user) {
      loadEvents();
      if (selectedEventId) {
        loadTrialists();
      }
    }
  }, [user, selectedEventId, filters]);

  useEffect(() => {
    if (showAddTrialistModal) {
      loadAvailableTrialists();
    }
  }, [showAddTrialistModal]);

  const loadEvents = async () => {
    try {
      const response = await api.getTrialEvents();
      setEvents(response.events || []);
      if (!selectedEventId && response.events && response.events.length > 0) {
        setSelectedEventId(response.events[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load events:', err);
    }
  };

  const loadAvailableTrialists = async () => {
    try {
      const response = await api.getTrialists();
      setAvailableTrialists(response.trialists || []);
    } catch (err) {
      console.error('Failed to load available trialists:', err);
    }
  };

  const handleAddExistingTrialist = async (trialistId: number) => {
    if (!selectedEventId) return;
    try {
      await api.addTrialistToEvent(selectedEventId, { trialistId });
      setShowAddTrialistModal(false);
      loadTrialists();
    } catch (err: any) {
      setError(err.message || 'Failed to add trialist to event');
    }
  };

  const handleCreateAndAddTrialist = async () => {
    if (!selectedEventId) return;
    try {
      setCreatingNew(true);
      setError('');
      // Create new trialist
      const newTrialist = await api.createTrialist({
        fullName: newTrialistForm.fullName,
        dateOfBirth: newTrialistForm.dateOfBirth || undefined,
        email: newTrialistForm.email || undefined,
        phone: newTrialistForm.phone || undefined,
        primaryPosition: newTrialistForm.primaryPosition || undefined,
        preferredFoot: newTrialistForm.preferredFoot || undefined,
        ageGroup: newTrialistForm.ageGroup || undefined,
      });
      // Add to event
      await api.addTrialistToEvent(selectedEventId, { trialistId: newTrialist.id });
      setShowAddTrialistModal(false);
      setNewTrialistForm({
        fullName: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        primaryPosition: '',
        preferredFoot: '',
        ageGroup: '',
      });
      loadTrialists();
    } catch (err: any) {
      setError(err.message || 'Failed to create and add trialist');
    } finally {
      setCreatingNew(false);
    }
  };

  const loadTrialists = async () => {
    if (!selectedEventId) return;
    setLoading(true);
    try {
      setError('');
      const event = await api.getTrialEvent(selectedEventId);
      const trialistList = event.trialists || [];

      // Load reports for these trialists
      const reportsResponse = await api.getTrialReports({
        trialEventId: selectedEventId,
        position: filters.position || undefined,
        ageGroup: filters.ageGroup || undefined,
        recommendedAction: filters.recommendedAction || undefined,
      });

      const reportsData = reportsResponse.reports || [];
      setReports(reportsData);

      // Build trialist cards with latest report data
      const cards: TrialistCard[] = trialistList.map((link: any) => {
        const trialist = link.trialist;
        const trialistReports = reportsData.filter((r: any) => r.trialistId === trialist.id);
        const latestReport = trialistReports[0]; // Already sorted by date desc

        return {
          trialistId: trialist.id,
          trialistName: trialist.fullName,
          age: trialist.dateOfBirth ? new Date().getFullYear() - new Date(trialist.dateOfBirth).getFullYear() : undefined,
          primaryPosition: trialist.primaryPosition,
          preferredFoot: trialist.preferredFoot,
          overallScore: latestReport?.overallScore,
          recommendedAction: latestReport?.recommendedAction,
          latestReportDate: latestReport?.createdAt,
          keyMetrics: latestReport?.values?.slice(0, 3).map((v: any) => ({
            key: v.templateItem.metricKey,
            displayName: v.templateItem.displayName,
            value: v.value,
          })) || [],
        };
      });

      // Filter by position if specified
      let filtered = cards;
      if (filters.position) {
        filtered = filtered.filter(c => c.primaryPosition === filters.position);
      }

      setTrialists(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load trialists');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case 'SELECT_NOW': return colors.success.main;
      case 'INVITE_BACK': return colors.primary.main;
      case 'DEVELOPMENT_POOL': return colors.info.main;
      case 'NOT_SELECTED': return colors.text.muted;
      default: return colors.warning.main;
    }
  };

  const handleCompare = () => {
    if (selectedTrialists.length < 2) {
      setError('Select at least 2 trialists to compare');
      return;
    }
    if (!filters.position || !filters.ageGroup) {
      setError('Position and age group are required for comparison');
      return;
    }
    navigate(`/realverse/trials/compare?trialistIds=${selectedTrialists.join(',')}&position=${filters.position}&ageGroup=${filters.ageGroup}&eventId=${selectedEventId}`);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl, flexWrap: 'wrap', gap: spacing.md }}>
          <div>
            <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.md }}>
              Trial Board
            </h1>
            <p style={{ ...typography.body, color: colors.text.muted }}>
              Compare trialists and make informed decisions
            </p>
          </div>
          {selectedEventId && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowAddTrialistModal(true)}
            >
              + Add Trialist
            </Button>
          )}
        </div>

        {error && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
            <div style={{ color: colors.danger.main }}>{error}</div>
          </Card>
        )}

        {/* Filters & Controls */}
        <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md }}>
            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Trial Event *
              </label>
              <select
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                <option value="">Select event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Position *
              </label>
              <select
                value={filters.position}
                onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                <option value="">All Positions</option>
                <option value="GK">GK</option>
                <option value="CB">CB</option>
                <option value="FB">FB</option>
                <option value="WB">WB</option>
                <option value="DM">DM</option>
                <option value="CM">CM</option>
                <option value="AM">AM</option>
                <option value="W">W</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Age Group *
              </label>
              <input
                type="text"
                value={filters.ageGroup}
                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                placeholder="U13, U15, etc."
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              />
            </div>

            <div>
              <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                Recommendation
              </label>
              <select
                value={filters.recommendedAction}
                onChange={(e) => setFilters({ ...filters, recommendedAction: e.target.value })}
                style={{
                  width: '100%',
                  padding: spacing.sm,
                  background: colors.surface.elevated,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                <option value="">All</option>
                <option value="SELECT_NOW">Select Now</option>
                <option value="INVITE_BACK">Invite Back</option>
                <option value="DEVELOPMENT_POOL">Development Pool</option>
                <option value="NOT_SELECTED">Not Selected</option>
                <option value="NEED_MORE_DATA">Need More Data</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  background: viewMode === 'grid' ? colors.primary.main : 'transparent',
                  color: viewMode === 'grid' ? colors.surface.bg : colors.text.primary,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  background: viewMode === 'table' ? colors.primary.main : 'transparent',
                  color: viewMode === 'table' ? colors.surface.bg : colors.text.primary,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                }}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('compare')}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  background: viewMode === 'compare' ? colors.primary.main : 'transparent',
                  color: viewMode === 'compare' ? colors.surface.bg : colors.text.primary,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  fontSize: typography.fontSize.sm,
                }}
              >
                Compare
              </button>
            </div>

            {selectedTrialists.length >= 2 && (
              <Button variant="primary" size="md" onClick={handleCompare}>
                Compare Selected ({selectedTrialists.length})
              </Button>
            )}
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
            Loading trialists...
          </div>
        ) : !selectedEventId ? (
          <Card variant="default" padding="lg">
            <div style={{ textAlign: 'center', color: colors.text.muted }}>
              Please select a trial event to view trialists
            </div>
          </Card>
        ) : trialists.length === 0 ? (
          <Card variant="default" padding="lg">
            <div style={{ textAlign: 'center', color: colors.text.muted }}>
              <div style={{ marginBottom: spacing.md }}>
                No trialists found matching the filters
              </div>
              {selectedEventId && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowAddTrialistModal(true)}
                >
                  + Add Trialist to Event
                </Button>
              )}
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: spacing.md }}>
            {trialists.map((trialist) => (
              <Card
                key={trialist.trialistId}
                variant="default"
                padding="md"
                style={{
                  cursor: 'pointer',
                  border: selectedTrialists.includes(trialist.trialistId) ? `2px solid ${colors.primary.main}` : undefined,
                }}
                onClick={() => {
                  if (selectedTrialists.includes(trialist.trialistId)) {
                    setSelectedTrialists(selectedTrialists.filter(id => id !== trialist.trialistId));
                  } else {
                    setSelectedTrialists([...selectedTrialists, trialist.trialistId]);
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.sm }}>
                  <div>
                    <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                      {trialist.trialistName}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {trialist.primaryPosition} • {trialist.age ? `Age ${trialist.age}` : 'N/A'}
                    </div>
                  </div>
                  {trialist.recommendedAction && (
                    <div
                      style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: getActionColor(trialist.recommendedAction) + '20',
                        color: getActionColor(trialist.recommendedAction),
                        borderRadius: borderRadius.sm,
                        ...typography.caption,
                        fontSize: typography.fontSize.xs,
                      }}
                    >
                      {trialist.recommendedAction.replace('_', ' ')}
                    </div>
                  )}
                </div>

                {trialist.overallScore !== undefined && (
                  <div style={{ marginBottom: spacing.sm }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                      <span style={{ ...typography.caption, color: colors.text.muted }}>Overall Score</span>
                      <span style={{ ...typography.body, fontWeight: typography.fontWeight.bold, color: colors.primary.main }}>
                        {trialist.overallScore.toFixed(0)}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        background: colors.surface.elevated,
                        borderRadius: borderRadius.sm,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${trialist.overallScore}%`,
                          height: '100%',
                          background: colors.primary.main,
                        }}
                      />
                    </div>
                  </div>
                )}

                {trialist.keyMetrics.length > 0 && (
                  <div style={{ marginTop: spacing.sm }}>
                    {trialist.keyMetrics.map((metric) => (
                      <div key={metric.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                        <span style={{ ...typography.caption, color: colors.text.muted }}>{metric.displayName}</span>
                        <span style={{ ...typography.caption, color: colors.text.primary }}>{metric.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: spacing.sm, display: 'flex', gap: spacing.xs }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/realverse/trials/trialists/${trialist.trialistId}${selectedEventId ? `?eventId=${selectedEventId}` : ''}`);
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : viewMode === 'table' ? (
          <Card variant="default" padding="none">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border.medium}`, background: colors.surface.elevated }}>
                    <th style={{ ...typography.caption, color: colors.text.muted, textAlign: 'left', padding: spacing.sm, position: 'sticky', left: 0, background: colors.surface.elevated }}>
                      <input
                        type="checkbox"
                        checked={selectedTrialists.length === trialists.length && trialists.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrialists(trialists.map(t => t.trialistId));
                          } else {
                            setSelectedTrialists([]);
                          }
                        }}
                        style={{ marginRight: spacing.xs }}
                      />
                      Name
                    </th>
                    <th style={{ ...typography.caption, color: colors.text.muted, textAlign: 'center', padding: spacing.sm }}>Position</th>
                    <th style={{ ...typography.caption, color: colors.text.muted, textAlign: 'center', padding: spacing.sm }}>Age</th>
                    <th style={{ ...typography.caption, color: colors.text.muted, textAlign: 'center', padding: spacing.sm }}>Score</th>
                    <th style={{ ...typography.caption, color: colors.text.muted, textAlign: 'center', padding: spacing.sm }}>Recommendation</th>
                    {trialists[0]?.keyMetrics.map((metric) => (
                      <th key={metric.key} style={{ ...typography.caption, color: colors.text.muted, textAlign: 'center', padding: spacing.sm }}>
                        {metric.displayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trialists.map((trialist) => (
                    <tr
                      key={trialist.trialistId}
                      style={{
                        borderBottom: `1px solid ${colors.border.medium}`,
                        cursor: 'pointer',
                        background: selectedTrialists.includes(trialist.trialistId) ? colors.primary.soft : 'transparent',
                      }}
                      onClick={() => {
                        if (selectedTrialists.includes(trialist.trialistId)) {
                          setSelectedTrialists(selectedTrialists.filter(id => id !== trialist.trialistId));
                        } else {
                          setSelectedTrialists([...selectedTrialists, trialist.trialistId]);
                        }
                      }}
                    >
                      <td style={{ padding: spacing.sm, position: 'sticky', left: 0, background: selectedTrialists.includes(trialist.trialistId) ? colors.primary.soft : colors.surface.bg }}>
                        <input
                          type="checkbox"
                          checked={selectedTrialists.includes(trialist.trialistId)}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginRight: spacing.xs }}
                        />
                        {trialist.trialistName}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: 'center', ...typography.body, fontSize: typography.fontSize.sm }}>
                        {trialist.primaryPosition || '-'}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: 'center', ...typography.body, fontSize: typography.fontSize.sm }}>
                        {trialist.age || '-'}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: 'center', ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.primary.main }}>
                        {trialist.overallScore?.toFixed(0) || '-'}
                      </td>
                      <td style={{ padding: spacing.sm, textAlign: 'center' }}>
                        {trialist.recommendedAction && (
                          <span
                            style={{
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: getActionColor(trialist.recommendedAction) + '20',
                              color: getActionColor(trialist.recommendedAction),
                              borderRadius: borderRadius.sm,
                              ...typography.caption,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            {trialist.recommendedAction.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      {trialist.keyMetrics.map((metric) => (
                        <td key={metric.key} style={{ padding: spacing.sm, textAlign: 'center', ...typography.body, fontSize: typography.fontSize.sm }}>
                          {metric.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card variant="default" padding="lg">
            <div style={{ textAlign: 'center', color: colors.text.muted }}>
              Compare view - Select 2-5 trialists and click "Compare Selected"
            </div>
          </Card>
        )}

        {/* Add Trialist Modal */}
        {showAddTrialistModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: spacing.xl,
            }}
            onClick={() => setShowAddTrialistModal(false)}
          >
            <Card
              variant="elevated"
              padding="lg"
              style={{
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <h2 style={{ ...typography.h3, color: colors.text.primary }}>
                  Add Trialist to Event
                </h2>
                <button
                  onClick={() => setShowAddTrialistModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.text.muted,
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: spacing.xs,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Tabs: Existing vs New */}
              <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.lg, borderBottom: `1px solid ${colors.border.medium}` }}>
                <button
                  onClick={() => setNewTrialistForm({
                    fullName: '',
                    dateOfBirth: '',
                    email: '',
                    phone: '',
                    primaryPosition: '',
                    preferredFoot: '',
                    ageGroup: '',
                  })}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${colors.primary.main}`,
                    color: colors.text.primary,
                    cursor: 'pointer',
                    ...typography.body,
                  }}
                >
                  Add Existing Trialist
                </button>
                <button
                  onClick={() => setNewTrialistForm({
                    fullName: '',
                    dateOfBirth: '',
                    email: '',
                    phone: '',
                    primaryPosition: '',
                    preferredFoot: '',
                    ageGroup: '',
                  })}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${colors.primary.main}`,
                    color: colors.text.primary,
                    cursor: 'pointer',
                    ...typography.body,
                  }}
                >
                  Create New Trialist
                </button>
              </div>

              {/* Existing Trialists List */}
              {availableTrialists.length > 0 && (
                <div style={{ marginBottom: spacing.lg }}>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                    Select Existing Trialist
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, maxHeight: '300px', overflowY: 'auto' }}>
                    {availableTrialists
                      .filter(t => {
                        // Filter out trialists already in the event
                        const eventTrialistIds = trialists.map(tr => tr.trialistId);
                        return !eventTrialistIds.includes(t.id);
                      })
                      .map((trialist) => (
                        <div
                          key={trialist.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: spacing.md,
                            background: colors.surface.elevated,
                            borderRadius: borderRadius.md,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleAddExistingTrialist(trialist.id)}
                        >
                          <div>
                            <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                              {trialist.fullName}
                            </div>
                            <div style={{ ...typography.caption, color: colors.text.muted }}>
                              {trialist.primaryPosition || 'N/A'} • {trialist.ageGroup || 'N/A'}
                            </div>
                          </div>
                          <Button variant="primary" size="sm">
                            Add
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Create New Trialist Form */}
              <div>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                  Create New Trialist
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newTrialistForm.fullName}
                      onChange={(e) => setNewTrialistForm({ ...newTrialistForm, fullName: e.target.value })}
                      placeholder="Enter trialist name"
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        ...typography.body,
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                    <div>
                      <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={newTrialistForm.dateOfBirth}
                        onChange={(e) => setNewTrialistForm({ ...newTrialistForm, dateOfBirth: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          background: colors.surface.elevated,
                          border: `1px solid ${colors.border.medium}`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          ...typography.body,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                        Age Group
                      </label>
                      <input
                        type="text"
                        value={newTrialistForm.ageGroup}
                        onChange={(e) => setNewTrialistForm({ ...newTrialistForm, ageGroup: e.target.value })}
                        placeholder="U13, U15, etc."
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          background: colors.surface.elevated,
                          border: `1px solid ${colors.border.medium}`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          ...typography.body,
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                    <div>
                      <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                        Primary Position
                      </label>
                      <select
                        value={newTrialistForm.primaryPosition}
                        onChange={(e) => setNewTrialistForm({ ...newTrialistForm, primaryPosition: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          background: colors.surface.elevated,
                          border: `1px solid ${colors.border.medium}`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          ...typography.body,
                        }}
                      >
                        <option value="">Select position...</option>
                        <option value="GK">GK</option>
                        <option value="CB">CB</option>
                        <option value="FB">FB</option>
                        <option value="WB">WB</option>
                        <option value="DM">DM</option>
                        <option value="CM">CM</option>
                        <option value="AM">AM</option>
                        <option value="W">W</option>
                        <option value="ST">ST</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                        Preferred Foot
                      </label>
                      <select
                        value={newTrialistForm.preferredFoot}
                        onChange={(e) => setNewTrialistForm({ ...newTrialistForm, preferredFoot: e.target.value })}
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          background: colors.surface.elevated,
                          border: `1px solid ${colors.border.medium}`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          ...typography.body,
                        }}
                      >
                        <option value="">Select...</option>
                        <option value="LEFT">Left</option>
                        <option value="RIGHT">Right</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                    <div>
                      <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={newTrialistForm.email}
                        onChange={(e) => setNewTrialistForm({ ...newTrialistForm, email: e.target.value })}
                        placeholder="email@example.com"
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          background: colors.surface.elevated,
                          border: `1px solid ${colors.border.medium}`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          ...typography.body,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newTrialistForm.phone}
                        onChange={(e) => setNewTrialistForm({ ...newTrialistForm, phone: e.target.value })}
                        placeholder="+91 1234567890"
                        style={{
                          width: '100%',
                          padding: spacing.sm,
                          background: colors.surface.elevated,
                          border: `1px solid ${colors.border.medium}`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          ...typography.body,
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.md }}>
                    <Button variant="secondary" onClick={() => setShowAddTrialistModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreateAndAddTrialist}
                      disabled={!newTrialistForm.fullName || creatingNew}
                    >
                      {creatingNew ? 'Adding...' : 'Create & Add to Event'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Section>
    </motion.main>
  );
};

export default TrialBoardPage;


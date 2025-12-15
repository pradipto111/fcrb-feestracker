/**
 * Trialist Detail Page
 * 
 * CRM-style page for managing individual trialists
 * - View trialist information
 * - Create/edit trial reports
 * - View report history
 * - Make decisions based on data
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { PageShell } from '../components/ui/PageShell';
import { CloseIcon } from '../components/icons/IconSet';

const TrialistDetailPage: React.FC = () => {
  const { trialistId } = useParams<{ trialistId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const eventId = searchParams.get('eventId');

  const [trialist, setTrialist] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(eventId ? Number(eventId) : null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [reportForm, setReportForm] = useState({
    observedPosition: '',
    ageGroup: '',
    observationType: 'LIVE_MATCH' as string,
    confidence: 80,
    minutesObserved: 90,
    weatherNotes: '',
    pitchNotes: '',
    strengths: [] as string[],
    risks: [] as string[],
    coachSummary: '',
    recommendedAction: 'NEED_MORE_DATA' as string,
    decisionNotes: '',
    metricValues: {} as Record<number, { value: number; comment?: string; confidence?: number }>,
    positional: {} as Record<string, { suitability: number; comment?: string }>,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (trialistId) {
      loadData();
    }
  }, [trialistId, selectedEventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [trialistData, eventsData, templatesData, reportsData] = await Promise.all([
        api.getTrialist(Number(trialistId)),
        api.getTrialEvents(),
        api.getTrialTemplates({ positionScope: 'ALL' }),
        selectedEventId ? api.getTrialReports({ trialistId: Number(trialistId), trialEventId: selectedEventId }) : Promise.resolve({ reports: [] }),
      ]);
      setTrialist(trialistData);
      setEvents(eventsData.events || []);
      setTemplates(templatesData.templates || []);
      setReports(reportsData.reports || []);
      if (eventsData.events && eventsData.events.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsData.events[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trialist data');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (templateId: number) => {
    try {
      const template = await api.getTrialTemplate(templateId);
      // Initialize metric values from template
      const metricValues: Record<number, { value: number; comment?: string; confidence?: number }> = {};
      template.items?.forEach((item: any) => {
        metricValues[item.id] = { value: 50, confidence: 80 };
      });
      setReportForm({ ...reportForm, metricValues });
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  };

  const handleCreateReport = async () => {
    if (!selectedEventId || !selectedTemplateId) {
      setError('Please select an event and template');
      return;
    }
    if (!reportForm.observedPosition || !reportForm.ageGroup) {
      setError('Position and age group are required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const template = templates.find(t => t.id === selectedTemplateId);
      const values = Object.entries(reportForm.metricValues).map(([templateItemId, data]) => ({
        templateItemId: Number(templateItemId),
        value: data.value,
        comment: data.comment,
        confidence: data.confidence,
      }));

      const positional = Object.entries(reportForm.positional).map(([position, data]) => ({
        position,
        suitability: data.suitability,
        comment: data.comment,
      }));

      await api.createTrialReport({
        trialEventId: selectedEventId,
        trialistId: Number(trialistId),
        templateId: selectedTemplateId,
        observedPosition: reportForm.observedPosition,
        ageGroup: reportForm.ageGroup,
        observationType: reportForm.observationType,
        confidence: reportForm.confidence,
        minutesObserved: reportForm.minutesObserved,
        weatherNotes: reportForm.weatherNotes || undefined,
        pitchNotes: reportForm.pitchNotes || undefined,
        strengths: reportForm.strengths,
        risks: reportForm.risks,
        coachSummary: reportForm.coachSummary || undefined,
        recommendedAction: reportForm.recommendedAction,
        decisionNotes: reportForm.decisionNotes || undefined,
        values,
        positional,
      });

      setShowReportForm(false);
      setReportForm({
        observedPosition: '',
        ageGroup: '',
        observationType: 'LIVE_MATCH',
        confidence: 80,
        minutesObserved: 90,
        weatherNotes: '',
        pitchNotes: '',
        strengths: [],
        risks: [],
        coachSummary: '',
        recommendedAction: 'NEED_MORE_DATA',
        decisionNotes: '',
        metricValues: {},
        positional: {},
      });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create report');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading trialist...
        </div>
      </PageShell>
    );
  }

  if (!trialist) {
    return (
      <PageShell>
        <Card variant="default" padding="lg">
          <div style={{ color: colors.danger.main, marginBottom: spacing.md }}>Trialist not found</div>
          <Button variant="secondary" onClick={() => navigate('/realverse/trials/board')}>
            ← Back to Trial Board
          </Button>
        </Card>
      </PageShell>
    );
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const latestReport = reports[0];

  return (
    <PageShell>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Section variant="default" style={{ marginBottom: spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md }}>
            <div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/realverse/trials/board')} style={{ marginBottom: spacing.md }}>
                ← Back to Trial Board
              </Button>
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                {trialist.fullName}
              </h1>
              <div style={{ display: 'flex', gap: spacing.md, ...typography.body, color: colors.text.muted }}>
                <span>{trialist.primaryPosition || 'N/A'}</span>
                {trialist.dateOfBirth && (
                  <>
                    <span>•</span>
                    <span>Age {new Date().getFullYear() - new Date(trialist.dateOfBirth).getFullYear()}</span>
                  </>
                )}
                {trialist.preferredFoot && (
                  <>
                    <span>•</span>
                    <span>{trialist.preferredFoot} foot</span>
                  </>
                )}
              </div>
            </div>
            <Button variant="primary" size="md" onClick={() => setShowReportForm(true)}>
              + Create Trial Report
            </Button>
          </div>
        </Section>

        {error && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
            <div style={{ color: colors.danger.main }}>{error}</div>
          </Card>
        )}

        {/* Trialist Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.lg, marginBottom: spacing.xl }}>
          <Card variant="elevated" padding="lg">
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Personal Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <div>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Date of Birth</div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {trialist.dateOfBirth ? new Date(trialist.dateOfBirth).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Email</div>
                <div style={{ ...typography.body, color: colors.text.primary }}>{trialist.email || 'N/A'}</div>
              </div>
              <div>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Phone</div>
                <div style={{ ...typography.body, color: colors.text.primary }}>{trialist.phone || 'N/A'}</div>
              </div>
              {trialist.guardianPhone && (
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Guardian Phone</div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>{trialist.guardianPhone}</div>
                </div>
              )}
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Football Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              <div>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Primary Position</div>
                <div style={{ ...typography.body, color: colors.text.primary }}>{trialist.primaryPosition || 'N/A'}</div>
              </div>
              {trialist.secondaryPositions && trialist.secondaryPositions.length > 0 && (
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Secondary Positions</div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>{trialist.secondaryPositions.join(', ')}</div>
                </div>
              )}
              {trialist.currentClub && (
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Current Club</div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>{trialist.currentClub}</div>
                </div>
              )}
              {trialist.location && (
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Location</div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>{trialist.location}</div>
                </div>
              )}
            </div>
          </Card>

          {latestReport && (
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Latest Report</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {latestReport.overallScore !== null && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                      <span style={{ ...typography.caption, color: colors.text.muted }}>Overall Score</span>
                      <span style={{ ...typography.h3, color: colors.primary.main }}>{latestReport.overallScore.toFixed(0)}</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        background: colors.surface.elevated,
                        borderRadius: borderRadius.sm,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${latestReport.overallScore}%`,
                          height: '100%',
                          background: colors.primary.main,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Recommendation</div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {latestReport.recommendedAction?.replace(/_/g, ' ') || 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Report Date</div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {new Date(latestReport.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Report History */}
        {reports.length > 0 && (
          <Section variant="default" style={{ marginBottom: spacing.xl }}>
            <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>Report History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {reports.map((report) => (
                <Card key={report.id} variant="elevated" padding="lg">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing.md }}>
                    <div>
                      <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                        {report.trialEvent?.title || 'Trial Event'}
                      </div>
                      <div style={{ ...typography.caption, color: colors.text.muted }}>
                        {new Date(report.createdAt).toLocaleDateString()} • {report.observedPosition} • {report.ageGroup}
                      </div>
                    </div>
                    {report.overallScore !== null && (
                      <div style={{ ...typography.h4, color: colors.primary.main }}>
                        {report.overallScore.toFixed(0)}
                      </div>
                    )}
                  </div>
                  {report.coachSummary && (
                    <div style={{ marginBottom: spacing.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Summary</div>
                      <div style={{ ...typography.body, color: colors.text.primary }}>{report.coachSummary}</div>
                    </div>
                  )}
                  {report.strengths && report.strengths.length > 0 && (
                    <div style={{ marginBottom: spacing.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Strengths</div>
                      <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
                        {report.strengths.map((s: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: colors.success.main + '20',
                              color: colors.success.main,
                              borderRadius: borderRadius.sm,
                              ...typography.caption,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.risks && report.risks.length > 0 && (
                    <div style={{ marginBottom: spacing.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Risks</div>
                      <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
                        {report.risks.map((r: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: colors.warning?.main + '20' || colors.accent.main + '20',
                              color: colors.warning?.main || colors.accent.main,
                              borderRadius: borderRadius.sm,
                              ...typography.caption,
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>Recommendation</div>
                    <div style={{ ...typography.body, color: colors.text.primary }}>
                      {report.recommendedAction?.replace(/_/g, ' ') || 'N/A'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* Report Form Modal */}
        {showReportForm && (
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
              overflow: 'auto',
            }}
            onClick={() => !saving && setShowReportForm(false)}
          >
            <Card
              variant="elevated"
              padding="lg"
              style={{
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e?.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <h2 style={{ ...typography.h3, color: colors.text.primary }}>Create Trial Report</h2>
                  <button
                    onClick={() => {
                      if (!saving) setShowReportForm(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: colors.text.muted,
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: spacing.xs,
                    }}
                  >
                    <CloseIcon size={14} />
                  </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                {/* Event & Template Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
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
                        ...typography.body,
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
                      Evaluation Template *
                    </label>
                    <select
                      value={selectedTemplateId || ''}
                      onChange={(e) => {
                        const templateId = e.target.value ? Number(e.target.value) : null;
                        setSelectedTemplateId(templateId);
                        if (templateId) loadTemplate(templateId);
                      }}
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
                      <option value="">Select template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Observed Position *
                    </label>
                    <select
                      value={reportForm.observedPosition}
                      onChange={(e) => setReportForm({ ...reportForm, observedPosition: e.target.value })}
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
                      value={reportForm.ageGroup}
                      onChange={(e) => setReportForm({ ...reportForm, ageGroup: e.target.value })}
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
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Observation Type
                    </label>
                    <select
                      value={reportForm.observationType}
                      onChange={(e) => setReportForm({ ...reportForm, observationType: e.target.value })}
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
                      <option value="LIVE_MATCH">Live Match</option>
                      <option value="TRAINING_SESSION">Training Session</option>
                      <option value="VIDEO_REVIEW">Video Review</option>
                      <option value="COMBINED">Combined</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Minutes Observed
                    </label>
                    <input
                      type="number"
                      value={reportForm.minutesObserved}
                      onChange={(e) => setReportForm({ ...reportForm, minutesObserved: Number(e.target.value) })}
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
                      Confidence (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={reportForm.confidence}
                      onChange={(e) => setReportForm({ ...reportForm, confidence: Number(e.target.value) })}
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

                {/* Metric Values */}
                {selectedTemplate && selectedTemplate.items && (
                  <div>
                    <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Metric Evaluation</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                      {selectedTemplate.items.map((item: any) => (
                        <div key={item.id} style={{ padding: spacing.md, background: colors.surface.elevated, borderRadius: borderRadius.md }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                            <div>
                              <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                                {item.displayName}
                              </div>
                              {item.description && (
                                <div style={{ ...typography.caption, color: colors.text.muted }}>{item.description}</div>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={reportForm.metricValues[item.id]?.value || 50}
                                onChange={(e) => setReportForm({
                                  ...reportForm,
                                  metricValues: {
                                    ...reportForm.metricValues,
                                    [item.id]: {
                                      ...reportForm.metricValues[item.id],
                                      value: Number(e.target.value),
                                    },
                                  },
                                })}
                                style={{
                                  width: '80px',
                                  padding: spacing.xs,
                                  background: colors.surface.bg,
                                  border: `1px solid ${colors.border.medium}`,
                                  borderRadius: borderRadius.sm,
                                  color: colors.text.primary,
                                  textAlign: 'center',
                                  ...typography.body,
                                }}
                              />
                              <div style={{ minWidth: '200px', height: '8px', background: colors.surface.dark, borderRadius: borderRadius.sm, overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${reportForm.metricValues[item.id]?.value || 50}%`,
                                    height: '100%',
                                    background: colors.primary.main,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <textarea
                            placeholder="Optional comment..."
                            value={reportForm.metricValues[item.id]?.comment || ''}
                            onChange={(e) => setReportForm({
                              ...reportForm,
                              metricValues: {
                                ...reportForm.metricValues,
                                [item.id]: {
                                  ...reportForm.metricValues[item.id],
                                  comment: e.target.value,
                                },
                              },
                            })}
                            style={{
                              width: '100%',
                              padding: spacing.sm,
                              background: colors.surface.bg,
                              border: `1px solid ${colors.border.medium}`,
                              borderRadius: borderRadius.sm,
                              color: colors.text.primary,
                              ...typography.body,
                              minHeight: '60px',
                              resize: 'vertical',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Risks */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Strengths (max 3)
                    </label>
                    <input
                      type="text"
                      placeholder="Add strength (press Enter)"
                      onKeyDown={(e) => {
                        if (e && e.key === 'Enter' && e.currentTarget.value.trim() && reportForm.strengths.length < 3) {
                          setReportForm({
                            ...reportForm,
                            strengths: [...reportForm.strengths, e.currentTarget.value.trim()],
                          });
                          e.currentTarget.value = '';
                        }
                      }}
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
                    <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap', marginTop: spacing.sm }}>
                      {reportForm.strengths.map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: `${spacing.xs} ${spacing.sm}`,
                            background: colors.success.main + '20',
                            color: colors.success.main,
                            borderRadius: borderRadius.sm,
                            ...typography.caption,
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.xs,
                          }}
                        >
                          {s}
                          <button
                            onClick={() => setReportForm({ ...reportForm, strengths: reportForm.strengths.filter((_, i) => i !== idx) })}
                            style={{ background: 'transparent', border: 'none', color: colors.success.main, cursor: 'pointer' }}
                          >
                            <CloseIcon size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Risks (max 3)
                    </label>
                    <input
                      type="text"
                      placeholder="Add risk (press Enter)"
                      onKeyDown={(e) => {
                        if (e && e.key === 'Enter' && e.currentTarget.value.trim() && reportForm.risks.length < 3) {
                          setReportForm({
                            ...reportForm,
                            risks: [...reportForm.risks, e.currentTarget.value.trim()],
                          });
                          e.currentTarget.value = '';
                        }
                      }}
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
                    <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap', marginTop: spacing.sm }}>
                      {reportForm.risks.map((r, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: `${spacing.xs} ${spacing.sm}`,
                            background: colors.warning?.main + '20' || colors.accent.main + '20',
                            color: colors.warning?.main || colors.accent.main,
                            borderRadius: borderRadius.sm,
                            ...typography.caption,
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing.xs,
                          }}
                        >
                          {r}
                          <button
                            onClick={() => setReportForm({ ...reportForm, risks: reportForm.risks.filter((_, i) => i !== idx) })}
                            style={{ background: 'transparent', border: 'none', color: colors.warning?.main || colors.accent.main, cursor: 'pointer' }}
                          >
                            <CloseIcon size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary & Recommendation */}
                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Coach Summary
                  </label>
                  <textarea
                    value={reportForm.coachSummary}
                    onChange={(e) => setReportForm({ ...reportForm, coachSummary: e.target.value })}
                    placeholder="Overall assessment and observations..."
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.medium}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      ...typography.body,
                      minHeight: '100px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Recommended Action *
                  </label>
                  <select
                    value={reportForm.recommendedAction}
                    onChange={(e) => setReportForm({ ...reportForm, recommendedAction: e.target.value })}
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
                    <option value="NEED_MORE_DATA">Need More Data</option>
                    <option value="SELECT_NOW">Select Now</option>
                    <option value="INVITE_BACK">Invite Back</option>
                    <option value="DEVELOPMENT_POOL">Development Pool</option>
                    <option value="NOT_SELECTED">Not Selected</option>
                  </select>
                </div>

                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Decision Notes (Internal)
                  </label>
                  <textarea
                    value={reportForm.decisionNotes}
                    onChange={(e) => setReportForm({ ...reportForm, decisionNotes: e.target.value })}
                    placeholder="Internal notes for decision rationale..."
                    style={{
                      width: '100%',
                      padding: spacing.sm,
                      background: colors.surface.elevated,
                      border: `1px solid ${colors.border.medium}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      ...typography.body,
                      minHeight: '80px',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => setShowReportForm(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleCreateReport} disabled={saving || !selectedEventId || !selectedTemplateId}>
                    {saving ? 'Saving...' : 'Create Report'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default TrialistDetailPage;


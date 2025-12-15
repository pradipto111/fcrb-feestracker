/**
 * Trial Report Form Page
 * 
 * Mobile-friendly form for coaches to create trial reports
 * - Fast form entry
 * - Autosave draft
 * - Works on mobile at the ground
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
import { Input } from '../components/ui/Input';
import { PageShell } from '../components/ui/PageShell';
import { CloseIcon, PlusIcon } from '../components/icons/IconSet';

const TrialReportFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const eventId = searchParams.get('eventId');
  const trialistId = searchParams.get('trialistId');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<any>(null);
  const [trialist, setTrialist] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
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
  });

  const [strengthInput, setStrengthInput] = useState('');
  const [riskInput, setRiskInput] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [eventId, trialistId]);

  useEffect(() => {
    if (selectedTemplateId) {
      loadTemplate(selectedTemplateId);
    }
  }, [selectedTemplateId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      const promises: Promise<any>[] = [];
      if (eventId) {
        promises.push(api.getTrialEvent(Number(eventId)));
      }
      if (trialistId) {
        promises.push(api.getTrialist(Number(trialistId)));
      }
      promises.push(api.getTrialTemplates({}));

      const results = await Promise.all(promises);
      let eventData = null;
      let trialistData = null;
      let templatesData: any = { templates: [] };

      if (eventId) {
        eventData = results[0];
        trialistData = trialistId ? results[1] : null;
        templatesData = trialistId ? results[2] : results[1];
      } else {
        trialistData = results[0];
        templatesData = results[1];
      }

      setEvent(eventData);
      setTrialist(trialistData);
      setTemplates(templatesData.templates || []);

      if (eventData) {
        setFormData(prev => ({
          ...prev,
          ageGroup: eventData.ageGroups?.[0] || '',
        }));
      }

      if (trialistData?.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(trialistData.dateOfBirth).getFullYear();
        const ageGroup = age < 13 ? 'U13' : age < 15 ? 'U15' : age < 17 ? 'U17' : age < 19 ? 'U19' : 'Senior';
        setFormData(prev => ({
          ...prev,
          ageGroup: prev.ageGroup || ageGroup,
          observedPosition: prev.observedPosition || trialistData.primaryPosition || '',
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async (templateId: number) => {
    try {
      const template = await api.getTrialTemplate(templateId);
      setSelectedTemplate(template);
      
      // Initialize metric values
      const metricValues: Record<number, { value: number; comment?: string; confidence?: number }> = {};
      template.items?.forEach((item: any) => {
        metricValues[item.id] = { value: 50, confidence: 80 };
      });
      setFormData(prev => ({ ...prev, metricValues }));
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    }
  };

  const handleAddStrength = () => {
    if (strengthInput.trim() && formData.strengths.length < 3) {
      setFormData(prev => ({
        ...prev,
        strengths: [...prev.strengths, strengthInput.trim()],
      }));
      setStrengthInput('');
    }
  };

  const handleRemoveStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index),
    }));
  };

  const handleAddRisk = () => {
    if (riskInput.trim() && formData.risks.length < 3) {
      setFormData(prev => ({
        ...prev,
        risks: [...prev.risks, riskInput.trim()],
      }));
      setRiskInput('');
    }
  };

  const handleRemoveRisk = (index: number) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!eventId || !trialistId || !selectedTemplateId) {
      setError('Event, trialist, and template are required');
      return;
    }

    if (!formData.observedPosition || !formData.ageGroup) {
      setError('Position and age group are required');
      return;
    }

    if ((formData.recommendedAction === 'SELECT_NOW' || formData.recommendedAction === 'NOT_SELECTED') && !formData.coachSummary) {
      setError('Summary note is required for this recommendation');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const metricValues = Object.entries(formData.metricValues).map(([templateItemId, data]) => ({
        templateItemId: Number(templateItemId),
        value: data.value,
        comment: data.comment,
        confidence: data.confidence,
      }));

      await api.createTrialReport({
        trialEventId: Number(eventId),
        trialistId: Number(trialistId),
        templateId: selectedTemplateId,
        observedPosition: formData.observedPosition,
        ageGroup: formData.ageGroup,
        observationType: formData.observationType,
        confidence: formData.confidence,
        minutesObserved: formData.minutesObserved,
        weatherNotes: formData.weatherNotes || undefined,
        pitchNotes: formData.pitchNotes || undefined,
        strengths: formData.strengths,
        risks: formData.risks,
        coachSummary: formData.coachSummary || undefined,
        recommendedAction: formData.recommendedAction,
        decisionNotes: formData.decisionNotes || undefined,
        metricValues,
      });

      // Navigate back
      if (eventId) {
        navigate(`/realverse/trials/events/${eventId}`);
      } else if (trialistId) {
        navigate(`/realverse/trials/trialists/${trialistId}`);
      } else {
        navigate('/realverse/trials/board');
      }
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
          Loading...
        </div>
      </PageShell>
    );
  }

  if (!event && !trialist) {
    return (
      <PageShell>
        <Card variant="default" padding="lg">
          <div style={{ color: colors.danger.main, marginBottom: spacing.md }}>Event or trialist not found</div>
          <Button variant="secondary" onClick={() => navigate('/realverse/trials/board')}>
            ← Back to Trial Board
          </Button>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: colors.surface.bg,
          minHeight: '100vh',
          padding: spacing.md,
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <Section>
          <div style={{ marginBottom: spacing.lg }}>
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)} style={{ marginBottom: spacing.md }}>
              ← Back
            </Button>
            <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
              Create Trial Report
            </h1>
            {trialist && (
              <div style={{ ...typography.body, color: colors.text.muted }}>
                {trialist.fullName} • {trialist.primaryPosition || 'N/A'}
              </div>
            )}
          </div>

          {error && (
            <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
              <div style={{ color: colors.danger.main }}>{error}</div>
            </Card>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
              {/* Template Selection */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Template</h3>
                <select
                  value={selectedTemplateId || ''}
                  onChange={(e) => setSelectedTemplateId(e.target.value ? Number(e.target.value) : null)}
                  style={{
                    width: '100%',
                    padding: spacing.sm,
                    background: colors.surface.elevated,
                    border: `1px solid ${colors.border.medium}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                  }}
                  required
                >
                  <option value="">Select template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Card>

              {/* Context */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Context</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Observed Position *
                    </label>
                    <select
                      value={formData.observedPosition}
                      onChange={(e) => setFormData({ ...formData, observedPosition: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                      required
                    >
                      <option value="">Select position...</option>
                      <option value="GK">GK</option>
                      <option value="CB">CB</option>
                      <option value="LB">LB</option>
                      <option value="RB">RB</option>
                      <option value="DM">DM</option>
                      <option value="CM">CM</option>
                      <option value="AM">AM</option>
                      <option value="LW">LW</option>
                      <option value="RW">RW</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Age Group *
                    </label>
                    <select
                      value={formData.ageGroup}
                      onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                      required
                    >
                      <option value="">Select age group...</option>
                      <option value="U13">U13</option>
                      <option value="U15">U15</option>
                      <option value="U17">U17</option>
                      <option value="U19">U19</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Observation Type *
                    </label>
                    <select
                      value={formData.observationType}
                      onChange={(e) => setFormData({ ...formData, observationType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                      required
                    >
                      <option value="DRILLS">Drills Only</option>
                      <option value="LIVE_MATCH">Live Match</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Confidence (0-100)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.confidence}
                      onChange={(e) => setFormData({ ...formData, confidence: Number(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                    <div style={{ textAlign: 'center', ...typography.body, color: colors.text.primary, marginTop: spacing.xs }}>
                      {formData.confidence}%
                    </div>
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Minutes Observed
                    </label>
                    <Input
                      type="number"
                      value={formData.minutesObserved}
                      onChange={(e) => setFormData({ ...formData, minutesObserved: Number(e.target.value) })}
                      fullWidth
                    />
                  </div>
                </div>
              </Card>

              {/* Metrics */}
              {selectedTemplate && selectedTemplate.items && selectedTemplate.items.length > 0 && (
                <Card variant="default" padding="lg">
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Metrics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                    {selectedTemplate.items.map((item: any) => (
                      <div key={item.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                          <label style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.medium }}>
                            {item.displayName}
                          </label>
                          <span style={{ ...typography.caption, color: colors.text.muted }}>
                            {formData.metricValues[item.id]?.value || 50}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.metricValues[item.id]?.value || 50}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              metricValues: {
                                ...formData.metricValues,
                                [item.id]: {
                                  ...formData.metricValues[item.id],
                                  value: Number(e.target.value),
                                },
                              },
                            });
                          }}
                          style={{ width: '100%' }}
                        />
                        {item.description && (
                          <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Strengths & Risks */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Strengths (Max 3)</h3>
                <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <Input
                    value={strengthInput}
                    onChange={(e) => setStrengthInput(e.target.value)}
                    placeholder="Add strength..."
                    fullWidth
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStrength();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddStrength}
                    disabled={!strengthInput.trim() || formData.strengths.length >= 3}
                  >
                    Add
                  </Button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                  {formData.strengths.map((strength, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: colors.success.soft,
                        borderRadius: borderRadius.md,
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {strength}
                      <button
                        type="button"
                        onClick={() => handleRemoveStrength(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.text.muted,
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: spacing.xs,
                        }}
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Risks (Max 3)</h3>
                <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.sm }}>
                  <Input
                    value={riskInput}
                    onChange={(e) => setRiskInput(e.target.value)}
                    placeholder="Add risk..."
                    fullWidth
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRisk();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddRisk}
                    disabled={!riskInput.trim() || formData.risks.length >= 3}
                  >
                    Add
                  </Button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                  {formData.risks.map((risk, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: colors.danger.soft,
                        borderRadius: borderRadius.md,
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {risk}
                      <button
                        type="button"
                        onClick={() => handleRemoveRisk(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: colors.text.muted,
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: spacing.xs,
                        }}
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Summary & Recommendation */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Summary & Recommendation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Coach Summary
                      {(formData.recommendedAction === 'SELECT_NOW' || formData.recommendedAction === 'NOT_SELECTED') && (
                        <span style={{ color: colors.danger.main }}> *</span>
                      )}
                    </label>
                    <textarea
                      value={formData.coachSummary}
                      onChange={(e) => setFormData({ ...formData, coachSummary: e.target.value })}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                        fontFamily: typography.fontFamily.primary,
                        resize: 'vertical',
                      }}
                      required={formData.recommendedAction === 'SELECT_NOW' || formData.recommendedAction === 'NOT_SELECTED'}
                    />
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Recommended Action *
                    </label>
                    <select
                      value={formData.recommendedAction}
                      onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                      required
                    >
                      <option value="NEED_MORE_DATA">Need More Data</option>
                      <option value="INVITE_BACK">Invite Back</option>
                      <option value="SELECT_NOW">Select Now</option>
                      <option value="DEVELOPMENT_POOL">Development Pool</option>
                      <option value="NOT_SELECTED">Not Selected</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Decision Notes (Internal)
                    </label>
                    <textarea
                      value={formData.decisionNotes}
                      onChange={(e) => setFormData({ ...formData, decisionNotes: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: spacing.sm,
                        background: colors.surface.elevated,
                        border: `1px solid ${colors.border.medium}`,
                        borderRadius: borderRadius.md,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                        fontFamily: typography.fontFamily.primary,
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* Weather & Pitch Notes */}
              <Card variant="default" padding="lg">
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Conditions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Weather Notes
                    </label>
                    <Input
                      value={formData.weatherNotes}
                      onChange={(e) => setFormData({ ...formData, weatherNotes: e.target.value })}
                      placeholder="e.g., Hot, sunny, 32°C"
                      fullWidth
                    />
                  </div>
                  <div>
                    <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                      Pitch Notes
                    </label>
                    <Input
                      value={formData.pitchNotes}
                      onChange={(e) => setFormData({ ...formData, pitchNotes: e.target.value })}
                      placeholder="e.g., Artificial turf, good condition"
                      fullWidth
                    />
                  </div>
                </div>
              </Card>

              {/* Submit */}
              <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => navigate(-1)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saving}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Saving...' : 'Create Report'}
                </Button>
              </div>
            </div>
          </form>
        </Section>
      </motion.main>
    </PageShell>
  );
};

export default TrialReportFormPage;


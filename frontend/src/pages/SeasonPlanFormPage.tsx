/**
 * Season Plan Form Page
 * 
 * Create or edit a season plan
 * 
 * Note: This is a placeholder/work-in-progress page
 * Full implementation requires backend API endpoints for season plan creation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageShell } from '../components/ui/PageShell';
import { Section } from '../components/ui/Section';

const SeasonPlanFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [centers, setCenters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    seasonStart: '',
    seasonEnd: '',
    centerId: '',
  });

  useEffect(() => {
    loadCenters();
    if (isEdit && id) {
      loadPlan();
    }
  }, [id, isEdit]);

  const loadCenters = async () => {
    try {
      const data = await api.getCenters();
      setCenters(data);
    } catch (err: any) {
      console.error('Failed to load centers:', err);
    }
  };

  const loadPlan = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // TODO: Implement getSeasonPlan API call
      // const plan = await api.getSeasonPlan(Number(id));
      // setFormData({
      //   name: plan.name,
      //   description: plan.description || '',
      //   seasonStart: plan.seasonStart,
      //   seasonEnd: plan.seasonEnd,
      //   centerId: plan.centerId.toString(),
      // });
      setError('Loading season plan data is not yet implemented');
    } catch (err: any) {
      setError(err.message || 'Failed to load season plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Season plan name is required');
      return;
    }
    if (!formData.seasonStart || !formData.seasonEnd) {
      setError('Season start and end dates are required');
      return;
    }
    if (!formData.centerId) {
      setError('Please select a center');
      return;
    }
    if (new Date(formData.seasonStart) >= new Date(formData.seasonEnd)) {
      setError('Season end date must be after start date');
      return;
    }

    try {
      setSaving(true);
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        seasonStart: formData.seasonStart,
        seasonEnd: formData.seasonEnd,
        centerId: Number(formData.centerId),
      };

      if (isEdit && id) {
        // TODO: Implement updateSeasonPlan API call
        // await api.updateSeasonPlan(Number(id), data);
        setError('Updating season plans is not yet implemented');
        return;
      } else {
        // TODO: Implement createSeasonPlan API call
        // await api.createSeasonPlan(data);
        setError('Creating season plans is not yet implemented. This feature is work in progress.');
        return;
      }

      // Navigate back on success
      // navigate('/realverse/admin/season-planning');
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} season plan`);
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

  return (
    <PageShell>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Section variant="default" style={{ marginBottom: spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
            <div>
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                {isEdit ? 'Edit Season Plan' : 'Create Season Plan'}
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary }}>
                {isEdit ? 'Update season plan details' : 'Define a new season structure with phases and training blocks'}
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/realverse/admin/season-planning')}>
              Cancel
            </Button>
          </div>
        </Section>

        {/* Work in Progress Notice */}
        <Card variant="outlined" padding="lg" style={{ 
          marginBottom: spacing.lg,
          background: colors.warning?.soft || colors.surface.soft,
          border: `1px solid ${colors.warning?.main || colors.accent.main}40`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.md }}>
            <div style={{ fontSize: '24px' }}>⚠️</div>
            <div>
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                Work in Progress
              </h3>
              <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                Season plan creation is currently under development. The form is available for testing, but the backend API endpoints need to be implemented.
              </p>
            </div>
          </div>
        </Card>

        {error && (
          <Card variant="outlined" padding="md" style={{ 
            marginBottom: spacing.lg,
            background: colors.danger.soft,
            border: `1px solid ${colors.danger.main}40`,
          }}>
            <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
          </Card>
        )}

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            <div>
              <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                Season Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., 2024-25 Season"
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  ...typography.body,
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of the season plan"
                rows={3}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  ...typography.body,
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.md }}>
              <div>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                  Season Start Date *
                </label>
                <input
                  type="date"
                  value={formData.seasonStart}
                  onChange={(e) => setFormData({ ...formData, seasonStart: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    border: `1px solid ${colors.border.medium}`,
                    borderRadius: borderRadius.md,
                    background: colors.surface.card,
                    color: colors.text.primary,
                    ...typography.body,
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                  Season End Date *
                </label>
                <input
                  type="date"
                  value={formData.seasonEnd}
                  onChange={(e) => setFormData({ ...formData, seasonEnd: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    border: `1px solid ${colors.border.medium}`,
                    borderRadius: borderRadius.md,
                    background: colors.surface.card,
                    color: colors.text.primary,
                    ...typography.body,
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                Center *
              </label>
              <select
                value={formData.centerId}
                onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: spacing.md,
                  border: `1px solid ${colors.border.medium}`,
                  borderRadius: borderRadius.md,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  ...typography.body,
                }}
              >
                <option value="">Select a center...</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: spacing.md, justifyContent: 'flex-end', marginTop: spacing.lg }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/realverse/admin/season-planning')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : isEdit ? 'Update Season Plan' : 'Create Season Plan'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
};

export default SeasonPlanFormPage;


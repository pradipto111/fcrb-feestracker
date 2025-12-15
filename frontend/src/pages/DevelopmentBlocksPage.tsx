/**
 * Development Block Planning Interface
 * 
 * Link planning to specific development goals
 * - Create/edit development blocks
 * - Link to target metrics
 * - Suggest load ranges and session focus distribution
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageShell } from '../components/ui/PageShell';
import { Section } from '../components/ui/Section';

const DevelopmentBlocksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const planId = searchParams.get('planId') ? Number(searchParams.get('planId')) : null;

  const [plan, setPlan] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    focusArea: '',
    targetMetrics: [] as string[],
    suggestedLoadRange: { min: 100, max: 250 },
    sessionFocusDistribution: {
      TECHNICAL: 40,
      TACTICAL: 30,
      PHYSICAL: 20,
      RECOVERY: 10,
    },
    description: '',
  });

  useEffect(() => {
    if (planId) {
      loadData();
    } else {
      loadPlans();
    }
  }, [planId]);

  const loadPlans = async () => {
    try {
      const plans = await api.getSeasonPlans();
      if (plans && plans.length > 0) {
        navigate(`/realverse/admin/season-planning/development-blocks?planId=${plans[0].id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadData = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const [planData, metricsData] = await Promise.all([
        api.getSeasonPlan(planId),
        api.getMetricDefinitions().catch(() => ({ metrics: [] })),
      ]);
      setPlan(planData);
      setBlocks(planData.developmentBlocks || []);
      setAvailableMetrics(metricsData.metrics || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlock = async () => {
    if (!planId) return;
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.focusArea) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await api.createDevelopmentBlock(planId, {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        focusArea: formData.focusArea,
        targetMetrics: formData.targetMetrics,
        suggestedLoadRange: formData.suggestedLoadRange,
        sessionFocusDistribution: formData.sessionFocusDistribution,
        description: formData.description,
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        focusArea: '',
        targetMetrics: [],
        suggestedLoadRange: { min: 100, max: 250 },
        sessionFocusDistribution: {
          TECHNICAL: 40,
          TACTICAL: 30,
          PHYSICAL: 20,
          RECOVERY: 10,
        },
        description: '',
      });
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to create development block');
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading development blocks...
        </div>
      </PageShell>
    );
  }

  if (!plan) {
    return (
      <PageShell>
        <Card variant="default" padding="lg">
          <div style={{ textAlign: 'center' }}>
            <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
              No season plan selected. Please create or select a season plan.
            </p>
            <Button variant="primary" onClick={() => navigate('/realverse/admin/season-planning')}>
              Go to Season Planning
            </Button>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Section variant="default" style={{ marginBottom: spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md }}>
            <div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/realverse/admin/season-planning')} style={{ marginBottom: spacing.md }}>
                ← Back to Season Planning
              </Button>
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                Development Blocks
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary }}>
                Link planning to specific development goals
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              + Create Development Block
            </Button>
          </div>
        </Section>

        {/* Development Blocks List */}
        {blocks.length === 0 ? (
          <Card variant="outlined" padding="lg">
            <div style={{ textAlign: 'center', padding: spacing.xl }}>
              <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
                No development blocks yet. Create your first development block to focus on specific areas.
              </p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Development Block
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {blocks.map((block) => (
              <Card key={block.id} variant="elevated" padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                      {block.name}
                    </h3>
                    <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.sm }}>
                      {block.focusArea}
                    </p>
                    <div style={{ display: 'flex', gap: spacing.md, ...typography.caption, color: colors.text.muted }}>
                      <span>
                        {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                      </span>
                      {block.suggestedLoadRange && (
                        <>
                          <span>•</span>
                          <span>
                            Load: {block.suggestedLoadRange.min} - {block.suggestedLoadRange.max}
                          </span>
                        </>
                      )}
                    </div>
                    {block.targetMetrics && block.targetMetrics.length > 0 && (
                      <div style={{ marginTop: spacing.sm }}>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                          Target Metrics:
                        </div>
                        <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
                          {block.targetMetrics.map((metric: string, idx: number) => (
                            <span
                              key={idx}
                              style={{
                                padding: `${spacing.xs} ${spacing.sm}`,
                                background: colors.primary.main + '20',
                                color: colors.primary.main,
                                borderRadius: borderRadius.sm,
                                ...typography.caption,
                              }}
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.description && (
                      <div style={{ marginTop: spacing.sm, ...typography.body, color: colors.text.secondary }}>
                        {block.description}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
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
            onClick={() => setShowCreateModal(false)}
          >
            <Card
              variant="elevated"
              padding="lg"
              style={{
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e?.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <h2 style={{ ...typography.h3, color: colors.text.primary }}>Create Development Block</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Block Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Ball Retention Focus"
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
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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

                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Focus Area *
                  </label>
                  <input
                    type="text"
                    value={formData.focusArea}
                    onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                    placeholder="e.g., Ball retention, Defensive positioning"
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
                    Suggested Load Range
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.sm }}>
                    <input
                      type="number"
                      value={formData.suggestedLoadRange.min}
                      onChange={(e) => setFormData({
                        ...formData,
                        suggestedLoadRange: { ...formData.suggestedLoadRange, min: Number(e.target.value) },
                      })}
                      placeholder="Min"
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
                    <input
                      type="number"
                      value={formData.suggestedLoadRange.max}
                      onChange={(e) => setFormData({
                        ...formData,
                        suggestedLoadRange: { ...formData.suggestedLoadRange, max: Number(e.target.value) },
                      })}
                      placeholder="Max"
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

                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Session Focus Distribution (%)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing.sm }}>
                    {Object.entries(formData.sessionFocusDistribution).map(([key, value]) => (
                      <div key={key}>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                          {key}
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => setFormData({
                            ...formData,
                            sessionFocusDistribution: {
                              ...formData.sessionFocusDistribution,
                              [key]: Number(e.target.value),
                            },
                          })}
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
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ ...typography.caption, color: colors.text.muted, display: 'block', marginBottom: spacing.xs }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
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

                <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.md }}>
                  <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleCreateBlock}>
                    Create Block
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

export default DevelopmentBlocksPage;


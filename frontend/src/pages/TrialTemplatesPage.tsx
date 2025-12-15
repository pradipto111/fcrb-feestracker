/**
 * Trial Templates List Page (Admin)
 * 
 * List and manage trial metric templates
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { PageShell } from '../components/ui/PageShell';

const TrialTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getTrialTemplates({});
      setTemplates(response.templates || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: number) => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: Delete endpoint may need to be added to backend
      await api.updateTrialTemplate(templateId, { name: 'DELETED', items: [] });
      loadTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading templates...
        </div>
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
          padding: spacing.xl,
        }}
      >
        <Section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
            <div>
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                Trial Metric Templates
              </h1>
              <div style={{ ...typography.body, color: colors.text.muted }}>
                Manage evaluation templates for trial assessments
              </div>
            </div>
            <Button variant="primary" size="md" onClick={() => navigate('/realverse/trials/templates/new')}>
              + Create Template
            </Button>
          </div>

          {error && (
            <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
              <div style={{ color: colors.danger.main }}>{error}</div>
            </Card>
          )}

          {templates.length === 0 ? (
            <Card variant="default" padding="xl" style={{ textAlign: 'center' }}>
              <div style={{ ...typography.h3, color: colors.text.muted, marginBottom: spacing.md }}>
                No templates yet
              </div>
              <div style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing.lg }}>
                Create your first template to get started
              </div>
              <Button variant="primary" size="md" onClick={() => navigate('/realverse/trials/templates/new')}>
                Create Template
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gap: spacing.lg }}>
              {templates.map((template) => (
                <Card key={template.id} variant="elevated" padding="lg">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                        <h3 style={{ ...typography.h4, color: colors.text.primary }}>
                          {template.name}
                        </h3>
                        {template.isDefault && (
                          <span
                            style={{
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: colors.primary.soft,
                              color: colors.primary.main,
                              borderRadius: borderRadius.sm,
                              ...typography.caption,
                              fontWeight: typography.fontWeight.semibold,
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>
                      <div style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing.sm }}>
                        {template.description || 'No description'}
                      </div>
                      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          <strong>Scope:</strong> {template.positionScope}
                        </div>
                        {template.specificPositions && template.specificPositions.length > 0 && (
                          <div style={{ ...typography.caption, color: colors.text.muted }}>
                            <strong>Positions:</strong> {template.specificPositions.join(', ')}
                          </div>
                        )}
                        {template.ageScope && template.ageScope.length > 0 && (
                          <div style={{ ...typography.caption, color: colors.text.muted }}>
                            <strong>Age Groups:</strong> {template.ageScope.join(', ')}
                          </div>
                        )}
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          <strong>Metrics:</strong> {template.items?.length || 0}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/realverse/trials/templates/${template.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </motion.main>
    </PageShell>
  );
};

export default TrialTemplatesPage;


/**
 * Season Planning & Load Prediction - Main Page
 * 
 * Allows coaches to:
 * - Define season structure (start, end, phases, breaks)
 * - Plan training blocks
 * - Monitor cumulative load
 * - Make informed decisions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageShell } from '../components/ui/PageShell';
import { Section } from '../components/ui/Section';

interface SeasonPlan {
  id: number;
  name: string;
  seasonStart: string;
  seasonEnd: string;
  description?: string;
  center: { id: number; name: string };
  phases: Array<{
    id: number;
    name: string;
    phaseType: string;
    startDate: string;
    endDate: string;
  }>;
  _count: { sessionLoads: number };
}

const SeasonPlanningPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SeasonPlan[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, centersData] = await Promise.all([
        api.getSeasonPlans(selectedCenterId || undefined),
        api.getCenters(),
      ]);
      setPlans(plansData || []);
      setCenters(centersData || []);
    } catch (error: any) {
      console.error('Failed to load season plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading season plans...
        </div>
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
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                Season Planning & Load Prediction
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary }}>
                Plan training blocks, monitor cumulative load, and make informed decisions
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/realverse/admin/season-planning/new')}
            >
              + Create Season Plan
            </Button>
          </div>
        </Section>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing.md, marginBottom: spacing.xl }}>
          <Card variant="elevated" padding="lg" style={{ cursor: 'pointer' }} onClick={() => navigate('/realverse/admin/season-planning/planner')}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
              📅 Season Planner
            </h3>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
              Calendar-based planning with drag-and-drop sessions
            </p>
          </Card>
          <Card variant="elevated" padding="lg" style={{ cursor: 'pointer' }} onClick={() => navigate('/realverse/admin/season-planning/load-dashboard')}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
              📊 Load Dashboard
            </h3>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
              Monitor player load trends and comparisons
            </p>
          </Card>
          <Card variant="elevated" padding="lg" style={{ cursor: 'pointer' }} onClick={() => navigate('/realverse/admin/season-planning/development-blocks')}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
              🎯 Development Blocks
            </h3>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
              Link planning to specific development goals
            </p>
          </Card>
        </div>

        {/* Season Plans List */}
        <Section variant="default">
          <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
            Active Season Plans
          </h2>
          {plans.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <div style={{ textAlign: 'center', padding: spacing.xl }}>
                <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
                  No season plans yet. Create your first season plan to get started.
                </p>
                <Button variant="primary" onClick={() => navigate('/realverse/admin/season-planning/new')}>
                  Create Season Plan
                </Button>
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  variant="elevated"
                  padding="lg"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/realverse/admin/season-planning/plans/${plan.id}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                        {plan.name}
                      </h3>
                      <p style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.sm }}>
                        {plan.center.name}
                      </p>
                      <div style={{ display: 'flex', gap: spacing.md, ...typography.caption, color: colors.text.secondary }}>
                        <span>
                          {new Date(plan.seasonStart).toLocaleDateString()} - {new Date(plan.seasonEnd).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{plan.phases.length} phases</span>
                        <span>•</span>
                        <span>{plan._count.sessionLoads} sessions with load data</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      View Details →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </div>
    </PageShell>
  );
};

export default SeasonPlanningPage;


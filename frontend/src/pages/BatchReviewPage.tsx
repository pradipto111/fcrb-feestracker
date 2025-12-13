import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BatchReviewWorkflow, MetricSourceContext } from '../components/player-profile/BatchReviewWorkflow';
import { Section } from '../components/ui/Section';

const BatchReviewPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedContext, setSelectedContext] = useState<MetricSourceContext>('MONTHLY_REVIEW');
  const [selectedCenterId, setSelectedCenterId] = useState<number | undefined>(undefined);
  const [started, setStarted] = useState(false);

  const canEdit = user?.role === 'COACH' || user?.role === 'ADMIN';

  if (!canEdit) {
    return (
      <Card variant="default" padding="lg">
        <div style={{ color: colors.danger.main }}>Access denied. Coaches and admins only.</div>
      </Card>
    );
  }

  if (started) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: colors.surface.bg,
          minHeight: '100%',
          padding: spacing.xl,
        }}
      >
        <BatchReviewWorkflow
          centerId={selectedCenterId}
          context={selectedContext}
          onComplete={() => setStarted(false)}
        />
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        background: colors.surface.bg,
        minHeight: '100%',
        padding: spacing.xl,
      }}
    >
      <Section
        title="Batch Review Workflow"
        description="Review multiple players in sequence. Select context and center to begin."
      >
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            <div>
              <label style={{ ...typography.body, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm, display: 'block' }}>
                Review Context
              </label>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value as MetricSourceContext)}
                style={{
                  width: '100%',
                  padding: `${spacing.md} ${spacing.lg}`,
                  background: colors.surface.soft,
                  border: `1px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  fontFamily: typography.fontFamily.primary,
                }}
              >
                <option value="MONTHLY_REVIEW">Monthly Review - Full snapshot across all categories</option>
                <option value="TRAINING_BLOCK">Training Block Review - Update 6-10 relevant metrics</option>
                <option value="MATCH_BLOCK">Match Block Review - Update mental/tactical metrics</option>
                <option value="TRIAL">Trial / New Player Intake - First evaluation</option>
              </select>
            </div>

            <div>
              <label style={{ ...typography.body, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.sm, display: 'block' }}>
                Center (Optional)
              </label>
              <input
                type="number"
                value={selectedCenterId || ''}
                onChange={(e) => setSelectedCenterId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Leave empty for all centers"
                style={{
                  width: '100%',
                  padding: `${spacing.md} ${spacing.lg}`,
                  background: colors.surface.soft,
                  border: `1px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                  fontFamily: typography.fontFamily.primary,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.md }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStarted(true)}
              >
                Start Batch Review
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  setSelectedContext('MONTHLY_REVIEW');
                  setSelectedCenterId(undefined);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>
      </Section>
    </motion.main>
  );
};

export default BatchReviewPage;



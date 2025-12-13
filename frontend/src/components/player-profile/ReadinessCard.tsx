import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme/design-tokens';
import { Card } from '../ui/Card';

export interface ReadinessData {
  overall: number;
  technical: number;
  physical: number;
  mental: number;
  attitude: number;
  tacticalFit: number;
  explanationJson?: {
    topStrengths?: string[];
    topRisks?: string[];
    recommendedFocus?: string[];
    ruleTriggers?: string[];
  };
}

export interface ReadinessCardProps {
  readiness: ReadinessData;
  trend?: 'up' | 'down' | 'stable';
  onWhyClick?: () => void;
  showBreakdown?: boolean;
}

const getStatusBand = (score: number): { label: string; color: string } => {
  if (score >= 85) return { label: 'Ready for next level', color: colors.success.main };
  if (score >= 75) return { label: 'Advanced', color: colors.accent.main };
  if (score >= 60) return { label: 'Competitive', color: colors.warning.main };
  if (score >= 40) return { label: 'Developing', color: colors.primary.main };
  return { label: 'Foundation', color: colors.text.muted };
};

export const ReadinessCard: React.FC<ReadinessCardProps> = ({
  readiness,
  trend,
  onWhyClick,
  showBreakdown = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const status = getStatusBand(readiness.overall);

  const breakdown = [
    { label: 'Technical', value: readiness.technical, color: colors.primary.main },
    { label: 'Physical', value: readiness.physical, color: colors.accent.main },
    { label: 'Mental', value: readiness.mental, color: colors.success.main },
    { label: 'Attitude', value: readiness.attitude, color: colors.warning?.main || colors.accent.main },
    { label: 'Tactical Fit', value: readiness.tacticalFit, color: colors.primary.light },
  ];

  const handleWhyClick = () => {
    if (onWhyClick) {
      onWhyClick();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <Card variant="elevated" padding="lg" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: `linear-gradient(135deg, ${status.color}20 0%, ${status.color}05 100%)`,
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg }}>
            <div>
              <div
                style={{
                  ...typography.overline,
                  color: colors.text.muted,
                  marginBottom: spacing.xs,
                }}
              >
                Overall Readiness
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    ...typography.display,
                    fontSize: '3.5rem',
                    fontWeight: typography.fontWeight.bold,
                    color: status.color,
                    lineHeight: 1,
                  }}
                >
                  {readiness.overall}
                </motion.div>
                {trend && (
                  <motion.div
                    animate={{ y: trend === 'up' ? [-2, 0, -2] : trend === 'down' ? [2, 0, 2] : 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{
                      color: trend === 'up' ? colors.success.main : trend === 'down' ? colors.danger.main : colors.text.muted,
                      fontSize: '1.5rem',
                    }}
                  >
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                  </motion.div>
                )}
              </div>
              <div
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.sm,
                  color: status.color,
                  fontWeight: typography.fontWeight.semibold,
                  marginTop: spacing.xs,
                }}
              >
                {status.label}
              </div>
            </div>

            <button
              onClick={handleWhyClick}
              style={{
                background: colors.surface.soft,
                border: `1px solid ${colors.surface.card}`,
                borderRadius: borderRadius.md,
                padding: `${spacing.sm} ${spacing.md}`,
                color: colors.text.secondary,
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontFamily: typography.fontFamily.primary,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.primary.soft;
                e.currentTarget.style.borderColor = colors.primary.main;
                e.currentTarget.style.color = colors.primary.main;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.surface.soft;
                e.currentTarget.style.borderColor = colors.surface.card;
                e.currentTarget.style.color = colors.text.secondary;
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 6v4M10 14h.01" />
              </svg>
              Why?
            </button>
          </div>

          {/* Breakdown */}
          {showBreakdown && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {breakdown.map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                  <div style={{ minWidth: '100px', ...typography.body, fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    {item.label}
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <div
                      style={{
                        height: '6px',
                        background: colors.surface.dark,
                        borderRadius: borderRadius.full,
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: item.color,
                          borderRadius: borderRadius.full,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      minWidth: '40px',
                      textAlign: 'right',
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Why Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: spacing.xl,
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: colors.surface.section,
                borderRadius: borderRadius['2xl'],
                padding: spacing['2xl'],
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: shadows['2xl'],
                border: `1px solid rgba(255, 255, 255, 0.1)`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
                <h3 style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Readiness Explanation</h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: colors.text.muted,
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    padding: spacing.xs,
                  }}
                >
                  ×
                </button>
              </div>

              {readiness.explanationJson && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
                  {readiness.explanationJson.topStrengths && readiness.explanationJson.topStrengths.length > 0 && (
                    <div>
                      <h4 style={{ ...typography.h4, color: colors.success.main, marginBottom: spacing.sm }}>
                        Top Strengths
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                        {readiness.explanationJson.topStrengths.map((strength, idx) => (
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
                      </div>
                    </div>
                  )}

                  {readiness.explanationJson.topRisks && readiness.explanationJson.topRisks.length > 0 && (
                    <div>
                      <h4 style={{ ...typography.h4, color: colors.danger.main, marginBottom: spacing.sm }}>
                        Focus Areas
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
                        {readiness.explanationJson.topRisks.map((risk, idx) => (
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
                            {risk}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {readiness.explanationJson.ruleTriggers && readiness.explanationJson.ruleTriggers.length > 0 && (
                    <div>
                      <h4 style={{ ...typography.h4, color: colors.text.secondary, marginBottom: spacing.sm }}>
                        Key Insights
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: spacing.lg, color: colors.text.secondary }}>
                        {readiness.explanationJson.ruleTriggers.map((trigger, idx) => (
                          <li key={idx} style={{ marginBottom: spacing.xs }}>
                            {trigger.replace(/_/g, ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


/**
 * Parent Development Report Page
 * 
 * Parent-friendly view of player development report
 * Simple, reassuring language with no raw numbers
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';

interface ReportContent {
  headline: string;
  bands: {
    technical: { label: string; description: string };
    physical: { label: string; description: string };
    gameUnderstanding: { label: string; description: string };
    attitude: { label: string; description: string };
  };
  strengths: string[];
  focusAreas: string[];
  coachNote: string;
  readinessStage: string;
  parentSupportTips: string[];
  transparencyMessage: string;
}

interface ReportData {
  id: number;
  student: {
    fullName: string;
    programType?: string;
    center?: { name: string };
  };
  snapshot: {
    createdAt: string;
  };
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  publishedAt?: string;
  contentJson: ReportContent;
}

const ParentDevelopmentReportPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    if (!reportId) {
      setError('Invalid report ID');
      setLoading(false);
      return;
    }

    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getReport(Number(reportId));
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (label: string) => {
    switch (label) {
      case 'Advancing': return colors.success.main;
      case 'Strong': return colors.primary.main;
      default: return colors.info.main;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Advanced': return colors.success.main;
      case 'Competitive': return colors.primary.main;
      case 'Developing': return colors.info.main;
      default: return colors.text.muted;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatPeriod = (start?: string, end?: string) => {
    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    if (start) {
      return `From ${formatDate(start)}`;
    }
    return formatDate(report?.snapshot.createdAt);
  };

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
      }}>
        <div>
          <div style={{ marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
            Loading development report...
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{
        padding: spacing['2xl'],
        background: colors.surface.bg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Card variant="default" padding="lg" style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{ color: colors.danger.main, marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
            {error || 'Report not found'}
          </div>
          <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Card>
      </div>
    );
  }

  const content = report.contentJson;

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
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: spacing.xl }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(-1)}
              style={{ marginBottom: spacing.lg }}
            >
              ← Back
            </Button>
            <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
              Development Report
            </h1>
            <div style={{ ...typography.body, color: colors.text.muted }}>
              {report.student.fullName} • {report.student.programType || 'N/A'} • {report.student.center?.name || ''}
            </div>
            <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
              Reporting Period: {formatPeriod(report.reportingPeriodStart, report.reportingPeriodEnd)}
            </div>
          </div>

          {/* Cover Summary */}
          <Card variant="default" padding="lg" style={{ marginBottom: spacing.xl, background: colors.primary.soft }}>
            <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md, lineHeight: 1.6 }}>
              {content.headline}
            </div>
          </Card>

          {/* Development Snapshot */}
          <Card variant="default" padding="lg" style={{ marginBottom: spacing.xl }}>
            <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
              Development Snapshot
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md }}>
              {Object.entries(content.bands).map(([key, band]) => (
                <div key={key} style={{ padding: spacing.md, background: colors.surface.elevated, borderRadius: borderRadius.md }}>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs, textTransform: 'capitalize' }}>
                    {key === 'gameUnderstanding' ? 'Game Understanding' : key}
                  </div>
                  <div
                    style={{
                      ...typography.h4,
                      color: getBandColor(band.label),
                      marginBottom: spacing.xs,
                      fontWeight: typography.fontWeight.bold,
                    }}
                  >
                    {band.label}
                  </div>
                  <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.5 }}>
                    {band.description}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Strengths & Focus Areas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.lg, marginBottom: spacing.xl }}>
            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Strength Areas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {content.strengths.map((strength, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: spacing.md,
                      background: colors.success.soft,
                      borderRadius: borderRadius.md,
                      ...typography.body,
                      color: colors.success.main,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    ✓ {strength}
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="default" padding="lg">
              <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Current Focus Areas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {content.focusAreas.map((area, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: spacing.md,
                      background: colors.info.soft,
                      borderRadius: borderRadius.md,
                      ...typography.body,
                      color: colors.info.main,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    • {area}
                  </div>
                ))}
              </div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.md, fontStyle: 'italic' }}>
                These are normal focus areas at this stage of development.
              </div>
            </Card>
          </div>

          {/* Coach Feedback */}
          <Card variant="default" padding="lg" style={{ marginBottom: spacing.xl, background: colors.primary.soft }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              Coach Feedback
            </h3>
            <div
              style={{
                ...typography.body,
                color: colors.text.primary,
                lineHeight: 1.8,
                whiteSpace: 'pre-line',
              }}
            >
              {content.coachNote}
            </div>
          </Card>

          {/* Readiness Indicator */}
          <Card variant="default" padding="lg" style={{ marginBottom: spacing.xl }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              Current Development Stage
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
              <div
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  background: getStageColor(content.readinessStage),
                  borderRadius: borderRadius.md,
                  ...typography.h4,
                  color: colors.surface.bg,
                  fontWeight: typography.fontWeight.bold,
                }}
              >
                {content.readinessStage}
              </div>
            </div>
            <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.6 }}>
              This does not determine selection today — it helps us plan development.
            </div>
          </Card>

          {/* How Parents Can Support */}
          <Card variant="default" padding="lg" style={{ marginBottom: spacing.xl }}>
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              How You Can Support
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {content.parentSupportTips.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: spacing.sm,
                    ...typography.body,
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                    display: 'flex',
                    alignItems: 'start',
                    gap: spacing.sm,
                  }}
                >
                  <span style={{ color: colors.primary.main }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Transparency Block */}
          <Card variant="default" padding="lg" style={{ background: colors.surface.elevated }}>
            <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.8, fontStyle: 'italic' }}>
              {content.transparencyMessage}
            </div>
          </Card>

          {/* Footer */}
          <div style={{ marginTop: spacing.xl, textAlign: 'center', ...typography.caption, color: colors.text.muted }}>
            Report generated on {formatDate(report.publishedAt || report.snapshot.createdAt)}
            {report.publishedAt && ' • Published by FC Real Bengaluru'}
          </div>
        </div>
      </Section>
    </motion.main>
  );
};

export default ParentDevelopmentReportPage;


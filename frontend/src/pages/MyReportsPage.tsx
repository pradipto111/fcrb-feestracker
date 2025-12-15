/**
 * My Reports Page
 * 
 * Student view of their own development reports
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';

interface Report {
  id: number;
  snapshot: {
    createdAt: string;
  };
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  publishedAt?: string;
  contentJson: {
    headline: string;
    readinessStage: string;
  };
}

const MyReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getMyReports();
      setReports(response.reports || []);
    } catch (err: any) {
      // Handle Prisma client not generated error gracefully
      if (err.message?.includes('ParentDevelopmentReport model not available') || err.message?.includes('findMany')) {
        setError('Reports feature is being set up. Please contact your administrator.');
        setReports([]); // Show empty state instead of error
      } else {
        setError(err.message || 'Failed to load reports');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatPeriod = (start?: string, end?: string) => {
    if (start && end) {
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    if (start) {
      return `From ${formatDate(start)}`;
    }
    return formatDate(reports[0]?.snapshot.createdAt);
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
        <div>Loading your reports...</div>
      </div>
    );
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
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.md }}>
            My Development Reports
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            View your development progress reports
          </p>
        </div>

        {error && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
            <div style={{ color: colors.danger.main }}>{error}</div>
          </Card>
        )}

        {reports.length === 0 ? (
          <Card variant="default" padding="lg">
            <div style={{ textAlign: 'center', color: colors.text.muted }}>
              <div style={{ marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
                No reports available yet
              </div>
              <div style={{ fontSize: typography.fontSize.sm }}>
                Your coach will generate development reports for you. Check back soon!
              </div>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
            {reports.map((report) => (
              <Card key={report.id} variant="default" padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                      Development Report
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.sm }}>
                      {formatPeriod(report.reportingPeriodStart, report.reportingPeriodEnd)}
                      {report.publishedAt && ` • Published ${formatDate(report.publishedAt)}`}
                    </div>
                    <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginTop: spacing.sm }}>
                      {report.contentJson.headline}
                    </div>
                    <div style={{ marginTop: spacing.sm }}>
                      <span style={{ ...typography.caption, color: colors.text.muted }}>Current Stage: </span>
                      <span style={{ ...typography.caption, color: colors.primary.main, fontWeight: typography.fontWeight.semibold }}>
                        {report.contentJson.readinessStage}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(`/realverse/parent-reports/${report.id}`)}
                  >
                    View Full Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </motion.main>
  );
};

export default MyReportsPage;


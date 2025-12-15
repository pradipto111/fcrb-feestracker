/**
 * Player Load Dashboard
 * 
 * Shows:
 * - Weekly load trends
 * - Monthly load trends
 * - Comparison vs squad average
 * - Comparison vs age-group recommended range
 * - Readiness & Load correlation
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { colors, typography, spacing, borderRadius } from '../theme/design-tokens';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageShell } from '../components/ui/PageShell';
import { Section } from '../components/ui/Section';

const PlayerLoadDashboardPage: React.FC = () => {
  const { studentId: paramStudentId, id } = useParams<{ studentId?: string; id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Support both :studentId and :id params for route flexibility
  const paramId = paramStudentId || id;
  const [studentId, setStudentId] = useState<number | null>(paramId ? Number(paramId) : null);
  const [students, setStudents] = useState<any[]>([]);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [correlation, setCorrelation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If paramId is provided, use it (from URL)
    if (paramId) {
      setStudentId(Number(paramId));
    } else if (user?.role === 'ADMIN' || user?.role === 'COACH') {
      // Coaches/admins can select from list
      loadStudents();
    } else if (user?.role === 'STUDENT' && user.id) {
      // Students see their own data
      setStudentId(user.id);
    }
  }, [user, paramId]);

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const loadStudents = async () => {
    try {
      const data = await api.getStudents();
      setStudents(data || []);
      if (data.length > 0 && !studentId) {
        setStudentId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const loadData = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const [trends, corr] = await Promise.all([
        api.getPlayerLoadTrends(studentId, 12),
        api.getReadinessLoadCorrelation(studentId, 8),
      ]);
      setWeeklyTrends(trends?.weekly || []);
      setMonthlyTrends(trends?.monthly || []);
      setCorrelation(corr || []);
    } catch (error) {
      console.error('Failed to load load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'LOW':
        return colors.warning?.main || colors.accent.main;
      case 'HIGH':
        return colors.warning?.main || colors.accent.main;
      case 'CRITICAL':
        return colors.danger.main;
      default:
        return colors.success.main;
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading load data...
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
                Player Load Dashboard
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary }}>
                Monitor training load trends and correlations with readiness
              </p>
            </div>
            {(user?.role === 'ADMIN' || user?.role === 'COACH') && (
              <select
                value={studentId || ''}
                onChange={(e) => setStudentId(Number(e.target.value))}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.surface.card}`,
                  background: colors.surface.bg,
                  color: colors.text.primary,
                  ...typography.body,
                }}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>
        </Section>

        {/* Weekly Trends */}
        <Section variant="default" style={{ marginBottom: spacing.xl }}>
          <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
            Weekly Load Trends (Last 12 Weeks)
          </h2>
          <Card variant="elevated" padding="lg">
            {weeklyTrends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
                No load data available yet. Start adding load assessments to training sessions.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {weeklyTrends.map((week, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: spacing.sm,
                      background: colors.surface.soft,
                      borderRadius: borderRadius.md,
                    }}
                  >
                    <div style={{ minWidth: '120px', ...typography.caption, color: colors.text.secondary }}>
                      {new Date(week.weekStart).toLocaleDateString()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                        <div
                          style={{
                            height: '20px',
                            width: `${Math.min((week.totalLoad / 300) * 100, 100)}%`,
                            background: getStatusColor(week.loadStatus),
                            borderRadius: borderRadius.sm,
                            minWidth: '4px',
                          }}
                        />
                        <span style={{ ...typography.body, color: colors.text.primary }}>
                          {week.totalLoad.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {week.sessionCount} sessions
                    </div>
                    {week.loadStatus && (
                      <div
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          borderRadius: borderRadius.sm,
                          background: getStatusColor(week.loadStatus) + '20',
                          color: getStatusColor(week.loadStatus),
                          ...typography.caption,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {week.loadStatus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Section>

        {/* Readiness & Load Correlation */}
        <Section variant="default">
          <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
            Readiness & Load Correlation
          </h2>
          <Card variant="elevated" padding="lg">
            {correlation.length === 0 ? (
              <div style={{ textAlign: 'center', padding: spacing.xl, color: colors.text.muted }}>
                No correlation data available. Need both load data and readiness snapshots.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {correlation.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: spacing.sm,
                      background: colors.surface.soft,
                      borderRadius: borderRadius.md,
                    }}
                  >
                    <div style={{ minWidth: '120px', ...typography.caption, color: colors.text.secondary }}>
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: spacing.md }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                          Load: {item.load.toFixed(1)}
                        </div>
                        <div
                          style={{
                            height: '8px',
                            width: `${Math.min((item.load / 300) * 100, 100)}%`,
                            background: colors.primary.main,
                            borderRadius: borderRadius.sm,
                          }}
                        />
                      </div>
                      {item.readiness !== null && (
                        <div style={{ flex: 1 }}>
                          <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                            Readiness: {item.readiness}
                          </div>
                          <div
                            style={{
                              height: '8px',
                              width: `${item.readiness}%`,
                              background: colors.success.main,
                              borderRadius: borderRadius.sm,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {item.hasInjuryNote && (
                      <div
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          borderRadius: borderRadius.sm,
                          background: colors.danger.main + '20',
                          color: colors.danger.main,
                          ...typography.caption,
                        }}
                      >
                        ⚠️ Injury Note
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Section>
      </div>
    </PageShell>
  );
};

export default PlayerLoadDashboardPage;


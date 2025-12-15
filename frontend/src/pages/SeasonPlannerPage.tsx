/**
 * Season Planner - Calendar View
 * 
 * Calendar-based UI for planning training sessions
 * - Visual load indicators per week
 * - Competition density visualization
 * - Soft warnings (e.g., "3 high-load weeks in a row")
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

const SeasonPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const planId = searchParams.get('planId') ? Number(searchParams.get('planId')) : null;

  const [plan, setPlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [warnings, setWarnings] = useState<string[]>([]);

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
        navigate(`/realverse/admin/season-planning/planner?planId=${plans[0].id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadData = async () => {
    if (!planId) return;
    try {
      setLoading(true);
      const planData = await api.getSeasonPlan(planId);
      setPlan(planData);
      
      const [sessionsData, fixturesData] = await Promise.all([
        api.getSessions({ centerId: planData.centerId }),
        api.getFixtures({ centerId: planData.centerId }),
      ]);
      setSessions(sessionsData || []);
      setFixtures(fixturesData || []);
      calculateWarnings(planData, sessionsData || []);
    } catch (error) {
      console.error('Failed to load planner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWarnings = (planData: any, sessionsData: any[]) => {
    const warningsList: string[] = [];
    
    // Group sessions by week
    const weeklyLoads: Record<string, number> = {};
    sessionsData.forEach((session) => {
      const weekKey = getWeekKey(new Date(session.sessionDate));
      weeklyLoads[weekKey] = (weeklyLoads[weekKey] || 0) + 1;
    });

    // Check for 3+ high-load weeks in a row
    const weeks = Object.keys(weeklyLoads).sort();
    let consecutiveHighWeeks = 0;
    for (let i = 0; i < weeks.length; i++) {
      if (weeklyLoads[weeks[i]] >= 4) {
        consecutiveHighWeeks++;
        if (consecutiveHighWeeks >= 3) {
          warningsList.push('3 or more high-load weeks in a row detected');
          break;
        }
      } else {
        consecutiveHighWeeks = 0;
      }
    }

    setWarnings(warningsList);
  };

  const getWeekKey = (date: Date): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    return `${weekStart.getFullYear()}-W${getWeekNumber(weekStart)}`;
  };

  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add days from previous month to fill first week
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }
    
    // Add days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    // Add days from next month to fill last week
    const remaining = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remaining; day++) {
      days.push(new Date(year, month + 1, day));
    }
    
    return days;
  };

  const getSessionsForDate = (date: Date): any[] => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => {
      const sessionDate = new Date(s.sessionDate).toISOString().split('T')[0];
      return sessionDate === dateStr;
    });
  };

  const getFixturesForDate = (date: Date): any[] => {
    const dateStr = date.toISOString().split('T')[0];
    return fixtures.filter(f => {
      const matchDate = new Date(f.matchDate).toISOString().split('T')[0];
      return matchDate === dateStr;
    });
  };

  const getLoadColor = (sessionCount: number): string => {
    if (sessionCount === 0) return colors.surface.elevated;
    if (sessionCount === 1) return colors.success.main + '40';
    if (sessionCount === 2) return colors.warning?.main + '40' || colors.accent.main + '40';
    return colors.danger.main + '40';
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: spacing['2xl'], color: colors.text.muted }}>
          Loading season planner...
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

  const days = getDaysInMonth(selectedDate);
  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <PageShell>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <Section variant="default" style={{ marginBottom: spacing.xl }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: spacing.md }}>
            <div>
              <Button variant="secondary" size="sm" onClick={() => navigate('/realverse/admin/season-planning')} style={{ marginBottom: spacing.md }}>
                ← Back to Season Planning
              </Button>
              <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
                Season Planner
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary }}>
                {plan.name} • {plan.center.name}
              </p>
            </div>
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button
                variant={viewMode === 'month' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month View
              </Button>
              <Button
                variant={viewMode === 'week' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week View
              </Button>
            </div>
          </div>
        </Section>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Card variant="default" padding="md" style={{ marginBottom: spacing.lg, background: colors.warning?.soft || colors.accent.soft }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                {warnings.map((warning, idx) => (
                  <div key={idx} style={{ ...typography.body, color: colors.warning?.main || colors.accent.main }}>
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Calendar Navigation */}
        <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
            >
              ← Previous
            </Button>
            <h2 style={{ ...typography.h3, color: colors.text.primary }}>
              {monthName}
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
            >
              Next →
            </Button>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card variant="elevated" padding="lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: spacing.xs, marginBottom: spacing.sm }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                style={{
                  ...typography.body,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.muted,
                  textAlign: 'center',
                  padding: spacing.sm,
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: spacing.xs }}>
            {days.map((day, idx) => {
              const daySessions = getSessionsForDate(day);
              const dayFixtures = getFixturesForDate(day);
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const isInSeason = plan && new Date(plan.seasonStart) <= day && day <= new Date(plan.seasonEnd);

              return (
                <div
                  key={idx}
                  style={{
                    minHeight: '100px',
                    padding: spacing.xs,
                    background: isCurrentMonth ? (isInSeason ? colors.surface.elevated : colors.surface.soft) : colors.surface.dark,
                    border: isToday ? `2px solid ${colors.primary.main}` : `1px solid ${colors.border.medium}`,
                    borderRadius: borderRadius.sm,
                    cursor: 'pointer',
                    opacity: isCurrentMonth ? 1 : 0.5,
                  }}
                  onClick={() => {
                    // Could open a modal to add/edit sessions
                    console.log('Date clicked:', day);
                  }}
                >
                  <div
                    style={{
                      ...typography.caption,
                      color: isCurrentMonth ? colors.text.primary : colors.text.muted,
                      marginBottom: spacing.xs,
                      fontWeight: isToday ? typography.fontWeight.bold : typography.fontWeight.medium,
                    }}
                  >
                    {day.getDate()}
                  </div>
                  {daySessions.length > 0 && (
                    <div
                      style={{
                        padding: `${spacing.xs} ${spacing.xs}`,
                        background: getLoadColor(daySessions.length),
                        borderRadius: borderRadius.xs,
                        marginBottom: spacing.xs,
                        ...typography.caption,
                        fontSize: typography.fontSize.xs,
                        color: colors.text.primary,
                      }}
                    >
                      {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {dayFixtures.length > 0 && (
                    <div
                      style={{
                        padding: `${spacing.xs} ${spacing.xs}`,
                        background: colors.primary.main + '40',
                        borderRadius: borderRadius.xs,
                        ...typography.caption,
                        fontSize: typography.fontSize.xs,
                        color: colors.text.primary,
                      }}
                    >
                      🏆 {dayFixtures.length} match{dayFixtures.length > 1 ? 'es' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <Card variant="default" padding="md" style={{ marginTop: spacing.lg }}>
          <div style={{ display: 'flex', gap: spacing.lg, flexWrap: 'wrap', ...typography.caption }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <div style={{ width: '20px', height: '20px', background: colors.success.main + '40', borderRadius: borderRadius.xs }} />
              <span style={{ color: colors.text.muted }}>1 session</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <div style={{ width: '20px', height: '20px', background: (colors.warning?.main || colors.accent.main) + '40', borderRadius: borderRadius.xs }} />
              <span style={{ color: colors.text.muted }}>2 sessions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <div style={{ width: '20px', height: '20px', background: colors.danger.main + '40', borderRadius: borderRadius.xs }} />
              <span style={{ color: colors.text.muted }}>3+ sessions</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
              <div style={{ width: '20px', height: '20px', background: colors.primary.main + '40', borderRadius: borderRadius.xs }} />
              <span style={{ color: colors.text.muted }}>Match/Fixture</span>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

export default SeasonPlannerPage;


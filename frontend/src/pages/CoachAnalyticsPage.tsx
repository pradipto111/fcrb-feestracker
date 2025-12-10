import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import {
  getCoachAnalytics,
  getCoachFeedbackQueue,
} from "../mocks/mockAnalyticsService";
import { AnalyticsCard } from "../components/analytics/AnalyticsCard";
import { ChartContainer } from "../components/analytics/ChartContainer";
import { KPIChip } from "../components/analytics/KPIChip";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CoachAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [playerEngagement, setPlayerEngagement] = useState<any[]>([]);
  const [wellnessData, setWellnessData] = useState<any>(null);
  const [feedbackQueue, setFeedbackQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Enable mock data - check env variable or default to true for localhost
  const USE_MOCK_DATA = 
    import.meta.env.VITE_USE_MOCK_ANALYTICS === "true" || 
    import.meta.env.VITE_USE_MOCK_ANALYTICS === true ||
    (import.meta.env.DEV && window.location.hostname === "localhost");
  console.log("[CoachAnalytics] USE_MOCK_DATA:", USE_MOCK_DATA, "env value:", import.meta.env.VITE_USE_MOCK_ANALYTICS, "hostname:", window.location.hostname);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError("");
    try {
      if (USE_MOCK_DATA && user?.id) {
        // Use mock data - assume coach-1 for mock
        const coachId = "coach-1";
        const coachAnalytics = getCoachAnalytics(coachId);
        const queueData = getCoachFeedbackQueue(coachId);

        setSummary({
          playersUnderCoach: coachAnalytics.playersUnderCoach,
          avgAttendance: coachAnalytics.avgAttendance,
          sessionsThisWeek: coachAnalytics.sessionsThisWeek,
          wellnessFlags: coachAnalytics.wellnessFlags,
        });
        setPlayerEngagement(coachAnalytics.playerEngagement);
        setWellnessData(coachAnalytics.wellness);
        setFeedbackQueue(queueData);
      } else {
        // Use real API
        const [summaryData, engagementData, wellnessDataRes, queueData] =
          await Promise.all([
            api.getCoachAnalyticsSummary(),
            api.getCoachPlayerEngagement(),
            api.getCoachWellness(),
            api.getCoachFeedbackQueue(),
          ]);

        setSummary(summaryData);
        setPlayerEngagement(engagementData);
        setWellnessData(wellnessDataRes);
        setFeedbackQueue(queueData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl }}>
        <div style={{ ...typography.h3, color: colors.text.primary }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: spacing.xl }}>
        <div style={{ color: colors.warning.main }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.xl }}>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>
          Coach Analytics
        </h1>
        <p style={{ ...typography.body, color: colors.text.muted, marginTop: spacing.xs }}>
          Squad-level performance metrics and insights
        </p>
      </div>

      {/* KPI Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <KPIChip
          label="Players Under Coach"
          value={summary?.playersUnderCoach || 0}
        />
        <KPIChip
          label="Avg Attendance"
          value={`${summary?.avgAttendance || 0}%`}
          trend={summary?.avgAttendance >= 85 ? "up" : summary?.avgAttendance >= 70 ? "neutral" : "down"}
        />
        <KPIChip
          label="Sessions This Week"
          value={summary?.sessionsThisWeek || 0}
        />
        <KPIChip
          label="Wellness Flags"
          value={summary?.wellnessFlags || 0}
          trend={summary?.wellnessFlags > 0 ? "down" : "neutral"}
        />
      </div>

      {/* Feedback Queue */}
      {feedbackQueue.length > 0 && (
        <AnalyticsCard
          title="Feedback Queue"
          subtitle={`${feedbackQueue.length} players need feedback`}
          fullWidth
        >
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
            {feedbackQueue.slice(0, 5).map((item: any) => (
              <Card
                key={item.studentId}
                style={{
                  padding: spacing.md,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/realverse/coach/students/${item.studentId}/feedback`)}
              >
                <div>
                  <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold }}>
                    {item.studentName}
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                    {item.primaryReason}
                  </div>
                  {item.attendanceRate !== undefined && (
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                      Attendance: {item.attendanceRate}%
                    </div>
                  )}
                </div>
                <Button variant="primary" size="sm">
                  Add Feedback
                </Button>
              </Card>
            ))}
            {feedbackQueue.length > 5 && (
              <div style={{ ...typography.caption, color: colors.text.muted, textAlign: "center", marginTop: spacing.sm }}>
                +{feedbackQueue.length - 5} more players
              </div>
            )}
          </div>
        </AnalyticsCard>
      )}

      {/* Player Engagement */}
      <AnalyticsCard title="Player Engagement" subtitle="Attendance by player" fullWidth>
        <ChartContainer height={400} isEmpty={playerEngagement.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={playerEngagement.sort((a, b) => b.attendanceRate - a.attendanceRate)}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
              <XAxis
                dataKey="studentName"
                stroke={colors.text.secondary}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke={colors.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: colors.surface.main,
                  border: `1px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                }}
              />
              <Bar dataKey="attendanceRate" fill={colors.primary.main} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </AnalyticsCard>

      {/* Wellness */}
      {wellnessData && (
        <AnalyticsCard title="Training Load & Wellness" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <KPIChip
              label="Flagged Sessions"
              value={wellnessData.flaggedSessions || 0}
              trend={wellnessData.flaggedSessions > 0 ? "down" : "neutral"}
            />
          </div>
          <ChartContainer height={300} isEmpty={wellnessData.avgExertionBySession?.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wellnessData.avgExertionBySession}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis dataKey="sessionId" stroke={colors.text.secondary} />
                <YAxis stroke={colors.text.secondary} />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgExertion"
                  stroke={colors.accent.main}
                  strokeWidth={2}
                  name="Avg Exertion"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div
            style={{
              ...typography.caption,
              color: colors.text.muted,
              marginTop: spacing.md,
              fontStyle: "italic",
            }}
          >
            Note: Wellness data is self-reported and non-medical. Use for load management insights only.
          </div>
        </AnalyticsCard>
      )}
    </div>
  );
};

export default CoachAnalyticsPage;


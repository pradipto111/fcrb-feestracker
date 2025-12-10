import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { getPlayerAnalytics } from "../mocks/mockAnalyticsService";
import { AnalyticsCard } from "../components/analytics/AnalyticsCard";
import { ChartContainer } from "../components/analytics/ChartContainer";
import { KPIChip } from "../components/analytics/KPIChip";
import { Card } from "../components/ui/Card";
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

const PlayerAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [wellnessData, setWellnessData] = useState<any[]>([]);
  const [matchesData, setMatchesData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Enable mock data - check env variable or default to true for localhost
  const USE_MOCK_DATA = 
    import.meta.env.VITE_USE_MOCK_ANALYTICS === "true" || 
    import.meta.env.VITE_USE_MOCK_ANALYTICS === true ||
    (import.meta.env.DEV && window.location.hostname === "localhost");
  console.log("[PlayerAnalytics] USE_MOCK_DATA:", USE_MOCK_DATA, "env value:", import.meta.env.VITE_USE_MOCK_ANALYTICS, "hostname:", window.location.hostname);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError("");
    try {
      if (USE_MOCK_DATA) {
        // Use mock data - use player-1 for mock
        const playerId = "player-1";
        const analytics = getPlayerAnalytics(playerId, {
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date(),
          },
        });

        setSummary({
          attendanceRate: analytics.attendanceRate,
          attendanceLabel: analytics.attendanceLabel,
          sessionsAttended30Days: analytics.sessionsAttended30Days,
          matchesSelected: analytics.matchesSelected,
        });
        setAttendanceData({
          weeklyData: analytics.weeklyData,
          longestStreak: analytics.longestStreak,
        });
        setWellnessData(analytics.wellnessData);
        setMatchesData({
          totalMatches: analytics.totalMatches,
          selectedMatches: analytics.selectedMatches,
          exposureRate: analytics.exposureRate,
          recentMatches: analytics.recentMatches,
        });
        setProgressData({
          currentLevel: analytics.currentLevel,
          nextLevel: analytics.nextLevel,
          attendanceRate: analytics.attendanceRate,
          attendanceTarget: analytics.attendanceTarget,
          feedbackFrequency: analytics.feedbackFrequency,
          readinessLabel: analytics.readinessLabel,
          requirements: analytics.requirements,
        });
      } else {
        // Use real API
        const [summaryData, attendanceDataRes, wellnessDataRes, matchesDataRes, progressDataRes] =
          await Promise.all([
            api.getPlayerAnalyticsSummary(),
            api.getPlayerAttendance(),
            api.getPlayerWellness({ weeks: "4" }),
            api.getPlayerMatches(),
            api.getPlayerProgress(),
          ]);

        setSummary(summaryData);
        setAttendanceData(attendanceDataRes);
        setWellnessData(wellnessDataRes);
        setMatchesData(matchesDataRes);
        setProgressData(progressDataRes);
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

  const getAttendanceColor = (label: string) => {
    if (label === "Strong") return colors.success.main;
    if (label === "Moderate") return colors.warning.main;
    return colors.error.main;
  };

  const getReadinessColor = (label: string) => {
    if (label === "On Track") return colors.success.main;
    if (label === "Nearly There") return colors.warning.main;
    return colors.error.main;
  };

  return (
    <div style={{ padding: spacing.xl }}>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>
          My Analytics
        </h1>
        <p style={{ ...typography.body, color: colors.text.muted, marginTop: spacing.xs }}>
          Your personal performance metrics and progress
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
          label="Attendance"
          value={summary?.attendanceLabel || "N/A"}
        />
        <KPIChip
          label="Sessions (30 Days)"
          value={summary?.sessionsAttended30Days || 0}
        />
        <KPIChip
          label="Matches Selected"
          value={summary?.matchesSelected || 0}
        />
        {attendanceData?.longestStreak !== undefined && (
          <KPIChip
            label="Longest Streak"
            value={`${attendanceData.longestStreak} sessions`}
          />
        )}
      </div>

      {/* Progress Indicators */}
      {progressData && (
        <AnalyticsCard title="Progress Indicators" fullWidth>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
              <Card
                style={{
                  padding: spacing.md,
                  flex: "1 1 200px",
                  border: `2px solid ${getReadinessColor(progressData.readinessLabel)}`,
                }}
              >
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                  Readiness Status
                </div>
                <div
                  style={{
                    ...typography.h4,
                    color: getReadinessColor(progressData.readinessLabel),
                    fontWeight: typography.fontWeight.bold,
                  }}
                >
                  {progressData.readinessLabel}
                </div>
              </Card>
              <Card style={{ padding: spacing.md, flex: "1 1 200px" }}>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                  Current Level
                </div>
                <div style={{ ...typography.h4, color: colors.text.primary }}>
                  {progressData.currentLevel}
                </div>
              </Card>
              {progressData.nextLevel && (
                <Card style={{ padding: spacing.md, flex: "1 1 200px" }}>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    Next Potential Level
                  </div>
                  <div style={{ ...typography.h4, color: colors.text.primary }}>
                    {progressData.nextLevel}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {progressData.requirements && (
            <div>
              <h4 style={{ ...typography.h4, marginBottom: spacing.md }}>Requirements</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                {progressData.requirements.attendance && (
                  <div style={{ ...typography.body, color: colors.text.secondary }}>
                    ✓ Attendance: {progressData.requirements.attendance}
                  </div>
                )}
                {progressData.requirements.physical && (
                  <div style={{ ...typography.body, color: colors.text.secondary }}>
                    ✓ Physical: {progressData.requirements.physical}
                  </div>
                )}
                {progressData.requirements.tactical && (
                  <div style={{ ...typography.body, color: colors.text.secondary }}>
                    ✓ Tactical: {progressData.requirements.tactical}
                  </div>
                )}
                <div style={{ ...typography.body, color: colors.text.secondary }}>
                  {progressData.requirements.coachRecommendation ? "✓" : "○"} Coach Recommendation
                </div>
              </div>
            </div>
          )}
        </AnalyticsCard>
      )}

      {/* Attendance */}
      {attendanceData && (
        <AnalyticsCard title="Attendance & Consistency" fullWidth>
          <ChartContainer height={300} isEmpty={attendanceData.weeklyData?.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis dataKey="week" stroke={colors.text.secondary} />
                <YAxis stroke={colors.text.secondary} />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={colors.primary.main}
                  strokeWidth={2}
                  name="Attendance %"
                />
                <Line
                  type="monotone"
                  dataKey="attended"
                  stroke={colors.success.main}
                  strokeWidth={2}
                  name="Sessions Attended"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </AnalyticsCard>
      )}

      {/* Wellness */}
      <AnalyticsCard title="Training Load & Wellness" fullWidth>
        <ChartContainer height={300} isEmpty={wellnessData.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wellnessData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
              <XAxis dataKey="date" stroke={colors.text.secondary} />
              <YAxis stroke={colors.text.secondary} />
              <Tooltip
                contentStyle={{
                  background: colors.surface.main,
                  border: `1px solid ${colors.surface.card}`,
                  borderRadius: borderRadius.md,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="exertion"
                stroke={colors.accent.main}
                strokeWidth={2}
                name="Exertion (1-5)"
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
          Self-reported wellness. Non-medical. Helps coaches manage training load.
        </div>
      </AnalyticsCard>

      {/* Match Exposure */}
      {matchesData && (
        <AnalyticsCard title="Match Exposure & Selection" fullWidth>
          <div style={{ marginBottom: spacing.md }}>
            <div style={{ display: "flex", gap: spacing.md }}>
              <KPIChip
                label="Total Matches"
                value={matchesData.totalMatches || 0}
              />
              <KPIChip
                label="Selected"
                value={matchesData.selectedMatches || 0}
              />
              <KPIChip
                label="Exposure Rate"
                value={`${matchesData.exposureRate || 0}%`}
              />
            </div>
          </div>

          {matchesData.recentMatches && matchesData.recentMatches.length > 0 && (
            <div>
              <h4 style={{ ...typography.h4, marginBottom: spacing.md }}>Recent Matches</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                {matchesData.recentMatches.map((match: any, idx: number) => (
                  <Card key={idx} style={{ padding: spacing.md }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold }}>
                          {match.opponent || "TBD"}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                          {match.competition} • {new Date(match.matchDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          borderRadius: borderRadius.sm,
                          background:
                            match.status === "SELECTED"
                              ? colors.success.soft
                              : match.status === "NOT_SELECTED"
                              ? colors.surface.soft
                              : colors.warning.soft,
                          color:
                            match.status === "SELECTED"
                              ? colors.success.main
                              : match.status === "NOT_SELECTED"
                              ? colors.text.muted
                              : colors.warning.main,
                          ...typography.caption,
                          fontWeight: typography.fontWeight.semibold,
                        }}
                      >
                        {match.status.replace("_", " ")}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </AnalyticsCard>
      )}
    </div>
  );
};

export default PlayerAnalyticsPage;


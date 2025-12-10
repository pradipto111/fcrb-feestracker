import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
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
import { AnalyticsCard } from "../components/analytics/AnalyticsCard";
import { ChartContainer } from "../components/analytics/ChartContainer";

interface GlobalAnalytics {
  totalActivePlayers: number;
  totalCentres: number;
  avgClubAttendance: number;
  monthlyRevenue: number;
  totalTrials: number;
  centreBreakdown: Array<{
    centreId: number;
    centreName: string;
    centreShortName: string;
    locality: string;
    city: string;
    activePlayers: number;
    sessions: number;
    attendanceRate: number;
    revenue: number;
  }>;
}

const GlobalAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getAnalyticsOverview({
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });

      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load global analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: spacing.xl, 
        textAlign: "center",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: `4px solid ${colors.border.main}`, 
          borderTop: `4px solid ${colors.primary.main}`, 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite",
          marginBottom: spacing.md
        }} />
        <p style={{ color: colors.text.primary, ...typography.body }}>
          Loading global analytics...
        </p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ padding: spacing.xl }}>
        <Card variant="default" padding="lg" style={{ background: colors.danger.soft, border: `1px solid ${colors.danger.main}` }}>
          <h2 style={{ ...typography.h3, color: colors.danger.main, marginBottom: spacing.md }}>
            Error Loading Analytics
          </h2>
          <p style={{ color: colors.danger.main, marginBottom: spacing.lg, ...typography.body }}>
            {error || "Failed to load analytics. Please try again."}
          </p>
          <Button variant="primary" onClick={() => loadAnalytics()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.xl }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing.xl,
        }}
      >
        <div>
          <h1
            style={{
              ...typography.h1,
              color: colors.text.primary,
              marginBottom: spacing.xs,
            }}
          >
            Global Analytics
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing.sm }}>
            Club-wide overview across all centres
          </p>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={() => navigate("/realverse/admin")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Date Range Picker */}
      <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", gap: spacing.md, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ ...typography.body, fontWeight: typography.fontWeight.semibold }}>
            Date Range:
          </label>
          <input
            type="date"
            value={dateRange.from.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({ ...dateRange, from: new Date(e.target.value) })
            }
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              borderRadius: borderRadius.md,
              background: colors.surface.card,
              color: colors.text.primary,
              fontSize: typography.fontSize.base,
              boxSizing: 'border-box',
            }}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.to.toISOString().split("T")[0]}
            onChange={(e) =>
              setDateRange({ ...dateRange, to: new Date(e.target.value) })
            }
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              borderRadius: borderRadius.md,
              background: colors.surface.card,
              color: colors.text.primary,
              fontSize: typography.fontSize.base,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </Card>

      {/* Summary KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <AnalyticsCard
          title="Total Active Players"
          value={analytics.totalActivePlayers}
          subtitle="Across all centres"
        />
        <AnalyticsCard
          title="Total Centres"
          value={analytics.totalCentres}
          subtitle="Active locations"
        />
        <AnalyticsCard
          title="Avg Club Attendance"
          value={`${analytics.avgClubAttendance}%`}
          subtitle="Overall average"
        />
        <AnalyticsCard
          title="Monthly Revenue"
          value={`₹${(analytics.monthlyRevenue / 100).toLocaleString()}`}
          subtitle="Total collected"
        />
        <AnalyticsCard
          title="Total Trials"
          value={analytics.totalTrials}
          subtitle="This period"
        />
      </div>

      {/* Centre Comparison */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2
          style={{
            ...typography.h2,
            color: colors.text.primary,
            marginBottom: spacing.lg,
          }}
        >
          Centre Comparison
        </h2>

        {/* Attendance by Centre */}
        <ChartContainer title="Attendance % by Centre">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.centreBreakdown.map((c) => ({
              centre: c.centreShortName || c.centreName,
              attendance: c.attendanceRate,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="centre" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: any) => `${value}%`} />
              <Legend />
              <Bar dataKey="attendance" fill={colors.success.main} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Revenue by Centre */}
        <ChartContainer title="Revenue by Centre" style={{ marginTop: spacing.xl }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.centreBreakdown.map((c) => ({
              centre: c.centreShortName || c.centreName,
              revenue: c.revenue / 100,
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="centre" />
              <YAxis />
              <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill={colors.primary.main} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Centre Details Table */}
        <div style={{ marginTop: spacing.xl }}>
          <h3 style={{ ...typography.h3, marginBottom: spacing.md }}>Centre Details</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.border.main}` }}>
                  <th style={{ padding: spacing.md, textAlign: "left" }}>Centre</th>
                  <th style={{ padding: spacing.md, textAlign: "right" }}>Active Players</th>
                  <th style={{ padding: spacing.md, textAlign: "right" }}>Sessions</th>
                  <th style={{ padding: spacing.md, textAlign: "right" }}>Attendance %</th>
                  <th style={{ padding: spacing.md, textAlign: "right" }}>Revenue</th>
                  <th style={{ padding: spacing.md, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analytics.centreBreakdown.map((centre) => (
                  <tr key={centre.centreId} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                    <td style={{ padding: spacing.md }}>
                      <div>
                        <div style={{ fontWeight: typography.fontWeight.semibold }}>
                          {centre.centreName}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          {centre.locality}, {centre.city}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: spacing.md, textAlign: "right" }}>{centre.activePlayers}</td>
                    <td style={{ padding: spacing.md, textAlign: "right" }}>{centre.sessions}</td>
                    <td style={{ padding: spacing.md, textAlign: "right" }}>{centre.attendanceRate}%</td>
                    <td style={{ padding: spacing.md, textAlign: "right" }}>
                      ₹{(centre.revenue / 100).toLocaleString()}
                    </td>
                    <td style={{ padding: spacing.md, textAlign: "center" }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/realverse/admin/centres/${centre.centreId}/analytics`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GlobalAnalyticsPage;


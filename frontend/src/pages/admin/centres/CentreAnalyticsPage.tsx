import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { DISABLE_HEAVY_ANALYTICS } from "../../../config/featureFlags";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";
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
import { AnalyticsCard } from "../../../components/analytics/AnalyticsCard";
import { ChartContainer } from "../../../components/analytics/ChartContainer";
import FinanceDataModal from "./FinanceDataModal";

interface Centre {
  id: number;
  name: string;
  shortName: string;
  locality: string;
  city: string;
  isActive: boolean;
}

interface CentreMonthlyMetrics {
  id: number;
  centreId: number;
  year: number;
  month: number;
  totalPlayers: number | null;
  activePlayers: number | null;
  churnedPlayers: number | null;
  residential: number | null;
  nonResidential: number | null;
  totalRevenue: number | null;
  additionalRevenue: number | null;
  netRentalCharges: number | null;
  coachingCosts: number | null;
  otherExpenses: number | null;
  netProfit: number | null;
}

interface CentreAnalytics {
  centre: Centre;
  summary: {
    totalPlayers: number;
    activePlayers: number;
    churnedPlayers: number;
    avgAttendanceRate: number;
    avgMonthlyRevenue: number | null;
    netProfitTotal: number | null;
  };
  playerTrend: {
    months: string[];
    activeCounts: number[];
  };
  attendance: {
    months: string[];
    attendanceRates: number[];
    bySquad: { squadId: string; attendanceRate: number }[];
  };
  finance: {
    months: string[];
    monthlyRevenue: number[];
    monthlyNetProfit: number[];
    table: CentreMonthlyMetrics[];
  };
  programBreakdown?: Array<{
    program: string;
    activePlayers: number;
    sessions: number;
    attendanceRate: number;
    revenue: number;
  }>;
  coachLoad?: Array<{
    coachId: number;
    coachName: string;
    sessions: number;
  }>;
}

const CentreAnalyticsPage: React.FC = () => {
  const { centreId } = useParams<{ centreId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState<CentreAnalytics | null>(null);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });

  useEffect(() => {
    if (DISABLE_HEAVY_ANALYTICS) {
      setLoading(false);
      setAnalytics(null);
      return;
    }
    if (centreId) {
      loadAnalytics();
    }
  }, [centreId, dateRange]);

  const loadAnalytics = async () => {
    if (!centreId || DISABLE_HEAVY_ANALYTICS) {
      if (!centreId) setError("Centre ID is required");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError("");

      const analyticsData = await api.getCentreAnalytics(Number(centreId), {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      });

      // Transform to match existing interface
      const transformed: CentreAnalytics = {
        centre: analyticsData.centre,
        summary: {
          totalPlayers: analyticsData.summary.activePlayers + analyticsData.summary.droppedPlayers,
          activePlayers: analyticsData.summary.activePlayers,
          churnedPlayers: analyticsData.summary.droppedPlayers,
          avgAttendanceRate: analyticsData.summary.avgAttendanceRate,
          avgMonthlyRevenue: analyticsData.summary.totalRevenue,
          netProfitTotal: analyticsData.summary.totalRevenue - analyticsData.summary.outstandingDues,
        },
        playerTrend: {
          months: [], // Will be populated from attendance breakdown if needed
          activeCounts: [],
        },
        attendance: {
          months: [],
          attendanceRates: [],
          bySquad: [],
        },
        finance: {
          months: [],
          monthlyRevenue: [],
          monthlyNetProfit: [],
          table: [],
        },
        // Add new fields
        programBreakdown: analyticsData.programBreakdown || [],
        coachLoad: analyticsData.coachLoad || [],
      };

      // Fetch attendance breakdown for charts
      try {
        const attendanceData = await api.getCentreAttendanceBreakdown(Number(centreId), {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          groupBy: "week",
        });
        transformed.attendance = {
          months: attendanceData.map((d: any) => d.period),
          attendanceRates: attendanceData.map((d: any) => d.rate),
          bySquad: [],
        };
      } catch (err: any) {
        console.warn("Failed to fetch attendance breakdown:", err);
      }

      // Fetch payments breakdown
      try {
        const paymentsData = await api.getCentrePaymentsBreakdown(Number(centreId), {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        });
        transformed.finance = {
          months: paymentsData.monthlyTrend.map((m: any) => m.month),
          monthlyRevenue: paymentsData.monthlyTrend.map((m: any) => m.paid),
          monthlyNetProfit: paymentsData.monthlyTrend.map((m: any) => m.paid - m.overdue),
          table: [],
        };
      } catch (err: any) {
        console.warn("Failed to fetch payments breakdown:", err);
      }

      setAnalytics(transformed);
    } catch (err: any) {
      setError(err.message || "Failed to load centre analytics");
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRates = (sessions: any[]) => {
    // Simplified calculation - in real implementation, would fetch actual attendance records
    const months: string[] = [];
    const rates: number[] = [];
    
    // Group sessions by month
    const sessionsByMonth = sessions.reduce((acc: any, session: any) => {
      const date = new Date(session.sessionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
        months.push(monthKey);
      }
      acc[monthKey].push(session);
      return acc;
    }, {});

    // Calculate average attendance rate (placeholder)
    months.forEach((month) => {
      rates.push(75 + Math.random() * 20); // Placeholder: 75-95%
    });

    return {
      months,
      rates,
      avgRate: rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0,
    };
  };

  const processFinanceData = (metrics: CentreMonthlyMetrics[]) => {
    const months: string[] = [];
    const monthlyRevenue: number[] = [];
    const monthlyNetProfit: number[] = [];
    const activeCounts: number[] = [];

    metrics.forEach((m) => {
      const monthKey = `${m.year}-${String(m.month).padStart(2, "0")}`;
      months.push(monthKey);
      monthlyRevenue.push((m.totalRevenue || 0) + (m.additionalRevenue || 0));
      monthlyNetProfit.push(m.netProfit || 0);
      activeCounts.push(m.activePlayers || 0);
    });

    const avgRevenue =
      monthlyRevenue.length > 0
        ? monthlyRevenue.reduce((a, b) => a + b, 0) / monthlyRevenue.length
        : null;

    const totalProfit = monthlyNetProfit.reduce((a, b) => a + b, 0);

    return {
      months,
      monthlyRevenue,
      monthlyNetProfit,
      activeCounts,
      avgRevenue,
      totalProfit,
    };
  };

  const handleFinanceUpdate = async () => {
    await loadAnalytics();
    setShowFinanceModal(false);
  };

  if (DISABLE_HEAVY_ANALYTICS) {
    return (
      <div style={{ padding: spacing.xl }}>
        <Card variant="default" padding="lg">
          <p style={{ color: colors.text.secondary, marginBottom: spacing.md }}>
            Centre analytics are temporarily disabled to reduce server load. Please try again later.
          </p>
          <Button variant="secondary" onClick={() => navigate("/realverse/admin/centres")}>
            Back to Centres
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <p style={{ color: colors.text.primary }}>Loading centre analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div style={{ padding: spacing.xl }}>
        <Card variant="default" padding="md" style={{ background: colors.danger.soft }}>
          <p style={{ color: colors.danger.main }}>Error: {error || "Failed to load analytics"}</p>
          <Button variant="secondary" onClick={() => navigate("/realverse/admin/centres")}>
            Back to Centres
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
            {analytics.centre.name} – Centre Analytics
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing.sm }}>
            Player, training and finance overview for this location
          </p>
          <div style={{ display: "flex", gap: spacing.md, alignItems: "center", flexWrap: "wrap" }}>
            <span
              style={{
                ...typography.caption,
                padding: `${spacing.xs} ${spacing.sm}`,
                background: analytics.centre.isActive
                  ? colors.success.soft
                  : colors.danger.soft,
                color: analytics.centre.isActive
                  ? colors.success.main
                  : colors.danger.main,
                borderRadius: borderRadius.md,
              }}
            >
              {analytics.centre.isActive ? "Active" : "Inactive"}
            </span>
            <span style={{ ...typography.body, color: colors.text.muted }}>
              {analytics.centre.locality}, {analytics.centre.city}
            </span>
            <span style={{ ...typography.caption, color: colors.text.muted }}>
              Short Name: {analytics.centre.shortName}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button variant="secondary" onClick={() => navigate("/realverse/admin/centres")}>
            Back to Centres
          </Button>
          <Button variant="primary" onClick={() => setShowFinanceModal(true)}>
            Update Finance Data
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
              padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
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
              padding: `${spacing.md} ${spacing.lg}`, // Increased padding: 16px vertical, 24px horizontal
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
          title="Total Players"
          value={analytics.summary.totalPlayers}
          subtitle="All time"
        />
        <AnalyticsCard
          title="Active Players"
          value={analytics.summary.activePlayers}
          subtitle="Current"
        />
        <AnalyticsCard
          title="Churned Players"
          value={analytics.summary.churnedPlayers}
          subtitle="In period"
        />
        <AnalyticsCard
          title="Avg Attendance %"
          value={`${analytics.summary.avgAttendanceRate.toFixed(1)}%`}
          subtitle="Centre average"
        />
        {analytics.summary.avgMonthlyRevenue !== null && (
          <AnalyticsCard
            title="Avg Monthly Revenue"
            value={`₹${(analytics.summary.avgMonthlyRevenue / 100).toLocaleString()}`}
            subtitle="Over period"
          />
        )}
        {analytics.summary.netProfitTotal !== null && (
          <AnalyticsCard
            title="Net Profit"
            value={`₹${(analytics.summary.netProfitTotal / 100).toLocaleString()}`}
            subtitle="Total over period"
          />
        )}
      </div>

      {/* Player & Engagement Section */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2
          style={{
            ...typography.h2,
            color: colors.text.primary,
            marginBottom: spacing.lg,
          }}
        >
          Player & Engagement
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: spacing.md, marginBottom: spacing.lg }}>
          <div>
            <h3 style={{ ...typography.h3, marginBottom: spacing.sm }}>Total Players</h3>
            <p style={{ ...typography.h1, color: colors.primary.main }}>
              {analytics.summary.totalPlayers}
            </p>
          </div>
          <div>
            <h3 style={{ ...typography.h3, marginBottom: spacing.sm }}>Active</h3>
            <p style={{ ...typography.h1, color: colors.success.main }}>
              {analytics.summary.activePlayers}
            </p>
          </div>
          <div>
            <h3 style={{ ...typography.h3, marginBottom: spacing.sm }}>Churned</h3>
            <p style={{ ...typography.h1, color: colors.danger.main }}>
              {analytics.summary.churnedPlayers}
            </p>
          </div>
        </div>

        {/* Player Count Over Time Chart */}
        {analytics.playerTrend.months.length > 0 && (
          <ChartContainer title="Active Players Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.playerTrend.months.map((month, idx) => ({
                month,
                players: analytics.playerTrend.activeCounts[idx] || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="players" stroke={colors.primary.main} name="Active Players" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </Card>

      {/* Training & Attendance Section */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2
          style={{
            ...typography.h2,
            color: colors.text.primary,
            marginBottom: spacing.lg,
          }}
        >
          Training & Attendance
        </h2>

        {analytics.attendance.months.length > 0 ? (
          <ChartContainer title="Attendance % Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.attendance.months.map((month, idx) => ({
                month,
                attendance: analytics.attendance.attendanceRates[idx] || 0,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke={colors.success.main} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <p style={{ color: colors.text.muted, textAlign: "center", padding: spacing.xl }}>
            No attendance data available for this period
          </p>
        )}
      </Card>

      {/* Finance & Collections Section */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2
          style={{
            ...typography.h2,
            color: colors.text.primary,
            marginBottom: spacing.lg,
          }}
        >
          Finances & Collections
        </h2>

        {analytics.finance.table.length > 0 ? (
          <>
            {/* Monthly Collection Chart */}
            <ChartContainer title="Monthly Collection">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.finance.months.map((month, idx) => ({
                  month,
                  revenue: (analytics.finance.monthlyRevenue[idx] || 0) / 100,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill={colors.primary.main} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Finance Summary Table */}
            <div style={{ marginTop: spacing.xl }}>
              <h3 style={{ ...typography.h3, marginBottom: spacing.md }}>Finance Summary</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                      <th style={{ padding: spacing.md, textAlign: "left" }}>Month</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Revenue</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Additional</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Rental</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Coaching</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Expenses</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.finance.table.map((row) => (
                      <tr key={row.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: spacing.md }}>
                          {new Date(row.year, row.month - 1).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "right" }}>
                          {row.totalRevenue ? `₹${(row.totalRevenue / 100).toLocaleString()}` : "N/A"}
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "right" }}>
                          {row.additionalRevenue ? `₹${(row.additionalRevenue / 100).toLocaleString()}` : "N/A"}
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "right" }}>
                          {row.netRentalCharges ? `₹${(row.netRentalCharges / 100).toLocaleString()}` : "N/A"}
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "right" }}>
                          {row.coachingCosts ? `₹${(row.coachingCosts / 100).toLocaleString()}` : "N/A"}
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "right" }}>
                          {row.otherExpenses ? `₹${(row.otherExpenses / 100).toLocaleString()}` : "N/A"}
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "right", fontWeight: typography.fontWeight.semibold }}>
                          {row.netProfit ? `₹${(row.netProfit / 100).toLocaleString()}` : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: spacing.xl }}>
            <p style={{ color: colors.text.muted, marginBottom: spacing.md }}>
              No finance data recorded yet for this period
            </p>
            <Button variant="primary" onClick={() => setShowFinanceModal(true)}>
              Add Finance Data
            </Button>
          </div>
        )}
      </Card>

      {/* Finance Data Modal */}
      {showFinanceModal && (
        <FinanceDataModal
          centreId={Number(centreId)}
          onClose={() => setShowFinanceModal(false)}
          onSave={handleFinanceUpdate}
        />
      )}
    </div>
  );
};

export default CentreAnalyticsPage;


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
  PieChart,
  Pie,
  Cell,
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

interface FanClubAnalytics {
  fanCount: number;
  activeFans: number;
  redemptionCount: number;
  leadsCount: number;
  tierDistribution: Record<string, number>;
  programInterestCounts: Record<string, number>;
  redemptionsBySponsor: Record<string, number>;
}

interface ShopAnalytics {
  totalOrders: number;
  totalRevenue: number;
  pendingRevenue: number;
  avgOrderValue: number;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{
    productId: number;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    orderNumber: string;
    customerName: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  ordersTimeseries: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

const CHART_COLORS = {
  primary: colors.primary.main,
  success: colors.success.main,
  warning: colors.warning.main,
  danger: colors.danger.main,
  info: "#3B82F6",
  purple: "#A855F7",
  pink: "#EC4899",
  teal: "#14B8A6",
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.info,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.teal,
];

const GlobalAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentAnalytics, setStudentAnalytics] = useState<GlobalAnalytics | null>(null);
  const [fanClubAnalytics, setFanClubAnalytics] = useState<FanClubAnalytics | null>(null);
  const [shopAnalytics, setShopAnalytics] = useState<ShopAnalytics | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    to: new Date(),
  });

  useEffect(() => {
    loadAllAnalytics();
  }, [dateRange]);

  const loadAllAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const dateParams = {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      };

      // Load all analytics in parallel
      const [studentData, fanData, shopData] = await Promise.all([
        api.getAnalyticsOverview(dateParams).catch((err) => {
          console.error("Student analytics error:", err);
          return null;
        }),
        api.getFanClubAnalytics().catch((err) => {
          console.error("Fan club analytics error:", err);
          return null;
        }),
        api.getShopAnalytics(dateParams).catch((err) => {
          console.error("Shop analytics error:", err);
          return null;
        }),
      ]);

      setStudentAnalytics(studentData);
      setFanClubAnalytics(fanData);
      setShopAnalytics(shopData);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
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
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: spacing.xl }}>
        <Card variant="default" padding="lg" style={{ background: colors.danger.soft, border: `1px solid ${colors.danger.main}` }}>
          <h2 style={{ ...typography.h3, color: colors.danger.main, marginBottom: spacing.md }}>
            Error Loading Analytics
          </h2>
          <p style={{ color: colors.danger.main, marginBottom: spacing.lg, ...typography.body }}>
            {error}
          </p>
          <Button variant="primary" onClick={() => loadAllAnalytics()}>
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
            Global Analytics Dashboard
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing.sm }}>
            Comprehensive overview of Students, Fan Club, and Shop
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

      {/* ========================================
          STUDENTS ANALYTICS SECTION
          ======================================== */}
      {studentAnalytics && (
        <>
          <div style={{ marginBottom: spacing.lg }}>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>
              📚 Student Academy Analytics
            </h2>
          </div>

          {/* Student Summary KPIs */}
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
              value={studentAnalytics.totalActivePlayers}
          subtitle="Across all centres"
        />
        <AnalyticsCard
          title="Total Centres"
              value={studentAnalytics.totalCentres}
          subtitle="Active locations"
        />
        <AnalyticsCard
          title="Avg Club Attendance"
              value={`${studentAnalytics.avgClubAttendance}%`}
          subtitle="Overall average"
        />
        <AnalyticsCard
          title="Monthly Revenue"
              value={`₹${(studentAnalytics.monthlyRevenue / 100).toLocaleString()}`}
              subtitle="From student fees"
        />
        <AnalyticsCard
          title="Total Trials"
              value={studentAnalytics.totalTrials}
          subtitle="This period"
        />
      </div>

          {/* Centre Comparison Charts */}
          <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
            <h3
          style={{
                ...typography.h3,
            color: colors.text.primary,
            marginBottom: spacing.lg,
          }}
        >
              Centre Performance
            </h3>

        {/* Attendance by Centre */}
        <ChartContainer title="Attendance % by Centre">
          <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentAnalytics.centreBreakdown.map((c) => ({
              centre: c.centreShortName || c.centreName,
              attendance: c.attendanceRate,
            }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border.subtle} />
                  <XAxis dataKey="centre" stroke={colors.text.muted} />
                  <YAxis domain={[0, 100]} stroke={colors.text.muted} />
                  <Tooltip 
                    formatter={(value: any) => `${value}%`}
                    contentStyle={{ backgroundColor: colors.surface.card, border: `1px solid ${colors.border.main}` }}
                  />
              <Legend />
                  <Bar dataKey="attendance" fill={CHART_COLORS.success} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Revenue by Centre */}
        <ChartContainer title="Revenue by Centre" style={{ marginTop: spacing.xl }}>
          <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentAnalytics.centreBreakdown.map((c) => ({
              centre: c.centreShortName || c.centreName,
              revenue: c.revenue / 100,
            }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border.subtle} />
                  <XAxis dataKey="centre" stroke={colors.text.muted} />
                  <YAxis stroke={colors.text.muted} />
                  <Tooltip 
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: colors.surface.card, border: `1px solid ${colors.border.main}` }}
                  />
              <Legend />
                  <Bar dataKey="revenue" fill={CHART_COLORS.primary} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
          </Card>
        </>
      )}

      {/* ========================================
          FAN CLUB ANALYTICS SECTION
          ======================================== */}
      {fanClubAnalytics && (
        <>
          <div style={{ marginBottom: spacing.lg }}>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>
              ⚽ Fan Club Analytics
            </h2>
          </div>

          {/* Fan Club Summary KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
              marginBottom: spacing.xl,
            }}
          >
            <AnalyticsCard
              title="Total Fans"
              value={fanClubAnalytics.fanCount}
              subtitle="All registered fans"
            />
            <AnalyticsCard
              title="Active Fans"
              value={fanClubAnalytics.activeFans}
              subtitle="Currently active"
            />
            <AnalyticsCard
              title="Coupon Redemptions"
              value={fanClubAnalytics.redemptionCount}
              subtitle="Total redeemed"
            />
            <AnalyticsCard
              title="Conversion Leads"
              value={fanClubAnalytics.leadsCount}
              subtitle="Fan to student leads"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: spacing.md, marginBottom: spacing.xl }}>
            {/* Tier Distribution */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Membership Tier Distribution
              </h3>
              {Object.keys(fanClubAnalytics.tierDistribution).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(fanClubAnalytics.tierDistribution).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill={CHART_COLORS.primary}
                      dataKey="value"
                    >
                      {Object.keys(fanClubAnalytics.tierDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: colors.surface.card, border: `1px solid ${colors.border.main}` }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: colors.text.muted, textAlign: "center", padding: spacing.xl }}>
                  No tier data available
                </p>
              )}
            </Card>

            {/* Program Interest */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Program Interest
              </h3>
              {Object.keys(fanClubAnalytics.programInterestCounts).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(fanClubAnalytics.programInterestCounts).map(([name, value]) => ({
                    program: name,
                    count: value,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border.subtle} />
                    <XAxis dataKey="program" stroke={colors.text.muted} />
                    <YAxis stroke={colors.text.muted} />
                    <Tooltip contentStyle={{ backgroundColor: colors.surface.card, border: `1px solid ${colors.border.main}` }} />
                    <Bar dataKey="count" fill={CHART_COLORS.info} name="Interested Fans" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: colors.text.muted, textAlign: "center", padding: spacing.xl }}>
                  No program interest data available
                </p>
              )}
            </Card>
          </div>

          {/* Redemptions by Sponsor */}
          {Object.keys(fanClubAnalytics.redemptionsBySponsor).length > 0 && (
            <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Sponsor Engagement
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(fanClubAnalytics.redemptionsBySponsor).map(([name, value]) => ({
                  sponsor: name,
                  redemptions: value,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border.subtle} />
                  <XAxis dataKey="sponsor" stroke={colors.text.muted} />
                  <YAxis stroke={colors.text.muted} />
                  <Tooltip contentStyle={{ backgroundColor: colors.surface.card, border: `1px solid ${colors.border.main}` }} />
                  <Bar dataKey="redemptions" fill={CHART_COLORS.purple} name="Redemptions" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}

      {/* ========================================
          SHOP ANALYTICS SECTION
          ======================================== */}
      {shopAnalytics && (
        <>
          <div style={{ marginBottom: spacing.lg }}>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>
              🛍️ Shop & Merchandise Analytics
            </h2>
          </div>

          {/* Shop Summary KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
              marginBottom: spacing.xl,
            }}
          >
            <AnalyticsCard
              title="Total Orders"
              value={shopAnalytics.totalOrders}
              subtitle="All time orders"
            />
            <AnalyticsCard
              title="Total Revenue"
              value={`₹${(shopAnalytics.totalRevenue / 100).toLocaleString()}`}
              subtitle="From paid orders"
            />
            <AnalyticsCard
              title="Pending Revenue"
              value={`₹${(shopAnalytics.pendingRevenue / 100).toLocaleString()}`}
              subtitle="Awaiting payment"
            />
            <AnalyticsCard
              title="Avg Order Value"
              value={`₹${(shopAnalytics.avgOrderValue / 100).toLocaleString()}`}
              subtitle="Per order"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: spacing.md, marginBottom: spacing.xl }}>
            {/* Orders by Status */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Orders by Status
              </h3>
              {Object.keys(shopAnalytics.ordersByStatus).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(shopAnalytics.ordersByStatus).map(([name, value]) => ({
                        name: name.replace(/_/g, ' '),
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill={CHART_COLORS.primary}
                      dataKey="value"
                    >
                      {Object.keys(shopAnalytics.ordersByStatus).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: colors.surface.card, border: `1px solid ${colors.border.main}` }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: colors.text.muted, textAlign: "center", padding: spacing.xl }}>
                  No orders yet
                </p>
              )}
            </Card>

            {/* Top Products */}
            <Card variant="elevated" padding="lg">
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Top Selling Products
              </h3>
              {shopAnalytics.topProducts.length > 0 ? (
                <div style={{ overflowY: "auto", maxHeight: "300px" }}>
                  {shopAnalytics.topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      style={{
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                        background: colors.surface.elevated,
                        borderRadius: borderRadius.md,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold }}>
                          #{index + 1} {product.name}
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          Qty: {product.quantity} | Revenue: ₹{(product.revenue / 100).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.text.muted, textAlign: "center", padding: spacing.xl }}>
                  No sales data available
                </p>
              )}
            </Card>
          </div>

          {/* Orders Over Time */}
          {shopAnalytics.ordersTimeseries.length > 0 && (
            <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Orders Trend (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={shopAnalytics.ordersTimeseries}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border.subtle} />
                  <XAxis 
                    dataKey="date" 
                    stroke={colors.text.muted}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke={colors.text.muted} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: colors.surface.card, border: `1px solid ${colors.border.main}` }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: any, name: string) => {
                      if (name === "revenue") return `₹${(value / 100).toLocaleString()}`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke={CHART_COLORS.info} name="Orders" strokeWidth={2} />
                  <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.success} name="Revenue" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Recent Orders */}
          {shopAnalytics.recentOrders.length > 0 && (
            <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                Recent Orders
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.border.main}` }}>
                      <th style={{ padding: spacing.md, textAlign: "left" }}>Order #</th>
                      <th style={{ padding: spacing.md, textAlign: "left" }}>Customer</th>
                      <th style={{ padding: spacing.md, textAlign: "left" }}>Email</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Total</th>
                      <th style={{ padding: spacing.md, textAlign: "center" }}>Status</th>
                      <th style={{ padding: spacing.md, textAlign: "right" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopAnalytics.recentOrders.map((order) => (
                      <tr key={order.orderNumber} style={{ borderBottom: `1px solid ${colors.border.subtle}` }}>
                        <td style={{ padding: spacing.md, fontFamily: "monospace", fontSize: "0.875rem" }}>
                          {order.orderNumber}
                        </td>
                        <td style={{ padding: spacing.md }}>{order.customerName}</td>
                        <td style={{ padding: spacing.md, color: colors.text.muted }}>{order.email}</td>
                        <td style={{ padding: spacing.md, textAlign: "right", fontWeight: typography.fontWeight.semibold }}>
                          ₹{(order.total / 100).toLocaleString()}
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "center" }}>
                          <span
                            style={{
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.sm,
                              fontSize: "0.75rem",
                              fontWeight: typography.fontWeight.semibold,
                              background:
                                order.status === "PAID"
                                  ? colors.success.soft
                                  : order.status === "PENDING_PAYMENT"
                                  ? colors.warning.soft
                                  : order.status === "SHIPPED"
                                  ? colors.info
                                  : order.status === "DELIVERED"
                                  ? colors.success.main
                                  : colors.danger.soft,
                              color:
                                order.status === "PAID"
                                  ? colors.success.main
                                  : order.status === "PENDING_PAYMENT"
                                  ? colors.warning.main
                                  : order.status === "FAILED" || order.status === "CANCELLED"
                                  ? colors.danger.main
                                  : colors.text.primary,
                            }}
                          >
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: spacing.md, textAlign: "right", color: colors.text.muted, fontSize: "0.875rem" }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Centre Details Table (Student Analytics) */}
      {studentAnalytics && (
        <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
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
                {studentAnalytics.centreBreakdown.map((centre) => (
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
      </Card>
      )}
    </div>
  );
};

export default GlobalAnalyticsPage;

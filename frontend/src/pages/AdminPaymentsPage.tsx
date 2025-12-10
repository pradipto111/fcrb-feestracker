import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { KPICard } from "../components/ui/KPICard";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";
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

const AdminPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [revenueCenterId, setRevenueCenterId] = useState("");
  const [revenuePaymentMode, setRevenuePaymentMode] = useState("all");
  const [monthlyCenterId, setMonthlyCenterId] = useState("");
  const [monthlyPaymentMode, setMonthlyPaymentMode] = useState("all");

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadCenters();
    loadSummary();
  }, []);

  useEffect(() => {
    loadRevenueData();
  }, [revenueMonths, revenueCenterId, revenuePaymentMode]);

  useEffect(() => {
    loadMonthlyData();
  }, [monthlyCenterId, monthlyPaymentMode]);

  const loadCenters = async () => {
    try {
      const data = await api.getCenters();
      setCenters(data);
    } catch (err: any) {
      console.error("Failed to load centers:", err);
    }
  };

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load payment summary");
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueData = async () => {
    try {
      const data = await api.getRevenueCollections({
        months: revenueMonths,
        centerId: revenueCenterId || undefined,
        paymentMode: revenuePaymentMode !== "all" ? revenuePaymentMode : undefined,
      });
      setRevenueData(data);
    } catch (err: any) {
      console.error("Failed to load revenue data:", err);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const data = await api.getMonthlyCollections({
        months: 12,
        centerId: monthlyCenterId || undefined,
        paymentMode: monthlyPaymentMode !== "all" ? monthlyPaymentMode : undefined,
      });
      setMonthlyData(data);
    } catch (err: any) {
      console.error("Failed to load monthly data:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div style={{ ...typography.h3, color: colors.text.primary }}>Loading payments...</div>
      </div>
    );
  }

  const centerOptions = [
    { value: "", label: "All Centers" },
    ...centers.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: spacing.md }}
    >
      <PageHeader
        title="Payments & Revenue"
        subtitle="Track payments and revenue collections"
      />

      {error && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            background: colors.error.light,
            color: colors.error.main,
            borderRadius: borderRadius.md,
          }}
        >
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.md,
          marginBottom: spacing.xl,
        }}
      >
        <KPICard
          label="Total Collected"
          value={`₹${summary?.totalCollected?.toLocaleString() || 0}`}
          trend="up"
          icon="💰"
        />
        <KPICard
          label="Total Students"
          value={summary?.studentCount || 0}
          icon="👥"
        />
        <KPICard
          label="Outstanding"
          value={`₹${summary?.approxOutstanding?.toLocaleString() || 0}`}
          trend="down"
          icon="⏳"
        />
      </div>

      {/* Revenue Chart */}
      <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
        <Card variant="default" padding="lg">
          <div
            className="responsive-flex-row"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              marginBottom: spacing.md,
              justifyContent: "space-between",
            }}
          >
            <h3 style={{ ...typography.h3, color: colors.text.primary }}>
              Revenue Collections
            </h3>
            <div
              className="responsive-flex-row"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.sm,
                width: "100%",
              }}
            >
              <select
                value={revenueMonths}
                onChange={(e) => setRevenueMonths(Number(e.target.value))}
                style={{
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.surface.card}`,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  width: "100%",
                }}
              >
                <option value={6}>Last 6 Months</option>
                <option value={12}>Last 12 Months</option>
                <option value={24}>Last 24 Months</option>
              </select>
              <select
                value={revenueCenterId}
                onChange={(e) => setRevenueCenterId(e.target.value)}
                style={{
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.surface.card}`,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  width: "100%",
                }}
              >
                {centerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={revenuePaymentMode}
                onChange={(e) => setRevenuePaymentMode(e.target.value)}
                style={{
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.surface.card}`,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  width: "100%",
                }}
              >
                <option value="all">All Modes</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis dataKey="month" stroke={colors.text.secondary} />
                <YAxis stroke={colors.text.secondary} />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={colors.primary.main}
                  strokeWidth={2}
                  name="Amount (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Monthly Collections Chart */}
      <motion.div variants={cardVariants}>
        <Card variant="default" padding="lg">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              marginBottom: spacing.md,
              ["@media (min-width: 768px)" as any]: {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            }}
          >
            <h3 style={{ ...typography.h3, color: colors.text.primary }}>
              Monthly Collections
            </h3>
            <div
              className="responsive-flex-row"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.sm,
                width: "100%",
              }}
            >
              <select
                value={monthlyCenterId}
                onChange={(e) => setMonthlyCenterId(e.target.value)}
                style={{
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.surface.card}`,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  width: "100%",
                }}
              >
                {centerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                value={monthlyPaymentMode}
                onChange={(e) => setMonthlyPaymentMode(e.target.value)}
                style={{
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.surface.card}`,
                  background: colors.surface.card,
                  color: colors.text.primary,
                  width: "100%",
                }}
              >
                <option value="all">All Modes</option>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.surface.card} />
                <XAxis dataKey="month" stroke={colors.text.secondary} />
                <YAxis stroke={colors.text.secondary} />
                <Tooltip
                  contentStyle={{
                    background: colors.surface.main,
                    border: `1px solid ${colors.surface.card}`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                  }}
                />
                <Legend />
                <Bar dataKey="amount" fill={colors.success.main} name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminPaymentsPage;


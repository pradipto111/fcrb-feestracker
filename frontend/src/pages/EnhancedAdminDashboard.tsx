import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { KPICard } from "../components/ui/KPICard";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import HeroSection from "../components/HeroSection";
import { pageVariants, cardVariants } from "../utils/motion";

const EnhancedAdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [centers, setCenters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  // Chart 1 filters (Revenue)
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [revenueCenterId, setRevenueCenterId] = useState("");
  const [revenuePaymentMode, setRevenuePaymentMode] = useState("all");
  
  // Chart 2 filters (Monthly) - no time period filter, shows all months
  const [monthlyCenterId, setMonthlyCenterId] = useState("");
  const [monthlyPaymentMode, setMonthlyPaymentMode] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadRevenueData();
  }, [revenueMonths, revenueCenterId, revenuePaymentMode]);

  useEffect(() => {
    loadMonthlyData();
  }, [monthlyCenterId, monthlyPaymentMode]);

  const loadData = async () => {
    try {
      const [summaryData, centersData, studentsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getCenters(),
        api.getStudents()
      ]);
      setSummary(summaryData);
      setCenters(centersData);
      setStudents(studentsData);
      // Revenue and monthly data will be loaded by their respective useEffect hooks
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadRevenueData = async () => {
    try {
      const data = await api.getRevenueCollections({
        months: revenueMonths,
        centerId: revenueCenterId || undefined,
        paymentMode: revenuePaymentMode === "all" ? undefined : revenuePaymentMode
      });
      setRevenueData(data);
    } catch (err: any) {
      console.error("Failed to load revenue data:", err);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const data = await api.getMonthlyCollections({
        centerId: monthlyCenterId || undefined,
        paymentMode: monthlyPaymentMode === "all" ? undefined : monthlyPaymentMode
      });
      setMonthlyData(data);
    } catch (err: any) {
      console.error("Failed to load monthly data:", err);
    }
  };

  return (
    <motion.main
      className="rv-page rv-page--dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      {/* Hero Section with Video */}
      <HeroSection 
        title="Welcome to RealVerse"
        subtitle="Complete academy management and analytics dashboard"
        showVideo={true}
      />

      <section className="rv-section-surface">
        {/* Header */}
        <header className="rv-section-header">
          <div>
            <h1 className="rv-page-title">Admin Dashboard</h1>
            <p className="rv-page-subtitle">Complete academy overview and analytics</p>
          </div>
          <motion.button
            className="rv-btn rv-btn-secondary"
            whileHover={{ scale: 1.02, boxShadow: "0 0 12px rgba(0, 224, 255, 0.2)" }}
            whileTap={{ scale: 0.98 }}
            onClick={loadData}
          >
            🔄 Refresh
          </motion.button>
        </header>

        {/* Error State */}
        {error && (
          <Card variant="default" padding="md" style={{ 
            marginBottom: spacing.md,
            background: colors.danger.soft,
            border: `1px solid ${colors.danger.main}40`,
          }}>
            <p style={{ margin: 0, color: colors.danger.main }}>Error: {error}</p>
          </Card>
        )}

        {/* Loading State */}
        {!summary && !error && (
          <div className="rv-empty-state">
            <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--lg" style={{ marginBottom: spacing.md }} />
            <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
            <p style={{ marginTop: spacing.lg, color: colors.text.muted }}>Loading dashboard data...</p>
          </div>
        )}

        {/* Content - Only render if data is loaded */}
        {summary && !error && (() => {
          // Calculate center-wise stats
          const centerStats = centers.map(center => {
            const centerStudents = students.filter(s => s.centerId === center.id);
            const centerRevenue = centerStudents.reduce((sum, s) => sum + s.monthlyFeeAmount, 0);
            return {
              ...center,
              studentCount: centerStudents.length,
              revenue: centerRevenue,
              activeStudents: centerStudents.filter(s => s.status === "ACTIVE").length
            };
          });

          const totalRevenue = centerStats.reduce((sum, c) => sum + c.revenue, 0);
          const activeStudents = students.filter(s => s.status === "ACTIVE").length;
          const totalExpected = summary.totalCollected + summary.approxOutstanding;

          return (
            <React.Fragment key="dashboard-content">
              {/* Main Stats Cards */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
                gap: spacing.lg, 
                marginBottom: spacing.xl 
              }}>
                <motion.div custom={0} variants={cardVariants} initial="initial" animate="animate">
                  <KPICard
                    title="Total Revenue"
                    value={`₹${summary.totalCollected.toLocaleString()}`}
                    subtitle="All-time collections"
                    variant="primary"
                  />
                </motion.div>

                <motion.div custom={1} variants={cardVariants} initial="initial" animate="animate">
                  <KPICard
                    title="Outstanding"
                    value={`₹${summary.approxOutstanding.toLocaleString()}`}
                    subtitle="Pending collections"
                    variant="warning"
                  />
                </motion.div>

                <motion.div custom={2} variants={cardVariants} initial="initial" animate="animate">
                  <KPICard
                    title="Total Students"
                    value={summary.studentCount.toString()}
                    subtitle={`${activeStudents} Active across ${centers.length} centers`}
                    variant="info"
                  />
                </motion.div>

                <motion.div custom={3} variants={cardVariants} initial="initial" animate="animate">
                  <KPICard
                    title="Total Expected"
                    value={`₹${totalExpected.toLocaleString()}`}
                    subtitle="Collected + Outstanding"
                    variant="success"
                  />
                </motion.div>
              </div>

              {/* CHART 1: Revenue Collections */}
              <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ ...typography.h3, margin: 0, color: colors.text.primary }}>Revenue Collections</h2>
            <p style={{ ...typography.caption, color: colors.text.secondary, margin: `${spacing.xs} 0 0 0` }}>
              Total money collected by payment date
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16, 
          marginBottom: 24,
          padding: 16,
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 8
        }}>
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              📅 Time Period
            </label>
            <select
              value={revenueMonths}
              onChange={(e) => setRevenueMonths(Number(e.target.value))}
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last 12 Months</option>
              <option value="18">Last 18 Months</option>
              <option value="24">Last 24 Months</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              🏢 Center
            </label>
            <select
              value={revenueCenterId}
              onChange={(e) => setRevenueCenterId(e.target.value)}
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              <option value="">All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              💳 Payment Mode
            </label>
            <select
              value={revenuePaymentMode}
              onChange={(e) => setRevenuePaymentMode(e.target.value)}
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Button
              variant="utility"
              onClick={loadRevenueData}
              style={{ width: "100%" }}
            >
              🔄 Refresh Chart
            </Button>
          </div>
        </div>
        {revenueData.length > 0 ? (
          <>
            <div style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {revenueData.map((data, idx) => {
                const maxAmount = Math.max(...revenueData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2.5}px`,
                        minHeight: data.amount > 0 ? "20px" : "5px",
                        background: data.amount > 0 
                          ? `linear-gradient(to top, ${colors.primary.main}, ${colors.primary.dark})` 
                          : "rgba(255, 255, 255, 0.1)",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      title={`${data.month}: ₹${data.amount.toLocaleString()}`}
                    >
                      {data.amount > 0 && (
                        <div style={{
                          position: "absolute",
                          top: "-24px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 9, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-10px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ 
              textAlign: "center", 
              marginTop: spacing.xl, 
              padding: spacing.lg, 
              background: "rgba(255, 255, 255, 0.05)", 
              borderRadius: borderRadius.lg,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                Total Revenue ({revenueMonths} months
                {revenueCenterId && ` • ${centers.find(c => c.id === Number(revenueCenterId))?.name}`}
                {revenuePaymentMode !== "all" && ` • ${revenuePaymentMode}`})
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1E40AF" }}>
                ₹{revenueData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                Average: ₹{Math.floor(revenueData.reduce((sum, m) => sum + m.amount, 0) / revenueMonths).toLocaleString()}/month
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No payment data available yet
          </div>
        )}
      </Card>

      {/* CHART 2: Monthly Collections */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.xl }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: spacing.lg,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          paddingBottom: spacing.md,
        }}>
          <div>
            <h2 style={{ 
              ...typography.h2,
              margin: 0,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              📊 Monthly Collections
            </h2>
            <p style={{ 
              ...typography.caption,
              color: colors.text.muted,
              margin: `${spacing.xs} 0 0 0` 
            }}>
              Allocated monthly income (shows all months with payments, including future)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: 16, 
          marginBottom: 24,
          padding: 16,
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 8
        }}>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              🏢 Center
            </label>
            <select
              value={monthlyCenterId}
              onChange={(e) => setMonthlyCenterId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer"
              }}
            >
              <option value="">All Centers</option>
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              💳 Payment Mode
            </label>
            <select
              value={monthlyPaymentMode}
              onChange={(e) => setMonthlyPaymentMode(e.target.value)}
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Button
              variant="utility"
              onClick={loadMonthlyData}
              style={{ width: "100%" }}
            >
              🔄 Refresh Chart
            </Button>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <>
            <div style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {monthlyData.map((data, idx) => {
                const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2.5}px`,
                        minHeight: data.amount > 0 ? "20px" : "5px",
                        background: data.amount > 0 
                          ? "linear-gradient(to top, #43e97b, #38f9d7)" 
                          : "#e0e0e0",
                        borderRadius: "4px 4px 0 0",
                        transition: "all 0.3s",
                        cursor: "pointer",
                        position: "relative"
                      }}
                      title={`${data.month}: ₹${data.amount.toLocaleString()}`}
                    >
                      {data.amount > 0 && (
                        <div style={{
                          position: "absolute",
                          top: "-24px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#43e97b",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 9, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-10px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ 
              textAlign: "center", 
              marginTop: spacing.xl, 
              padding: spacing.lg, 
              background: "rgba(255, 255, 255, 0.05)", 
              borderRadius: borderRadius.lg,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                Total Allocated ({monthlyData.length} months
                {monthlyCenterId && ` • ${centers.find(c => c.id === Number(monthlyCenterId))?.name}`}
                {monthlyPaymentMode !== "all" && ` • ${monthlyPaymentMode}`})
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#43e97b" }}>
                ₹{monthlyData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                Average: ₹{monthlyData.length > 0 ? Math.floor(monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length).toLocaleString() : 0}/month
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'], 
            color: colors.text.muted,
            ...typography.body,
          }}>
            No payment data available yet
          </div>
        )}
              </Card>

              {/* Charts Section */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
        {/* Collection vs Outstanding Comparison */}
        <div style={{
          background: colors.surface.card,
          backdropFilter: "blur(20px)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📊 Collection Overview</h2>
          <div style={{ height: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 48, padding: "16px 0" }}>
            {/* Collected Bar */}
            <div style={{ flex: 1, maxWidth: 200, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                height: `${(summary.totalCollected / totalExpected) * 250}px`,
                minHeight: "50px",
                background: "linear-gradient(to top, #1E40AF, #1E3A8A)",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 18
              }}>
                ₹{(summary.totalCollected / 1000).toFixed(0)}k
              </div>
              <div style={{ fontSize: 16, marginTop: 12, color: "#1E40AF", fontWeight: 700 }}>
                Collected
              </div>
              <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                {totalExpected > 0 ? ((summary.totalCollected / totalExpected) * 100).toFixed(1) : 0}%
              </div>
            </div>

            {/* Outstanding Bar */}
            <div style={{ flex: 1, maxWidth: 200, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "100%",
                height: `${(summary.approxOutstanding / totalExpected) * 250}px`,
                minHeight: "50px",
                background: "linear-gradient(to top, #f093fb, #f5576c)",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.text.onPrimary,
                fontWeight: typography.fontWeight.bold,
                fontSize: typography.fontSize.lg,
              }}>
                ₹{(summary.approxOutstanding / 1000).toFixed(0)}k
              </div>
              <div style={{ fontSize: 16, marginTop: 12, color: "#f5576c", fontWeight: 700 }}>
                Outstanding
              </div>
              <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                {totalExpected > 0 ? ((summary.approxOutstanding / totalExpected) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 24, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Total Expected Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#333" }}>₹{totalExpected.toLocaleString()}</div>
          </div>
        </div>

        {/* Center Pie Chart */}
        <div style={{
          background: colors.surface.card,
          backdropFilter: "blur(20px)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🏢 Centers</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {centerStats.map((center, idx) => {
              const percentage = totalRevenue > 0 ? ((center.revenue / totalRevenue) * 100).toFixed(1) : 0;
              const chartColors = ["#1E40AF", "#f093fb", "#4facfe", "#43e97b", "#feca57"];
              return (
                <div key={center.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: spacing.xs }}>
                    <span style={{ 
                      ...typography.body,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}>
                      {center.name}
                    </span>
                    <span style={{ 
                      ...typography.body,
                      color: colors.text.secondary,
                    }}>
                      {percentage}%
                    </span>
                  </div>
                  <div style={{
                    height: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 4,
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: chartColors[idx % chartColors.length],
                      transition: "width 0.3s"
                    }} />
                  </div>
                  <div style={{ 
                    ...typography.caption,
                    color: colors.text.muted, 
                    marginTop: spacing.xs,
                  }}>
                    {center.studentCount} students • ₹{center.revenue.toLocaleString()}/mo
                  </div>
                </div>
              );
            })}
          </div>
        </div>
              </div>

              {/* Center-wise Detailed Stats */}
              <Card variant="default" padding="lg" style={{ marginBottom: spacing.xl }}>
        <h2 style={{ 
          ...typography.h2,
          marginBottom: spacing.lg,
          background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          🎯 Center-wise Performance
        </h2>
        <div style={{ display: "grid", gap: 16 }}>
          {centerStats.map((center, idx) => {
            const colors = [
              { bg: "#1E40AF20", text: "#1E40AF" },
              { bg: "#f093fb20", text: "#f093fb" },
              { bg: "#4facfe20", text: "#4facfe" },
              { bg: "#43e97b20", text: "#43e97b" }
            ];
            const color = colors[idx % colors.length];
            
            return (
              <div key={center.id} style={{
                padding: 20,
                background: color.bg,
                borderRadius: 12,
                border: `2px solid ${color.text}30`
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 16, alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: color.text }}>
                      {center.name}
                    </h3>
                    <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
                      {center.location}, {center.city}
                    </p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: color.text }}>
                      {center.studentCount}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Students</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: color.text }}>
                      {center.activeStudents}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Active</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: color.text }}>
                      ₹{center.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>Monthly</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
              </Card>

              {/* Quick Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <div style={{
          background: colors.surface.card,
          backdropFilter: "blur(20px)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Centers</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF" }}>{centers.length}</div>
        </div>

        <div style={{
          background: colors.surface.card,
          backdropFilter: "blur(20px)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Active Students</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#27ae60" }}>{activeStudents}</div>
        </div>

        <div style={{
          background: colors.surface.card,
          backdropFilter: "blur(20px)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Trial Students</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#f39c12" }}>
            {students.filter(s => s.status === "TRIAL").length}
          </div>
        </div>

        <div style={{
          background: colors.surface.card,
          backdropFilter: "blur(20px)",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Avg Fee/Student</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#3498db" }}>
            ₹{students.length > 0 ? Math.floor(totalRevenue / students.length).toLocaleString() : 0}
          </div>
        </div>
              </div>
            </React.Fragment>
          );
        })()}
      </section>
    </motion.main>
  );
};

export default EnhancedAdminDashboard;


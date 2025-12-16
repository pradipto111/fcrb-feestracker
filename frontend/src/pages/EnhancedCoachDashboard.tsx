import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { KPICard } from "../components/ui/KPICard";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { centresAssets, adminAssets, heroAssets, clubAssets } from "../config/assets";
import { FootballIcon, ClipboardIcon, CalendarIcon, ChartBarIcon, ChartLineIcon, UsersIcon } from "../components/icons/IconSet";

const EnhancedCoachDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  // Revenue Chart filters
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [revenuePaymentMode, setRevenuePaymentMode] = useState("all");

  // Monthly Chart filters - no time period, shows all months
  const [monthlyPaymentMode, setMonthlyPaymentMode] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, studentsData] = await Promise.all([
        api.getDashboardSummary(),
        api.getStudents()
      ]);
      setSummary(summaryData);
      setStudents(studentsData);
      await loadRevenueData();
      await loadMonthlyData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadRevenueData = async () => {
    try {
      const revenueCollections = await api.getRevenueCollections({
        months: revenueMonths,
        paymentMode: revenuePaymentMode === "all" ? undefined : revenuePaymentMode
      });
      setRevenueData(revenueCollections);
    } catch (err: any) {
      console.error("Failed to load revenue data:", err);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const monthlyCollections = await api.getMonthlyCollections({
        paymentMode: monthlyPaymentMode === "all" ? undefined : monthlyPaymentMode
      });
      setMonthlyData(monthlyCollections);
    } catch (err: any) {
      console.error("Failed to load monthly data:", err);
    }
  };

  return (
    <motion.main
      className="rv-page rv-page--coach-dashboard"
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

      {/* BANNER SECTION - STUNNING THEME */}
      <motion.section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
          minHeight: "350px",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background image - ONLY IMAGE, NO VIDEO */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${centresAssets.genericPitchBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
            filter: "blur(6px)",
            zIndex: 0,
          }}
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Animated Radial Gradient */}
        <motion.div
          style={{
            position: "absolute",
            top: "20%",
            left: "25%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(0, 224, 255, 0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(50px)",
            zIndex: 1,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(4, 61, 208, 0.7) 0%, rgba(255, 169, 0, 0.5) 100%)`,
            zIndex: 2,
          }}
        />
        
        {/* Banner content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: spacing["2xl"],
            display: "flex",
            flexDirection: "column",
            gap: spacing.lg,
          }}
        >
          <p
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.1em",
              margin: 0,
            }}
          >
            RealVerse • Coach Dashboard
          </p>
          <h1
            style={{
              ...typography.h1,
              color: colors.text.onPrimary,
              margin: 0,
            }}
          >
            FCRB Coach Dashboard
            <span style={{ display: "block", color: colors.accent.main, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal, marginTop: spacing.xs }}>
              FC Real Bengaluru - Your centers overview
            </span>
          </h1>
        </div>
      </motion.section>

      <Section
        title="FCRB Coach Dashboard"
        description="FC Real Bengaluru - Your centers overview"
        variant="elevated"
        style={{ marginBottom: spacing.xl }}
      >
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
          <div style={{ 
            padding: spacing['2xl'], 
            textAlign: "center", 
            color: colors.text.muted 
          }}>
            <div
              style={{
                display: "inline-block",
                width: "40px",
                height: "40px",
                border: `3px solid ${colors.surface.soft}`,
                borderTopColor: colors.primary.main,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: spacing.md,
              }}
            />
            <p style={{ marginTop: spacing.md, ...typography.body }}>Loading dashboard data...</p>
          </div>
        )}

        {/* Content - Only render if data is loaded */}
        {summary && !error && (() => {
          // Calculate stats
          const activeStudents = students.filter(s => s.status === "ACTIVE").length;
          const trialStudents = students.filter(s => s.status === "TRIAL").length;
          const totalPotentialRevenue = students.reduce((sum, s) => sum + s.monthlyFeeAmount, 0);
          const totalExpected = summary.totalCollected + summary.approxOutstanding;

          // Payment frequency breakdown
          const frequencyBreakdown = students.reduce((acc: any, student) => {
            const freq = student.paymentFrequency || 1;
            const label = freq === 1 ? "Monthly" : 
                          freq === 3 ? "Quarterly" : 
                          freq === 6 ? "Half-yearly" : 
                          freq === 12 ? "Yearly" : `${freq} months`;
            acc[label] = (acc[label] || 0) + 1;
            return acc;
          }, {});

          return (
            <React.Fragment key="coach-dashboard-content">
              {/* Quick Actions Grid */}
              <div style={{ marginBottom: spacing.xl }}>
                <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
                  Quick Actions
                </h2>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                  gap: spacing.md 
                }}>
                  {/* Player Management */}
                  <Card 
                    variant="elevated" 
                    padding="lg" 
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/realverse/admin/students")}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <FootballIcon size={32} color={colors.primary.main} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                          Player Management
                        </h3>
                        <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                          View all players, profiles, and create metric snapshots
                        </p>
                        <div style={{ ...typography.caption, color: colors.primary.main, fontWeight: typography.fontWeight.medium }}>
                          View Players →
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Batch Review */}
                  <Card 
                    variant="elevated" 
                    padding="lg" 
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/realverse/admin/batch-review")}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <ClipboardIcon size={32} color={colors.primary.main} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                          Batch Review
                        </h3>
                        <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                          Efficiently review and assess multiple players at once
                        </p>
                        <div style={{ ...typography.caption, color: colors.primary.main, fontWeight: typography.fontWeight.medium }}>
                          Start Review →
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Season Planning */}
                  <Card 
                    variant="elevated" 
                    padding="lg" 
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/realverse/admin/season-planning")}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon size={32} color={colors.primary.main} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                          Season Planning
                        </h3>
                        <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                          Plan training blocks and monitor player load
                        </p>
                        <div style={{ ...typography.caption, color: colors.primary.main, fontWeight: typography.fontWeight.medium }}>
                          Open Planner →
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

        {/* Main Stats Cards - Chunked for Miller's Law */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: spacing.lg, 
          marginBottom: spacing.xl,
          padding: spacing.md, // Ensure padding from borders
        }}>
        <div style={{
          background: "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Collected</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{summary.totalCollected.toLocaleString()}</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Outstanding</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{summary.approxOutstanding.toLocaleString()}</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Students</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary.studentCount}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
            {activeStudents} Active, {trialStudents} Trial
          </div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Expected</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>₹{totalExpected.toLocaleString()}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Collected + Outstanding</div>
        </div>
      </div>

      {/* CHART 1: Revenue Collections */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <div>
            <h2 style={{ 
              ...typography.h3,
              margin: 0,
              color: colors.text.primary,
            }}>
              💰 Revenue Collections
            </h2>
            <p style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              margin: `${spacing.xs} 0 0 0`,
            }}>
              Total money collected by payment date
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: 12, 
          marginBottom: 20,
          padding: 12,
          background: "#f8f9fa",
          borderRadius: 8
        }}>
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.xs, 
              fontWeight: typography.fontWeight.semibold, 
              fontSize: typography.fontSize.xs,
              color: colors.text.secondary,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                <CalendarIcon size={16} />
                Time Period
              </span>
            </label>
            <select
              value={revenueMonths}
              onChange={(e) => setRevenueMonths(Number(e.target.value))}
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: `2px solid rgba(255, 255, 255, 0.2)`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.xs,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.05)",
                color: colors.text.primary,
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
              marginBottom: spacing.xs, 
              fontWeight: typography.fontWeight.semibold, 
              fontSize: typography.fontSize.xs,
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
                border: `2px solid rgba(255, 255, 255, 0.2)`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.xs,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.05)",
                color: colors.text.primary,
              }}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Button variant="secondary" onClick={loadRevenueData} size="sm" style={{ width: "100%" }}>
              🔄 Refresh
            </Button>
          </div>
        </div>
        {revenueData.length > 0 ? (
          <>
            <div style={{ height: 250, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {revenueData.map((data, idx) => {
                const maxAmount = Math.max(...revenueData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2}px`,
                        minHeight: data.amount > 0 ? "15px" : "5px",
                        background: data.amount > 0 
                          ? "linear-gradient(to top, #1E40AF, #1E3A8A)" 
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
                          top: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "9px",
                          fontWeight: 600,
                          color: "#1E40AF",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 8, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-8px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ 
              textAlign: "center", 
              marginTop: spacing.lg, 
              padding: spacing.md, 
              background: "rgba(255, 255, 255, 0.05)", 
              borderRadius: borderRadius.md,
            }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginBottom: spacing.xs,
              }}>
                Total Revenue ({revenueMonths} months{revenuePaymentMode !== "all" && ` • ${revenuePaymentMode}`})
              </div>
              <div style={{ 
                fontSize: typography.fontSize.xl, 
                fontWeight: typography.fontWeight.bold, 
                color: colors.primary.light,
              }}>
                ₹{revenueData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginTop: spacing.xs,
              }}>
                Avg: ₹{Math.floor(revenueData.reduce((sum, m) => sum + m.amount, 0) / revenueMonths).toLocaleString()}/mo
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
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <div>
            <h2 style={{ 
              ...typography.h3,
              margin: 0,
              color: colors.text.primary,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                <ChartBarIcon size={20} />
                Monthly Collections
              </span>
            </h2>
            <p style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              margin: `${spacing.xs} 0 0 0`,
            }}>
              Allocated monthly income (shows all months with payments, including future)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: 12, 
          marginBottom: 20,
          padding: 12,
          background: "#f8f9fa",
          borderRadius: 8
        }}>

          <div>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.xs, 
              fontWeight: typography.fontWeight.semibold, 
              fontSize: typography.fontSize.xs,
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
                border: `2px solid rgba(255, 255, 255, 0.2)`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.xs,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.05)",
                color: colors.text.primary,
              }}
            >
              <option value="all">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <Button variant="secondary" onClick={loadMonthlyData} size="sm" style={{ width: "100%" }}>
              🔄 Refresh
            </Button>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <>
            <div style={{ height: 250, display: "flex", alignItems: "flex-end", gap: 8, padding: "16px 0" }}>
              {monthlyData.map((data, idx) => {
                const maxAmount = Math.max(...monthlyData.map(m => m.amount), 1);
                const heightPercent = (data.amount / maxAmount) * 100;
                
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${heightPercent * 2}px`,
                        minHeight: data.amount > 0 ? "15px" : "5px",
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
                          top: "-20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          fontSize: "9px",
                          fontWeight: 600,
                          color: "#43e97b",
                          whiteSpace: "nowrap"
                        }}>
                          ₹{(data.amount / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: 8, 
                      marginTop: 8, 
                      color: "#666", 
                      fontWeight: 600,
                      transform: "rotate(-45deg)",
                      transformOrigin: "center",
                      whiteSpace: "nowrap",
                      marginLeft: "-8px"
                    }}>
                      {data.month}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ 
              textAlign: "center", 
              marginTop: spacing.lg, 
              padding: spacing.md, 
              background: "rgba(255, 255, 255, 0.05)", 
              borderRadius: borderRadius.md,
            }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginBottom: spacing.xs,
              }}>
                Total Allocated ({monthlyData.length} months{monthlyPaymentMode !== "all" && ` • ${monthlyPaymentMode}`})
              </div>
              <div style={{ 
                fontSize: typography.fontSize.xl, 
                fontWeight: typography.fontWeight.bold, 
                color: colors.success.main,
              }}>
                ₹{monthlyData.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
              </div>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginTop: spacing.xs,
              }}>
                Avg: ₹{monthlyData.length > 0 ? Math.floor(monthlyData.reduce((sum, m) => sum + m.amount, 0) / monthlyData.length).toLocaleString() : 0}/mo
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

      {/* Detailed Stats Section */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: spacing.lg, marginBottom: spacing.lg }}>
        {/* Collection Breakdown */}
        <Card variant="default" padding="lg">
          <h2 style={{ 
            ...typography.h3,
            marginBottom: spacing.md,
            color: colors.text.primary,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
              <ChartBarIcon size={20} />
              Collection Breakdown
            </span>
          </h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Collected</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#27ae60" }}>
                  ₹{summary.totalCollected.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: 48 }}>💰</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#fff3cd", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Pending</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#f39c12" }}>
                  ₹{summary.approxOutstanding.toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: 48 }}>⏳</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "#e3f2fd", borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Potential Monthly</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#3498db" }}>
                  ₹{totalPotentialRevenue.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChartLineIcon size={48} color={colors.primary.main} />
              </div>
            </div>
          </div>
        </Card>

        {/* Student Status */}
        <Card variant="default" padding="lg">
          <h2 style={{ 
            ...typography.h3,
            marginBottom: spacing.md,
            color: colors.text.primary,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
              <UsersIcon size={20} />
              Students
            </span>
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ padding: 12, background: "#d4edda", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#155724", marginBottom: 4 }}>Active</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#155724" }}>{activeStudents}</div>
            </div>
            <div style={{ padding: 12, background: "#fff3cd", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#856404", marginBottom: 4 }}>Trial</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#856404" }}>{trialStudents}</div>
            </div>
            <div style={{ padding: 12, background: "#f8d7da", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#721c24", marginBottom: 4 }}>Inactive</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#721c24" }}>
                {students.filter(s => s.status === "INACTIVE").length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Frequency Distribution */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2 style={{ 
          ...typography.h3,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
            <CalendarIcon size={20} />
            Payment Frequency Distribution
          </span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
          {Object.entries(frequencyBreakdown).map(([label, count]: [string, any]) => (
            <div key={label} style={{
              padding: 16,
              background: "#f8f9fa",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>
                {count}
              </div>
              <div style={{ fontSize: 14, color: "#666" }}>{label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Students */}
      <Card variant="default" padding="lg">
        <h2 style={{ 
          ...typography.h3,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
            <ClipboardIcon size={20} />
            All Students
          </span>
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Name</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Program</th>
                <th style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>Monthly Fee</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Frequency</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{student.fullName}</td>
                  <td style={{ padding: 12 }}>{student.programType || "-"}</td>
                  <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>
                    ₹{student.monthlyFeeAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: 12 }}>
                    {student.paymentFrequency === 1 ? "Monthly" :
                     student.paymentFrequency === 3 ? "Quarterly" :
                     student.paymentFrequency === 6 ? "Half-yearly" :
                     student.paymentFrequency === 12 ? "Yearly" :
                     `${student.paymentFrequency} months`}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      background: student.status === "ACTIVE" ? "#27ae6020" : 
                                 student.status === "TRIAL" ? "#f39c1220" : "#95a5a620",
                      color: student.status === "ACTIVE" ? "#27ae60" : 
                            student.status === "TRIAL" ? "#f39c12" : "#95a5a6"
                    }}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
        </div>
            </React.Fragment>
          );
        })()}
      </Section>
    </motion.main>
  );
};

export default EnhancedCoachDashboard;


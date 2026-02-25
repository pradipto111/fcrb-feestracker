import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { KPICard } from "../components/ui/KPICard";
import { Button } from "../components/ui/Button";
import { Section } from "../components/ui/Section";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { pageVariants, cardVariants } from "../utils/motion";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { centresAssets, adminAssets, heroAssets, clubAssets } from "../config/assets";
import { DISABLE_HEAVY_ANALYTICS } from "../config/featureFlags";
import { FootballIcon, ClipboardIcon, CalendarIcon, ChartBarIcon, ChartLineIcon, UsersIcon } from "../components/icons/IconSet";

const COACH_DASHBOARD_CACHE_TTL_MS = 60000; // 1 min for stale-while-revalidate

function getCoachDashboardCacheFresh(): boolean {
  try {
    const at = sessionStorage.getItem('coach-dashboard-cache-at');
    return at ? (Date.now() - parseInt(at, 10)) < COACH_DASHBOARD_CACHE_TTL_MS : false;
  } catch {
    return false;
  }
}

const EnhancedCoachDashboard: React.FC = () => {
  const navigate = useNavigate();
  const cacheFresh = getCoachDashboardCacheFresh();
  const [summary, setSummary] = useState<any>(() => {
    const cached = sessionStorage.getItem('coach-dashboard-summary');
    return cached ? JSON.parse(cached) : null;
  });
  const [students, setStudents] = useState<any[]>(() => {
    const cached = sessionStorage.getItem('coach-dashboard-students');
    return cached ? JSON.parse(cached) : [];
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(!cacheFresh);
  
  // Revenue Chart filters
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [revenuePaymentMode, setRevenuePaymentMode] = useState("all");

  // Monthly Chart filters - no time period, shows all months
  const [monthlyPaymentMode, setMonthlyPaymentMode] = useState("all");

  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (mounted) {
        await loadData();
      }
    };
    
    load();
    
    // Refresh data when page becomes visible (with debounce)
    let refreshTimeout: NodeJS.Timeout;
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) {
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
          if (mounted) {
            loadData();
          }
        }, 500);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      clearTimeout(refreshTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    try {
      setError(""); // Clear previous errors
      if (DISABLE_HEAVY_ANALYTICS) {
        const studentsData = await api.getStudents().catch(err => {
          console.error("Failed to load students:", err);
          const cached = sessionStorage.getItem('coach-dashboard-students');
          return cached ? JSON.parse(cached) : [];
        });
        if (studentsData && Array.isArray(studentsData)) {
          setStudents(studentsData);
          sessionStorage.setItem('coach-dashboard-students', JSON.stringify(studentsData));
        }
        setSummary(null);
        setRevenueData([]);
        setMonthlyData([]);
        setIsInitialLoad(false);
        return;
      }
      const [summaryData, studentsData] = await Promise.all([
        api.getDashboardSummary().catch(err => {
          console.error("Failed to load dashboard summary:", err);
          const cached = sessionStorage.getItem('coach-dashboard-summary');
          return cached ? JSON.parse(cached) : { totalCollected: 0, studentCount: 0, approxOutstanding: 0 };
        }),
        api.getStudents().catch(err => {
          console.error("Failed to load students:", err);
          const cached = sessionStorage.getItem('coach-dashboard-students');
          return cached ? JSON.parse(cached) : [];
        })
      ]);
      if (summaryData) {
        setSummary(summaryData);
        sessionStorage.setItem('coach-dashboard-summary', JSON.stringify(summaryData));
      }
      if (studentsData && Array.isArray(studentsData)) {
        setStudents(studentsData);
        sessionStorage.setItem('coach-dashboard-students', JSON.stringify(studentsData));
      }
      if ((summaryData || studentsData) !== undefined) {
        sessionStorage.setItem('coach-dashboard-cache-at', String(Date.now()));
      }
      await loadRevenueData();
      await loadMonthlyData();
      setIsInitialLoad(false);
    } catch (err: any) {
      console.error("Error in loadData:", err);
      // Don't clear existing data on error
      if (!summary) {
        setError(err.message || "Failed to load dashboard data");
      }
      setIsInitialLoad(false);
    }
  };

  const loadRevenueData = async () => {
    try {
      const revenueCollections = await api.getRevenueCollections({
        months: revenueMonths,
        paymentMode: revenuePaymentMode === "all" ? undefined : revenuePaymentMode
      });
      if (revenueCollections && Array.isArray(revenueCollections)) {
        setRevenueData(revenueCollections);
      }
    } catch (err: any) {
      console.error("Failed to load revenue data:", err);
      // Keep existing data on error
    }
  };

  const loadMonthlyData = async () => {
    try {
      const monthlyCollections = await api.getMonthlyCollections({
        paymentMode: monthlyPaymentMode === "all" ? undefined : monthlyPaymentMode
      });
      if (monthlyCollections && Array.isArray(monthlyCollections)) {
        setMonthlyData(monthlyCollections);
      }
    } catch (err: any) {
      console.error("Failed to load monthly data:", err);
      // Keep existing data on error
    }
  };

  return (
    <motion.main
      className="rv-page rv-page--coach-dashboard"
      variants={pageVariants}
      initial="animate"
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

        {/* Loading State - Only show if no cached data (when heavy analytics on, we still need students) */}
        {!summary && !DISABLE_HEAVY_ANALYTICS && !error && isInitialLoad && (
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

        {/* Content - render when we have summary or when heavy analytics disabled (we still have students) */}
        {(summary || DISABLE_HEAVY_ANALYTICS) && !error && (() => {
          const activeStudents = students.filter(s => s.status === "ACTIVE").length;
          const trialStudents = students.filter(s => s.status === "TRIAL").length;
          const totalPotentialRevenue = students.reduce((sum, s) => sum + s.monthlyFeeAmount, 0);
          const totalExpected = summary ? summary.totalCollected + summary.approxOutstanding : 0;

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
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary ? `₹${summary.totalCollected.toLocaleString()}` : "—"}</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Outstanding</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary ? `₹${summary.approxOutstanding.toLocaleString()}` : "—"}</div>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          color: "white"
        }}>
          <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>Total Students</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary ? summary.studentCount : students.length}</div>
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
          <div style={{ fontSize: 32, fontWeight: 700 }}>{summary ? `₹${totalExpected.toLocaleString()}` : "—"}</div>
          <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>Collected + Outstanding</div>
        </div>
      </div>

      {/* CHART 1: Revenue Collections - hidden when heavy analytics disabled */}
      {DISABLE_HEAVY_ANALYTICS ? (
        <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
          <p style={{ textAlign: "center", margin: 0, color: colors.text.muted }}>
            Analytics temporarily disabled to reduce server load.
          </p>
        </Card>
      ) : (
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

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
          gap: 12, 
          marginBottom: 20,
          padding: 12,
          ...glass.inset,
          borderRadius: borderRadius.md,
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
                      color: colors.text.muted, 
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
          <div style={{ textAlign: "center", padding: 48, color: colors.text.muted }}>
            No payment data available yet
          </div>
        )}
      </Card>
      )}


      {/* Detailed Stats Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: spacing.lg, marginBottom: spacing.lg }}>
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
            <div style={{ padding: 12, ...glass.inset, borderRadius: borderRadius.md, border: "1px solid rgba(34,197,94,0.26)" }}>
              <div style={{ fontSize: 12, color: colors.text.muted, marginBottom: 4 }}>Active</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.success.main }}>{activeStudents}</div>
            </div>
            <div style={{ padding: 12, ...glass.inset, borderRadius: borderRadius.md, border: "1px solid rgba(245,179,0,0.26)" }}>
              <div style={{ fontSize: 12, color: colors.text.muted, marginBottom: 4 }}>Trial</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.accent.main }}>{trialStudents}</div>
            </div>
            <div style={{ padding: 12, ...glass.inset, borderRadius: borderRadius.md, border: "1px solid rgba(239,68,68,0.26)" }}>
              <div style={{ fontSize: 12, color: colors.text.muted, marginBottom: 4 }}>Inactive</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: colors.danger.main }}>
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
              ...glass.inset,
              borderRadius: borderRadius.md,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF", marginBottom: 4 }}>
                {count}
              </div>
              <div style={{ fontSize: 14, color: colors.text.muted }}>{label}</div>
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
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Name</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Programme</th>
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
            </React.Fragment>
          );
        })()}
      </Section>
    </motion.main>
  );
};

export default EnhancedCoachDashboard;


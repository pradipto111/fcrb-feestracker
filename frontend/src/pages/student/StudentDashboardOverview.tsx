import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Section } from "../../components/ui/Section";
import { PageHeader } from "../../components/ui/PageHeader";
import { CardHeader } from "../../components/ui/CardHeader";
import { CardBody } from "../../components/ui/CardBody";
import { SectionNav } from "../../components/ui/SectionNav";
import PlayerIdentityHeader from "../../components/PlayerIdentityHeader";
import NextStepSnapshot from "../../components/NextStepSnapshot";
import YourAnalytics from "../../components/YourAnalytics";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { heroAssets, clubAssets, academyAssets } from "../../config/assets";
import { ChartBarIcon, ChartLineIcon, ClipboardIcon, RefreshIcon, BoltIcon, LeafIcon, CalendarIcon, ArrowRightIcon, PlusIcon, MinusIcon } from "../../components/icons/IconSet";

const StudentDashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(() => {
    const cached = sessionStorage.getItem('student-dashboard-data');
    return cached ? JSON.parse(cached) : null;
  });
  const [attendanceData, setAttendanceData] = useState<any>(() => {
    const cached = sessionStorage.getItem('student-dashboard-attendance');
    return cached ? JSON.parse(cached) : null;
  });
  const [roadmapData, setRoadmapData] = useState<any>(() => {
    const cached = sessionStorage.getItem('student-dashboard-roadmap');
    return cached ? JSON.parse(cached) : null;
  });
  const [workloadMessage, setWorkloadMessage] = useState<any>(null);
  const [error, setError] = useState("");
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  const [showPayments, setShowPayments] = useState(false);
  const hasLoadedRef = useRef(false);
  
  // Toned-down motion for internal pages
  const {
    sectionVariantsLight,
    headingVariants,
    cardVariants,
    cardHoverLight,
    viewportOnce,
    getStaggeredCard,
  } = useHomepageAnimation();

  useEffect(() => {
    // React 18 StrictMode runs effects twice in dev; guard to avoid duplicate API bursts.
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadData = async () => {
      try {
        const [dashboardData, attendance, roadmap] = await Promise.all([
          api.getStudentDashboard(),
          api.getStudentAttendance({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          }),
          api.getMyProgressRoadmap().catch(() => null),
        ]);
        setData(dashboardData);
        setAttendanceData(attendance);
        setRoadmapData(roadmap);
        
        // Cache data for instant display
        sessionStorage.setItem('student-dashboard-data', JSON.stringify(dashboardData));
        sessionStorage.setItem('student-dashboard-attendance', JSON.stringify(attendance));
        if (roadmap) sessionStorage.setItem('student-dashboard-roadmap', JSON.stringify(roadmap));
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadData();
  }, []);

  // Load workload message after student data is available
  useEffect(() => {
    if (data?.student?.id) {
      api.getPlayerWorkloadMessage(data.student.id)
        .then(setWorkloadMessage)
        .catch(() => setWorkloadMessage(null));
    }
  }, [data?.student?.id]);

  // Quick links removed - navigation is now handled by the sidebar

  if (error) {
    return (
      <Card variant="default" padding="lg" style={{ background: colors.danger.soft, border: `1px solid ${colors.danger.main}40` }}>
        <p style={{ color: colors.danger.main }}>Error: {error}</p>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="rv-empty-state">
        <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--lg" style={{ marginBottom: spacing.md }} />
        <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
        <p style={{ marginTop: spacing.lg, color: colors.text.muted }}>Loading dashboard...</p>
      </div>
    );
  }

  const { student, summary } = data;
  const attendanceRate = attendanceData?.summary?.attendanceRate;
  const currentLevel = roadmapData?.currentLevel;

  return (
    <div>
      <motion.div variants={headingVariants} initial="offscreen" whileInView="onscreen" viewport={viewportOnce}>
        <PageHeader
          tone="dark"
          title="Dashboard"
          subtitle="A clear overview of your academy journey and what to do next."
          actions={
            <Link to="/realverse/student/analytics" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="md">
                <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View Analytics</span>
                  <ArrowRightIcon size={14} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                </span>
              </Button>
            </Link>
          }
        />
      </motion.div>

      <SectionNav
        items={[
          { id: "identity", label: "Status" },
          { id: "next", label: "What’s next" },
          { id: "quick-actions", label: "Quick actions" },
          { id: "analytics", label: "Analytics" },
          { id: "payments", label: "Payments" },
        ]}
      />
      
      {/* Player Identity & Status Header */}
      <div id="identity" style={{ scrollMarginTop: 90 }}>
        <PlayerIdentityHeader student={student} attendanceRate={attendanceRate} currentLevel={currentLevel} />
      </div>

      {/* "What's Next for Me?" Snapshot */}
      <div id="next" style={{ scrollMarginTop: 90 }}>
        <NextStepSnapshot roadmap={roadmapData} />
      </div>

      {/* Quick Actions Grid - Organized CTAs */}
      <Section variant="elevated" style={{ marginBottom: spacing.xl }} id="quick-actions">
        <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
          Quick Actions
        </h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: spacing.md 
        }}>
          {/* Analytics & Profile */}
          <Card variant="elevated" padding="lg" style={{ cursor: "pointer" }} onClick={() => navigate("/realverse/student/analytics")}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: borderRadius.md, background: colors.primary.soft, color: colors.primary.main }}>
                <ChartBarIcon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                  Analytics & Profile
                </h3>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                  View your performance metrics, readiness, and positional suitability
                </p>
                <div style={{ ...typography.caption, color: colors.primary.main, fontWeight: typography.fontWeight.medium }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                    <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View Profile</span>
                    <ArrowRightIcon size={12} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Load Dashboard */}
          {data?.student?.id && (
            <Card 
              variant="elevated" 
              padding="lg" 
              style={{ cursor: "pointer" }} 
              onClick={() => navigate(`/realverse/player/${data.student.id}/load-dashboard`)}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
                <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: borderRadius.md, background: colors.primary.soft, color: colors.primary.main }}>
                  <ChartLineIcon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                    Training Load
                  </h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                    Monitor your training load trends and readiness correlation
                  </p>
                  <div style={{ ...typography.caption, color: colors.primary.main, fontWeight: typography.fontWeight.medium }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                      <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View Dashboard</span>
                      <ArrowRightIcon size={12} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Development Reports */}
          <Card variant="elevated" padding="lg" style={{ cursor: "pointer" }} onClick={() => navigate("/realverse/my-reports")}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: borderRadius.md, background: colors.primary.soft, color: colors.primary.main }}>
                <ClipboardIcon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                  Development Reports
                </h3>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                  View your progress reports and development insights
                </p>
                <div style={{ ...typography.caption, color: colors.primary.main, fontWeight: typography.fontWeight.medium }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                    <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View Reports</span>
                    <ArrowRightIcon size={12} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Workload Message - Compact */}
      {workloadMessage && (
        <Section variant="elevated" style={{ marginBottom: spacing.xl }}>
          <Card
            variant="elevated"
            padding="md"
            style={{
              background: workloadMessage.status === 'HIGH' 
                ? colors.warning?.soft || colors.accent.soft
                : workloadMessage.status === 'LOW'
                ? colors.info?.soft || colors.primary.soft
                : colors.surface.elevated,
              border: `2px solid ${
                workloadMessage.status === 'HIGH'
                  ? colors.warning?.main || colors.accent.main
                  : workloadMessage.status === 'LOW'
                  ? colors.info?.main || colors.primary.main
                  : colors.border.medium
              }40`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: borderRadius.md, background: colors.primary.soft, color: colors.primary.main }}>
                  {workloadMessage.status === 'HIGH' ? <BoltIcon size={18} /> : workloadMessage.status === 'LOW' ? <LeafIcon size={18} /> : <CalendarIcon size={18} />}
                </div>
                <div>
                  <h3 style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs }}>
                    This Week's Training
                  </h3>
                  <p style={{ ...typography.caption, color: colors.text.secondary }}>
                    {workloadMessage.message}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/realverse/player/${data?.student?.id}/load-dashboard`)}
              >
                Details <ArrowRightIcon size={12} style={{ marginLeft: spacing.xs }} />
              </Button>
            </div>
          </Card>
        </Section>
      )}

      {/* Your Analytics Section */}
      <Section id="analytics" variant="elevated" style={{ marginBottom: spacing.xl }}>
        <Card variant="elevated" padding="none" style={{ background: colors.surface.card }}>
          <CardHeader
            title="Your Analytics"
            description="Latest performance metrics and assessments"
            actions={
              <div style={{ display: "flex", gap: spacing.sm }}>
                <Button
                  variant="utility"
                  size="sm"
                  onClick={() => setAnalyticsRefreshKey(prev => prev + 1)}
                >
                  <RefreshIcon size={14} style={{ marginRight: spacing.xs }} /> Refresh
                </Button>
                <Link to="/realverse/student/analytics" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="sm">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                      <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View Full</span>
                      <ArrowRightIcon size={12} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                    </span>
                  </Button>
                </Link>
              </div>
            }
          />
          <CardBody padding="lg">
            <YourAnalytics refreshKey={analyticsRefreshKey} />
          </CardBody>
        </Card>
      </Section>

      {/* Payments (collapsible) */}
      <Section id="payments" variant="elevated">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: 6 }}>Payments</h2>
            <p style={{ ...typography.body, color: colors.text.muted, margin: 0 }}>
              Monthly fee ₹{student.monthlyFeeAmount.toLocaleString()} • Outstanding{" "}
              <span style={{ color: summary.outstanding > 0 ? colors.danger.main : colors.success.main, fontWeight: typography.fontWeight.semibold }}>
                ₹{Math.abs(summary.outstanding).toLocaleString()}
              </span>
            </p>
          </div>
          <Button variant="utility" size="sm" onClick={() => setShowPayments((v) => !v)}>
            {showPayments ? (
              <>
                <MinusIcon size={14} style={{ marginRight: spacing.xs }} /> Hide
              </>
            ) : (
              <>
                <PlusIcon size={14} style={{ marginRight: spacing.xs }} /> Show
              </>
            )}
          </Button>
        </div>

        {showPayments && (
          <div
            style={{
              marginTop: spacing.lg,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
            }}
          >
            <Card variant="default" padding="md" style={{ textAlign: "center" }}>
              <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>Monthly Fee</div>
              <div style={{ ...typography.h3, color: colors.text.primary }}>₹{student.monthlyFeeAmount.toLocaleString()}</div>
            </Card>
            <Card variant="default" padding="md" style={{ textAlign: "center" }}>
              <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>Total Paid</div>
              <div style={{ ...typography.h3, color: colors.success.main }}>₹{summary.totalPaid.toLocaleString()}</div>
            </Card>
            <Card variant="default" padding="md" style={{ textAlign: "center" }}>
              <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>Outstanding</div>
              <div style={{ ...typography.h3, color: summary.outstanding > 0 ? colors.danger.main : colors.success.main }}>
                ₹{Math.abs(summary.outstanding).toLocaleString()}
              </div>
            </Card>
          </div>
        )}
      </Section>
    </div>
    );
  };

export default StudentDashboardOverview;


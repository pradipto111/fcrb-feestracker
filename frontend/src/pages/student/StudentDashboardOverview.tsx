import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Section } from "../../components/ui/Section";
import { CardHeader } from "../../components/ui/CardHeader";
import { CardBody } from "../../components/ui/CardBody";
import PlayerIdentityHeader from "../../components/PlayerIdentityHeader";
import NextStepSnapshot from "../../components/NextStepSnapshot";
import YourAnalytics from "../../components/YourAnalytics";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { heroAssets, clubAssets, academyAssets } from "../../config/assets";
import { ChartBarIcon, ChartLineIcon, ClipboardIcon, RefreshIcon, BoltIcon, LeafIcon, CalendarIcon, ArrowRightIcon } from "../../components/icons/IconSet";

const StudentDashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [workloadMessage, setWorkloadMessage] = useState<any>(null);
  const [error, setError] = useState("");
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  
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
    const loadData = async () => {
      try {
        const [dashboardData, attendance, roadmap, workload] = await Promise.all([
          api.getStudentDashboard(),
          api.getStudentAttendance({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          }),
          api.getMyProgressRoadmap().catch(() => null),
          api.getPlayerWorkloadMessage(data?.student?.id || 0).catch(() => null),
        ]);
        setData(dashboardData);
        setAttendanceData(attendance);
        setRoadmapData(roadmap);
        setWorkloadMessage(workload);
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
      {/* Hero Banner - STUNNING THEME */}
      <motion.section
        variants={sectionVariantsLight}
        initial="offscreen"
        whileInView="onscreen"
        viewport={viewportOnce}
        style={{
          position: "relative",
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: spacing.xl,
          borderRadius: borderRadius.xl,
        }}
      >
        {/* Background image - ONLY IMAGE, NO VIDEO */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${academyAssets.trainingShot})`,
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
            left: "30%",
            width: "400px",
            height: "400px",
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
        
        {/* Dark Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(5, 11, 32, 0.6)",
            zIndex: 2,
          }}
        />
        
        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            textAlign: "center",
            padding: spacing.xl,
            maxWidth: "700px",
          }}
        >
          <motion.h1
            variants={headingVariants}
            style={{
              ...typography.display,
              fontSize: typography.fontSize["3xl"],
              color: colors.text.primary,
              marginBottom: spacing.sm,
              textShadow: "0 4px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 224, 255, 0.3)",
            }}
          >
            Dashboard
          </motion.h1>
          <motion.p
            variants={headingVariants}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)",
            }}
          >
            Overview of your academy journey and quick access to all features
          </motion.p>
        </div>
        
      </motion.section>
      
      {/* Player Identity & Status Header */}
      <PlayerIdentityHeader
        student={student}
        attendanceRate={attendanceRate}
        currentLevel={currentLevel}
      />

      {/* "What's Next for Me?" Snapshot */}
      <NextStepSnapshot roadmap={roadmapData} />

      {/* Quick Actions Grid - Organized CTAs */}
      <Section variant="elevated" style={{ marginBottom: spacing.xl }}>
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
                  View Profile <ArrowRightIcon size={12} style={{ marginLeft: spacing.xs }} />
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
                    View Dashboard <ArrowRightIcon size={12} style={{ marginLeft: spacing.xs }} />
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
                  View Reports <ArrowRightIcon size={12} style={{ marginLeft: spacing.xs }} />
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
      <Section variant="elevated" style={{ marginBottom: spacing.xl }}>
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
                    View Full <ArrowRightIcon size={12} style={{ marginLeft: spacing.xs }} />
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

      {/* Summary Stats - Compact */}
      <Section variant="elevated">
        <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
          Financial Summary
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.md,
          }}
        >
          <Card variant="default" padding="md" style={{ textAlign: "center" }}>
            <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>
              Monthly Fee
            </div>
            <div style={{ ...typography.h3, color: colors.text.primary }}>
              ₹{student.monthlyFeeAmount.toLocaleString()}
            </div>
          </Card>
          <Card variant="default" padding="md" style={{ textAlign: "center" }}>
            <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>
              Total Paid
            </div>
            <div style={{ ...typography.h3, color: colors.success.main }}>
              ₹{summary.totalPaid.toLocaleString()}
            </div>
          </Card>
          <Card variant="default" padding="md" style={{ textAlign: "center" }}>
            <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>
              Outstanding
            </div>
            <div
              style={{
                ...typography.h3,
                color: summary.outstanding > 0 ? colors.danger.main : colors.success.main,
              }}
            >
              ₹{Math.abs(summary.outstanding).toLocaleString()}
            </div>
          </Card>
        </div>
      </Section>
    </div>
    );
  };

export default StudentDashboardOverview;


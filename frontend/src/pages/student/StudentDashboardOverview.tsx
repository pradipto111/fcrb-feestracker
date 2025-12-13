import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
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

const StudentDashboardOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
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
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadData();
  }, []);

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

      {/* Player Profile CTA Banner - Prominent Access Point */}
      <Section variant="elevated" style={{ marginBottom: spacing.xl }}>
        <Card
          variant="elevated"
          padding="lg"
          style={{
            background: `linear-gradient(135deg, ${colors.primary.main}15 0%, ${colors.accent.main}15 100%)`,
            border: `2px solid ${colors.primary.main}40`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing.md }}>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm }}>
                  📊 Complete Player Profile
                </h3>
                <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
                  View your complete performance profile including detailed metrics, development timeline, positional suitability, and coach feedback.
                </p>
                <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                  <Link to="/realverse/student/analytics" style={{ textDecoration: "none" }}>
                    <Button variant="primary" size="md">
                      View Full Profile →
                    </Button>
                  </Link>
                  <Link to="/realverse/student/analytics" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="md">
                      View Analytics Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div style={{ fontSize: "4rem", opacity: 0.2, lineHeight: 1 }}>
                📈
              </div>
            </div>
          </div>
        </Card>
      </Section>

      {/* Your Analytics Section - Prominently Displayed */}
      <Section
        variant="elevated"
        style={{ marginBottom: spacing.xl }}
      >
        <Card variant="elevated" padding="none" style={{ background: colors.surface.card }}>
          <CardHeader
            title="Your Analytics"
            description="View your latest performance metrics, readiness index, and positional suitability assessments."
            actions={
              <div style={{ display: "flex", gap: spacing.sm }}>
                <Button
                  variant="utility"
                  size="sm"
                  onClick={() => setAnalyticsRefreshKey(prev => prev + 1)}
                >
                  🔄 Refresh
                </Button>
                <Link to="/realverse/student/analytics" style={{ textDecoration: "none" }}>
                  <Button
                    variant="primary"
                    size="sm"
                  >
                    View Full Analytics →
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

      {/* Summary Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: spacing.lg,
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
      </div>
    );
  };

export default StudentDashboardOverview;


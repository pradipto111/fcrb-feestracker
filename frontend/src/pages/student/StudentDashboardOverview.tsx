import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import PlayerIdentityHeader from "../../components/PlayerIdentityHeader";
import NextStepSnapshot from "../../components/NextStepSnapshot";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

interface QuickLinkCard {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

const StudentDashboardOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [error, setError] = useState("");

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

  const quickLinks: QuickLinkCard[] = [
    {
      title: "View My Pathway",
      description: "See your full progress roadmap and requirements",
      icon: "🎯",
      path: "/realverse/student/pathway",
      color: colors.primary.main,
    },
    {
      title: "Read Coach Feedback",
      description: "Review monthly feedback from your coaches",
      icon: "📝",
      path: "/realverse/student/feedback",
      color: colors.accent.main,
    },
    {
      title: "See My Journey",
      description: "Explore your development timeline and milestones",
      icon: "⭐",
      path: "/realverse/student/journey",
      color: colors.success.main,
    },
    {
      title: "View Match & Selection History",
      description: "Check your match exposure and selection status",
      icon: "⚽",
      path: "/realverse/student/matches",
      color: colors.warning.main,
    },
    {
      title: "Update Wellness",
      description: "Submit today's training load and recovery check",
      icon: "💪",
      path: "/realverse/student/wellness",
      color: colors.info.main,
    },
  ];

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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
          Dashboard
        </h1>
        <p style={{ ...typography.body, color: colors.text.secondary }}>
          Overview of your academy journey and quick access to all features
        </p>
      </div>

      {/* Player Identity & Status Header */}
      <PlayerIdentityHeader
        student={student}
        attendanceRate={attendanceRate}
        currentLevel={currentLevel}
      />

      {/* "What's Next for Me?" Snapshot */}
      <NextStepSnapshot roadmap={roadmapData} />

      {/* Quick Links Grid */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
          Quick Links
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: spacing.lg,
          }}
        >
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${colors.surface.card} 0%, ${colors.surface.soft} 100%)`,
                  border: `2px solid ${link.color}30`,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = link.color;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 16px ${link.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = link.color + "30";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
                  <span style={{ fontSize: typography.fontSize["2xl"], flexShrink: 0 }}>
                    {link.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        ...typography.h5,
                        color: colors.text.primary,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {link.title}
                    </h3>
                    <p
                      style={{
                        ...typography.caption,
                        color: colors.text.secondary,
                        margin: 0,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {link.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

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
    </motion.div>
  );
};

export default StudentDashboardOverview;


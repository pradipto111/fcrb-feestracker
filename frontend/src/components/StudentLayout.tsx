import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { api } from "../api/client";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";

interface NavItem {
  path: string;
  label: string;
  icon: string; // SVG path or icon component
  description: string;
}

// Simple SVG icons (outline-based, professional)
const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="10" y="3" width="7" height="4" rx="1" />
    <rect x="10" y="10" width="7" height="7" rx="1" />
    <rect x="3" y="13" width="7" height="4" rx="1" />
  </svg>
);

const IconPathway = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z" />
    <circle cx="10" cy="7" r="1.5" fill="currentColor" />
  </svg>
);

const IconFeedback = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h14v12l-4-4H3V3z" />
    <path d="M7 7h6M7 10h4" />
  </svg>
);

const IconJourney = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2L3 7l7 5 7-5-7-5z" />
    <path d="M3 12l7 5 7-5M3 17l7 5 7-5" />
  </svg>
);

const IconMatches = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8" />
    <path d="M6 10h8M10 6v8" />
  </svg>
);

const IconWellness = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v16M2 10h16" />
    <circle cx="10" cy="10" r="3" />
  </svg>
);

const StudentLayout: React.FC = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        const data = await api.getStudentDashboard();
        setStudentData(data);
      } catch (err) {
        // Silently fail - student snapshot is optional
      }
    };
    loadStudentData();
  }, []);

  const navItems: NavItem[] = [
    {
      path: "/realverse/student",
      label: "Dashboard",
      icon: "dashboard",
      description: "Overview & quick links",
    },
    {
      path: "/realverse/student/pathway",
      label: "My Pathway",
      icon: "pathway",
      description: "Progress roadmap & levels",
    },
    {
      path: "/realverse/student/feedback",
      label: "Feedback",
      icon: "feedback",
      description: "Coach feedback & insights",
    },
    {
      path: "/realverse/student/journey",
      label: "My Journey",
      icon: "journey",
      description: "Development timeline",
    },
    {
      path: "/realverse/student/matches",
      label: "Matches & Selection",
      icon: "matches",
      description: "Match exposure & status",
    },
    {
      path: "/realverse/student/wellness",
      label: "Wellness",
      icon: "wellness",
      description: "Training load & recovery",
    },
    {
      path: "/realverse/student/analytics",
      label: "Analytics",
      icon: "dashboard",
      description: "My performance metrics",
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return <IconDashboard />;
      case "pathway":
        return <IconPathway />;
      case "feedback":
        return <IconFeedback />;
      case "journey":
        return <IconJourney />;
      case "matches":
        return <IconMatches />;
      case "wellness":
        return <IconWellness />;
      default:
        return null;
    }
  };

  const isActive = (path: string) => {
    if (path === "/realverse/student") {
      return location.pathname === "/realverse/student" || location.pathname === "/realverse";
    }
    return location.pathname.startsWith(path);
  };

  const student = studentData?.student;

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Mobile Top Nav */}
        <div
          style={{
            background: colors.surface.section,
            borderBottom: `1px solid ${colors.surface.soft}`,
            padding: spacing.md,
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                RealVerse
              </div>
              <div style={{ ...typography.caption, fontSize: typography.fontSize.xs, color: colors.text.muted }}>
                Student Dashboard
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: "transparent",
                border: `1px solid ${colors.surface.soft}`,
                borderRadius: borderRadius.md,
                padding: spacing.sm,
                color: colors.text.primary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div
              style={{
                marginTop: spacing.md,
                display: "flex",
                flexDirection: "column",
                gap: spacing.xs,
              }}
            >
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      textDecoration: "none",
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      background: active
                        ? colors.primary.main + "15"
                        : "transparent",
                      borderLeft: active ? `3px solid ${colors.primary.main}` : "3px solid transparent",
                      color: active ? colors.primary.light : colors.text.secondary,
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                      transition: "all 0.15s ease-out",
                    }}
                  >
                    <div style={{ color: active ? colors.primary.light : colors.text.muted, opacity: active ? 1 : 0.7 }}>
                      {getIcon(item.icon)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          ...typography.body,
                          fontWeight: active
                            ? typography.fontWeight.semibold
                            : typography.fontWeight.medium,
                          fontSize: typography.fontSize.sm,
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Content */}
        <div style={{ flex: 1, padding: spacing.lg }}>
          <Outlet />
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          background: colors.surface.section,
          borderRight: `1px solid ${colors.surface.soft}`,
          padding: spacing.lg,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Club Identity Block */}
        <div style={{ marginBottom: spacing.xl }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs }}>
            <img
              src="/fcrb-logo.png"
              alt="FC Real Bengaluru"
              style={{
                width: 32,
                height: 32,
                objectFit: "contain",
              }}
            />
            <div>
              <div
                style={{
                  ...typography.body,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.base,
                }}
              >
                RealVerse
              </div>
            </div>
          </div>
          <div
            style={{
              ...typography.caption,
              fontSize: typography.fontSize.xs,
              color: colors.text.muted,
              paddingLeft: spacing.xs,
            }}
          >
            Student Dashboard
          </div>
        </div>

        {/* Student Snapshot (Mini) */}
        {student && (
          <div
            style={{
              background: colors.surface.soft,
              borderRadius: borderRadius.md,
              padding: spacing.md,
              marginBottom: spacing.xl,
              border: `1px solid ${colors.surface.card}`,
            }}
          >
            <div
              style={{
                ...typography.body,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing.xs,
                fontSize: typography.fontSize.sm,
              }}
            >
              {student.fullName}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.xs, fontSize: typography.fontSize.xs }}>
              {student.programType && (
                <span style={{ color: colors.text.muted }}>{student.programType}</span>
              )}
              {student.center?.name && (
                <>
                  {student.programType && <span style={{ color: colors.text.muted }}>•</span>}
                  <span style={{ color: colors.text.muted }}>{student.center.name}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation CTAs */}
        <nav style={{ display: "flex", flexDirection: "column", gap: spacing.xs, flex: 1 }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: "none",
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  background: active
                    ? colors.primary.main + "12"
                    : "transparent",
                  borderLeft: active ? `3px solid ${colors.primary.main}` : "3px solid transparent",
                  color: active ? colors.text.primary : colors.text.secondary,
                  transition: "all 0.15s ease-out",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: spacing.md,
                  cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = colors.surface.soft;
                    e.currentTarget.style.color = colors.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = colors.text.secondary;
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${colors.primary.main}40`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
              >
                <div
                  style={{
                    color: active ? colors.primary.light : colors.text.muted,
                    opacity: active ? 1 : 0.7,
                    flexShrink: 0,
                    marginTop: "2px",
                    transition: "opacity 0.15s ease-out",
                  }}
                >
                  {getIcon(item.icon)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      ...typography.body,
                      fontWeight: active
                        ? typography.fontWeight.semibold
                        : typography.fontWeight.medium,
                      marginBottom: spacing.xs,
                      fontSize: typography.fontSize.sm,
                      color: "inherit",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      ...typography.caption,
                      fontSize: typography.fontSize.xs,
                      color: colors.text.muted,
                      lineHeight: 1.4,
                      opacity: active ? 0.8 : 0.6,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: spacing.xl,
          overflowY: "auto",
          background: colors.surface.bg,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;

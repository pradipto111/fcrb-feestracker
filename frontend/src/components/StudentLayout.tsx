import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

const IconAnalytics = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17v-6M7 17V9M11 17V5M15 17v-4" />
    <circle cx="3" cy="11" r="1" fill="currentColor" />
    <circle cx="7" cy="7" r="1" fill="currentColor" />
    <circle cx="11" cy="3" r="1" fill="currentColor" />
    <circle cx="15" cy="13" r="1" fill="currentColor" />
  </svg>
);

const IconAttendance = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="14" height="14" rx="2" />
    <path d="M7 2v4M13 2v4M3 10h14" />
  </svg>
);

const IconDrills = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="16" height="12" rx="2" />
    <path d="M6 8h8M6 12h6" />
    <circle cx="8" cy="16" r="1" />
  </svg>
);

const IconFeed = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="16" height="16" rx="2" />
    <circle cx="7" cy="7" r="1.5" />
    <path d="M2 12l5-5 3 3 8-8" />
  </svg>
);

const IconFanclub = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" />
    <circle cx="10" cy="10" r="2" fill="currentColor" />
  </svg>
);


const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  const handleLogout = () => {
    logout();
    navigate("/realverse/login");
  };

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

  // Organized navigation items with sections
  const mainNavItems: NavItem[] = [
    {
      path: "/realverse/student",
      label: "Dashboard",
      icon: "dashboard",
      description: "Overview & quick links",
    },
    {
      path: "/realverse/student/training-calendar",
      label: "Training Calendar",
      icon: "attendance",
      description: "View your training sessions & attendance",
    },
    {
      path: "/realverse/my-attendance",
      label: "My Attendance",
      icon: "attendance",
      description: "Track your training sessions",
    },
  ];

  const developmentNavItems: NavItem[] = [
    {
      path: "/realverse/student/development",
      label: "My Development",
      icon: "pathway",
      description: "Pathway, feedback & journey",
    },
    {
      path: "/realverse/student/matches",
      label: "Matches & Selection",
      icon: "matches",
      description: "Match exposure & status",
    },
    {
      path: "/realverse/student/wellness-reports",
      label: "Wellness & Reports",
      icon: "wellness",
      description: "Training load, recovery & reports",
    },
  ];

  const contentNavItems: NavItem[] = [
    {
      path: "/realverse/drills",
      label: "Drills & Tutorials",
      icon: "drills",
      description: "Training videos & guides",
    },
    {
      path: "/realverse/feed",
      label: "Feed",
      icon: "feed",
      description: "Club updates & posts",
    },
  ];

  const fanclubNavItems: NavItem[] = [
    {
      path: "/realverse/student/fanclub-benefits",
      label: "Fanclub Benefits",
      icon: "fanclub",
      description: "Exclusive perks & rewards",
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
      case "analytics":
        return <IconAnalytics />;
      case "attendance":
        return <IconAttendance />;
      case "drills":
        return <IconDrills />;
      case "feed":
        return <IconFeed />;
      case "fanclub":
        return <IconFanclub />;
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
  const allNavItems = [...mainNavItems, ...contentNavItems, ...developmentNavItems, ...fanclubNavItems];
  const activeNavItem = allNavItems.find((item) => isActive(item.path));
  const currentPageLabel = activeNavItem?.label || "Student Dashboard";

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
                {currentPageLabel}
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
              {/* Analytics CTA for Mobile */}
              <Link
                to="/realverse/student/analytics"
                onClick={() => setMobileMenuOpen(false)}
                style={{ textDecoration: "none", marginBottom: spacing.sm }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent.main}15 0%, ${colors.primary.main}15 100%)`,
                    border: `2px solid ${isActive("/realverse/student/analytics") ? colors.accent.main : colors.accent.main + "40"}`,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs }}>
                    <div style={{ color: colors.accent.main }}>
                      <IconAnalytics />
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      Analytics
                    </div>
                  </div>
                  <div
                    style={{
                      ...typography.caption,
                      fontSize: typography.fontSize.xs,
                      color: colors.text.muted,
                    }}
                  >
                    View your performance metrics & insights
                  </div>
                </div>
              </Link>

              {/* All navigation items combined for mobile */}
              {[...mainNavItems, ...contentNavItems, ...developmentNavItems, ...fanclubNavItems].map((item) => {
                const active = isActive(item.path);
                const isWellnessReports = item.path === "/realverse/student/wellness-reports";
                const isAnalytics = item.path === "/realverse/student/analytics";
                const isMatchesSelection = item.path === "/realverse/student/matches";
                const isMyDevelopment = item.path === "/realverse/student/development";
                const isFanclubBenefits = item.path === "/realverse/student/fanclub-benefits";
                const isDisabled = isWellnessReports || isAnalytics || isMatchesSelection || isMyDevelopment || isFanclubBenefits;
                
                if (isDisabled) {
                  return (
                    <div
                      key={item.path}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      style={{
                        textDecoration: "none",
                        padding: spacing.md,
                        borderRadius: borderRadius.md,
                        background: "transparent",
                        borderLeft: "3px solid transparent",
                        color: colors.text.secondary,
                        display: "flex",
                        alignItems: "center",
                        gap: spacing.md,
                        transition: "all 0.15s ease-out",
                        cursor: "not-allowed",
                        opacity: 0.6,
                      }}
                    >
                      <div style={{ color: colors.text.muted, opacity: 0.7 }}>
                        {getIcon(item.icon)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
                          <div
                            style={{
                              ...typography.body,
                              fontWeight: typography.fontWeight.medium,
                              fontSize: typography.fontSize.sm,
                            }}
                          >
                            {item.label}
                          </div>
                          <span style={{ 
                            ...typography.caption, 
                            padding: `2px ${spacing.xs}`, 
                            borderRadius: borderRadius.sm, 
                            background: colors.warning.soft, 
                            color: colors.warning.main,
                            fontWeight: typography.fontWeight.semibold,
                            fontSize: typography.fontSize.xs
                          }}>
                            Coming soon
                          </span>
                        </div>
                        <div
                          style={{
                            ...typography.caption,
                            fontSize: typography.fontSize.xs,
                            color: colors.text.muted,
                            marginTop: spacing.xs,
                          }}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>
                  );
                }
                
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
                      <div
                        style={{
                          ...typography.caption,
                          fontSize: typography.fontSize.xs,
                          color: colors.text.muted,
                          marginTop: spacing.xs,
                        }}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Logout Button for Mobile */}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                style={{
                  width: "100%",
                  marginTop: spacing.md,
                  padding: spacing.md,
                  background: `linear-gradient(135deg, ${colors.danger.main} 0%, ${colors.danger.dark} 100%)`,
                  color: colors.text.onPrimary,
                  border: "none",
                  borderRadius: borderRadius.lg,
                  cursor: "pointer",
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  fontFamily: typography.fontFamily.primary,
                  transition: "all 0.2s ease",
                  boxShadow: shadows.md,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: spacing.sm,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = shadows.lg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = shadows.md;
                }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Content */}
        <div style={{ flex: 1, padding: spacing.lg }}>
          <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto" }}>
            <Outlet />
          </div>
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
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch" as any,
          overscrollBehavior: "contain",
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.primary.main}40 ${colors.surface.section}`,
          scrollBehavior: "smooth",
          scrollbarGutter: "stable",
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

        {/* Analytics CTA - Prominent Section */}
        <div
          style={{
            textDecoration: "none",
            marginBottom: spacing.lg,
            cursor: "not-allowed",
            opacity: 0.6,
          }}
          onClick={(e) => e.preventDefault()}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.accent.main}08 0%, ${colors.primary.main}08 100%)`,
              border: `2px solid ${colors.text.muted}40`,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
              cursor: "not-allowed",
              transition: "all 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs }}>
              <div style={{ color: colors.text.muted }}>
                <IconAnalytics />
              </div>
              <div
                style={{
                  ...typography.body,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                }}
              >
                Analytics
              </div>
              <span style={{ 
                ...typography.caption, 
                padding: `2px ${spacing.xs}`, 
                borderRadius: borderRadius.sm, 
                background: colors.warning.soft, 
                color: colors.warning.main,
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.xs,
                marginLeft: "auto"
              }}>
                Coming soon
              </span>
            </div>
            <div
              style={{
                ...typography.caption,
                fontSize: typography.fontSize.xs,
                color: colors.text.muted,
                lineHeight: 1.4,
              }}
            >
              View your performance metrics & insights
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: spacing.lg, 
            flex: 1, 
            minHeight: 0, // Critical for flex scrolling
            overflowY: "auto",
            overflowX: "hidden",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch" as any,
            overscrollBehavior: "contain",
            scrollbarWidth: "thin",
            scrollbarColor: `${colors.primary.main}40 ${colors.surface.section}`,
          }}
        >
          {/* Main Navigation */}
          <div>
            <div
              style={{
                ...typography.caption,
                fontSize: typography.fontSize.xs,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: spacing.sm,
                paddingLeft: spacing.xs,
              }}
            >
              Main
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
              {mainNavItems.map((item) => {
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
                  >
                    <div
                      style={{
                        color: active ? colors.primary.light : colors.text.muted,
                        opacity: active ? 1 : 0.7,
                        flexShrink: 0,
                        marginTop: "2px",
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
            </div>
          </div>

          {/* Content Section */}
          <div>
            <div
              style={{
                ...typography.caption,
                fontSize: typography.fontSize.xs,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: spacing.sm,
                paddingLeft: spacing.xs,
              }}
            >
              Content
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
              {contentNavItems.map((item) => {
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
                  >
                    <div
                      style={{
                        color: active ? colors.primary.light : colors.text.muted,
                        opacity: active ? 1 : 0.7,
                        flexShrink: 0,
                        marginTop: "2px",
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
            </div>
          </div>

          {/* Development Section */}
          <div>
            <div
              style={{
                ...typography.caption,
                fontSize: typography.fontSize.xs,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: spacing.sm,
                paddingLeft: spacing.xs,
              }}
            >
              Development
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
              {developmentNavItems.map((item) => {
                const active = isActive(item.path);
                const isWellnessReports = item.path === "/realverse/student/wellness-reports";
                const isMatchesSelection = item.path === "/realverse/student/matches";
                const isMyDevelopment = item.path === "/realverse/student/development";
                const isDisabled = isWellnessReports || isMatchesSelection || isMyDevelopment;
                return (
                  <div
                    key={item.path}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    style={{
                      textDecoration: "none",
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      background: active && !isDisabled
                        ? colors.primary.main + "12"
                        : "transparent",
                      borderLeft: isDisabled ? "3px solid transparent" : (active ? `3px solid ${colors.primary.main}` : "3px solid transparent"),
                      color: active && !isDisabled ? colors.text.primary : colors.text.secondary,
                      transition: "all 0.15s ease-out",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.6 : 1,
                      position: "relative",
                    }}
                  >
                    {isDisabled ? (
                      <>
                        <div
                          style={{
                            color: colors.text.muted,
                            opacity: 0.7,
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          {getIcon(item.icon)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
                            <div
                              style={{
                                ...typography.body,
                                fontWeight: typography.fontWeight.medium,
                                fontSize: typography.fontSize.sm,
                                color: "inherit",
                              }}
                            >
                              {item.label}
                            </div>
                            <span style={{ 
                              ...typography.caption, 
                              padding: `2px ${spacing.xs}`, 
                              borderRadius: borderRadius.sm, 
                              background: colors.warning.soft, 
                              color: colors.warning.main,
                              fontWeight: typography.fontWeight.semibold,
                              fontSize: typography.fontSize.xs
                            }}>
                              Coming soon
                            </span>
                          </div>
                          <div
                            style={{
                              ...typography.caption,
                              fontSize: typography.fontSize.xs,
                              color: colors.text.muted,
                              lineHeight: 1.4,
                              opacity: 0.6,
                            }}
                          >
                            {item.description}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        style={{
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: spacing.md,
                          width: "100%",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            color: active ? colors.primary.light : colors.text.muted,
                            opacity: active ? 1 : 0.7,
                            flexShrink: 0,
                            marginTop: "2px",
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fanclub Benefits Section */}
          <div>
            <div
              style={{
                ...typography.caption,
                fontSize: typography.fontSize.xs,
                color: colors.text.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: spacing.sm,
                paddingLeft: spacing.xs,
              }}
            >
              Fanclub Benefits
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
              {fanclubNavItems.map((item) => {
                const active = isActive(item.path);
                const isFanclubBenefits = item.path === "/realverse/student/fanclub-benefits";
                const isDisabled = isFanclubBenefits;
                return (
                  <div
                    key={item.path}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    style={{
                      textDecoration: "none",
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      background: active && !isDisabled
                        ? colors.primary.main + "12"
                        : "transparent",
                      borderLeft: isDisabled ? "3px solid transparent" : (active ? `3px solid ${colors.primary.main}` : "3px solid transparent"),
                      color: active && !isDisabled ? colors.text.primary : colors.text.secondary,
                      transition: "all 0.15s ease-out",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.6 : 1,
                      position: "relative",
                    }}
                  >
                    {isDisabled ? (
                      <>
                        <div
                          style={{
                            color: colors.text.muted,
                            opacity: 0.7,
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          {getIcon(item.icon)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
                            <div
                              style={{
                                ...typography.body,
                                fontWeight: typography.fontWeight.medium,
                                fontSize: typography.fontSize.sm,
                                color: "inherit",
                              }}
                            >
                              {item.label}
                            </div>
                            <span style={{ 
                              ...typography.caption, 
                              padding: `2px ${spacing.xs}`, 
                              borderRadius: borderRadius.sm, 
                              background: colors.warning.soft, 
                              color: colors.warning.main,
                              fontWeight: typography.fontWeight.semibold,
                              fontSize: typography.fontSize.xs
                            }}>
                              Coming soon
                            </span>
                          </div>
                          <div
                            style={{
                              ...typography.caption,
                              fontSize: typography.fontSize.xs,
                              color: colors.text.muted,
                              lineHeight: 1.4,
                              opacity: 0.6,
                            }}
                          >
                            {item.description}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        style={{
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: spacing.md,
                          width: "100%",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            color: active ? colors.primary.light : colors.text.muted,
                            opacity: active ? 1 : 0.7,
                            flexShrink: 0,
                            marginTop: "2px",
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Logout Button - Desktop */}
        <div style={{ 
          marginTop: "auto", 
          paddingTop: spacing.lg, 
          borderTop: `1px solid ${colors.surface.soft}`,
          flexShrink: 0,
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: spacing.md,
              background: `linear-gradient(135deg, ${colors.danger.main} 0%, ${colors.danger.dark} 100%)`,
              color: colors.text.onPrimary,
              border: "none",
              borderRadius: borderRadius.lg,
              cursor: "pointer",
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.primary,
              transition: "all 0.2s ease",
              boxShadow: shadows.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = shadows.md;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: spacing.xl,
          overflowY: "auto",
          overflowX: "hidden",
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;

import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  description: string;
  section?: string; // For grouping in Admin
}

interface RoleLayoutProps {
  role: "STUDENT" | "COACH" | "ADMIN";
  navItems: NavItem[];
  getIcon: (iconName: string) => React.ReactNode;
  profileData?: any;
  getProfileInfo?: (data: any) => { name: string; subtitle: string };
}

// Shared SVG icons (outline-based, professional)
export const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="10" y="3" width="7" height="4" rx="1" />
    <rect x="10" y="10" width="7" height="7" rx="1" />
    <rect x="3" y="13" width="7" height="4" rx="1" />
  </svg>
);

export const IconPlayers = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconSessions = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="14" height="14" rx="2" />
    <path d="M16 2v4M4 2v4M3 10h14" />
  </svg>
);

export const IconFeedback = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h14v12l-4-4H3V3z" />
    <path d="M7 7h6M7 10h4" />
  </svg>
);

export const IconMatches = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="8" />
    <path d="M6 10h8M10 6v8" />
  </svg>
);

export const IconWellness = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2v16M2 10h16" />
    <circle cx="10" cy="10" r="3" />
  </svg>
);

export const IconCentres = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2C6 2 3 5 3 9c0 4 7 8 7 8s7-4 7-8c0-4-3-7-7-7z" />
    <circle cx="10" cy="9" r="2.5" />
  </svg>
);

export const IconStaff = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
  </svg>
);

export const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
  </svg>
);

export const IconShop = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14h18V6l-3-4z" />
    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const IconPayments = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="18" height="12" rx="2" />
    <path d="M1 10h18" />
  </svg>
);

const RoleLayout: React.FC<RoleLayoutProps> = ({
  role,
  navItems,
  getIcon,
  profileData,
  getProfileInfo,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isActive = (path: string) => {
    if (path.endsWith("/dashboard") || path.endsWith("/coach") || path.endsWith("/admin")) {
      return location.pathname === path || location.pathname === "/realverse";
    }
    return location.pathname.startsWith(path);
  };

  // Group nav items by section (for Admin)
  const groupedItems = navItems.reduce((acc, item) => {
    const section = item.section || "main";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const profileInfo = profileData && getProfileInfo ? getProfileInfo(profileData) : null;

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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                RealVerse
              </div>
              <div style={{ ...typography.caption, fontSize: typography.fontSize.xs, color: colors.text.muted }}>
                {role} Dashboard
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
              }}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {mobileMenuOpen && (
            <div style={{ marginTop: spacing.md, display: "flex", flexDirection: "column", gap: spacing.xs }}>
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
                      background: active ? colors.primary.main + "15" : "transparent",
                      borderLeft: active ? `3px solid ${colors.primary.main}` : "3px solid transparent",
                      color: active ? colors.primary.light : colors.text.secondary,
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                    }}
                  >
                    <div style={{ color: active ? colors.primary.light : colors.text.muted, opacity: active ? 1 : 0.7 }}>
                      {getIcon(item.icon)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...typography.body, fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.medium, fontSize: typography.fontSize.sm }}>
                        {item.label}
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
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch" as any,
          overscrollBehavior: "contain",
          scrollbarWidth: "thin",
          scrollbarColor: `${colors.primary.main}40 ${colors.surface.section}`,
          // Smooth scrolling
          scrollBehavior: "smooth",
          // Prevent content shift when scrollbar appears
          scrollbarGutter: "stable",
        }}
      >
        {/* Club Identity Block */}
        <div style={{ marginBottom: spacing.xl }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs }}>
            <img
              src="/fcrb-logo.png"
              alt="FC Real Bengaluru"
              style={{ width: 32, height: 32, objectFit: "contain" }}
            />
            <div>
              <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, fontSize: typography.fontSize.base }}>
                RealVerse
              </div>
            </div>
          </div>
          <div style={{ ...typography.caption, fontSize: typography.fontSize.xs, color: colors.text.muted, paddingLeft: spacing.xs }}>
            {role} Dashboard
          </div>
        </div>

        {/* Profile Snapshot */}
        {profileInfo && (
          <div
            style={{
              background: colors.surface.soft,
              borderRadius: borderRadius.md,
              padding: spacing.md,
              marginBottom: spacing.xl,
              border: `1px solid ${colors.surface.card}`,
            }}
          >
            <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, marginBottom: spacing.xs, fontSize: typography.fontSize.sm }}>
              {profileInfo.name}
            </div>
            <div style={{ ...typography.caption, fontSize: typography.fontSize.xs, color: colors.text.muted }}>
              {profileInfo.subtitle}
            </div>
          </div>
        )}

        {/* Navigation CTAs */}
        <nav 
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: spacing.xs, 
            flex: 1,
            minHeight: 0, // Important for flex scrolling
            overflowY: "auto",
            overflowX: "hidden",
            // Ensure smooth scrolling within nav
            scrollBehavior: "smooth",
          }}
        >
          {Object.entries(groupedItems).map(([section, items]) => (
            <div key={section}>
              {section !== "main" && (
                <div style={{ ...typography.overline, color: colors.text.muted, marginTop: spacing.md, marginBottom: spacing.sm, paddingLeft: spacing.md }}>
                  {section}
                </div>
              )}
              {items.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      textDecoration: "none",
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      background: active ? colors.primary.main + "12" : "transparent",
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
                    onFocus={(e) => {
                      e.currentTarget.style.outline = `2px solid ${colors.primary.main}40`;
                      e.currentTarget.style.outlineOffset = "2px";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                  >
                    <div style={{ color: active ? colors.primary.light : colors.text.muted, opacity: active ? 1 : 0.7, flexShrink: 0, marginTop: "2px", transition: "opacity 0.15s ease-out" }}>
                      {getIcon(item.icon)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typography.body, fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.medium, marginBottom: spacing.xs, fontSize: typography.fontSize.sm, color: "inherit" }}>
                        {item.label}
                      </div>
                      <div style={{ ...typography.caption, fontSize: typography.fontSize.xs, color: colors.text.muted, lineHeight: 1.4, opacity: active ? 0.8 : 0.6 }}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout Button - Desktop */}
        <div style={{ marginTop: "auto", paddingTop: spacing.lg, borderTop: `1px solid ${colors.surface.soft}` }}>
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
      <main style={{ 
        flex: 1, 
        padding: spacing.xl, 
        overflowY: "auto", 
        overflowX: "hidden",
        background: colors.surface.bg,
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default RoleLayout;


import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { 
  ChartBarIcon, 
  UsersIcon, 
  CalendarIcon, 
  FootballIcon, 
  VideoCameraIcon, 
  FilmIcon, 
  CameraIcon, 
  SuccessIcon, 
  TrophyIcon, 
  GearIcon, 
  ClipboardIcon, 
  ShoppingBagIcon, 
  LocationIcon 
} from "../components/icons/IconSet";
import "../styles/animations.css";

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/realverse', label: 'Dashboard', Icon: ChartBarIcon, roles: ['ADMIN', 'COACH', 'STUDENT'] },
    { path: '/realverse/students', label: 'Players', Icon: UsersIcon, roles: ['ADMIN', 'COACH'] },
    { path: '/realverse/attendance', label: 'Attendance', Icon: CalendarIcon, roles: ['ADMIN', 'COACH'] },
    { path: '/realverse/my-attendance', label: 'My Attendance', Icon: CalendarIcon, roles: ['STUDENT'] },
    { path: '/realverse/fixtures', label: 'Fixtures', Icon: FootballIcon, roles: ['ADMIN', 'COACH'] },
    { path: '/realverse/my-fixtures', label: 'My Fixtures', Icon: FootballIcon, roles: ['STUDENT'] },
    { path: '/realverse/drills', label: 'Drills & Tutorials', Icon: VideoCameraIcon, roles: ['ADMIN', 'COACH', 'STUDENT'] },
    { path: '/realverse/drills/manage', label: 'Manage Videos', Icon: FilmIcon, roles: ['ADMIN', 'COACH'] },
    { path: '/realverse/feed', label: 'Feed', Icon: CameraIcon, roles: ['ADMIN', 'COACH', 'STUDENT'] },
    { path: '/realverse/feed/approve', label: 'Approve Posts', Icon: SuccessIcon, roles: ['ADMIN', 'COACH'] },
    { path: '/realverse/leaderboard', label: 'Leaderboard', Icon: TrophyIcon, roles: ['ADMIN', 'COACH', 'STUDENT'] },
    { path: '/realverse/admin', label: 'Admin', Icon: GearIcon, roles: ['ADMIN'] },
    { path: '/realverse/admin/leads', label: 'Website Leads', Icon: ClipboardIcon, roles: ['ADMIN'] },
    { path: '/realverse/admin/merch', label: 'Merchandise', Icon: ShoppingBagIcon, roles: ['ADMIN'] },
    { path: '/realverse/admin/centres', label: 'Centres', Icon: LocationIcon, roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    padding: `${spacing.md} ${spacing.lg}`,
    borderRadius: borderRadius.lg,
    textDecoration: 'none',
    color: colors.text.inverted,
    background: active 
      ? 'rgba(255, 255, 255, 0.15)' 
      : 'rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    fontSize: typography.fontSize.base,
    fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.medium,
    borderLeft: active ? `3px solid ${colors.accent.main}` : '3px solid transparent',
    backdropFilter: 'blur(10px)',
  });

  // Hide sidebar for students, coaches, and admins (they use their own layouts instead)
  const isStudentRoute = location.pathname.startsWith('/realverse/student') ||
    location.pathname.startsWith('/realverse/my-attendance') ||
    location.pathname.startsWith('/realverse/my-fixtures') ||
    location.pathname.startsWith('/realverse/drills') ||
    location.pathname.startsWith('/realverse/feed') ||
    location.pathname.startsWith('/realverse/leaderboard');
  const isCoachRoute = location.pathname.startsWith('/realverse/coach');
  const isAdminRoute = location.pathname.startsWith('/realverse/admin');
  const shouldHideSidebar = isStudentRoute || isCoachRoute || isAdminRoute;
  
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100%',
      background: colors.club.deep,
      color: colors.text.inverted
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: `linear-gradient(135deg, ${colors.club.dark} 0%, ${colors.club.deep} 100%)`,
          color: colors.text.inverted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${spacing.lg}`,
          zIndex: 1001,
          boxShadow: shadows.lg,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{
              position: 'relative',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img 
                src="/fcrb-logo.png" 
                alt="FC Real Bengaluru" 
                className="logo-transparent-dark"
                style={{ 
                  width: 40, 
                  height: 40,
                  objectFit: 'contain',
                }} 
              />
            </div>
            <div>
              <div style={{ 
                fontSize: typography.fontSize.lg, 
                fontWeight: typography.fontWeight.extrabold,
                fontFamily: typography.fontFamily.heading,
                background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                RealVerse
              </div>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                opacity: 0.7,
                fontWeight: typography.fontWeight.medium
              }}>
                FC Real Bengaluru
              </div>
            </div>
          </div>
          <button
            onClick={toggleMobileMenu}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: colors.text.inverted,
              fontSize: typography.fontSize['2xl'],
              width: 40,
              height: 40,
              borderRadius: borderRadius.md,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </header>
      )}

      {/* Sidebar - Hidden for students (they use StudentLayout) */}
      {!shouldHideSidebar && (
      <aside style={{
        position: isMobile ? 'fixed' : 'relative',
        left: 0,
        top: isMobile ? 64 : 0,
        bottom: 0,
        width: 280,
        padding: spacing.lg,
        background: `linear-gradient(180deg, ${colors.club.dark} 0%, ${colors.club.deep} 100%)`,
        color: colors.text.inverted,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch' as any,
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
        scrollbarColor: `${colors.primary.main}40 ${colors.surface.section}`,
        scrollBehavior: 'smooth',
        scrollbarGutter: 'stable',
        zIndex: 1000,
        boxShadow: shadows.xl,
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'transform 0.3s ease',
        transform: isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
      }}>
        {/* Space Background Particles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 30%, rgba(4, 61, 208, 0.1) 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, rgba(255, 169, 0, 0.1) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />

        {/* Logo Section */}
        {!isMobile && (
          <div style={{ 
            marginBottom: spacing.xl, 
            textAlign: 'center', 
            paddingBottom: spacing.lg, 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 1,
            animation: 'fadeIn 0.6s ease-out',
          }}>
            <div style={{
              position: 'relative',
              width: 100,
              height: 100,
              margin: `0 auto ${spacing.md}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Animated glow rings */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: `2px solid ${colors.primary.main}40`,
                animation: 'logoOrbit 8s linear infinite',
                opacity: 0.6,
              }} />
              <div style={{
                position: 'absolute',
                width: '85%',
                height: '85%',
                borderRadius: '50%',
                border: `1px solid ${colors.accent.main}40`,
                animation: 'logoOrbit 6s linear infinite reverse',
                opacity: 0.4,
              }} />
              <img 
                src="/fcrb-logo.png" 
                alt="FC Real Bengaluru" 
                className="logo-transparent-dark"
                style={{ 
                  width: 80, 
                  height: 80,
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 2,
                }} 
              />
            </div>
            <h2 style={{ 
              ...typography.h3,
              marginBottom: spacing.xs,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              RealVerse
            </h2>
            <p style={{ 
              ...typography.caption,
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: typography.fontSize.xs,
            }}>
              Your football universe
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: spacing.xs, 
          flex: 1,
          position: 'relative',
          zIndex: 1,
        }}>
          {filteredNavItems.map((item, index) => {
            const IconComponent = item.Icon;
            return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              style={{
                ...navLinkStyle(isActive(item.path)),
                animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <IconComponent size={20} color={colors.text.inverted} />
              <span>{item.label}</span>
            </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: spacing.lg, 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1,
        }}>
          {user && (
            <div style={{ 
              marginBottom: spacing.md,
              padding: spacing.md,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: borderRadius.lg,
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ 
                ...typography.body,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.xs,
              }}>
                {user.fullName}
              </div>
              <div style={{ 
                ...typography.caption,
                fontSize: typography.fontSize.xs,
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {user.role}
              </div>
            </div>
          )}
          <button
            onClick={() => { logout(); closeMobileMenu(); }}
            style={{
              width: '100%',
              padding: `${spacing.md} ${spacing.lg}`,
              background: `linear-gradient(135deg, ${colors.danger.main} 0%, ${colors.danger.dark} 100%)`,
              color: colors.text.onPrimary,
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.primary,
              transition: 'all 0.2s ease',
              boxShadow: shadows.md,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadows.md;
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>Logout</span>
          </button>
        </div>
      </aside>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && !shouldHideSidebar && (
        <div
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 999,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Main Content Area */}
      <div style={{
        marginLeft: isMobile ? 0 : (shouldHideSidebar ? 0 : 280),
        marginTop: isMobile ? 64 : 0,
        flex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top App Bar with CTAs - Blended with background */}
        <header style={{
          background: 'transparent',
          padding: `${spacing.lg} ${spacing.xl}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}>
            
            {/* CTAs Section - System Date Setter and User Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.md,
              flexWrap: 'wrap',
            }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.inverted,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.sm,
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.5)',
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: colors.success.main,
                  boxShadow: `0 0 8px ${colors.success.main}`,
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                Welcome back, {user?.fullName}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          padding: isMobile ? spacing.lg : spacing.xl,
          background: colors.club.deep,
          position: 'relative',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Simple background - no wrapper to avoid rendering issues */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 0% 0%, rgba(4, 61, 208, 0.25) 0%, transparent 55%),
                         radial-gradient(circle at 100% 100%, rgba(245, 179, 0, 0.2) 0%, transparent 55%),
                         ${colors.club.background}`,
            zIndex: 0,
            pointerEvents: 'none',
          }} />
          
          {/* Content - Always visible */}
          <div style={{
            position: 'relative',
            zIndex: 100,
            width: '100%',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            color: colors.text.primary,
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;

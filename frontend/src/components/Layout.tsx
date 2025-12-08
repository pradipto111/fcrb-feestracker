import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SystemDateSetter } from "./SystemDateSetter";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const navLinkStyle = (active: boolean) => ({
    padding: "12px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "white",
    background: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: active ? 600 : 500,
    borderLeft: active ? "3px solid #34D399" : "3px solid transparent",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F1F5F9" }}>
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 1001,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img 
              src="/fcrb-logo.png" 
              alt="FC Real Bengaluru" 
              style={{ 
                width: 44, 
                height: 44, 
                borderRadius: "8px",
                background: "white",
                padding: 4
              }} 
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>RealVerse</div>
              <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 500 }}>FC Real Bengaluru</div>
            </div>
          </div>
          <button
            onClick={toggleMobileMenu}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              fontSize: 24,
              width: 40,
              height: 40,
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed",
        left: 0,
        top: isMobile ? 64 : 0,
        bottom: 0,
        width: 280,
        padding: 24,
        background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
        backgroundImage: `url(/photo2.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
        color: "white",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: 1000,
        boxShadow: "4px 0 12px rgba(0,0,0,0.1)",
        transition: "transform 0.3s ease",
        transform: isMobile && !isMobileMenuOpen ? "translateX(-100%)" : "translateX(0)"
      }}>
        {!isMobile && (
          <div style={{ marginBottom: 32, textAlign: "center", paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <img 
              src="/fcrb-logo.png" 
              alt="FC Real Bengaluru" 
              style={{ 
                width: 90, 
                height: 90, 
                margin: "0 auto 16px",
                display: "block",
                borderRadius: "12px",
                background: "white",
                padding: 6,
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
              }} 
            />
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 800, 
              marginBottom: 4,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              RealVerse
            </h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              FC Real Bengaluru Universe
            </p>
          </div>
        )}

        {/* System Date Setter */}
        <div style={{ marginBottom: 20 }}>
          <SystemDateSetter />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <Link 
            to="/" 
            onClick={closeMobileMenu}
            style={navLinkStyle(isActive("/"))}
            onMouseEnter={(e) => !isActive("/") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseLeave={(e) => !isActive("/") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <span style={{ fontSize: 18 }}>📊</span>
            <span>Dashboard</span>
          </Link>
          
          {user?.role !== "STUDENT" && (
            <Link 
              to="/students" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/students"))}
              onMouseEnter={(e) => !isActive("/students") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/students") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>👥</span>
              <span>Students</span>
            </Link>
          )}
          
          {user?.role !== "STUDENT" && (
            <Link 
              to="/attendance" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/attendance"))}
              onMouseEnter={(e) => !isActive("/attendance") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/attendance") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>📅</span>
              <span>Attendance</span>
            </Link>
          )}
          
          {user?.role === "STUDENT" && (
            <Link 
              to="/my-attendance" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/my-attendance"))}
              onMouseEnter={(e) => !isActive("/my-attendance") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/my-attendance") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>📅</span>
              <span>My Attendance</span>
            </Link>
          )}
          
          {user?.role !== "STUDENT" && (
            <Link 
              to="/fixtures" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/fixtures"))}
              onMouseEnter={(e) => !isActive("/fixtures") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/fixtures") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>⚽</span>
              <span>Fixtures</span>
            </Link>
          )}
          
          {user?.role === "STUDENT" && (
            <Link 
              to="/my-fixtures" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/my-fixtures"))}
              onMouseEnter={(e) => !isActive("/my-fixtures") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/my-fixtures") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>⚽</span>
              <span>My Fixtures</span>
            </Link>
          )}
          
          <Link 
            to="/drills" 
            onClick={closeMobileMenu}
            style={navLinkStyle(isActive("/drills"))}
            onMouseEnter={(e) => !isActive("/drills") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseLeave={(e) => !isActive("/drills") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <span style={{ fontSize: 18 }}>🎥</span>
            <span>Drills & Tutorials</span>
          </Link>
          
          {user?.role !== "STUDENT" && (
            <Link 
              to="/drills/manage" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/drills/manage"))}
              onMouseEnter={(e) => !isActive("/drills/manage") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/drills/manage") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>🎬</span>
              <span>Manage Videos</span>
            </Link>
          )}
          
          <Link 
            to="/feed" 
            onClick={closeMobileMenu}
            style={navLinkStyle(isActive("/feed"))}
            onMouseEnter={(e) => !isActive("/feed") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseLeave={(e) => !isActive("/feed") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <span style={{ fontSize: 18 }}>📸</span>
            <span>Feed</span>
          </Link>
          
          {user?.role !== "STUDENT" && (
            <Link 
              to="/feed/approve" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/feed/approve"))}
              onMouseEnter={(e) => !isActive("/feed/approve") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/feed/approve") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>✅</span>
              <span>Approve Posts</span>
            </Link>
          )}
          
          <Link 
            to="/leaderboard" 
            onClick={closeMobileMenu}
            style={navLinkStyle(isActive("/leaderboard"))}
            onMouseEnter={(e) => !isActive("/leaderboard") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            onMouseLeave={(e) => !isActive("/leaderboard") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <span style={{ fontSize: 18 }}>🏆</span>
            <span>Leaderboard</span>
          </Link>
          
          {user?.role === "ADMIN" && (
            <Link 
              to="/admin" 
              onClick={closeMobileMenu}
              style={navLinkStyle(isActive("/admin"))}
              onMouseEnter={(e) => !isActive("/admin") && (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              onMouseLeave={(e) => !isActive("/admin") && (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <span style={{ fontSize: 18 }}>⚙️</span>
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* User info and Logout */}
        <div style={{ 
          marginTop: "auto", 
          paddingTop: 20, 
          borderTop: "1px solid rgba(255,255,255,0.1)" 
        }}>
          {user && (
            <div style={{ 
              marginBottom: 16,
              padding: "12px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "8px"
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{user.fullName}</div>
              <div style={{ 
                fontSize: 11, 
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 500
              }}>
                {user.role}
              </div>
            </div>
          )}
          <button 
            onClick={() => { logout(); closeMobileMenu(); }} 
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.3)";
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 999,
            backdropFilter: "blur(2px)"
          }}
        />
      )}

      <main style={{ 
        marginLeft: isMobile ? 0 : 280, 
        marginTop: isMobile ? 64 : 0,
        flex: 1, 
        padding: isMobile ? 20 : 40, 
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        maxWidth: "100%",
        overflowX: "hidden",
        background: "#F1F5F9"
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

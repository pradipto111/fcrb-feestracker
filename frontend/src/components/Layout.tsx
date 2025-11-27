import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SystemDateSetter } from "./SystemDateSetter";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 1001,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img 
              src="/fcrb-logo.png" 
              alt="FCRB" 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: "50%",
                background: "white",
                padding: 2
              }} 
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>FCRB</div>
              <div style={{ fontSize: 10, opacity: 0.9 }}>Fees Tracker</div>
            </div>
          </div>
          <button
            onClick={toggleMobileMenu}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              fontSize: 24,
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </header>
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed",
        left: 0,
        top: isMobile ? 60 : 0,
        bottom: 0,
        width: 260,
        padding: 24,
        backgroundImage: `linear-gradient(180deg, rgba(30, 64, 175, 0.95) 0%, rgba(30, 58, 138, 0.95) 100%), url(/photo2.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: 1000,
        backdropFilter: "blur(5px)",
        transition: "transform 0.3s ease",
        transform: isMobile && !isMobileMenuOpen ? "translateX(-100%)" : "translateX(0)"
      }}>
        {!isMobile && (
          <div style={{ marginBottom: 24, textAlign: "center" }}>
            <img 
              src="/fcrb-logo.png" 
              alt="FC Real Bengaluru" 
              style={{ 
                width: 80, 
                height: 80, 
                margin: "0 auto 12px",
                display: "block",
                borderRadius: "50%",
                background: "white",
                padding: 4
              }} 
            />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>FCRB</h2>
            <p style={{ fontSize: 12, color: "#E0E7FF" }}>Fees Tracker</p>
          </div>
        )}

        {/* System Date Setter in Sidebar */}
        <div style={{ marginBottom: 16 }}>
          <SystemDateSetter />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <Link 
            to="/" 
            onClick={closeMobileMenu}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              textDecoration: "none",
              color: "white",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s"
            }}
          >
            📊 Dashboard
          </Link>
          {user?.role !== "STUDENT" && (
            <Link 
              to="/students" 
              onClick={closeMobileMenu}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                textDecoration: "none",
                color: "white",
                background: "rgba(255,255,255,0.1)",
                transition: "background 0.2s"
              }}
            >
              👥 Students
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link 
              to="/admin" 
              onClick={closeMobileMenu}
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                textDecoration: "none",
                color: "white",
                background: "rgba(255,255,255,0.1)",
                transition: "background 0.2s"
              }}
            >
              ⚙️ Admin
            </Link>
          )}
        </nav>

        {/* User info and Logout - Always visible at bottom */}
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {user && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{user.fullName}</div>
              <div style={{ fontSize: 12, color: "#E0E7FF" }}>{user.role}</div>
            </div>
          )}
          <button onClick={() => { logout(); closeMobileMenu(); }} style={{
            width: "100%",
            padding: "10px 16px",
            background: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#c0392b"}
          onMouseOut={(e) => e.currentTarget.style.background = "#e74c3c"}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          style={{
            position: "fixed",
            top: 60,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999
          }}
        />
      )}

      <main style={{ 
        marginLeft: isMobile ? 0 : 260, 
        marginTop: isMobile ? 60 : 0,
        flex: 1, 
        padding: isMobile ? 16 : 32, 
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        maxWidth: "100%",
        overflowX: "hidden"
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

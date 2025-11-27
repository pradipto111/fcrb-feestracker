import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SystemDateSetter } from "./SystemDateSetter";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <aside style={{
        position: "fixed",
        left: 0,
        top: 0,
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
        backdropFilter: "blur(5px)"
      }}>
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

        {/* System Date Setter in Sidebar */}
        <div style={{ marginBottom: 16 }}>
          <SystemDateSetter />
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <Link to="/" style={{
            padding: "12px 16px",
            borderRadius: 8,
            textDecoration: "none",
            color: "white",
            background: "rgba(255,255,255,0.1)",
            transition: "background 0.2s"
          }}>
            📊 Dashboard
          </Link>
          {user?.role !== "STUDENT" && (
            <Link to="/students" style={{
              padding: "12px 16px",
              borderRadius: 8,
              textDecoration: "none",
              color: "white",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s"
            }}>
              👥 Students
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link to="/admin" style={{
              padding: "12px 16px",
              borderRadius: 8,
              textDecoration: "none",
              color: "white",
              background: "rgba(255,255,255,0.1)",
              transition: "background 0.2s"
            }}>
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
          <button onClick={logout} style={{
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
      <main style={{ marginLeft: 260, flex: 1, padding: 32, minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;


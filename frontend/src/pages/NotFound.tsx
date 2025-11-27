import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <div style={{
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 16
  }}>
    <h1 style={{ fontSize: 72, fontWeight: 700 }}>404</h1>
    <p style={{ fontSize: 18, color: "#666" }}>Page Not Found</p>
    <Link to="/" style={{
      padding: "12px 24px",
      background: "#667eea",
      color: "white",
      textDecoration: "none",
      borderRadius: 8,
      fontWeight: 600
    }}>
      Go Home
    </Link>
  </div>
);

export default NotFound;



import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { DISABLE_HEAVY_ANALYTICS } from "../config/featureFlags";

const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (DISABLE_HEAVY_ANALYTICS) return;
    api
      .getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (DISABLE_HEAVY_ANALYTICS) {
    return (
      <div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Admin Dashboard</h1>
        <p style={{ color: "#666" }}>Dashboard summary temporarily disabled.</p>
      </div>
    );
  }

  if (error) return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  if (!summary) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Admin Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Collected</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#27ae60" }}>₹ {summary.totalCollected.toLocaleString()}</div>
        </div>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Students</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#3498db" }}>{summary.studentCount}</div>
        </div>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Approx Outstanding</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#e74c3c" }}>₹ {summary.approxOutstanding.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



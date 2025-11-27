import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const CoachDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboardSummary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "#e74c3c" }}>Error: {error}</p>;
  if (!summary) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Center Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Fees Collected</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#27ae60" }}>₹ {summary.totalCollected.toLocaleString()}</div>
        </div>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Students</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#3498db" }}>{summary.studentCount}</div>
        </div>
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Outstanding (Approx)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#e74c3c" }}>₹ {summary.approxOutstanding.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;



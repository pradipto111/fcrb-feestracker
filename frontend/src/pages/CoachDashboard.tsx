import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { adminAssets, centresAssets } from "../config/assets";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

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
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Top banner with background */}
      <div
        style={{
          position: "relative",
          height: "200px",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${centresAssets.genericPitchBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
            filter: "blur(10px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(4, 61, 208, 0.7) 0%, rgba(255, 169, 0, 0.5) 100%)`,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: spacing.xl,
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <h1 style={{ ...typography.h1, color: colors.text.onPrimary, margin: 0 }}>
            Center Dashboard
          </h1>
        </div>
      </div>
      
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



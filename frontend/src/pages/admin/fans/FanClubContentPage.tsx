import React, { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";
import AdminFanMatchdayContentPage from "./AdminFanMatchdayContentPage";
import AdminFanAnalyticsPage from "./AdminFanAnalyticsPage";

const FanClubContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"matchday" | "analytics">("matchday");

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        {/* Tabs */}
        <Card variant="default" padding="md" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ display: "flex", gap: spacing.md }}>
            <button
              onClick={() => setActiveTab("matchday")}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: activeTab === "matchday" ? colors.primary.main : "transparent",
                color: activeTab === "matchday" ? colors.text.inverted : colors.text.primary,
                border: `1px solid ${activeTab === "matchday" ? colors.primary.main : colors.border}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                ...typography.body,
                fontWeight: activeTab === "matchday" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                transition: "all 0.2s ease",
              }}
            >
              Matchday Content
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: activeTab === "analytics" ? colors.primary.main : "transparent",
                color: activeTab === "analytics" ? colors.text.inverted : colors.text.primary,
                border: `1px solid ${activeTab === "analytics" ? colors.primary.main : colors.border}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                ...typography.body,
                fontWeight: activeTab === "analytics" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                transition: "all 0.2s ease",
              }}
            >
              Analytics
            </button>
          </div>
        </Card>

        {/* Tab Content */}
        <div style={{ display: activeTab === "matchday" ? "block" : "none", marginTop: `-${spacing.xl}`, marginLeft: `-${spacing.xl}`, marginRight: `-${spacing.xl}` }}>
          <AdminFanMatchdayContentPage />
        </div>
        <div style={{ display: activeTab === "analytics" ? "block" : "none", marginTop: `-${spacing.xl}`, marginLeft: `-${spacing.xl}`, marginRight: `-${spacing.xl}` }}>
          <AdminFanAnalyticsPage />
        </div>
      </div>
    </div>
  );
};

export default FanClubContentPage;

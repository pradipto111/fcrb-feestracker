import React, { useState } from "react";
import { Card } from "../../../components/ui/Card";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";
import AdminFansPage from "./AdminFansPage";
import AdminFanTiersPage from "./AdminFanTiersPage";
import AdminFanRewardsPage from "./AdminFanRewardsPage";

const FanClubManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"accounts" | "tiers" | "rewards">("accounts");

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        {/* Tabs */}
        <Card variant="default" padding="md" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ display: "flex", gap: spacing.md }}>
            <button
              onClick={() => setActiveTab("accounts")}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: activeTab === "accounts" ? colors.primary.main : "transparent",
                color: activeTab === "accounts" ? colors.text.inverted : colors.text.primary,
                border: `1px solid ${activeTab === "accounts" ? colors.primary.main : colors.border}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                ...typography.body,
                fontWeight: activeTab === "accounts" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                transition: "all 0.2s ease",
              }}
            >
              Accounts
            </button>
            <button
              onClick={() => setActiveTab("tiers")}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: activeTab === "tiers" ? colors.primary.main : "transparent",
                color: activeTab === "tiers" ? colors.text.inverted : colors.text.primary,
                border: `1px solid ${activeTab === "tiers" ? colors.primary.main : colors.border}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                ...typography.body,
                fontWeight: activeTab === "tiers" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                transition: "all 0.2s ease",
              }}
            >
              Tiers
            </button>
            <button
              onClick={() => setActiveTab("rewards")}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                background: activeTab === "rewards" ? colors.primary.main : "transparent",
                color: activeTab === "rewards" ? colors.text.inverted : colors.text.primary,
                border: `1px solid ${activeTab === "rewards" ? colors.primary.main : colors.border}`,
                borderRadius: borderRadius.md,
                cursor: "pointer",
                ...typography.body,
                fontWeight: activeTab === "rewards" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                transition: "all 0.2s ease",
              }}
            >
              Rewards
            </button>
          </div>
        </Card>

        {/* Tab Content */}
        <div style={{ display: activeTab === "accounts" ? "block" : "none", marginTop: `-${spacing.xl}`, marginLeft: `-${spacing.xl}`, marginRight: `-${spacing.xl}` }}>
          <AdminFansPage />
        </div>
        <div style={{ display: activeTab === "tiers" ? "block" : "none", marginTop: `-${spacing.xl}`, marginLeft: `-${spacing.xl}`, marginRight: `-${spacing.xl}` }}>
          <AdminFanTiersPage />
        </div>
        <div style={{ display: activeTab === "rewards" ? "block" : "none", marginTop: `-${spacing.xl}`, marginLeft: `-${spacing.xl}`, marginRight: `-${spacing.xl}` }}>
          <AdminFanRewardsPage />
        </div>
      </div>
    </div>
  );
};

export default FanClubManagementPage;

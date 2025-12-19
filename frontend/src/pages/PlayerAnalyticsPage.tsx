import React, { useState } from "react";
import { motion } from "framer-motion";
import YourAnalytics from "../components/YourAnalytics";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { colors, typography, spacing } from "../theme/design-tokens";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { ChartBarIcon, RefreshIcon, UserIcon } from "../components/icons/IconSet";
import { StudentPlayerProfileView } from "./student/StudentPlayerProfilePage";

const PlayerAnalyticsPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"analytics" | "profile">("analytics");
  
  const {
    headingVariants,
    viewportOnce,
  } = useHomepageAnimation();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <motion.div variants={headingVariants} initial="offscreen" whileInView="onscreen" viewport={viewportOnce}>
        <PageHeader
          tone="dark"
          title="Your Analytics"
          subtitle="Readiness, positional suitability, and coach notes—built for clarity."
          actions={
            activeTab === "analytics" ? (
              <Button variant="utility" size="md" onClick={() => setRefreshKey((prev) => prev + 1)}>
                <RefreshIcon size={14} style={{ marginRight: spacing.xs }} /> Refresh
              </Button>
            ) : null
          }
        />
      </motion.div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: spacing.sm,
          marginBottom: spacing.xl,
          borderBottom: `1px solid rgba(255, 255, 255, 0.10)`,
        }}
      >
        {[
          { key: "analytics" as const, label: "Analytics", icon: ChartBarIcon },
          { key: "profile" as const, label: "Full Profile", icon: UserIcon },
        ].map((t) => {
          const isActive = activeTab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.xs,
                padding: `${spacing.md} ${spacing.lg}`,
                background: "transparent",
                border: "none",
                borderBottom: isActive ? `3px solid ${colors.primary.main}` : "3px solid transparent",
                color: isActive ? colors.text.primary : colors.text.muted,
                cursor: "pointer",
                fontSize: typography.fontSize.sm,
                fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                fontFamily: typography.fontFamily.primary,
                transition: "all 0.2s ease",
              }}
            >
              <Icon size={16} color={isActive ? colors.primary.light : colors.text.muted} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "analytics" ? <YourAnalytics refreshKey={refreshKey} /> : <StudentPlayerProfileView embedded />}
    </div>
  );
};

export default PlayerAnalyticsPage;

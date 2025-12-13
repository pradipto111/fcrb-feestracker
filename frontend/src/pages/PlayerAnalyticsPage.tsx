import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import YourAnalytics from "../components/YourAnalytics";
import StudentPlayerProfilePage from "./student/StudentPlayerProfilePage";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing } from "../theme/design-tokens";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";

const PlayerAnalyticsPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<"analytics" | "profile">("analytics");
  
  const {
    headingVariants,
    viewportOnce,
  } = useHomepageAnimation();

  if (viewMode === "profile") {
    return <StudentPlayerProfilePage />;
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <motion.div
        variants={headingVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={viewportOnce}
        style={{
          marginBottom: spacing.xl,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
            Your Analytics
          </h1>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            View your latest performance metrics, readiness index, positional suitability, and coach notes.
          </p>
        </div>
        <div style={{ display: "flex", gap: spacing.sm }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => setViewMode("profile")}
          >
            📊 Full Profile
          </Button>
          <Button
            variant="utility"
            size="md"
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            🔄 Refresh
          </Button>
        </div>
      </motion.div>

      {/* Analytics Component */}
      <YourAnalytics refreshKey={refreshKey} />
    </div>
  );
};

export default PlayerAnalyticsPage;

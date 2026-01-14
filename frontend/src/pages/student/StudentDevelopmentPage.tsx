import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import ProgressRoadmap from "../../components/ProgressRoadmap";
import MonthlyFeedback from "../../components/MonthlyFeedback";
import PlayerDevelopmentTimeline from "../../components/PlayerDevelopmentTimeline";
import { PageHeader } from "../../components/ui/PageHeader";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";

const StudentDevelopmentPage: React.FC = () => {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const {
    headingVariants,
    viewportOnce,
  } = useHomepageAnimation();

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await api.getStudentTimeline().catch(() => ({ events: [] }));
        setTimelineData(data);
      } catch (err) {
        setTimelineData({ events: [] });
      } finally {
        setLoading(false);
      }
    };
    loadTimeline();
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <motion.div variants={headingVariants} initial="offscreen" whileInView="onscreen" viewport={viewportOnce}>
        <PageHeader
          tone="dark"
          title="My Development"
          subtitle="Your complete development journey: pathway progress, coach feedback, and timeline milestones."
        />
      </motion.div>

      {/* Progress Roadmap Section */}
      <div style={{ marginBottom: spacing.xl }}>
        <ProgressRoadmap />
      </div>

      {/* Coach Feedback Section */}
      <div style={{ marginBottom: spacing.xl }}>
        <MonthlyFeedback />
      </div>

      {/* Development Timeline Section */}
      {loading ? (
        <div className="rv-empty-state">
          <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--lg" style={{ marginBottom: spacing.md }} />
          <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
          <p style={{ marginTop: spacing.lg, color: colors.text.muted }}>Loading your journey…</p>
        </div>
      ) : (timelineData?.events || []).length > 0 ? (
        <PlayerDevelopmentTimeline events={timelineData.events || []} loading={false} />
      ) : (
        <div style={{ marginBottom: spacing.xl }}>
          <PlayerDevelopmentTimeline events={[]} loading={false} />
        </div>
      )}
    </div>
  );
};

export default StudentDevelopmentPage;


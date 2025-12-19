import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import PlayerDevelopmentTimeline from "../../components/PlayerDevelopmentTimeline";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentJourneyPage: React.FC = () => {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader
        tone="dark"
        title="My Journey"
        subtitle="Your development timeline with milestones, achievements, and key moments."
      />

      {loading ? (
        <div className="rv-empty-state">
          <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--lg" style={{ marginBottom: spacing.md }} />
          <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
          <p style={{ marginTop: spacing.lg, color: colors.text.muted }}>Loading your journey…</p>
        </div>
      ) : (timelineData?.events || []).length > 0 ? (
        <PlayerDevelopmentTimeline events={timelineData.events || []} loading={false} />
      ) : (
        <Card variant="default" padding="lg">
          <div style={{ ...typography.body, color: colors.text.secondary }}>
            No milestones yet. Your coaches will add key development events as you progress.
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default StudentJourneyPage;


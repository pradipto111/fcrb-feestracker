import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import PlayerDevelopmentTimeline from "../../components/PlayerDevelopmentTimeline";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentJourneyPage: React.FC = () => {
  const [timelineData, setTimelineData] = useState<any>(null);

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await api.getStudentTimeline().catch(() => ({ events: [] }));
        setTimelineData(data);
      } catch (err) {
        setTimelineData({ events: [] });
      }
    };
    loadTimeline();
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
          My Journey
        </h1>
        <p style={{ ...typography.body, color: colors.text.secondary }}>
          Your complete development timeline with milestones, achievements, and key moments
        </p>
      </div>

      {timelineData && (
        <PlayerDevelopmentTimeline
          events={timelineData.events || []}
          loading={!timelineData}
        />
      )}
    </motion.div>
  );
};

export default StudentJourneyPage;


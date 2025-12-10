import React from "react";
import { motion } from "framer-motion";
import ProgressRoadmap from "../../components/ProgressRoadmap";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentPathwayPage: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
          My Pathway
        </h1>
        <p style={{ ...typography.body, color: colors.text.secondary }}>
          Your progress roadmap, current level, and what it takes to advance
        </p>
      </div>

      <ProgressRoadmap />
    </motion.div>
  );
};

export default StudentPathwayPage;


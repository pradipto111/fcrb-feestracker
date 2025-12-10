import React from "react";
import { motion } from "framer-motion";
import MatchSelectionPanel from "../../components/MatchSelectionPanel";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentMatchesPage: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
          Matches & Selection
        </h1>
        <p style={{ ...typography.body, color: colors.text.secondary }}>
          Your match exposure history and selection status with transparency on decisions
        </p>
      </div>

      <MatchSelectionPanel />
    </motion.div>
  );
};

export default StudentMatchesPage;


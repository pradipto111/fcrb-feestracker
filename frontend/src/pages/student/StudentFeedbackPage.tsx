import React from "react";
import { motion } from "framer-motion";
import MonthlyFeedback from "../../components/MonthlyFeedback";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentFeedbackPage: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
          Coach Feedback
        </h1>
        <p style={{ ...typography.body, color: colors.text.secondary }}>
          Monthly feedback from your coaches with strengths, areas to improve, and focus goals
        </p>
      </div>

      <MonthlyFeedback />
    </motion.div>
  );
};

export default StudentFeedbackPage;


import React from "react";
import { motion } from "framer-motion";
import WellnessCheck from "../../components/WellnessCheck";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentWellnessPage: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm }}>
          Training Load & Wellness
        </h1>
        <p style={{ ...typography.body, color: colors.text.secondary }}>
          Track your training load, recovery, and wellness to help coaches manage your development
        </p>
      </div>

      <WellnessCheck />
    </motion.div>
  );
};

export default StudentWellnessPage;


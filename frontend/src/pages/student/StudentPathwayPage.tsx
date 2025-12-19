import React from "react";
import { motion } from "framer-motion";
import ProgressRoadmap from "../../components/ProgressRoadmap";
import { PageHeader } from "../../components/ui/PageHeader";
import { colors, typography, spacing } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentPathwayPage: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader
        tone="dark"
        title="My Pathway"
        subtitle="Your progress roadmap, current level, and what it takes to advance."
      />

      <ProgressRoadmap />
    </motion.div>
  );
};

export default StudentPathwayPage;


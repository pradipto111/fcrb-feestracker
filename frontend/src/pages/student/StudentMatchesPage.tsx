import React from "react";
import { motion } from "framer-motion";
import MatchSelectionPanel from "../../components/MatchSelectionPanel";
import { PageHeader } from "../../components/ui/PageHeader";
import { pageVariants } from "../../utils/motion";

const StudentMatchesPage: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader
        tone="dark"
        title="Matches & Selection"
        subtitle="Your match exposure history and selection status—with transparency on decisions."
      />

      <MatchSelectionPanel />
    </motion.div>
  );
};

export default StudentMatchesPage;


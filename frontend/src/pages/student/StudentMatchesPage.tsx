import React from "react";
import { motion } from "framer-motion";
import MatchSelectionPanel from "../../components/MatchSelectionPanel";
import { PageHeader } from "../../components/ui/PageHeader";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";

const StudentMatchesPage: React.FC = () => {
  const {
    headingVariants,
    viewportOnce,
  } = useHomepageAnimation();

  return (
    <div style={{ width: "100%" }}>
      <motion.div variants={headingVariants} initial="offscreen" whileInView="onscreen" viewport={viewportOnce}>
        <PageHeader
          tone="dark"
          title="Matches & Selection"
          subtitle="Your match exposure history and selection status—with transparency on decisions."
        />
      </motion.div>

      <MatchSelectionPanel />
    </div>
  );
};

export default StudentMatchesPage;


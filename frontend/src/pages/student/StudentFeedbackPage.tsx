import React from "react";
import { motion } from "framer-motion";
import MonthlyFeedback from "../../components/MonthlyFeedback";
import { PageHeader } from "../../components/ui/PageHeader";
import { pageVariants } from "../../utils/motion";

const StudentFeedbackPage: React.FC = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader
        tone="dark"
        title="Coach Feedback"
        subtitle="Monthly feedback from your coaches: strengths, focus areas, and goals."
      />

      <MonthlyFeedback />
    </motion.div>
  );
};

export default StudentFeedbackPage;


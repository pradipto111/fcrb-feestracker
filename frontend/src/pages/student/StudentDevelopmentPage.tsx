import React from "react";
import { motion } from "framer-motion";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";

const StudentDevelopmentPage: React.FC = () => {
  const {
    headingVariants,
    viewportOnce,
  } = useHomepageAnimation();

  return (
    <div style={{ width: "100%" }}>
      <motion.div variants={headingVariants} initial="offscreen" whileInView="onscreen" viewport={viewportOnce}>
        <PageHeader
          tone="dark"
          title="My Development"
          subtitle="Your complete development journey: pathway progress, coach feedback, and timeline milestones."
        />
      </motion.div>

      <Card variant="default" padding="xl" style={{ marginTop: spacing.xl }}>
        <div style={{ textAlign: "center", padding: spacing.xl }}>
          <div style={{ fontSize: "4rem", marginBottom: spacing.lg }}>📈</div>
          <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>
            Coming Soon
          </h3>
          <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "600px", margin: "0 auto" }}>
            The My Development feature is currently under development. You'll be able to view your pathway progress, coach feedback, and timeline milestones here soon.
          </p>
          <div style={{ marginTop: spacing.lg }}>
            <span style={{ 
              ...typography.caption, 
              padding: `${spacing.sm} ${spacing.md}`, 
              borderRadius: borderRadius.md, 
              background: colors.warning.soft, 
              color: colors.warning.main,
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.sm
            }}>
              Coming soon
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentDevelopmentPage;


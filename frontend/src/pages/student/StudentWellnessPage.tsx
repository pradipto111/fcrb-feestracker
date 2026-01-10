import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WellnessCheck from "../../components/WellnessCheck";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Section } from "../../components/ui/Section";
import { PageHeader } from "../../components/ui/PageHeader";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { ArrowRightIcon, ChartLineIcon } from "../../components/icons/IconSet";
import { pageVariants } from "../../utils/motion";

const StudentWellnessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader
        tone="dark"
        title="Training Load & Wellness"
        subtitle="Track training load, recovery, and wellness to support safe development."
      />

      {/* CTA to Load Dashboard */}
      {user?.id && (
        <Section variant="elevated" style={{ marginBottom: spacing.xl }}>
          <Card
            variant="elevated"
            padding="lg"
            style={{
              background: `linear-gradient(135deg, ${colors.primary.main}15 0%, ${colors.accent.main}15 100%)`,
              border: `2px solid ${colors.primary.main}40`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: spacing.md }}>
              <div style={{ flex: 1, minWidth: "250px" }}>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                  Load Dashboard
                </h3>
                <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
                  View detailed training load trends, weekly/monthly comparisons, and readiness-load correlation insights.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/realverse/player/${user.id}/load-dashboard`)}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                    <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View Load Dashboard</span>
                    <ArrowRightIcon size={14} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                  </span>
                </Button>
              </div>
              <div
                aria-hidden="true"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: borderRadius.full,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: colors.primary.light,
                  opacity: 0.9,
                }}
              >
                <ChartLineIcon size={28} />
              </div>
            </div>
          </Card>
        </Section>
      )}

      <WellnessCheck />
    </motion.div>
  );
};

export default StudentWellnessPage;


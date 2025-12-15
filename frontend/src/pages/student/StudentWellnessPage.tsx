import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WellnessCheck from "../../components/WellnessCheck";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Section } from "../../components/ui/Section";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";

const StudentWellnessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
                  📊 Load Dashboard
                </h3>
                <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
                  View detailed training load trends, weekly/monthly comparisons, and readiness-load correlation insights.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/realverse/player/${user.id}/load-dashboard`)}
                >
                  View Load Dashboard →
                </Button>
              </div>
              <div style={{ fontSize: "3rem", opacity: 0.2, lineHeight: 1 }}>
                📈
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


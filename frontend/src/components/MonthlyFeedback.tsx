import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface MonthlyFeedback {
  id: number;
  month: number;
  year: number;
  coach: {
    id: number;
    fullName: string;
  };
  strengths: string[];
  areasToImprove: string[];
  focusGoal: string;
  overallNote?: string;
  isPublished: boolean;
  publishedAt?: string;
}

const MonthlyFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<MonthlyFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true);
        const response = await api.getMyFeedback();
        setFeedbacks(response.feedbacks || []);
      } catch (err: any) {
        setError(err.message || "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };
    loadFeedback();
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (loading) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <p style={{ color: colors.text.muted }}>Loading feedback...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg, background: colors.danger.soft, border: `1px solid ${colors.danger.main}40` }}>
        <p style={{ color: colors.danger.main }}>Error: {error}</p>
      </Card>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ textAlign: "center", padding: spacing.xl }}>
          <div style={{ fontSize: "3rem", marginBottom: spacing.md }}>📝</div>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
            No Feedback Yet
          </h3>
          <p style={{ color: colors.text.secondary }}>
            Your coaches will share monthly feedback here. Check back soon!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
      <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
        Recent Coach Feedback
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
        {feedbacks.slice(0, 3).map((feedback) => (
          <Card
            key={feedback.id}
            variant="elevated"
            padding="md"
            style={{
              background: `linear-gradient(135deg, ${colors.surface.card} 0%, ${colors.surface.soft} 100%)`,
              border: `1px solid ${colors.primary.main}20`,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md }}>
              <div>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                  {monthNames[feedback.month - 1]} {feedback.year}
                </h3>
                <p style={{ ...typography.caption, color: colors.text.muted }}>
                  Feedback from {feedback.coach.fullName}
                </p>
              </div>
              {feedback.publishedAt && (
                <span style={{
                  ...typography.caption,
                  fontSize: typography.fontSize.xs,
                  color: colors.text.muted,
                  background: colors.surface.soft,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  borderRadius: borderRadius.sm,
                }}>
                  Published {new Date(feedback.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Strengths */}
            <div style={{ marginBottom: spacing.md }}>
              <h4 style={{ ...typography.overline, color: colors.accent.main, marginBottom: spacing.sm }}>
                Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: spacing.lg, color: colors.text.secondary }}>
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx} style={{ marginBottom: spacing.xs }}>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas to Improve */}
            <div style={{ marginBottom: spacing.md }}>
              <h4 style={{ ...typography.overline, color: colors.primary.main, marginBottom: spacing.sm }}>
                Areas to Improve
              </h4>
              <ul style={{ margin: 0, paddingLeft: spacing.lg, color: colors.text.secondary }}>
                {feedback.areasToImprove.map((area, idx) => (
                  <li key={idx} style={{ marginBottom: spacing.xs }}>
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            {/* Focus Goal */}
            <div style={{
              background: colors.primary.main + "10",
              padding: spacing.md,
              borderRadius: borderRadius.md,
              marginBottom: feedback.overallNote ? spacing.md : 0,
              border: `1px solid ${colors.primary.main}30`,
            }}>
              <h4 style={{ ...typography.overline, color: colors.primary.main, marginBottom: spacing.xs }}>
                Focus Goal
              </h4>
              <p style={{ color: colors.text.primary, margin: 0, fontWeight: 500 }}>
                {feedback.focusGoal}
              </p>
            </div>

            {/* Overall Note */}
            {feedback.overallNote && (
              <div style={{ marginTop: spacing.md }}>
                <p style={{ color: colors.text.secondary, fontStyle: "italic", margin: 0 }}>
                  {feedback.overallNote}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
};

export default MonthlyFeedback;


import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface NextStepSnapshotProps {
  roadmap?: {
    currentLevel: string;
    nextPotentialLevel: string | null;
    attendanceRequirement: string | null;
    physicalBenchmark: string | null;
    tacticalRequirement: string | null;
    coachRecommendation: boolean;
    isEligible: boolean;
  } | null;
}

const NextStepSnapshot: React.FC<NextStepSnapshotProps> = ({ roadmap: roadmapProp }) => {
  const [roadmap, setRoadmap] = useState(roadmapProp);
  const [loading, setLoading] = useState(!roadmapProp);

  useEffect(() => {
    if (!roadmapProp) {
      const loadRoadmap = async () => {
        try {
          const data = await api.getMyProgressRoadmap();
          setRoadmap(data);
        } catch (err) {
          // Silently fail - will show empty state
        } finally {
          setLoading(false);
        }
      };
      loadRoadmap();
    }
  }, [roadmapProp]);

  if (loading) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
      </Card>
    );
  }

  if (!roadmap || !roadmap.nextPotentialLevel) {
    return null; // Don't show if no next level defined
  }

  const requirements = [
    roadmap.attendanceRequirement,
    roadmap.physicalBenchmark,
    roadmap.tacticalRequirement,
  ].filter(Boolean);

  return (
    <Card
      variant="default"
      padding="lg"
      style={{
        marginBottom: spacing.lg,
        background: roadmap.isEligible
          ? `linear-gradient(135deg, ${colors.success.main}15 0%, ${colors.accent.main}15 100%)`
          : `linear-gradient(135deg, ${colors.primary.main}15 0%, ${colors.accent.main}15 100%)`,
        border: `2px solid ${roadmap.isEligible ? colors.success.main : colors.primary.main}40`,
      }}
    >
      <h2
        style={{
          ...typography.h3,
          color: colors.text.primary,
          marginBottom: spacing.md,
        }}
      >
        What's Next for You?
      </h2>

      <div style={{ marginBottom: spacing.md }}>
        <div
          style={{
            ...typography.overline,
            color: colors.text.muted,
            marginBottom: spacing.xs,
          }}
        >
          Current: {roadmap.currentLevel}
        </div>
        <div
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginBottom: spacing.sm,
          }}
        >
          → {roadmap.nextPotentialLevel}
        </div>
        {roadmap.isEligible && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: spacing.xs,
              padding: `${spacing.xs} ${spacing.sm}`,
              borderRadius: borderRadius.sm,
              background: colors.success.main + "20",
              color: colors.success.main,
              marginTop: spacing.xs,
            }}
          >
            <span style={{ fontSize: typography.fontSize.sm }}>✓</span>
            <span style={{ ...typography.caption, fontWeight: typography.fontWeight.semibold }}>
              Eligible for consideration
            </span>
          </div>
        )}
      </div>

      {requirements.length > 0 && (
        <div style={{ marginBottom: spacing.md }}>
          <div
            style={{
              ...typography.overline,
              color: colors.text.muted,
              marginBottom: spacing.sm,
            }}
          >
            Key Requirements:
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: spacing.lg,
              color: colors.text.secondary,
              fontSize: typography.fontSize.sm,
            }}
          >
            {requirements.map((req, idx) => (
              <li key={idx} style={{ marginBottom: spacing.xs }}>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {roadmap.coachRecommendation && (
        <div
          style={{
            padding: spacing.sm,
            borderRadius: borderRadius.md,
            background: colors.accent.main + "20",
            border: `1px solid ${colors.accent.main}40`,
            marginBottom: spacing.md,
          }}
        >
          <p
            style={{
              ...typography.caption,
              color: colors.accent.main,
              margin: 0,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            ✓ Coach Recommendation: Ready for consideration
          </p>
        </div>
      )}

      <div
        style={{
          padding: spacing.sm,
          borderRadius: borderRadius.md,
          background: colors.surface.soft,
          border: `1px solid ${colors.text.muted}20`,
        }}
      >
        <p
          style={{
            ...typography.caption,
            color: colors.text.muted,
            margin: 0,
            fontSize: typography.fontSize.xs,
          }}
        >
          Eligibility is based on standards and coach/admin evaluation. Not a guarantee.
        </p>
      </div>
    </Card>
  );
};

export default NextStepSnapshot;


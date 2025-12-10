import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface ProgressRoadmap {
  currentLevel: string;
  nextPotentialLevel: string | null;
  attendanceRequirement: string | null;
  physicalBenchmark: string | null;
  tacticalRequirement: string | null;
  coachRecommendation: boolean;
  isEligible: boolean;
}

const ProgressRoadmap: React.FC = () => {
  const [roadmap, setRoadmap] = useState<ProgressRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        setLoading(true);
        const data = await api.getMyProgressRoadmap();
        setRoadmap(data);
      } catch (err: any) {
        setError(err.message || "Failed to load progress roadmap");
      } finally {
        setLoading(false);
      }
    };
    loadRoadmap();
  }, []);

  if (loading) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <p style={{ color: colors.text.muted }}>Loading progress roadmap...</p>
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

  if (!roadmap) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ textAlign: "center", padding: spacing.xl }}>
          <div style={{ fontSize: "3rem", marginBottom: spacing.md }}>🎯</div>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
            Progress Roadmap Not Set
          </h3>
          <p style={{ color: colors.text.secondary }}>
            Your coaches will define your pathway soon. Check back later!
          </p>
        </div>
      </Card>
    );
  }

  const requirements = [
    { label: "Attendance", value: roadmap.attendanceRequirement },
    { label: "Physical Benchmark", value: roadmap.physicalBenchmark },
    { label: "Tactical Understanding", value: roadmap.tacticalRequirement },
  ].filter((req) => req.value);

  return (
    <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
      <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
        What's Next for Me?
      </h2>

      {/* Current Level */}
      <div style={{ marginBottom: spacing.lg }}>
        <div style={{
          padding: spacing.lg,
          borderRadius: borderRadius.md,
          background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
          border: `2px solid ${colors.primary.main}40`,
        }}>
          <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>
            Current Level
          </div>
          <h3 style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>
            {roadmap.currentLevel}
          </h3>
        </div>
      </div>

      {/* Next Level */}
      {roadmap.nextPotentialLevel && (
        <div style={{ marginBottom: spacing.lg }}>
          <div style={{
            padding: spacing.lg,
            borderRadius: borderRadius.md,
            background: roadmap.isEligible
              ? `linear-gradient(135deg, ${colors.success.main}20 0%, ${colors.accent.main}20 100%)`
              : `linear-gradient(135deg, ${colors.surface.card} 0%, ${colors.surface.soft} 100%)`,
            border: `2px solid ${roadmap.isEligible ? colors.success.main : colors.primary.main}40`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm }}>
              <div style={{ flex: 1 }}>
                <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>
                  Next Potential Level
                </div>
                <h3 style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>
                  {roadmap.nextPotentialLevel}
                </h3>
              </div>
              {roadmap.isEligible && (
                <span style={{
                  ...typography.caption,
                  padding: `${spacing.xs} ${spacing.sm}`,
                  borderRadius: borderRadius.sm,
                  background: colors.success.main + "20",
                  color: colors.success.main,
                  fontWeight: 600,
                }}>
                  Eligible
                </span>
              )}
            </div>
            {roadmap.isEligible && (
              <p style={{
                ...typography.body,
                color: colors.success.main,
                marginTop: spacing.sm,
                marginBottom: 0,
                fontWeight: 500,
              }}>
                ✓ You're eligible for consideration for this level
              </p>
            )}
            {!roadmap.isEligible && (
              <p style={{
                ...typography.body,
                color: colors.text.secondary,
                marginTop: spacing.sm,
                marginBottom: 0,
                fontStyle: "italic",
              }}>
                Eligible for consideration (not guaranteed)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Requirements */}
      {requirements.length > 0 && (
        <div style={{ marginBottom: spacing.lg }}>
          <h4 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Key Requirements
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
            {requirements.map((req, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  background: colors.surface.soft,
                  border: `1px solid ${colors.surface.card}`,
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: colors.primary.main + "20",
                  color: colors.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: typography.fontSize.sm,
                  fontWeight: 600,
                  flexShrink: 0,
                  marginTop: 2,
                }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>
                    {req.label}
                  </div>
                  <p style={{ ...typography.body, color: colors.text.primary, margin: 0 }}>
                    {req.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coach Recommendation */}
      {roadmap.coachRecommendation && (
        <div style={{
          padding: spacing.md,
          borderRadius: borderRadius.md,
          background: colors.accent.main + "20",
          border: `1px solid ${colors.accent.main}40`,
          marginBottom: spacing.lg,
        }}>
          <p style={{ ...typography.body, color: colors.accent.main, margin: 0, fontWeight: 500 }}>
            ✓ Coach Recommendation: Your coach has flagged you as ready for consideration
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        padding: spacing.md,
        borderRadius: borderRadius.md,
        background: colors.surface.soft,
        border: `1px solid ${colors.text.muted}20`,
      }}>
        <p style={{ ...typography.caption, color: colors.text.muted, margin: 0, fontSize: typography.fontSize.sm }}>
          <strong>Note:</strong> Meeting these requirements makes you eligible for consideration. Final selection decisions are made by coaches and administrators based on multiple factors.
        </p>
      </div>
    </Card>
  );
};

export default ProgressRoadmap;


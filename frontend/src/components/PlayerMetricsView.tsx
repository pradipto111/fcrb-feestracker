/**
 * Player Metrics View Component
 * 
 * Displays player metrics for admins/coaches viewing a student's analytics,
 * or for students viewing their own analytics.
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";

interface MetricSnapshot {
  id: number;
  createdAt: string;
  sourceContext: string;
  notes?: string;
  values: Array<{
    metricDefinition: {
      key: string;
      displayName: string;
      category: string;
    };
    valueNumber: number;
    confidence?: number;
    comment?: string;
  }>;
  positional: Array<{
    position: string;
    suitability: number;
    comment?: string;
  }>;
  readiness?: {
    overall: number;
    technical: number;
    physical: number;
    mental: number;
    attitude: number;
    tacticalFit: number;
    explanationJson: any;
  };
  createdBy: {
    fullName: string;
  };
}

interface PlayerMetricsViewProps {
  studentId: number;
  isOwnView?: boolean; // If true, uses /my endpoints, otherwise uses admin endpoints
  refreshKey?: number; // Key to force refresh when changed
}

const PlayerMetricsView: React.FC<PlayerMetricsViewProps> = ({ studentId, isOwnView = false, refreshKey = 0 }) => {
  const [snapshot, setSnapshot] = useState<MetricSnapshot | null>(null);
  const [positional, setPositional] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const {
    sectionVariantsLight,
    headingVariants,
    cardVariants,
    cardHoverLight,
    viewportOnce,
    getStaggeredCard,
  } = useHomepageAnimation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        if (isOwnView) {
          // Student viewing their own analytics
          const [snapshotData, positionalData] = await Promise.all([
            api.getMyLatestMetricSnapshot().catch(() => ({ snapshot: null })),
            api.getMyPositionalSuitability().catch(() => ({ positional: [] })),
          ]);

          if (snapshotData?.snapshot) {
            setSnapshot(snapshotData.snapshot);
          } else {
            setSnapshot(null);
          }

          if (positionalData?.positional) {
            setPositional(positionalData.positional);
          } else {
            setPositional([]);
          }
        } else {
          // Admin/Coach viewing student analytics
          const [snapshotData, positionalData] = await Promise.all([
            api.getStudentMetricSnapshot(studentId).catch(() => ({ snapshot: null })),
            api.getStudentPositionalSuitability(studentId).catch(() => ({ positional: [] })),
          ]);

          if (snapshotData?.snapshot) {
            setSnapshot(snapshotData.snapshot);
          } else {
            setSnapshot(null);
          }

          if (positionalData?.positional) {
            setPositional(positionalData.positional);
          } else {
            setPositional([]);
          }
        }
      } catch (err: any) {
        if (err.message && !err.message.includes("No snapshots") && !err.message.includes("No positional")) {
          setError(err.message || "Failed to load analytics");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId, isOwnView, refreshKey]); // Add refreshKey to dependencies

  if (loading) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ textAlign: "center", padding: spacing.xl }}>
          <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--lg" style={{ marginBottom: spacing.md }} />
          <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
          <p style={{ marginTop: spacing.lg, color: colors.text.muted }}>Loading analytics...</p>
        </div>
      </Card>
    );
  }

  if (error && !snapshot) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
        <p style={{ color: colors.danger.main }}>⚠️ {error}</p>
        <p style={{ color: colors.text.muted, marginTop: spacing.sm, fontSize: typography.fontSize.sm }}>
          No analytics data available yet.
        </p>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ textAlign: "center", padding: spacing.xl }}>
          <div style={{ fontSize: "48px", marginBottom: spacing.md }}>📊</div>
          <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm }}>
            No Analytics Data Yet
          </h3>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            No metric assessments have been created for this player yet.
          </p>
        </div>
      </Card>
    );
  }

  // Group metrics by category
  const metricsByCategory = snapshot.values.reduce((acc, val) => {
    const category = val.metricDefinition.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(val);
    return acc;
  }, {} as Record<string, typeof snapshot.values>);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "TECHNICAL":
        return colors.primary.main;
      case "PHYSICAL":
        return colors.success.main;
      case "MENTAL":
        return colors.accent.main;
      case "ATTITUDE":
        return colors.warning.main;
      case "GOALKEEPING":
        return colors.info.main;
      default:
        return colors.text.muted;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      variants={sectionVariantsLight}
      initial="offscreen"
      whileInView="onscreen"
      viewport={viewportOnce}
      style={{ marginBottom: spacing.xl }}
    >
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
          <div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs }}>
              Player Analytics
            </h2>
            <p style={{ ...typography.body, color: colors.text.muted }}>
              Latest assessment from {formatDate(snapshot.createdAt)} • {snapshot.createdBy.fullName}
            </p>
          </div>
        </div>

        {/* Readiness Index */}
        {snapshot.readiness && (
          <motion.div
            variants={cardVariants}
            style={{
              background: `linear-gradient(135deg, ${colors.surface.card} 0%, ${colors.surface.soft} 100%)`,
              borderRadius: borderRadius.md,
              padding: spacing.lg,
              marginBottom: spacing.lg,
              border: `2px solid ${colors.accent.main}30`,
            }}
          >
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              Overall Readiness Index
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.md }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: spacing.xs }}>
                  <span style={{ ...typography.body, color: colors.text.secondary }}>Overall</span>
                  <span style={{ ...typography.h3, color: colors.accent.main }}>
                    {snapshot.readiness.overall}/100
                  </span>
                </div>
                <div
                  style={{
                    height: "12px",
                    background: colors.surface.dark,
                    borderRadius: borderRadius.full,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${snapshot.readiness.overall}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{
                      height: "100%",
                      background: `linear-gradient(90deg, ${colors.accent.main} 0%, ${colors.accent.light} 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: spacing.md,
                marginTop: spacing.md,
              }}
            >
              {[
                { label: "Technical", value: snapshot.readiness.technical, color: colors.primary.main },
                { label: "Physical", value: snapshot.readiness.physical, color: colors.success.main },
                { label: "Mental", value: snapshot.readiness.mental, color: colors.accent.main },
                { label: "Attitude", value: snapshot.readiness.attitude, color: colors.warning.main },
                { label: "Tactical", value: snapshot.readiness.tacticalFit, color: colors.info.main },
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: "center" }}>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                    {item.label}
                  </div>
                  <div style={{ ...typography.h4, color: item.color }}>{item.value}/100</div>
                </div>
              ))}
            </div>

            {/* Insights */}
            {snapshot.readiness.explanationJson && (
              <div style={{ marginTop: spacing.lg, paddingTop: spacing.lg, borderTop: `1px solid ${colors.surface.dark}` }}>
                <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.sm }}>
                  Insights
                </h4>
                {snapshot.readiness.explanationJson.topStrengths?.length > 0 && (
                  <div style={{ marginBottom: spacing.sm }}>
                    <div style={{ ...typography.caption, color: colors.success.main, marginBottom: spacing.xs }}>
                      Top Strengths
                    </div>
                    <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                      {snapshot.readiness.explanationJson.topStrengths.join(", ")}
                    </div>
                  </div>
                )}
                {snapshot.readiness.explanationJson.recommendedFocus?.length > 0 && (
                  <div>
                    <div style={{ ...typography.caption, color: colors.warning.main, marginBottom: spacing.xs }}>
                      Areas to Focus
                    </div>
                    <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                      {snapshot.readiness.explanationJson.recommendedFocus.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Positional Suitability */}
        {positional.length > 0 && (
          <motion.div
            variants={cardVariants}
            style={{
              background: colors.surface.card,
              borderRadius: borderRadius.md,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
              Positional Suitability
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.md }}>
              {positional
                .sort((a, b) => b.suitability - a.suitability)
                .map((pos, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: "1 1 120px",
                      padding: spacing.md,
                      background: colors.surface.soft,
                      borderRadius: borderRadius.md,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                      {pos.position}
                    </div>
                    <div style={{ ...typography.h4, color: colors.accent.main }}>{pos.suitability}/100</div>
                    {pos.comment && (
                      <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs, fontSize: typography.fontSize.xs }}>
                        {pos.comment}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Metrics by Category */}
        {Object.entries(metricsByCategory).map(([category, metrics], categoryIdx) => (
          <motion.div
            key={category}
            {...getStaggeredCard(categoryIdx)}
            style={{
              background: colors.surface.card,
              borderRadius: borderRadius.md,
              padding: spacing.lg,
              marginBottom: spacing.lg,
            }}
          >
            <h3
              style={{
                ...typography.h4,
                color: getCategoryColor(category),
                marginBottom: spacing.md,
                display: "flex",
                alignItems: "center",
                gap: spacing.sm,
              }}
            >
              <span>{category}</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: spacing.md }}>
              {metrics.map((metric, idx) => (
                <div key={idx} style={{ padding: spacing.sm, background: colors.surface.soft, borderRadius: borderRadius.sm }}>
                  <div style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xs, fontSize: typography.fontSize.sm }}>
                    {metric.metricDefinition.displayName}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                    <div style={{ ...typography.h4, color: colors.text.primary, flex: 1 }}>
                      {metric.valueNumber}/100
                    </div>
                    {metric.confidence && (
                      <div
                        style={{
                          ...typography.caption,
                          color: colors.text.muted,
                          fontSize: typography.fontSize.xs,
                        }}
                      >
                        {metric.confidence}% conf.
                      </div>
                    )}
                  </div>
                  {metric.comment && (
                    <div
                      style={{
                        ...typography.caption,
                        color: colors.text.muted,
                        marginTop: spacing.xs,
                        fontSize: typography.fontSize.xs,
                        fontStyle: "italic",
                      }}
                    >
                      {metric.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Notes */}
        {snapshot.notes && (
          <motion.div
            variants={cardVariants}
            style={{
              background: colors.surface.card,
              borderRadius: borderRadius.md,
              padding: spacing.lg,
              marginTop: spacing.lg,
            }}
          >
            <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.sm }}>
              Coach Notes
            </h4>
            <p style={{ ...typography.body, color: colors.text.secondary }}>{snapshot.notes}</p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default PlayerMetricsView;


/**
 * Create Metric Snapshot Modal
 * 
 * Allows coaches and admins to create new player metric snapshots
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";

interface MetricDefinition {
  id: number;
  key: string;
  displayName: string;
  category: string;
  minValue: number;
  maxValue: number;
  unit: string;
  isVisibleToPlayer: boolean;
  displayOrder: number;
}

interface CreateMetricSnapshotModalProps {
  studentId: number;
  studentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMetricSnapshotModal: React.FC<CreateMetricSnapshotModalProps> = ({
  studentId,
  studentName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [definitions, setDefinitions] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [sourceContext, setSourceContext] = useState("TRAINING_BLOCK");
  const [notes, setNotes] = useState("");
  const [metricValues, setMetricValues] = useState<Record<string, { value: number; comment?: string }>>({});
  const [positional, setPositional] = useState<Array<{ position: string; suitability: number; comment?: string }>>([]);
  const [traits, setTraits] = useState<Record<string, number>>({});

  const { cardVariants, primaryButtonHover, primaryButtonTap } = useHomepageAnimation();

  useEffect(() => {
    if (isOpen) {
      loadDefinitions();
    }
  }, [isOpen]);

  const loadDefinitions = async () => {
    setLoading(true);
    try {
      const data = await api.getMetricDefinitions();
      setDefinitions(data.definitions || []);
      
      // Initialize metric values with empty state (don't set defaults - user must fill them)
      const initialValues: Record<string, { value: number; comment?: string }> = {};
      setMetricValues(initialValues);
    } catch (err: any) {
      setError(err.message || "Failed to load metric definitions");
    } finally {
      setLoading(false);
    }
  };

  const handleMetricValueChange = (key: string, value: number) => {
    setMetricValues((prev) => {
      // Only add metric if it has a valid value
      if (value !== undefined && value !== null) {
        return {
          ...prev,
          [key]: { ...prev[key], value },
        };
      }
      return prev;
    });
  };

  const handleMetricCommentChange = (key: string, comment: string) => {
    setMetricValues((prev) => ({
      ...prev,
      [key]: { ...prev[key], comment },
    }));
  };

  const handlePositionalChange = (position: string, suitability: number, comment?: string) => {
    setPositional((prev) => {
      const existing = prev.findIndex((p) => p.position === position);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { position, suitability, comment };
        return updated;
      }
      return [...prev, { position, suitability, comment }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Prepare values array - only include metrics that have actual values
      const values = Object.entries(metricValues)
        .filter(([_, data]) => data && data.value !== undefined && data.value !== null && !isNaN(data.value))
        .map(([key, data]) => ({
          metricKey: key,
          value: Number(data.value), // Backend expects 'value', not 'valueNumber'
          comment: data.comment || undefined,
        }));

      // Validate that at least one metric value is provided
      if (values.length === 0) {
        setError("Please provide at least one metric value");
        setSubmitting(false);
        return;
      }

      // Prepare positional array - only include positions with suitability > 0
      // Validate positions match Prisma enum
      const validPositions = ["GK", "CB", "FB", "WB", "DM", "CM", "AM", "W", "ST"];
      const positionalData = positional
        .filter((p) => {
          // Filter out invalid positions and positions with suitability <= 0
          if (!validPositions.includes(p.position)) {
            console.warn(`Invalid position: ${p.position}, skipping`);
            return false;
          }
          return p.suitability > 0;
        })
        .map((p) => ({
          position: p.position,
          suitability: p.suitability,
          comment: p.comment || undefined,
        }));

      // Prepare traits (if any) - only include traits with actual values
      const traitsData = Object.entries(traits)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => ({
          traitKey: key,
          value: value, // Backend expects 'value', not 'score'
        }));

      await api.createPlayerMetricSnapshot({
        studentId,
        sourceContext,
        notes: notes || undefined,
        values,
        positional: positionalData,
        traits: traitsData, // Always send array, even if empty
      });

      // Reset form
      setNotes("");
      setMetricValues({});
      setPositional([]);
      setTraits({});
      
      // Close modal and trigger refresh
      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create metric snapshot");
    } finally {
      setSubmitting(false);
    }
  };

  // Group definitions by category
  const definitionsByCategory = definitions.reduce((acc, def) => {
    if (!acc[def.category]) acc[def.category] = [];
    acc[def.category].push(def);
    return acc;
  }, {} as Record<string, MetricDefinition[]>);

  const categoryColors: Record<string, string> = {
    TECHNICAL: colors.primary.main,
    PHYSICAL: colors.success.main,
    MENTAL: colors.accent.main,
    ATTITUDE: colors.warning.main,
    GOALKEEPING: colors.info.main,
  };

  // Positions must match the Prisma PlayerPosition enum
  const positions = ["GK", "CB", "FB", "WB", "DM", "CM", "AM", "W", "ST"];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.xl,
          overflowY: "auto",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", overflowY: "auto" }}
        >
          <Card variant="default" padding="lg" style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
              <div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs }}>
                  Create Metric Assessment
                </h2>
                <p style={{ ...typography.body, color: colors.text.muted }}>
                  For: {studentName}
                </p>
              </div>
              <Button variant="utility" onClick={onClose} style={{ minWidth: "auto", padding: spacing.sm }}>
                ✕
              </Button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: spacing.xl }}>
                <p style={{ color: colors.text.muted }}>Loading metric definitions...</p>
              </div>
            ) : error && !definitions.length ? (
              <div style={{ padding: spacing.md, background: colors.danger.soft, borderRadius: borderRadius.md, marginBottom: spacing.lg }}>
                <p style={{ color: colors.danger.main }}>{error}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Source Context */}
                <div style={{ marginBottom: spacing.lg }}>
                  <label style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.sm, display: "block" }}>
                    Assessment Context
                  </label>
                  <select
                    value={sourceContext}
                    onChange={(e) => setSourceContext(e.target.value)}
                    style={{
                      width: "100%",
                      padding: spacing.sm,
                      background: colors.surface.card,
                      border: `1px solid ${colors.surface.dark}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.base,
                    }}
                  >
                    <option value="TRAINING_BLOCK">Training Block</option>
                    <option value="MATCH_BLOCK">Match Block</option>
                    <option value="TRIAL">Trial</option>
                    <option value="MONTHLY_REVIEW">Monthly Review</option>
                    <option value="QUARTERLY_ASSESSMENT">Quarterly Assessment</option>
                  </select>
                </div>

                {/* Metrics by Category */}
                {Object.entries(definitionsByCategory).map(([category, defs]) => (
                  <motion.div
                    key={category}
                    variants={cardVariants}
                    style={{
                      marginBottom: spacing.lg,
                      padding: spacing.lg,
                      background: colors.surface.soft,
                      borderRadius: borderRadius.md,
                    }}
                  >
                    <h3
                      style={{
                        ...typography.h4,
                        color: categoryColors[category] || colors.text.primary,
                        marginBottom: spacing.md,
                      }}
                    >
                      {category}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: spacing.md }}>
                      {defs.map((def) => {
                        const currentValue = metricValues[def.key]?.value;
                        return (
                          <div key={def.key}>
                            <label style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xs, display: "block", fontSize: typography.fontSize.sm }}>
                              {def.displayName} ({def.minValue}-{def.maxValue})
                            </label>
                            <input
                              type="range"
                              min={def.minValue}
                              max={def.maxValue}
                              value={currentValue ?? def.minValue}
                              onChange={(e) => handleMetricValueChange(def.key, Number(e.target.value))}
                              style={{ width: "100%", marginBottom: spacing.xs }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: spacing.xs }}>
                              <span style={{ ...typography.caption, color: colors.text.muted }}>
                                {def.minValue}
                              </span>
                              <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                                {currentValue ?? "-"}
                              </span>
                              <span style={{ ...typography.caption, color: colors.text.muted }}>
                                {def.maxValue}
                              </span>
                            </div>
                            <input
                              type="text"
                              placeholder="Optional comment..."
                              value={metricValues[def.key]?.comment || ""}
                              onChange={(e) => handleMetricCommentChange(def.key, e.target.value)}
                              style={{
                                width: "100%",
                                padding: spacing.xs,
                                background: colors.surface.card,
                                border: `1px solid ${colors.surface.dark}`,
                                borderRadius: borderRadius.sm,
                                color: colors.text.primary,
                                fontSize: typography.fontSize.sm,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                {/* Positional Suitability */}
                <div style={{ marginBottom: spacing.lg }}>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                    Positional Suitability
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: spacing.md }}>
                    {positions.map((pos) => {
                      const existing = positional.find((p) => p.position === pos);
                      return (
                        <div key={pos}>
                          <label style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xs, display: "block", fontSize: typography.fontSize.sm }}>
                            {pos}
                          </label>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={existing?.suitability || 0}
                            onChange={(e) => handlePositionalChange(pos, Number(e.target.value))}
                            style={{ width: "100%", marginBottom: spacing.xs }}
                          />
                          <div style={{ textAlign: "center" }}>
                            <span style={{ ...typography.body, color: colors.accent.main, fontWeight: typography.fontWeight.semibold }}>
                              {existing?.suitability || 0}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: spacing.lg }}>
                  <label style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.sm, display: "block" }}>
                    Assessment Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes or observations..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: spacing.sm,
                      background: colors.surface.card,
                      border: `1px solid ${colors.surface.dark}`,
                      borderRadius: borderRadius.md,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.base,
                      fontFamily: typography.fontFamily.body,
                      resize: "vertical",
                    }}
                  />
                </div>

                {error && (
                  <div style={{ padding: spacing.md, background: colors.danger.soft, borderRadius: borderRadius.md, marginBottom: spacing.lg }}>
                    <p style={{ color: colors.danger.main }}>{error}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: spacing.md, justifyContent: "flex-end" }}>
                  <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                    Cancel
                  </Button>
                  <motion.div whileHover={primaryButtonHover} whileTap={primaryButtonTap}>
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? "Creating..." : "Create Assessment"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateMetricSnapshotModal;


import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface WellnessCheck {
  id: number;
  checkDate: string;
  exertionLevel: number;
  muscleSoreness?: number;
  energyLevel: "LOW" | "MEDIUM" | "HIGH";
  comment?: string;
  session?: {
    id: number;
    sessionDate: string;
    startTime: string;
    endTime: string;
  };
}

const WellnessCheck: React.FC = () => {
  const [checks, setChecks] = useState<WellnessCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [exertionLevel, setExertionLevel] = useState(3);
  const [muscleSoreness, setMuscleSoreness] = useState<number | undefined>(undefined);
  const [energyLevel, setEnergyLevel] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadChecks = async () => {
      try {
        setLoading(true);
        const response = await api.getMyWellnessChecks(30); // Last 30 days
        setChecks(response.checks || []);
      } catch (err: any) {
        setError(err.message || "Failed to load wellness checks");
      } finally {
        setLoading(false);
      }
    };
    loadChecks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await api.submitWellnessCheck({
        exertionLevel,
        muscleSoreness,
        energyLevel,
        comment: comment || undefined,
      });
      setSuccess("Wellness check submitted successfully!");
      setShowForm(false);
      setExertionLevel(3);
      setMuscleSoreness(undefined);
      setEnergyLevel("MEDIUM");
      setComment("");
      // Reload checks
      const response = await api.getMyWellnessChecks(30);
      setChecks(response.checks || []);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit wellness check");
    } finally {
      setSubmitting(false);
    }
  };

  const energyLevelColors = {
    LOW: colors.danger.main,
    MEDIUM: colors.warning.main,
    HIGH: colors.success.main,
  };

  const exertionLabels = ["Very Light", "Light", "Moderate", "Hard", "Very Hard"];

  // Check if already submitted today
  const today = new Date().toDateString();
  const todayCheck = checks.find((c) => new Date(c.checkDate).toDateString() === today);

  if (loading) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <p style={{ color: colors.text.muted }}>Loading wellness checks...</p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
        <h2 style={{ ...typography.h3, color: colors.text.primary }}>
          Training Load & Wellness
        </h2>
        {!todayCheck && !showForm && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            Submit Check
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{
        background: colors.surface.soft,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        border: `1px solid ${colors.text.muted}20`,
      }}>
        <p style={{ ...typography.caption, color: colors.text.muted, margin: 0, fontSize: typography.fontSize.sm }}>
          ⚠️ <strong>Non-medical self-report:</strong> This data helps coaches understand your training load and recovery. It does not replace medical advice.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          background: colors.success.soft,
          padding: spacing.md,
          borderRadius: borderRadius.md,
          marginBottom: spacing.lg,
          border: `1px solid ${colors.success.main}40`,
        }}>
          <p style={{ color: colors.success.main, margin: 0 }}>{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: colors.danger.soft,
          padding: spacing.md,
          borderRadius: borderRadius.md,
          marginBottom: spacing.lg,
          border: `1px solid ${colors.danger.main}40`,
        }}>
          <p style={{ color: colors.danger.main, margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && !todayCheck && (
        <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg, background: colors.surface.card }}>
          <form onSubmit={handleSubmit}>
            {/* Exertion Level */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{ ...typography.overline, color: colors.text.primary, display: "block", marginBottom: spacing.sm }}>
                Session Exertion (1-5)
              </label>
              <div style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={exertionLevel}
                  onChange={(e) => setExertionLevel(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ ...typography.body, color: colors.text.secondary, minWidth: "100px" }}>
                  {exertionLevel} - {exertionLabels[exertionLevel - 1]}
                </span>
              </div>
            </div>

            {/* Muscle Soreness */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{ ...typography.overline, color: colors.text.primary, display: "block", marginBottom: spacing.sm }}>
                Muscle Soreness (Optional, 1-5)
              </label>
              <div style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={muscleSoreness || 1}
                  onChange={(e) => setMuscleSoreness(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ ...typography.body, color: colors.text.secondary, minWidth: "100px" }}>
                  {muscleSoreness || "Not set"}
                </span>
              </div>
            </div>

            {/* Energy Level */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{ ...typography.overline, color: colors.text.primary, display: "block", marginBottom: spacing.sm }}>
                Energy Level
              </label>
              <div style={{ display: "flex", gap: spacing.sm }}>
                {(["LOW", "MEDIUM", "HIGH"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setEnergyLevel(level)}
                    style={{
                      flex: 1,
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      border: `2px solid ${energyLevel === level ? energyLevelColors[level] : colors.surface.soft}`,
                      background: energyLevel === level ? energyLevelColors[level] + "20" : colors.surface.soft,
                      color: energyLevel === level ? energyLevelColors[level] : colors.text.secondary,
                      cursor: "pointer",
                      fontWeight: energyLevel === level ? 600 : 400,
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: spacing.md }}>
              <label style={{ ...typography.overline, color: colors.text.primary, display: "block", marginBottom: spacing.sm }}>
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.surface.soft}`,
                  background: colors.surface.section,
                  color: colors.text.primary,
                  fontFamily: typography.fontFamily.body,
                  fontSize: typography.fontSize.base,
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: spacing.sm, justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Already Submitted Today */}
      {todayCheck && (
        <div style={{
          background: colors.success.soft,
          padding: spacing.md,
          borderRadius: borderRadius.md,
          marginBottom: spacing.lg,
          border: `1px solid ${colors.success.main}40`,
        }}>
          <p style={{ color: colors.success.main, margin: 0 }}>
            ✓ You've already submitted a wellness check for today. Check back tomorrow!
          </p>
        </div>
      )}

      {/* Historical Checks */}
      {checks.length > 0 && (
        <div>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Recent Checks (Last 30 Days)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
            {checks.slice(0, 7).map((check) => (
              <div
                key={check.id}
                style={{
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  background: colors.surface.soft,
                  border: `1px solid ${colors.surface.card}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
                  <span style={{ ...typography.body, color: colors.text.primary, fontWeight: 500 }}>
                    {new Date(check.checkDate).toLocaleDateString()}
                  </span>
                  <span style={{
                    ...typography.caption,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.sm,
                    background: energyLevelColors[check.energyLevel] + "20",
                    color: energyLevelColors[check.energyLevel],
                  }}>
                    {check.energyLevel}
                  </span>
                </div>
                <div style={{ display: "flex", gap: spacing.md, fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  <span>Exertion: {check.exertionLevel}/5</span>
                  {check.muscleSoreness && <span>Soreness: {check.muscleSoreness}/5</span>}
                </div>
                {check.comment && (
                  <p style={{ marginTop: spacing.xs, marginBottom: 0, fontSize: typography.fontSize.sm, color: colors.text.secondary, fontStyle: "italic" }}>
                    {check.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {checks.length === 0 && !showForm && (
        <div style={{ textAlign: "center", padding: spacing.xl }}>
          <div style={{ fontSize: "3rem", marginBottom: spacing.md }}>💪</div>
          <p style={{ color: colors.text.secondary }}>
            No wellness checks yet. Submit your first check to track your training load!
          </p>
        </div>
      )}
    </Card>
  );
};

export default WellnessCheck;


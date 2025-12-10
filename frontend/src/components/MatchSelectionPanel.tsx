import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface MatchSelection {
  id: number;
  fixture: {
    id: number;
    matchType: string;
    opponent?: string;
    matchDate: string;
    matchTime?: string;
    venue?: string;
    status: string;
    competition: string;
  };
  selectionStatus: "SELECTED" | "NOT_SELECTED" | "INJURED_UNAVAILABLE" | "RESERVE";
  selectionReason: string | null;
  position?: string;
  role?: string;
}

const MatchSelectionPanel: React.FC = () => {
  const [selections, setSelections] = useState<MatchSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSelections = async () => {
      try {
        setLoading(true);
        const response = await api.getMyMatchSelections();
        setSelections(response.selections || []);
      } catch (err: any) {
        setError(err.message || "Failed to load match selections");
      } finally {
        setLoading(false);
      }
    };
    loadSelections();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SELECTED":
        return colors.success.main;
      case "RESERVE":
        return colors.warning.main;
      case "INJURED_UNAVAILABLE":
        return colors.danger.main;
      case "NOT_SELECTED":
      default:
        return colors.text.muted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SELECTED":
        return "Selected";
      case "RESERVE":
        return "Reserve";
      case "INJURED_UNAVAILABLE":
        return "Unavailable";
      case "NOT_SELECTED":
      default:
        return "Not Selected";
    }
  };

  const getReasonLabel = (reason: string | null) => {
    if (!reason) return null;
    const reasonMap: Record<string, string> = {
      PERFORMANCE_BASED: "Performance-based selection",
      TACTICAL_FIT: "Tactical fit for this match",
      ATTENDANCE_REQUIREMENT: "Attendance requirement met",
      PHYSICAL_READINESS: "Physical readiness",
      SQUAD_ROTATION: "Squad rotation",
      INJURY_RECOVERY: "Injury recovery",
      OTHER: "Other factors",
    };
    return reasonMap[reason] || reason;
  };

  if (loading) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <p style={{ color: colors.text.muted }}>Loading match selections...</p>
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

  if (selections.length === 0) {
    return (
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ textAlign: "center", padding: spacing.xl }}>
          <div style={{ fontSize: "3rem", marginBottom: spacing.md }}>⚽</div>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
            No Match Records Yet
          </h3>
          <p style={{ color: colors.text.secondary }}>
            Your match selection status will appear here once fixtures are scheduled.
          </p>
        </div>
      </Card>
    );
  }

  // Group by status for better organization
  const upcoming = selections.filter((s) => {
    const matchDate = new Date(s.fixture.matchDate);
    return matchDate >= new Date();
  });
  const past = selections.filter((s) => {
    const matchDate = new Date(s.fixture.matchDate);
    return matchDate < new Date();
  });

  return (
    <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
      <h2 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg }}>
        Match Exposure & Selection
      </h2>

      {/* Upcoming Matches */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: spacing.xl }}>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Upcoming Matches
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            {upcoming.map((selection) => (
              <Card
                key={selection.id}
                variant="elevated"
                padding="md"
                style={{
                  background: `linear-gradient(135deg, ${colors.surface.card} 0%, ${colors.surface.soft} 100%)`,
                  border: `1px solid ${getStatusColor(selection.selectionStatus)}40`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                      {selection.fixture.matchType} {selection.fixture.opponent ? `vs ${selection.fixture.opponent}` : ""}
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm, fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      <span>{new Date(selection.fixture.matchDate).toLocaleDateString()}</span>
                      {selection.fixture.matchTime && <span>• {selection.fixture.matchTime}</span>}
                      {selection.fixture.venue && <span>• {selection.fixture.venue}</span>}
                    </div>
                  </div>
                  <span style={{
                    ...typography.caption,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.sm,
                    background: getStatusColor(selection.selectionStatus) + "20",
                    color: getStatusColor(selection.selectionStatus),
                    fontWeight: 600,
                  }}>
                    {getStatusLabel(selection.selectionStatus)}
                  </span>
                </div>
                {selection.selectionReason && (
                  <div style={{
                    marginTop: spacing.sm,
                    padding: spacing.sm,
                    background: colors.surface.soft,
                    borderRadius: borderRadius.sm,
                  }}>
                    <p style={{ ...typography.caption, color: colors.text.secondary, margin: 0, fontSize: typography.fontSize.sm }}>
                      <strong>Reason:</strong> {getReasonLabel(selection.selectionReason)}
                    </p>
                  </div>
                )}
                {selection.position && (
                  <p style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs, marginBottom: 0 }}>
                    Position: {selection.position} {selection.role ? `• ${selection.role}` : ""}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Matches */}
      {past.length > 0 && (
        <div>
          <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Past Matches
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            {past.slice(0, 10).map((selection) => (
              <div
                key={selection.id}
                style={{
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  background: colors.surface.soft,
                  border: `1px solid ${colors.surface.card}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.xs }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ ...typography.body, color: colors.text.primary, fontWeight: 500, marginBottom: spacing.xs }}>
                      {selection.fixture.matchType} {selection.fixture.opponent ? `vs ${selection.fixture.opponent}` : ""}
                    </h4>
                    <p style={{ ...typography.caption, color: colors.text.muted, margin: 0 }}>
                      {new Date(selection.fixture.matchDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    ...typography.caption,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.sm,
                    background: getStatusColor(selection.selectionStatus) + "20",
                    color: getStatusColor(selection.selectionStatus),
                  }}>
                    {getStatusLabel(selection.selectionStatus)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default MatchSelectionPanel;


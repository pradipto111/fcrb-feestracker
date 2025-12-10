import React from "react";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface PlayerIdentityHeaderProps {
  student: {
    fullName: string;
    programType?: string | null;
    status: string;
    center: {
      name: string;
      city?: string;
    };
  };
  attendanceRate?: number;
  currentLevel?: string;
}

const PlayerIdentityHeader: React.FC<PlayerIdentityHeaderProps> = ({
  student,
  attendanceRate,
  currentLevel,
}) => {
  const getAttendanceLabel = (rate?: number) => {
    if (!rate) return null;
    if (rate >= 90) return { label: "Strong", color: colors.success.main };
    if (rate >= 75) return { label: "Good", color: colors.warning.main };
    return { label: "Needs Improvement", color: colors.danger.main };
  };

  const attendanceStatus = getAttendanceLabel(attendanceRate);

  return (
    <Card
      variant="default"
      padding="lg"
      style={{
        marginBottom: spacing.lg,
        background: `linear-gradient(135deg, ${colors.surface.card} 0%, ${colors.surface.elevated} 100%)`,
        border: `1px solid ${colors.primary.main}20`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacing.md,
        }}
      >
        {/* Top Row: Name and Status */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: spacing.md,
          }}
        >
          <div style={{ flex: 1 }}>
            <h1
              style={{
                ...typography.h2,
                marginBottom: spacing.xs,
                color: colors.text.primary,
              }}
            >
              {student.fullName}
            </h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: spacing.sm,
                alignItems: "center",
              }}
            >
              {student.programType && (
                <span
                  style={{
                    ...typography.body,
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.base,
                  }}
                >
                  {student.programType}
                </span>
              )}
              {student.center.name && (
                <>
                  <span style={{ color: colors.text.muted }}>•</span>
                  <span
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.base,
                    }}
                  >
                    {student.center.name}
                  </span>
                </>
              )}
              {student.center.city && (
                <>
                  <span style={{ color: colors.text.muted }}>•</span>
                  <span
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                    }}
                  >
                    {student.center.city}
                  </span>
                </>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              flexWrap: "wrap",
            }}
          >
            {/* Status Badge */}
            <span
              style={{
                ...typography.caption,
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
                background:
                  student.status === "ACTIVE"
                    ? colors.success.soft
                    : student.status === "TRIAL"
                    ? colors.warning.soft
                    : colors.text.muted + "40",
                color:
                  student.status === "ACTIVE"
                    ? colors.success.main
                    : student.status === "TRIAL"
                    ? colors.warning.main
                    : colors.text.muted,
              }}
            >
              {student.status}
            </span>
          </div>
        </div>

        {/* Bottom Row: Additional Info */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing.md,
            paddingTop: spacing.md,
            borderTop: `1px solid ${colors.surface.soft}`,
          }}
        >
          {currentLevel && (
            <div>
              <div
                style={{
                  ...typography.overline,
                  color: colors.text.muted,
                  marginBottom: spacing.xs,
                }}
              >
                Current Level
              </div>
              <div
                style={{
                  ...typography.body,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {currentLevel}
              </div>
            </div>
          )}
          {attendanceStatus && (
            <div>
              <div
                style={{
                  ...typography.overline,
                  color: colors.text.muted,
                  marginBottom: spacing.xs,
                }}
              >
                Attendance
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.xs,
                }}
              >
                <span
                  style={{
                    ...typography.body,
                    color: attendanceStatus.color,
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  {attendanceStatus.label}
                </span>
                {attendanceRate !== undefined && (
                  <span
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                    }}
                  >
                    ({attendanceRate.toFixed(0)}%)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PlayerIdentityHeader;


import React, { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

interface TimelineEvent {
  id?: number;
  eventType: string;
  title: string;
  description?: string;
  eventDate: string;
  icon: string;
  color: string;
  metadata?: any;
  isManual?: boolean;
}

interface PlayerDevelopmentTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
}

const PlayerDevelopmentTimeline: React.FC<PlayerDevelopmentTimelineProps> = ({
  events,
  loading = false,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <Card variant="default" padding="lg">
        <div style={{ textAlign: "center", color: colors.text.muted }}>
          Loading timeline...
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card variant="default" padding="lg">
        <h2
          style={{
            ...typography.h3,
            marginBottom: spacing.md,
            color: colors.text.primary,
          }}
        >
          Player Development Timeline
        </h2>
        <div
          style={{
            textAlign: "center",
            padding: spacing["3xl"],
            color: colors.text.muted,
          }}
        >
          <div style={{ fontSize: typography.fontSize["4xl"], marginBottom: spacing.md }}>📅</div>
          <p style={{ ...typography.body, marginBottom: spacing.sm }}>
            Your development timeline will appear here as you progress.
          </p>
          <p style={{ ...typography.body, fontSize: typography.fontSize.sm }}>
            Keep training consistently to unlock milestones!
          </p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card variant="default" padding="lg">
      <h2
        style={{
          ...typography.h3,
          marginBottom: spacing.lg,
          color: colors.text.primary,
        }}
      >
        Player Development Timeline
      </h2>
      <p
        style={{
          ...typography.body,
          color: colors.text.muted,
          fontSize: typography.fontSize.sm,
          marginBottom: spacing.xl,
        }}
      >
        Your journey at FC Real Bengaluru - milestones, achievements, and growth moments.
      </p>

      {/* Timeline */}
      <div
        style={{
          position: "relative",
          paddingLeft: isMobile ? spacing.lg : spacing.xl,
        }}
      >
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: isMobile ? spacing.sm + 10 : spacing.md + 12,
            top: 0,
            bottom: 0,
            width: 2,
            background: `linear-gradient(to bottom, ${colors.primary.main}40, ${colors.accent.main}40)`,
            borderRadius: borderRadius.sm,
          }}
        />

        {/* Events */}
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
          {events.map((event, index) => (
            <div
              key={event.id || index}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                gap: spacing.md,
              }}
            >
              {/* Icon/Node */}
              <div
                style={{
                  position: "absolute",
                  left: isMobile ? -spacing.lg + spacing.sm - 10 : -spacing.xl + spacing.md - 12,
                  width: isMobile ? 20 : 24,
                  height: isMobile ? 20 : 24,
                  borderRadius: "50%",
                  background: event.color,
                  border: `3px solid ${colors.surface.section}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? typography.fontSize.xs : typography.fontSize.sm,
                  flexShrink: 0,
                  zIndex: 2,
                  boxShadow: `0 2px 8px ${event.color}40`,
                }}
              >
                {event.icon}
              </div>

              {/* Event Card */}
              <Card
                variant="elevated"
                padding="md"
                style={{
                  flex: 1,
                  marginLeft: spacing.md,
                  borderLeft: `3px solid ${event.color}`,
                  background: `linear-gradient(135deg, ${colors.surface.card} 0%, ${event.color}10 100%)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: spacing.md,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        ...typography.h5,
                        color: colors.text.primary,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {event.title}
                    </h3>
                    {event.description && (
                      <p
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          fontSize: typography.fontSize.sm,
                          marginBottom: spacing.xs,
                        }}
                      >
                        {event.description}
                      </p>
                    )}
                    {event.metadata && (
                      <div
                        style={{
                          display: "flex",
                          gap: spacing.sm,
                          flexWrap: "wrap",
                          marginTop: spacing.xs,
                        }}
                      >
                        {event.metadata.attendanceRate && (
                          <span
                            style={{
                              ...typography.caption,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: colors.success.soft,
                              color: colors.success.main,
                              borderRadius: borderRadius.md,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            {Math.round(event.metadata.attendanceRate)}% Attendance
                          </span>
                        )}
                        {event.metadata.sessionCount && (
                          <span
                            style={{
                              ...typography.caption,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: colors.info.soft,
                              color: colors.info.main,
                              borderRadius: borderRadius.md,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            {event.metadata.sessionCount} Sessions
                          </span>
                        )}
                        {event.metadata.matchType && (
                          <span
                            style={{
                              ...typography.caption,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: colors.primary.soft,
                              color: colors.primary.main,
                              borderRadius: borderRadius.md,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            {event.metadata.matchType}
                          </span>
                        )}
                        {event.metadata.position && (
                          <span
                            style={{
                              ...typography.caption,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: colors.accent.soft,
                              color: colors.accent.main,
                              borderRadius: borderRadius.md,
                              fontSize: typography.fontSize.xs,
                            }}
                          >
                            {event.metadata.position}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.xs,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(event.eventDate)}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PlayerDevelopmentTimeline;


import React from "react";
import { colors, spacing, typography, borderRadius, shadows } from "../../theme/design-tokens";

export type CrmLead = {
  id: string;
  sourceType: "WEBSITE" | "LEGACY" | "CHECKOUT" | "FAN" | "MANUAL";
  sourceId: number;
  primaryName: string;
  phone?: string | null;
  email?: string | null;
  preferredCentre?: string | null;
  programmeInterest?: string | null;
  stage: "NEW" | "CONTACTED" | "FOLLOW_UP" | "WILL_JOIN" | "JOINED" | "UNINTERESTED_NO_RESPONSE";
  status: "OPEN" | "CLOSED";
  priority: number;
  ownerId?: number | null;
  owner?: { id: number; fullName: string } | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

type LeadCardProps = {
  lead: CrmLead;
  onClick: () => void;
  isSelected?: boolean;
  hasOverdueFollowUp?: boolean;
  isHot?: boolean;
  lastActivityTime?: string;
};

const getPriorityColor = (priority: number) => {
  switch (priority) {
    case 0:
      return colors.danger.main; // P0 = red
    case 1:
      return colors.warning.main; // P1 = orange
    case 2:
      return colors.accent.main; // P2 = yellow
    default:
      return colors.text.muted; // P3 = muted
  }
};

const getStageColor = (stage: CrmLead["stage"]) => {
  switch (stage) {
    case "NEW":
      return colors.primary.main;
    case "CONTACTED":
      return colors.info.main;
    case "FOLLOW_UP":
      return colors.warning.main;
    case "WILL_JOIN":
      return colors.accent.main;
    case "JOINED":
      return colors.success.main;
    case "UNINTERESTED_NO_RESPONSE":
      return colors.text.muted;
    default:
      return colors.text.muted;
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onClick,
  isSelected = false,
  hasOverdueFollowUp = false,
  isHot = false,
  lastActivityTime,
}) => {
  const priorityColor = getPriorityColor(lead.priority);
  const stageColor = getStageColor(lead.stage);
  const displayTime = lastActivityTime || lead.updatedAt;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        background: isSelected
          ? `linear-gradient(135deg, rgba(245, 179, 0, 0.2) 0%, rgba(245, 179, 0, 0.1) 100%)`
          : hasOverdueFollowUp
          ? `linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)`
          : isHot
          ? `linear-gradient(135deg, rgba(245, 179, 0, 0.12) 0%, rgba(245, 179, 0, 0.05) 100%)`
          : "rgba(8, 12, 24, 0.6)",
        border: isSelected
          ? `2px solid ${colors.accent.main}`
          : hasOverdueFollowUp
          ? `2px solid ${colors.danger.main}`
          : isHot
          ? `1px solid ${colors.accent.main}60`
          : `1px solid rgba(255, 255, 255, 0.1)`,
        borderLeft: `4px solid ${priorityColor}`,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        boxShadow: isSelected ? shadows.cardHover : shadows.card,
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = shadows.cardHover;
          e.currentTarget.style.borderColor = hasOverdueFollowUp
            ? colors.danger.main
            : isHot
            ? `${colors.accent.main}80`
            : `${stageColor}60`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = shadows.card;
          e.currentTarget.style.borderColor = hasOverdueFollowUp
            ? `2px solid ${colors.danger.main}`
            : isHot
            ? `1px solid ${colors.accent.main}60`
            : `1px solid rgba(255, 255, 255, 0.1)`;
        }
      }}
    >
      {/* Status indicators */}
      <div
        style={{
          position: "absolute",
          top: spacing.xs,
          right: spacing.xs,
          display: "flex",
          gap: spacing.xs,
          alignItems: "center",
        }}
      >
        {hasOverdueFollowUp && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors.danger.main,
              boxShadow: `0 0 8px ${colors.danger.main}`,
              animation: "pulse 2s infinite",
            }}
            title="Overdue follow-up"
          />
        )}
        {isHot && (
          <div
            style={{
              fontSize: "1rem",
              filter: "drop-shadow(0 0 4px rgba(245, 179, 0, 0.8))",
            }}
            title="Hot lead"
          >
            🔥
          </div>
        )}
      </div>

      {/* Header: Name and Priority */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: spacing.xs,
          marginBottom: spacing.xs,
          paddingRight: spacing.md,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...typography.h4,
              fontSize: "0.875rem",
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
            }}
          >
            {lead.primaryName}
          </div>
        </div>
        <div
          style={{
            ...typography.caption,
            color: priorityColor,
            fontWeight: typography.fontWeight.bold,
            whiteSpace: "nowrap",
            padding: `2px ${spacing.xs}`,
            borderRadius: borderRadius.sm,
            background: `${priorityColor}20`,
            border: `1px solid ${priorityColor}40`,
            fontSize: "0.7rem",
          }}
        >
          P{lead.priority}
        </div>
      </div>

      {/* Contact info - single line when present */}
      {(lead.phone || lead.email) && (
        <div
          style={{
            ...typography.caption,
            color: colors.text.secondary,
            marginBottom: spacing.xs,
            fontSize: "0.7rem",
            display: "flex",
            gap: spacing.sm,
            flexWrap: "wrap",
          }}
        >
          {lead.phone && <span>📞 {lead.phone}</span>}
          {lead.email && <span>✉️ {lead.email}</span>}
        </div>
      )}

      {/* Footer: Owner and Last Activity */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: spacing.xs,
          paddingTop: spacing.xs,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          {lead.owner ? (
            <>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.accent.main}, ${colors.accent.light})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...typography.caption,
                  color: colors.text.onAccent,
                  fontWeight: typography.fontWeight.bold,
                  fontSize: "0.6rem",
                  boxShadow: shadows.card,
                }}
              >
                {getInitials(lead.owner.fullName)}
              </div>
              <span
                style={{
                  ...typography.caption,
                  color: colors.text.secondary,
                  fontSize: "0.7rem",
                  fontWeight: typography.fontWeight.medium,
                }}
              >
                {lead.owner.fullName.split(" ")[0]}
              </span>
            </>
          ) : (
            <span
              style={{
                ...typography.caption,
                color: colors.text.muted,
                fontSize: "0.7rem",
                fontStyle: "italic",
              }}
            >
              Unassigned
            </span>
          )}
        </div>
        <span
          style={{
            ...typography.caption,
            color: colors.text.muted,
            fontSize: "0.65rem",
          }}
        >
          {formatRelativeTime(displayTime)}
        </span>
      </div>
    </div>
  );
};

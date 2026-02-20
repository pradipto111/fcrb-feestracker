import React, { useState, useEffect } from "react";
import { colors, spacing, typography, borderRadius, shadows } from "../../theme/design-tokens";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CrmLead } from "./LeadCard";
import { api } from "../../api/client";

type CrmTask = {
  id: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  status: "OPEN" | "DONE" | "CANCELLED";
};

type CrmActivity = {
  id: string;
  type: string;
  title?: string | null;
  body?: string | null;
  occurredAt: string;
  createdByCrmUser?: { fullName: string } | null;
};

type LeadDetailSidePanelProps = {
  lead: CrmLead | null;
  users: Array<{ id: number; fullName: string; role: string }>;
  stages: string[];
  onClose: () => void;
  onUpdate: (id: string, updates: any) => Promise<void>;
  onStageChange: (id: string, newStage: string, nextAction?: { type: string; scheduledAt?: string; notes?: string }) => Promise<void>;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "CALL":
      return "📞";
    case "EMAIL":
      return "📧";
    case "WHATSAPP":
      return "💬";
    case "MEETING":
      return "🤝";
    case "NOTE":
      return "📝";
    case "STAGE_CHANGED":
      return "➡️";
    case "STATUS_CHANGED":
      return "🔄";
    case "OWNER_CHANGED":
      return "👤";
    default:
      return "•";
  }
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString();
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

export const LeadDetailSidePanel: React.FC<LeadDetailSidePanelProps> = ({
  lead,
  users,
  stages,
  onClose,
  onUpdate,
  onStageChange,
}) => {
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [nextActionType, setNextActionType] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");
  const [nextActionNotes, setNextActionNotes] = useState("");
  const [pendingStageChange, setPendingStageChange] = useState<string | null>(null);

  useEffect(() => {
    if (!lead) {
      setTasks([]);
      setActivities([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [tasksData, activitiesData] = await Promise.all([
          api.crmGetTasks({ leadId: lead.id }).catch(() => []),
          api.crmGetLeadActivities(lead.id).catch(() => []),
        ]);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
      } catch (error) {
        console.error("Failed to load lead details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lead?.id]);

  if (!lead) return null;

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return;
    try {
      await api.crmCreateTask({
        leadId: lead.id,
        title: taskTitle.trim(),
        dueAt: taskDueAt ? new Date(taskDueAt).toISOString() : undefined,
      });
      setTaskTitle("");
      setTaskDueAt("");
      const updated = await api.crmGetTasks({ leadId: lead.id }).catch(() => []);
      setTasks(Array.isArray(updated) ? updated : []);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleAddNote = async () => {
    if (!noteBody.trim()) return;
    try {
      await api.crmCreateLeadActivity(lead.id, {
        type: "NOTE",
        title: "Note",
        body: noteBody.trim(),
      });
      setNoteBody("");
      const updated = await api.crmGetLeadActivities(lead.id).catch(() => []);
      setActivities(Array.isArray(updated) ? updated : []);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (newStage === lead.stage) return;
    
    // If moving to a new stage, require next action
    setPendingStageChange(newStage);
    // The parent component should handle the prompt
    // For now, we'll just update
    await onStageChange(lead.id, newStage);
  };

  const handleSaveNextAction = async () => {
    if (!nextActionType.trim()) return;
    if (pendingStageChange) {
      await onStageChange(lead.id, pendingStageChange, {
        type: nextActionType,
        scheduledAt: nextActionDate || undefined,
        notes: nextActionNotes || undefined,
      });
      setPendingStageChange(null);
      setNextActionType("");
      setNextActionDate("");
      setNextActionNotes("");
    }
  };

  const overdueTasks = tasks.filter((t) => t.status === "OPEN" && t.dueAt && new Date(t.dueAt) < new Date());

  return (
    <Card
      variant="elevated"
      padding="xl"
      style={{
        position: "sticky",
        top: spacing.xl,
        height: "fit-content",
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
        borderRadius: borderRadius.xl,
        background: "linear-gradient(135deg, rgba(8, 12, 24, 0.9) 0%, rgba(8, 12, 24, 0.7) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: shadows.cardHover,
        scrollbarWidth: "thin",
        scrollbarColor: `${colors.primary.main}40 rgba(255,255,255,0.1)`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing.xl,
          paddingBottom: spacing.lg,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              ...typography.h3,
              color: colors.text.primary,
              marginBottom: spacing.xs,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            {lead.primaryName}
          </div>
          <div
            style={{
              ...typography.caption,
              color: colors.text.muted,
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <span>{lead.sourceType}</span>
            <span>•</span>
            <span>#{lead.sourceId}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: colors.text.muted,
            cursor: "pointer",
            fontSize: 20,
            lineHeight: 1,
            padding: spacing.sm,
            borderRadius: borderRadius.md,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.color = colors.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = colors.text.muted;
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Lead Summary */}
      <div style={{ marginBottom: spacing.xl }}>
        <div
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.bold,
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <span>📋</span>
          <span>Summary</span>
        </div>
        <div style={{ display: "grid", gap: spacing.sm }}>
          <div>
            <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
              Contact
            </div>
            <div style={{ ...typography.body, color: colors.text.primary }}>
              {lead.phone || "—"} {lead.email ? ` • ${lead.email}` : ""}
            </div>
          </div>
          {lead.preferredCentre && (
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Preferred Centre
              </div>
              <div style={{ ...typography.body, color: colors.text.primary }}>{lead.preferredCentre}</div>
            </div>
          )}
          {lead.programmeInterest && (
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Programme Interest
              </div>
              <div style={{ ...typography.body, color: colors.text.primary }}>{lead.programmeInterest}</div>
            </div>
          )}
          <div>
            <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
              Tags
            </div>
            <input
              defaultValue={lead.tags?.join(", ") || ""}
              placeholder="Comma-separated tags"
              style={{
                width: "100%",
                padding: spacing.md,
                background: "rgba(8, 12, 24, 0.6)",
                border: `1px solid rgba(255, 255, 255, 0.15)`,
                borderRadius: borderRadius.lg,
                color: colors.text.primary,
                ...typography.body,
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent.main;
                e.target.style.background = "rgba(8, 12, 24, 0.8)";
                e.target.style.boxShadow = `0 0 0 3px ${colors.accent.main}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.target.style.background = "rgba(8, 12, 24, 0.6)";
                e.target.style.boxShadow = "none";
                // Also trigger the update
                onUpdate(lead.id, {
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: `${spacing.lg} 0` }} />

      {/* Status & Ownership */}
      <div style={{ marginBottom: spacing.xl }}>
        <div
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.bold,
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <span>⚙️</span>
          <span>Status & Ownership</span>
        </div>
        <div style={{ display: "grid", gap: spacing.md }}>
          <div>
            <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
              Stage
            </div>
            <select
              value={lead.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              style={{
                width: "100%",
                padding: spacing.md,
                background: "rgba(8, 12, 24, 0.6)",
                border: `1px solid rgba(255, 255, 255, 0.15)`,
                borderRadius: borderRadius.lg,
                color: colors.text.primary,
                ...typography.body,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent.main;
                e.target.style.boxShadow = `0 0 0 3px ${colors.accent.main}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.target.style.boxShadow = "none";
              }}
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
              Owner
            </div>
            <select
              value={lead.ownerId ?? ""}
              onChange={(e) =>
                onUpdate(lead.id, {
                  ownerId: e.target.value ? Number(e.target.value) : null,
                })
              }
              style={{
                width: "100%",
                padding: spacing.md,
                background: "rgba(8, 12, 24, 0.6)",
                border: `1px solid rgba(255, 255, 255, 0.15)`,
                borderRadius: borderRadius.lg,
                color: colors.text.primary,
                ...typography.body,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent.main;
                e.target.style.boxShadow = `0 0 0 3px ${colors.accent.main}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Unassigned</option>
              {users
                .filter((u) => u.role !== "DISABLED")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
              Priority
            </div>
            <select
              value={lead.priority}
              onChange={(e) =>
                onUpdate(lead.id, {
                  priority: Number(e.target.value),
                })
              }
              style={{
                width: "100%",
                padding: spacing.md,
                background: "rgba(8, 12, 24, 0.6)",
                border: `1px solid rgba(255, 255, 255, 0.15)`,
                borderRadius: borderRadius.lg,
                color: colors.text.primary,
                ...typography.body,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.accent.main;
                e.target.style.boxShadow = `0 0 0 3px ${colors.accent.main}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.target.style.boxShadow = "none";
              }}
            >
              {[0, 1, 2, 3].map((p) => (
                <option key={p} value={p}>
                  P{p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: `${spacing.lg} 0` }} />

      {/* Next Action (mandatory when status changes) */}
      {pendingStageChange && (
        <div style={{ marginBottom: spacing.lg, padding: spacing.md, background: "rgba(245, 179, 0, 0.1)", borderRadius: borderRadius.lg, border: `1px solid ${colors.accent.main}` }}>
          <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
            Next Action Required
          </div>
          <div style={{ display: "grid", gap: spacing.md }}>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Action Type *
              </div>
              <select
                value={nextActionType}
                onChange={(e) => setNextActionType(e.target.value)}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  background: colors.surface.card,
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  ...typography.body,
                }}
              >
                <option value="">Select action...</option>
                <option value="CALL">Call</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="EMAIL">Email</option>
                <option value="MEETING">Meeting</option>
                <option value="FOLLOW_UP">Follow-up</option>
              </select>
            </div>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Scheduled Date/Time
              </div>
              <input
                type="datetime-local"
                value={nextActionDate}
                onChange={(e) => setNextActionDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  background: colors.surface.card,
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  ...typography.body,
                }}
              />
            </div>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                Notes
              </div>
              <textarea
                value={nextActionNotes}
                onChange={(e) => setNextActionNotes(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  background: colors.surface.card,
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  ...typography.body,
                  resize: "vertical",
                }}
              />
            </div>
            <Button variant="primary" onClick={handleSaveNextAction} disabled={!nextActionType.trim()}>
              Save & Update Stage
            </Button>
            <Button variant="secondary" onClick={() => setPendingStageChange(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: `${spacing.lg} 0` }} />

      {/* Tasks */}
      <div style={{ marginBottom: spacing.xl }}>
        <div
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.bold,
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <span>✅</span>
          <span>Tasks</span>
          {overdueTasks.length > 0 && (
            <span
              style={{
                ...typography.caption,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: borderRadius.full,
                background: `${colors.danger.main}20`,
                color: colors.danger.main,
                fontSize: "0.75rem",
                fontWeight: typography.fontWeight.bold,
              }}
            >
              {overdueTasks.length} Overdue
            </span>
          )}
        </div>
        <div style={{ display: "grid", gap: spacing.sm, marginBottom: spacing.md }}>
          {tasks.length === 0 ? (
            <div style={{ ...typography.caption, color: colors.text.muted }}>No tasks yet.</div>
          ) : (
            tasks.map((task) => {
              const isOverdue = task.status === "OPEN" && task.dueAt && new Date(task.dueAt) < new Date();
              return (
                <div
                  key={task.id}
                  style={{
                    padding: spacing.md,
                    borderRadius: borderRadius.lg,
                    border: isOverdue ? `1px solid ${colors.danger.main}` : "1px solid rgba(255,255,255,0.08)",
                    background: isOverdue ? "rgba(239, 68, 68, 0.1)" : "rgba(8, 12, 24, 0.3)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.sm }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                          {task.description}
                        </div>
                      )}
                      <div style={{ ...typography.caption, color: isOverdue ? colors.danger.main : colors.text.muted, marginTop: spacing.xs }}>
                        {task.status} {task.dueAt ? ` • Due ${formatDateTime(task.dueAt)}` : ""}
                        {isOverdue && " (OVERDUE)"}
                      </div>
                    </div>
                    {task.status !== "DONE" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          await api.crmUpdateTask(task.id, { status: "DONE" });
                          const updated = await api.crmGetTasks({ leadId: lead.id }).catch(() => []);
                          setTasks(Array.isArray(updated) ? updated : []);
                        }}
                      >
                        Done
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ display: "grid", gap: spacing.sm }}>
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="New task (e.g. Call tomorrow)"
            style={{
              width: "100%",
              padding: spacing.sm,
              background: colors.surface.card,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              borderRadius: borderRadius.md,
              color: colors.text.primary,
              ...typography.body,
            }}
          />
          <input
            type="datetime-local"
            value={taskDueAt}
            onChange={(e) => setTaskDueAt(e.target.value)}
            style={{
              width: "100%",
              padding: spacing.sm,
              background: colors.surface.card,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              borderRadius: borderRadius.md,
              color: colors.text.primary,
              ...typography.body,
            }}
          />
          <Button variant="primary" onClick={handleAddTask} disabled={!taskTitle.trim()}>
            Add Task
          </Button>
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: `${spacing.lg} 0` }} />

      {/* Activity Timeline */}
      <div style={{ marginBottom: spacing.xl }}>
        <div
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.bold,
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <span>📝</span>
          <span>Activity Timeline</span>
        </div>
        <div style={{ display: "grid", gap: spacing.sm }}>
          {activities.length === 0 ? (
            <div style={{ ...typography.caption, color: colors.text.muted }}>No activity yet.</div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  padding: spacing.md,
                  borderRadius: borderRadius.lg,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(8, 12, 24, 0.3)",
                }}
              >
                <div style={{ display: "flex", gap: spacing.sm, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{getActivityIcon(activity.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
                      {activity.type} • {formatRelativeTime(activity.occurredAt)}
                      {activity.createdByCrmUser && ` • ${activity.createdByCrmUser.fullName}`}
                    </div>
                    <div style={{ ...typography.body, color: colors.text.primary }}>
                      {activity.body || activity.title || "—"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: `${spacing.lg} 0` }} />

      {/* Internal Notes */}
      <div>
        <div
          style={{
            ...typography.h4,
            color: colors.text.primary,
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.bold,
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <span>💬</span>
          <span>Internal Notes</span>
        </div>
        <div style={{ display: "grid", gap: spacing.sm }}>
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Add a note…"
            rows={4}
            style={{
              width: "100%",
              padding: spacing.md,
              background: "rgba(8, 12, 24, 0.6)",
              border: `1px solid rgba(255, 255, 255, 0.15)`,
              borderRadius: borderRadius.lg,
              color: colors.text.primary,
              ...typography.body,
              fontSize: "0.9rem",
              resize: "vertical",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.accent.main;
              e.target.style.background = "rgba(8, 12, 24, 0.8)";
              e.target.style.boxShadow = `0 0 0 3px ${colors.accent.main}20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.target.style.background = "rgba(8, 12, 24, 0.6)";
              e.target.style.boxShadow = "none";
            }}
          />
          <Button variant="secondary" onClick={handleAddNote} disabled={!noteBody.trim()}>
            Add Note
          </Button>
        </div>
      </div>
    </Card>
  );
};

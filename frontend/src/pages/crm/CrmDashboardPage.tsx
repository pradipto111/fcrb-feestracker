import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { colors, spacing, typography, borderRadius } from "../../theme/design-tokens";
import { pageVariants } from "../../utils/motion";
import { TopPerformanceStrip, CrmAnalyticsSummary } from "../../components/crm/TopPerformanceStrip";
import { LeadFunnelBoard, getStageColor, formatStageName } from "../../components/crm/LeadFunnelBoard";
import { LeadDetailSidePanel } from "../../components/crm/LeadDetailSidePanel";
import { AddLeadModal } from "../../components/crm/AddLeadModal";
import { CrmLead } from "../../components/crm/LeadCard";

type CrmUser = {
  id: number;
  fullName: string;
  email: string;
  role: "AGENT";
  status: "ACTIVE" | "DISABLED";
};

type CrmSettings = {
  stages: string[];
  tags: string[];
  slaHoursByStage: Record<string, number>;
  assignmentRules: {
    mode: "MANUAL" | "ROUND_ROBIN";
    roundRobinUserIds: number[];
  };
};

type CrmAgentAnalytics = {
  userId: number;
  fullName: string;
  role: "AGENT";
  status: "ACTIVE" | "DISABLED";
  conversionsToday: number;
  conversionsWeek: number;
  touchesToday: number;
  touchesWeek: number;
  movesToday: number;
  movesWeek: number;
  openLeads: number;
};

const DEFAULT_STAGES = ["NEW", "CONTACTED", "FOLLOW_UP", "WILL_JOIN", "JOINED", "UNINTERESTED_NO_RESPONSE"];

const CrmDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [users, setUsers] = useState<CrmUser[]>([]);
  const [selected, setSelected] = useState<CrmLead | null>(null);
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState<CrmSettings>({
    stages: DEFAULT_STAGES,
    tags: [],
    slaHoursByStage: {},
    assignmentRules: { mode: "MANUAL", roundRobinUserIds: [] },
  });
  const [analyticsSummary, setAnalyticsSummary] = useState<CrmAnalyticsSummary | null>(null);
  const [agentAnalytics, setAgentAnalytics] = useState<CrmAgentAnalytics[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "CRM" && user.crmRole === "AGENT";

  // Load leads and settings
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [rows, crmUsers, crmSettings] = await Promise.all([
        api.crmGetLeads({ limit: 500, search: search || undefined }).catch(() => []),
        api.crmListUsers().catch(() => []),
        api.crmGetSettings().catch(() => null),
      ]);
      setLeads(Array.isArray(rows) ? rows : []);
      setUsers(Array.isArray(crmUsers) ? crmUsers : []);
      if (crmSettings) {
        setSettings({
          stages: Array.isArray(crmSettings.stages) ? crmSettings.stages : DEFAULT_STAGES,
          tags: Array.isArray(crmSettings.tags) ? crmSettings.tags : [],
          slaHoursByStage: crmSettings.slaHoursByStage || {},
          assignmentRules: crmSettings.assignmentRules || { mode: "MANUAL", roundRobinUserIds: [] },
        });
      }
    } catch (e: any) {
      setError(e.message || "Failed to load CRM leads");
    } finally {
      setLoading(false);
    }
  };

  // Load analytics (for admins)
  const loadAnalytics = async () => {
    if (!isAdmin) return;
    try {
      const [summary, agents] = await Promise.all([
        api.crmAnalyticsSummary().catch(() => null),
        api.crmAnalyticsAgents().catch(() => []),
      ]);
      setAnalyticsSummary(summary);
      setAgentAnalytics(Array.isArray(agents) ? agents : []);
    } catch {
      // ignore
    }
  };

  // Load tasks for overdue detection
  const loadTasks = async () => {
    try {
      const allTasks = await api.crmGetTasks().catch(() => []);
      setTasks(Array.isArray(allTasks) ? allTasks : []);
    } catch {
      // ignore
    }
  };

  // Load activities for last activity time
  const loadActivities = async () => {
    try {
      // We'll load activities per lead as needed, but we can preload some
      // For now, we'll load them on demand
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    loadAnalytics();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Refresh analytics when leads change
  useEffect(() => {
    loadAnalytics();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads.length]);

  const stageOrder = useMemo(
    () => (settings.stages && settings.stages.length ? settings.stages : DEFAULT_STAGES),
    [settings.stages]
  );

  // Filter leads based on filterType
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (filterType === "conversions") {
      filtered = filtered.filter((l) => l.stage === "JOINED");
    } else if (filterType === "touches") {
      // Leads with recent activities (we'd need to check activities, for now show all)
      // This is a simplified version
    } else if (filterType === "moves") {
      // Leads that moved stages recently (simplified)
    } else if (filterType === "overdue") {
      const overdueLeadIds = new Set(
        tasks
          .filter((t) => t.status === "OPEN" && t.dueAt && new Date(t.dueAt) < new Date())
          .map((t) => t.leadId)
      );
      filtered = filtered.filter((l) => overdueLeadIds.has(l.id));
    } else if (filterType === "hot") {
      filtered = filtered.filter((l) => (l.priority === 0 || l.priority === 1) && (l.stage === "NEW" || l.stage === "CONTACTED" || l.stage === "FOLLOW_UP"));
    }

    return filtered;
  }, [leads, filterType, tasks]);

  // Calculate lead counts by stage
  const leadsByStageCount = useMemo(() => {
    const counts: Record<string, number> = {};
    stageOrder.forEach((stage) => {
      counts[stage] = 0;
    });
    filteredLeads.forEach((lead) => {
      const stage = lead.stage || "NEW";
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [filteredLeads, stageOrder]);

  // Filter leads and stages based on selectedStage
  const boardLeads = useMemo(() => {
    if (selectedStage === null) {
      return filteredLeads;
    }
    return filteredLeads.filter((l) => (l.stage || "NEW") === selectedStage);
  }, [filteredLeads, selectedStage]);

  const boardStages = useMemo(() => {
    if (selectedStage === null) {
      return stageOrder;
    }
    return [selectedStage];
  }, [stageOrder, selectedStage]);

  // Helper functions for LeadFunnelBoard
  const getOverdueFollowUps = (leadId: string): boolean => {
    return tasks.some(
      (t) => t.leadId === leadId && t.status === "OPEN" && t.dueAt && new Date(t.dueAt) < new Date()
    );
  };

  const getIsHot = (lead: CrmLead): boolean => {
    return (lead.priority === 0 || lead.priority === 1) && (lead.stage === "NEW" || lead.stage === "CONTACTED" || lead.stage === "FOLLOW_UP");
  };

  const getLastActivityTime = (leadId: string): string | undefined => {
    // This would ideally come from activities, but for now we'll use updatedAt
    const lead = leads.find((l) => l.id === leadId);
    return lead?.updatedAt;
  };

  // Handle lead update
  const handleUpdateLead = async (id: string, updates: any) => {
    try {
      const updated = await api.crmUpdateLead(id, updates);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
      if (selected?.id === id) {
        setSelected({ ...selected, ...updated });
      }
      await loadAnalytics();
      await loadTasks();
    } catch (error) {
      console.error("Failed to update lead:", error);
    }
  };

  // Handle lead move (drag-drop)
  const handleLeadMove = async (
    leadId: string,
    newStage: string,
    nextAction?: { type: string; scheduledAt?: string; notes?: string }
  ) => {
    try {
      const updated = await api.crmUpdateLead(leadId, {
        stage: newStage,
        nextAction,
      });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...updated } : l)));
      if (selected?.id === leadId) {
        setSelected({ ...selected, ...updated });
      }
      await loadAnalytics();
      await loadTasks();
    } catch (error) {
      console.error("Failed to move lead:", error);
    }
  };

  // Handle stage change from side panel
  const handleStageChange = async (
    leadId: string,
    newStage: string,
    nextAction?: { type: string; scheduledAt?: string; notes?: string }
  ) => {
    await handleLeadMove(leadId, newStage, nextAction);
  };

  // Handle metric click (filter)
  const handleMetricClick = (clickedFilter: string) => {
    if (filterType === clickedFilter) {
      setFilterType(null); // Toggle off if already active
    } else {
      setFilterType(clickedFilter);
    }
  };

  // Handle stage CTA click
  const handleStageClick = (stage: string) => {
    if (selectedStage === stage) {
      setSelectedStage(null); // Toggle off if already selected
    } else {
      setSelectedStage(stage);
    }
  };

  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader
        title="CRM Pipeline"
        subtitle={
          isAgent
            ? "Your assigned leads and tasks"
            : isAdmin
            ? "Team-wide lead pipeline and performance"
            : "Unified leads across website, legacy, checkout, and fan club"
        }
      />

      {/* Top Performance Strip (for admins) */}
      {isAdmin && (
        <Card
          variant="elevated"
          padding="xl"
          style={{
            marginTop: spacing.xl,
            background: "linear-gradient(135deg, rgba(8, 12, 24, 0.8) 0%, rgba(8, 12, 24, 0.6) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: spacing.md,
              flexWrap: "wrap",
              marginBottom: spacing.xl,
            }}
          >
            <div>
              <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs }}>
                Performance Dashboard
              </div>
              <div style={{ ...typography.body, color: colors.text.muted, fontSize: "0.9rem" }}>
                Click any metric to filter the pipeline board
              </div>
            </div>
            <Button variant="secondary" onClick={loadAnalytics}>
              🔄 Refresh
            </Button>
          </div>
          <TopPerformanceStrip analytics={analyticsSummary} onMetricClick={handleMetricClick} loading={loading} />

          {/* Agent Performance Table (for admins) */}
          {agentAnalytics.length > 0 && (
            <div style={{ marginTop: spacing.xl, paddingTop: spacing.xl, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                👥 Agent Performance
              </div>
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: borderRadius.lg,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(8, 12, 24, 0.4)",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
                  <thead>
                    <tr>
                      {["Agent", "Role", "Open Leads", "Conversions (Today)", "Conversions (7d)", "Touches (Today)", "Moves (Today)"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: spacing.md,
                            color: colors.text.secondary,
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                            fontWeight: typography.fontWeight.bold,
                            fontSize: "0.875rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agentAnalytics.map((row, index) => (
                      <tr
                        key={row.userId}
                        style={{
                          background: index % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.02)",
                          transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(245, 179, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.02)";
                        }}
                      >
                        <td style={{ padding: spacing.md, borderBottom: "1px solid rgba(255,255,255,0.06)", color: colors.text.primary, fontWeight: typography.fontWeight.medium }}>
                          {row.fullName}
                        </td>
                        <td style={{ padding: spacing.md, borderBottom: "1px solid rgba(255,255,255,0.06)", color: colors.text.secondary }}>
                          <span
                            style={{
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.sm,
                              background: `${colors.primary.main}20`,
                              color: colors.primary.main,
                              fontSize: "0.75rem",
                              fontWeight: typography.fontWeight.semibold,
                            }}
                          >
                            {row.role}
                          </span>
                        </td>
                        <td style={{ padding: spacing.md, borderBottom: "1px solid rgba(255,255,255,0.06)", color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                          {row.openLeads}
                        </td>
                        <td style={{ padding: spacing.md, borderBottom: "1px solid rgba(255,255,255,0.06)", color: colors.success.main, fontWeight: typography.fontWeight.semibold }}>
                          {row.conversionsToday}
                        </td>
                        <td style={{ padding: spacing.md, borderBottom: "1px solid rgba(255,255,255,0.06)", color: colors.text.secondary }}>
                          {row.conversionsWeek}
                        </td>
                        <td style={{ padding: spacing.md, borderBottom: "1px solid rgba(255,255,255,0.06)", color: colors.text.secondary }}>
                          {row.touchesToday}
                        </td>
                        <td style={{ padding: spacing.md, borderBottom: "1px solid rgba(255,255,255,0.06)", color: colors.text.secondary }}>
                          {row.movesToday}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Search and Actions */}
      <Card
        variant="elevated"
        padding="lg"
        style={{
          marginTop: spacing.xl,
          background: "linear-gradient(135deg, rgba(8, 12, 24, 0.8) 0%, rgba(8, 12, 24, 0.6) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", gap: spacing.md, alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              minWidth: 280,
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: spacing.md,
                fontSize: "1.2rem",
                color: colors.text.muted,
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name / phone / email / centre…"
              style={{
                width: "100%",
                padding: `${spacing.md} ${spacing.md} ${spacing.md} 2.5rem`,
                background: "rgba(8, 12, 24, 0.6)",
                border: `1px solid rgba(255, 255, 255, 0.15)`,
                borderRadius: borderRadius.lg,
                color: colors.text.primary,
                fontSize: typography.fontSize.base,
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
          </div>
          {(filterType || selectedStage) && (
            <Button
              variant="secondary"
              onClick={() => {
                setFilterType(null);
                setSelectedStage(null);
              }}
              style={{ whiteSpace: "nowrap" }}
            >
              ✕ Clear Filters
            </Button>
          )}
          <Button variant="secondary" onClick={load} style={{ whiteSpace: "nowrap" }}>
            🔄 Refresh
          </Button>
          <Button variant="primary" onClick={() => setAddLeadModalOpen(true)} style={{ whiteSpace: "nowrap" }}>
            Add Lead
          </Button>
          {!isAgent && (
            <Button variant="secondary" onClick={() => navigate("/realverse/crm/import")} style={{ whiteSpace: "nowrap" }}>
              📥 Import Leads
            </Button>
          )}
        </div>
        {error && (
          <div
            style={{
              marginTop: spacing.md,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              background: `${colors.danger.main}20`,
              border: `1px solid ${colors.danger.main}40`,
              ...typography.body,
              color: colors.danger.main,
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </Card>

      {/* Stage CTA Strip */}
      <Card
        variant="elevated"
        padding="lg"
        style={{
          marginTop: spacing.xl,
          background: "linear-gradient(135deg, rgba(8, 12, 24, 0.8) 0%, rgba(8, 12, 24, 0.6) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div style={{ display: "flex", gap: spacing.sm, alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: "0.875rem",
              fontWeight: typography.fontWeight.semibold,
              marginRight: spacing.xs,
            }}
          >
            Filter by Stage:
          </div>
          {stageOrder.map((stage) => {
            const stageColor = getStageColor(stage);
            const count = leadsByStageCount[stage] || 0;
            const isSelected = selectedStage === stage;
            return (
              <button
                key={stage}
                onClick={() => handleStageClick(stage)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleStageClick(stage);
                  }
                }}
                role="button"
                tabIndex={0}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.lg,
                  border: isSelected
                    ? `2px solid ${stageColor.main}`
                    : `1px solid ${stageColor.main}40`,
                  background: isSelected
                    ? `${stageColor.bg}`
                    : `linear-gradient(135deg, rgba(8, 12, 24, 0.6) 0%, rgba(8, 12, 24, 0.4) 100%)`,
                  color: isSelected ? stageColor.main : colors.text.primary,
                  fontSize: typography.fontSize.sm,
                  fontWeight: isSelected ? typography.fontWeight.bold : typography.fontWeight.medium,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.xs,
                  boxShadow: isSelected ? `0 0 0 3px ${stageColor.main}20` : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = stageColor.main;
                    e.currentTarget.style.background = `${stageColor.bg}`;
                    e.currentTarget.style.color = stageColor.main;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = `${stageColor.main}40`;
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(8, 12, 24, 0.6) 0%, rgba(8, 12, 24, 0.4) 100%)`;
                    e.currentTarget.style.color = colors.text.primary;
                  }
                }}
              >
                <span>{formatStageName(stage)}</span>
                <span
                  style={{
                    padding: `2px ${spacing.xs}`,
                    borderRadius: borderRadius.sm,
                    background: isSelected
                      ? `${stageColor.main}30`
                      : "rgba(255, 255, 255, 0.1)",
                    color: isSelected ? stageColor.main : colors.text.secondary,
                    fontSize: "0.75rem",
                    fontWeight: typography.fontWeight.bold,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
          {selectedStage && (
            <Button
              variant="secondary"
              onClick={() => setSelectedStage(null)}
              style={{ whiteSpace: "nowrap", marginLeft: spacing.xs }}
            >
              ✕ All Stages
            </Button>
          )}
        </div>
      </Card>

      {/* Main Board Area */}
      <div
        style={{
          marginTop: spacing.xl,
          display: "grid",
          gridTemplateColumns: selected ? "1fr 440px" : "1fr",
          gap: spacing.xl,
          alignItems: "start",
        }}
      >
        {/* Lead Funnel Board */}
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <Card variant="elevated" padding="lg">
              <div style={{ ...typography.body, color: colors.text.muted }}>Loading leads…</div>
            </Card>
          ) : (
            <LeadFunnelBoard
              leads={boardLeads}
              stages={boardStages}
              onLeadClick={setSelected}
              onLeadMove={handleLeadMove}
              selectedLeadId={selected?.id}
              getOverdueFollowUps={getOverdueFollowUps}
              getIsHot={getIsHot}
              getLastActivityTime={getLastActivityTime}
              openByStage={analyticsSummary?.openByStage}
            />
          )}
        </div>

        {/* Lead Detail Side Panel */}
        {selected && (
          <LeadDetailSidePanel
            lead={selected}
            users={users}
            stages={stageOrder}
            onClose={() => setSelected(null)}
            onUpdate={handleUpdateLead}
            onStageChange={handleStageChange}
          />
        )}
      </div>

      <AddLeadModal
        isOpen={addLeadModalOpen}
        onClose={() => setAddLeadModalOpen(false)}
        users={users}
        onSuccess={(newLead) => {
          load();
          setSelected(newLead);
        }}
      />
    </motion.main>
  );
};

export default CrmDashboardPage;

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

interface WebsiteLead {
  id: number;
  playerName: string;
  playerDob?: string;
  ageBracket?: string;
  guardianName: string;
  phone: string;
  email: string;
  preferredCentre: string;
  programmeInterest: string;
  playingPosition?: string;
  currentLevel: string;
  heardFrom: string;
  notes?: string;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "LOST";
  assignedTo?: number;
  internalNotes?: string;
  convertedPlayerId?: number;
  createdAt: string;
}

const WebsiteLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<WebsiteLead | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    centre: "",
    programme: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLeads();
  }, [filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getLeads(filters);
      setLeads(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      await loadLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus as any });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleConvertToPlayer = async (leadId: number) => {
    if (!confirm("Convert this lead to a player? This will create a new student account.")) {
      return;
    }

    try {
      await api.convertLeadToPlayer(leadId);
      alert("Lead converted to player successfully!");
      await loadLeads();
      setSelectedLead(null);
    } catch (err: any) {
      alert(err.message || "Failed to convert lead");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusColors = {
    NEW: colors.info.main,
    CONTACTED: colors.warning.main,
    CONVERTED: colors.success.main,
    LOST: colors.danger.main,
  };

  return (
    <motion.main
      className="rv-page rv-page--leads"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader
        title="Website Leads"
        subtitle="Manage applications from the FC Real Bengaluru website"
      />

      {/* Filters */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: spacing.md,
          }}
        >
          <div>
            <label
              style={{
                ...typography.caption,
                color: colors.text.muted,
                marginBottom: spacing.xs,
                display: "block",
              }}
            >
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                width: "100%",
                padding: spacing.sm,
                background: colors.surface.card,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: borderRadius.md,
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          <div>
            <label
              style={{
                ...typography.caption,
                color: colors.text.muted,
                marginBottom: spacing.xs,
                display: "block",
              }}
            >
              Centre
            </label>
            <select
              value={filters.centre}
              onChange={(e) => setFilters({ ...filters, centre: e.target.value })}
              style={{
                width: "100%",
                padding: spacing.sm,
                background: colors.surface.card,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: borderRadius.md,
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            >
              <option value="">All Centres</option>
              {Array.from(new Set(leads.map((l) => l.preferredCentre))).map((centre) => (
                <option key={centre} value={centre}>
                  {centre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                ...typography.caption,
                color: colors.text.muted,
                marginBottom: spacing.xs,
                display: "block",
              }}
            >
              Programme
            </label>
            <select
              value={filters.programme}
              onChange={(e) => setFilters({ ...filters, programme: e.target.value })}
              style={{
                width: "100%",
                padding: spacing.sm,
                background: colors.surface.card,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: borderRadius.md,
                color: colors.text.primary,
                fontSize: typography.fontSize.sm,
              }}
            >
              <option value="">All Programmes</option>
              {Array.from(new Set(leads.map((l) => l.programmeInterest))).map((programme) => (
                <option key={programme} value={programme}>
                  {programme}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
          <div style={{ color: colors.danger.main }}>{error}</div>
        </Card>
      )}

      {/* Leads List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedLead ? "1fr 400px" : "1fr",
          gap: spacing.lg,
        }}
      >
        <div>
          {loading ? (
            <Card variant="elevated" padding="xl">
              <div style={{ textAlign: "center", color: colors.text.muted }}>Loading leads...</div>
            </Card>
          ) : leads.length === 0 ? (
            <Card variant="elevated" padding="xl">
              <div style={{ textAlign: "center", color: colors.text.muted }}>No leads found</div>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              {leads.map((lead) => (
                <motion.div key={lead.id} variants={cardVariants}>
                  <Card
                    variant="elevated"
                    padding="lg"
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      cursor: "pointer",
                      border: selectedLead?.id === lead.id ? `2px solid ${colors.primary.main}` : undefined,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: spacing.md,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: spacing.md,
                            marginBottom: spacing.xs,
                          }}
                        >
                          <h3
                            style={{
                              ...typography.h4,
                              color: colors.text.primary,
                              margin: 0,
                            }}
                          >
                            {lead.playerName}
                          </h3>
                          <span
                            style={{
                              ...typography.caption,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              background: statusColors[lead.status] + "20",
                              color: statusColors[lead.status],
                              borderRadius: borderRadius.sm,
                              fontWeight: typography.fontWeight.semibold,
                            }}
                          >
                            {lead.status}
                          </span>
                        </div>
                        <div
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            color: colors.text.muted,
                            marginBottom: spacing.xs,
                          }}
                        >
                          {lead.guardianName} • {lead.phone} • {lead.email}
                        </div>
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                          }}
                        >
                          {lead.preferredCentre} • {lead.programmeInterest} • {formatDate(lead.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Lead Detail Sidebar */}
        {selectedLead && (
          <Card variant="elevated" padding="lg" style={{ position: "sticky", top: spacing.xl }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: spacing.lg,
              }}
            >
              <h3
                style={{
                  ...typography.h3,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                Lead Details
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.text.muted,
                  cursor: "pointer",
                  fontSize: typography.fontSize.xl,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Player Name
                </div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {selectedLead.playerName}
                </div>
              </div>

              {selectedLead.ageBracket && (
                <div>
                  <div
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      marginBottom: spacing.xs,
                    }}
                  >
                    Age Bracket
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {selectedLead.ageBracket}
                  </div>
                </div>
              )}

              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Guardian
                </div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {selectedLead.guardianName}
                </div>
              </div>

              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Contact
                </div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {selectedLead.phone}
                  <br />
                  {selectedLead.email}
                </div>
              </div>

              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Preferred Centre
                </div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {selectedLead.preferredCentre}
                </div>
              </div>

              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Programme Interest
                </div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {selectedLead.programmeInterest}
                </div>
              </div>

              {selectedLead.playingPosition && (
                <div>
                  <div
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      marginBottom: spacing.xs,
                    }}
                  >
                    Playing Position
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {selectedLead.playingPosition}
                  </div>
                </div>
              )}

              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Current Level
                </div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {selectedLead.currentLevel}
                </div>
              </div>

              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Heard From
                </div>
                <div style={{ ...typography.body, color: colors.text.primary }}>
                  {selectedLead.heardFrom}
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <div
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      marginBottom: spacing.xs,
                    }}
                  >
                    Notes
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {selectedLead.notes}
                  </div>
                </div>
              )}

              <div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    marginBottom: spacing.xs,
                  }}
                >
                  Status
                </div>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                  style={{
                    width: "100%",
                    padding: spacing.sm,
                    background: colors.surface.card,
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.sm,
                    marginBottom: spacing.md,
                  }}
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              {selectedLead.status !== "CONVERTED" && !selectedLead.convertedPlayerId && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleConvertToPlayer(selectedLead.id)}
                >
                  Convert to Player
                </Button>
              )}

              {selectedLead.convertedPlayerId && (
                <div
                  style={{
                    padding: spacing.md,
                    background: colors.success.soft,
                    borderRadius: borderRadius.md,
                    color: colors.success.main,
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  ✓ Converted to Player ID: {selectedLead.convertedPlayerId}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </motion.main>
  );
};

export default WebsiteLeadsPage;



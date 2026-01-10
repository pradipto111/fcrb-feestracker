import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

interface LegacyLead {
  id: number;
  name: string;
  phone: string;
  age: number;
  heightCmInput: number;
  weightKgInput: number;
  heightCmBucket: number;
  weightKgBucket: number;
  matchedPlayerName: string | null;
  matchedPlayerPosition: string | null;
  matchedPlayerArchetype: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST" | "CONTACT_REQUESTED";
  notes: string | null;
  consent: boolean;
  createdAt: string;
}

const LegacyLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<LegacyLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<LegacyLead | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    fromDate: "",
    toDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLeads();
  }, [filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      const data = await api.getLegacyLeads(params);
      setLeads(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await api.updateLegacyLead(leadId, { status: newStatus as any });
      await loadLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus as any });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleNotesUpdate = async (leadId: number, notes: string) => {
    try {
      await api.updateLegacyLead(leadId, { notes });
      await loadLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, notes });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update notes");
    }
  };

  const handleExportCSV = async () => {
    try {
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      
      const blob = await api.exportLegacyLeadsCSV(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `legacy_leads_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || "Failed to export CSV");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors = {
    NEW: colors.info.main,
    CONTACTED: colors.warning.main,
    QUALIFIED: colors.success.main,
    CONVERTED: colors.success.main,
    LOST: colors.danger.main,
    CONTACT_REQUESTED: colors.warning.main,
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="rv-page rv-page--legacy-leads"
      style={{
        minHeight: "100vh",
        background: colors.club.background,
        color: colors.text.primary,
        padding: spacing.xl,
      }}
    >
      <PageHeader
        title="Legacy Leads"
        subtitle="Manage Find Your Legacy campaign leads"
      />

      {/* Filters and Actions */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.md, alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ ...typography.caption, color: colors.text.secondary, display: "block", marginBottom: spacing.xs }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Name, phone, or player..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                width: "100%",
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                background: colors.surface.elevated,
                border: `1px solid ${colors.border.dark}`,
                color: colors.text.primary,
                ...typography.body,
              }}
            />
          </div>

          <div style={{ minWidth: 150 }}>
            <label style={{ ...typography.caption, color: colors.text.secondary, display: "block", marginBottom: spacing.xs }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                width: "100%",
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                background: colors.surface.elevated,
                border: `1px solid ${colors.border.dark}`,
                color: colors.text.primary,
                ...typography.body,
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONTACT_REQUESTED">Contact Requested</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div style={{ minWidth: 150 }}>
            <label style={{ ...typography.caption, color: colors.text.secondary, display: "block", marginBottom: spacing.xs }}>
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              style={{
                width: "100%",
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                background: colors.surface.elevated,
                border: `1px solid ${colors.border.dark}`,
                color: colors.text.primary,
                ...typography.body,
              }}
            />
          </div>

          <div style={{ minWidth: 150 }}>
            <label style={{ ...typography.caption, color: colors.text.secondary, display: "block", marginBottom: spacing.xs }}>
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              style={{
                width: "100%",
                padding: spacing.sm,
                borderRadius: borderRadius.md,
                background: colors.surface.elevated,
                border: `1px solid ${colors.border.dark}`,
                color: colors.text.primary,
                ...typography.body,
              }}
            />
          </div>

          <Button variant="primary" onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Leads List */}
      {loading ? (
        <Card variant="elevated" padding="lg">
          <div style={{ textAlign: "center", color: colors.text.muted }}>Loading leads...</div>
        </Card>
      ) : leads.length === 0 ? (
        <Card variant="elevated" padding="lg">
          <div style={{ textAlign: "center", color: colors.text.muted }}>No leads found</div>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: spacing.md }}>
          {leads.map((lead) => (
            <motion.div key={lead.id} variants={cardVariants}>
              <Card
                variant="elevated"
                padding="lg"
                style={{
                  cursor: "pointer",
                  border: selectedLead?.id === lead.id ? `2px solid ${colors.accent.main}` : `1px solid ${colors.border.dark}`,
                }}
                onClick={() => setSelectedLead(lead.id === selectedLead?.id ? null : lead)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: spacing.md }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                      {lead.name}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.secondary, marginBottom: spacing.xs }}>
                      {lead.phone} • Age: {lead.age}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {lead.heightCmInput}cm / {lead.weightKgInput}kg
                      {lead.matchedPlayerName && ` • Matched: ${lead.matchedPlayerName}`}
                    </div>
                    {lead.matchedPlayerPosition && (
                      <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                        {lead.matchedPlayerPosition} • {lead.matchedPlayerArchetype}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm, alignItems: "flex-end" }}>
                    <div
                      style={{
                        ...typography.caption,
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.md,
                        background: statusColors[lead.status] + "20",
                        color: statusColors[lead.status],
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      {lead.status.replace("_", " ")}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {formatDate(lead.createdAt)}
                    </div>
                  </div>
                </div>

                {selectedLead?.id === lead.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginTop: spacing.lg,
                      paddingTop: spacing.lg,
                      borderTop: `1px solid ${colors.border.dark}`,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                      <div>
                        <label style={{ ...typography.caption, color: colors.text.secondary, display: "block", marginBottom: spacing.xs }}>
                          Status
                        </label>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          style={{
                            width: "100%",
                            padding: spacing.sm,
                            borderRadius: borderRadius.md,
                            background: colors.surface.elevated,
                            border: `1px solid ${colors.border.dark}`,
                            color: colors.text.primary,
                            ...typography.body,
                          }}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="CONTACT_REQUESTED">Contact Requested</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="CONVERTED">Converted</option>
                          <option value="LOST">Lost</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ ...typography.caption, color: colors.text.secondary, display: "block", marginBottom: spacing.xs }}>
                          Notes
                        </label>
                        <textarea
                          value={lead.notes || ""}
                          onChange={(e) => handleNotesUpdate(lead.id, e.target.value)}
                          placeholder="Add internal notes..."
                          rows={4}
                          style={{
                            width: "100%",
                            padding: spacing.sm,
                            borderRadius: borderRadius.md,
                            background: colors.surface.elevated,
                            border: `1px solid ${colors.border.dark}`,
                            color: colors.text.primary,
                            ...typography.body,
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <div style={{ ...typography.caption, color: colors.text.muted }}>
                        Consent: {lead.consent ? "✓ Yes" : "✗ No"} • Bucket: {lead.heightCmBucket}cm / {lead.weightKgBucket}kg
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LegacyLeadsPage;


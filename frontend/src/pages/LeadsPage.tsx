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
  skillsShowcaseLink?: string;
  status: "NEW" | "CONTACTED" | "CONVERTED" | "LOST";
  assignedTo?: number;
  internalNotes?: string;
  convertedPlayerId?: number;
  createdAt: string;
}

interface CheckoutLead {
  id: number;
  source: string;
  customerName: string;
  phone: string;
  email: string;
  shippingAddress: any;
  items: any[];
  subtotal: number;
  shippingFee: number;
  total: number;
  errorMessage?: string;
  status: string;
  assignedTo?: number;
  internalNotes?: string;
  convertedOrderId?: number;
  createdAt: string;
  updatedAt: string;
}

const LeadsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"website" | "checkout">("website");

  // Website Leads State
  const [websiteLeads, setWebsiteLeads] = useState<WebsiteLead[]>([]);
  const [selectedWebsiteLead, setSelectedWebsiteLead] = useState<WebsiteLead | null>(null);
  const [websiteFilters, setWebsiteFilters] = useState({
    status: "",
    centre: "",
    programme: "",
  });
  const [websiteLoading, setWebsiteLoading] = useState(true);
  const [websiteError, setWebsiteError] = useState("");

  // Checkout Leads State
  const [checkoutLeads, setCheckoutLeads] = useState<CheckoutLead[]>([]);
  const [selectedCheckoutLead, setSelectedCheckoutLead] = useState<CheckoutLead | null>(null);
  const [checkoutFilters, setCheckoutFilters] = useState({
    status: "",
  });
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    if (activeTab === "website") {
      loadWebsiteLeads();
    } else {
      loadCheckoutLeads();
    }
  }, [activeTab, websiteFilters, checkoutFilters]);

  const loadWebsiteLeads = async () => {
    try {
      setWebsiteLoading(true);
      const data = await api.getLeads(websiteFilters);
      setWebsiteLeads(data);
    } catch (err: any) {
      setWebsiteError(err.message);
    } finally {
      setWebsiteLoading(false);
    }
  };

  const loadCheckoutLeads = async () => {
    try {
      setCheckoutLoading(true);
      const data = await api.getCheckoutLeads(checkoutFilters);
      setCheckoutLeads(data);
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleWebsiteStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      await loadWebsiteLeads();
      if (selectedWebsiteLead?.id === leadId) {
        setSelectedWebsiteLead({ ...selectedWebsiteLead, status: newStatus as any });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleCheckoutStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await api.updateCheckoutLead(leadId, { status: newStatus });
      await loadCheckoutLeads();
      if (selectedCheckoutLead?.id === leadId) {
        setSelectedCheckoutLead({ ...selectedCheckoutLead, status: newStatus });
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
      await loadWebsiteLeads();
      setSelectedWebsiteLead(null);
    } catch (err: any) {
      alert(err.message || "Failed to convert lead");
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

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const statusColors = {
    NEW: colors.info.main,
    CONTACTED: colors.warning.main,
    CONVERTED: colors.success.main,
    LOST: colors.danger.main,
    FAILED: colors.danger.main,
  };

  const filteredCheckoutLeads = checkoutLeads.filter((lead) => {
    if (checkoutFilters.status && lead.status !== checkoutFilters.status) return false;
    return true;
  });

  return (
    <motion.main
      className="rv-page rv-page--leads"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader
        title="Leads"
        subtitle="Manage website leads and checkout attempts"
      />

      {/* Tabs */}
      <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", gap: spacing.md }}>
          <button
            onClick={() => {
              setActiveTab("website");
              setSelectedWebsiteLead(null);
            }}
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              background: activeTab === "website" ? colors.primary.main : "transparent",
              color: activeTab === "website" ? colors.text.inverted : colors.text.primary,
              border: `1px solid ${activeTab === "website" ? colors.primary.main : colors.border}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              ...typography.body,
              fontWeight: activeTab === "website" ? typography.fontWeight.semibold : typography.fontWeight.medium,
              transition: "all 0.2s ease",
            }}
          >
            Website Leads
          </button>
          <button
            onClick={() => {
              setActiveTab("checkout");
              setSelectedCheckoutLead(null);
            }}
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              background: activeTab === "checkout" ? colors.primary.main : "transparent",
              color: activeTab === "checkout" ? colors.text.inverted : colors.text.primary,
              border: `1px solid ${activeTab === "checkout" ? colors.primary.main : colors.border}`,
              borderRadius: borderRadius.md,
              cursor: "pointer",
              ...typography.body,
              fontWeight: activeTab === "checkout" ? typography.fontWeight.semibold : typography.fontWeight.medium,
              transition: "all 0.2s ease",
            }}
          >
            Checkout Leads
          </button>
        </div>
      </Card>

      {/* Website Leads Tab */}
      {activeTab === "website" && (
        <>
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
                  value={websiteFilters.status}
                  onChange={(e) => setWebsiteFilters({ ...websiteFilters, status: e.target.value })}
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
                  value={websiteFilters.centre}
                  onChange={(e) => setWebsiteFilters({ ...websiteFilters, centre: e.target.value })}
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
                  {Array.from(new Set(websiteLeads.map((l) => l.preferredCentre))).map((centre) => (
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
                  value={websiteFilters.programme}
                  onChange={(e) => setWebsiteFilters({ ...websiteFilters, programme: e.target.value })}
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
                  {Array.from(new Set(websiteLeads.map((l) => l.programmeInterest))).map((programme) => (
                    <option key={programme} value={programme}>
                      {programme}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {websiteError && (
            <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
              <div style={{ color: colors.danger.main }}>{websiteError}</div>
            </Card>
          )}

          {/* Leads List */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selectedWebsiteLead ? "1fr 400px" : "1fr",
              gap: spacing.lg,
            }}
          >
            <div>
              {websiteLoading ? (
                <Card variant="elevated" padding="xl">
                  <div style={{ textAlign: "center", color: colors.text.muted }}>Loading leads...</div>
                </Card>
              ) : websiteLeads.length === 0 ? (
                <Card variant="elevated" padding="xl">
                  <div style={{ textAlign: "center", color: colors.text.muted }}>No leads found</div>
                </Card>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                  {websiteLeads.map((lead) => (
                    <motion.div key={lead.id} variants={cardVariants}>
                      <Card
                        variant="elevated"
                        padding="lg"
                        onClick={() => setSelectedWebsiteLead(lead)}
                        style={{
                          cursor: "pointer",
                          border: selectedWebsiteLead?.id === lead.id ? `2px solid ${colors.primary.main}` : undefined,
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
            {selectedWebsiteLead && (
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
                    onClick={() => setSelectedWebsiteLead(null)}
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
                      {selectedWebsiteLead.playerName}
                    </div>
                  </div>

                  {selectedWebsiteLead.ageBracket && (
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
                        {selectedWebsiteLead.ageBracket}
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
                      {selectedWebsiteLead.guardianName}
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
                      {selectedWebsiteLead.phone}
                      <br />
                      {selectedWebsiteLead.email}
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
                      {selectedWebsiteLead.preferredCentre}
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
                      {selectedWebsiteLead.programmeInterest}
                    </div>
                  </div>

                  {selectedWebsiteLead.playingPosition && (
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
                        {selectedWebsiteLead.playingPosition}
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
                      {selectedWebsiteLead.currentLevel}
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
                      {selectedWebsiteLead.heardFrom}
                    </div>
                  </div>

                  {selectedWebsiteLead.notes && (
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
                        {selectedWebsiteLead.notes}
                      </div>
                    </div>
                  )}

                  {selectedWebsiteLead.skillsShowcaseLink && (
                    <div>
                      <div
                        style={{
                          ...typography.caption,
                          color: colors.text.muted,
                          marginBottom: spacing.xs,
                        }}
                      >
                        Skills Showcase Link
                      </div>
                      <a
                        href={selectedWebsiteLead.skillsShowcaseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...typography.body,
                          color: colors.accent.main,
                          textDecoration: "underline",
                          wordBreak: "break-all",
                          display: "block",
                        }}
                      >
                        {selectedWebsiteLead.skillsShowcaseLink}
                      </a>
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
                      value={selectedWebsiteLead.status}
                      onChange={(e) => handleWebsiteStatusChange(selectedWebsiteLead.id, e.target.value)}
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

                  {selectedWebsiteLead.status !== "CONVERTED" && !selectedWebsiteLead.convertedPlayerId && (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => handleConvertToPlayer(selectedWebsiteLead.id)}
                    >
                      Convert to Player
                    </Button>
                  )}

                  {selectedWebsiteLead.convertedPlayerId && (
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
                      ✓ Converted to Player ID: {selectedWebsiteLead.convertedPlayerId}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Checkout Leads Tab */}
      {activeTab === "checkout" && (
        <>
          {/* Filters */}
          <Card variant="elevated" padding="md" style={{ marginBottom: spacing.md }}>
            <div style={{ display: "flex", gap: spacing.md, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600, color: colors.text.primary }}>
                Status:
                <select
                  value={checkoutFilters.status}
                  onChange={(e) => setCheckoutFilters({ ...checkoutFilters, status: e.target.value })}
                  style={{
                    marginLeft: spacing.sm,
                    padding: spacing.xs,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.border}`,
                    background: colors.surface.card,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">All</option>
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="LOST">Lost</option>
                  <option value="FAILED">Failed</option>
                </select>
              </label>
              <Button
                onClick={loadCheckoutLeads}
                variant="secondary"
                style={{ marginLeft: "auto" }}
              >
                Refresh
              </Button>
            </div>
          </Card>

          {checkoutError && (
            <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.soft }}>
              <div style={{ color: colors.danger.main }}>{checkoutError}</div>
            </Card>
          )}

          {checkoutLoading ? (
            <Card variant="elevated" padding="lg" style={{ textAlign: "center" }}>
              <p>Loading leads...</p>
            </Card>
          ) : filteredCheckoutLeads.length === 0 ? (
            <Card variant="elevated" padding="lg" style={{ textAlign: "center" }}>
              <p style={{ color: colors.text.muted }}>No checkout leads found</p>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
              {/* Leads List */}
              <div>
                <h3 style={{ marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
                  Leads ({filteredCheckoutLeads.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                  {filteredCheckoutLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        variant="elevated"
                        padding="md"
                        style={{
                          cursor: "pointer",
                          border:
                            selectedCheckoutLead?.id === lead.id
                              ? `2px solid ${colors.primary.main}`
                              : `1px solid ${colors.border}`,
                          background:
                            selectedCheckoutLead?.id === lead.id ? colors.primary.soft : colors.surface.card,
                        }}
                        onClick={() => setSelectedCheckoutLead(lead)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, marginBottom: spacing.xs }}>
                              {lead.customerName}
                            </div>
                            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                              {lead.email}
                            </div>
                            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                              {lead.phone}
                            </div>
                            <div style={{ marginTop: spacing.xs }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: `${spacing.xs} ${spacing.sm}`,
                                  borderRadius: borderRadius.sm,
                                  background: (statusColors[lead.status as keyof typeof statusColors] || colors.text.muted) + "20",
                                  color: statusColors[lead.status as keyof typeof statusColors] || colors.text.muted,
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: 600,
                                }}
                              >
                                {lead.status}
                              </span>
                            </div>
                            {lead.errorMessage && (
                              <div
                                style={{
                                  marginTop: spacing.xs,
                                  fontSize: typography.fontSize.xs,
                                  color: colors.danger.main,
                                }}
                              >
                                Error: {lead.errorMessage}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 600, color: colors.primary.main }}>
                              {formatPrice(lead.total)}
                            </div>
                            <div style={{ fontSize: typography.fontSize.xs, color: colors.text.muted }}>
                              {formatDate(lead.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Lead Details */}
              <div>
                <h3 style={{ marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
                  Lead Details
                </h3>
                {selectedCheckoutLead ? (
                  <Card variant="elevated" padding="lg">
                    <div style={{ marginBottom: spacing.lg }}>
                      <h4 style={{ marginBottom: spacing.md }}>Customer Information</h4>
                      <div style={{ display: "grid", gap: spacing.sm }}>
                        <div>
                          <strong>Name:</strong> {selectedCheckoutLead.customerName}
                        </div>
                        <div>
                          <strong>Email:</strong> {selectedCheckoutLead.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {selectedCheckoutLead.phone}
                        </div>
                        <div>
                          <strong>Status:</strong>{" "}
                          <span
                            style={{
                              display: "inline-block",
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.sm,
                              background: (statusColors[selectedCheckoutLead.status as keyof typeof statusColors] || colors.text.muted) + "20",
                              color: statusColors[selectedCheckoutLead.status as keyof typeof statusColors] || colors.text.muted,
                              fontSize: typography.fontSize.xs,
                              fontWeight: 600,
                            }}
                          >
                            {selectedCheckoutLead.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: spacing.lg }}>
                      <h4 style={{ marginBottom: spacing.md }}>Shipping Address</h4>
                      <div style={{ display: "grid", gap: spacing.sm }}>
                        {selectedCheckoutLead.shippingAddress?.addressLine1 && (
                          <div>{selectedCheckoutLead.shippingAddress.addressLine1}</div>
                        )}
                        {selectedCheckoutLead.shippingAddress?.addressLine2 && (
                          <div>{selectedCheckoutLead.shippingAddress.addressLine2}</div>
                        )}
                        <div>
                          {selectedCheckoutLead.shippingAddress?.city}
                          {selectedCheckoutLead.shippingAddress?.state && `, ${selectedCheckoutLead.shippingAddress.state}`}
                          {selectedCheckoutLead.shippingAddress?.pincode && ` ${selectedCheckoutLead.shippingAddress.pincode}`}
                        </div>
                        {selectedCheckoutLead.shippingAddress?.country && (
                          <div>{selectedCheckoutLead.shippingAddress.country}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: spacing.lg }}>
                      <h4 style={{ marginBottom: spacing.md }}>Order Items</h4>
                      <div style={{ display: "grid", gap: spacing.sm }}>
                        {Array.isArray(selectedCheckoutLead.items) && selectedCheckoutLead.items.length > 0 ? (
                          selectedCheckoutLead.items.map((item: any, index: number) => (
                            <div
                              key={index}
                              style={{
                                padding: spacing.sm,
                                background: colors.background.secondary,
                                borderRadius: borderRadius.md,
                              }}
                            >
                              <div style={{ fontWeight: 600 }}>
                                {item.productName || `Product ID: ${item.productId}`} x {item.quantity || 1}
                              </div>
                              {item.variant && <div>Variant: {item.variant}</div>}
                              {item.size && <div>Size: {item.size}</div>}
                              {item.unitPrice && (
                                <div style={{ color: colors.text.secondary }}>
                                  {formatPrice(item.unitPrice)} each
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ color: colors.text.muted }}>No items found</div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: spacing.lg }}>
                      <h4 style={{ marginBottom: spacing.md }}>Order Summary</h4>
                      <div style={{ display: "grid", gap: spacing.sm }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Subtotal:</span>
                          <strong>{formatPrice(selectedCheckoutLead.subtotal)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Shipping:</span>
                          <strong>{formatPrice(selectedCheckoutLead.shippingFee)}</strong>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: spacing.sm,
                            borderTop: `1px solid ${colors.border}`,
                            fontSize: typography.fontSize.lg,
                            fontWeight: 600,
                          }}
                        >
                          <span>Total:</span>
                          <strong style={{ color: colors.primary.main }}>
                            {formatPrice(selectedCheckoutLead.total)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {selectedCheckoutLead.errorMessage && (
                      <div style={{ marginBottom: spacing.lg }}>
                        <h4 style={{ marginBottom: spacing.md, color: colors.danger.main }}>
                          Error Message
                        </h4>
                        <div
                          style={{
                            padding: spacing.md,
                            background: colors.danger.soft,
                            borderRadius: borderRadius.md,
                            color: colors.danger.main,
                          }}
                        >
                          {selectedCheckoutLead.errorMessage}
                        </div>
                      </div>
                    )}

                    <div style={{ marginBottom: spacing.lg }}>
                      <h4 style={{ marginBottom: spacing.md }}>Metadata</h4>
                      <div style={{ display: "grid", gap: spacing.sm, fontSize: typography.fontSize.sm }}>
                        <div>
                          <strong>Created:</strong> {formatDate(selectedCheckoutLead.createdAt)}
                        </div>
                        <div>
                          <strong>Updated:</strong> {formatDate(selectedCheckoutLead.updatedAt)}
                        </div>
                        {selectedCheckoutLead.convertedOrderId && (
                          <div>
                            <strong>Converted Order ID:</strong> {selectedCheckoutLead.convertedOrderId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
                      <select
                        value={selectedCheckoutLead.status}
                        onChange={(e) => handleCheckoutStatusChange(selectedCheckoutLead.id, e.target.value)}
                        style={{
                          padding: spacing.sm,
                          borderRadius: borderRadius.md,
                          border: `1px solid ${colors.border}`,
                          flex: 1,
                          minWidth: 200,
                          background: colors.surface.card,
                          color: colors.text.primary,
                        }}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>
                      </select>
                    </div>
                  </Card>
                ) : (
                  <Card variant="elevated" padding="lg" style={{ textAlign: "center", color: colors.text.muted }}>
                    <p>Select a lead to view details</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </motion.main>
  );
};

export default LeadsPage;

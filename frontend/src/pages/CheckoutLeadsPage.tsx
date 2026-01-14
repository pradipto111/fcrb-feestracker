import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Section } from "../components/ui/Section";

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

const CheckoutLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<CheckoutLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<CheckoutLead | null>(null);
  const [filters, setFilters] = useState({
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLeads();
  }, [filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await api.getCheckoutLeads(filters);
      setLeads(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await api.updateCheckoutLead(leadId, { status: newStatus });
      await loadLeads();
      if (selectedLead?.id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
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

  const statusColors: Record<string, string> = {
    NEW: colors.info.main,
    CONTACTED: colors.warning.main,
    CONVERTED: colors.success.main,
    LOST: colors.danger.main,
    FAILED: colors.danger.main,
  };

  const filteredLeads = leads.filter((lead) => {
    if (filters.status && lead.status !== filters.status) return false;
    return true;
  });

  return (
    <div style={{ padding: spacing.xl, maxWidth: 1400, margin: "0 auto" }}>
      <Section
        title="Checkout Leads"
        description="Manage leads from failed checkout attempts"
        variant="elevated"
      >
        {error && (
          <Card padding="md" style={{ marginBottom: spacing.md, background: colors.danger.soft }}>
            <p style={{ margin: 0, color: colors.danger.main }}>Error: {error}</p>
          </Card>
        )}

        {/* Filters */}
        <Card padding="md" style={{ marginBottom: spacing.md }}>
          <div style={{ display: "flex", gap: spacing.md, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontWeight: 600, color: colors.text.primary }}>
              Status:
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{
                  marginLeft: spacing.sm,
                  padding: spacing.xs,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.border}`,
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
              onClick={loadLeads}
              variant="secondary"
              style={{ marginLeft: "auto" }}
            >
              Refresh
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card padding="lg" style={{ textAlign: "center" }}>
            <p>Loading leads...</p>
          </Card>
        ) : filteredLeads.length === 0 ? (
          <Card padding="lg" style={{ textAlign: "center" }}>
            <p style={{ color: colors.text.muted }}>No checkout leads found</p>
          </Card>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
            {/* Leads List */}
            <div>
              <h3 style={{ marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
                Leads ({filteredLeads.length})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                {filteredLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      padding="md"
                      style={{
                        cursor: "pointer",
                        border:
                          selectedLead?.id === lead.id
                            ? `2px solid ${colors.primary.main}`
                            : `1px solid ${colors.border}`,
                        background:
                          selectedLead?.id === lead.id ? colors.primary.soft : "white",
                      }}
                      onClick={() => setSelectedLead(lead)}
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
                                background: statusColors[lead.status] || colors.text.muted,
                                color: "white",
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
              {selectedLead ? (
                <Card padding="lg">
                  <div style={{ marginBottom: spacing.lg }}>
                    <h4 style={{ marginBottom: spacing.md }}>Customer Information</h4>
                    <div style={{ display: "grid", gap: spacing.sm }}>
                      <div>
                        <strong>Name:</strong> {selectedLead.customerName}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedLead.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {selectedLead.phone}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        <span
                          style={{
                            display: "inline-block",
                            padding: `${spacing.xs} ${spacing.sm}`,
                            borderRadius: borderRadius.sm,
                            background: statusColors[selectedLead.status] || colors.text.muted,
                            color: "white",
                            fontSize: typography.fontSize.xs,
                            fontWeight: 600,
                          }}
                        >
                          {selectedLead.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: spacing.lg }}>
                    <h4 style={{ marginBottom: spacing.md }}>Shipping Address</h4>
                    <div style={{ display: "grid", gap: spacing.sm }}>
                      {selectedLead.shippingAddress?.addressLine1 && (
                        <div>{selectedLead.shippingAddress.addressLine1}</div>
                      )}
                      {selectedLead.shippingAddress?.addressLine2 && (
                        <div>{selectedLead.shippingAddress.addressLine2}</div>
                      )}
                      <div>
                        {selectedLead.shippingAddress?.city}
                        {selectedLead.shippingAddress?.state && `, ${selectedLead.shippingAddress.state}`}
                        {selectedLead.shippingAddress?.pincode && ` ${selectedLead.shippingAddress.pincode}`}
                      </div>
                      {selectedLead.shippingAddress?.country && (
                        <div>{selectedLead.shippingAddress.country}</div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: spacing.lg }}>
                    <h4 style={{ marginBottom: spacing.md }}>Order Items</h4>
                    <div style={{ display: "grid", gap: spacing.sm }}>
                      {Array.isArray(selectedLead.items) && selectedLead.items.length > 0 ? (
                        selectedLead.items.map((item: any, index: number) => (
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
                        <strong>{formatPrice(selectedLead.subtotal)}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Shipping:</span>
                        <strong>{formatPrice(selectedLead.shippingFee)}</strong>
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
                          {formatPrice(selectedLead.total)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {selectedLead.errorMessage && (
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
                        {selectedLead.errorMessage}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: spacing.lg }}>
                    <h4 style={{ marginBottom: spacing.md }}>Metadata</h4>
                    <div style={{ display: "grid", gap: spacing.sm, fontSize: typography.fontSize.sm }}>
                      <div>
                        <strong>Created:</strong> {formatDate(selectedLead.createdAt)}
                      </div>
                      <div>
                        <strong>Updated:</strong> {formatDate(selectedLead.updatedAt)}
                      </div>
                      {selectedLead.convertedOrderId && (
                        <div>
                          <strong>Converted Order ID:</strong> {selectedLead.convertedOrderId}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                      style={{
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.border}`,
                        flex: 1,
                        minWidth: 200,
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
                <Card padding="lg" style={{ textAlign: "center", color: colors.text.muted }}>
                  <p>Select a lead to view details</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
};

export default CheckoutLeadsPage;

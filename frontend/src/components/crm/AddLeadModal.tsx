import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { api } from "../../api/client";
import { CrmLead } from "./LeadCard";

const inputStyle = {
  width: "100%",
  padding: spacing.md,
  background: "rgba(8, 12, 24, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: borderRadius.lg,
  color: colors.text.primary,
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
} as const;

const labelStyle = {
  ...typography.caption,
  color: colors.text.muted,
  marginBottom: spacing.xs,
  display: "block",
} as const;

const LEAD_SOURCE_OPTIONS = [
  { value: "", label: "Select source..." },
  { value: "MANUAL", label: "Manual" },
  { value: "WEBSITE", label: "Website" },
  { value: "LEGACY", label: "Legacy" },
  { value: "CHECKOUT", label: "Checkout" },
  { value: "FAN", label: "Fan" },
];

export type CrmUserForAssign = {
  id: number;
  fullName: string;
  email?: string;
  role?: string;
  status?: string;
};

type AddLeadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  users: CrmUserForAssign[];
  onSuccess: (newLead: CrmLead) => void;
};

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  users,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setPhone("");
    setAge("");
    setAssignedTo("");
    setNotes("");
    setLeadSource("");
    setError("");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (!trimmedPhone) {
      setError("Phone Number is required.");
      return;
    }

    setSubmitting(true);
    try {
      const customFields: { age?: number; leadSource?: string } = {};
      const ageNum = age.trim() ? parseInt(age.trim(), 10) : undefined;
      if (ageNum !== undefined && !Number.isNaN(ageNum)) customFields.age = ageNum;
      if (leadSource) customFields.leadSource = leadSource;

      const created = await api.crmCreateLead({
        primaryName: trimmedName,
        phone: trimmedPhone,
        ownerId: assignedTo ? Number(assignedTo) : undefined,
        sourceType: "MANUAL",
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      }) as CrmLead;

      if (notes.trim()) {
        await api.crmCreateLeadActivity(created.id, {
          type: "NOTE",
          title: "Note",
          body: notes.trim(),
        });
      }

      resetForm();
      onSuccess(created);
      handleClose();
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Failed to create lead.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const activeUsers = users.filter((u) => u.status !== "DISABLED");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              zIndex: 1000,
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                maxWidth: "640px",
                width: "100%",
                maxHeight: "85vh",
                overflow: "hidden",
                boxSizing: "border-box",
                pointerEvents: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card
                variant="elevated"
                padding="xl"
                style={{
                  position: "relative",
                  maxHeight: "100%",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, rgba(8, 12, 24, 0.95) 0%, rgba(8, 12, 24, 0.85) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
              <button
                type="button"
                onClick={handleClose}
                style={{
                  position: "absolute",
                  top: spacing.md,
                  right: spacing.md,
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: colors.text.primary,
                  fontSize: "1.25rem",
                  lineHeight: 1,
                  zIndex: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>

              <h2
                style={{
                  ...typography.h3,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                  paddingRight: 40,
                }}
              >
                Add Lead
              </h2>

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: spacing.md,
                    alignItems: "start",
                  }}
                >
                  <div>
                    <label htmlFor="add-lead-name" style={labelStyle}>
                      Name *
                    </label>
                    <input
                      id="add-lead-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      required
                      style={inputStyle}
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

                  <div>
                    <label htmlFor="add-lead-phone" style={labelStyle}>
                      Phone Number *
                    </label>
                    <input
                      id="add-lead-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      required
                      style={inputStyle}
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

                  <div>
                    <label htmlFor="add-lead-age" style={labelStyle}>
                      Age
                    </label>
                    <input
                      id="add-lead-age"
                      type="number"
                      min={1}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Optional"
                      style={inputStyle}
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

                  <div>
                    <label htmlFor="add-lead-assigned" style={labelStyle}>
                      Assigned to
                    </label>
                    <select
                      id="add-lead-assigned"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      style={{
                        ...inputStyle,
                        cursor: "pointer",
                        appearance: "auto",
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
                      {activeUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} {u.role ? `(${u.role})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="add-lead-source" style={labelStyle}>
                      Lead Source
                    </label>
                    <select
                      id="add-lead-source"
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      style={{
                        ...inputStyle,
                        cursor: "pointer",
                        appearance: "auto",
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
                      {LEAD_SOURCE_OPTIONS.map((opt) => (
                        <option key={opt.value || "empty"} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label htmlFor="add-lead-notes" style={labelStyle}>
                      Notes
                    </label>
                    <textarea
                      id="add-lead-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes..."
                      rows={2}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
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
                </div>

                {error && (
                  <div
                    style={{
                      marginTop: spacing.md,
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      background: `${colors.danger.main}20`,
                      border: `1px solid ${colors.danger.main}40`,
                      color: colors.danger.main,
                      ...typography.caption,
                    }}
                  >
                    {error}
                  </div>
                )}

                <div
                  style={{
                    marginTop: spacing.xl,
                    display: "flex",
                    gap: spacing.md,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button type="button" variant="secondary" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submitting}>
                    {submitting ? "Creating…" : "Add Lead"}
                  </Button>
                </div>
              </form>
            </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../context/AuthContext";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [systemDate, setSystemDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadSystemDate();
  }, []);

  const loadSystemDate = async () => {
    try {
      setLoading(true);
      const data = await api.getSystemDate();
      setSystemDate(data.date || new Date().toISOString().split("T")[0]);
    } catch (err: any) {
      setError(err.message || "Failed to load system date");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.setSystemDate(systemDate);
      setSuccess("System date updated successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to update system date");
    } finally {
      setSaving(false);
    }
  };

  const handleResetSystemDate = async () => {
    if (!confirm("Are you sure you want to reset the system date to today?")) {
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await api.resetSystemDate();
      await loadSystemDate();
      setSuccess("System date reset to today!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to reset system date");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div style={{ ...typography.h3, color: colors.text.primary }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: spacing.md }}
    >
      <PageHeader
        title="System Settings"
        subtitle="Configure system-wide settings"
      />

      {error && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            background: colors.error.light,
            color: colors.error.main,
            borderRadius: borderRadius.md,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: spacing.md,
            marginBottom: spacing.md,
            background: colors.success.light,
            color: colors.success.main,
            borderRadius: borderRadius.md,
          }}
        >
          {success}
        </div>
      )}

      {/* System Date Settings */}
      <motion.div variants={cardVariants} style={{ marginBottom: spacing.xl }}>
        <Card variant="default" padding="lg">
          <h3 style={{ ...typography.h3, marginBottom: spacing.md, color: colors.text.primary }}>
            System Date Management
          </h3>
          <p
            style={{
              ...typography.body,
              color: colors.text.muted,
              marginBottom: spacing.lg,
            }}
          >
            Adjust the system date for testing purposes. This affects date-based calculations
            across the application.
          </p>
          <form onSubmit={handleSaveSystemDate}>
            <div
              className="responsive-flex-row"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
                marginBottom: spacing.md,
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <Input
                  label="System Date"
                  type="date"
                  value={systemDate}
                  onChange={(e) => setSystemDate(e.target.value)}
                  required
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.sm,
                  width: "100%",
                }}
              >
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Date"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResetSystemDate}
                  disabled={saving}
                >
                  Reset to Today
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Additional Settings Sections */}
      <motion.div variants={cardVariants}>
        <Card variant="default" padding="lg">
          <h3 style={{ ...typography.h3, marginBottom: spacing.md, color: colors.text.primary }}>
            General Settings
          </h3>
            <div
              className="responsive-grid-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: spacing.md,
              }}
            >
            <div>
              <h4 style={{ ...typography.h4, marginBottom: spacing.sm, color: colors.text.secondary }}>
                Application Information
              </h4>
              <p style={{ ...typography.body, color: colors.text.muted }}>
                FC Real Bengaluru Fees Tracker
              </p>
              <p style={{ ...typography.caption, color: colors.text.disabled, marginTop: spacing.xs }}>
                Version 1.0.0
              </p>
            </div>
            <div>
              <h4 style={{ ...typography.h4, marginBottom: spacing.sm, color: colors.text.secondary }}>
                Database Status
              </h4>
              <p style={{ ...typography.body, color: colors.success.main }}>
                ✓ Connected
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminSettingsPage;


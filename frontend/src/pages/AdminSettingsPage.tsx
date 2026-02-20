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

interface FooterLink {
  id?: number;
  label: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
}

interface FooterSection {
  id?: number;
  sectionTitle: string;
  displayOrder: number;
  isActive: boolean;
  links: FooterLink[];
}

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"system" | "footer">("system");
  
  // System Settings State
  const [systemDate, setSystemDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Footer Configuration State
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [footerLoading, setFooterLoading] = useState(true);
  const [footerSaving, setFooterSaving] = useState(false);
  const [footerError, setFooterError] = useState("");
  const [footerSuccess, setFooterSuccess] = useState("");

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (activeTab === "system") {
      loadSystemDate();
    } else if (activeTab === "footer") {
      loadFooterConfig();
    }
  }, [activeTab]);

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

  const loadFooterConfig = async () => {
    try {
      setFooterLoading(true);
      const data = await api.getFooterConfigAdmin();
      setSections(data || []);
    } catch (err: any) {
      setFooterError(err.message || "Failed to load footer configuration");
      // Initialize with default sections if none exist
      if (err.status === 404 || !data) {
        setSections(getDefaultSections());
      }
    } finally {
      setFooterLoading(false);
    }
  };

  const getDefaultSections = (): FooterSection[] => {
    return [
      {
        sectionTitle: "About Clubs",
        displayOrder: 0,
        isActive: true,
        links: [
          { label: "Homepage", url: "/", displayOrder: 0, isActive: true },
          { label: "About Us", url: "/about", displayOrder: 1, isActive: true },
          { label: "Teams", url: "/teams", displayOrder: 2, isActive: true },
        ],
      },
      {
        sectionTitle: "Programmes",
        displayOrder: 1,
        isActive: true,
        links: [
          { label: "Programmes Overview", url: "/programs", displayOrder: 0, isActive: true },
          // { label: "Shop", url: "/shop", displayOrder: 1, isActive: true }, // Disabled in UI, backend code preserved
        ],
      },
    ];
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

  const handleAddSection = () => {
    const newSection: FooterSection = {
      sectionTitle: "",
      displayOrder: sections.length,
      isActive: true,
      links: [],
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (index: number) => {
    if (confirm("Are you sure you want to remove this section?")) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const handleUpdateSection = (index: number, field: keyof FooterSection, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleAddLink = (sectionIndex: number) => {
    const updated = [...sections];
    const newLink: FooterLink = {
      label: "",
      url: "",
      displayOrder: updated[sectionIndex].links.length,
      isActive: true,
    };
    updated[sectionIndex].links.push(newLink);
    setSections(updated);
  };

  const handleRemoveLink = (sectionIndex: number, linkIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].links = updated[sectionIndex].links.filter((_, i) => i !== linkIndex);
    setSections(updated);
  };

  const handleUpdateLink = (
    sectionIndex: number,
    linkIndex: number,
    field: keyof FooterLink,
    value: any
  ) => {
    const updated = [...sections];
    updated[sectionIndex].links[linkIndex] = {
      ...updated[sectionIndex].links[linkIndex],
      [field]: value,
    };
    setSections(updated);
  };

  const handleSaveFooter = async () => {
    setFooterError("");
    setFooterSuccess("");
    setFooterSaving(true);

    try {
      // Validate sections
      for (const section of sections) {
        if (!section.sectionTitle.trim()) {
          throw new Error("All sections must have a title");
        }
        for (const link of section.links) {
          if (!link.label.trim() || !link.url.trim()) {
            throw new Error("All links must have both label and URL");
          }
        }
      }

      // Prepare data for API (remove IDs for new items)
      const sectionsToSave = sections.map((section, idx) => ({
        sectionTitle: section.sectionTitle,
        displayOrder: idx,
        isActive: section.isActive,
        links: section.links.map((link, linkIdx) => ({
          label: link.label,
          url: link.url,
          displayOrder: linkIdx,
          isActive: link.isActive,
        })),
      }));

      await api.saveFooterConfig(sectionsToSave);
      setFooterSuccess("Footer configuration saved successfully!");
      setTimeout(() => setFooterSuccess(""), 5000);
      await loadFooterConfig();
    } catch (err: any) {
      setFooterError(err.message || "Failed to save footer configuration");
    } finally {
      setFooterSaving(false);
    }
  };

  if (loading && activeTab === "system") {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div style={{ ...typography.h3, color: colors.text.primary }}>Loading settings...</div>
      </div>
    );
  }

  if (footerLoading && activeTab === "footer") {
    return (
      <div style={{ padding: spacing.xl, textAlign: "center" }}>
        <div style={{ ...typography.h3, color: colors.text.primary }}>Loading footer configuration...</div>
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
        title="Settings"
        subtitle="System configuration and footer management"
      />

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: spacing.sm,
          marginBottom: spacing.lg,
          borderBottom: `2px solid ${colors.surface.card}`,
        }}
      >
        <button
          onClick={() => setActiveTab("system")}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: "none",
            border: "none",
            borderBottom: activeTab === "system" ? `3px solid ${colors.accent.main}` : "none",
            color: activeTab === "system" ? colors.text.primary : colors.text.muted,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.primary,
            transition: "all 0.2s",
          }}
        >
          System Settings
        </button>
        <button
          onClick={() => setActiveTab("footer")}
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            background: "none",
            border: "none",
            borderBottom: activeTab === "footer" ? `3px solid ${colors.accent.main}` : "none",
            color: activeTab === "footer" ? colors.text.primary : colors.text.muted,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: typography.fontSize.base,
            fontFamily: typography.fontFamily.primary,
            transition: "all 0.2s",
          }}
        >
          Footer Configuration
        </button>
      </div>

      {/* System Settings Tab */}
      {activeTab === "system" && (
        <>
          {(error || success) && (
            <div
              style={{
                padding: spacing.md,
                marginBottom: spacing.md,
                background: error ? colors.error.light : colors.success.light,
                color: error ? colors.error.main : colors.success.main,
                borderRadius: borderRadius.md,
              }}
            >
              {error || success}
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
        </>
      )}

      {/* Footer Configuration Tab */}
      {activeTab === "footer" && (
        <>
          {(footerError || footerSuccess) && (
            <div
              style={{
                padding: spacing.md,
                marginBottom: spacing.md,
                background: footerError ? colors.error.light : colors.success.light,
                color: footerError ? colors.error.main : colors.success.main,
                borderRadius: borderRadius.md,
              }}
            >
              {footerError || footerSuccess}
            </div>
          )}

          <div style={{ marginBottom: spacing.lg }}>
            <Button onClick={handleAddSection} variant="secondary">
              + Add Section
            </Button>
            <Button
              onClick={handleSaveFooter}
              variant="primary"
              disabled={footerSaving}
              style={{ marginLeft: spacing.sm }}
            >
              {footerSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>

          {sections.map((section, sectionIndex) => (
            <motion.div
              key={sectionIndex}
              variants={cardVariants}
              style={{ marginBottom: spacing.lg }}
            >
              <Card variant="default" padding="lg">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md }}>
                  <div style={{ flex: 1, marginRight: spacing.md }}>
                    <Input
                      label="Section Title"
                      value={section.sectionTitle}
                      onChange={(e) =>
                        handleUpdateSection(sectionIndex, "sectionTitle", e.target.value)
                      }
                      placeholder="e.g., About Clubs, Teams Info"
                    />
                  </div>
                  <div style={{ display: "flex", gap: spacing.sm, alignItems: "center", marginTop: 24 }}>
                    <label style={{ ...typography.body, color: colors.text.secondary, display: "flex", alignItems: "center", gap: spacing.xs }}>
                      <input
                        type="checkbox"
                        checked={section.isActive}
                        onChange={(e) =>
                          handleUpdateSection(sectionIndex, "isActive", e.target.checked)
                        }
                      />
                      Active
                    </label>
                    <Button
                      onClick={() => handleRemoveSection(sectionIndex)}
                      variant="secondary"
                      style={{ background: colors.error.light, color: colors.error.main }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div style={{ marginTop: spacing.md }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                    <h4 style={{ ...typography.h4, color: colors.text.secondary }}>Links</h4>
                    <Button
                      onClick={() => handleAddLink(sectionIndex)}
                      variant="secondary"
                      size="sm"
                    >
                      + Add Link
                    </Button>
                  </div>

                  {section.links.map((link, linkIndex) => (
                    <div
                      key={linkIndex}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr auto auto auto",
                        gap: spacing.sm,
                        alignItems: "center",
                        marginBottom: spacing.sm,
                        padding: spacing.sm,
                        background: "rgba(255,255,255,0.02)",
                        borderRadius: borderRadius.sm,
                      }}
                    >
                      <Input
                        placeholder="Link Label"
                        value={link.label}
                        onChange={(e) =>
                          handleUpdateLink(sectionIndex, linkIndex, "label", e.target.value)
                        }
                      />
                      <Input
                        placeholder="URL (e.g., /about, /shop, https://...)"
                        value={link.url}
                        onChange={(e) =>
                          handleUpdateLink(sectionIndex, linkIndex, "url", e.target.value)
                        }
                      />
                      <label style={{ ...typography.caption, color: colors.text.muted, display: "flex", alignItems: "center", gap: spacing.xs }}>
                        <input
                          type="checkbox"
                          checked={link.isActive}
                          onChange={(e) =>
                            handleUpdateLink(sectionIndex, linkIndex, "isActive", e.target.checked)
                          }
                        />
                        Active
                      </label>
                      <Button
                        onClick={() => handleRemoveLink(sectionIndex, linkIndex)}
                        variant="secondary"
                        size="sm"
                        style={{ background: colors.error.light, color: colors.error.main }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  {section.links.length === 0 && (
                    <p style={{ ...typography.body, color: colors.text.muted, fontStyle: "italic" }}>
                      No links in this section. Click "Add Link" to add one.
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}

          {sections.length === 0 && (
            <Card variant="default" padding="lg">
              <p style={{ ...typography.body, color: colors.text.muted, textAlign: "center" }}>
                No footer sections configured. Click "Add Section" to create one.
              </p>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
};

export default AdminSettingsPage;

import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { pageVariants, cardVariants } from "../../utils/motion";

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

const FooterConfigPage: React.FC = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadFooterConfig();
  }, []);

  const loadFooterConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getFooterConfigAdmin();
      setSections(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load footer configuration");
      // Initialize with default sections if none exist
      if (err.status === 404 || !data) {
        setSections(getDefaultSections());
      }
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

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
      setSuccess("Footer configuration saved successfully!");
      setTimeout(() => setSuccess(""), 5000);
      await loadFooterConfig();
    } catch (err: any) {
      setError(err.message || "Failed to save footer configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        title="Footer Configuration"
        subtitle="Manage footer sections and links displayed on the website"
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

      <div style={{ marginBottom: spacing.lg }}>
        <Button onClick={handleAddSection} variant="secondary">
          + Add Section
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
          disabled={saving}
          style={{ marginLeft: spacing.sm }}
        >
          {saving ? "Saving..." : "Save Configuration"}
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
    </motion.div>
  );
};

export default FooterConfigPage;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

const CentreFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    addressLine: "",
    locality: "",
    city: "",
    state: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    googleMapsUrl: "",
    isActive: true,
    displayOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadCentre();
    }
  }, [id]);

  const loadCentre = async () => {
    try {
      setLoading(true);
      const data = await api.getCenter(Number(id));
      const centre = data.center || data;
      setFormData({
        name: centre.name || "",
        shortName: centre.shortName || "",
        addressLine: centre.addressLine || "",
        locality: centre.locality || "",
        city: centre.city || "",
        state: centre.state || "",
        postalCode: centre.postalCode || "",
        latitude: centre.latitude?.toString() || "",
        longitude: centre.longitude?.toString() || "",
        googleMapsUrl: centre.googleMapsUrl || "",
        isActive: centre.isActive !== undefined ? centre.isActive : true,
        displayOrder: centre.displayOrder || 0,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load centre");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.shortName.trim()) {
      errors.shortName = "Short name is required";
    }
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    if (!formData.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    }
    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      errors.latitude = "Latitude must be a valid number";
    }
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      errors.longitude = "Longitude must be a valid number";
    }
    if (formData.googleMapsUrl && !formData.googleMapsUrl.startsWith("http")) {
      errors.googleMapsUrl = "Google Maps URL must start with http:// or https://";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const data = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        displayOrder: parseInt(formData.displayOrder.toString()) || 0,
      };

      if (isEditMode) {
        await api.updateCenter(Number(id), data);
      } else {
        await api.createCenter(data);
      }

      navigate("/realverse/admin/centres");
    } catch (err: any) {
      setError(err.message || "Failed to save centre");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: spacing.xl, color: colors.text.primary }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: spacing.xl, maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: spacing.xl }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/realverse/admin/centres")}
          style={{ marginBottom: spacing.md }}
        >
          ← Back to Centres
        </Button>
        <h1
          style={{
            ...typography.h1,
            color: colors.text.primary,
            marginBottom: spacing.xs,
          }}
        >
          {isEditMode ? "Edit Centre" : "Create New Centre"}
        </h1>
        <p style={{ ...typography.body, color: colors.text.muted }}>
          {isEditMode
            ? "Update centre information and location details"
            : "Add a new training centre to the system"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card
          variant="default"
          padding="md"
          style={{
            marginBottom: spacing.md,
            background: colors.danger.soft,
            border: `1px solid ${colors.danger.main}40`,
          }}
        >
          <p style={{ margin: 0, color: colors.danger.main }}>Error: {error}</p>
        </Card>
      )}

      {/* Form */}
      <Card variant="elevated" padding="xl">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
            {/* Name */}
            <div>
              <label
                style={{
                  ...typography.body,
                  display: "block",
                  marginBottom: spacing.xs,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Centre Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., 3lok Football Fitness Hub"
                style={{
                  width: "100%",
                  borderColor: validationErrors.name ? colors.danger.main : undefined,
                }}
              />
              {validationErrors.name && (
                <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Short Name */}
            <div>
              <label
                style={{
                  ...typography.body,
                  display: "block",
                  marginBottom: spacing.xs,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Short Name (Unique) *
              </label>
              <Input
                type="text"
                value={formData.shortName}
                onChange={(e) => handleChange("shortName", e.target.value.toUpperCase())}
                placeholder="e.g., 3LOK"
                style={{
                  width: "100%",
                  borderColor: validationErrors.shortName ? colors.danger.main : undefined,
                }}
              />
              {validationErrors.shortName && (
                <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                  {validationErrors.shortName}
                </p>
              )}
              <p style={{ color: colors.text.muted, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                Unique identifier (uppercase, no spaces)
              </p>
            </div>

            {/* Address Line */}
            <div>
              <label
                style={{
                  ...typography.body,
                  display: "block",
                  marginBottom: spacing.xs,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Address Line
              </label>
              <Input
                type="text"
                value={formData.addressLine}
                onChange={(e) => handleChange("addressLine", e.target.value)}
                placeholder="Full address"
                style={{ width: "100%" }}
              />
            </div>

            {/* Locality */}
            <div>
              <label
                style={{
                  ...typography.body,
                  display: "block",
                  marginBottom: spacing.xs,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Locality
              </label>
              <Input
                type="text"
                value={formData.locality}
                onChange={(e) => handleChange("locality", e.target.value)}
                placeholder="e.g., Seegehalli"
                style={{ width: "100%" }}
              />
            </div>

            {/* City & State */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
              <div>
                <label
                  style={{
                    ...typography.body,
                    display: "block",
                    marginBottom: spacing.xs,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  City *
                </label>
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g., Bengaluru"
                  style={{
                    width: "100%",
                    borderColor: validationErrors.city ? colors.danger.main : undefined,
                  }}
                />
                {validationErrors.city && (
                  <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                    {validationErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label
                  style={{
                    ...typography.body,
                    display: "block",
                    marginBottom: spacing.xs,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  State *
                </label>
                <Input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="e.g., Karnataka"
                  style={{
                    width: "100%",
                    borderColor: validationErrors.state ? colors.danger.main : undefined,
                  }}
                />
                {validationErrors.state && (
                  <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                    {validationErrors.state}
                  </p>
                )}
              </div>
            </div>

            {/* Postal Code */}
            <div>
              <label
                style={{
                  ...typography.body,
                  display: "block",
                  marginBottom: spacing.xs,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Postal Code *
              </label>
              <Input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="e.g., 560067"
                style={{
                  width: "100%",
                  borderColor: validationErrors.postalCode ? colors.danger.main : undefined,
                }}
              />
              {validationErrors.postalCode && (
                <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                  {validationErrors.postalCode}
                </p>
              )}
            </div>

            {/* Latitude & Longitude */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
              <div>
                <label
                  style={{
                    ...typography.body,
                    display: "block",
                    marginBottom: spacing.xs,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  placeholder="e.g., 12.9716"
                  style={{
                    width: "100%",
                    borderColor: validationErrors.latitude ? colors.danger.main : undefined,
                  }}
                />
                {validationErrors.latitude && (
                  <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                    {validationErrors.latitude}
                  </p>
                )}
              </div>
              <div>
                <label
                  style={{
                    ...typography.body,
                    display: "block",
                    marginBottom: spacing.xs,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  placeholder="e.g., 77.7496"
                  style={{
                    width: "100%",
                    borderColor: validationErrors.longitude ? colors.danger.main : undefined,
                  }}
                />
                {validationErrors.longitude && (
                  <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                    {validationErrors.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* Google Maps URL */}
            <div>
              <label
                style={{
                  ...typography.body,
                  display: "block",
                  marginBottom: spacing.xs,
                  color: colors.text.primary,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Google Maps URL
              </label>
              <Input
                type="url"
                value={formData.googleMapsUrl}
                onChange={(e) => handleChange("googleMapsUrl", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                style={{
                  width: "100%",
                  borderColor: validationErrors.googleMapsUrl ? colors.danger.main : undefined,
                }}
              />
              {validationErrors.googleMapsUrl && (
                <p style={{ color: colors.danger.main, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                  {validationErrors.googleMapsUrl}
                </p>
              )}
            </div>

            {/* Display Order & Active Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
              <div>
                <label
                  style={{
                    ...typography.body,
                    display: "block",
                    marginBottom: spacing.xs,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleChange("displayOrder", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  style={{ width: "100%" }}
                />
                <p style={{ color: colors.text.muted, fontSize: typography.fontSize.xs, marginTop: spacing.xs }}>
                  Lower numbers appear first
                </p>
              </div>
              <div>
                <label
                  style={{
                    ...typography.body,
                    display: "block",
                    marginBottom: spacing.xs,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  Status
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    style={{ width: 20, height: 20, cursor: "pointer" }}
                  />
                  <span style={{ ...typography.body, color: colors.text.secondary }}>
                    Active (visible on homepage)
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.md }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                style={{ flex: 1 }}
              >
                {saving ? "Saving..." : isEditMode ? "Update Centre" : "Create Centre"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate("/realverse/admin/centres")}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CentreFormPage;


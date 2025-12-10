import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  images: string[];
  price: string;
  currency: string;
  sizes: string[];
  variants: any;
  stock: string;
  category: string;
  tags: string[];
  displayOrder: string;
  isActive: boolean;
}

const MerchandiseFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    images: [],
    price: "",
    currency: "INR",
    sizes: [],
    variants: null,
    stock: "",
    category: "",
    tags: [],
    displayOrder: "0",
    isActive: true,
  });

  const [sizeInput, setSizeInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      loadProduct();
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Auto-generate slug from name
    if (!isEdit && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData({ ...formData, slug });
    }
  }, [formData.name]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await api.getAdminProduct(parseInt(id!));
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        images: product.images || [],
        price: (product.price / 100).toFixed(2),
        currency: product.currency || "INR",
        sizes: product.sizes || [],
        variants: product.variants || null,
        stock: product.stock !== null ? product.stock.toString() : "",
        category: product.category || "",
        tags: product.tags || [],
        displayOrder: product.displayOrder?.toString() || "0",
        isActive: product.isActive,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSize = () => {
    if (sizeInput.trim() && !formData.sizes.includes(sizeInput.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, sizeInput.trim()] });
      setSizeInput("");
    }
  };

  const handleRemoveSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim() && !formData.images.includes(imageUrlInput.trim())) {
      setFormData({ ...formData, images: [...formData.images, imageUrlInput.trim()] });
      setImageUrlInput("");
    }
  };

  const handleRemoveImage = (image: string) => {
    setFormData({ ...formData, images: formData.images.filter((img) => img !== image) });
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...formData.images];
    if (direction === "up" && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === "down" && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    // Validation
    if (!formData.name.trim()) {
      setError("Product name is required");
      setSaving(false);
      return;
    }

    if (!formData.slug.trim()) {
      setError("Product slug is required");
      setSaving(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      setSaving(false);
      return;
    }

    if (formData.images.length === 0) {
      setError("At least one image is required");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        images: formData.images,
        price: parseFloat(formData.price),
        currency: formData.currency,
        sizes: formData.sizes,
        variants: formData.variants || undefined,
        stock: formData.stock ? parseInt(formData.stock) : null,
        category: formData.category.trim() || undefined,
        tags: formData.tags,
        displayOrder: parseInt(formData.displayOrder) || 0,
        isActive: formData.isActive,
      };

      if (isEdit) {
        await api.updateProduct(parseInt(id!), payload);
        setSuccess("Product updated successfully!");
      } else {
        await api.createProduct(payload);
        setSuccess("Product created successfully!");
        setTimeout(() => {
          navigate("/realverse/admin/merch");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <PageHeader title={isEdit ? "Edit Product" : "Create Product"} />
        <Card variant="elevated" padding="xl" style={{ textAlign: "center" }}>
          <p style={{ color: colors.text.secondary }}>Loading...</p>
        </Card>
      </motion.main>
    );
  }

  return (
    <motion.main
      className="rv-page rv-page--dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader
        title={isEdit ? "Edit Product" : "Create Product"}
        subtitle={isEdit ? "Update product details" : "Add a new product to the shop"}
        actions={
          <Button variant="secondary" onClick={() => navigate("/realverse/admin/merch")}>
            ← Back to List
          </Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: spacing.xl }}>
          {/* Error/Success Messages */}
          {error && (
            <Card variant="elevated" padding="md" style={{ background: colors.danger.light, color: colors.text.onDanger }}>
              {error}
            </Card>
          )}
          {success && (
            <Card variant="elevated" padding="md" style={{ background: colors.success.light, color: colors.text.onSuccess }}>
              {success}
            </Card>
          )}

          {/* Basic Information */}
          <motion.div variants={cardVariants}>
            <Card variant="elevated" padding="xl">
              <h2 style={{ ...typography.h2, marginBottom: spacing.lg }}>Basic Information</h2>
              
              <div style={{ display: "grid", gap: spacing.lg }}>
                <div>
                  <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., FC Real Bengaluru Home Jersey"
                    style={{
                      width: "100%",
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.border.dark}`,
                      background: colors.surface.card,
                      color: colors.text.primary,
                      ...typography.body,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                    placeholder="e.g., home-jersey-2024"
                    style={{
                      width: "100%",
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.border.dark}`,
                      background: colors.surface.card,
                      color: colors.text.primary,
                      ...typography.body,
                    }}
                  />
                  <p style={{ ...typography.body, fontSize: typography.fontSize.sm, color: colors.text.muted, marginTop: spacing.xs }}>
                    URL-friendly identifier (auto-generated from name)
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product description..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.border.dark}`,
                      background: colors.surface.card,
                      color: colors.text.primary,
                      ...typography.body,
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: spacing.md }}>
                  <div>
                    <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.border.dark}`,
                        background: colors.surface.card,
                        color: colors.text.primary,
                        ...typography.body,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      style={{
                        width: "100%",
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.border.dark}`,
                        background: colors.surface.card,
                        color: colors.text.primary,
                        ...typography.body,
                      }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.border.dark}`,
                        background: colors.surface.card,
                        color: colors.text.primary,
                        ...typography.body,
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
                  <div>
                    <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Jersey, Shorts, Accessories"
                      style={{
                        width: "100%",
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.border.dark}`,
                        background: colors.surface.card,
                        color: colors.text.primary,
                        ...typography.body,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="Leave empty for unlimited"
                      style={{
                        width: "100%",
                        padding: spacing.sm,
                        borderRadius: borderRadius.md,
                        border: `1px solid ${colors.border.dark}`,
                        background: colors.surface.card,
                        color: colors.text.primary,
                        ...typography.body,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Images */}
          <motion.div variants={cardVariants}>
            <Card variant="elevated" padding="xl">
              <h2 style={{ ...typography.h2, marginBottom: spacing.lg }}>Images *</h2>
              
              <div style={{ marginBottom: spacing.lg }}>
                <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.md }}>
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Image URL"
                    style={{
                      flex: 1,
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.border.dark}`,
                      background: colors.surface.card,
                      color: colors.text.primary,
                      ...typography.body,
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddImage}>
                    Add Image
                  </Button>
                </div>

                {formData.images.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: spacing.md }}>
                    {formData.images.map((image, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          style={{
                            width: "100%",
                            height: 150,
                            objectFit: "cover",
                            borderRadius: borderRadius.md,
                            border: `1px solid ${colors.border.dark}`,
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        <div style={{ position: "absolute", top: spacing.xs, right: spacing.xs, display: "flex", gap: spacing.xs }}>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, "up")}
                              style={{
                                padding: spacing.xs,
                                background: colors.surface.card,
                                border: "none",
                                borderRadius: borderRadius.sm,
                                cursor: "pointer",
                                fontSize: typography.fontSize.sm,
                              }}
                            >
                              ↑
                            </button>
                          )}
                          {index < formData.images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, "down")}
                              style={{
                                padding: spacing.xs,
                                background: colors.surface.card,
                                border: "none",
                                borderRadius: borderRadius.sm,
                                cursor: "pointer",
                                fontSize: typography.fontSize.sm,
                              }}
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image)}
                            style={{
                              padding: spacing.xs,
                              background: colors.danger.main,
                              color: colors.text.onDanger,
                              border: "none",
                              borderRadius: borderRadius.sm,
                              cursor: "pointer",
                              fontSize: typography.fontSize.sm,
                            }}
                          >
                            ×
                          </button>
                        </div>
                        {index === 0 && (
                          <div style={{ position: "absolute", bottom: spacing.xs, left: spacing.xs, background: colors.accent.main, color: colors.text.onAccent, padding: `${spacing.xs} ${spacing.sm}`, borderRadius: borderRadius.sm, fontSize: typography.fontSize.xs }}>
                            Primary
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Sizes */}
          <motion.div variants={cardVariants}>
            <Card variant="elevated" padding="xl">
              <h2 style={{ ...typography.h2, marginBottom: spacing.lg }}>Size Options</h2>
              
              <div style={{ marginBottom: spacing.md }}>
                <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.md }}>
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="e.g., S, M, L, XL"
                    style={{
                      flex: 1,
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.border.dark}`,
                      background: colors.surface.card,
                      color: colors.text.primary,
                      ...typography.body,
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSize();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddSize}>
                    Add Size
                  </Button>
                </div>

                {formData.sizes.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                    {formData.sizes.map((size) => (
                      <span
                        key={size}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          borderRadius: borderRadius.md,
                          background: colors.surface.subtle,
                          color: colors.text.primary,
                          ...typography.body,
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.xs,
                        }}
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(size)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: colors.text.secondary,
                            cursor: "pointer",
                            fontSize: typography.fontSize.lg,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Tags */}
          <motion.div variants={cardVariants}>
            <Card variant="elevated" padding="xl">
              <h2 style={{ ...typography.h2, marginBottom: spacing.lg }}>Tags</h2>
              
              <div style={{ marginBottom: spacing.md }}>
                <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.md }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g., new, popular, limited-edition"
                    style={{
                      flex: 1,
                      padding: spacing.sm,
                      borderRadius: borderRadius.md,
                      border: `1px solid ${colors.border.dark}`,
                      background: colors.surface.card,
                      color: colors.text.primary,
                      ...typography.body,
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddTag}>
                    Add Tag
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          borderRadius: borderRadius.md,
                          background: colors.accent.light,
                          color: colors.text.onAccent,
                          ...typography.body,
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.xs,
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: colors.text.onAccent,
                            cursor: "pointer",
                            fontSize: typography.fontSize.lg,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Status */}
          <motion.div variants={cardVariants}>
            <Card variant="elevated" padding="xl">
              <h2 style={{ ...typography.h2, marginBottom: spacing.lg }}>Status</h2>
              
              <label style={{ display: "flex", alignItems: "center", gap: spacing.sm, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 20, height: 20, cursor: "pointer" }}
                />
                <span style={{ ...typography.body }}>Active (visible in shop)</span>
              </label>
            </Card>
          </motion.div>

          {/* Submit */}
          <div style={{ display: "flex", gap: spacing.md, justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/realverse/admin/merch")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      </form>
    </motion.main>
  );
};

export default MerchandiseFormPage;



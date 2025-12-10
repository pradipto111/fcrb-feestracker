import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  price: number;
  currency: string;
  sizes: string[];
  variants?: any;
  stock?: number | null;
  category?: string;
  tags: string[];
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const MerchandiseListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    search: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminProducts(filters);
      setProducts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getProductCategories();
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await api.updateProduct(product.id, { isActive: !product.isActive });
      await loadProducts();
    } catch (err: any) {
      alert(err.message || "Failed to update product");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await api.deleteProduct(product.id);
      await loadProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product");
    }
  };

  const formatPrice = (paise: number, currency: string = "INR") => {
    if (currency === "INR") {
      return `₹${(paise / 100).toFixed(2)}`;
    }
    return `${(paise / 100).toFixed(2)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.main
      className="rv-page rv-page--dashboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <PageHeader
        title="Merchandise"
        subtitle="Manage products for the FC Real Bengaluru shop"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/realverse/admin/merch/new")}
          >
            + Create Product
          </Button>
        }
      />

      {/* Filters */}
      <Card variant="elevated" padding="lg" style={{ marginBottom: spacing.xl }}>
        <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: spacing.xs, ...typography.body, fontWeight: typography.fontWeight.medium }}>
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
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
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card variant="elevated" padding="md" style={{ marginBottom: spacing.lg, background: colors.danger.light, color: colors.text.onDanger }}>
          {error}
        </Card>
      )}

      {/* Products List */}
      {loading ? (
        <Card variant="elevated" padding="xl" style={{ textAlign: "center" }}>
          <p style={{ color: colors.text.secondary }}>Loading products...</p>
        </Card>
      ) : products.length === 0 ? (
        <Card variant="elevated" padding="xl" style={{ textAlign: "center" }}>
          <p style={{ color: colors.text.secondary, marginBottom: spacing.lg }}>
            No products found. Create your first product to get started!
          </p>
          <Button variant="primary" onClick={() => navigate("/realverse/admin/merch/new")}>
            Create Product
          </Button>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: spacing.lg }}>
          {products.map((product) => (
            <motion.div key={product.id} variants={cardVariants}>
              <Card variant="elevated" padding="lg">
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: spacing.lg, alignItems: "center" }}>
                  {/* Thumbnail */}
                  <div style={{ width: 120, height: 120, borderRadius: borderRadius.md, overflow: "hidden", background: colors.surface.subtle }}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: colors.text.muted }}>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs }}>
                      <h3 style={{ ...typography.h3, margin: 0, color: colors.text.primary }}>
                        {product.name}
                      </h3>
                      {!product.isActive && (
                        <span style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          borderRadius: borderRadius.sm,
                          background: colors.danger.light,
                          color: colors.text.onDanger,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.medium,
                        }}>
                          Inactive
                        </span>
                      )}
                    </div>
                    <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xs }}>
                      {product.description || "No description"}
                    </p>
                    <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap", marginTop: spacing.sm }}>
                      <span style={{ ...typography.body, color: colors.text.secondary }}>
                        <strong>Price:</strong> {formatPrice(product.price, product.currency)}
                      </span>
                      {product.category && (
                        <span style={{ ...typography.body, color: colors.text.secondary }}>
                          <strong>Category:</strong> {product.category}
                        </span>
                      )}
                      {product.stock !== null && (
                        <span style={{ ...typography.body, color: colors.text.secondary }}>
                          <strong>Stock:</strong> {product.stock}
                        </span>
                      )}
                      <span style={{ ...typography.body, color: colors.text.muted }}>
                        Updated: {formatDate(product.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/realverse/admin/merch/${product.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={product.isActive ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => handleToggleActive(product)}
                    >
                      {product.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.main>
  );
};

export default MerchandiseListPage;



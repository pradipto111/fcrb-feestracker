import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  price: number;
  sizes: string[];
  variants?: any;
  stock?: number;
  isActive: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      const data = await api.getProduct(slug!);
      // Check if product is active (shop API should already filter, but double-check)
      if (!data.isActive) {
        setProduct(null);
        return;
      }
      setProduct(data);
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    } catch (error: any) {
      console.error("Failed to load product:", error);
      // If 404, product doesn't exist or is inactive
      if (error.message && error.message.includes("not found")) {
        setProduct(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.images?.[0],
      variant: selectedVariant || undefined,
      size: selectedSize || undefined,
      quantity,
      unitPrice: product.price,
    });

    // Show feedback
    alert("Added to cart!");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
          color: colors.text.primary,
        }}
      >
        <PublicHeader />
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            paddingTop: "120px",
            textAlign: "center",
          }}
        >
          <Card variant="elevated" padding="xl">
            <p style={{ color: colors.text.secondary }}>Loading product...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
          color: colors.text.primary,
        }}
      >
        <PublicHeader />
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            paddingTop: "120px",
            textAlign: "center",
          }}
        >
          <Card variant="elevated" padding="xl">
            <h2 style={{ ...typography.h2, marginBottom: spacing.md, color: colors.text.primary }}>
              Product Not Available
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl }}>
              This product is no longer available or has been removed.
            </p>
            <Link to="/shop" style={{ textDecoration: "none" }}>
              <Button variant="primary">Continue Shopping</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  if (false) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
          color: colors.text.primary,
        }}
      >
        <PublicHeader />
        <div style={{ padding: spacing["4xl"], textAlign: "center", paddingTop: "120px" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
          color: colors.text.primary,
        }}
      >
        <PublicHeader />
        <div style={{ padding: spacing["4xl"], textAlign: "center", paddingTop: "120px" }}>
          <Card variant="elevated" padding="xl">
            <h2 style={{ ...typography.h2, marginBottom: spacing.md }}>Product not found</h2>
            <Link to="/shop" style={{ textDecoration: "none" }}>
              <Button variant="primary">Back to Shop</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
      }}
    >
      <PublicHeader />
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          paddingTop: "120px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: spacing["2xl"],
          }}
        >
          {/* Product Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <Card variant="elevated" padding="none">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: borderRadius.xl,
                  }}
                />
              </Card>
            ) : (
              <Card variant="elevated" padding="xl" style={{ minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: colors.text.muted }}>No image available</div>
              </Card>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1
              style={{
                ...typography.h1,
                marginBottom: spacing.lg,
                color: colors.text.primary,
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                ...typography.h2,
                color: colors.accent.main,
                marginBottom: spacing.lg,
              }}
            >
              {formatPrice(product.price)}
            </div>

            {product.description && (
              <p
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  marginBottom: spacing.xl,
                  lineHeight: 1.7,
                }}
              >
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: spacing.lg }}>
                <label
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.sm,
                    display: "block",
                  }}
                >
                  Size *
                </label>
                <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        background:
                          selectedSize === size
                            ? colors.primary.main
                            : colors.surface.card,
                        color:
                          selectedSize === size
                            ? colors.text.onPrimary
                            : colors.text.primary,
                        border: `1px solid ${
                          selectedSize === size
                            ? colors.primary.main
                            : "rgba(255, 255, 255, 0.1)"
                        }`,
                        borderRadius: borderRadius.md,
                        cursor: "pointer",
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ marginBottom: spacing.lg }}>
              <label
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                  display: "block",
                }}
              >
                Quantity
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: 40,
                    height: 40,
                    background: colors.surface.card,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    cursor: "pointer",
                    fontSize: typography.fontSize.lg,
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    ...typography.h4,
                    minWidth: "40px",
                    textAlign: "center",
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: 40,
                    height: 40,
                    background: colors.surface.card,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                    cursor: "pointer",
                    fontSize: typography.fontSize.lg,
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleAddToCart}
              style={{ marginBottom: spacing.md }}
            >
              Add to Cart
            </Button>

            <Link to="/shop" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="lg" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;


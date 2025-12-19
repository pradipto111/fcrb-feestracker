import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { Card } from "../components/ui/Card";
import { api } from "../api/client";
import { useCart } from "../context/CartContext";
import { shopAssets } from "../config/assets";

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
              <motion.div
                whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAStyles.blue,
                  width: "auto",
                  minWidth: 260,
                  minHeight: 56,
                  padding: "12px 18px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                  <span style={heroCTAStyles.blue.textStyle}>Continue Shopping</span>
                  <span style={heroCTAStyles.blue.subtitleStyle}>Browse the official store</span>
                </div>
                <span style={{ color: colors.text.onPrimary, fontWeight: 800 }}>→</span>
              </motion.div>
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
              <motion.div
                whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAStyles.blue,
                  width: "auto",
                  minWidth: 240,
                  minHeight: 56,
                  padding: "12px 18px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                  <span style={heroCTAStyles.blue.textStyle}>Back to Shop</span>
                  <span style={heroCTAStyles.blue.subtitleStyle}>See all products</span>
                </div>
                <span style={{ color: colors.text.onPrimary, fontWeight: 800 }}>→</span>
              </motion.div>
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
        position: "relative",
      }}
    >
      {/* Subtle background texture */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${shopAssets.jerseys[0]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.03,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <PublicHeader />
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          paddingTop: "120px",
          position: "relative",
          zIndex: 1,
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
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        ...heroCTAPillStyles.base,
                        ...(selectedSize === size ? heroCTAPillStyles.blue : {}),
                        padding: "10px 14px",
                        boxShadow: "none",
                        background: selectedSize === size ? "rgba(10,61,145,0.20)" : "rgba(255,255,255,0.03)",
                        border: selectedSize === size ? `2px solid ${colors.primary.main}` : "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      {size}
                    </motion.button>
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
                <motion.button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...heroCTAPillStyles.base,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.03)",
                    width: 40,
                    height: 40,
                    padding: 0,
                    boxShadow: "none",
                    justifyContent: "center",
                  }}
                >
                  −
                </motion.button>
                <span
                  style={{
                    ...typography.h4,
                    minWidth: "40px",
                    textAlign: "center",
                  }}
                >
                  {quantity}
                </span>
                <motion.button
                  onClick={() => setQuantity(quantity + 1)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...heroCTAPillStyles.base,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.03)",
                    width: 40,
                    height: 40,
                    padding: 0,
                    boxShadow: "none",
                    justifyContent: "center",
                  }}
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              type="button"
              onClick={handleAddToCart}
              whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...heroCTAStyles.blue,
                width: "100%",
                marginBottom: spacing.md,
                minHeight: 64,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                <span style={heroCTAStyles.blue.textStyle}>Add to Cart</span>
                <span style={heroCTAStyles.blue.subtitleStyle}>Secure checkout in 2 steps</span>
              </div>
              <span style={{ color: colors.text.onPrimary, fontWeight: 800 }}>→</span>
            </motion.button>

            <Link to="/shop" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAStyles.darkWithBorder,
                  width: "100%",
                  minHeight: 64,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: spacing.md,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                  <span style={heroCTAStyles.darkWithBorder.textStyle}>Continue Shopping</span>
                  <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>Back to the store grid</span>
                </div>
                <span style={{ color: colors.accent.main, fontWeight: 800 }}>→</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;


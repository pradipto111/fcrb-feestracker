import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { heroCTAPillStyles } from "../../theme/hero-design-patterns";
import type { Product } from "../../data/products";
import { formatShopPrice, getPrimaryTag, isFanLocked } from "../../utils/shop";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const primaryTag = getPrimaryTag(product);
  const locked = isFanLocked(product);

  return (
    <>
      <motion.div
        whileHover={{
          y: -6,
          scale: 1.02,
          boxShadow: shadows.lg,
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: borderRadius.xl,
          border: "1px solid rgba(255,255,255,0.10)",
          background:
            "radial-gradient(circle at top left, rgba(0,224,255,0.12) 0%, rgba(5,11,32,0.96) 42%, rgba(5,11,32,1) 100%)",
          overflow: "hidden",
          position: "relative",
          cursor: "default",
        }}
      >
        {/* Tag ribbon */}
        {primaryTag && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "4px 10px",
              borderRadius: 999,
              background: locked
                ? "linear-gradient(90deg, rgba(255,215,96,0.95), rgba(255,145,0,0.95))"
                : "linear-gradient(90deg, rgba(0,224,255,0.95), rgba(0,122,255,0.95))",
              color: "#050B20",
              ...typography.caption,
              fontSize: typography.fontSize.xs,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {locked ? "Fan Only" : primaryTag}
          </div>
        )}

        {/* Image */}
        <div
          style={{
            position: "relative",
            height: 220,
            backgroundImage: `url(${product.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(5,11,32,0.1) 0%, rgba(5,11,32,0.9) 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            padding: spacing.lg,
            display: "flex",
            flexDirection: "column",
            gap: spacing.sm,
          }}
        >
          <div>
            <h3
              style={{
                ...typography.h4,
                color: colors.text.primary,
                marginBottom: 4,
              }}
            >
              {product.name}
            </h3>
            {locked && (
              <div
                style={{
                  ...typography.caption,
                  fontSize: typography.fontSize.xs,
                  color: colors.accent.main,
                }}
              >
                Unlock with {product.fanTierRequired} Fan Club tier
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: spacing.sm,
              gap: spacing.md,
            }}
          >
            <div>
              <div
                style={{
                  ...typography.h3,
                  color: colors.accent.main,
                  fontWeight: typography.fontWeight.bold,
                }}
              >
                {formatShopPrice(product.price)}
              </div>
              {!product.available && (
                <div
                  style={{
                    ...typography.caption,
                    fontSize: typography.fontSize.xs,
                    color: colors.text.muted,
                  }}
                >
                  Drop #02 • Coming Soon
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "flex-end",
              }}
            >
              <AddToCartButton productId={product.id} />
              <motion.button
                type="button"
                onClick={() => setQuickViewOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAPillStyles.base,
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "8px 12px",
                  boxShadow: "none",
                  color: colors.text.secondary,
                }}
              >
                Quick view
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick view modal */}
      <AnimatePresence>
        {quickViewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 80,
            }}
            onClick={() => setQuickViewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: "min(520px, 92vw)",
                borderRadius: borderRadius["2xl"],
                background:
                  "radial-gradient(circle at top left, rgba(0,224,255,0.16) 0%, rgba(5,11,32,0.98) 50%, rgba(5,11,32,1) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: shadows.xl,
                overflow: "hidden",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  position: "relative",
                  height: 260,
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(5,11,32,0.1) 0%, rgba(5,11,32,0.9) 100%)",
                  }}
                />
              </div>
              <div
                style={{
                  padding: spacing.xl,
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: spacing.lg,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        marginBottom: 4,
                      }}
                    >
                      {product.name}
                    </h2>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                        maxWidth: 320,
                      }}
                    >
                      Match-ready fit, breathable fabric, and club-first detailing
                      built for Indian conditions.
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      minWidth: 120,
                    }}
                  >
                    <div
                      style={{
                        ...typography.h3,
                        color: colors.accent.main,
                        fontWeight: typography.fontWeight.bold,
                      }}
                    >
                      {formatShopPrice(product.price)}
                    </div>
                    <AddToCartButton productId={product.id} />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: spacing.sm,
                  }}
                >
                  <div
                    style={{
                      ...typography.caption,
                      fontSize: typography.fontSize.xs,
                      color: colors.text.muted,
                    }}
                  >
                    Sizes, delivery, and stock levels will be configured in the
                    RealVerse admin panel.
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setQuickViewOpen(false)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...heroCTAPillStyles.base,
                      ...heroCTAPillStyles.gold,
                      padding: "10px 14px",
                      boxShadow: "none",
                    }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};



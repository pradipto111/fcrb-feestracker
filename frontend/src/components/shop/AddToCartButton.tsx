import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { glass } from "../../theme/glass";
import { heroCTAPillStyles } from "../../theme/hero-design-patterns";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../data/products";
import { formatShopPrice } from "../../utils/shop";

interface AddToCartButtonProps {
  productId: string;
  product?: Product;
  onClick?: () => void;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  product,
  onClick,
}) => {
  const { addItem, getItemCount } = useCart();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (!product) {
      console.warn("Product data not provided to AddToCartButton");
      return;
    }

    // Add to cart
    // Use API slug if available, otherwise use ID
    const productSlug = (product as any)._apiData?.slug || product.id;
    const productId = (product as any)._apiData?.id || product.id;
    
    addItem({
      productId: productId,
      productName: product.name,
      productSlug: productSlug,
      productImage: product.image,
      quantity: 1,
      unitPrice: product.price,
    });

    // Show toast notification
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    onClick?.();
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleClick}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        style={{
          ...heroCTAPillStyles.base,
          ...heroCTAPillStyles.blue,
          padding: "10px 14px",
          color: colors.text.primary,
        }}
        aria-label="Add to cart"
      >
        Add to Cart
      </motion.button>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              bottom: spacing.xl,
              right: spacing.xl,
              zIndex: 1000,
              ...glass.card,
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.xl,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              gap: spacing.md,
              minWidth: 280,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                Added to cart!
              </div>
              <div style={{ ...typography.caption, color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
                {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in cart
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => navigate("/cart")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                ...heroCTAPillStyles.base,
                ...heroCTAPillStyles.gold,
                padding: "6px 12px",
                fontSize: typography.fontSize.xs,
              }}
            >
              View Cart
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


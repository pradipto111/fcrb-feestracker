import React from "react";
import { motion } from "framer-motion";
import { colors } from "../../theme/design-tokens";
import { heroCTAPillStyles } from "../../theme/hero-design-patterns";

interface AddToCartButtonProps {
  productId: string;
  onClick?: () => void;
}

// Stubbed button – ready to be wired into CartContext in a later step.
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  onClick,
}) => {
  const handleClick = () => {
    // Placeholder for future cart integration.
    // eslint-disable-next-line no-console
    console.log("Add to cart clicked for", productId);
    onClick?.();
  };

  return (
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
  );
};


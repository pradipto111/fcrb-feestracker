import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { Card } from "../components/ui/Card";
import { useCart } from "../context/CartContext";
import { shopAssets } from "../config/assets";

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const shippingFee = 5000; // ₹50.00 in paise
  const subtotal = getTotal();
  const total = subtotal + shippingFee;

  if (items.length === 0) {
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
            maxWidth: "800px",
            margin: "0 auto",
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            paddingTop: "120px",
            textAlign: "center",
          }}
        >
          <Card variant="elevated" padding="xl">
            <div style={{ fontSize: typography.fontSize["4xl"], marginBottom: spacing.lg }}>🛒</div>
            <h2
              style={{
                ...typography.h2,
                marginBottom: spacing.md,
                color: colors.text.primary,
              }}
            >
              Your cart is empty
            </h2>
            <p
              style={{
                ...typography.body,
                color: colors.text.muted,
                marginBottom: spacing.xl,
              }}
            >
              Start shopping to add items to your cart
            </p>
            <Link to="/shop" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -2 }}
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
          maxWidth: "1200px",
          margin: "0 auto",
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          paddingTop: "120px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h1
          style={{
            ...typography.h1,
            marginBottom: spacing.xl,
            color: colors.text.primary,
          }}
        >
          Shopping Cart
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: spacing.xl,
          }}
        >
          {/* Cart Items */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              {items.map((item, idx) => (
                <Card key={idx} variant="elevated" padding="lg">
                  <div
                    style={{
                      display: "flex",
                      gap: spacing.md,
                    }}
                  >
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: borderRadius.md,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          ...typography.h4,
                          color: colors.text.primary,
                          marginBottom: spacing.xs,
                        }}
                      >
                        {item.productName}
                      </h3>
                      {item.size && (
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                            marginBottom: spacing.xs,
                          }}
                        >
                          Size: {item.size}
                        </div>
                      )}
                      {item.variant && (
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                            marginBottom: spacing.xs,
                          }}
                        >
                          Variant: {item.variant}
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.md,
                          marginTop: spacing.sm,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                          <motion.button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variant, item.size)
                            }
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              ...heroCTAPillStyles.base,
                              border: "1px solid rgba(255,255,255,0.14)",
                              background: "rgba(255,255,255,0.03)",
                              width: 32,
                              height: 32,
                              padding: 0,
                              boxShadow: "none",
                              justifyContent: "center",
                            }}
                          >
                            −
                          </motion.button>
                          <span style={{ minWidth: "30px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <motion.button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variant, item.size)
                            }
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              ...heroCTAPillStyles.base,
                              border: "1px solid rgba(255,255,255,0.14)",
                              background: "rgba(255,255,255,0.03)",
                              width: 32,
                              height: 32,
                              padding: 0,
                              boxShadow: "none",
                              justifyContent: "center",
                            }}
                          >
                            +
                          </motion.button>
                        </div>
                        <div
                          style={{
                            ...typography.h4,
                            color: colors.accent.main,
                            marginLeft: "auto",
                          }}
                        >
                          {formatPrice(item.totalPrice)}
                        </div>
                        <motion.button
                          onClick={() => removeItem(item.productId, item.variant, item.size)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            ...heroCTAPillStyles.base,
                            padding: "6px 10px",
                            boxShadow: "none",
                            border: "1px solid rgba(255,255,255,0.14)",
                            background: "rgba(255,255,255,0.02)",
                            color: colors.danger.main,
                          }}
                          aria-label="Remove item"
                        >
                          ×
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <Card variant="elevated" padding="lg" style={{ position: "sticky", top: spacing.xl }}>
            <h2
              style={{
                ...typography.h2,
                marginBottom: spacing.lg,
                color: colors.text.primary,
              }}
            >
              Order Summary
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
                marginBottom: spacing.xl,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  ...typography.body,
                  color: colors.text.secondary,
                }}
              >
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  ...typography.body,
                  color: colors.text.secondary,
                }}
              >
                <span>Shipping</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div
                style={{
                  height: "1px",
                  background: "rgba(255, 255, 255, 0.1)",
                  margin: `${spacing.md} 0`,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  ...typography.h3,
                  color: colors.text.primary,
                }}
              >
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={() => navigate("/checkout")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...heroCTAStyles.yellow,
                width: "100%",
                minHeight: 64,
                marginBottom: spacing.md,
              }}
              aria-label="Proceed to checkout"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                <span style={heroCTAStyles.yellow.textStyle}>Proceed to Checkout</span>
                <span style={heroCTAStyles.yellow.subtitleStyle}>Secure payment and delivery</span>
              </div>
              <span style={{ color: colors.text.onAccent, fontWeight: 800 }}>→</span>
            </motion.button>
            <Link to="/shop" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -2 }}
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
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;



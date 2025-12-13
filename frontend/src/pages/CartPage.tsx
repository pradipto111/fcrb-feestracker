import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
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
              <Button variant="primary" size="lg">
                Continue Shopping
              </Button>
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
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variant, item.size)
                            }
                            style={{
                              width: 32,
                              height: 32,
                              background: colors.surface.card,
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: borderRadius.sm,
                              color: colors.text.primary,
                              cursor: "pointer",
                            }}
                          >
                            −
                          </button>
                          <span style={{ minWidth: "30px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variant, item.size)
                            }
                            style={{
                              width: 32,
                              height: 32,
                              background: colors.surface.card,
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: borderRadius.sm,
                              color: colors.text.primary,
                              cursor: "pointer",
                            }}
                          >
                            +
                          </button>
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
                        <button
                          onClick={() => removeItem(item.productId, item.variant, item.size)}
                          style={{
                            padding: spacing.xs,
                            background: "transparent",
                            border: "none",
                            color: colors.danger.main,
                            cursor: "pointer",
                            fontSize: typography.fontSize.lg,
                          }}
                        >
                          ×
                        </button>
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
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate("/checkout")}
              style={{ marginBottom: spacing.md }}
            >
              Proceed to Checkout
            </Button>
            <Link to="/shop" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="lg" fullWidth>
                Continue Shopping
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;



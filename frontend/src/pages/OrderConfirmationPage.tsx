import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";

const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      const data = await api.getOrder(orderNumber!);
      setOrder(data);
    } catch (error: any) {
      console.error("Failed to load order:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
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
        <div style={{ padding: spacing["4xl"], textAlign: "center", paddingTop: "120px" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!order) {
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
            <h2 style={{ ...typography.h2, marginBottom: spacing.md }}>Order not found</h2>
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
          maxWidth: "800px",
          margin: "0 auto",
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          paddingTop: "120px",
        }}
      >
        <Card variant="elevated" padding="xl">
          <div style={{ textAlign: "center", marginBottom: spacing.xl }}>
            <div style={{ fontSize: typography.fontSize["6xl"], marginBottom: spacing.lg }}>✓</div>
            <h1
              style={{
                ...typography.h1,
                marginBottom: spacing.md,
                color: colors.text.primary,
              }}
            >
              Order Confirmed!
            </h1>
            <p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                marginBottom: spacing.lg,
              }}
            >
              Thank you for your purchase. Your order has been received and is being processed.
            </p>
            <div
              style={{
                ...typography.h3,
                color: colors.accent.main,
                marginBottom: spacing.xl,
              }}
            >
              Order #{order.orderNumber}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.lg,
              marginBottom: spacing.xl,
            }}
          >
            <div>
              <h3
                style={{
                  ...typography.h4,
                  marginBottom: spacing.md,
                  color: colors.text.primary,
                }}
              >
                Order Items
              </h3>
              {order.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: spacing.md,
                    background: colors.surface.card,
                    borderRadius: borderRadius.md,
                    marginBottom: spacing.sm,
                  }}
                >
                  <div>
                    <div style={{ ...typography.body, color: colors.text.primary }}>
                      {item.productName}
                    </div>
                    {item.size && (
                      <div
                        style={{
                          ...typography.caption,
                          color: colors.text.muted,
                        }}
                      >
                        Size: {item.size}
                      </div>
                    )}
                    <div
                      style={{
                        ...typography.caption,
                        color: colors.text.muted,
                      }}
                    >
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div style={{ ...typography.body, color: colors.text.primary }}>
                    {formatPrice(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3
                style={{
                  ...typography.h4,
                  marginBottom: spacing.md,
                  color: colors.text.primary,
                }}
              >
                Shipping Address
              </h3>
              <div
                style={{
                  padding: spacing.md,
                  background: colors.surface.card,
                  borderRadius: borderRadius.md,
                  ...typography.body,
                  color: colors.text.secondary,
                }}
              >
                {order.shippingAddress?.addressLine1}
                {order.shippingAddress?.addressLine2 && (
                  <>
                    <br />
                    {order.shippingAddress.addressLine2}
                  </>
                )}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.pincode}
                <br />
                {order.shippingAddress?.country}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: spacing.md,
                background: colors.surface.card,
                borderRadius: borderRadius.md,
                ...typography.h4,
                color: colors.text.primary,
              }}
            >
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: spacing.md,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/shop" style={{ textDecoration: "none" }}>
              <Button variant="primary">Continue Shopping</Button>
            </Link>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button variant="secondary">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;



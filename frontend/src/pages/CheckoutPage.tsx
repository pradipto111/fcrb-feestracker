import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useCart } from "../context/CartContext";
import { api } from "../api/client";
import { shopAssets } from "../config/assets";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const shippingFee = 5000;
  const subtotal = getTotal();
  const total = subtotal + shippingFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    if (items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await api.createOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant,
          size: item.size,
        })),
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        shippingAddress: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
      });

      const { order, razorpayOrderId, razorpayKeyId } = orderResponse;

      if (!razorpayOrderId || !razorpayKeyId) {
        // Test mode or Razorpay not configured
        alert("Payment gateway not configured. Order created in test mode.");
        clearCart();
        navigate(`/order-confirmation/${order.orderNumber}`);
        return;
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKeyId,
        amount: total,
        currency: "INR",
        name: "FC Real Bengaluru",
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            await api.verifyPayment(order.id, {
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              razorpayOrderId: response.razorpay_order_id,
            });
            clearCart();
            navigate(`/order-confirmation/${order.orderNumber}`);
          } catch (error: any) {
            alert("Payment verification failed: " + error.message);
          }
        },
        prefill: {
          name: formData.customerName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: colors.primary.main,
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error: any) {
      alert("Failed to create order: " + error.message);
      setLoading(false);
    }
  };

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
            <h2 style={{ ...typography.h2, marginBottom: spacing.md }}>Your cart is empty</h2>
            <Link to="/shop" style={{ textDecoration: "none" }}>
              <Button variant="primary">Continue Shopping</Button>
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
          Checkout
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: spacing.xl,
          }}
        >
          {/* Checkout Form */}
          <Card variant="elevated" padding="xl">
            <h2
              style={{
                ...typography.h2,
                marginBottom: spacing.lg,
                color: colors.text.primary,
              }}
            >
              Shipping Details
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
              <div>
                <label
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                    display: "block",
                  }}
                >
                  Full Name *
                </label>
                <Input
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Enter your full name"
                  error={errors.customerName}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.md,
                }}
              >
                <div>
                  <label
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      display: "block",
                    }}
                  >
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    error={errors.email}
                  />
                </div>
                <div>
                  <label
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      display: "block",
                    }}
                  >
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit phone number"
                    error={errors.phone}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                    display: "block",
                  }}
                >
                  Address Line 1 *
                </label>
                <Input
                  value={formData.addressLine1}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine1: e.target.value })
                  }
                  placeholder="Street address"
                  error={errors.addressLine1}
                />
              </div>

              <div>
                <label
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                    display: "block",
                  }}
                >
                  Address Line 2 (Optional)
                </label>
                <Input
                  value={formData.addressLine2}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine2: e.target.value })
                  }
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.md,
                }}
              >
                <div>
                  <label
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      display: "block",
                    }}
                  >
                    City *
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    error={errors.city}
                  />
                </div>
                <div>
                  <label
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      display: "block",
                    }}
                  >
                    State *
                  </label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    error={errors.state}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: spacing.md,
                }}
              >
                <div>
                  <label
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      display: "block",
                    }}
                  >
                    Pincode *
                  </label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    error={errors.pincode}
                  />
                </div>
                <div>
                  <label
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      display: "block",
                    }}
                  >
                    Country
                  </label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                    disabled
                  />
                </div>
              </div>
            </div>
          </Card>

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
                gap: spacing.sm,
                marginBottom: spacing.lg,
              }}
            >
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                  }}
                >
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
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
                flexDirection: "column",
                gap: spacing.sm,
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
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay Now"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;



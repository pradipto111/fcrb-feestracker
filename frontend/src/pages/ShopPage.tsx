import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";

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

const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error: any) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

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
        <h1
          style={{
            ...typography.h1,
            textAlign: "center",
            marginBottom: spacing.xl,
            color: colors.text.primary,
          }}
        >
          FC Real Bengaluru Shop
        </h1>
        <p
          style={{
            ...typography.body,
            textAlign: "center",
            color: colors.text.muted,
            marginBottom: spacing["2xl"],
            maxWidth: "700px",
            margin: `0 auto ${spacing["2xl"]}`,
          }}
        >
          Official merchandise and gear from FC Real Bengaluru
        </p>

        {loading ? (
          <div style={{ textAlign: "center", color: colors.text.muted }}>Loading products...</div>
        ) : products.length === 0 ? (
          <Card variant="elevated" padding="xl">
            <div style={{ textAlign: "center", color: colors.text.muted }}>
              No products available at the moment. Check back soon!
            </div>
          </Card>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: spacing.xl,
            }}
          >
            {products.map((product) => (
              <Card key={product.id} variant="elevated" padding="none">
                {product.images && product.images.length > 0 && (
                  <div
                    style={{
                      width: "100%",
                      height: "300px",
                      overflow: "hidden",
                      borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
                    }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div style={{ padding: spacing.lg }}>
                  <h3
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p
                      style={{
                        ...typography.body,
                        color: colors.text.muted,
                        fontSize: typography.fontSize.sm,
                        marginBottom: spacing.md,
                      }}
                    >
                      {product.description.substring(0, 100)}
                      {product.description.length > 100 ? "..." : ""}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: spacing.md,
                    }}
                  >
                    <div
                      style={{
                        ...typography.h3,
                        color: colors.accent.main,
                      }}
                    >
                      {formatPrice(product.price)}
                    </div>
                    <Link to={`/shop/${product.slug}`} style={{ textDecoration: "none" }}>
                      <Button variant="primary" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;


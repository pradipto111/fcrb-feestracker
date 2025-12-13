import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import { shopAssets, heroAssets, clubAssets } from "../config/assets";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { useParallaxMotion } from "../hooks/useParallaxMotion";

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
  
  const {
    sectionVariants,
    headingVariants,
    cardVariants,
    imageHover,
    cardHover,
    viewportOnce,
    getStaggeredCard,
  } = useHomepageAnimation();
  
  // Parallax for hero background
  const heroParallax = useParallaxMotion({ speed: 0.1 });

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
      
      {/* Hero Banner - STUNNING THEME */}
      <motion.section
        ref={heroParallax.ref}
        variants={sectionVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={viewportOnce}
        style={{
          position: "relative",
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginTop: "80px",
        }}
      >
        {/* Background image with parallax */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${shopAssets.jerseys[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6,
            zIndex: 0,
            y: heroParallax.y,
            scale: heroParallax.scale || 1,
          }}
        />
        
        {/* Animated Radial Gradient */}
        <motion.div
          style={{
            position: "absolute",
            top: "20%",
            left: "30%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(0, 224, 255, 0.25) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(50px)",
            zIndex: 1,
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Additional decorative images with animations */}
        <motion.div
          style={{
            position: "absolute",
            left: "-10%",
            top: "20%",
            width: "300px",
            height: "300px",
            backgroundImage: `url(${shopAssets.trainingTees[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
            filter: "blur(6px)",
            borderRadius: borderRadius.xl,
            zIndex: 1,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            right: "-10%",
            bottom: "20%",
            width: "300px",
            height: "300px",
            backgroundImage: `url(${shopAssets.miscMerch[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
            filter: "blur(6px)",
            borderRadius: borderRadius.xl,
            zIndex: 1,
          }}
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(5, 11, 32, 0.85) 0%, rgba(5, 11, 32, 0.6) 100%)`,
          }}
        />
        {/* Content */}
        <motion.div 
          style={{ position: "relative", zIndex: 1, textAlign: "center", padding: spacing.xl }}
          variants={headingVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={viewportOnce}
        >
          <motion.h1
            style={{
              ...typography.h1,
              marginBottom: spacing.md,
              color: colors.text.primary,
            }}
            variants={headingVariants}
          >
            FC Real Bengaluru Shop
          </motion.h1>
          <p
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: typography.fontSize.lg,
              maxWidth: "700px",
            }}
          >
            Official merchandise and gear from FC Real Bengaluru
          </p>
        </motion.div>
      </motion.section>
      
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${spacing["2xl"]} ${spacing.xl}`,
        }}
      >

        {loading ? (
          <div style={{ textAlign: "center", color: colors.text.muted, padding: spacing["2xl"] }}>
            <div style={{ fontSize: typography.fontSize.lg }}>Loading products...</div>
          </div>
        ) : products.length === 0 ? (
          <Card variant="elevated" padding="xl">
            <div style={{ textAlign: "center", color: colors.text.muted, padding: spacing["2xl"] }}>
              <div style={{ fontSize: typography.fontSize.xl, marginBottom: spacing.md }}>
                No products available at the moment
              </div>
              <p style={{ fontSize: typography.fontSize.md, color: colors.text.secondary }}>
                Check back soon for official FC Real Bengaluru merchandise!
              </p>
            </div>
          </Card>
        ) : (
          <motion.div
            variants={sectionVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: spacing.xl,
            }}
          >
            {products.filter(p => p.isActive).map((product, idx) => (
              <motion.div
                key={product.id}
                {...getStaggeredCard(idx)}
                whileHover={cardHover}
                style={{ height: "100%" }}
              >
                <Card variant="elevated" padding="none" style={{ height: "100%" }}>
                  {product.images && product.images.length > 0 ? (
                    <motion.div
                      style={{
                        width: "100%",
                        height: "300px",
                        overflow: "hidden",
                        borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
                        background: colors.surface.card,
                      }}
                      whileHover={imageHover}
                    >
                      <motion.img
                        src={product.images[0]}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          (e.target as HTMLImageElement).src = shopAssets.jerseys[0];
                        }}
                      />
                    </motion.div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "300px",
                        backgroundImage: `url(${shopAssets.jerseys[0]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
                        opacity: 0.5,
                      }}
                    />
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;


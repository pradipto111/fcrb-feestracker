import React from "react";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { shopAssets } from "../config/assets";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { useParallaxMotion } from "../hooks/useParallaxMotion";
import { useShopProducts } from "../hooks/useShopProducts";
import type { ProductCategory } from "../data/products";
import { ProductCard } from "../components/shop/ProductCard";

const FILTER_OPTIONS: { key: "ALL" | ProductCategory; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "MATCHDAY_KITS", label: "Matchday" },
  { key: "TRAINING_WEAR", label: "Training" },
  { key: "LIFESTYLE", label: "Lifestyle" },
  { key: "ACCESSORIES", label: "Accessories" },
  { key: "FAN_EXCLUSIVES", label: "Fan Club" },
  { key: "LIMITED_DROPS", label: "Limited" },
] as const;

const ShopPage: React.FC = () => {
  const { products } = useShopProducts();

  const {
    sectionVariants,
    headingVariants,
    viewportOnce,
  } = useHomepageAnimation();
  const heroParallax = useParallaxMotion({ speed: 0.1 });
  const [activeFilter, setActiveFilter] = React.useState<"ALL" | ProductCategory>("ALL");

  const filtered = React.useMemo(
    () =>
      activeFilter === "ALL"
        ? products
        : products.filter((p) => p.category === activeFilter),
    [products, activeFilter]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
      }}
    >
      <PublicHeader />

      {/* HERO HEADER */}
      <motion.section
        ref={heroParallax.ref}
        variants={sectionVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={viewportOnce}
        style={{
          position: "relative",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginTop: "80px",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${shopAssets.jerseys?.[0] || shopAssets.trainingTees?.[0] || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6,
            zIndex: 0,
            y: heroParallax.y,
            scale: heroParallax.scale || 1,
          }}
        />

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

        <motion.div
          style={{
            position: "absolute",
            left: "-10%",
            top: "20%",
            width: "300px",
            height: "300px",
            backgroundImage: `url(${shopAssets.trainingTees?.[0] || shopAssets.jerseys?.[0] || ""})`,
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
            backgroundImage: `url(${shopAssets.jerseys?.[0] || shopAssets.trainingTees?.[0] || ""})`,
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
            Official FC Real Bengaluru Store
          </motion.h1>
          <p
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: typography.fontSize.lg,
              maxWidth: "700px",
            }}
          >
            Matchday merch, lifestyle wear, exclusive drops — gear up like the Blue Army.
          </p>

          <div
            style={{
              marginTop: spacing["2xl"],
              display: "flex",
              gap: spacing.lg,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <motion.button
              type="button"
              onClick={() => setActiveFilter("MATCHDAY_KITS")}
              whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...heroCTAStyles.blue,
                width: "auto",
                minWidth: 260,
                minHeight: 56,
                padding: "12px 18px",
              }}
              aria-label="Shop Matchday Kits"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                <span style={heroCTAStyles.blue.textStyle}>Shop Matchday Kits</span>
                <span style={heroCTAStyles.blue.subtitleStyle}>Jerseys, shorts, matchday essentials</span>
              </div>
              <span style={{ color: colors.text.onPrimary, fontWeight: 800 }}>→</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setActiveFilter("LIFESTYLE")}
              whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...heroCTAStyles.darkWithBorder,
                width: "auto",
                minWidth: 260,
                minHeight: 56,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: spacing.md,
                cursor: "pointer",
              }}
              aria-label="Shop Lifestyle Wear"
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                <span style={heroCTAStyles.darkWithBorder.textStyle}>Shop Lifestyle Wear</span>
                <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>Everyday fits, club-first identity</span>
              </div>
              <span style={{ color: colors.accent.main, fontWeight: 800 }}>→</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.section>

      {/* SIMPLE FILTER STRIP */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${spacing.lg} ${spacing.xl} 0`,
        }}
      >
        <motion.div
          variants={sectionVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={viewportOnce}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: spacing.sm,
            justifyContent: "center",
          }}
        >
          {FILTER_OPTIONS.map((filter) => {
            const active = activeFilter === filter.key;
            return (
              <motion.button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAPillStyles.base,
                  padding: "8px 14px",
                  boxShadow: "none",
                  border: active ? `2px solid ${colors.accent.main}` : "1px solid rgba(255,255,255,0.14)",
                  background: active ? "rgba(245,179,0,0.08)" : "rgba(255,255,255,0.03)",
                  color: active ? colors.text.primary : colors.text.secondary,
                  textTransform: "uppercase",
                }}
              >
                {filter.label}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${spacing["2xl"]} ${spacing.xl} ${spacing["3xl"]}`,
        }}
      >
        <motion.div
          variants={sectionVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={viewportOnce}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: spacing.xl,
            marginTop: spacing["2xl"],
          }}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ShopPage;


import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { heroCTAStyles, heroCTAPillStyles, heroOverlayGradient } from "../theme/hero-design-patterns";
import { shopAssets, clubAssets } from "../config/assets";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { useParallaxMotion } from "../hooks/useParallaxMotion";
import { useShopProducts } from "../hooks/useShopProducts";
import type { ProductCategory } from "../data/products";
import { ProductCard } from "../components/shop/ProductCard";
import { FacebookIcon, InstagramIcon, TwitterIcon, YouTubeIcon, PhoneIcon, EmailIcon, LocationIcon } from "../components/icons/IconSet";
import { clubInfo } from "../data/club";

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
  const { products, loading: productsLoading } = useShopProducts();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        overflowX: "hidden",
        overflowY: "visible",
        width: "100%",
        maxWidth: "100vw",
        position: "relative",
      }}
    >
      {/* Fixed header that stays visible */}
      <div
        style={{
          position: "fixed",
          top: spacing.sm,
          left: 0,
          right: 0,
          zIndex: 1200,
          padding: `0 ${spacing.md}`,
          pointerEvents: "auto",
          background: "transparent",
        }}
      >
        <PublicHeader />
      </div>

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
          marginTop: "140px",
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
        {/* Background overlay matching homepage */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: heroOverlayGradient,
            zIndex: 1,
          }}
        />
        <motion.div 
          style={{ 
            position: "relative", 
            zIndex: 2, 
            textAlign: "center", 
            padding: spacing.xl,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100%",
          }}
          variants={headingVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={viewportOnce}
        >
          {/* Main Headline */}
          <motion.h1
            style={{
              ...typography.display,
              fontSize: `clamp(3rem, 8vw, 5.5rem)`,
              marginBottom: spacing.lg,
              color: colors.text.primary,
              fontWeight: typography.fontWeight.extrabold,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              textShadow: "0 8px 40px rgba(0, 0, 0, 0.8), 0 0 60px rgba(0, 224, 255, 0.15)",
              maxWidth: "900px",
            }}
            variants={headingVariants}
          >
            Official FC Real Bengaluru Store
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: typography.fontSize.xl,
              maxWidth: "700px",
              marginBottom: spacing.md,
              lineHeight: 1.6,
            }}
          >
            Matchday merch, lifestyle wear, exclusive drops — gear up like the Blue Army.
          </motion.p>

          {/* Product Count Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              ...glass.inset,
              padding: `${spacing.md} ${spacing.xl}`,
              borderRadius: borderRadius.full,
              marginTop: spacing.lg,
              marginBottom: spacing["2xl"],
            }}
          >
            <span
              style={{
                ...typography.caption,
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                letterSpacing: "0.05em",
              }}
            >
              {filtered.length} {filtered.length === 1 ? "Product" : "Products"} Available
            </span>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: spacing.sm,
              marginTop: spacing["2xl"],
            }}
          >
            <motion.button
              type="button"
              onClick={() => {
                const productsSection = document.querySelector('[data-shop-products]');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              whileHover={{ y: 4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                ...heroCTAPillStyles.base,
                ...heroCTAPillStyles.gold,
                padding: `${spacing.md} ${spacing.xl}`,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.bold,
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.sm,
                cursor: "pointer",
              }}
              aria-label="View Products"
            >
              <span>Explore Collection</span>
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                ↓
              </motion.span>
            </motion.button>

            {/* Animated Scroll Line */}
            <motion.div
              animate={{ 
                scaleY: [1, 1.2, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 2,
                height: 40,
                background: `linear-gradient(180deg, ${colors.accent.main} 0%, transparent 100%)`,
                borderRadius: borderRadius.full,
                marginTop: spacing.sm,
              }}
            />
          </motion.div>
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
                  ...glass.inset,
                  padding: "10px 16px",
                  border: active ? `2px solid ${colors.accent.main}` : "1px solid rgba(255,255,255,0.14)",
                  background: active 
                    ? "rgba(245,179,0,0.12)" 
                    : "rgba(255,255,255,0.04)",
                  color: active ? colors.text.primary : colors.text.secondary,
                  textTransform: "uppercase",
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  letterSpacing: "0.05em",
                }}
              >
                {filter.label}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <div
        data-shop-products
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `${spacing["2xl"]} ${spacing.xl} ${spacing["3xl"]}`,
          scrollMarginTop: "100px",
        }}
      >
        {productsLoading ? (
          <div style={{ textAlign: "center", padding: spacing["4xl"] }}>
            <p style={{ color: colors.text.secondary }}>Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: spacing["4xl"] }}>
            <p style={{ color: colors.text.secondary }}>No products found in this category.</p>
          </div>
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
              marginTop: spacing["2xl"],
            }}
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>

      {/* FOOTER */}
      <section
        id="footer"
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(4,8,18,0.95) 0%, rgba(4,8,18,0.98) 100%)",
        }}
      >
        <motion.footer
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", marginTop: "auto", marginBottom: 0, paddingBottom: 0 }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  maxWidth: "1400px",
                  margin: "0 auto",
                  paddingTop: isMobile ? 40 : 48,
                  paddingBottom: 0,
                  paddingLeft: isMobile ? 16 : 32,
                  paddingRight: isMobile ? 16 : 32,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                    opacity: 0.6,
                    marginBottom: isMobile ? 20 : 24,
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr 1.2fr",
                    gap: isMobile ? 20 : 24,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Logo + Social */}
                  <div>
                    <img
                      src={clubAssets.logo.crestCropped}
                      alt="FC Real Bengaluru"
                      style={{ width: isMobile ? 90 : 100, height: "auto", marginBottom: isMobile ? spacing.sm : spacing.md }}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: spacing.sm, flexWrap: "wrap" }}>
                      {[
                        { name: "Facebook", url: clubInfo.social.facebook, Icon: FacebookIcon },
                        { name: "Instagram", url: clubInfo.social.instagram, Icon: InstagramIcon },
                        { name: "Twitter", url: clubInfo.social.twitter || "#", Icon: TwitterIcon },
                        { name: "YouTube", url: clubInfo.social.youtube, Icon: YouTubeIcon },
                      ].map((social) => {
                        const Icon = social.Icon;
                        return (
                          <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "rgba(255,255,255,0.08)",
                              color: colors.text.primary,
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `${colors.primary.soft}`;
                              e.currentTarget.style.color = colors.primary.main;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                              e.currentTarget.style.color = colors.text.primary;
                            }}
                            title={social.name}
                          >
                            <Icon size={18} />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* About Clubs */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      About Clubs
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                      {[
                        { label: "Homepage", to: "/" },
                        { label: "About Us", to: "/about" },
                        { label: "Latest News", to: "/#content-stream" },
                      ].map((link) => (
                        <Link
                          key={link.label}
                          to={link.to}
                          style={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Teams Info */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      Teams Info
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                      {[
                        { label: "Player & Coach", to: "/student" },
                        { label: "Player Profile", to: "/players" },
                        { label: "Fixtures", to: "/#matches" },
                        { label: "Tournament", to: "/tournaments" },
                      ].map((link) => (
                        <Link
                          key={link.label}
                          to={link.to}
                          style={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Contact Us */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      Contact Us
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 10 }}>
                      <a
                        href={`tel:${clubInfo.contact.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <PhoneIcon size={16} />
                        <span>{clubInfo.contact.phone}</span>
                      </a>
                      <a
                        href={`mailto:${clubInfo.contact.email}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <EmailIcon size={16} />
                        <span>{clubInfo.contact.email}</span>
                      </a>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          color: colors.text.secondary,
                          fontSize: 13,
                          lineHeight: 1.6,
                          opacity: 0.9,
                        }}
                      >
                        <LocationIcon size={16} style={{ marginTop: 2 }} />
                        <span>{clubInfo.contact.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: isMobile ? 20 : 24,
                    paddingTop: isMobile ? 16 : 18,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    justifyContent: "center",
                    color: colors.text.muted,
                    fontSize: 12,
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  © {new Date().getFullYear()} FC Real Bengaluru. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </section>
    </div>
  );
};

export default ShopPage;


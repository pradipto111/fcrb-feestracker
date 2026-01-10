import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { heroCTAStyles, heroOverlayGradient, heroTypography } from "../../theme/hero-design-patterns";
import { Button } from "../ui/Button";
import { ArrowRightIcon } from "../icons/IconSet";
import ShopMarquee from "./ShopMarquee";

export type SupportCelebrateBelongProduct = {
  id: number | string;
  slug: string;
  name: string;
  price?: number | null;
  images?: string[] | null;
};

export type SupportCelebrateBelongResult = {
  opponent: string;
  venue?: string;
  matchType?: string;
  score?: string | null;
};

// =========================================================
// Blueprint constants (STRICT)
// =========================================================
const SECTION_PADDING_X_DESKTOP = 32;
const SECTION_PADDING_Y_DESKTOP = 28;
const SECTION_PADDING_X_MOBILE = 16;
const SECTION_PADDING_Y_MOBILE = 18;
const GAP_LG = 20;
const GAP_MD = 16;
const GAP_SM = 12;

const RADIUS_OUTER = 24;
const RADIUS_INNER = 18;
const RADIUS_CARD = 16;
const RADIUS_PILL = 999;

const BORDER_1 = "1px solid rgba(255,255,255,0.10)";
const GLOW_BLUE = "0 0 0 1px rgba(0,190,255,0.18), 0 12px 40px rgba(0,0,0,0.45)";
const MAX_WIDTH = 1200;

// =========================================================
// Small building blocks (component tree)
// =========================================================
const SectionShell: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <section id={id} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
    <div style={{ width: "100%", maxWidth: MAX_WIDTH, paddingLeft: 16, paddingRight: 16 }}>{children}</div>
  </section>
);

const SectionHeader: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <div style={{ marginBottom: isMobile ? 10 : 14 }}>
    <div
      style={{
        ...heroTypography.heading,
        fontSize: isMobile ? "clamp(22px, 6vw, 26px)" : "clamp(28px, 2.6vw, 34px)",
        margin: 0,
        lineHeight: 1.12,
      }}
    >
      Support, Celebrate &amp; Belong
    </div>
    <div style={{ ...heroTypography.subheading, maxWidth: "65ch", marginTop: 8 }}>
      Merch that fuels the journey, results that prove the work, a fan club that keeps you close.
    </div>
  </div>
);

const ModuleShell: React.FC<{ isMobile: boolean; children: React.ReactNode }> = ({ isMobile, children }) => (
  <div
    style={{
      borderRadius: RADIUS_OUTER,
      border: BORDER_1,
      background: "rgba(8,12,24,0.26)",
      backdropFilter: "blur(14px)",
      boxShadow: GLOW_BLUE,
      overflow: "hidden",
      padding: `${isMobile ? SECTION_PADDING_Y_MOBILE : SECTION_PADDING_Y_DESKTOP}px ${isMobile ? SECTION_PADDING_X_MOBILE : SECTION_PADDING_X_DESKTOP}px`,
      position: "relative",
    }}
  >
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
            background: heroOverlayGradient,
        opacity: 0.95,
        pointerEvents: "none",
      }}
    />
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>
);

const PaneShell: React.FC<{ isMobile: boolean; children: React.ReactNode; minHeight?: number }> = ({
  isMobile,
  children,
  minHeight = 260,
}) => (
  <div
    style={{
      borderRadius: RADIUS_INNER,
      border: BORDER_1,
      background: "rgba(255,255,255,0.02)",
      padding: isMobile ? 14 : 18,
      display: "flex",
      flexDirection: "column",
      minHeight: isMobile ? undefined : minHeight,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const PaneHeader: React.FC<{
  isMobile: boolean;
  kicker: string;
  title: string;
  subtitle?: string;
  rightCTA?: React.ReactNode;
}> = ({ isMobile, kicker, title, subtitle, rightCTA }) => (
  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", justifyContent: "space-between", gap: isMobile ? 12 : 16 }}>
    <div style={{ minWidth: 0 }}>
      {kicker ? <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.10em", fontSize: 12, marginBottom: 4 }}>{kicker}</div> : null}
      <div style={{ ...typography.h4, color: colors.text.primary, fontSize: 20, margin: 0, lineHeight: 1.15 }}>{title}</div>
      {subtitle ? (
        <div style={{ ...typography.body, color: colors.text.muted, fontSize: 14, lineHeight: 1.5, marginTop: 6 }}>
          {subtitle}
        </div>
      ) : null}
    </div>
    {rightCTA ? <div style={{ flexShrink: 0 }}>{rightCTA}</div> : null}
  </div>
);

// =========================================================
// MerchCarousel + cards (bugfixes + skeleton + clamps)
// =========================================================
const ProductCard: React.FC<{
  product: SupportCelebrateBelongProduct;
  index: number;
  isMobile: boolean;
  reduceMotion: boolean;
}> = ({ product, index, isMobile, reduceMotion }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const img = product.images?.[0] || "";

  const aspect = isMobile ? "4 / 3" : "16 / 10";
  const cardWidth = isMobile ? "min(78vw, 320px)" : "232px";

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={!isMobile && !reduceMotion ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!reduceMotion ? { scale: 0.99 } : undefined}
      style={{
        width: cardWidth,
        minHeight: 170,
        scrollSnapAlign: "start",
        borderRadius: RADIUS_CARD,
        overflow: "hidden",
        border: BORDER_1,
        background: "rgba(255,255,255,0.04)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: aspect,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Skeleton shimmer */}
        {!loaded && !errored && (
          <motion.div
            aria-hidden="true"
            animate={{ x: ["-40%", "140%"] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.04) 100%)",
              filter: "blur(6px)",
              opacity: 0.75,
            }}
          />
        )}

        {img && !errored ? (
          <img
            src={img}
            alt={product.name}
            width={800}
            height={isMobile ? 600 : 500}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setErrored(true);
              setLoaded(true);
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: loaded ? 1 : 0,
              transition: "opacity 220ms ease",
            }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.03)",
              color: colors.text.muted,
              overflow: "hidden",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ ...typography.overline, letterSpacing: "0.18em", opacity: 0.75 }}>FCRB</div>
              <div style={{ ...typography.caption, opacity: 0.8 }}>Image coming soon</div>
            </div>
          </div>
        )}

        {/* Overlay gradient + text - matching hero */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: heroOverlayGradient,
          }}
        />
        <div style={{ position: "absolute", left: spacing.md, right: spacing.md, bottom: spacing.md }}>
          <div
            style={{
              ...typography.body,
              color: colors.text.primary,
              fontWeight: typography.fontWeight.semibold,
              fontSize: typography.fontSize.sm,
              lineHeight: 1.25,
              marginBottom: 2,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.name}
          </div>
          <div style={{ ...typography.caption, color: colors.accent.main, display: "flex", alignItems: "baseline", gap: 6 }}>
            ₹{product.price?.toLocaleString?.() ?? product.price ?? "—"}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const SupportCelebrateBelongSection: React.FC<{
  isMobile: boolean;
  products: SupportCelebrateBelongProduct[];
  latestResult: SupportCelebrateBelongResult | null;
  compact?: boolean; // When true, removes outer wrappers for grid use
}> = ({ isMobile, products, latestResult, compact = false }) => {
  const reduce = useReducedMotion();

  // =========================================================
  // Motion variants (STRICT names + behavior)
  // =========================================================
  const sectionIn = useMemo(
    () => ({
      initial: reduce ? { opacity: 0, y: 4 } : { opacity: 0, y: 18, filter: "blur(8px)" },
      whileInView: reduce
        ? { opacity: 1, y: 0, transition: { duration: 0.35 } }
        : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.2, 0.8, 0.2, 1] as any } },
    }),
    [reduce]
  );

  const stagger = useMemo(() => ({ animate: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }) as const, []);
  const item = useMemo(
    () =>
      ({
        initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.99 },
        animate: reduce ? { opacity: 1, transition: { duration: 0.25 } } : { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
      }) as const,
    [reduce]
  );

  const rightSlide = useMemo(
    () =>
      ({
        initial: reduce ? { opacity: 0 } : { opacity: 0, x: 18, filter: "blur(6px)" },
        animate: reduce
          ? { opacity: 1, transition: { duration: 0.25 } }
          : { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.4 } },
      }) as const,
    [reduce]
  );

  const mainContent = (
    <>
      <SectionHeader isMobile={isMobile} />
      <motion.div initial={sectionIn.initial} whileInView={sectionIn.whileInView} viewport={{ once: true, amount: 0.25 }} transition={{ delay: 0.06 } as any}>
        {/* TopGrid – single pane filling the width */}
        <div
          style={{
            display: "grid",
            gap: isMobile ? GAP_MD : GAP_LG,
            gridTemplateColumns: "1fr",
            alignItems: "stretch",
          }}
        >
          {/* MerchPane */}
          <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.25 }} style={{ minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <PaneShell isMobile={isMobile} minHeight={isMobile ? 0 : 320}>
                <PaneHeader
                  isMobile={isMobile}
                  kicker=""
                  title="Wear Your Pride"
                  subtitle="Official merch. Real impact."
                  rightCTA={
                    <Link to="/shop" style={{ textDecoration: "none", width: isMobile ? "100%" : "auto" }}>
                      <motion.div
                        whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          ...heroCTAStyles.blue,
                          width: isMobile ? "100%" : "auto",
                          minWidth: isMobile ? "100%" : "200px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                          <span style={heroCTAStyles.blue.textStyle}>Explore Shop</span>
                          <span style={heroCTAStyles.blue.subtitleStyle}>Official FC Real Bengaluru merchandise</span>
                        </div>
                        <ArrowRightIcon size={20} color={colors.text.onPrimary} style={{ flexShrink: 0 }} />
                      </motion.div>
                    </Link>
                  }
                />

                {/* MerchCarousel */}
                <div style={{ marginTop: 14 }}>
                  <ShopMarquee products={products} isMobile={isMobile} />
                </div>
              </PaneShell>
            </div>
          </motion.div>
        </div>

            {/* FlowConnectorRow */}
            <div style={{ height: isMobile ? 18 : 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                aria-hidden="true"
                style={{
                  width: "100%",
                  maxWidth: 720,
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(255,169,0,0.0) 0%, rgba(255,169,0,0.26) 22%, rgba(0,224,255,0.22) 78%, rgba(0,224,255,0.0) 100%)",
                  opacity: 0.9,
                }}
              />
            </div>

            {/* FanClubPane removed per request */}
      </motion.div>
    </>
  );

  if (compact) {
    // Compact mode: no outer wrappers, content directly
    return (
      <motion.div initial={sectionIn.initial} whileInView={sectionIn.whileInView} viewport={{ once: true, amount: 0.25 }}>
        {mainContent}
      </motion.div>
    );
  }

  // Full mode: with SectionShell and ModuleShell wrappers
  return (
    <motion.div initial={sectionIn.initial} whileInView={sectionIn.whileInView} viewport={{ once: true, amount: 0.25 }}>
      <SectionShell id="support-celebrate-belong">
        <SectionHeader isMobile={isMobile} />
        <motion.div initial={sectionIn.initial} whileInView={sectionIn.whileInView} viewport={{ once: true, amount: 0.25 }} transition={{ delay: 0.06 } as any}>
          <ModuleShell isMobile={isMobile}>
            {/* TopGrid – single pane filling the width */}
            <div
              style={{
                display: "grid",
                gap: isMobile ? GAP_MD : GAP_LG,
                gridTemplateColumns: "1fr",
                alignItems: "stretch",
              }}
            >
              {/* MerchPane */}
              <motion.div variants={stagger} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.25 }} style={{ minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <PaneShell isMobile={isMobile} minHeight={isMobile ? 0 : 320}>
                    <PaneHeader
                      isMobile={isMobile}
                      kicker=""
                      title="Wear Your Pride"
                      subtitle="Official merch. Real impact."
                      rightCTA={
                        <Link to="/shop" style={{ textDecoration: "none" }}>
                          <Button
                            variant="primary"
                            size="md"
                            style={{
                              width: isMobile ? "100%" : "auto",
                              transform: "translateZ(0)",
                            }}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                              <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Explore Shop</span>
                              <ArrowRightIcon size={18} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                            </span>
                          </Button>
                        </Link>
                      }
                    />

                    {/* MerchCarousel */}
                    <div style={{ marginTop: 14 }}>
                      <ShopMarquee products={products} isMobile={isMobile} />
                    </div>
                  </PaneShell>
                </div>
              </motion.div>
            </div>

            {/* FlowConnectorRow */}
            <div style={{ height: isMobile ? 18 : 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                aria-hidden="true"
                style={{
                  width: "100%",
                  maxWidth: 720,
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(255,169,0,0.0) 0%, rgba(255,169,0,0.26) 22%, rgba(0,224,255,0.22) 78%, rgba(0,224,255,0.0) 100%)",
                  opacity: 0.9,
                }}
              />
            </div>

            {/* FanClubPane removed per request */}
          </ModuleShell>
        </motion.div>
      </SectionShell>
    </motion.div>
  );
};

export default SupportCelebrateBelongSection;



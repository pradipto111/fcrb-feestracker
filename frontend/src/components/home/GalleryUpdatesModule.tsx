import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography } from "../../theme/design-tokens";
import { heroCTAStyles, heroCTAPillStyles, heroOverlayGradient, heroTypography } from "../../theme/hero-design-patterns";
import { Button } from "../ui/Button";
import InfoModal from "../InfoModal";
import { ArrowRightIcon } from "../icons/IconSet";
import { galleryAssets, getGalleryImage, getNewsImage } from "../../config/assets";
import { mockNews, NewsItem } from "../../data/club";

// =========================================================
// Design tokens (match Support/Celebrate module)
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

type UpdateCategory = "All" | "News" | "Achievements" | "Academy";

function getIsMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

function categoryWeight(category: string) {
  const c = category.toLowerCase();
  if (c.includes("achievement")) return 100;
  if (c.includes("trial") || c.includes("academy")) return 90;
  if (c.includes("center") || c.includes("facility")) return 80;
  return 70; // general news/community
}

function normalizeCategory(item: NewsItem): UpdateCategory {
  const c = item.category.toLowerCase();
  if (c.includes("achievement")) return "Achievements";
  if (c.includes("academy") || c.includes("trial")) return "Academy";
  return "News";
}

const PillButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  asLinkTo?: string;
  iconRight?: boolean;
  fullWidth?: boolean;
}> = ({ children, onClick, asLinkTo, iconRight = false, fullWidth = false }) => {
  if (asLinkTo) {
    return (
      <Link to={asLinkTo} style={{ textDecoration: "none", width: fullWidth ? "100%" : undefined, display: "inline-block" }}>
        <motion.div
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{
            ...heroCTAPillStyles.base,
            ...heroCTAPillStyles.gold,
            width: fullWidth ? "100%" : "auto",
            justifyContent: "center",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>{children}</span>
            {iconRight ? <ArrowRightIcon size={16} style={{ color: colors.accent.main, display: "flex", alignItems: "center", flexShrink: 0 }} /> : null}
          </span>
        </motion.div>
      </Link>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        ...heroCTAPillStyles.base,
        ...heroCTAPillStyles.gold,
        width: fullWidth ? "100%" : "auto",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>{children}</span>
        {iconRight ? <ArrowRightIcon size={16} style={{ color: colors.accent.main, display: "flex", alignItems: "center", flexShrink: 0 }} /> : null}
      </span>
    </motion.button>
  );
};

export const GalleryUpdatesModule: React.FC = () => {
  const reduce = useReducedMotion();
  const isMobile = getIsMobile();

  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number>(1);
  const [selectedUpdate, setSelectedUpdate] = useState<NewsItem | null>(null);
  const [filter, setFilter] = useState<UpdateCategory>("All");

  const variants = useMemo(() => {
    const moduleIn = {
      hidden: reduce ? { opacity: 0, y: 4 } : { opacity: 0, y: 18, filter: "blur(6px)" },
      show: reduce
        ? { opacity: 1, y: 0, transition: { duration: 0.35 } }
        : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
    };
    const stagger = {
      show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
    };
    const item = {
      hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
      show: reduce
        ? { opacity: 1, transition: { duration: 0.25 } }
        : { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    };
    const hoverLift = {
      rest: { y: 0, boxShadow: "none" },
      hover: reduce ? { y: 0 } : { y: -3, transition: { duration: 0.2 } },
    };
    return { moduleIn, stagger, item, hoverLift };
  }, [reduce]);

  const galleryThumbs = useMemo(() => {
    // Build 8 thumbs from existing galleryAssets without adding new assets.
    const sources = [
      getGalleryImage(0, "thumbnail"),
      getGalleryImage(1, "thumbnail"),
      getGalleryImage(2, "thumbnail"),
      getGalleryImage(3, "thumbnail"),
      galleryAssets.matchDay?.[0] ?? getGalleryImage(0, "thumbnail"),
      galleryAssets.matchDay?.[1] ?? getGalleryImage(1, "thumbnail"),
      galleryAssets.trainingShots?.[0] ?? getGalleryImage(2, "thumbnail"),
      galleryAssets.trainingShots?.[1] ?? getGalleryImage(3, "thumbnail"),
    ];
    return sources.filter(Boolean);
  }, []);

  const sortedUpdates = useMemo(() => {
    const base = [...mockNews].sort((a, b) => {
      const aw = categoryWeight(a.category);
      const bw = categoryWeight(b.category);
      if (bw !== aw) return bw - aw;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    if (filter === "All") return base;
    return base.filter((u) => normalizeCategory(u) === filter);
  }, [filter]);

  const featuredUpdate = sortedUpdates[0] ?? null;
  const stackUpdates = sortedUpdates.slice(0, 5);

  const openGalleryAt = (idx: number) => {
    setSelectedGalleryIndex(idx);
    setGalleryOpen(true);
  };

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // =========================================================
  // Component tree (DON’T DEVIATE)
  // =========================================================
  return (
    <>
      <motion.section
        id="gallery-updates"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={variants.moduleIn}
        style={{ width: "100%", display: "flex", justifyContent: "center" }}
      >
        {/* SectionShell max width wrapper */}
        <div style={{ width: "100%", maxWidth: MAX_WIDTH, paddingLeft: 16, paddingRight: 16 }}>
          {/* SectionHeaderRow */}
          <div style={{ display: "flex", alignItems: isMobile ? "stretch" : "flex-end", justifyContent: "space-between", gap: GAP_MD, flexWrap: "wrap", marginBottom: isMobile ? 10 : 14 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ ...heroTypography.heading, fontSize: typography.fontSize["2xl"], color: colors.text.primary, margin: 0 }}>Gallery • Updates</div>
              <div
                style={{
                  ...heroTypography.subheading,
                  color: colors.text.secondary,
                  marginTop: 6,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "65ch",
                }}
              >
                Moments from training, matchdays, and milestones—plus what’s new this week.
              </div>
            </div>

            <div style={{ display: "flex", gap: GAP_SM, alignItems: "center", flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end", width: isMobile ? "100%" : "auto" }}>
              {/* Micro-CTA: View Gallery (no dead route; opens modal) */}
              <PillButton onClick={() => openGalleryAt(selectedGalleryIndex)} iconRight fullWidth={isMobile}>
                View Gallery
              </PillButton>

              {/* Programmes button (route unchanged) */}
              <PillButton asLinkTo="/programs" iconRight fullWidth={isMobile}>
                Programmes
              </PillButton>
            </div>
          </div>

          {/* ModuleShell */}
          <motion.div
            variants={variants.moduleIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
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
            {/* unified background treatment */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: heroOverlayGradient,
                opacity: 0.95,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* TopGrid */}
              <motion.div
                variants={variants.stagger}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr",
                  gap: isMobile ? GAP_MD : GAP_LG,
                  alignItems: "stretch",
                }}
              >
                {/* FeaturedMediaPane */}
                <motion.div variants={variants.item} style={{ minWidth: 0, height: "100%" }}>
                  <div
                    style={{
                      borderRadius: RADIUS_INNER,
                      border: BORDER_1,
                      background: "rgba(255,255,255,0.02)",
                      padding: isMobile ? 14 : 18,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {/* MediaHeader */}
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: GAP_MD }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>Featured Moment</div>
                      </div>
                    </div>

                    {/* FeaturedMedia */}
                    <motion.button
                      type="button"
                      onClick={() => openGalleryAt(1)}
                      initial="rest"
                      whileHover={!reduce ? "hover" : "rest"}
                      animate="rest"
                      variants={variants.hoverLift}
                      style={{
                        marginTop: 12,
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: RADIUS_CARD,
                        overflow: "hidden",
                        width: "100%",
                        background: "transparent",
                        outline: "none",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: isMobile ? "4/3" : "16/9",
                          borderRadius: RADIUS_CARD,
                          overflow: "hidden",
                          border: BORDER_1,
                          backgroundImage: `url(${getGalleryImage(1, isMobile ? "medium" : "large")})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {/* moment label chip */}
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            padding: "6px 10px",
                            borderRadius: RADIUS_PILL,
                            border: BORDER_1,
                            background: "rgba(5,11,32,0.55)",
                            color: colors.text.primary,
                            ...typography.caption,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                          }}
                        >
                          Featured
                        </div>

                        {/* overlay gradient for readability - matching hero */}
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: heroOverlayGradient,
                          }}
                        />

                        {/* caption */}
                        <div
                          style={{
                            position: "absolute",
                            left: 12,
                            right: 12,
                            bottom: 12,
                            color: colors.text.primary,
                            ...typography.body,
                            fontWeight: typography.fontWeight.semibold,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          Club highlights
                        </div>
                      </div>
                    </motion.button>

                    {/* MediaQuickActions */}
                    <div style={{ marginTop: 12, display: "flex", gap: GAP_SM, flexWrap: "wrap" }}>
                      <motion.button
                        type="button"
                        onClick={() => openGalleryAt(1)}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          ...heroCTAPillStyles.base,
                          ...heroCTAPillStyles.gold,
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View Gallery</span>
                          <ArrowRightIcon size={16} style={{ color: colors.accent.main, display: "flex", alignItems: "center", flexShrink: 0 }} />
                        </span>
                      </motion.button>
                      <div
                        style={{
                          borderRadius: RADIUS_PILL,
                          border: BORDER_1,
                          background: "rgba(255,255,255,0.03)",
                          color: colors.text.muted,
                          padding: "10px 12px",
                          ...typography.caption,
                        }}
                      >
                        Photos: {galleryThumbs.length}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* FeaturedUpdatePane */}
                <motion.div variants={variants.item} style={{ minWidth: 0, height: "100%" }}>
                  <div
                    style={{
                      borderRadius: RADIUS_INNER,
                      border: BORDER_1,
                      background: "rgba(255,255,255,0.02)",
                      padding: isMobile ? 14 : 18,
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      minHeight: isMobile ? undefined : 320,
                      overflow: "hidden",
                    }}
                  >
                    {/* UpdateHeader */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>Latest News / Updates</div>

                      {/* Filter chips (lightweight) */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {(["All", "Achievements", "News", "Academy"] as UpdateCategory[]).map((c) => (
                          <motion.button
                            key={c}
                            type="button"
                            onClick={() => setFilter(c)}
                            whileHover={!reduce ? { y: -2 } : undefined}
                            whileTap={!reduce ? { scale: 0.98 } : undefined}
                            style={{
                              ...heroCTAPillStyles.base,
                              padding: "8px 12px",
                              boxShadow: "none",
                              border:
                                c === filter ? `2px solid ${colors.accent.main}` : "1px solid rgba(255,255,255,0.14)",
                              background: c === filter ? "rgba(245,179,0,0.08)" : "rgba(255,255,255,0.03)",
                              color: c === filter ? colors.text.primary : colors.text.muted,
                            }}
                          >
                            {c}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* FeaturedUpdateCard */}
                    {featuredUpdate ? (
                      <motion.button
                        type="button"
                        onClick={() => setSelectedUpdate(featuredUpdate)}
                        initial="rest"
                        whileHover={!reduce ? "hover" : "rest"}
                        animate="rest"
                        variants={variants.hoverLift}
                        style={{
                          marginTop: 14,
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          textAlign: "left",
                          borderRadius: RADIUS_CARD,
                          overflow: "hidden",
                          width: "100%",
                          background: "transparent",
                          outline: "none",
                          flex: 1, // stretch to fill available height
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            minHeight: isMobile ? 180 : 240,
                            borderRadius: RADIUS_CARD,
                            overflow: "hidden",
                            border: BORDER_1,
                            backgroundImage: `url(${getNewsImage(0, isMobile ? "medium" : "large")})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: heroOverlayGradient,
                            }}
                          />

                          <div style={{ position: "absolute", inset: 0, padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                              <div
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: RADIUS_PILL,
                                  border: BORDER_1,
                                  background: "rgba(255,255,255,0.06)",
                                  color: colors.accent.main,
                                  ...typography.caption,
                                  letterSpacing: "0.10em",
                                }}
                              >
                                {featuredUpdate.category}
                              </div>
                              <div style={{ ...typography.caption, color: colors.text.muted }}>{formatDateShort(featuredUpdate.date)}</div>
                            </div>

                            <div>
                              <div
                                style={{
                                  ...typography.h4,
                                  color: colors.text.primary,
                                  lineHeight: 1.2,
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {featuredUpdate.title}
                              </div>

                              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, color: colors.text.primary, ...typography.caption }}>
                                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Read</span>
                                <ArrowRightIcon size={16} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ) : (
                      <div style={{ marginTop: 14, color: colors.text.muted, ...typography.body }}>No updates yet.</div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* DividerBeam */}
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

              {/* BottomRow */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
                  gap: isMobile ? GAP_MD : GAP_LG,
                  alignItems: "stretch",
                }}
              >
                {/* GalleryStrip */}
                <motion.div variants={variants.stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} style={{ minWidth: 0 }}>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 10 }}>
                    MORE MOMENTS
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: GAP_SM,
                      overflowX: "auto",
                      WebkitOverflowScrolling: "touch",
                      paddingBottom: 2,
                    }}
                    aria-label="Gallery strip"
                  >
                    {galleryThumbs.slice(0, 10).map((src, idx) => (
                      <motion.button
                        key={`${src}-${idx}`}
                        type="button"
                        variants={variants.item}
                        initial="rest"
                        whileHover={!reduce ? "hover" : "rest"}
                        animate="rest"
                        onClick={() => openGalleryAt(idx % 4)}
                        style={{
                          border: "none",
                          padding: 0,
                          background: "transparent",
                          cursor: "pointer",
                          borderRadius: RADIUS_CARD,
                          flexShrink: 0,
                          width: isMobile ? 120 : 140,
                          height: isMobile ? 120 : 120,
                          overflow: "hidden",
                          outline: "none",
                        }}
                      >
                        <motion.div
                          variants={variants.hoverLift}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: RADIUS_CARD,
                            border: BORDER_1,
                            backgroundImage: `url(${src})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      </motion.button>
                    ))}

                    {/* + View All tile (opens gallery modal) */}
                    <motion.button
                      type="button"
                      variants={variants.item}
                      initial="rest"
                      whileHover={!reduce ? "hover" : "rest"}
                      animate="rest"
                      onClick={() => openGalleryAt(0)}
                      style={{
                        border: "none",
                        padding: 0,
                        background: "transparent",
                        cursor: "pointer",
                        borderRadius: RADIUS_CARD,
                        flexShrink: 0,
                        width: isMobile ? 120 : 140,
                        height: isMobile ? 120 : 120,
                        overflow: "hidden",
                        outline: "none",
                      }}
                    >
                      <motion.div
                        variants={variants.hoverLift}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: RADIUS_CARD,
                          border: BORDER_1,
                          background: "rgba(255,255,255,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: colors.text.primary,
                          ...typography.body,
                          fontWeight: typography.fontWeight.semibold,
                        }}
                      >
                        + View All
                      </motion.div>
                    </motion.button>
                  </div>
                </motion.div>

                {/* UpdatesStack */}
                <motion.div variants={variants.stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} style={{ minWidth: 0 }}>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 10 }}>
                    WHAT’S NEW
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {stackUpdates.map((u) => (
                      <motion.button
                        key={u.id}
                        type="button"
                        variants={variants.item}
                        onClick={() => setSelectedUpdate(u)}
                        style={{
                          border: BORDER_1,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: RADIUS_CARD,
                          padding: "12px 12px",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          gap: 10,
                          alignItems: "center",
                          outline: "none",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background:
                              normalizeCategory(u) === "Achievements"
                                ? "rgba(255,169,0,0.95)"
                                : normalizeCategory(u) === "Academy"
                                  ? "rgba(0,224,255,0.85)"
                                  : "rgba(255,255,255,0.55)",
                            boxShadow: "0 0 0 3px rgba(255,255,255,0.06)",
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...typography.caption, color: colors.accent.main, marginBottom: 2 }}>{u.category}</div>
                          <div
                            style={{
                              ...typography.body,
                              color: colors.text.primary,
                              fontWeight: typography.fontWeight.semibold,
                              fontSize: typography.fontSize.sm,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {u.title}
                          </div>
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, whiteSpace: "nowrap" }}>
                          {formatDateShort(u.date)}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery modal (uses existing InfoModal; no new routes) */}
      <InfoModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title="Gallery"
        image={getGalleryImage(selectedGalleryIndex % 4, "large")}
      >
        <div style={{ ...typography.body, lineHeight: 1.6 }}>
          Tap thumbnails to browse moments from training and matchdays.
          <div style={{ height: 12 }} />
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
            {galleryAssets.actionShots.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedGalleryIndex(i)}
                style={{
                  borderRadius: 12,
                  border: i === selectedGalleryIndex ? "1px solid rgba(0,224,255,0.55)" : BORDER_1,
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                  width: 88,
                  height: 64,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={getGalleryImage(i, "small")}
                  alt={`Gallery thumbnail ${i + 1}`}
                  width={176}
                  height={128}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </InfoModal>

      {/* Update modal (uses existing InfoModal; no new routes) */}
      <InfoModal
        isOpen={!!selectedUpdate}
        onClose={() => setSelectedUpdate(null)}
        title={selectedUpdate?.title ?? ""}
        image={selectedUpdate ? getNewsImage(Math.min(2, mockNews.findIndex((n) => n.id === selectedUpdate.id)), "large") : undefined}
      >
        {selectedUpdate ? (
          <div style={{ ...typography.body, lineHeight: 1.7 }}>
            <div style={{ ...typography.caption, color: colors.accent.main, letterSpacing: "0.10em", marginBottom: 8 }}>
              {selectedUpdate.category} • {new Date(selectedUpdate.date).toLocaleDateString()}
            </div>
            <div style={{ color: colors.text.secondary }}>{selectedUpdate.summary}</div>
          </div>
        ) : null}
      </InfoModal>
    </>
  );
};

export default GalleryUpdatesModule;



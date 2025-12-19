import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { animate, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { colors, typography } from "../../theme/design-tokens";
import { heroCTAPillStyles } from "../../theme/hero-design-patterns";
import type { SupportCelebrateBelongProduct } from "../home/SupportCelebrateBelongSection";

const GAP = 16;
const RADIUS = 18;
const CARD_RADIUS = 16;
const BORDER = "1px solid rgba(255,255,255,0.10)";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || el.isContentEditable;
}

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
} as const;

export default function WearYourPrideCarousel({
  products,
  isMobile,
  autoScroll = true,
  autoScrollIntervalMs = 3200,
}: {
  products: SupportCelebrateBelongProduct[];
  isMobile: boolean;
  autoScroll?: boolean;
  autoScrollIntervalMs?: number;
}) {
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [pageIndex, setPageIndex] = useState(0); // 0..pageCount (last is clone of page 0 for seamless loop)
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);
  const inView = useInView(viewportRef, { amount: 0.25, once: false });

  // Measure viewport using ResizeObserver for accurate cardsPerPage.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setViewportW(Math.floor(cr.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const items = useMemo(() => products, [products]);

  const cardsPerPage = useMemo(() => {
    if (isMobile) return 1;
    if (!viewportW) return 3;
    // Start from breakpoint intent; then validate against min width.
    const minCard = 240;
    const base =
      viewportW >= 1200 ? 4 :
      viewportW >= 1024 ? 3 :
      viewportW >= 768 ? 2 : 1;

    let per = base;
    while (per > 1) {
      const cardW = (viewportW - GAP * (per - 1)) / per;
      if (cardW >= minCard) break;
      per -= 1;
    }
    return clamp(per, 1, 4);
  }, [isMobile, viewportW]);

  const pages = useMemo(() => chunk(items, cardsPerPage), [items, cardsPerPage]);
  const pageCount = pages.length || 1;
  const pagesLoop = useMemo(() => {
    if (pageCount <= 1) return pages;
    // Append clone of first page to allow seamless last->first animation.
    return [...pages, pages[0]];
  }, [pages, pageCount]);
  const loopCount = pagesLoop.length;

  // Keep active page valid when responsive changes occur.
  useEffect(() => {
    setPageIndex((p) => {
      if (pageCount <= 1) return 0;
      // keep within loop range
      return clamp(p % pageCount, 0, pageCount - 1);
    });
  }, [pageCount]);

  const snapTo = (next: number) => {
    if (!viewportW) return;
    if (pageCount <= 1) {
      setPageIndex(0);
      x.set(0);
      return;
    }

    const isCloneTarget = next === pageCount; // the appended clone
    const idx = isCloneTarget ? pageCount : clamp(next, 0, pageCount - 1);
    setPageIndex(idx);

    const target = -idx * viewportW;
    animate(x, target, {
      duration: reduceMotion ? 0.14 : 0.34,
      ease: [0.16, 1, 0.3, 1],
      onComplete: () => {
        if (isCloneTarget) {
          // Jump back to the real first page without animation.
          setPageIndex(0);
          x.set(0);
        }
      },
    });
  };

  // Sync x when page/viewport changes (e.g., resize).
  useEffect(() => {
    if (!viewportW) return;
    x.set(-pageIndex * viewportW);
  }, [pageIndex, viewportW, x]);

  const canInteract = pageCount > 1;
  const displayIndex = pageCount <= 1 ? 0 : pageIndex % pageCount;

  const goNext = () => {
    if (pageCount <= 1) return;
    if (pageIndex === pageCount - 1) {
      // animate to clone then jump to 0
      snapTo(pageCount);
    } else if (pageIndex === pageCount) {
      snapTo(1);
    } else {
      snapTo(pageIndex + 1);
    }
  };

  const goPrev = () => {
    if (pageCount <= 1) return;
    if (pageIndex === 0) {
      snapTo(pageCount - 1);
    } else if (pageIndex === pageCount) {
      snapTo(pageCount - 1);
    } else {
      snapTo(pageIndex - 1);
    }
  };

  // Auto-scroll: starts when in view + page visible; pauses on hover/focus/drag.
  useEffect(() => {
    if (!autoScroll) return;
    if (reduceMotion) return;
    if (!inView) return;
    if (!canInteract) return;
    if (paused) return;

    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      // only advance if not currently being dragged (best-effort: pause flag handles most)
      goNext();
    }, autoScrollIntervalMs);
    return () => window.clearInterval(id);
  }, [autoScroll, autoScrollIntervalMs, reduceMotion, inView, canInteract, paused, pageIndex, pageCount]);

  return (
    <div
      style={{
        borderRadius: RADIUS,
        border: BORDER,
        background: "rgba(255,255,255,0.02)",
        padding: isMobile ? 16 : 20,
        overflow: "hidden",
        position: "relative",
      }}
      aria-label="Wear Your Pride product carousel"
    >
      {/* TrackViewport */}
      <div
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (isTypingTarget(e.target)) return;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            goPrev();
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            goNext();
          }
        }}
        style={{
          position: "relative",
          width: "100%",
          outline: "none",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={(e) => {
          setPaused(true);
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,224,255,0.22), 0 0 24px rgba(0,224,255,0.10)";
          e.currentTarget.style.borderRadius = `${RADIUS}px`;
        }}
        onBlur={(e) => {
          setPaused(false);
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Track */}
        <motion.div
          drag={canInteract ? "x" : false}
          dragConstraints={{ left: -(loopCount - 1) * viewportW, right: 0 }}
          dragElastic={0.12}
          dragMomentum={!reduceMotion}
          style={{
            x,
            display: "flex",
            width: loopCount * (viewportW || 1),
            cursor: canInteract ? "grab" : "default",
          }}
          onDragStart={() => setPaused(true)}
          onDragEnd={(_, info) => {
            if (!viewportW) return;
            const current = x.get();
            // Predict a bit using velocity for a more premium feel.
            const projected = current + info.velocity.x * 0.12;
            const next = clamp(Math.round(-projected / viewportW), 0, loopCount - 1);
            // If user drags to clone, complete the seamless reset.
            if (pageCount > 1 && next === pageCount) {
              snapTo(pageCount);
            } else {
              snapTo(next);
            }
            // resume after a short delay
            window.setTimeout(() => setPaused(false), 900);
          }}
        >
          {pagesLoop.map((page, pageIdx) => (
            <div
              key={`page-${pageIdx}`}
              style={{
                width: viewportW || "100%",
                flex: "0 0 auto",
                paddingRight: pageIdx === loopCount - 1 ? 0 : GAP,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${cardsPerPage}, minmax(0, 1fr))`,
                  gap: GAP,
                  alignItems: "stretch",
                }}
              >
                {page.map((p) => (
                  <motion.div
                    key={p.id}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    style={{ minWidth: 0 }}
                    whileHover={!reduceMotion ? { y: -3, scale: 1.01, transition: { duration: 0.2 } } : undefined}
                  >
                    <ProductCTACard product={p} reduceMotion={!!reduceMotion} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Controls */}
        <ArrowButton
          side="left"
          disabled={!canInteract}
          ariaLabel="Previous products page"
          onClick={goPrev}
          isMobile={isMobile}
          reduceMotion={!!reduceMotion}
        />
        <ArrowButton
          side="right"
          disabled={!canInteract}
          ariaLabel="Next products page"
          onClick={goNext}
          isMobile={isMobile}
          reduceMotion={!!reduceMotion}
        />

        {/* Pagination indicator */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 12,
            transform: "translateX(-50%)",
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(10,16,32,0.42)",
            backdropFilter: "blur(10px)",
            color: colors.text.muted,
            ...typography.caption,
            fontSize: typography.fontSize.xs,
            letterSpacing: "0.14em",
          }}
        >
          {String(displayIndex + 1).padStart(2, "0")} / {String(pageCount).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

const ArrowButton: React.FC<{
  side: "left" | "right";
  disabled: boolean;
  ariaLabel: string;
  onClick: () => void;
  isMobile: boolean;
  reduceMotion: boolean;
}> = ({ side, disabled, ariaLabel, onClick, isMobile, reduceMotion }) => {
  const size = isMobile ? 40 : 44;
  const inset = isMobile ? 10 : 12;
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled && !reduceMotion ? { scale: 1.05, transition: { duration: 0.15 } } : undefined}
      whileTap={!disabled && !reduceMotion ? { scale: 0.98 } : undefined}
      style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        [side]: inset,
        width: size,
        height: size,
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(10,16,32,0.42)",
        backdropFilter: "blur(12px)",
        color: colors.text.primary,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.35 : 1,
        boxShadow: disabled ? "none" : "0 14px 40px rgba(0,0,0,0.38)",
        outline: "none",
      }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,224,255,0.22), 0 0 26px rgba(0,224,255,0.10)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = disabled ? "none" : "0 14px 40px rgba(0,0,0,0.38)";
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1, transform: side === "left" ? "translateX(-1px)" : "translateX(1px)" }}>
        {side === "left" ? "‹" : "›"}
      </span>
    </motion.button>
  );
};

const ProductCTACard: React.FC<{ product: SupportCelebrateBelongProduct; reduceMotion: boolean }> = ({ product, reduceMotion }) => {
  const navigate = useNavigate();
  const [errored, setErrored] = useState(false);
  const img = product.images?.[0] || "";
  const price = typeof product.price === "number" ? `₹${product.price.toLocaleString("en-IN")}` : "";

  const goToProduct = () => navigate(`/shop/${product.slug}`);

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`View product: ${product.name}`}
      onClick={goToProduct}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToProduct();
        }
      }}
      style={{ textDecoration: "none", display: "block", height: "100%", outline: "none" }}
      onFocus={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(0,224,255,0.22), 0 0 26px rgba(0,224,255,0.10)";
        e.currentTarget.style.borderRadius = `${CARD_RADIUS}px`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          height: 210,
          borderRadius: CARD_RADIUS,
          border: BORDER,
          background: "rgba(255,255,255,0.04)",
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          {!img || errored ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(10,16,32,0.55) 100%)",
                color: colors.text.muted,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ ...typography.overline, letterSpacing: "0.18em", opacity: 0.8 }}>FCRB</div>
                <div style={{ ...typography.caption, opacity: 0.85 }}>Merch drop</div>
              </div>
            </div>
          ) : (
            <img
              src={img}
              alt={product.name}
              onError={() => setErrored(true)}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          )}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 48%, rgba(5,11,32,0.82) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 12,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
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
              title={product.name}
            >
              {product.name}
            </div>
            {price ? (
              <div style={{ ...typography.body, color: colors.accent.main, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.base }}>
                {price}
              </div>
            ) : null}
          </div>

          {/* Real CTA button (same action as card click) */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToProduct();
            }}
            aria-label={`View product: ${product.name}`}
            whileHover={!reduceMotion ? { y: -2 } : undefined}
            whileTap={!reduceMotion ? { scale: 0.98 } : undefined}
            style={{
              ...heroCTAPillStyles.base,
              ...heroCTAPillStyles.gold,
              padding: "10px 12px",
              boxShadow: "none",
              whiteSpace: "nowrap",
              outline: "none",
            }}
          >
            View Product
          </motion.button>
        </div>
      </div>
    </div>
  );
};



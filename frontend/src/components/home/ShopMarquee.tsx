import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { heroCTAPillStyles } from "../../theme/hero-design-patterns";
import { Button } from "../ui/Button";
import { ArrowRightIcon } from "../icons/IconSet";
import { useMarquee } from "../../hooks/useMarquee";

type ProductLite = {
  id: number | string;
  slug: string;
  name: string;
  price?: number | null;
  images?: string[] | null;
};

type Props = {
  products: ProductLite[];
  isMobile: boolean;
  speedPxPerSec?: number;
};

function formatPrice(paise?: number | null) {
  if (!paise || !Number.isFinite(paise)) return "";
  return `₹${(paise / 100).toFixed(2)}`;
}

export default function ShopMarquee({ products, isMobile, speedPxPerSec = 62 }: Props) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const touchAutoResumeRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const [paused, setPaused] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const capped = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Only cap if very large to avoid heavy DOM
    if (products.length > 50) return products.slice(0, 24);
    return products;
  }, [products]);

  const baseList = useMemo(() => {
    if (capped.length === 0) return [];
    const minBaseItems = isMobile ? 10 : 12; // fill ~2–3 screens
    const reps = Math.max(1, Math.ceil(minBaseItems / capped.length));
    const expanded: ProductLite[] = [];
    for (let i = 0; i < reps; i++) expanded.push(...capped);
    return expanded;
  }, [capped, isMobile]);

  const marqueeDisabled = !!reduceMotion || baseList.length === 0;
  const { sequenceRef, offsetPx } = useMarquee({
    speedPxPerSec,
    paused: paused || marqueeDisabled,
    disabled: marqueeDisabled,
  });

  const clearTimers = () => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    if (touchAutoResumeRef.current) window.clearTimeout(touchAutoResumeRef.current);
    resumeTimerRef.current = null;
    touchAutoResumeRef.current = null;
  };

  const pauseNow = () => {
    clearTimers();
    setPaused(true);
  };

  const resumeSoon = (delay = 220) => {
    clearTimers();
    resumeTimerRef.current = window.setTimeout(() => {
      setPaused(false);
      setActiveId(null);
      activeIdRef.current = null;
    }, delay);
  };

  if (!products || products.length === 0) {
    return (
      <div
        style={{
          borderRadius: borderRadius.xl,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)",
          padding: spacing.lg,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: spacing.md,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
            No products right now.
          </div>
          <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 4 }}>Visit the shop to check what’s live.</div>
        </div>
        {/* Shop link disabled in UI, backend code preserved */}
        {/* <Link to="/shop" style={{ textDecoration: "none", flexShrink: 0 }}>
          <Button variant="primary" size="md">
            Visit Shop <ArrowRightIcon size={18} style={{ marginLeft: 8 }} />
          </Button>
        </Link> */}
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        ref={containerRef}
        aria-label="Shop products carousel"
        onMouseEnter={() => {
          if (isMobile) return;
          pauseNow();
        }}
        onMouseLeave={() => {
          if (isMobile) return;
          resumeSoon(240);
        }}
        onPointerDown={(e) => {
          if (e.pointerType === "touch") pauseNow();
        }}
        onPointerUp={(e) => {
          if (e.pointerType === "touch" && !activeIdRef.current) resumeSoon(260);
        }}
        onPointerCancel={() => resumeSoon(260)}
        onFocusCapture={() => pauseNow()}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as HTMLElement | null;
          if (containerRef.current && next && containerRef.current.contains(next)) return;
          resumeSoon(240);
        }}
        style={{
          position: "relative",
          overflow: reduceMotion ? "auto" : "hidden",
          WebkitOverflowScrolling: "touch",
          borderRadius: borderRadius.card, // 16px - football-first
          border: "1px solid rgba(255,255,255,0.10)",
          background: colors.surface.card, // Football-first card background
          padding: spacing.md, // 16px - readable text zones
          boxShadow: shadows.card, // Sports broadcast style
        }}
      >
        {/* Edge fades */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 46,
            background: "linear-gradient(90deg, rgba(5,11,32,0.85) 0%, rgba(5,11,32,0) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 46,
            background: "linear-gradient(270deg, rgba(5,11,32,0.85) 0%, rgba(5,11,32,0) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div
          role="list"
          style={{
            display: "flex",
            gap: spacing.md,
            alignItems: "stretch",
            willChange: reduceMotion ? undefined : "transform",
            transform: reduceMotion ? undefined : `translate3d(${-offsetPx}px, 0, 0)`,
            transition: reduceMotion ? undefined : "transform 0ms linear",
            paddingRight: 60,
          }}
        >
          {/* First sequence (measured) */}
          <div ref={sequenceRef} style={{ display: "flex", gap: spacing.md }}>
            {baseList.map((p, idx) => (
              <MarqueeCard
                key={`${p.id}-${p.slug}-base-${idx}`}
                product={p}
                isMobile={isMobile}
                active={activeId === String(p.id)}
                onActivate={() => {
                  pauseNow();
                  setActiveId(String(p.id));
                  activeIdRef.current = String(p.id);
                }}
                onDeactivate={() => {
                  if (activeIdRef.current) return;
                  resumeSoon(220);
                }}
                onTouchFirstTap={() => {
                  pauseNow();
                  setActiveId(String(p.id));
                  activeIdRef.current = String(p.id);
                  clearTimers();
                  touchAutoResumeRef.current = window.setTimeout(() => {
                    setPaused(false);
                    setActiveId(null);
                    activeIdRef.current = null;
                  }, 2500);
                }}
              />
            ))}
          </div>

          {/* Second sequence for seamless loop */}
          {!reduceMotion &&
            baseList.map((p, idx) => (
              <MarqueeCard
                key={`${p.id}-${p.slug}-dup-${idx}`}
                product={p}
                isMobile={isMobile}
                active={activeId === String(p.id)}
                onActivate={() => {
                  pauseNow();
                  setActiveId(String(p.id));
                  activeIdRef.current = String(p.id);
                }}
                onDeactivate={() => {
                  if (activeIdRef.current) return;
                  resumeSoon(220);
                }}
                onTouchFirstTap={() => {
                  pauseNow();
                  setActiveId(String(p.id));
                  activeIdRef.current = String(p.id);
                  clearTimers();
                  touchAutoResumeRef.current = window.setTimeout(() => {
                    setPaused(false);
                    setActiveId(null);
                    activeIdRef.current = null;
                  }, 2500);
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

function MarqueeCard({
  product,
  isMobile,
  active,
  onActivate,
  onDeactivate,
  onTouchFirstTap,
}: {
  product: ProductLite;
  isMobile: boolean;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onTouchFirstTap: () => void;
}) {
  const price = formatPrice(product.price ?? null);
  const img = product.images?.[0] || "";
  const width = isMobile ? 240 : 320;
  const pointerTypeRef = useRef<string | null>(null);

  return (
    <Link
      to={`/shop/${product.slug}`}
      role="listitem"
      aria-label={`View product ${product.name}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        flex: "0 0 auto",
        width,
        outline: "none",
      }}
      onMouseEnter={() => {
        if (isMobile) return;
        onActivate();
      }}
      onMouseLeave={() => {
        if (isMobile) return;
        onDeactivate();
      }}
      onFocus={() => onActivate()}
      onBlur={() => onDeactivate()}
      onPointerDown={(e) => {
        pointerTypeRef.current = e.pointerType;
        if (e.pointerType === "touch") onTouchFirstTap();
      }}
      onClick={(e) => {
        // Touch: first tap should pause + reveal CTA (no navigation)
        const isTouch = pointerTypeRef.current === "touch";
        if (isTouch && !active) {
          e.preventDefault();
          onTouchFirstTap();
        }
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: borderRadius.card, // 16px - football-first
          overflow: "hidden",
          border: active ? `2px solid ${colors.accent.main}60` : "1px solid rgba(255,255,255,0.10)",
          background: colors.surface.card, // Football-first card background
          boxShadow: active ? shadows.cardHover : shadows.card, // Sports broadcast style
          transform: active ? "translateZ(0) scale(1.05)" : "translateZ(0) scale(1)",
          transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        }}
      >
        <div
          style={{
            aspectRatio: isMobile ? "4/3" : "16/10",
            background: "rgba(255,255,255,0.06)",
            position: "relative",
          }}
        >
          {img ? (
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(0,224,255,0.10), rgba(255,169,0,0.10))",
                color: colors.text.muted,
              }}
            >
              <div style={{ ...typography.caption, letterSpacing: "0.16em" }}>FCRB</div>
            </div>
          )}

          {/* Image darken for legibility */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(5,11,32,0.00) 0%, rgba(5,11,32,0.35) 55%, rgba(5,11,32,0.88) 100%)",
            }}
          />
        </div>

        <div style={{ padding: spacing.md, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.sm }}>
          <div style={{ minWidth: 0, paddingLeft: spacing['4'] }}>
            <div
              style={{
                ...typography.body,
                color: colors.text.primary,
                fontWeight: typography.fontWeight.bold, // Bold for football-first
                fontSize: typography.fontSize.sm,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.name}
            </div>
            {price ? <div style={{ ...typography.caption, color: colors.accent.main, marginTop: spacing['4'], fontWeight: typography.fontWeight.semibold }}>{price}</div> : null}
          </div>
        </div>

        {/* CTA overlay */}
        <div
          aria-hidden={!active}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: 12,
            opacity: active ? 1 : 0,
            transform: active ? "translateY(0px)" : "translateY(8px)",
            transition: "opacity 160ms ease, transform 160ms ease",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              ...heroCTAPillStyles.base,
              ...heroCTAPillStyles.gold,
              padding: `${spacing.sm} ${spacing.md}`, // 8px 16px - adequate padding
              boxShadow: shadows.button,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1, color: colors.text.primary }}>View Product</span>
              <ArrowRightIcon size={16} style={{ color: colors.accent.main, display: "flex", alignItems: "center", flexShrink: 0 }} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}



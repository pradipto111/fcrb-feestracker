import React, { useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { ArrowRightIcon } from "../icons/IconSet";

export const OfferCarousel: React.FC<{
  title?: string;
  accent: string;
  children: React.ReactNode;
  isMobile: boolean;
}> = ({ title, accent, children, isMobile }) => {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const itemsCount = useMemo(() => {
    let count = 0;
    React.Children.forEach(children, () => (count += 1));
    return count;
  }, [children]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.round((isMobile ? 260 : 320) * 1.05) * dir;
    el.scrollBy({ left: amount, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      {title ? (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: 10 }}>
          <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em" }}>{title}</div>
          <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.85 }}>{itemsCount}/{Math.max(itemsCount, 1)}</div>
        </div>
      ) : null}

      <div style={{ position: "relative" }}>
        {/* Arrows (desktop) */}
        {!isMobile && (
          <>
            <motion.button
              type="button"
              onClick={() => scrollBy(-1)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Scroll offers left"
              style={{
                position: "absolute",
                left: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 38,
                height: 38,
                borderRadius: 999,
                border: `1px solid ${accent}33`,
                background: "rgba(5,11,32,0.55)",
                backdropFilter: "blur(10px)",
                color: colors.text.primary,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
                boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
              }}
            >
              <ArrowRightIcon size={16} style={{ transform: "rotate(180deg)", color: colors.text.primary }} />
            </motion.button>
            <motion.button
              type="button"
              onClick={() => scrollBy(1)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Scroll offers right"
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 38,
                height: 38,
                borderRadius: 999,
                border: `1px solid ${accent}33`,
                background: "rgba(5,11,32,0.55)",
                backdropFilter: "blur(10px)",
                color: colors.text.primary,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
                boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
              }}
            >
              <ArrowRightIcon size={16} style={{ color: colors.text.primary }} />
            </motion.button>
          </>
        )}

        {/* Edge fades */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: "linear-gradient(90deg, rgba(5,11,32,0.75) 0%, rgba(5,11,32,0) 100%)",
            zIndex: 1,
            pointerEvents: "none",
            borderRadius: borderRadius.xl,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: "linear-gradient(270deg, rgba(5,11,32,0.75) 0%, rgba(5,11,32,0) 100%)",
            zIndex: 1,
            pointerEvents: "none",
            borderRadius: borderRadius.xl,
          }}
        />

        <div
          ref={scrollerRef}
          style={{
            display: "flex",
            gap: spacing.md,
            overflowX: "auto",
            paddingBottom: 6,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            paddingLeft: isMobile ? 2 : 52,
            paddingRight: isMobile ? 2 : 52,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};



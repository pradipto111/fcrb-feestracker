import type React from "react";

/**
 * Blue gradient glass morphism primitives (site-wide)
 * Matches the reference: deep navy + blue glass + subtle cyan/gold energy.
 *
 * Note: these are intentionally style objects (inline-friendly) because much of
 * the codebase uses inline styles rather than CSS modules.
 */
export const glass = {
  /**
   * Large section panels (ModuleShell / section containers).
   */
  panel: {
    background:
      "linear-gradient(135deg, rgba(5,11,32,0.72) 0%, rgba(10,22,51,0.56) 45%, rgba(5,11,32,0.76) 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px) saturate(165%)",
    WebkitBackdropFilter: "blur(18px) saturate(165%)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05) inset",
    position: "relative",
    overflow: "hidden",
  } satisfies React.CSSProperties,

  /**
   * Standard cards (most information blocks).
   */
  card: {
    background:
      "linear-gradient(135deg, rgba(10,16,32,0.52) 0%, rgba(15,23,42,0.42) 55%, rgba(10,16,32,0.52) 100%)",
    border: "1px solid rgba(255,255,255,0.11)",
    backdropFilter: "blur(16px) saturate(160%)",
    WebkitBackdropFilter: "blur(16px) saturate(160%)",
    boxShadow: "0 14px 42px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05) inset",
    position: "relative",
    overflow: "hidden",
  } satisfies React.CSSProperties,

  /**
   * Stronger card surface for text-on-photo sections (higher opacity).
   * Use this when the background image is high-contrast and text must always win.
   */
  cardStrong: {
    // Blue-tinted navy glass (matches calendar reference)
    background:
      "linear-gradient(135deg, rgba(10,61,145,0.22) 0%, rgba(5,11,32,0.88) 48%, rgba(10,22,51,0.90) 100%)",
    backgroundColor: "rgba(5,11,32,0.86)",
    border: "1px solid rgba(255,255,255,0.16)",
    backdropFilter: "blur(22px) saturate(175%)",
    WebkitBackdropFilter: "blur(22px) saturate(175%)",
    boxShadow:
      "0 18px 56px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 42px rgba(0,224,255,0.06)",
    position: "relative",
    overflow: "hidden",
  } satisfies React.CSSProperties,

  /**
   * Insets inside cards (filters, small info boxes, table headers, etc).
   */
  inset: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.10)",
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.04) inset",
    position: "relative",
    overflow: "hidden",
  } satisfies React.CSSProperties,

  /**
   * Common overlay layer that boosts text readability on top of imagery/video.
   * This is the "blue glass wash" from the reference screenshot.
   */
  overlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.95,
    background:
      "radial-gradient(circle at 20% 15%, rgba(0,224,255,0.12) 0%, transparent 55%)," +
      "radial-gradient(circle at 85% 80%, rgba(255,169,0,0.09) 0%, transparent 60%)," +
      "linear-gradient(135deg, rgba(10,61,145,0.22) 0%, rgba(5,11,32,0.06) 45%, rgba(5,11,32,0.28) 100%)",
  } satisfies React.CSSProperties,

  /**
   * Stronger blue glass wash for readability on busy imagery.
   * Mirrors the calendar reference: deeper navy wash + subtle cyan/gold energy.
   */
  overlayStrong: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 1,
    background:
      "radial-gradient(circle at 20% 15%, rgba(0,224,255,0.16) 0%, transparent 60%)," +
      "radial-gradient(circle at 85% 80%, rgba(255,169,0,0.10) 0%, transparent 64%)," +
      "linear-gradient(135deg, rgba(10,61,145,0.24) 0%, rgba(5,11,32,0.78) 46%, rgba(5,11,32,0.84) 100%)",
  } satisfies React.CSSProperties,

  /**
   * Softer overlay for small/outlined surfaces.
   */
  overlaySoft: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.8,
    background:
      "radial-gradient(circle at 20% 20%, rgba(0,224,255,0.08) 0%, transparent 58%)," +
      "radial-gradient(circle at 80% 80%, rgba(255,169,0,0.06) 0%, transparent 62%)",
  } satisfies React.CSSProperties,
};


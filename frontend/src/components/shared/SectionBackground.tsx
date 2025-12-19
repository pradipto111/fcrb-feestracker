/**
 * SectionBackground Component
 * Reusable background system for homepage sections with video/image support
 * Football-first design with pitch textures and club color overlays
 */

import React from "react";
import { motion } from "framer-motion";
import { colors } from "../../theme/design-tokens";

export type SectionVariant =
  | "hero"
  | "story"
  | "programs"
  | "sponsors"
  | "fanclub"
  | "calendar"
  | "gallery"
  | "default";

export type OverlayIntensity = "light" | "medium" | "strong";

interface SectionBackgroundProps {
  variant?: SectionVariant;
  type?: "video" | "image";
  src?: string;
  poster?: string;
  overlayIntensity?: OverlayIntensity;
  /** When true, skips dark/navy overlays so the underlying asset is more visible */
  disableOverlays?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const overlayIntensities: Record<OverlayIntensity, string> = {
  light: "rgba(2, 12, 27, 0.3)",
  medium: "rgba(2, 12, 27, 0.6)",
  strong: "rgba(2, 12, 27, 0.85)",
};

export const SectionBackground: React.FC<SectionBackgroundProps> = ({
  variant = "default",
  type = "image",
  src,
  poster,
  overlayIntensity = "medium",
  disableOverlays = false,
  children,
  className,
  style,
}) => {
  const overlayColor = overlayIntensities[overlayIntensity];

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        minWidth: "100%",
        minHeight: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Background Media */}
      {type === "video" && src ? (
        <motion.video
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          initial={{ scale: 1.05, opacity: 0.85 }}
          animate={{ scale: 1.1, opacity: 1 }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: "-2px",
            left: "-2px",
            right: "-2px",
            bottom: "-2px",
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={src} type="video/mp4" />
        </motion.video>
      ) : src ? (
        <motion.div
          initial={disableOverlays ? { scale: 1.02, y: 0, opacity: 1 } : { scale: 1.03, y: -8, opacity: 0.45 }}
          animate={disableOverlays ? { scale: 1.05, y: 0, opacity: 1 } : { scale: 1.08, y: 0, opacity: 0.65 }}
          transition={{ duration: 22, repeat: Infinity, repeatType: "reverse", ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: "-2px",
            left: "-2px",
            right: "-2px",
            bottom: "-2px",
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: disableOverlays ? "scroll" : "fixed",
            filter: disableOverlays ? "none" : "blur(6px)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* Dark Overlay Gradient */}
      {!disableOverlays && (
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: "-2px",
            right: "-2px",
            bottom: "-2px",
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            background: `linear-gradient(135deg, ${overlayColor} 0%, rgba(2, 12, 27, 0.4) 50%, ${overlayColor} 100%)`,
            zIndex: 1,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}

      {/* Club Color Overlay (subtle) */}
      {!disableOverlays && (
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: "-2px",
            right: "-2px",
            bottom: "-2px",
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            background: colors.club.overlay,
            opacity: 0.4,
            zIndex: 1,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}

      {/* Pitch Texture Overlay */}
      {!disableOverlays && (
        <div
          style={{
            position: "absolute",
            top: "-2px",
            left: "-2px",
            right: "-2px",
            bottom: "-2px",
            width: "calc(100% + 4px)",
            height: "calc(100% + 4px)",
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(10,61,145,0.015) 100px, rgba(10,61,145,0.015) 200px)
            `,
            opacity: 0.3,
            zIndex: 1,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}

      {/* Content Layer */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};


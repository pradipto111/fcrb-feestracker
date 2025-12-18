/**
 * SectionBackground Component
 * Reusable background system for homepage sections with video/image support
 * Football-first design with pitch textures and club color overlays
 */

import React from "react";
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
  children,
  className,
  style,
}) => {
  const overlayColor = overlayIntensities[overlayIntensity];

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Background Media */}
      {type === "video" && src ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : src ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            filter: "blur(8px)",
            opacity: 0.15,
            zIndex: 0,
          }}
          aria-hidden="true"
        />
      ) : null}

      {/* Dark Overlay Gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${overlayColor} 0%, rgba(2, 12, 27, 0.4) 50%, ${overlayColor} 100%)`,
          zIndex: 1,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Club Color Overlay (subtle) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: colors.club.overlay,
          opacity: 0.4,
          zIndex: 1,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Pitch Texture Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
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


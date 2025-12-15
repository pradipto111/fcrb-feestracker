import React from "react";
import { borderRadius, colors } from "../../theme/design-tokens";

interface PillarMediaProps {
  image: string;
  alt: string;
  label?: string;
}

export const PillarMedia: React.FC<PillarMediaProps> = ({ image, alt, label }) => {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        aspectRatio: "16 / 9",
        minHeight: 220,
        border: `1px solid rgba(255, 255, 255, 0.12)`,
      }}
    >
      <img
        src={image}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
        }}
      />
      {label && (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(6px)",
            color: colors.text.onPrimary,
            fontSize: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

export default PillarMedia;


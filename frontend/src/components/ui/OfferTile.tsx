import React from "react";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { Button } from "./Button";
import { ArrowRightIcon } from "../icons/IconSet";

export type OfferTileData = {
  id: string;
  title: string;
  code: string;
  condition: string;
  memberOnlyLabel?: string;
};

const LockMark = ({ color = "rgba(255,255,255,0.92)" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block" }}>
    <path
      fill={color}
      d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm7 12H7v-8h10v8Z"
    />
  </svg>
);

export const OfferTile: React.FC<{
  offer: OfferTileData;
  accent: string;
  accent2: string;
}> = ({ offer, accent, accent2 }) => {
  const tooltip = "Coming soon — Fan Club unlocks perks";

  return (
    <div
      style={{
        scrollSnapAlign: "start",
        flex: "0 0 auto",
        width: 300,
        borderRadius: borderRadius.xl,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 18% 22%, ${accent}1F 0%, transparent 58%), radial-gradient(circle at 88% 18%, ${accent2}1A 0%, transparent 60%)`,
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: spacing.md, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.18)",
              color: colors.text.secondary,
              ...typography.caption,
              fontSize: typography.fontSize.xs,
              letterSpacing: "0.12em",
            }}
          >
            <LockMark />
            Members-only
          </div>
          {offer.memberOnlyLabel ? (
            <div style={{ ...typography.caption, fontSize: typography.fontSize.xs, color: colors.text.muted, opacity: 0.95, textAlign: "right" }}>
              {offer.memberOnlyLabel}
            </div>
          ) : null}
        </div>

        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.bold, lineHeight: 1.25 }}>
          {offer.title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
            padding: "10px 12px",
            borderRadius: borderRadius.lg,
            border: "1px dashed rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.16)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em", fontSize: 11 }}>CODE</div>
            <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, letterSpacing: "0.06em" }}>
              {offer.code}
            </div>
          </div>
          <div style={{ opacity: 0.9 }}>
            <ArrowRightIcon size={16} style={{ color: accent }} />
          </div>
        </div>

        <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.45 }}>{offer.condition}</div>

        {/* Disabled-looking button (non-reactive) with tooltip */}
        <div title={tooltip} style={{ width: "100%" }}>
          <Button
            variant="secondary"
            size="sm"
            disabled
            style={{
              width: "100%",
              borderRadius: 999,
              border: `1px solid ${accent}33`,
              background: "rgba(255,255,255,0.04)",
            }}
            aria-disabled="true"
          >
            Copy Code
          </Button>
        </div>
      </div>
    </div>
  );
};



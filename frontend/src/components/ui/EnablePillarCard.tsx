import React from "react";
import { Button } from "./Button";
import BulletList from "./BulletList";
import PillarMedia from "./PillarMedia";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface EnablePillarCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  mediaImage: string;
  mediaAlt: string;
  mediaLabel?: string;
}

export const EnablePillarCard: React.FC<EnablePillarCardProps> = ({
  icon,
  title,
  description,
  bullets,
  ctaLabel,
  ctaHref,
  mediaImage,
  mediaAlt,
  mediaLabel,
}) => {
  return (
    <div
      style={{
        background: "rgba(10, 16, 32, 0.55)",
        borderRadius: 20,
        padding: spacing.lg,
        border: "1px solid rgba(255, 255, 255, 0.10)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: spacing.md,
        minHeight: 560,
        height: "100%",
      }}
    >
      {/* Header zone */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), rgba(0,224,255,0.4))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
          aria-hidden="true"
        >
          <span style={{ fontSize: 18, color: colors.text.onPrimary }}>{icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...typography.h4,
              color: colors.text.primary,
              fontSize: "18px",
              marginBottom: spacing.xs,
            }}
          >
            {title}
          </div>
          <p
            style={{
              ...typography.body,
              color: colors.text.secondary,
              fontSize: "13.5px",
              lineHeight: 1.6,
              opacity: 0.85,
              margin: 0,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Bullet zone */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing.md }}>
        <BulletList items={bullets} />
      </div>

      {/* Action + Media */}
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.md, marginTop: "auto" }}>
        <Link to={ctaHref} style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              style={{
                height: "48px",
                borderRadius: 12,
              }}
            >
              {ctaLabel}
            </Button>
          </motion.div>
        </Link>
        <PillarMedia image={mediaImage} alt={mediaAlt} label={mediaLabel} />
      </div>
    </div>
  );
};

export default EnablePillarCard;


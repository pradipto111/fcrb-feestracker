import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import { clubInfo, teams, mockNews, NewsItem } from "../data/club";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YouTubeIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  ArrowRightIcon,
  FootballIcon,
  DumbbellIcon,
  TrophyIcon,
  ChartBarIcon,
  FireIcon,
  MedalIcon,
  CheckIcon,
  StarIcon,
} from "../components/icons/IconSet";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { useHeroParallax } from "../hooks/useParallaxMotion";
import { 
  heroAssets, 
  matchAssets, 
  galleryAssets, 
  academyAssets, 
  centresAssets, 
  shopAssets, 
  brochureAssets, 
  newsAssets,
  miscAssets,
  clubAssets,
  realverseAssets,
  trophyAssets,
  getGalleryImage, 
  getNewsImage 
} from "../config/assets";
import { homepageAssets } from "../config/homepageAssets";

// Interface for fixtures from API
interface PublicFixture {
  id: number;
  opponent: string;
  matchDate: string;
  matchTime: string;
  venue: string;
  matchType: string;
  status: string;
  center: string;
}

// Interface for centres
interface Centre {
  id: number;
  name: string;
  shortName: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  displayOrder: number;
}

// Infinity Section Wrapper - Seamless, continuous flow like a movie
const InfinitySection: React.FC<{
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  delay?: number;
  bridge?: boolean;
}> = ({ children, id, style, delay = 0, bridge = false }) => {
  const { infinitySectionVariants, viewportOnce } = useHomepageAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { 
    once: false, 
    amount: 0.1,
    margin: "0px",
  });

  return (
    <>
      <motion.section
        ref={sectionRef}
        id={id}
        initial="offscreen"
        animate={isInView ? "onscreen" : "offscreen"}
        variants={infinitySectionVariants}
        transition={{ delay }}
        viewport={{ once: false, amount: 0.1 }}
        style={{
          ...style,
          position: "relative",
          marginTop: bridge ? "-100px" : "0",
          marginBottom: bridge ? "-100px" : "0",
          paddingTop: bridge ? "150px" : (style?.paddingTop !== undefined ? style.paddingTop : "100px"),
          paddingBottom: bridge ? "150px" : (style?.paddingBottom !== undefined ? style.paddingBottom : "100px"),
          zIndex: bridge ? 2 : 1,
          overflow: "visible",
          overflowY: "visible",
          overflowX: "hidden",
          width: "100%",
          minHeight: "1px",
        }}
      >
        <div style={{ 
          position: "relative", 
          zIndex: 1, 
          width: "100%",
          minHeight: "1px",
          isolation: "isolate",
          overflow: "visible",
          overflowY: "visible",
        }}>
          {children}
        </div>
      </motion.section>
    </>
  );
};

// Trophy Cabinet Component - Interactive Achievement Display
type CabinetIconProps = { size?: number; style?: React.CSSProperties; primary?: string; secondary?: string };

// Purpose-built cabinet icons (inline SVG; no additional assets/deps).
const CabinetTrophyMark: React.FC<CabinetIconProps> = ({
  size = 24,
  primary = "rgba(255, 194, 51, 0.95)",
  secondary = "rgba(0, 224, 255, 0.9)",
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
    {/* Cup */}
    <path
      d="M7 4h10v4c0 3.2-2.6 5.8-5.8 5.8h-.4C7.6 13.8 5 11.2 5 8V4h2Z"
      fill={primary}
      opacity={0.95}
    />
    {/* Handles */}
    <path
      d="M5 5H3.6C3.3 5 3 5.3 3 5.6V7c0 2.2 1.5 4 3.6 4.5v-1.6C5.6 9.6 5 8.8 5 7.9V5Z"
      fill={primary}
      opacity={0.85}
    />
    <path
      d="M19 5h1.4c.3 0 .6.3.6.6V7c0 2.2-1.5 4-3.6 4.5v-1.6c1-.3 1.6-1.1 1.6-2V5Z"
      fill={primary}
      opacity={0.85}
    />
    {/* Stem + base */}
    <path d="M10.2 13.6h3.6v2.2c0 .7-.6 1.3-1.3 1.3h-1c-.7 0-1.3-.6-1.3-1.3v-2.2Z" fill={secondary} opacity={0.92} />
    <path
      d="M7.6 18h8.8c.3 0 .6.3.6.6v1c0 .2-.1.4-.3.5-.1.1-.2.1-.3.1H7.6c-.2 0-.4-.1-.5-.3-.1-.1-.1-.2-.1-.3v-1c0-.3.3-.6.6-.6Z"
      fill={primary}
      opacity={0.9}
    />
    {/* Shine */}
    <path
      d="M9.2 5.4h1.1c.3 0 .5.2.4.5-.3 1.6-.1 4.3 1.3 6.2.2.3-.1.7-.4.7H11c-.1 0-.3-.1-.4-.2-1.7-2.2-1.8-5.3-1.4-7 .1-.1.2-.2.4-.2Z"
      fill="#fff"
      opacity={0.22}
    />
  </svg>
);

const CabinetMedalMark: React.FC<CabinetIconProps> = ({
  size = 24,
  primary = "rgba(0, 224, 255, 0.95)",
  secondary = "rgba(255, 194, 51, 0.9)",
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style}>
    {/* Ribbons */}
    <path d="M7.1 3.8h3.8L9.7 8 7.1 3.8Z" fill={secondary} opacity={0.9} />
    <path d="M13.1 3.8h3.8L14.3 8 13.1 3.8Z" fill={secondary} opacity={0.9} />
    {/* Medal */}
    <circle cx="12" cy="14.2" r="5.3" fill={primary} opacity={0.92} />
    <circle cx="12" cy="14.2" r="3.6" fill="#0B1224" opacity={0.55} />
    {/* Highlight */}
    <path
      d="M9.7 11.5c.6-.6 1.6-1.1 2.8-1.1.3 0 .5.2.4.5-.1.3-.4.5-.7.5-1.1 0-1.8.4-2.2.9-.2.2-.5.2-.7 0-.2-.2-.2-.6 0-.8Z"
      fill="#fff"
      opacity={0.2}
    />
  </svg>
);

const TrophyCabinet: React.FC<{
  onOpenChange?: (isOpen: boolean) => void;
  variant?: "compact" | "royal";
}> = ({ onOpenChange, variant = "compact" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onOpenChange) {
      onOpenChange(newState);
    }
  };

  const achievements = [
    { 
      label: "Champions — KSFA D Division", 
      icon: CabinetTrophyMark,
      tooltip: "Debut season title",
      glow: colors.accent.main,
      primary: "rgba(255, 194, 51, 0.95)",
      secondary: colors.accent.main,
    },
    { 
      label: "Runners-up — KSFA C Division", 
      icon: CabinetMedalMark,
      tooltip: "Immediate promotion impact",
      glow: colors.primary.main,
      primary: "rgba(0, 224, 255, 0.95)",
      secondary: colors.accent.main,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="button"
      tabIndex={0}
      aria-label={isOpen ? "Close trophy cabinet" : "Open trophy cabinet"}
      aria-expanded={isOpen}
      style={{
        marginBottom: 0,
        maxWidth: "100%",
        cursor: "pointer",
        width: "100%",
        outline: "none",
      }}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      {/* Cabinet Structure */}
      <motion.div
        animate={{
          scale: isOpen ? (variant === "royal" ? 1.02 : 1.05) : 1,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          background: `linear-gradient(135deg, 
            rgba(30, 20, 10, 0.8) 0%, 
            rgba(40, 25, 15, 0.7) 50%, 
            rgba(30, 20, 10, 0.8) 100%)`,
          backdropFilter: "blur(20px)",
          borderRadius: borderRadius.xl,
          border: `2px solid rgba(255, 169, 0, 0.3)`,
          boxShadow: isOpen 
            ? `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 169, 0, 0.2), inset 0 0 20px rgba(255, 169, 0, 0.1)`
            : `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 169, 0, 0.15), inset 0 0 10px rgba(255, 169, 0, 0.05)`,
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Wood Grain Texture Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255, 200, 100, 0.03) 2px,
              rgba(255, 200, 100, 0.03) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(200, 150, 80, 0.02) 2px,
              rgba(200, 150, 80, 0.02) 4px
            )`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Royal shimmer overlay (variant only) */}
        {variant === "royal" && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: -2,
              background:
                "linear-gradient(110deg, rgba(255,169,0,0.10) 0%, rgba(255,255,255,0.06) 35%, rgba(0,224,255,0.06) 55%, rgba(255,169,0,0.10) 100%)",
              filter: "blur(10px)",
              opacity: 0.6,
              zIndex: 1,
              pointerEvents: "none",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0.7) 100%)",
            }}
            animate={{
              x: ["-18%", "18%", "-18%"],
              opacity: [0.45, 0.7, 0.45],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {variant === "compact" ? (
          <>
            {/* Cabinet Header - Always Visible */}
            <motion.div
              style={{
                padding: spacing.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 2,
                borderBottom: isOpen ? `1px solid rgba(255, 169, 0, 0.2)` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, rgba(255, 169, 0, 0.2) 0%, rgba(255, 194, 51, 0.15) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid rgba(255, 169, 0, 0.4)`,
                    boxShadow: `0 4px 16px rgba(255, 169, 0, 0.3)`,
                  }}
                >
                  <TrophyIcon size={20} color={colors.accent.main} />
                </motion.div>
                <div>
                  <span
                    style={{
                      ...typography.body,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Trophy Cabinet
                  </span>
                  <p
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.xs,
                      margin: 0,
                      marginTop: "4px",
                    }}
                  >
                    {isOpen ? "Tap to close" : "Tap to open Trophy Cabinet"}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ArrowRightIcon size={20} color={colors.accent.main} style={{ transform: "rotate(90deg)" }} />
              </motion.div>
            </motion.div>
          </>
        ) : (
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: `${spacing["2xl"]} ${spacing["2xl"]}`,
              textAlign: "center",
              minHeight: isOpen ? 270 : 190,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AnimatePresence initial={false} mode="wait">
              {!isOpen ? (
                <motion.div
                  key="royal-cta"
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(12px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%" }}
                >
                  <motion.div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      margin: `0 auto ${spacing.lg}`,
                      background:
                        "linear-gradient(135deg, rgba(255, 169, 0, 0.25) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 194, 51, 0.12) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid rgba(255, 169, 0, 0.45)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.55), 0 0 22px rgba(255,169,0,0.25)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 10px 30px rgba(0,0,0,0.55), 0 0 18px rgba(255,169,0,0.22)",
                        "0 12px 34px rgba(0,0,0,0.55), 0 0 26px rgba(255,169,0,0.32)",
                        "0 10px 30px rgba(0,0,0,0.55), 0 0 18px rgba(255,169,0,0.22)",
                      ],
                    }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CabinetTrophyMark size={30} primary="rgba(255, 194, 51, 0.95)" secondary={colors.accent.main} />
                  </motion.div>

                  <div style={{ maxWidth: 560, margin: "0 auto" }}>
                    <div
                      style={{
                        ...typography.overline,
                        color: "rgba(255, 194, 51, 0.95)",
                        letterSpacing: "0.18em",
                        marginBottom: spacing.sm,
                        textTransform: "uppercase",
                      }}
                    >
                      Our Honours
                    </div>
                    <div
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                        letterSpacing: "-0.01em",
                        marginBottom: spacing.xs,
                      }}
                    >
                      Trophy Cabinet
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.base,
                        opacity: 0.9,
                      }}
                    >
                      Tap to reveal our achievements
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="royal-reveal"
                  initial={{ opacity: 0, y: 10, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(14px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      ...typography.overline,
                      color: "rgba(255, 194, 51, 0.95)",
                      letterSpacing: "0.18em",
                      marginBottom: spacing.lg,
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    Trophy Cabinet
                  </div>

                  {/* Cabinet (wood frame + glass doors + lit bays) */}
                  <div
                    style={{
                      position: "relative",
                      maxWidth: 860,
                      margin: "0 auto",
                      borderRadius: borderRadius["2xl"],
                      padding: isMobile ? spacing.lg : spacing.xl,
                      background:
                        "linear-gradient(135deg, rgba(92, 54, 28, 0.92) 0%, rgba(66, 38, 20, 0.90) 40%, rgba(84, 48, 25, 0.92) 100%)",
                      border: "1px solid rgba(255, 194, 51, 0.22)",
                      boxShadow:
                        "0 40px 110px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 0 1px rgba(0,0,0,0.35)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Wood grain + vignette */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 7px), radial-gradient(circle at 50% 10%, rgba(255,194,51,0.10) 0%, transparent 55%), radial-gradient(circle at 50% 100%, rgba(0,0,0,0.35) 0%, transparent 55%)",
                        opacity: 0.7,
                        pointerEvents: "none",
                      }}
                    />

                    {/* Inner cabinet area (glass back + depth) */}
                    <div
                      style={{
                        position: "relative",
                        borderRadius: borderRadius.xl,
                        padding: isMobile ? spacing.lg : spacing.xl,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(10,16,32,0.35) 35%, rgba(10,16,32,0.55) 100%)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 30px 90px rgba(0,0,0,0.55)",
                        overflow: "hidden",
                      }}
                    >
                      {/* Cabinet mullions */}
                      {!isMobile && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: "50%",
                            width: 2,
                            background: "linear-gradient(180deg, rgba(255,194,51,0.20), rgba(0,0,0,0.55))",
                            opacity: 0.9,
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Sliding glass doors (open animation) */}
                      <motion.div
                        aria-hidden="true"
                        initial={{ x: "0%", opacity: 0.95 }}
                        animate={{ x: "-56%", opacity: 0 }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: "50%",
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.10) 100%)",
                          borderRight: "1px solid rgba(255,255,255,0.10)",
                          backdropFilter: "blur(2px)",
                          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.06)",
                          pointerEvents: "none",
                          zIndex: 3,
                        }}
                      />
                      <motion.div
                        aria-hidden="true"
                        initial={{ x: "0%", opacity: 0.95 }}
                        animate={{ x: "56%", opacity: 0 }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          right: 0,
                          width: "50%",
                          background:
                            "linear-gradient(225deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.10) 100%)",
                          borderLeft: "1px solid rgba(255,255,255,0.10)",
                          backdropFilter: "blur(2px)",
                          boxShadow: "inset 1px 0 0 rgba(255,255,255,0.06)",
                          pointerEvents: "none",
                          zIndex: 3,
                        }}
                      />

                      {/* Content bays */}
                      <div
                        style={{
                          position: "relative",
                          zIndex: 2,
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                          gap: isMobile ? spacing.lg : spacing.xl,
                          alignItems: "stretch",
                        }}
                      >
                        {achievements.map((achievement, idx) => {
                          const Icon = achievement.icon;
                          const glow = achievement.glow;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 16, scale: 0.99 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.65, delay: 0.18 + idx * 0.10, ease: [0.22, 1, 0.36, 1] }}
                              whileHover={{ y: -3 }}
                              style={{
                                position: "relative",
                                borderRadius: borderRadius.xl,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background:
                                  "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(10,16,32,0.22) 45%, rgba(10,16,32,0.40) 100%)",
                                boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.25)",
                                overflow: "hidden",
                                minHeight: isMobile ? 220 : 260,
                              }}
                            >
                              {/* Spotlight (lamp + cone) */}
                              <div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  top: 14,
                                  left: 0,
                                  right: 0,
                                  height: 170,
                                  pointerEvents: "none",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: "50%",
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    transform: "translateX(-50%)",
                                    background: "rgba(255,255,255,0.22)",
                                    boxShadow: `0 0 0 1px rgba(255,255,255,0.10), 0 0 22px ${glow}55`,
                                    opacity: 0.9,
                                  }}
                                />
                                <motion.div
                                  style={{
                                    position: "absolute",
                                    top: 6,
                                    left: "50%",
                                    width: "140%",
                                    height: 170,
                                    transform: "translateX(-50%)",
                                    background: `radial-gradient(ellipse at 50% 0%, ${glow}33 0%, rgba(255,255,255,0.08) 22%, transparent 70%)`,
                                    filter: "blur(2px)",
                                    opacity: 0.85,
                                  }}
                                  animate={{ opacity: [0.7, 0.95, 0.7] }}
                                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: idx * 0.25 }}
                                />
                              </div>

                              {/* Glass shelf */}
                              <div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  right: 12,
                                  top: isMobile ? 116 : 132,
                                  height: 10,
                                  borderRadius: 999,
                                  background:
                                    "linear-gradient(180deg, rgba(180,255,230,0.12) 0%, rgba(255,255,255,0.14) 35%, rgba(0,0,0,0.18) 100%)",
                                  boxShadow:
                                    "0 10px 25px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                                  opacity: 0.75,
                                }}
                              />

                              {/* Trophy sitting on shelf */}
                              <motion.div
                                style={{
                                  position: "absolute",
                                  top: isMobile ? 58 : 66,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  width: 72,
                                  height: 72,
                                  borderRadius: 18,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,169,0,0.10) 35%, rgba(0,224,255,0.08) 100%)",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  boxShadow: `0 26px 70px rgba(0,0,0,0.55), 0 0 34px ${glow}26`,
                                  backdropFilter: "blur(10px)",
                                }}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 + idx * 0.12 }}
                              >
                                <Icon
                                  size={44}
                                  primary={(achievement as any).primary}
                                  secondary={(achievement as any).secondary}
                                  style={{ filter: `drop-shadow(0 0 14px ${glow}66)` }}
                                />
                              </motion.div>

                              {/* Copy */}
                              <div
                                style={{
                                  position: "absolute",
                                  left: 18,
                                  right: 18,
                                  bottom: 18,
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    ...typography.body,
                                    color: colors.text.primary,
                                    fontWeight: typography.fontWeight.bold,
                                    fontSize: typography.fontSize.base,
                                    lineHeight: 1.25,
                                    marginBottom: 6,
                                  }}
                                >
                                  {achievement.label}
                                </div>
                                <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.88 }}>
                                  {achievement.tooltip}
                                </div>
                              </div>

                              {/* Glass reflections */}
                              <motion.div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background:
                                    "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.12) 28%, rgba(255,255,255,0.04) 42%, transparent 65%)",
                                  opacity: 0.45,
                                  filter: "blur(6px)",
                                  transform: "translateX(-40%)",
                                  pointerEvents: "none",
                                }}
                                animate={{ x: ["-45%", "45%", "-45%"] }}
                                transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 + idx * 0.25 }}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.75, marginTop: spacing.lg }}>
                    Tap again to close
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Cabinet Doors - Animated Opening */}
        <AnimatePresence>
          {variant === "compact" && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                overflow: "hidden",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Glass Door Effect */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%, 
                    transparent 50%, 
                    rgba(255, 255, 255, 0.05) 100%)`,
                  backdropFilter: "blur(2px)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              {/* Achievements Display - Horizontal Layout */}
              <div style={{
                padding: spacing.xl,
                display: "flex",
                flexDirection: "row",
                gap: spacing.lg,
                position: "relative",
                zIndex: 2,
                alignItems: "stretch",
                justifyContent: "center",
                flexWrap: "nowrap",
              }}>
                {achievements.map((achievement, idx) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        delay: idx * 0.15 + 0.2,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      whileHover={{ 
                        x: 4,
                        transition: { duration: 0.2 }
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: spacing.sm,
                        padding: spacing.lg,
                        background: `linear-gradient(135deg, 
                          rgba(255, 255, 255, 0.05) 0%, 
                          rgba(255, 255, 255, 0.02) 100%)`,
                        borderRadius: borderRadius.lg,
                        border: `1px solid rgba(255, 169, 0, 0.2)`,
                        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px ${achievement.glow}20`,
                        cursor: "default",
                        flex: "1 1 0",
                        maxWidth: "300px",
                      }}
                      title={achievement.tooltip}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: idx * 0.5,
                        }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, 
                            rgba(255, 169, 0, 0.25) 0%, 
                            rgba(255, 194, 51, 0.2) 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: `2px solid ${achievement.glow}60`,
                          boxShadow: `0 0 20px ${achievement.glow}40, inset 0 0 10px ${achievement.glow}20`,
                        }}
                      >
                        <Icon
                          size={32}
                          primary={(achievement as any).primary}
                          secondary={(achievement as any).secondary}
                          style={{
                            filter: `drop-shadow(0 0 10px ${achievement.glow}55)`,
                          }}
                        />
                      </motion.div>
                      <span
                        style={{
                          ...typography.body,
                          color: colors.text.primary,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          letterSpacing: "0.02em",
                          textAlign: "center",
                          textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`,
                          lineHeight: 1.4,
                        }}
                      >
                        {achievement.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Cabinet Bottom Decoration */}
              <div
                style={{
                  height: 4,
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 169, 0, 0.4) 20%, 
                    rgba(255, 169, 0, 0.6) 50%, 
                    rgba(255, 169, 0, 0.4) 80%, 
                    transparent 100%)`,
                  marginTop: spacing.md,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Programs Preview Tabs Component for Homepage
const ProgramsPreviewTabs: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const [activeTab, setActiveTab] = useState("epp");

  const programs = [
    {
      id: "epp",
      name: "Elite Pathway Program",
      acronym: "EPP",
      positioning: "For players targeting top-tier football in India and abroad.",
      outcomes: [
        "Super Division focused competition",
        "Highest training intensity & smallest groups",
        "Individual development plans with AI-assisted simulation",
      ],
    },
    {
      id: "scp",
      name: "Senior Competitive Program",
      acronym: "SCP",
      positioning: "The competitive bridge between youth and elite football.",
      outcomes: [
        "KSFA C & D Division exposure",
        "Regular match minutes & structured progression",
        "Primary internal feeder to EPP",
      ],
    },
    {
      id: "wpp",
      name: "Women's Performance Pathway",
      acronym: "WPP",
      positioning: "A unified pathway for women footballers aiming professional levels.",
      outcomes: [
        "Women's B Division exposure",
        "Year-round matches & same data rigor",
        "Long-term career pathway",
      ],
    },
    {
      id: "fydp",
      name: "Foundation & Youth Development Program",
      acronym: "FYDP",
      positioning: "Building intelligent footballers before building competitors.",
      outcomes: [
        "U9, U11, U13 gender-neutral development",
        "Tactical foundations aligned with senior teams",
        "Data-assisted development from youth level",
      ],
    },
  ];

  const activeProgram = programs.find(p => p.id === activeTab) || programs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      {/* Tabs - Horizontal on desktop, scrollable on mobile */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "row" : "row",
        gap: spacing.sm,
        marginBottom: spacing["2xl"],
        overflowX: isMobile ? "auto" : "visible",
        paddingBottom: isMobile ? spacing.sm : 0,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {programs.map((program) => {
          const isActive = program.id === activeTab;
          return (
            <motion.button
              key={program.id}
              onClick={() => setActiveTab(program.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: spacing.md,
                background: isActive 
                  ? `linear-gradient(135deg, rgba(0,224,255,0.15) 0%, rgba(255,169,0,0.1) 100%)`
                  : `rgba(255, 255, 255, 0.03)`,
                border: `1px solid ${isActive ? "rgba(0,224,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: borderRadius.lg,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 0 20px rgba(0,224,255,0.2)` : "none",
                minWidth: isMobile ? "200px" : "auto",
                flexShrink: 0,
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                }
              }}
            >
              <div style={{ marginBottom: spacing.xs }}>
                <span style={{
                  ...typography.h5,
                  color: isActive ? colors.text.primary : colors.text.secondary,
                  fontSize: typography.fontSize.base,
                  fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                }}>
                  {program.acronym}
                </span>
              </div>
              <p style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.xs,
                margin: 0,
                opacity: isActive ? 0.85 : 0.6,
                lineHeight: 1.4,
              }}>
                {program.name}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Active Program Preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `rgba(10, 16, 32, 0.55)`,
            backdropFilter: "blur(10px)",
            borderRadius: borderRadius["2xl"],
            border: `1px solid rgba(255,255,255,0.08)`,
            padding: isMobile ? spacing.lg : spacing.xl,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: spacing.xl, alignItems: "start" }}>
            <div>
              <h3 style={{
                ...typography.h3,
                color: colors.text.primary,
                marginBottom: spacing.sm,
                fontSize: typography.fontSize["2xl"],
              }}>
                {activeProgram.name} ({activeProgram.acronym})
              </h3>
              <p style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.base,
                marginBottom: spacing.lg,
                lineHeight: 1.6,
                opacity: 0.9,
              }}>
                {activeProgram.positioning}
              </p>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}>
                {activeProgram.outcomes.map((outcome, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.sm,
                  }}>
                    <CheckIcon size={18} color={colors.accent.main} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      lineHeight: 1.6,
                      opacity: 0.85,
                    }}>
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link
                to={`/programs/${activeTab}`}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.sm,
                    padding: `${spacing.md} ${spacing.lg}`,
                    background: `linear-gradient(135deg, rgba(0,224,255,0.15) 0%, rgba(255,169,0,0.1) 100%)`,
                    border: `1px solid rgba(0,224,255,0.3)`,
                    borderRadius: borderRadius.lg,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(0,224,255,0.2) 0%, rgba(255,169,0,0.15) 100%)`;
                    e.currentTarget.style.borderColor = "rgba(0,224,255,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(0,224,255,0.15) 0%, rgba(255,169,0,0.1) 100%)`;
                    e.currentTarget.style.borderColor = "rgba(0,224,255,0.3)";
                  }}
                >
                  <span style={{
                    ...typography.body,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                  }}>
                    Explore Program
                  </span>
                  <ArrowRightIcon size={18} color={colors.accent.main} />
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// Tabbed Panel Component for Our Story Section
const TabbedPanel: React.FC<{
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    oneLiner: string;
    paragraph: string;
    miniNote: string;
  }>;
  isMobile: boolean;
}> = ({ tabs, isMobile }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute("role") !== "tab") return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        let nextIndex: number;
        
        if (isMobile) {
          // Horizontal navigation on mobile
          nextIndex = (e.key === "ArrowRight" || e.key === "ArrowDown")
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;
        } else {
          // Vertical navigation on desktop
          nextIndex = (e.key === "ArrowDown")
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length;
        }
        
        setActiveTab(tabs[nextIndex].id);
        // Focus the new tab
        const nextTab = document.querySelector(`[data-tab-id="${tabs[nextIndex].id}"]`) as HTMLElement;
        if (nextTab) nextTab.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const tabId = target.getAttribute("data-tab-id");
        if (tabId) setActiveTab(tabId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, tabs, isMobile]);

  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "320px 1fr",
      gap: isMobile ? spacing.md : spacing.xl,
      minHeight: "400px",
    }}>
      {/* Tabs List */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        gap: spacing.sm,
        overflowX: isMobile ? "auto" : "visible",
        paddingBottom: isMobile ? spacing.sm : 0,
        paddingRight: isMobile ? 0 : spacing.sm,
      }}>
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          const step = String(idx + 1).padStart(2, "0");
          return (
            <motion.button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              data-tab-id={tab.id}
              tabIndex={0}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ x: isMobile ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
              onFocus={(e) => {
                if (!isActive) {
                  e.currentTarget.style.outline = `2px solid ${colors.accent.main}60`;
                  e.currentTarget.style.outlineOffset = "2px";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
              style={{
                padding: spacing.md,
                background: isActive
                  ? `linear-gradient(135deg, rgba(0,224,255,0.14) 0%, rgba(255,169,0,0.08) 100%)`
                  : `rgba(255, 255, 255, 0.03)`,
                border: `1px solid ${isActive ? "rgba(0,224,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: borderRadius.lg,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,224,255,0.12) inset` : "none",
                minWidth: isMobile ? "200px" : "auto",
                flexShrink: 0,
                outline: "none",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                }
              }}
            >
              {/* Active accent rail */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 10,
                  bottom: 10,
                  width: 3,
                  borderRadius: 999,
                  background: isActive ? `linear-gradient(180deg, rgba(0,224,255,0.9), rgba(255,169,0,0.85))` : "transparent",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 180ms ease",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs }}>
                <span
                  style={{
                    ...typography.caption,
                    color: isActive ? colors.text.primary : colors.text.muted,
                    fontSize: typography.fontSize.xs,
                    letterSpacing: "0.18em",
                    opacity: isActive ? 0.9 : 0.55,
                    padding: `2px 8px`,
                    borderRadius: borderRadius.full,
                    border: `1px solid ${isActive ? "rgba(0,224,255,0.30)" : "rgba(255,255,255,0.10)"}`,
                    background: isActive ? "rgba(0,224,255,0.08)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  {step}
                </span>
                <div style={{ opacity: isActive ? 1 : 0.6 }}>
                  {tab.icon}
                </div>
                <span 
                  id={`tab-${tab.id}`}
                  style={{
                    ...typography.h5,
                    color: isActive ? colors.text.primary : colors.text.secondary,
                    fontSize: typography.fontSize.base,
                    fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                  }}
                >
                  {tab.label}
                </span>
              </div>
              <p style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.sm,
                margin: 0,
                opacity: isActive ? 0.85 : 0.6,
                lineHeight: 1.5,
              }}>
                {tab.oneLiner}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Content Panel */}
      <div 
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        style={{
          position: "relative",
          minHeight: "400px",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "relative",
                background: `linear-gradient(135deg, rgba(10, 16, 32, 0.62) 0%, rgba(10, 16, 32, 0.48) 100%)`,
                backdropFilter: "blur(14px)",
                borderRadius: borderRadius["2xl"],
                border: `1px solid rgba(255,255,255,0.10)`,
                boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
                padding: isMobile ? spacing.lg : spacing.xl,
                height: "100%",
                minHeight: "400px",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* subtle glow behind */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 20% 15%, rgba(0,224,255,0.10) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(255,169,0,0.08) 0%, transparent 55%)",
                  pointerEvents: "none",
                  opacity: 0.9,
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md }}>
                  <div style={{ opacity: 0.95 }}>{activeTabData.icon}</div>
                  <span style={{ ...typography.h3, color: colors.text.primary, fontSize: typography.fontSize["2xl"], margin: 0 }}>
                    {activeTabData.label}
                  </span>
                </div>

              <p style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.base,
                marginBottom: spacing.lg,
                lineHeight: 1.6,
                opacity: 0.9,
              }}>
                {activeTabData.oneLiner}
              </p>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.75,
                  opacity: 0.9,
                  margin: 0,
                  marginBottom: spacing.lg,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {activeTabData.paragraph}
              </p>
              {!!activeTabData.miniNote && (
                <p
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.xs,
                    fontStyle: "italic",
                    margin: 0,
                    opacity: 0.85,
                    lineHeight: 1.5,
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    marginBottom: spacing.lg,
                  }}
                >
                  {activeTabData.miniNote}
                </p>
              )}
              </div>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  // Use centralized animation hook
  const {
    sectionVariants,
    headingVariants,
    subheadingVariants,
    cardVariants,
    listItemVariants,
    statVariants,
    imageVariants,
    imageFloatVariants,
    heroVariants,
    heroContentVariants,
    buttonVariants,
    cardHover,
    imageHover,
    primaryButtonHover,
    primaryButtonTap,
    secondaryButtonHover,
    secondaryButtonTap,
    staggerContainer,
    viewportOnce,
    getStaggeredCard,
    getStaggeredListItem,
  } = useHomepageAnimation();

  // Parallax for hero background
  const heroParallax = useHeroParallax({ speed: 0.15 });

  const [upcomingFixtures, setUpcomingFixtures] = useState<PublicFixture[]>([]);
  const [recentResults, setRecentResults] = useState<PublicFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"fixtures" | "results">("fixtures");
  const [products, setProducts] = useState<any[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [centresLoading, setCentresLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // NOTE: Trophy Cabinet is intentionally NOT rendered in the Hero.
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackImageRef = useRef<HTMLDivElement>(null);
  const integratedFallbackRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLIFrameElement>(null);
  const overlayVideoRef = useRef<HTMLIFrameElement>(null);
  const productsFetchedRef = useRef(false);
  const centresFetchedRef = useRef(false);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure video starts playing immediately on load - YouTube autoplay requires visible iframe
  useEffect(() => {
    // Force video to be visible immediately for autoplay to work
    if (heroVideoRef.current) {
      heroVideoRef.current.style.opacity = "0.7";
      // Ensure iframe is in viewport for autoplay
      heroVideoRef.current.style.visibility = "visible";
    }
    // Ensure overlay video is visible and playing
    if (overlayVideoRef.current) {
      overlayVideoRef.current.style.opacity = "1";
      overlayVideoRef.current.style.visibility = "visible";
    }
  }, []);

  // Fetch fixtures from API
  useEffect(() => {
    const loadFixtures = async () => {
      try {
        setFixturesLoading(true);
        const data = await api.getPublicFixtures();
        setUpcomingFixtures(data.upcoming || []);
        setRecentResults(data.results || []);
      } catch (error) {
        console.error("Failed to load fixtures:", error);
        setUpcomingFixtures([]);
        setRecentResults([]);
      } finally {
        setFixturesLoading(false);
      }
    };
    loadFixtures();
  }, []);

  // Handle navigation to section when navigating from other pages
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }, 300);
    }
  }, []);

  // Fetch featured products
  useEffect(() => {
    if (productsFetchedRef.current) return; // prevent dev double fetch
    productsFetchedRef.current = true;
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data.slice(0, 4)); // Show first 4 products
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    loadProducts();
  }, []);

  // Fetch centres
  useEffect(() => {
    if (centresFetchedRef.current) return; // prevent dev double fetch
    centresFetchedRef.current = true;
    const loadCentres = async () => {
      try {
        setCentresLoading(true);
        const data = await api.getPublicCentres();
        setCentres(data);
      } catch (error) {
        console.error("Error loading centres:", error);
        setCentres([]);
      } finally {
        setCentresLoading(false);
      }
    };
    loadCentres();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (timeString: string) => {
    return timeString || "TBD";
  };

  const handleOpenInMaps = (centre: Centre) => {
    if (centre.googleMapsUrl) {
      window.open(centre.googleMapsUrl, "_blank");
    } else if (centre.latitude && centre.longitude) {
      // Fallback: create Google Maps URL from coordinates
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${centre.latitude},${centre.longitude}`,
        "_blank"
      );
    }
  };

  return (
    <div
      style={{
        position: "relative",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
        overflowX: "hidden",
        overflowY: "visible",
        width: "100%",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Subtle fixed header that stays visible */}
      <div
        style={{
          position: "fixed",
          top: spacing.sm,
          left: 0,
          right: 0,
          zIndex: 1200,
          padding: `0 ${spacing.md}`,
          pointerEvents: "auto",
          background: "transparent",
        }}
      >
        <PublicHeader />
      </div>
      <style>{`
        #vision-2026 { display: none !important; }
        .hero-link:focus-visible {
          outline: 2px solid rgba(0, 224, 255, 0.75);
          outline-offset: 3px;
          border-radius: 16px;
        }
      `}</style>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          paddingTop: 0,
          position: "relative",
          overflow: "visible",
          overflowY: "visible",
        }}
      >
      {/* 1. HERO SECTION - STUNNING INTERACTIVE EXPERIENCE */}
      <motion.section
        ref={heroParallax.ref}
        id="hero"
        variants={heroVariants}
        initial="initial"
        animate="animate"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: "96px",
          overflow: "hidden",
        }}
      >
        {/* Multi-layer Background System */}
        {/* Layer 1: Background Video (desktop only) - Only visible in hero section with infinity flow */}
        <motion.div
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            width: "177.77777778vh",
            height: "120vh",
            minWidth: "100%",
            minHeight: "calc(56.25vw + 20vh)",
            transform: "translateX(-50%) scale(1.2)",
            zIndex: -1,
            opacity: 0.7,
            overflow: "hidden",
            pointerEvents: "none",
          }}
          initial={{ opacity: 0.7 }}
        >
          <iframe
            ref={heroVideoRef}
            src={`${heroAssets.backgroundVideoEmbed}&fs=0&cc_load_policy=0&mute=1&autoplay=1&loop=1&playlist=_iplvxf8JCo&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=0`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "none",
              opacity: 1,
            }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen={false}
            loading="eager"
            title="Background Video"
          />
        </motion.div>
        
        {/* Layer 2: Background image fallback with parallax */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${heroAssets.teamBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            zIndex: -1,
            display: "none",
            y: heroParallax.y,
            opacity: heroParallax.opacity,
          }}
        />

        {/* Layer 4: Video background with animated gradient overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            overflow: "hidden",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* YouTube Video Background - Full coverage with no thumbnail */}
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
            initial={{ opacity: 1 }}
          >
            <iframe
              ref={overlayVideoRef}
              src="https://www.youtube-nocookie.com/embed/_iplvxf8JCo?autoplay=1&mute=1&loop=1&playlist=_iplvxf8JCo&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=0&fs=0&cc_load_policy=0&showinfo=0&origin=https://www.youtube.com"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100vw",
                height: "56.25vw",
                minWidth: "177.77777778vh",
                minHeight: "100vh",
                transform: "translate(-50%, -50%)",
                border: "none",
                pointerEvents: "none",
                opacity: 1,
              }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
              loading="eager"
              title="Overlay Background Video"
            />
          </motion.div>
          {/* Gradient Overlay - Maintains infinity flow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: heroAssets.overlayGradientLeft,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* Animated radial gradient for depth */}
        <motion.div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(0, 224, 255, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
            zIndex: 1,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* LAYER 2: HERO HOOK (Revamped) */}
        <div
          style={{
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            padding: `0 ${spacing.xl}`,
            position: "relative",
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
            gap: isMobile ? spacing["2xl"] : spacing["3xl"],
            alignItems: "center",
            minHeight: "calc(100vh - 96px)",
            paddingBottom: spacing["3xl"],
          }}
        >
          {/* LEFT: Message + Primary actions */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: "860px" }}
          >
            {/* Headline */}
            <motion.h1
              style={{
                ...typography.display,
                fontSize: `clamp(3.2rem, 8.6vw, 6.2rem)`,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                lineHeight: 1.02,
                fontWeight: typography.fontWeight.bold,
                letterSpacing: "-0.03em",
                textShadow: "0 6px 50px rgba(0, 0, 0, 0.85), 0 0 70px rgba(0, 224, 255, 0.18)",
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                A Revolution
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                Begins{" "}
                <span
                  style={{
                    background: `linear-gradient(90deg, ${colors.accent.main}, rgba(255, 194, 51, 0.95))`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow: "none",
                  }}
                >
                  In Bengaluru.
                </span>
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 0.92, y: 0 }}
              transition={{ delay: 0.6, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...typography.body,
                fontSize: `clamp(${typography.fontSize.lg}, 2vw, ${typography.fontSize.xl})`,
                color: colors.text.secondary,
                marginBottom: spacing.xl,
                lineHeight: 1.75,
                maxWidth: "720px",
                textShadow: "0 2px 24px rgba(0, 0, 0, 0.65)",
              }}
            >
              A modern football club ecosystem—coaching meets community, and RealVerse-backed data supports development.
              Built for the long term. Designed to win the right way.
            </motion.p>

            {/* Primary CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: spacing.md,
                alignItems: "stretch",
                maxWidth: isMobile ? "100%" : "680px",
              }}
            >
              <Link
                to="/shop"
                className="hero-link"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    background:
                      "linear-gradient(135deg, rgba(255,169,0,0.22) 0%, rgba(0,224,255,0.14) 55%, rgba(255,255,255,0.06) 100%)",
                    border: "1px solid rgba(255, 169, 0, 0.35)",
                    boxShadow: "0 18px 46px rgba(0,0,0,0.45), 0 0 30px rgba(255,169,0,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.lg,
                    cursor: "pointer",
                    backdropFilter: "blur(14px)",
                    width: "100%",
                    height: "100%",
                    minHeight: 78,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.bold }}>
                      Support the Club
                    </span>
                    <span style={{ ...typography.caption, color: colors.text.muted, opacity: 0.85 }}>
                      Shop official FC Real Bengaluru merchandise
                    </span>
                  </div>
                  <ArrowRightIcon size={18} color={colors.accent.main} />
                </motion.div>
              </Link>

              <Link to="/programs" className="hero-link" style={{ textDecoration: "none", width: "100%" }}>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: `${spacing.md} ${spacing.xl}`,
                    borderRadius: borderRadius.lg,
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.lg,
                    cursor: "pointer",
                    backdropFilter: "blur(14px)",
                    width: "100%",
                    height: "100%",
                    minHeight: 78,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                      Train With Us
                    </span>
                    <span style={{ ...typography.caption, color: colors.text.muted, opacity: 0.8 }}>
                      Explore competitive coaching pathways
                    </span>
                  </div>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <ArrowRightIcon size={18} color={colors.text.secondary} />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Fanclub CTA (replaces micro chips) - spans width of both CTAs above */}
            <a
              href="#content-stream"
              className="hero-link"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("content-stream");
                if (element) {
                  element.scrollIntoView({ behavior: "auto", block: "start" });
                  setTimeout(() => {
                    const fanClubSection = document.querySelector('[data-section="fan-club"]') as HTMLElement | null;
                    if (fanClubSection) fanClubSection.scrollIntoView({ behavior: "auto", block: "start" });
                  }, 80);
                }
              }}
              style={{ textDecoration: "none", display: "block" }}
              aria-label="Be a Part of the Journey — discover the Fanclub for exclusive gifts and VIP access"
            >
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 1.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  marginTop: spacing.md,
                  width: "100%",
                  maxWidth: isMobile ? "100%" : "680px",
                  padding: `${spacing.lg} ${spacing.xl}`,
                  borderRadius: borderRadius.xl,
                  background:
                    "linear-gradient(135deg, rgba(255,169,0,0.14) 0%, rgba(0,224,255,0.10) 42%, rgba(255,255,255,0.06) 100%)",
                  border: "1px solid rgba(255, 169, 0, 0.28)",
                  boxShadow: "0 22px 58px rgba(0,0,0,0.45), 0 0 34px rgba(255,169,0,0.14)",
                  backdropFilter: "blur(16px)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* subtle shimmer */}
                <motion.div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.10) 30%, rgba(255,169,0,0.10) 52%, transparent 100%)",
                    opacity: 0.35,
                    pointerEvents: "none",
                    transform: "translateX(-25%)",
                  }}
                  animate={{ x: ["-30%", "30%", "-30%"] }}
                  transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                />

                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: spacing.lg }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "rgba(255, 169, 0, 0.18)",
                      border: "1px solid rgba(255,169,0,0.28)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 10px 26px rgba(0,0,0,0.35), 0 0 18px rgba(255,169,0,0.18)",
                      flexShrink: 0,
                    }}
                  >
                    <StarIcon size={20} style={{ color: colors.accent.main }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                        fontSize: typography.fontSize.lg,
                        lineHeight: 1.25,
                        marginBottom: 4,
                      }}
                    >
                      Be a Part of the Journey
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                        opacity: 0.92,
                        lineHeight: 1.55,
                      }}
                    >
                      Join the Fanclub for <span style={{ color: colors.accent.main, fontWeight: typography.fontWeight.semibold }}>exclusive gifts</span>,{" "}
                      <span style={{ color: colors.accent.main, fontWeight: typography.fontWeight.semibold }}>VIP access</span>, and member-only drops.
                    </div>
                  </div>

                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
                  >
                    <ArrowRightIcon size={18} color={colors.accent.main} />
                  </motion.div>
                </div>
              </motion.div>
            </a>
          </motion.div>

          {/* RIGHT: Interactive CTA cards (removed per request) */}
        </div>

        {/* LAYER 3: SCROLL CUE - Seamless Infinite Scroll Continuity */}
        <motion.div
          style={{
            position: "absolute",
            bottom: spacing.xl,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: spacing.sm,
            pointerEvents: "none",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Gradient fade indicating continuation */}
          <div
            style={{
              width: "2px",
              height: "40px",
              background: `linear-gradient(to bottom, 
                ${colors.accent.main}80 0%, 
                ${colors.accent.main}40 50%, 
                transparent 100%)`,
              borderRadius: borderRadius.full,
            }}
          />
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: colors.accent.main, opacity: 0.7 }}
            >
              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </motion.div>

        {/* Bottom fade gradient for seamless transition */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: `linear-gradient(to bottom, 
              transparent 0%, 
              rgba(5, 11, 32, 0.3) 50%, 
              rgba(5, 11, 32, 0.6) 100%)`,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />

        {/* Mobile Optimizations & Video Fixes */}
        <style>{`
          /* Prevent overflow and ensure smooth flow */
          * {
            box-sizing: border-box;
          }
          
          @media (max-width: 768px) {
            #hero > div {
              padding: 0 ${spacing.md} !important;
            }
            #hero .text-content-mobile {
              text-align: center;
              padding-bottom: ${spacing.xl} !important;
            }
            #hero iframe {
              display: none !important;
            }
            
            /* Reduce bridge padding on mobile */
            section[style*="bridge"] {
              padding-top: 80px !important;
              padding-bottom: 80px !important;
              margin-top: -50px !important;
              margin-bottom: -50px !important;
            }
            
            /* Ensure no horizontal overflow */
            section {
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
          }
          
          /* Hide YouTube thumbnail, branding, and prevent black bars */
          #hero iframe {
            pointer-events: none !important;
          }
          
          /* Ensure video covers full area without black bars on desktop */
          @media (min-width: 769px) {
            #hero iframe {
              width: 177.77777778vh !important;
              height: 100vh !important;
              min-width: 100% !important;
              min-height: 56.25vw !important;
              transform: translate(-50%, -50%) scale(1.2) !important;
              overflow: hidden !important;
            }
          }
          
          /* Ensure all sections respect viewport */
          section {
            max-width: 100vw;
            overflow-x: hidden;
          }
          
          /* Fix any absolute positioned elements that might overflow */
          [style*="position: absolute"] {
            max-width: 100vw;
          }
          
          /* Responsive match cards */
          @media (max-width: 768px) {
            .match-card {
              grid-template-columns: 1fr !important;
              text-align: center !important;
            }
            
            /* Stack match card elements vertically on mobile */
            .match-card > div {
              justify-content: center !important;
            }
          }
          
          /* Ensure all content containers respect max-width */
          [style*="maxWidth"] {
            width: 100% !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          @media (max-width: 768px) {
            [style*="maxWidth"] {
              padding-left: 0.75rem !important;
              padding-right: 0.75rem !important;
            }
          }
        `}</style>
      </motion.section>

      {/* 2. COMBINED: ORIGIN STORY & DEBUT SEASON 2024 */}
      <InfinitySection
        id="origin"
        bridge={true}
        style={{
          display: "none", // merged into hero above
        }}
      >
        {/* Background - Match Photo (Extended Height) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{
            position: "absolute",
            top: "-10%",
            left: 0,
            right: 0,
            bottom: "-10%",
            backgroundImage: `url(/assets/DSC00893.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        
        {/* Dark Overlay for better text readability */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `rgba(5, 11, 32, 0.6)`,
            zIndex: 1,
          }}
        />
        
        {/* Gradient Overlay - matching other sections */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, 
              rgba(4, 61, 208, 0.4) 0%, 
              rgba(255, 169, 0, 0.3) 100%)`,
            zIndex: 2,
          }}
        />
        
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 3, width: "100%" }}>
          {/* Unified Content Container */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            style={{
              maxWidth: "1400px",
              margin: 0,
            }}
          >
            {/* Origin Story Section */}
            <motion.div variants={headingVariants} style={{ marginBottom: spacing["3xl"] }}>
              <motion.div
                style={{
                  display: "inline-block",
                  padding: `${spacing.xs} ${spacing.md}`,
                  background: "rgba(0, 224, 255, 0.1)",
                  border: `1px solid ${colors.accent.main}`,
                  borderRadius: borderRadius.full,
                  marginBottom: spacing.lg,
                }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em" }}>
                  WHERE IT ALL BEGAN
                </span>
              </motion.div>
              <motion.h2
                style={{
                  ...typography.h1,
                  fontSize: `clamp(2.5rem, 5vw, 4rem)`,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                  lineHeight: 1.2,
                  textAlign: "left",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Born in the Heart of
                <br />
                <span style={{ color: colors.accent.main }}>Bengaluru, Karnataka</span>
              </motion.h2>
              <motion.p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
                  lineHeight: 1.8,
                  marginBottom: spacing.xl,
                  textAlign: "left",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                In 2024, a vision was born in the vibrant city of Bengaluru. FC Real Bengaluru emerged not just as another football club, but as a movement—a commitment to revolutionize Indian football through innovation, community, and unwavering dedication to excellence.
              </motion.p>
              <motion.p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.base,
                  color: colors.text.muted,
                  lineHeight: 1.8,
                  textAlign: "left",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Rooted in Karnataka's rich football culture, we set out to build something different. Something sustainable. Something that would stand the test of time.
              </motion.p>
            </motion.div>
            
            {/* Seamless Transition to Debut Season */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: false, amount: 0.2 }}
              style={{
                textAlign: "left",
              }}
            >
        <motion.div
              initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: false }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.sm,
                padding: `${spacing.sm} ${spacing.lg}`,
                background: `linear-gradient(135deg, ${colors.accent.main}15 0%, ${colors.primary.main}15 100%)`,
                border: `1px solid ${colors.accent.main}40`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.xl,
                backdropFilter: "blur(10px)",
                boxShadow: `0 8px 32px ${colors.accent.main}20`,
              }}
            >
              <TrophyIcon size={16} color={colors.accent.main} />
              <span style={{ 
                ...typography.overline, 
                color: colors.accent.main, 
                letterSpacing: "0.2em",
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.sm,
              }}>
                DEBUT SEASON 2024
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              style={{
                ...typography.h1,
                fontSize: `clamp(3.5rem, 8vw, 6.5rem)`,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                lineHeight: 1.1,
                textShadow: `0 4px 20px rgba(255, 169, 0, 0.3)`,
                letterSpacing: "-0.02em",
              }}
            >
              A{" "}
              <motion.span 
                style={{ 
                  color: colors.accent.main,
                  background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
                animate={{
                  textShadow: [
                    `0 0 20px ${colors.accent.main}40`,
                    `0 0 40px ${colors.accent.main}60`,
                    `0 0 20px ${colors.accent.main}40`,
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Statement
              </motion.span>{" "}
              Season
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: false }}
              style={{
                ...typography.body,
                fontSize: `clamp(${typography.fontSize.lg}, 2.5vw, ${typography.fontSize["2xl"]})`,
                color: colors.text.secondary,
                maxWidth: "900px",
                margin: 0,
                lineHeight: 1.9,
                fontWeight: typography.fontWeight.medium,
                letterSpacing: "0.01em",
                marginBottom: spacing["3xl"],
              }}
            >
              Champions in D Division. Runners-up in C Division. In our debut season, we didn't just compete—we conquered.
            </motion.p>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(350px, 100%), 1fr))",
              gap: spacing["2xl"],
                marginTop: spacing["2xl"],
              maxWidth: "1400px",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            {[
              { 
                label: "D Division", 
                value: "Champions", 
                subValue: "Unbeaten",
                Icon: TrophyIcon,
                gradient: `linear-gradient(135deg, rgba(255, 169, 0, 0.3) 0%, rgba(255, 194, 51, 0.3) 100%)`,
                glowColor: colors.accent.main,
                description: "Perfect record. Perfect season.",
              },
              { 
                label: "C Division", 
                value: "Runners-Up", 
                subValue: "Second Place",
                Icon: MedalIcon,
                gradient: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(45, 95, 232, 0.3) 100%)`,
                glowColor: colors.primary.main,
                description: "One step from the top.",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: idx * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                viewport={{ once: false, amount: 0.3 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 },
                }}
                style={{
                  position: "relative",
                  background: `linear-gradient(135deg, 
                    rgba(20, 31, 58, 0.95) 0%, 
                    rgba(15, 23, 42, 0.9) 100%)`,
                  backdropFilter: "blur(10px)",
                  borderRadius: borderRadius.xl,
                  padding: spacing["2xl"],
                  textAlign: "center",
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                  overflow: "hidden",
                }}
              >
                {/* Card Background Gradient */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: stat.gradient,
                    opacity: 0.3,
                    zIndex: 0,
                  }}
                />
                
                {/* Animated Glow Effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.5,
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "200px",
                    height: "200px",
                    background: `radial-gradient(circle, ${stat.glowColor}30 0%, transparent 70%)`,
                    borderRadius: "50%",
                    filter: "blur(40px)",
                    zIndex: 0,
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Icon Container */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: idx * 0.15 + 0.3,
                      type: "spring",
                      stiffness: 150,
                    }}
                    viewport={{ once: false }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${stat.glowColor}20 0%, ${stat.glowColor}10 100%)`,
                      border: `2px solid ${stat.glowColor}40`,
                      marginBottom: spacing.xl,
                      boxShadow: `0 0 30px ${stat.glowColor}30`,
                    }}
                  >
                    <stat.Icon 
                      size={48} 
                      color={stat.glowColor}
                      style={{
                        filter: `drop-shadow(0 0 10px ${stat.glowColor}60)`,
                      }}
                    />
                  </motion.div>

                  {/* Value */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.15 + 0.5 }}
                    viewport={{ once: false }}
                    style={{
                      marginBottom: spacing.xs,
                    }}
                  >
                    <div
                      style={{
                        ...typography.h2,
                        fontSize: `clamp(2rem, 4vw, 3rem)`,
                        color: stat.glowColor,
                        fontWeight: typography.fontWeight.bold,
                        textShadow: `0 4px 20px ${stat.glowColor}40`,
                        letterSpacing: "0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      {stat.value}
                    </div>
                  </motion.div>

                  {/* Sub Value */}
                    {stat.subValue && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.15 + 0.6 }}
                      viewport={{ once: false }}
                        style={{
                          ...typography.body,
                        fontSize: typography.fontSize.lg,
                          color: colors.text.secondary,
                        marginBottom: spacing.sm,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {stat.subValue}
                  </motion.div>
                  )}

                  {/* Description */}
                  {stat.description && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.15 + 0.7 }}
                      viewport={{ once: false }}
                      style={{
                        ...typography.caption,
                        fontSize: typography.fontSize.xs,
                        color: colors.text.muted,
                        marginBottom: spacing.md,
                        fontStyle: "italic",
                        lineHeight: 1.4,
                      }}
                    >
                      {stat.description}
                    </motion.div>
                  )}

                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.15 + 0.8 }}
                    viewport={{ once: false }}
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.lg,
                      color: colors.text.muted,
                      fontWeight: typography.fontWeight.medium,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </motion.div>
                </div>
              </motion.div>
            ))}
            </motion.div>
          </motion.div>
        </div>
      </InfinitySection>

      {/* 4. 2026 VISION - I-LEAGUE 3 (removed) */}

      {/* 6. OUR STORY - Comprehensive Club Introduction */}
      <InfinitySection
        id="our-story"
        bridge={true}
        style={{
          padding: isMobile ? `40px ${spacing.xl}` : `64px ${spacing.xl}`,
          background: "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Image with Parallax Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: 1,
            scale: [1, 1.08, 1],
          }}
          transition={{ 
            opacity: { duration: 1.5 },
            scale: {
              duration: 25,
              repeat: Infinity,
              ease: [0.4, 0, 0.6, 1],
            }
          }}
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            right: "-10%",
            bottom: "-10%",
            width: "120%",
            height: "120%",
            backgroundImage: `url("/assets/DSC00893.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.25,
            filter: "blur(8px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        
        {/* Dark Overlay for Text Readability */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.6) 0%, 
              rgba(10, 22, 51, 0.5) 50%, 
              rgba(5, 11, 32, 0.6) 100%)`,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
        
        {/* Subtle Radial Gradients for Depth */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 20%, rgba(0,224,255,0.08) 0%, transparent 50%), 
                         radial-gradient(circle at 80% 80%, rgba(255,169,0,0.06) 0%, transparent 50%)`,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Cinematic vignette (ties into hero mood + focuses content) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 700px at 35% 20%, rgba(255,255,255,0.05) 0%, transparent 55%), radial-gradient(900px 600px at 70% 75%, rgba(0,224,255,0.06) 0%, transparent 60%), radial-gradient(circle at 50% 50%, transparent 35%, rgba(0,0,0,0.55) 100%)",
            zIndex: 1,
            pointerEvents: "none",
            opacity: 0.9,
          }}
        />

        {/* Subtle Top Divider for Continuity */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)`,
            zIndex: 1,
          }}
        />

        {/* Content Container */}
        <div style={{ 
          maxWidth: "1400px", 
          margin: "0 auto", 
          position: "relative", 
          zIndex: 1, 
          width: "100%",
          padding: isMobile ? `${spacing.xl} 0` : `${spacing["3xl"]} 0`,
        }}>
          {/* Chapter header + proof (desktop: two-column; mobile: stacked) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
              gap: isMobile ? spacing.xl : spacing["3xl"],
              alignItems: "start",
              marginBottom: isMobile ? spacing.xl : spacing["2xl"],
            }}
          >
            {/* Left: narrative header */}
            <motion.div
              style={{ textAlign: "left" }}
              initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg }}>
                <motion.div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: spacing.sm,
                    padding: `${spacing.xs} ${spacing.md}`,
                    background: "rgba(0, 224, 255, 0.10)",
                    border: `1px solid rgba(0,224,255,0.28)`,
                    borderRadius: borderRadius.full,
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 18px 46px rgba(0,0,0,0.35)",
                  }}
                >
                  <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em" }}>
                    OUR STORY
                  </span>
                  <span style={{ ...typography.caption, color: colors.text.muted, opacity: 0.85 }}>
                    Chapter 01
                  </span>
                </motion.div>

                {/* subtle spine */}
                {!isMobile && (
                  <div
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      height: 1,
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.14) 0%, rgba(0,224,255,0.22) 35%, rgba(255,169,0,0.18) 70%, transparent 100%)",
                      opacity: 0.9,
                    }}
                  />
                )}
              </div>

              <motion.h2
                style={{
                  ...typography.h1,
                  fontSize: `clamp(2.6rem, 6vw, 5.2rem)`,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                  lineHeight: 1.08,
                  fontWeight: typography.fontWeight.bold,
                  letterSpacing: "-0.02em",
                  textShadow: "0 8px 56px rgba(0,0,0,0.65)",
                }}
              >
                Born in <span style={{ color: colors.accent.main }}>2024</span>, Built for{" "}
                <span style={{ color: colors.primary.main }}>Tomorrow</span>
              </motion.h2>

              <motion.p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.xl,
                  color: colors.text.secondary,
                  maxWidth: "62ch",
                  margin: 0,
                  lineHeight: 1.85,
                  opacity: 0.92,
                  textShadow: "0 4px 28px rgba(0,0,0,0.55)",
                }}
              >
                FC Real Bengaluru is building a modern football club ecosystem—where coaching meets community, and data supports development.
              </motion.p>
            </motion.div>

            {/* Right: proof container */}
            <motion.div
              initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
              viewport={{ once: false, amount: 0.2 }}
              style={{
                width: "100%",
                maxWidth: isMobile ? "100%" : "560px",
                justifySelf: isMobile ? "stretch" : "end",
              }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: borderRadius["2xl"],
                  background: "rgba(10,16,32,0.38)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 26px 72px rgba(0,0,0,0.55)",
                  backdropFilter: "blur(18px)",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 30% 25%, rgba(255,169,0,0.14) 0%, transparent 58%), radial-gradient(circle at 85% 80%, rgba(0,224,255,0.10) 0%, transparent 60%)",
                    opacity: 0.9,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1, padding: isMobile ? spacing.md : spacing.lg }}>
                  <TrophyCabinet variant="royal" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabbed Panel Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              style={{
                borderRadius: borderRadius["2xl"],
                background: "rgba(10, 16, 32, 0.28)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 26px 78px rgba(0,0,0,0.45)",
                padding: isMobile ? spacing.md : spacing.lg,
              }}
            >
              <TabbedPanel
                isMobile={isMobile}
                tabs={[
                {
                  id: "what-we-build",
                  label: "What We Build",
                  icon: <FireIcon size={20} color={colors.accent.main} />,
                  oneLiner: "A complete pathway—training, competition, and RealVerse.",
                  paragraph:
                    "We’re building a complete development pathway that blends modern coaching with meaningful competition and RealVerse-backed feedback. From youth squads to senior football, progression is structured, merit-led, and designed to support long-term growth—on and off the pitch.",
                  miniNote: "",
                },
                {
                  id: "our-goals",
                  label: "Our Goals",
                  icon: <MedalIcon size={20} color={colors.accent.main} />,
                  oneLiner: "Long-term excellence with ambition.",
                  paragraph:
                    "Our goal is long-term excellence: develop world-class footballers through structured progression, compete at higher levels as we climb the league ladder, and build a sustainable football ecosystem in Bengaluru. Data and modern processes help us improve every season—clear standards, clear progression.",
                  miniNote: "",
                },
                {
                  id: "our-story",
                  label: "Our Story",
                  icon: <StarIcon size={20} color={colors.accent.main} />,
                  oneLiner: "A Bengaluru club—community-first, built to rise.",
                  paragraph:
                    "FC Real Bengaluru is a football club based in Bengaluru, competing in the KSFA Super Division and other leagues with the ambition to climb the Indian football ladder. We’re community-driven at our core—developing youth through a clear pathway from grassroots academy to senior football, backed by structured, best-in-class training and a culture of sporting excellence.",
                  miniNote: "",
                },
                ]}
              />
            </div>
          </motion.div>

          {/* Subtle scroll invitation to maintain momentum into the infinite flow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            style={{
              marginTop: isMobile ? spacing.xl : spacing["2xl"],
              display: "flex",
              justifyContent: "center",
            }}
          >
            <motion.button
              type="button"
              onClick={() => {
                const el = document.getElementById("integrated-program");
                if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.sm,
                padding: `${spacing.sm} ${spacing.lg}`,
                borderRadius: borderRadius.full,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: colors.text.secondary,
                cursor: "pointer",
                backdropFilter: "blur(12px)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
              }}
            >
              <span style={{ ...typography.caption, opacity: 0.9 }}>Continue to Our Football Program</span>
              <motion.div
                aria-hidden="true"
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-flex" }}
              >
                <ArrowRightIcon size={16} style={{ color: colors.accent.main, transform: "rotate(90deg)" }} />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </InfinitySection>

        {/* 5. INTEGRATED FOOTBALL PROGRAM - Teams, Tech, Data & Training */}
      <InfinitySection
          id="integrated-program"
        bridge={true}
        style={{
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            background: "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
          {/* Background Image with Slow Zoom Effect - Only DSC09619 (1).JPG */}
          <motion.div
            ref={integratedFallbackRef}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: 1,
              scale: [1, 1.12, 1],
            }}
            transition={{ 
              opacity: { duration: 1.5 },
              scale: {
                duration: 30,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
              }
            }}
            style={{
              position: "absolute",
              top: "-10%",
              left: "-10%",
              right: "-10%",
              bottom: "-10%",
              width: "120%",
              height: "120%",
              backgroundImage: `url("/assets/DSC09619 (1).JPG")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              opacity: 0.3,
              filter: "blur(10px)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        
          {/* Dark Overlay for Text Readability */}
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.28) 0%, 
              rgba(5, 11, 32, 0.24) 50%, 
              rgba(5, 11, 32, 0.28) 100%)`,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Unified Header */}
            <motion.div
            style={{ textAlign: "center", marginBottom: spacing["3xl"] }}
            variants={headingVariants}
              initial="offscreen"
              whileInView="onscreen"
            viewport={viewportOnce}
          >
              <motion.div
                style={{
                  display: "inline-block",
                  padding: `${spacing.xs} ${spacing.md}`,
                  background: "rgba(0, 224, 255, 0.1)",
                  border: `1px solid ${colors.accent.main}`,
                  borderRadius: borderRadius.full,
                  marginBottom: spacing.lg,
                }}
              >
                <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em" }}>
                OUR FOOTBALL PROGRAM
                </span>
              </motion.div>
            <h2
                style={{
                  ...typography.h1,
                  fontSize: `clamp(2.5rem, 5vw, 4rem)`,
                  color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Competing Across <span style={{ color: colors.accent.main }}>Leagues</span>,{" "}
              <span style={{ color: colors.primary.main }}>Powered by</span>{" "}
              <span style={{ color: colors.accent.main }}>Innovation</span>
            </h2>
              <motion.p
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                maxWidth: "900px",
                margin: "0 auto",
                  lineHeight: 1.8,
                }}
              variants={subheadingVariants}
              >
              Our teams actively compete across multiple leagues, representing FC Real Bengaluru at every level. We enable this through RealVerse, data-driven insights, and top-tier coaching—creating a unified pathway from grassroots to professional football.
              </motion.p>
          </motion.div>

          {/* Part 1: Where We Compete - Football Pyramid with Academy Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.2 }}
                style={{
              marginBottom: spacing["3xl"],
                }}
              >
                  <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
                gap: spacing.xl,
                alignItems: "stretch",
                gridAutoRows: "1fr",
              }}
            >
              {/* Left: Where We Compete */}
              <motion.div
                variants={headingVariants}
        style={{
          position: "relative",
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  flexDirection: "column",
          overflow: "hidden",
          height: "100%",
          minHeight: "100%",
          alignSelf: "stretch",
          justifyContent: "space-between",
        }}
      >
                {/* Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
                    backgroundImage: `url(/assets/20250927-DSC_0446.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 0,
          }}
        />
                {/* Dark Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, 
                      rgba(20, 31, 58, 0.95) 0%, 
                      rgba(15, 23, 42, 0.9) 100%)`,
                    zIndex: 1,
                  }}
                />
                <div style={{ position: "relative", zIndex: 2 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.md,
                    marginBottom: spacing.lg,
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TrophyIcon size={24} color={colors.text.onPrimary} />
                  </div>
                  <h3
              style={{
                ...typography.h2,
                color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Where We Compete
                  </h3>
                </div>
                <p
              style={{
                ...typography.body,
                    color: colors.text.secondary,
                    marginBottom: spacing.xl,
                    lineHeight: 1.7,
                    fontSize: typography.fontSize.base,
                  }}
                >
                  Our teams actively represent FC Real Bengaluru across multiple competitive levels, from grassroots development to top-tier professional football.
                </p>
                 <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing.md }}>
                  {/* Senior Leagues & Programs */}
                  {[
                    {
                      level: "KSFA Super Division League",
                      desc: "First Team - Top Tier Competition",
                      highlighted: true,
                      importance: "highest",
                      program: "Elite Pathway Program (EPP) + Senior Competitive Program (SCP)",
                      programDesc: "Promotions via EPP and SCP into Super Division.",
                    isChild: false,
                    },
                    {
                      level: "KSFA Women's B Division League",
                      desc: "Women's B Division - Women's Elite Competition",
                      highlighted: true,
                      importance: "high",
                      program: "Women’s Performance Pathway (WPP)",
                      programDesc: "Dedicated women’s pathway feeding the B Division squad.",
                    isChild: false,
                    },
                    {
                      level: "KSFA C Division League",
                      desc: "Development Competitive",
                      highlighted: false,
                      importance: "medium",
                      program: "Senior Competitive Program (SCP)",
                      programDesc: "SCP develops and rotates players for KSFA C & D Divisions.",
                    isChild: false,
                    },
                    {
                      level: "KSFA D Division League",
                      desc: "Entry-level Competitive",
                      highlighted: false,
                      importance: "medium",
                      program: "Senior Competitive Program (SCP)",
                      programDesc: "SCP supports players not yet selected for higher divisions.",
                    isChild: false,
                    },
                  ].map((step, idx) => (
              <motion.div
                key={idx}
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.5, delay: idx * 0.1 }}
                       viewport={{ once: false }}
                style={{
                        background: step.importance === "highest"
                          ? `linear-gradient(135deg, rgba(255, 169, 0, 0.25) 0%, rgba(255, 194, 51, 0.15) 100%)`
                          : step.importance === "high"
                          ? `linear-gradient(135deg, rgba(255, 169, 0, 0.15) 0%, rgba(4, 61, 208, 0.1) 100%)`
                          : step.importance === "medium"
                          ? `linear-gradient(135deg, rgba(20, 31, 58, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)`
                          : step.importance === "youth-parent"
                          ? `linear-gradient(135deg, rgba(20, 31, 58, 0.5) 0%, rgba(15, 23, 42, 0.4) 100%)`
                          : `linear-gradient(135deg, rgba(20, 31, 58, 0.35) 0%, rgba(15, 23, 42, 0.25) 100%)`,
                         borderRadius: borderRadius.lg,
                        padding: spacing.md,
                        paddingLeft: step.isChild ? spacing.xl + spacing.md : spacing.md,
                         border: step.importance === "highest"
                           ? `2px solid ${colors.accent.main}`
                           : step.importance === "high"
                           ? `2px solid ${colors.accent.main}80`
                          : step.importance === "youth-parent"
                          ? `2px solid rgba(255, 255, 255, 0.15)`
                          : step.isChild
                          ? `2px solid rgba(255, 255, 255, 0.08)`
                          : `2px solid rgba(255, 255, 255, 0.1)`,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.md,
                  cursor: "pointer",
                         boxShadow: step.importance === "highest"
                           ? `0 4px 20px rgba(255, 169, 0, 0.3)`
                           : step.importance === "high"
                           ? `0 4px 20px rgba(255, 169, 0, 0.15)`
                           : "none",
                }}
                       whileHover={{ scale: 1.02, x: 5 }}
              >
                <div
                  style={{
                    width: step.isChild ? "32px" : "40px",
                    height: step.isChild ? "32px" : "40px",
                    borderRadius: "50%",
                           background: step.importance === "highest"
                             ? colors.accent.main
                             : step.importance === "high"
                      ? `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.main} 100%)`
                      : step.importance === "medium"
                      ? colors.primary.main
                      : colors.primary.soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.text.onPrimary,
                    fontWeight: typography.fontWeight.bold,
                    flexShrink: 0,
                           border: step.importance === "highest"
                             ? `2px solid ${colors.accent.main}`
                             : step.importance === "high"
                             ? `2px solid ${colors.accent.main}80`
                             : "none",
                           boxShadow: step.importance === "highest"
                             ? `0 0 20px ${colors.accent.main}60`
                             : step.importance === "high"
                             ? `0 0 15px ${colors.accent.main}40`
                             : "none",
                  }}
                    >
                      {step.isChild ? String.fromCharCode(97 + (idx - 5)) : idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                             ...typography.h5,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                             fontWeight: step.importance === "highest" || step.importance === "high"
                               ? typography.fontWeight.bold
                               : typography.fontWeight.semibold,
                             fontSize: step.importance === "highest"
                               ? typography.fontSize.lg
                               : step.importance === "high"
                               ? typography.fontSize.base
                               : typography.fontSize.sm,
                    }}
                  >
                    {step.level}
                  </div>
                    <div
                      style={{
                        ...typography.body,
                        color: step.importance === "highest"
                          ? colors.accent.main
                          : step.importance === "high"
                          ? colors.text.secondary
                          : step.importance === "youth-parent"
                          ? colors.text.secondary
                          : colors.text.muted,
                        fontSize: step.isChild ? typography.fontSize.xs : typography.fontSize.sm,
                        lineHeight: 1.5,
                        fontWeight: step.importance === "highest"
                          ? typography.fontWeight.medium
                          : typography.fontWeight.normal,
                      }}
                    >
                      {step.desc}
                    </div>
                </div>
              </motion.div>
            ))}

                   {/* Youth Leagues Parent */}
                   <motion.div
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.5, delay: 0.4 }}
                     viewport={{ once: false }}
        style={{
                       background: `linear-gradient(135deg, 
                         rgba(20, 31, 58, 0.5) 0%, 
                         rgba(15, 23, 42, 0.4) 100%)`,
                       borderRadius: borderRadius.lg,
                       padding: spacing.md,
                       border: `2px solid rgba(255, 255, 255, 0.15)`,
                       display: "flex",
                       alignItems: "center",
                       gap: spacing.md,
                       cursor: "pointer",
                       marginTop: spacing.sm,
                     }}
                     whileHover={{ scale: 1.01, x: 3 }}
                   >
        <div
          style={{
                         width: "40px",
                         height: "40px",
                         borderRadius: "50%",
                         background: colors.primary.soft,
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         color: colors.text.onPrimary,
                         fontWeight: typography.fontWeight.bold,
                         flexShrink: 0,
                       }}
                     >
                       5
                     </div>
                     <div style={{ flex: 1 }}>
                       <div
              style={{
                           ...typography.h5,
                color: colors.text.primary,
                           marginBottom: spacing.xs,
                           fontWeight: typography.fontWeight.semibold,
                           fontSize: typography.fontSize.base,
                         }}
                       >
                         Youth Leagues
                       </div>
                       <div
              style={{
                ...typography.body,
                           color: colors.text.secondary,
                           fontSize: typography.fontSize.sm,
                           lineHeight: 1.5,
              }}
            >
                         Grassroots Development Programs
          </div>
                     </div>
                   </motion.div>

                   {/* Youth League Sub-items */}
          <div
            style={{
                       marginLeft: spacing.xl,
                       paddingLeft: spacing.lg,
                       borderLeft: `2px solid rgba(255, 255, 255, 0.1)`,
              display: "flex",
                       flexDirection: "column",
                       gap: spacing.sm,
                     }}
                   >
                     {[
                       { level: "BLR Super League", desc: "U9 Competitive" },
                     { level: "BLR Super League", desc: "U11 Competitive" },
                     { level: "KSFA Youth League", desc: "U13 Competitive" },
                     ].map((youthLeague, youthIdx) => (
              <motion.div
                         key={youthIdx}
                         initial={{ opacity: 0, x: -20 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.5, delay: 0.5 + youthIdx * 0.1 }}
                         viewport={{ once: false }}
                      style={{
                           background: `linear-gradient(135deg, 
                             rgba(20, 31, 58, 0.35) 0%, 
                             rgba(15, 23, 42, 0.25) 100%)`,
                           borderRadius: borderRadius.md,
                           padding: spacing.sm,
                           paddingLeft: spacing.md,
                           border: `2px solid rgba(255, 255, 255, 0.08)`,
                           display: "flex",
                        alignItems: "center",
                           gap: spacing.sm,
                           cursor: "pointer",
                        position: "relative",
                      }}
                         whileHover={{ scale: 1.01, x: 3 }}
                    >
                         {/* Connecting line indicator */}
                      <div
                        style={{
                          position: "absolute",
                             left: "-12px",
                             top: "50%",
                             transform: "translateY(-50%)",
                             width: "8px",
                             height: "2px",
                             background: `linear-gradient(to right, 
                               rgba(255, 255, 255, 0.2) 0%, 
                               transparent 100%)`,
                           }}
                         />
                      <div
                        style={{
                             width: "28px",
                             height: "28px",
                             borderRadius: "50%",
                             background: colors.primary.soft,
                          display: "flex",
                          alignItems: "center",
                             justifyContent: "center",
                             color: colors.text.onPrimary,
                             fontWeight: typography.fontWeight.medium,
                             flexShrink: 0,
                             fontSize: typography.fontSize.xs,
                           }}
                         >
                           {String.fromCharCode(97 + youthIdx)} {/* a, b, c */}
                      </div>
                         <div style={{ flex: 1 }}>
                      <div
                        style={{
                               ...typography.body,
                            color: colors.text.primary,
                               marginBottom: `calc(${spacing.xs} / 2)`,
                               fontWeight: typography.fontWeight.medium,
                               fontSize: typography.fontSize.sm,
                          }}
                        >
                             {youthLeague.level}
                        </div>
                        <div
                          style={{
                            ...typography.body,
                            color: colors.text.muted,
                               fontSize: typography.fontSize.xs,
                               lineHeight: 1.4,
                          }}
                        >
                             {youthLeague.desc}
                        </div>
                      </div>
                    </motion.div>
                     ))}
                  </div>
                  {/* Point 6: Year-long Friendly & Exhibition */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    viewport={{ once: false }}
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(20, 31, 58, 0.5) 0%, 
                        rgba(15, 23, 42, 0.4) 100%)`,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      border: `2px solid rgba(255, 255, 255, 0.15)`,
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                      marginTop: spacing.lg,
                    }}
                    whileHover={{ scale: 1.01, x: 3 }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: colors.primary.soft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.text.onPrimary,
                        fontWeight: typography.fontWeight.bold,
                        flexShrink: 0,
                      }}
                    >
                      6
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          ...typography.h5,
                          color: colors.text.primary,
                          marginBottom: spacing.xs,
                          fontWeight: typography.fontWeight.semibold,
                          fontSize: typography.fontSize.base,
                        }}
                      >
                        Year-long Friendly & Exhibition
                      </div>
                      <div
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          fontSize: typography.fontSize.sm,
                          lineHeight: 1.5,
                        }}
                      >
                        Season-long competitive friendlies
                      </div>
                    </div>
                  </motion.div>
                  <div style={{ height: spacing.md }} />
          </div>
        </div>
              </motion.div>

              {/* Right: Academy Impact Stats */}
          <motion.div
            variants={headingVariants}
              style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                  height: "100%",
                  minHeight: "100%",
                  alignSelf: "stretch",
            }}
          >
            {[
                  {
                    value: "5",
                    label: "Players Promoted",
                    subLabel: "To Super Division",
                  description: "",
                  program: "Elite Pathway Program (EPP) + Senior Competitive Program (SCP)",
                  programDesc: "Promotions via EPP and SCP into Super Division.",
                    gradient: `linear-gradient(135deg, rgba(255, 169, 0, 0.32) 0%, rgba(255, 194, 51, 0.18) 50%, rgba(4, 61, 208, 0.12) 100%)`,
                    glowColor: colors.accent.main,
                    Icon: TrophyIcon,
                    imageOpacity: 0.5,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/20250927-DSC_0446.jpg`,
                    signature: "ember",
                  },
                  {
                    value: "8",
                    label: "Players Promoted",
                    subLabel: "To Women's B Division League",
                  description: "",
                  program: "Women’s Performance Pathway (WPP)",
                  programDesc: "Dedicated women’s pathway feeding the B Division squad.",
                    gradient: `linear-gradient(135deg, rgba(0, 224, 255, 0.28) 0%, rgba(4, 61, 208, 0.16) 55%, rgba(15, 23, 42, 0.2) 100%)`,
                    glowColor: "#00E0FF",
                    Icon: TrophyIcon,
                    imageOpacity: 0.5,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/Screenshot 2025-12-15 110643.png`,
                    signature: "sheen",
                  },
                  {
                    value: "40",
                    label: "Players Competing",
                    subLabel: "In KSFA C & D Division",
                  description: "",
                  program: "Senior Competitive Program (SCP)",
                  programDesc: "SCP develops and rotates players for KSFA C & D Divisions.",
                    gradient: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(45, 95, 232, 0.2) 100%)`,
                    glowColor: colors.primary.main,
                    Icon: MedalIcon,
                    imageOpacity: 0.5,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/Screenshot 2025-12-15 113324.png`,
                    signature: "scan",
                  },
                  {
                    value: "80",
                    label: "Youth Players",
                    subLabel: "In Youth Leagues",
                  description: "",
                  program: "Foundation & Youth Development Program (FYDP)",
                  programDesc: "FYDP develops U9–U13 talent for youth competitions.",
                    gradient: `linear-gradient(135deg, rgba(42, 153, 107, 0.26) 0%, rgba(77, 184, 138, 0.14) 55%, rgba(0, 224, 255, 0.12) 100%)`,
                    glowColor: colors.success.main,
                    Icon: FootballIcon,
                    imageOpacity: 0.6,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/Screenshot 2025-12-15 111322.png`,
                    signature: "bloom",
                  },
                ].map((stat, idx) => (
                <motion.div
                    key={idx}
                  {...getStaggeredCard(idx)}
                    whileHover={{ scale: 1.03, y: -4 }}
                  style={{
                    borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      border: `1px solid rgba(255, 255, 255, 0.15)`,
                      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset`,
                      backdropFilter: "blur(10px)",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                      flex: 1,
                    }}
                  >
                    {/* Background Image - replaces gradient overlay */}
                    {stat.backgroundImage ? (
                      <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `url("${encodeURI(stat.backgroundImage)}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: stat.imageOpacity || 0.5,
                          filter: "blur(2px)", // Add subtle blur like other sections
                          zIndex: 0,
                        }}
                      />
                    ) : null}
                    {/* Dark Overlay - ensures text visibility */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, 
                          rgba(20, 31, 58, ${stat.backgroundImage ? (stat.overlayOpacity || 0.5) : (stat.overlayOpacity || 0.95)}) 0%, 
                          rgba(15, 23, 42, ${stat.backgroundImage ? ((stat.overlayOpacity || 0.5) - 0.05) : (stat.overlayOpacity ? stat.overlayOpacity - 0.05 : 0.9)}) 100%)`,
                        zIndex: 1,
                      }}
                    />
                    {/* Background gradient overlay - only if no background image */}
                    {!stat.backgroundImage && (
                    <div
                      style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: stat.gradient,
                          opacity: 0.3,
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Accent top stroke (ties card to its program color) */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: `linear-gradient(90deg, transparent 0%, ${stat.glowColor} 45%, transparent 100%)`,
                        opacity: 0.9,
                        zIndex: 3,
                        pointerEvents: "none",
                      }}
                    />

                    {/* Signature motion layer (subtle, premium; different per program) */}
                    {stat.signature === "ember" ? (
                      <motion.div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: -40,
                          background: `radial-gradient(circle at 18% 35%, ${stat.glowColor}2b 0%, transparent 60%)`,
                          filter: "blur(18px)",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.07, 1] }}
                        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ) : stat.signature === "sheen" ? (
                      <motion.div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          top: -40,
                          bottom: -40,
                          width: "55%",
                          left: "-60%",
                          background:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 45%, transparent 100%)",
                          transform: "skewX(-14deg)",
                          filter: "blur(6px)",
                          zIndex: 2,
                          pointerEvents: "none",
                          opacity: 0.7,
                        }}
                        animate={{ x: ["0%", "220%"] }}
                        transition={{ duration: 5.6, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                      />
                    ) : stat.signature === "scan" ? (
                      <motion.div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          height: 2,
                          top: -10,
                          background: `linear-gradient(90deg, transparent 0%, ${stat.glowColor}55 40%, transparent 100%)`,
                          filter: "blur(2px)",
                          zIndex: 2,
                          pointerEvents: "none",
                          opacity: 0.8,
                        }}
                        animate={{ y: [-10, 220] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: "linear", delay: 0.4 }}
                      />
                    ) : stat.signature === "bloom" ? (
                      <motion.div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: -50,
                          background: `radial-gradient(circle at 75% 20%, ${stat.glowColor}26 0%, transparent 58%)`,
                          filter: "blur(20px)",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                        animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.06, 1] }}
                        transition={{ duration: 6.0, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      />
                    ) : null}

                    {/* Value */}
                    <motion.div
                        style={{
                        position: "relative",
                        zIndex: 3,
                        marginBottom: spacing.xs,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 + 0.3 }}
                      viewport={{ once: false }}
                    >
                      <div
                        style={{
                          ...typography.h1,
                          fontSize: `clamp(2rem, 4vw, 2.5rem)`,
                          color: stat.glowColor,
                          fontWeight: typography.fontWeight.bold,
                          textShadow: `0 4px 20px ${stat.glowColor}40`,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.1,
                          marginBottom: spacing.xs,
                        }}
                      >
                        {stat.value}
                    </div>
                  </motion.div>

                    {/* Label */}
                    <motion.div
                      style={{
                        position: "relative",
                        zIndex: 3,
                        marginBottom: spacing.xs,
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 + 0.3 }}
                      viewport={{ once: false }}
                    >
                    <div
                      style={{
                          ...typography.h5,
                        color: colors.text.primary,
                          fontWeight: typography.fontWeight.semibold,
                          marginBottom: `calc(${spacing.xs} / 2)`,
                      }}
                    >
                        {stat.label}
                    </div>
                    <div
                      style={{
                        ...typography.body,
                          color: stat.glowColor,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                      }}
                    >
                        {stat.subLabel}
                    </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      style={{
                        position: "relative",
                        zIndex: 3,
                      }}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 + 0.4 }}
                      viewport={{ once: false }}
                    >
                      <div
                        style={{
                          ...typography.body,
                          color: colors.text.muted,
                          fontSize: typography.fontSize.xs,
                          lineHeight: 1.4,
                          fontStyle: "italic",
                        }}
                      >
                        {stat.description}
                      </div>
                    </motion.div>
                    {/* Program info and CTA placeholder */}
                    {stat.program && (
                      <motion.div
                        style={{
                          position: "relative",
                          zIndex: 3,
                          marginTop: spacing.sm,
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: idx * 0.1 + 0.5 }}
                        viewport={{ once: false }}
                      >
                        <div
                          style={{
                            ...typography.body,
                            color: colors.text.secondary,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                          marginBottom: spacing.xs,
                          }}
                        >
                          {stat.program}
                        </div>
                        {stat.programDesc && (
                          <div
                            style={{
                              ...typography.body,
                              color: colors.text.muted,
                              fontSize: typography.fontSize.xs,
                              lineHeight: 1.5,
                            }}
                          >
                            {stat.programDesc}
                          </div>
                        )}
                        <div style={{ marginTop: spacing.sm, display: "flex", justifyContent: "center" }}>
                          {(() => {
                            const cta = (() => {
                              if (!stat.program) return null;
                              // Conversion-driven labels (destinations unchanged)
                              // - Parents: clarity + age band + outcomes
                              // - Competitive athletes: pathway + progression framing (no promises)
                              if (stat.program.includes("Elite Pathway Program (EPP)")) {
                                return {
                                  to: "/programs/epp",
                                  label: "See Elite Pathway Details",
                                  ariaLabel: "See Elite Pathway Program details",
                                };
                              }
                              if (stat.program.includes("WPP")) {
                                return {
                                  to: "/programs/wpp",
                                  label: "See Women’s Pathway Details",
                                  ariaLabel: "See Women’s Performance Pathway details",
                                };
                              }
                              if (stat.program.includes("Senior Competitive Program (SCP)")) {
                                return {
                                  to: "/programs/scp",
                                  label: "See Competitive Squad Pathway",
                                  ariaLabel: "See Senior Competitive Program pathway details",
                                };
                              }
                              if (
                                stat.program.includes("Foundation & Youth Development Program (FYDP)") ||
                                stat.program.includes("FYDP")
                              ) {
                                return {
                                  to: "/programs/fydp",
                                  label: "Parents: See Youth Program (U9–U13)",
                                  ariaLabel: "For parents: see Foundation and Youth Development Program details for U9 to U13",
                                };
                              }
                              return null;
                            })();

                            const accent = (stat as any).glowColor ?? colors.accent.main;
                            const accentSoft = `${accent}26`;
                            const accentMid = `${accent}55`;

                            const pillBase: React.CSSProperties = {
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: spacing.xs,
                              padding: `10px 14px`,
                              borderRadius: 999,
                              background: `linear-gradient(135deg, ${accentSoft} 0%, rgba(255, 255, 255, 0.14) 45%, rgba(15, 23, 42, 0.25) 100%)`,
                              border: `1px solid ${accentMid}`,
                              boxShadow:
                                `0 12px 28px rgba(0, 0, 0, 0.42), 0 0 0 1px ${accent}2b inset, 0 0 26px ${accent}1f`,
                              backdropFilter: "blur(12px)",
                              cursor: cta ? "pointer" : "default",
                              userSelect: "none",
                              WebkitTapHighlightColor: "transparent",
                              transition: "all 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                              minWidth: isMobile ? "100%" : "auto",
                              width: isMobile ? "100%" : "auto",
                              maxWidth: "100%",
                            };

                            const textStyle: React.CSSProperties = {
                              ...typography.body,
                              color: colors.text.primary,
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.bold,
                              letterSpacing: "0.02em",
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                            };

                            const content = (
                              <motion.div
                                style={{
                                  ...pillBase,
                                  position: "relative",
                                  overflow: "hidden",
                                  opacity: cta ? 1 : 0.65,
                                }}
                                whileHover={
                                  cta
                                    ? {
                                        y: -2,
                                        boxShadow: `0 18px 42px rgba(0, 0, 0, 0.52), 0 0 0 1px ${accent}66 inset, 0 0 42px ${accent}2f`,
                                      }
                                    : undefined
                                }
                                whileTap={cta ? { scale: 0.98 } : undefined}
                              >
                                {/* sheen sweep */}
                                <motion.div
                                  aria-hidden="true"
                                  style={{
                                    position: "absolute",
                                    top: -12,
                                    bottom: -12,
                                    width: "55%",
                                    left: "-70%",
                                    background:
                                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 45%, transparent 100%)",
                                    transform: "skewX(-16deg)",
                                    filter: "blur(6px)",
                                    opacity: 0.55,
                                  }}
                                  animate={cta ? { x: ["0%", "240%"] } : undefined}
                                  transition={
                                    cta
                                      ? { duration: 3.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.8 }
                                      : undefined
                                  }
                                />

                                <div style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                                  <ArrowRightIcon size={16} style={{ color: accent, transform: "rotate(-45deg)" }} />
                                  <span style={textStyle}>{cta ? cta.label : "Explore Program (coming soon)"}</span>
                                  <motion.div
                                    aria-hidden="true"
                                    animate={cta ? { x: [0, 3, 0] } : undefined}
                                    transition={cta ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined}
                                    style={{ display: "inline-flex" }}
                                  >
                                    <ArrowRightIcon size={14} style={{ color: colors.text.secondary }} />
                                  </motion.div>
                                </div>
                              </motion.div>
                            );

                            if (!cta) return <div aria-disabled="true">{content}</div>;

                            return (
                              <Link
                                to={cta.to}
                                aria-label={cta.ariaLabel}
                                style={{ textDecoration: "none", display: "inline-block", maxWidth: "100%" }}
                              >
                                {content}
                              </Link>
                            );
                          })()}
                        </div>
                      </motion.div>
                    )}
                </motion.div>
              ))}
          </motion.div>
            </motion.div>
          </motion.div>

          {/* Visual Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: false, amount: 0.1 }}
        style={{
              height: "1px",
              background: `linear-gradient(to right, 
                transparent 0%, 
                rgba(255, 255, 255, 0.1) 20%, 
                rgba(255, 169, 0, 0.3) 50%, 
                rgba(255, 255, 255, 0.1) 80%, 
                transparent 100%)`,
              marginBottom: spacing["3xl"],
            }}
          />

          {/* Part 2: How We Enable This - Integrated as subset */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.2 }}
            style={{
              marginBottom: spacing["2xl"],
            }}
          >
            {/* Subsection Header */}
            <motion.div
              style={{ textAlign: "center", marginBottom: spacing.xl }}
              variants={headingVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={viewportOnce}
            >
              <h3
                style={{
                  ...typography.h2,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                  fontSize: `clamp(1.75rem, 3vw, 2.25rem)`,
                }}
              >
                How We Enable This
              </h3>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  fontSize: typography.fontSize.base,
                  opacity: 0.85,
                  margin: 0,
                }}
              >
                Through RealVerse, data-driven insights, and top-tier coaching
              </p>
            </motion.div>

            {/* Two-Pillar System Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(350px, 100%), 1fr))",
                gap: spacing.xl,
                alignItems: "stretch",
              }}
            >
              {/* Left Pillar: Top-Tier Coaching */}
              <motion.div
                variants={headingVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                style={{
                  position: "relative",
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  height: "100%",
                  background: `linear-gradient(135deg, 
                    rgba(20, 31, 58, 0.6) 0%, 
                    rgba(15, 23, 42, 0.5) 100%)`,
                }}
              >
                {/* Background Image */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${galleryAssets.actionShots[3]?.large || galleryAssets.actionShots[0]?.large || academyAssets.trainingShot})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.15,
                    zIndex: 0,
                  }}
                />
                {/* Dark Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, 
                      rgba(20, 31, 58, 0.95) 0%, 
                      rgba(15, 23, 42, 0.9) 100%)`,
                    zIndex: 1,
                  }}
                />
                <div style={{ position: "relative", zIndex: 2 }}>
                  {/* Icon & Title */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                      marginBottom: spacing.md,
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "24px",
                      }}
                    >
                      ⚡
                    </div>
                    <h4
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        margin: 0,
                        fontSize: typography.fontSize.xl,
                      }}
                    >
                      Top-Tier Coaching & Modern Techniques
                    </h4>
                  </div>
                  {/* Description */}
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      marginBottom: spacing.lg,
                      lineHeight: 1.7,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    We combine elite coaches and data to produce the promotions and performances you see above. Evidence-backed pathway planning, load management, and modern training prepare every player to compete and win.
                  </p>
                  {/* Bullets */}
                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm, marginBottom: spacing.lg }}>
                    {[
                      "Merit-based player pathway",
                      "Modern training & load management",
                      "Data-backed coaching decisions",
                      "Personalized player development",
                      "Advanced training techniques",
                      "Transparent communication",
                    ].map((bullet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        viewport={{ once: false }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.sm,
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: colors.accent.main,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            ...typography.body,
                            color: colors.text.secondary,
                            fontSize: typography.fontSize.sm,
                          }}
                        >
                          {bullet}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  {/* CTA */}
                  <Link to="/brochure" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="md" style={{ width: "100%" }}>
                      Explore Coaching Pathways →
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Right Pillar: RealVerse & Data */}
              <motion.div
                variants={headingVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                style={{
                  position: "relative",
                  borderRadius: borderRadius.xl,
                  padding: spacing.xl,
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  height: "100%",
                  background: `linear-gradient(135deg, 
                    rgba(20, 31, 58, 0.6) 0%, 
                    rgba(15, 23, 42, 0.5) 100%)`,
                }}
              >
                {/* Background Image */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${academyAssets.trainingShot})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.15,
                    zIndex: 0,
                  }}
                />
                {/* Dark Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, 
                      rgba(20, 31, 58, 0.95) 0%, 
                      rgba(15, 23, 42, 0.9) 100%)`,
                    zIndex: 1,
                  }}
                />
                <div style={{ position: "relative", zIndex: 2 }}>
                  {/* Icon & Title */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                      marginBottom: spacing.md,
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.main} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "24px",
                      }}
                    >
                      💻
                    </div>
                    <h4
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        margin: 0,
                        fontSize: typography.fontSize.xl,
                      }}
                    >
                      RealVerse & Data Analytics
                    </h4>
                  </div>
                  {/* Description */}
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      marginBottom: spacing.lg,
                      lineHeight: 1.7,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    Our integrated digital ecosystem powers every team with real-time data, performance tracking, and seamless communication—giving each player clear insights and actions to improve.
                  </p>
                  {/* Bullets */}
                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm, marginBottom: spacing.lg }}>
                    {[
                      "Real-time performance dashboards and KPIs",
                      "Match & training video review with feedback",
                      "Individual goals and progression tracking",
                      "Load management alerts for player welfare",
                      "Communication hub for schedules and updates",
                      "Reports that tie effort to outcomes",
                    ].map((bullet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        viewport={{ once: false }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.sm,
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: colors.primary.main,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            ...typography.body,
                            color: colors.text.secondary,
                            fontSize: typography.fontSize.sm,
                          }}
                        >
                          {bullet}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  {/* CTA */}
                  <Link to="/realverse/experience" style={{ textDecoration: "none" }}>
                    <Button variant="primary" size="md" style={{ width: "100%" }}>
                      Experience RealVerse →
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* End integrated-program section */}
        </div>
      </InfinitySection>



      {/* Unified Content Stream: Shop + Matches + News + Gallery */}
      <InfinitySection
        id="content-stream"
        bridge={true}
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: colors.space.nebula,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Unified background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 20% 20%, rgba(0,224,255,0.12) 0%, transparent 35%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.12) 0%, transparent 35%), linear-gradient(135deg, #050b20 0%, #0a1633 50%, #050b20 100%)",
            opacity: 0.9,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${galleryAssets.actionShots[2].medium})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(12px)",
            opacity: 0.12,
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: spacing["3xl"] }}>
          {/* Stream header */}
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.25 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div
              style={{
                ...typography.overline,
                color: colors.accent.main,
                letterSpacing: "0.15em",
                marginBottom: spacing.md,
              }}
            >
              Your Complete Club Experience
            </div>
            <h2
              style={{
                ...typography.h1,
                fontSize: `clamp(2.5rem, 5vw, 3.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Connect, Support & Celebrate
            </h2>
            <p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                maxWidth: "800px",
                margin: "0 auto",
                lineHeight: 1.8,
              }}
            >
              From matchday essentials to exclusive moments—everything you need to be part of the FC Real Bengaluru family.
            </p>
          </motion.div>

          {/* Shared glass container for the stream */}
          <div
            style={{
              background: "rgba(8,12,24,0.25)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 28,
              backdropFilter: "blur(12px)",
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: `${spacing["3xl"]} ${spacing.lg}`, display: "flex", flexDirection: "column", gap: spacing["3xl"] }}>

              {/* SHOP — Support the Club */}
              <motion.div
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.sm }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.1em", marginBottom: spacing.xs }}>Shop</div>
                    <h3 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.xs, fontSize: typography.fontSize["2xl"] }}>Wear Your Pride</h3>
                    <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 1.7, maxWidth: "600px" }}>
                      Show your support with official FC Real Bengaluru merchandise. Every purchase fuels our journey and connects you to the club.
                    </p>
                  </div>
                  <Link to="/shop" style={{ textDecoration: "none", flexShrink: 0 }}>
                    <Button variant="primary" size="md">Explore Shop →</Button>
                  </Link>
                </div>

                {products.length > 0 ? (
                  <div
                    style={{
                      display: isMobile ? "grid" : "grid",
                      gridTemplateColumns: isMobile ? "repeat(auto-fit, minmax(220px, 1fr))" : "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: isMobile ? spacing.md : spacing.xl,
                      overflowX: isMobile ? "auto" : "visible",
                      paddingBottom: isMobile ? spacing.sm : 0,
                    }}
                  >
                    {products.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        {...getStaggeredCard(idx)}
                        whileHover={cardHover}
                        style={{
                          background: colors.surface.card,
                          borderRadius: borderRadius.xl,
                          overflow: "hidden",
                          border: `1px solid rgba(255, 255, 255, 0.1)`,
                          cursor: "pointer",
                          minWidth: isMobile ? 220 : undefined,
                        }}
                      >
                        <div
                          style={{
                            height: 200,
                            background: colors.surface.soft,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {product.images && product.images[0] ? (
                            <motion.img
                              src={product.images[0]}
                              alt={product.name}
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }}
                              variants={imageVariants}
                              initial="offscreen"
                              whileInView="onscreen"
                              viewport={viewportOnce}
                            />
                          ) : (
                            <div style={{ color: colors.text.muted }}>No Image</div>
                          )}
                        </div>
                        <div style={{ padding: spacing.lg }}>
                          <div
                            style={{
                              ...typography.h4,
                              color: colors.text.primary,
                              marginBottom: spacing.sm,
                            }}
                          >
                            {product.name}
                          </div>
                          <div
                            style={{
                              ...typography.h3,
                              color: colors.accent.main,
                              marginBottom: spacing.md,
                            }}
                          >
                            ₹{product.price?.toLocaleString()}
                          </div>
                          <Link to={`/shop/${product.slug}`}>
                            <motion.div
                              whileHover={secondaryButtonHover}
                              whileTap={secondaryButtonTap}
                            >
                              <Button variant="secondary" size="sm" fullWidth>
                                View Product →
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", color: colors.text.muted, padding: spacing.xl }}>
                    No products available at the moment.
                  </div>
                )}
              </motion.div>

              {/* Soft divider */}
              <div
                style={{
                  height: 1,
                  background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                  opacity: 0.4,
                }}
              />

              {/* MATCHES — Follow the Action */}
              <motion.div
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                style={{ display: "flex", flexDirection: "column", gap: spacing.lg, padding: spacing.xl, background: "rgba(255,255,255,0.02)", borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div style={{ marginBottom: spacing.md }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.1em", marginBottom: spacing.xs }}>Matches</div>
                  <h3 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.xs, fontSize: typography.fontSize["2xl"] }}>Never Miss a Moment</h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 1.7 }}>
                    Track our journey across all competitions. From upcoming fixtures to recent victories—stay connected to every match.
                  </p>
                </div>

                {/* Tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: spacing.md,
                    justifyContent: "center",
                  }}
                >
                  <Button
                    variant={activeTab === "fixtures" ? "primary" : "utility"}
                    onClick={() => setActiveTab("fixtures")}
                  >
                    Upcoming Fixtures
                  </Button>
                  <Button
                    variant={activeTab === "results" ? "primary" : "utility"}
                    onClick={() => setActiveTab("results")}
                  >
                    Recent Results
                  </Button>
                </div>

                {/* Match List */}
                <div style={{ maxWidth: "100%", margin: "0 auto", width: "100%" }}>
                  {fixturesLoading ? (
                    <div style={{ textAlign: "center", color: colors.text.muted, padding: spacing.lg }}>
                      Loading matches...
                    </div>
                  ) : (
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={viewportOnce}
                      style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
                    >
                      {(activeTab === "fixtures" ? upcomingFixtures : recentResults).map((match, idx) => {
                        const matchImage = matchAssets.recentMatchThumbs[idx % matchAssets.recentMatchThumbs.length];

                        return (
                          <motion.div
                            key={match.id}
                            {...getStaggeredListItem(idx)}
                            style={{
                              padding: spacing.lg,
                              background: colors.surface.card,
                              borderRadius: borderRadius.xl,
                              border: `1px solid rgba(255, 255, 255, 0.1)`,
                              display: "grid",
                              gridTemplateColumns: "auto 1fr auto auto",
                              gap: spacing.md,
                              alignItems: "center",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            className="match-card"
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "40%",
                                height: "100%",
                                backgroundImage: `url(${matchImage.opponent})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                opacity: 0.2,
                                filter: "blur(5px)",
                              }}
                            />
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: spacing.sm,
                                position: "relative",
                                zIndex: 1,
                              }}
                            >
                              <img
                                src={matchImage.fcrbLogo}
                                alt="FC Real Bengaluru"
                                style={{ width: 40, height: 40, objectFit: "contain" }}
                              />
                              <span style={{ color: colors.text.muted, fontSize: typography.fontSize.sm }}>vs</span>
                              <img
                                src={matchImage.opponent}
                                alt={match.opponent}
                                style={{ width: 40, height: 40, objectFit: "contain", borderRadius: borderRadius.md }}
                              />
                            </div>
                            <div style={{ position: "relative", zIndex: 1 }}>
                              <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>
                                {match.opponent}
                              </div>
                              <div style={{ ...typography.caption, color: colors.text.muted }}>
                                {match.matchType} • {match.venue}
                              </div>
                            </div>
                            <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
                              <div style={{ ...typography.body, color: colors.text.secondary, fontWeight: typography.fontWeight.semibold }}>
                                {formatDate(match.matchDate)}
                              </div>
                              <div style={{ ...typography.caption, color: colors.text.muted }}>{formatTime(match.matchTime)}</div>
                            </div>
                          </motion.div>
                        );
                      })}
                      {((activeTab === "fixtures" ? upcomingFixtures : recentResults).length === 0) && (
                        <div style={{ textAlign: "center", color: colors.text.muted, padding: spacing.xl }}>
                          No {activeTab === "fixtures" ? "upcoming fixtures" : "recent results"} available.
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Soft divider */}
              <div
                style={{
                  height: 1,
                  background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                  opacity: 0.4,
                }}
              />

              {/* NEWS — Stay Connected */}
              <motion.div
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}
              >
                <div style={{ marginBottom: spacing.sm }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.1em", marginBottom: spacing.xs }}>News</div>
                  <h3 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.xs, fontSize: typography.fontSize["2xl"] }}>Stories from the Club</h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 1.7, maxWidth: "700px" }}>
                    Get the latest updates, match reports, and behind-the-scenes stories from FC Real Bengaluru.
                  </p>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  style={{
                    display: isMobile ? "flex" : "grid",
                    gridTemplateColumns: isMobile ? undefined : "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: isMobile ? spacing.md : spacing.xl,
                    overflowX: isMobile ? "auto" : "visible",
                    paddingBottom: isMobile ? spacing.sm : 0,
                  }}
                >
                  {mockNews.slice(0, 3).map((item, idx) => {
                    const newsImage = getNewsImage(idx, "medium");
                    return (
                      <motion.div
                        key={item.id}
                        {...getStaggeredCard(idx)}
                        whileHover={cardHover}
                        style={{
                          background: colors.surface.card,
                          borderRadius: borderRadius.xl,
                          overflow: "hidden",
                          border: `1px solid rgba(255, 255, 255, 0.1)`,
                          cursor: "pointer",
                          minWidth: isMobile ? 260 : undefined,
                        }}
                      >
                        <motion.div
                          style={{
                            height: 200,
                            backgroundImage: `url(${newsImage})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            position: "relative",
                          }}
                          variants={imageVariants}
                          initial="offscreen"
                          whileInView="onscreen"
                          viewport={viewportOnce}
                        >
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: "60%",
                              background: `linear-gradient(to top, rgba(5, 11, 32, 0.9) 0%, transparent 100%)`,
                            }}
                          />
                        </motion.div>
                        <div style={{ padding: spacing.lg }}>
                          <div style={{ ...typography.overline, color: colors.accent.main, marginBottom: spacing.sm }}>{item.category}</div>
                          <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>{item.title}</div>
                          <div style={{ ...typography.body, color: colors.text.muted, marginBottom: spacing.md, fontSize: typography.fontSize.sm }}>
                            {item.summary}
                          </div>
                          <div style={{ ...typography.caption, color: colors.text.disabled }}>{formatDate(item.date)}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>

              {/* Soft divider */}
              <div
                style={{
                  height: 1,
                  background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                  opacity: 0.4,
                }}
              />

              {/* GALLERY — Relive the Moments */}
              <motion.div
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}
              >
                <div style={{ marginBottom: spacing.sm }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.1em", marginBottom: spacing.xs }}>Gallery</div>
                  <h3 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.xs, fontSize: typography.fontSize["2xl"] }}>Capture Every Victory</h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 1.7, maxWidth: "700px" }}>
                    Experience the passion, dedication, and moments that define FC Real Bengaluru—from training sessions to matchday celebrations.
                  </p>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  style={{
                    display: isMobile ? "flex" : "grid",
                    gridTemplateColumns: isMobile ? undefined : "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: isMobile ? spacing.md : spacing.md,
                    overflowX: isMobile ? "auto" : "visible",
                    paddingBottom: isMobile ? spacing.sm : 0,
                  }}
                >
                  {galleryAssets.actionShots.map((image, idx) => (
                    <motion.div
                      key={idx}
                      {...getStaggeredCard(idx)}
                      whileHover={{ scale: 1.03, y: -2 }}
                      style={{
                        borderRadius: borderRadius.xl,
                        overflow: "hidden",
                        border: `1px solid rgba(255, 255, 255, 0.1)`,
                        cursor: "pointer",
                        aspectRatio: "4/3",
                        position: "relative",
                        minWidth: isMobile ? 240 : undefined,
                        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
                      }}
                    >
                      <motion.img
                        src={image.medium}
                        alt={`Gallery image ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        variants={imageVariants}
                        initial="offscreen"
                        whileInView="onscreen"
                        viewport={viewportOnce}
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Soft divider */}
              <div
                style={{
                  height: 1,
                  background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                  opacity: 0.4,
                }}
              />

              {/* FAN CLUB — Join the Family */}
              <motion.div
                data-section="fan-club"
                initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}
              >
                <div style={{ marginBottom: spacing.sm }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.1em", marginBottom: spacing.xs }}>Fan Club</div>
                  <h3 style={{ ...typography.h2, color: colors.text.primary, margin: 0, marginBottom: spacing.xs, fontSize: typography.fontSize["2xl"] }}>Become Part of the Legacy</h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.base, lineHeight: 1.7, maxWidth: "700px" }}>
                    Join our exclusive fan community and unlock premium benefits, exclusive access, and unforgettable experiences.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    background: "rgba(255, 169, 0, 0.08)",
                    border: `1px solid rgba(255, 169, 0, 0.2)`,
                    borderRadius: borderRadius.xl,
                    padding: spacing.xl,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle glow effect */}
                  <div
                    style={{
                      position: "absolute",
                      top: -20,
                      left: -20,
                      width: 60,
                      height: 60,
                      background: `radial-gradient(circle, rgba(255, 169, 0, 0.3) 0%, transparent 70%)`,
                      borderRadius: "50%",
                      filter: "blur(8px)",
                    }}
                  />

                  <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md, marginBottom: spacing.lg }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.accent.main} 0%, rgba(255, 194, 51, 0.8) 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 4px 16px rgba(255, 169, 0, 0.3)`,
                      }}
                    >
                      <StarIcon size={24} color={colors.text.onPrimary} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          ...typography.h4,
                          color: colors.text.primary,
                          marginBottom: spacing.xs,
                          fontWeight: typography.fontWeight.bold,
                        }}
                      >
                        Member-Exclusive Perks
                      </h4>
                      <p
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          fontSize: typography.fontSize.sm,
                          lineHeight: 1.6,
                        }}
                      >
                        Enjoy VIP access, exclusive discounts, early ticket releases, and special events reserved for our fan club members.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                    {[
                      "VIP match access with premium seating",
                      "Exclusive merchandise discounts & special offers",
                      "Priority access to tickets & events",
                      "Meet & greet sessions with players & coaches",
                      "Special member-only passes & experiences",
                    ].map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 + 0.2 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.sm,
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${colors.accent.main} 0%, rgba(255, 194, 51, 0.8) 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CheckIcon size={12} color={colors.text.onPrimary} />
                        </div>
                        <span
                          style={{
                            ...typography.body,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.sm,
                            lineHeight: 1.6,
                          }}
                        >
                          {benefit}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    style={{ marginTop: spacing.lg }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                        border: "none",
                        boxShadow: `0 4px 20px rgba(0, 224, 255, 0.3)`,
                      }}
                    >
                      Join the Fan Club <ArrowRightIcon size={18} style={{ marginLeft: spacing.xs }} />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </InfinitySection>

      </main>

      {/* 13. FOOTER as part of infinity flow */}
      <InfinitySection
        id="footer"
        bridge={false}
        style={{
          padding: 0,
          paddingTop: "100px",
          paddingBottom: 0,
          marginBottom: 0,
          marginTop: 0,
          background: "transparent",
          position: "relative",
          overflow: "hidden",
          minHeight: "auto",
        }}
      >
        <motion.footer
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", marginTop: "auto", marginBottom: 0, paddingBottom: 0 }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(4,8,18,0.95) 0%, rgba(4,8,18,0.98) 100%)",
                zIndex: 1,
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  maxWidth: "1400px",
                  margin: "0 auto",
                  paddingTop: isMobile ? 40 : 48,
                  paddingBottom: 0,
                  paddingLeft: isMobile ? 16 : 32,
                  paddingRight: isMobile ? 16 : 32,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                    opacity: 0.6,
                    marginBottom: isMobile ? 20 : 24,
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr 1.2fr",
                    gap: isMobile ? 20 : 24,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Logo + Social */}
                  <div>
                    <img
                      src={clubAssets.logo.crestCropped}
                      alt="FC Real Bengaluru"
                      style={{ width: isMobile ? 90 : 100, height: "auto", marginBottom: isMobile ? spacing.sm : spacing.md }}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: spacing.sm, flexWrap: "wrap" }}>
                      {[
                        { name: "Facebook", url: clubInfo.social.facebook, Icon: FacebookIcon },
                        { name: "Instagram", url: clubInfo.social.instagram, Icon: InstagramIcon },
                        { name: "TikTok", url: clubInfo.social.tiktok || "#", Icon: TikTokIcon },
                        { name: "Twitter", url: clubInfo.social.twitter || "#", Icon: TwitterIcon },
                        { name: "YouTube", url: clubInfo.social.youtube, Icon: YouTubeIcon },
                      ].map((social) => {
                        const Icon = social.Icon;
                        return (
                          <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "rgba(255,255,255,0.08)",
                              color: colors.text.primary,
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `${colors.primary.soft}`;
                              e.currentTarget.style.color = colors.primary.main;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                              e.currentTarget.style.color = colors.text.primary;
                            }}
                            title={social.name}
                          >
                            <Icon size={18} />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* About Clubs */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      About Clubs
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                      {[
                        { label: "Homepage", to: "#" },
                        { label: "About Us", to: "#philosophy" },
                        { label: "Latest News", to: "#content-stream" },
                      ].map((link) => (
                        <a
                          key={link.label}
                          href={link.to}
                          style={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Teams Info */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      Teams Info
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                      {[
                        { label: "Player & Coach", to: "/student" },
                        { label: "Player Profile", to: "/players" },
                        { label: "Fixtures", to: "#matches" },
                        { label: "Tournament", to: "/tournaments" },
                      ].map((link) => (
                        <a
                          key={link.label}
                          href={link.to}
                          style={{
                            color: colors.text.secondary,
                            textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Contact Us */}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                      }}
                    >
                      Contact Us
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 10 }}>
                      <a
                        href={`tel:${clubInfo.contact.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <PhoneIcon size={16} />
                        <span>{clubInfo.contact.phone}</span>
                      </a>
                      <a
                        href={`mailto:${clubInfo.contact.email}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <EmailIcon size={16} />
                        <span>{clubInfo.contact.email}</span>
                      </a>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          color: colors.text.secondary,
                          fontSize: 13,
                          lineHeight: 1.6,
                          opacity: 0.9,
                        }}
                      >
                        <LocationIcon size={16} style={{ marginTop: 2 }} />
                        <span>{clubInfo.contact.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Training Centres Subsection */}
                {centres.length > 0 && (
                  <>
                    <div
                      style={{
                        marginTop: isMobile ? 32 : 40,
                        marginBottom: isMobile ? 20 : 24,
                        paddingTop: isMobile ? 20 : 24,
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: colors.text.primary,
                          opacity: 0.9,
                          marginBottom: isMobile ? 16 : 20,
                          textAlign: "center",
                        }}
                      >
                        Our Training Centres
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
                          gap: isMobile ? spacing.md : spacing.lg,
                          maxWidth: "1200px",
                          margin: "0 auto",
                        }}
                      >
                        {centres.map((centre, idx) => (
                          <motion.div
                            key={centre.id}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: borderRadius.lg,
                              padding: spacing.md,
                              border: "1px solid rgba(255,255,255,0.1)",
                              display: "flex",
                              flexDirection: "column",
                              gap: spacing.sm,
                            }}
                          >
                            {/* Centre Number Badge & Name */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: spacing.sm,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(4, 61, 208, 0.2) 100%)`,
                                  border: `2px solid ${colors.primary.main}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: typography.fontWeight.bold,
                                  color: colors.text.onPrimary,
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <h4
                                style={{
                                  ...typography.body,
                                  color: colors.text.primary,
                                  fontSize: typography.fontSize.sm,
                                  fontWeight: typography.fontWeight.semibold,
                                  margin: 0,
                                  flex: 1,
                                }}
                              >
                                {centre.name}
                              </h4>
                            </div>

                            {/* Location */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: spacing.xs,
                                paddingLeft: spacing.md + spacing.xs,
                              }}
                            >
                              <LocationIcon
                                style={{
                                  width: 14,
                                  height: 14,
                                  flexShrink: 0,
                                  marginTop: "2px",
                                  color: colors.text.secondary,
                                }}
                              />
                              <div
                                style={{
                                  ...typography.body,
                                  color: colors.text.secondary,
                                  fontSize: typography.fontSize.xs,
                                  lineHeight: 1.5,
                                }}
                              >
                                {centre.locality}, {centre.city}
                              </div>
                            </div>

                            {/* Address */}
                            {centre.addressLine && (
                              <div
                                style={{
                                  ...typography.caption,
                                  color: colors.text.muted,
                                  fontSize: typography.fontSize.xs,
                                  paddingLeft: spacing.md + spacing.xs,
                                  lineHeight: 1.5,
                                }}
                              >
                                {centre.addressLine}
                              </div>
                            )}

                            {/* CTA Button */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              style={{ marginTop: spacing.xs }}
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                fullWidth
                                onClick={() => handleOpenInMaps(centre)}
                                style={{
                                  fontSize: typography.fontSize.xs,
                                  padding: `${spacing.xs} ${spacing.sm}`,
                                }}
                              >
                                View on Google Maps →
                              </Button>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div
                  style={{
                    marginTop: isMobile ? 20 : 24,
                    paddingTop: isMobile ? 16 : 18,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    justifyContent: "center",
                    color: colors.text.muted,
                    fontSize: 12,
                    opacity: 0.85,
                    textAlign: "center",
                  }}
                >
                  © {new Date().getFullYear()} FC Real Bengaluru. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </InfinitySection>
    </div>
  );
};

export default LandingPage;
export { LandingPage };

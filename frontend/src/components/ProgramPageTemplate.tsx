import React, { useMemo, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PublicHeader from "./PublicHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { Button } from "./ui/Button";
import { CheckIcon, ArrowRightIcon, TrophyIcon, ChartBarIcon, StarIcon, FireIcon, DumbbellIcon } from "./icons/IconSet";
import { galleryAssets, heroAssets, realverseAssets } from "../config/assets";

interface ProgramPageTemplateProps {
  program: {
    name: string;
    acronym: string;
    positioning: string;
    who: string;
    training: {
      intensity: string;
      matchExposure: string;
      philosophy: string;
    };
    data: {
      description: string;
      aiFeatures: string[];
    };
    progression: {
      description: string;
      points: string[];
    };
    realverse: {
      features: string[];
    };
    backgroundImage?: string;
    accentColor?: string;
  };
}

const ProgramPageTemplate: React.FC<ProgramPageTemplateProps> = ({ program }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const accentColor = program.accentColor || colors.accent.main;

  const whoSlices = useMemo(() => {
    const sentences = program.who
      .split(/\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.endsWith(".") ? s : `${s}.`));

    const headline = sentences[0] || program.positioning;
    const supporting = sentences.slice(1).join(" ");
    const cards = sentences.slice(0, 3);

    return { headline, supporting, cards };
  }, [program.positioning, program.who]);

  return (
    <div style={{ minHeight: "100vh", background: "transparent", position: "relative" }}>
      <PublicHeader />
      
      {/* Program Hero - Rich & Cinematic */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          position: "relative",
          overflow: "hidden",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background Image with Parallax */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: program.backgroundImage 
              ? `url(${program.backgroundImage})`
              : `url(${galleryAssets.actionShots[0]?.medium || heroAssets.teamBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            y: backgroundY,
            zIndex: 0,
          }}
        />
        
        {/* Heavy Gradient Overlay with Program Accent */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.85) 0%, 
              rgba(10, 22, 51, 0.75) 50%, 
              rgba(5, 11, 32, 0.85) 100%),
              radial-gradient(circle at 30% 30%, ${accentColor}15 0%, transparent 50%)`,
            zIndex: 1,
          }}
        />

        {/* Subtle Grain */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 3, width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "left", maxWidth: "900px" }}
          >
            {/* Acronym Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                display: "inline-block",
                padding: `${spacing.xs} ${spacing.md}`,
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}40`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
                backdropFilter: "blur(10px)",
              }}
            >
              <span style={{ ...typography.overline, color: accentColor, letterSpacing: "0.15em" }}>
                {program.acronym}
              </span>
            </motion.div>

            {/* Large Typographic Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                ...typography.h1,
                fontSize: `clamp(3rem, 8vw, 6rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                lineHeight: 1.05,
                fontWeight: typography.fontWeight.bold,
                textShadow: "0 4px 40px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 224, 255, 0.2)",
                letterSpacing: "-0.02em",
              }}
            >
              {program.name}
            </motion.h1>

            {/* Positioning Line */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{
                ...typography.body,
                fontSize: typography.fontSize.xl,
                color: colors.text.secondary,
                lineHeight: 1.8,
                maxWidth: "700px",
                textShadow: "0 2px 20px rgba(0, 0, 0, 0.7)",
              }}
            >
              {program.positioning}
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Who This Program Is For - Card Cluster */}
      <section style={{
        padding: `${spacing["4xl"]} ${spacing.xl}`,
        background: "transparent",
        position: "relative",
      }}>
        {/* Background Texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 20%, rgba(0,224,255,0.04) 0%, transparent 50%)`,
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.xl,
                fontSize: typography.fontSize["3xl"],
              }}
            >
              Who This Program Is For
            </motion.h2>

            {/* Mixed narrative + highlight cards (less monotonous than pure pointers) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
                gap: spacing.xl,
                alignItems: "start",
              }}
            >
              {/* Narrative panel */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  position: "relative",
                  background: `rgba(10, 16, 32, 0.65)`,
                  borderRadius: borderRadius["2xl"],
                  border: `1px solid rgba(255,255,255,0.12)`,
                  padding: isMobile ? spacing.lg : spacing.xl,
                  overflow: "hidden",
                  boxShadow: `0 18px 54px rgba(0,0,0,0.35)`,
                  backdropFilter: "blur(18px)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      `radial-gradient(circle at 25% 20%, ${accentColor}18 0%, transparent 55%),` +
                      `radial-gradient(circle at 85% 80%, rgba(0,224,255,0.10) 0%, transparent 55%)`,
                    pointerEvents: "none",
                    opacity: 0.9,
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.md }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: borderRadius.lg,
                        background: `${accentColor}22`,
                        border: `2px solid ${accentColor}45`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 0 22px ${accentColor}30`,
                      }}
                    >
                      <StarIcon size={22} color={accentColor} />
                    </div>
                    <div>
                      <div style={{ ...typography.overline, color: accentColor, letterSpacing: "0.18em" }}>
                        FIT PROFILE
                      </div>
                      <div style={{ ...typography.h4, color: colors.text.primary, marginTop: 4 }}>
                        {whoSlices.headline}
                      </div>
                    </div>
                  </div>

                  {!!whoSlices.supporting && (
                    <p
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.base,
                        lineHeight: 1.85,
                        margin: 0,
                        maxWidth: "900px",
                        opacity: 0.95,
                      }}
                    >
                      {whoSlices.supporting}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile ? "column" : "row",
                      gap: spacing.md,
                      marginTop: spacing.lg,
                    }}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        window.location.href = "/brochure";
                      }}
                      style={{ width: isMobile ? "100%" : "auto" }}
                    >
                      Apply / Enquire <ArrowRightIcon size={18} style={{ marginLeft: spacing.xs }} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => {
                        window.location.href = "/realverse/experience";
                      }}
                      style={{ width: isMobile ? "100%" : "auto" }}
                    >
                      See RealVerse Experience <ArrowRightIcon size={18} style={{ marginLeft: spacing.xs }} />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Highlight cards */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: spacing.md,
                }}
              >
                {whoSlices.cards.map((point, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    style={{
                      background: `rgba(10, 16, 32, 0.62)`,
                      backdropFilter: "blur(20px)",
                      borderRadius: borderRadius.xl,
                      border: `1px solid rgba(255,255,255,0.12)`,
                      padding: spacing.lg,
                      boxShadow: `0 12px 40px rgba(0, 0, 0, 0.28)`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          idx % 2 === 0
                            ? `radial-gradient(circle at 15% 25%, ${accentColor}16 0%, transparent 60%)`
                            : `radial-gradient(circle at 85% 25%, rgba(0,224,255,0.10) 0%, transparent 60%)`,
                        pointerEvents: "none",
                        opacity: 0.9,
                      }}
                    />
                    <div style={{ position: "relative", zIndex: 1, display: "flex", gap: spacing.md }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: `${accentColor}18`,
                          border: `1px solid ${accentColor}35`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <TrophyIcon size={18} color={accentColor} />
                      </div>
                      <p
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          fontSize: typography.fontSize.base,
                          lineHeight: 1.7,
                          margin: 0,
                        }}
                      >
                        {point}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MERGED SECTION 1: Training, Match Environment & Progression - Split Layout */}
      <section style={{
        padding: `${spacing["4xl"]} ${spacing.xl}`,
        background: `linear-gradient(135deg, rgba(0,224,255,0.08) 0%, rgba(255,169,0,0.06) 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Multiple Background Images - Layered */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
            filter: "blur(15px)",
            zIndex: 0,
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${galleryAssets.actionShots[2]?.medium || galleryAssets.actionShots[1]?.medium || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
            filter: "blur(20px)",
            zIndex: 0,
          }}
        />

        {/* Radial Gradient Overlays */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 30%, rgba(0,224,255,0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 70%, rgba(255,169,0,0.08) 0%, transparent 50%)`,
            zIndex: 1,
          }}
        />

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {/* Unified Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: spacing["3xl"] }}
          >
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontSize: typography.fontSize["3xl"],
              }}
            >
              Training, Match Environment & Progression
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.base,
                lineHeight: 1.8,
                maxWidth: "900px",
              }}
            >
              Comprehensive development through structured training, competitive exposure, and clear progression pathways.
            </motion.p>
          </motion.div>

          {/* Split Layout: Left Side - Training & Match */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: spacing.xl,
            marginBottom: spacing.xl,
          }}>
            {/* Training & Match Cards */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <motion.h3
                style={{
                  ...typography.h3,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                  fontSize: typography.fontSize["2xl"],
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <DumbbellIcon size={24} color={accentColor} />
                Training & Match Environment
              </motion.h3>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {[
                  { icon: DumbbellIcon, title: "Training Intensity", content: program.training.intensity },
                  { icon: TrophyIcon, title: "Match Exposure", content: program.training.matchExposure },
                  { icon: FireIcon, title: "Competitive Philosophy", content: program.training.philosophy },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      style={{
                        background: `rgba(10, 16, 32, 0.75)`,
                        backdropFilter: "blur(20px)",
                        borderRadius: borderRadius.xl,
                        border: `1px solid rgba(255,255,255,0.12)`,
                        padding: spacing.lg,
                        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${accentColor}60`;
                        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 25px ${accentColor}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3)`;
                      }}
                    >
                      {/* Background Image Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          width: "40%",
                          height: "100%",
                          backgroundImage: `url(${galleryAssets.actionShots[idx]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.15,
                          filter: "blur(8px)",
                          zIndex: 0,
                        }}
                      />
                      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", gap: spacing.md }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: borderRadius.lg,
                          background: `${accentColor}25`,
                          border: `2px solid ${accentColor}50`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 0 20px ${accentColor}30`,
                        }}>
                          <Icon size={24} color={accentColor} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{
                            ...typography.h4,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            fontSize: typography.fontSize.base,
                          }}>
                            {item.title}
                          </h4>
                          <p style={{
                            ...typography.body,
                            color: colors.text.secondary,
                            fontSize: typography.fontSize.sm,
                            lineHeight: 1.7,
                            margin: 0,
                          }}>
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Progression Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <motion.h3
                style={{
                  ...typography.h3,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                  fontSize: typography.fontSize["2xl"],
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <ArrowRightIcon size={24} color={accentColor} />
                Progression & Internal Movement
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.7,
                  marginBottom: spacing.md,
                }}
              >
                {program.progression.description}
              </motion.p>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {program.progression.points.map((point, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      padding: spacing.lg,
                      background: `rgba(10, 16, 32, 0.75)`,
                      backdropFilter: "blur(20px)",
                      borderRadius: borderRadius.xl,
                      border: `1px solid rgba(255,255,255,0.12)`,
                      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${accentColor}60`;
                      e.currentTarget.style.boxShadow = `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 25px ${accentColor}25`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                      e.currentTarget.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3)`;
                    }}
                  >
                    {/* Background Image Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "35%",
                        height: "100%",
                        backgroundImage: `url(${galleryAssets.actionShots[(idx + 2) % galleryAssets.actionShots.length]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.15,
                        filter: "blur(8px)",
                        zIndex: 0,
                      }}
                    />
                    <motion.div
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: idx * 0.3 }}
                      style={{ flexShrink: 0, position: "relative", zIndex: 1 }}
                    >
                      <ArrowRightIcon size={20} color={accentColor} />
                    </motion.div>
                    <span style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      lineHeight: 1.7,
                      flex: 1,
                      position: "relative",
                      zIndex: 1,
                    }}>
                      {point}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MERGED SECTION 2: Data, Analytics, AI & RealVerse Experience - Unified Dashboard */}
      <section style={{
        padding: `${spacing["4xl"]} ${spacing.xl}`,
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Dark Analytics Panel Background with Multiple Layers */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.95) 0%, 
              rgba(10, 22, 51, 0.92) 50%,
              rgba(5, 11, 32, 0.95) 100%)`,
            zIndex: 0,
          }}
        />

        {/* Background Images - Multiple Layers */}
        <motion.div
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "50%",
            height: "100%",
            backgroundImage: `url(${galleryAssets.actionShots[0]?.medium || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.1,
            filter: "blur(20px)",
            zIndex: 1,
          }}
        />
        <motion.div
          animate={{ opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
            filter: "blur(25px)",
            zIndex: 1,
          }}
        />

        {/* Grid Pattern Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0, 224, 255, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 224, 255, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Radial Gradient Accents */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 40%, rgba(0,224,255,0.08) 0%, transparent 60%),
                         radial-gradient(circle at 70% 60%, rgba(255,169,0,0.06) 0%, transparent 60%)`,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 3 }}>
          {/* Unified Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: spacing["3xl"] }}
          >
            {/* RealVerse Core Branding */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <div style={{
                width: 5,
                height: 50,
                background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}80)`,
                borderRadius: borderRadius.full,
                boxShadow: `0 0 25px ${accentColor}70`,
              }} />
              <div>
                <h2 style={{
                  ...typography.h2,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                  fontSize: typography.fontSize["3xl"],
                }}>
                  Data, Analytics & AI
                </h2>
                <span style={{
                  ...typography.overline,
                  color: accentColor,
                  letterSpacing: "0.15em",
                  fontSize: typography.fontSize.sm,
                }}>
                  RealVerse Core & Experience
                </span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                lineHeight: 1.8,
                marginBottom: spacing.xl,
                maxWidth: "900px",
              }}
            >
              {program.data.description}
            </motion.p>
          </motion.div>

          {/* Split Layout: AI Features Left, RealVerse Features Right */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: spacing.xl,
          }}>
            {/* Left: AI & Analytics Features */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <motion.h3
                style={{
                  ...typography.h3,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                  fontSize: typography.fontSize.xl,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <ChartBarIcon size={22} color={accentColor} />
                AI-Powered Analytics
              </motion.h3>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {program.data.aiFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    style={{
                      background: `rgba(10, 16, 32, 0.7)`,
                      backdropFilter: "blur(15px)",
                      borderRadius: borderRadius.lg,
                      border: `1px solid rgba(0, 224, 255, 0.25)`,
                      padding: spacing.lg,
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${accentColor}70`;
                      e.currentTarget.style.boxShadow = `0 10px 36px rgba(0, 0, 0, 0.5), 0 0 25px ${accentColor}35`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0, 224, 255, 0.25)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Background Image Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "45%",
                        height: "100%",
                        backgroundImage: `url(${galleryAssets.actionShots[idx % galleryAssets.actionShots.length]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.12,
                        filter: "blur(10px)",
                        zIndex: 0,
                      }}
                    />
                    {/* Metric Line Indicator */}
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: 4,
                      height: "100%",
                      background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}80)`,
                      borderRadius: `${borderRadius.lg} 0 0 ${borderRadius.lg}`,
                      zIndex: 1,
                    }} />
                    
                    <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md, paddingLeft: spacing.md, position: "relative", zIndex: 2 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: borderRadius.md,
                        background: `${accentColor}25`,
                        border: `1px solid ${accentColor}50`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 0 15px ${accentColor}40`,
                      }}>
                        <CheckIcon size={18} color={accentColor} />
                      </div>
                      <span style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                        lineHeight: 1.7,
                        flex: 1,
                      }}>
                        {feature}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: RealVerse Experience Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <motion.h3
                style={{
                  ...typography.h3,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                  fontSize: typography.fontSize.xl,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <StarIcon size={22} color={accentColor} />
                RealVerse Experience
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.7,
                  marginBottom: spacing.lg,
                }}
              >
                Features available to players & parents:
              </motion.p>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {program.realverse.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                      padding: spacing.lg,
                      background: `rgba(10, 16, 32, 0.7)`,
                      backdropFilter: "blur(15px)",
                      borderRadius: borderRadius.lg,
                      border: `1px solid rgba(255,255,255,0.12)`,
                      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${accentColor}60`;
                      e.currentTarget.style.boxShadow = `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 25px ${accentColor}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                      e.currentTarget.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3)`;
                    }}
                  >
                    {/* Background Image Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "40%",
                        height: "100%",
                        backgroundImage: `url(${galleryAssets.actionShots[(idx + 1) % galleryAssets.actionShots.length]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.12,
                        filter: "blur(10px)",
                        zIndex: 0,
                      }}
                    />
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.lg,
                      background: `${accentColor}25`,
                      border: `2px solid ${accentColor}50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: `0 0 18px ${accentColor}35`,
                      position: "relative",
                      zIndex: 1,
                    }}>
                      <StarIcon size={24} color={accentColor} />
                    </div>
                    <span style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      lineHeight: 1.7,
                      flex: 1,
                      position: "relative",
                      zIndex: 1,
                    }}>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section style={{
        padding: `${spacing["4xl"]} ${spacing.xl}`,
        background: `linear-gradient(135deg, rgba(0,224,255,0.1) 0%, rgba(255,169,0,0.08) 100%)`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${galleryAssets.actionShots[0]?.medium || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.1,
            filter: "blur(12px)",
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                fontSize: typography.fontSize["3xl"],
              }}
            >
              Ready to Begin?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                marginBottom: spacing.xl,
                maxWidth: "600px",
                margin: `0 auto ${spacing.xl} auto`,
              }}
            >
              Apply or enquire about {program.name} today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  window.location.href = "/brochure";
                }}
              >
                Apply / Enquire <ArrowRightIcon size={18} style={{ marginLeft: spacing.xs }} />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProgramPageTemplate;

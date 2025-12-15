import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { ArrowRightIcon, TrophyIcon, ChartBarIcon, StarIcon, FireIcon } from "../components/icons/IconSet";
import { galleryAssets, heroAssets } from "../config/assets";

const ProgramsOverviewPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const programs = [
    {
      id: "epp",
      name: "Elite Pathway Program",
      acronym: "EPP",
      positioning: "For players targeting top-tier football in India and abroad.",
      highlights: [
        "Super Division focused",
        "Highest intensity",
        "Individual plans",
      ],
      accent: colors.accent.main,
      image: galleryAssets.actionShots[0]?.medium,
      size: "large",
    },
    {
      id: "scp",
      name: "Senior Competitive Program",
      acronym: "SCP",
      positioning: "The competitive bridge between youth and elite football.",
      highlights: [
        "C & D Division",
        "Regular matches",
        "EPP feeder",
      ],
      accent: colors.primary.main,
      image: galleryAssets.actionShots[1]?.medium,
      size: "medium",
    },
    {
      id: "wpp",
      name: "Women's Performance Pathway",
      acronym: "WPP",
      positioning: "A unified pathway for women footballers aiming professional levels.",
      highlights: [
        "Women's B Division",
        "Year-round matches",
        "Career pathway",
      ],
      accent: colors.accent.main,
      image: galleryAssets.actionShots[2]?.medium,
      size: "medium",
    },
    {
      id: "fydp",
      name: "Foundation & Youth Development Program",
      acronym: "FYDP",
      positioning: "Building intelligent footballers before building competitors.",
      highlights: [
        "U9, U11, U13",
        "Tactical foundations",
        "Data-assisted",
      ],
      accent: colors.primary.main,
      image: galleryAssets.actionShots[3]?.medium,
      size: "small",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "transparent", position: "relative" }}>
      <PublicHeader />
      
      {/* Hero Section - Cinematic */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          position: "relative",
          overflow: "hidden",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Background Image with Parallax */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${heroAssets.teamBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            y: backgroundY,
            zIndex: 0,
          }}
        />
        
        {/* Heavy Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.85) 0%, 
              rgba(10, 22, 51, 0.75) 50%, 
              rgba(5, 11, 32, 0.85) 100%)`,
            zIndex: 1,
          }}
        />

        {/* Subtle Grain/Noise Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Floating Micro-elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              position: "absolute",
              width: 4 + Math.random() * 4,
              height: 4 + Math.random() * 4,
              background: colors.accent.main,
              borderRadius: "50%",
              zIndex: 2,
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              filter: "blur(1px)",
            }}
          />
        ))}

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 3, width: "100%" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "left", maxWidth: "900px" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                display: "inline-block",
                padding: `${spacing.xs} ${spacing.md}`,
                background: "rgba(0, 224, 255, 0.1)",
                border: `1px solid ${colors.accent.main}40`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
                backdropFilter: "blur(10px)",
              }}
            >
              <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em" }}>
                OUR PROGRAMS
              </span>
            </motion.div>

            {/* Split Title */}
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
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Four Programs.
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{ color: colors.accent.main }}
              >
                One Unified
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Football Philosophy.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              style={{
                ...typography.body,
                fontSize: typography.fontSize.xl,
                color: colors.text.secondary,
                lineHeight: 1.8,
                maxWidth: "700px",
                textShadow: "0 2px 20px rgba(0, 0, 0, 0.7)",
              }}
            >
              From grassroots to Super Division, every pathway at FC Real Bengaluru
              is built on merit, data, and a shared playing identity.
            </motion.p>

            {/* Unified Philosophy (merged into hero) */}
            <motion.div
              initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: spacing["2xl"], maxWidth: "1200px" }}
            >
              <div
                style={{
                  background: `rgba(10, 16, 32, 0.62)`,
                  backdropFilter: "blur(22px)",
                  borderRadius: borderRadius["2xl"],
                  border: `1px solid rgba(255,255,255,0.10)`,
                  padding: isMobile ? spacing.xl : spacing["2xl"],
                  boxShadow: `0 26px 78px rgba(0, 0, 0, 0.48)`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* subtle cinematic glow */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 20% 15%, rgba(0,224,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,169,0,0.10) 0%, transparent 55%)",
                    opacity: 0.9,
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    style={{
                      ...typography.h2,
                      color: colors.text.primary,
                      marginBottom: spacing.lg,
                      textAlign: "center",
                      fontSize: typography.fontSize["3xl"],
                    }}
                  >
                    One System.{" "}
                    <span style={{ color: colors.accent.main }}>Unified Philosophy.</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      marginBottom: spacing.xl,
                      textAlign: "center",
                      maxWidth: "900px",
                      margin: `0 auto ${spacing.xl} auto`,
                      lineHeight: 1.8,
                      fontSize: typography.fontSize.lg,
                      opacity: 0.92,
                    }}
                  >
                    All programs share the same tactical identity, coaching methodology, RealVerse analytics, and
                    match exposure. Movement between programs is merit-based and data-backed.
                  </motion.p>

                  {/* Pillars */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                      gap: spacing.lg,
                    }}
                  >
                    {[
                      { icon: TrophyIcon, label: "Tactical Identity", desc: "Shared playing style" },
                      { icon: ChartBarIcon, label: "Coaching Methodology", desc: "Unified approach" },
                      { icon: StarIcon, label: "RealVerse Analytics", desc: "Data-driven insights" },
                      { icon: FireIcon, label: "Match Exposure", desc: "Competitive pathways" },
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = activePillar === item.label;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: 0.22 + idx * 0.06 }}
                          whileHover={{ y: -4, scale: 1.03 }}
                          style={{
                            textAlign: "center",
                            padding: spacing.lg,
                            background: `rgba(255, 255, 255, 0.03)`,
                            borderRadius: borderRadius.xl,
                            border: `1px solid ${isActive ? "rgba(0,224,255,0.28)" : "rgba(255,255,255,0.08)"}`,
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            boxShadow: isActive
                              ? "0 14px 46px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,224,255,0.12) inset"
                              : "none",
                            position: "relative",
                            overflow: "hidden",
                          }}
                          onMouseEnter={() => setActivePillar(item.label)}
                          onMouseLeave={() => setActivePillar(null)}
                          onFocus={() => setActivePillar(item.label)}
                          onBlur={() => setActivePillar(null)}
                          role="button"
                          tabIndex={0}
                          aria-label={`${item.label}. ${item.desc}. Explore how this applies across the four programs below.`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActivePillar((prev) => (prev === item.label ? null : item.label));
                            }
                          }}
                        >
                          <div
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "radial-gradient(circle at 30% 20%, rgba(0,224,255,0.10) 0%, transparent 55%), radial-gradient(circle at 80% 75%, rgba(255,169,0,0.08) 0%, transparent 55%)",
                              opacity: isActive ? 1 : 0.35,
                              transition: "opacity 220ms ease",
                              pointerEvents: "none",
                            }}
                          />
                          <motion.div
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
                            style={{ marginBottom: spacing.md, position: "relative", zIndex: 1 }}
                          >
                            <Icon size={32} color={colors.accent.main} />
                          </motion.div>
                          <div
                            style={{
                              ...typography.h5,
                              color: colors.text.primary,
                              marginBottom: spacing.xs,
                              fontSize: typography.fontSize.base,
                              fontWeight: typography.fontWeight.semibold,
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.text.muted,
                              fontSize: typography.fontSize.xs,
                              position: "relative",
                              zIndex: 1,
                            }}
                          >
                            {item.desc}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Divider + quick program links */}
                  <div
                    style={{
                      height: 1,
                      marginTop: spacing["2xl"],
                      marginBottom: spacing.lg,
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 20%, rgba(0,224,255,0.18) 50%, rgba(255,255,255,0.14) 80%, transparent 100%)",
                      opacity: 0.9,
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(5, minmax(0, 1fr))",
                      gap: spacing.md,
                      alignItems: "stretch",
                    }}
                  >
                    {/* Primary scroll CTA */}
                    <motion.button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById("programs-grid");
                        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
                      }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        gridColumn: isMobile ? "auto" : "span 2",
                        width: "100%",
                        padding: `${spacing.md} ${spacing.lg}`,
                        borderRadius: borderRadius.xl,
                        background: `linear-gradient(135deg, rgba(0,224,255,0.16) 0%, rgba(255,169,0,0.10) 100%)`,
                        border: `1px solid rgba(0,224,255,0.25)`,
                        boxShadow: `0 18px 50px rgba(0,0,0,0.35)`,
                        backdropFilter: "blur(14px)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: spacing.md,
                        textAlign: "left",
                      }}
                      aria-label="Browse all four programs"
                    >
                      <div>
                        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.bold }}>
                          Browse all 4 programs
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.9 }}>
                          Find your stage • pick your pathway
                        </div>
                      </div>
                      <ArrowRightIcon size={18} color={colors.accent.main} />
                    </motion.button>

                    {/* Direct program links */}
                    {programs.map((p) => (
                      <Link key={p.id} to={`/programs/${p.id}`} style={{ textDecoration: "none" }}>
                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.99 }}
                          style={{
                            height: "100%",
                            padding: `${spacing.md} ${spacing.lg}`,
                            borderRadius: borderRadius.xl,
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid rgba(255,255,255,0.10)`,
                            boxShadow: "0 14px 38px rgba(0,0,0,0.35)",
                            backdropFilter: "blur(14px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: spacing.md,
                          }}
                          aria-label={`Explore ${p.name}`}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ ...typography.overline, color: p.accent, letterSpacing: "0.14em" }}>{p.acronym}</div>
                            <div style={{ ...typography.caption, color: colors.text.secondary, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {p.name}
                            </div>
                          </div>
                          <ArrowRightIcon size={16} color={p.accent} />
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Program Feature Panels - Premium Staggered Grid */}
      <section id="programs-grid" style={{
        padding: `${spacing["4xl"]} ${spacing.xl}`,
        background: "transparent",
        position: "relative",
      }}>
        {/* Background Texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 30%, rgba(0,224,255,0.06) 0%, transparent 50%), 
                         radial-gradient(circle at 70% 70%, rgba(255,169,0,0.04) 0%, transparent 50%)`,
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: spacing["2xl"],
              alignItems: "stretch",
            }}
          >
            {programs.map((program, idx) => {
              const cardSize = program.size === "large" ? { minHeight: "500px", gridColumn: isMobile ? "1" : "span 2" } :
                             program.size === "medium" ? { minHeight: "450px" } :
                             { minHeight: "400px" };
              
              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    to={`/programs/${program.id}`}
                    style={{ textDecoration: "none", display: "block", height: "100%" }}
                  >
                    <motion.div
                      style={{
                        position: "relative",
                        background: `rgba(10, 16, 32, 0.6)`,
                        backdropFilter: "blur(20px)",
                        borderRadius: borderRadius["2xl"],
                        border: `1px solid rgba(255,255,255,0.1)`,
                        padding: spacing.xl,
                        height: "100%",
                        cursor: "pointer",
                        transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                        overflow: "hidden",
                        ...cardSize,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${program.accent}60`;
                        e.currentTarget.style.boxShadow = `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px ${program.accent}30`;
                        const bg = e.currentTarget.querySelector('.card-bg') as HTMLElement;
                        if (bg) bg.style.opacity = "0.25";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.boxShadow = "none";
                        const bg = e.currentTarget.querySelector('.card-bg') as HTMLElement;
                        if (bg) bg.style.opacity = "0.15";
                      }}
                    >
                      {/* Card Background Image */}
                      {program.image && (
                        <div
                          className="card-bg"
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url(${program.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: 0.15,
                            filter: "blur(8px)",
                            transition: "opacity 0.4s ease",
                            zIndex: 0,
                          }}
                        />
                      )}

                      {/* Content */}
                      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
                        {/* Acronym Badge */}
                        <div style={{ marginBottom: spacing.md }}>
                          <span style={{
                            ...typography.overline,
                            color: program.accent,
                            letterSpacing: "0.1em",
                            fontSize: typography.fontSize.xs,
                            padding: `${spacing.xs} ${spacing.md}`,
                            background: `${program.accent}15`,
                            border: `1px solid ${program.accent}40`,
                            borderRadius: borderRadius.full,
                            display: "inline-block",
                          }}>
                            {program.acronym}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{
                          ...typography.h2,
                          color: colors.text.primary,
                          marginBottom: spacing.sm,
                          fontSize: program.size === "large" ? typography.fontSize["3xl"] : typography.fontSize["2xl"],
                          fontWeight: typography.fontWeight.bold,
                          lineHeight: 1.2,
                        }}>
                          {program.name}
                        </h3>

                        {/* Positioning */}
                        <p style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.lg,
                          lineHeight: 1.7,
                          opacity: 0.9,
                          fontSize: typography.fontSize.base,
                        }}>
                          {program.positioning}
                        </p>

                        {/* Highlights */}
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: spacing.md,
                          flex: 1,
                          marginBottom: spacing.lg,
                        }}>
                          {program.highlights.map((highlight, hIdx) => (
                            <div key={hIdx} style={{
                              display: "flex",
                              alignItems: "center",
                              gap: spacing.sm,
                            }}>
                              <div style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: program.accent,
                                flexShrink: 0,
                                boxShadow: `0 0 12px ${program.accent}60`,
                              }} />
                              <span style={{
                                ...typography.body,
                                color: colors.text.secondary,
                                fontSize: typography.fontSize.sm,
                                opacity: 0.85,
                              }}>
                                {highlight}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Learn More Link */}
                        <motion.div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: spacing.sm,
                            color: program.accent,
                            marginTop: "auto",
                          }}
                          whileHover={{ x: 4 }}
                        >
                          <span style={{
                            ...typography.body,
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                          }}>
                            Learn More
                          </span>
                          <ArrowRightIcon size={18} />
                        </motion.div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default ProgramsOverviewPage;

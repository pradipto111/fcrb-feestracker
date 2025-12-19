/**
 * Programs / Academy Page
 * Complete rebuild using RealVerse data + old-site content + football-first design system
 * 
 * Sections:
 * (A) Hero Section
 * (B) Pathway & Development Section (Merged)
 * (C) Program Cards (RealVerse data)
 * (D) Specialized Programs
 * (E) Training Experience
 * (G) FAQ
 * (H) Sponsors Strip
 * (I) Contact & Join CTA
 */

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import {
  ArrowRightIcon,
  TrophyIcon,
  ChartBarIcon,
  FireIcon,
  GraduationCapIcon,
  ShieldIcon,
  DownloadIcon,
  PhoneIcon,
  EmailIcon,
  FlagIcon,
} from "../components/icons/IconSet";
import { galleryAssets } from "../config/assets";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { heroCTAStyles, heroCTAPillStyles, programCardOverlay } from "../theme/hero-design-patterns";

const ProgramsOverviewPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { infinitySectionVariants, viewportOnce } = useHomepageAnimation();
  const pathwayRef = useRef<HTMLElement>(null);
  const { scrollYProgress: pathwayScroll } = useScroll({
    target: pathwayRef,
    offset: ["start end", "end start"],
  });
  const pathwayBgY = useTransform(pathwayScroll, [0, 1], ["-6%", "6%"]);
  const pathwayBgOpacity = useTransform(pathwayScroll, [0, 0.25], [0.95, 1]);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w <= 768);
      setIsTablet(w <= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.title = "The RealVerse Football Academy | FC Real Bengaluru";
  }, []);

  // InfinitySection wrapper component
  const InfinitySection: React.FC<{
    children: React.ReactNode;
    id?: string;
    style?: React.CSSProperties;
    bridge?: boolean;
  }> = ({ children, id, style, bridge = false }) => {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, {
      once: false,
      amount: 0.1,
      margin: "-100px",
    });

    return (
      <>
        {bridge && (
          <div
            style={{
              position: "relative",
              height: "100px",
              marginTop: "-100px",
              zIndex: 1,
              background: "transparent",
              pointerEvents: "none",
            }}
          />
        )}
        <motion.section
          ref={sectionRef}
          id={id}
          initial="offscreen"
          animate={isInView ? "onscreen" : "offscreen"}
          variants={infinitySectionVariants}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          viewport={{ once: false, amount: 0.1 }}
          style={{
            ...style,
            position: "relative",
            marginTop: bridge ? "-100px" : "0",
            marginBottom: bridge ? "-100px" : "0",
            paddingTop: bridge ? "150px" : (style?.paddingTop ?? spacing.sectionGap),
          }}
        >
          {children}
        </motion.section>
      </>
    );
  };

  // RealVerse Programs Data (Primary Source)
  // Note: Grassroots & dedicated GK cards removed from the grid as requested.
  const realversePrograms = [
    {
      id: "epp",
      name: "Elite Pathway Program",
      acronym: "EPP",
      positioning: "For players targeting top-tier football in India and abroad.",
      ageGroup: "U17+",
      intensity: "Highest",
      highlights: [
        "Super Division focused",
        "Highest intensity training",
        "Individual development plans",
        "Professional pathway",
        "RealVerse analytics",
      ],
      accent: colors.accent.main,
      image: galleryAssets.actionShots[0]?.medium,
      backgroundImage: "/assets/DSC09619 (1).JPG",
      link: "/programs/epp",
    },
    {
      id: "scp",
      name: "Senior Competitive Program",
      acronym: "SCP",
      positioning: "The competitive bridge between youth and elite football.",
      ageGroup: "U15+",
      intensity: "High",
      highlights: [
        "C & D Division exposure",
        "Regular competitive matches",
        "EPP feeder pathway",
        "Structured development",
        "Performance tracking",
      ],
      accent: colors.primary.main,
      image: galleryAssets.actionShots[1]?.medium,
      backgroundImage: "/assets/Screenshot 2025-12-15 113324.png",
      link: "/programs/scp",
    },
    {
      id: "wpp",
      name: "Women's Performance Pathway",
      acronym: "WPP",
      positioning: "A unified pathway for women footballers aiming professional levels.",
      ageGroup: "All Ages",
      intensity: "Scalable",
      highlights: [
        "Women's B Division",
        "Year-round matches",
        "Career pathway",
        "Equal standards",
        "Data-driven development",
      ],
      accent: colors.accent.main,
      image: galleryAssets.actionShots[2]?.medium,
      backgroundImage: "/assets/IMG_4908.jpg",
      link: "/programs/wpp",
    },
    {
      id: "fydp",
      name: "Foundation & Youth Development Program",
      acronym: "FYDP",
      positioning: "Building intelligent footballers before building competitors.",
      ageGroup: "U9, U11, U13",
      intensity: "Development-focused",
      highlights: [
        "Tactical foundations",
        "Data-assisted learning",
        "No playstyle shock",
        "Merit-based progression",
        "Foundation building",
      ],
      accent: colors.primary.main,
      image: galleryAssets.actionShots[3]?.medium,
      backgroundImage: "/assets/NITT8121.jpg",
      link: "/programs/fydp",
    },
  ];

  // Cinematic Pathway (visual-first)
  const pathwayStages = [
    {
      id: "stage-1",
      title: "Grassroots → Development",
      ageGroup: "U9–U13",
      description: "Foundations, identity and core habits.",
      image: "/assets/20251007-DSC_0535.jpg",
    },
    {
      id: "stage-2",
      title: "Development → Competitive",
      ageGroup: "U15–U17",
      description: "Structured growth with match-ready standards.",
      image: "/assets/20251007-DSC_0557.jpg",
    },
    {
      id: "stage-3",
      title: "Competitive → Elite Pathway",
      ageGroup: "U17+",
      description: "Progression to higher levels and pro targets.",
      image: "/assets/DSC09619%20(1).JPG",
    },
  ];

  // “How We Train” merged into pathway as compact tiles (coaching + tech)
  const pathwayTiles = [
    {
      title: "Licensed Coaches",
      description: "A-licensed and certified coaches leading every age group.",
      icon: GraduationCapIcon,
      image: "/assets/DSC00893.jpg",
    },
    {
      title: "Unified Club Philosophy",
      description: "One game model across programs and sessions.",
      icon: ShieldIcon,
      image: "/assets/20250927-DSC_0446.jpg",
    },
    {
      title: "AI, Data & Metrics",
      description: "RealVerse tools track progress, loads and decision-making.",
      icon: ChartBarIcon,
      image: "/assets/Screenshot%202025-12-15%20113324.png",
    },
    {
      title: "Complete Development Stack",
      description: "From camps to year-round training and game analysis.",
      icon: FireIcon,
      image: "/assets/NITT8121.jpg",
    },
  ];

  // FAQ Data
  const faqData = [
    {
      id: "age-range",
      question: "What is the age range for academy programs?",
      answer:
        "Our programs welcome players from U9 through senior levels. Foundation & Youth Development Program (FYDP) focuses on U9, U11, and U13. Senior Competitive Program (SCP) is for U15+, and Elite Pathway Program (EPP) is for U17+ players. Women's Performance Pathway welcomes all age groups.",
    },
    {
      id: "fees",
      question: "What are the program fees?",
      answer:
        "Program fees vary by program tier and commitment level. Please contact us at +91 8660843598 or contact@realbengaluru.com for detailed fee structures and payment plans. We offer flexible payment options and scholarship opportunities for deserving players.",
    },
    {
      id: "schedules",
      question: "What are the training schedules?",
      answer:
        "Training schedules are program-specific and designed around competitive calendars. Most programs include 3-5 sessions per week, with additional match days. Schedules are communicated at the start of each season and adjusted for tournaments and competitive periods.",
    },
    {
      id: "registration",
      question: "How do I register for a program?",
      answer:
        "Registration is done through our RealVerse Academy portal. Visit /realverse/join to begin your application. You'll need to provide player information, preferred program, and contact details. Our team will review your application and contact you for next steps, which may include a trial session.",
    },
    {
      id: "development",
      question: "What development opportunities are available?",
      answer:
        "All programs include RealVerse analytics tracking, individualized development plans, regular coach feedback, competitive match exposure, and pathway progression opportunities. Elite programs offer additional professional infrastructure access, advanced sports science support, and direct pathways to higher competitive levels.",
    },
  ];

  // Sponsor Assets (from public/assets folder)
  const sponsors = [
    { name: "Notch", logoSrc: "/assets/notch.png" },
    { name: "Sparsh Hospital", logoSrc: "/assets/sparsh hospital.jpeg" },
    { name: "Decathlon", logoSrc: "/assets/decathlon.png" },
    { name: "Aces", logoSrc: "/assets/aces.png" },
    { name: "Hyve", logoSrc: "/assets/hyvesports_logo.jpeg" },
    { name: "BeyondBurg", logoSrc: "/assets/beyonndburg.jpeg" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.club.deep, position: "relative" }}>
      {/* Global fixed video background so header + hero sit on the same moving layer */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: "100vw",
            height: "100vh",
            transform: "translateX(-50%) scale(1.15)",
          }}
        >
          <iframe
            src="https://www.youtube-nocookie.com/embed/23kUIDR1d7Q?autoplay=1&mute=1&loop=1&playlist=23kUIDR1d7Q&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=1&fs=0&cc_load_policy=0&showinfo=0"
            title="RealVerse Academy Background"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              opacity: 0.9,
            }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          />
        </div>
        {/* Dark gradient + subtle noise to match homepage hero look */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.92) 0%, 
              rgba(10, 22, 51, 0.86) 50%, 
              rgba(5, 11, 32, 0.96) 100%)`,
            mixBlendMode: "multiply",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      <PublicHeader />

      {/* (A) HERO SECTION WITH FULL-BLEED VIDEO BACKGROUND */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
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
                OUR FOOTBALL ACADEMY
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                ...typography.h1,
                fontSize: `clamp(2.5rem, 7vw, 5.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                lineHeight: 1.05,
                fontWeight: typography.fontWeight.bold,
                textShadow: "0 4px 40px rgba(0, 0, 0, 0.9), 0 0 60px rgba(0, 224, 255, 0.2)",
                letterSpacing: "-0.02em",
              }}
            >
              The RealVerse
              <br />
              <span style={{ color: colors.accent.main }}>Football Academy</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                ...typography.body,
                fontSize: typography.fontSize.xl,
                color: colors.text.secondary,
                lineHeight: 1.8,
                maxWidth: "700px",
                textShadow: "0 2px 20px rgba(0, 0, 0, 0.7)",
                marginBottom: spacing["2xl"],
              }}
            >
              Where Bengaluru's next generation learns, trains, and rises. A modern academy that blends football
              tradition + science + community.
            </motion.p>

            {/* 3 Pillar Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: spacing.md,
                marginBottom: spacing["2xl"],
              }}
            >
              {[
                { label: "Player Pathways", icon: FlagIcon },
                { label: "Professional Coaching", icon: TrophyIcon },
                { label: "Data-Driven Development", icon: ChartBarIcon },
              ].map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + idx * 0.1, duration: 0.5 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: spacing.sm,
                      padding: `${spacing.xs} ${spacing.md}`,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: `1px solid rgba(255, 255, 255, 0.12)`,
                      borderRadius: borderRadius.full,
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Icon size={16} color={colors.accent.main} />
                    <span style={{ ...typography.caption, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                      {pillar.label}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: spacing.md,
                alignItems: "center",
              }}
            >
              <Link to="/realverse/join" style={{ textDecoration: "none", width: isMobile ? "100%" : "auto" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...heroCTAStyles.yellow,
                    width: isMobile ? "100%" : "auto",
                    minWidth: isMobile ? "100%" : 280,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={heroCTAStyles.yellow.textStyle}>Join RealVerse Academy</span>
                    <span style={heroCTAStyles.yellow.subtitleStyle}>Trials, training plans, and placement pathway</span>
                  </div>
                  <ArrowRightIcon size={20} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                </motion.div>
              </Link>

              <Link to="/brochure" style={{ textDecoration: "none", width: isMobile ? "100%" : "auto" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...heroCTAStyles.darkWithBorder,
                    width: isMobile ? "100%" : "auto",
                    minWidth: isMobile ? "100%" : 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={heroCTAStyles.darkWithBorder.textStyle}>Download Program Brochure</span>
                    <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>Detailed pathways, schedules, and fees</span>
                  </div>
                  <DownloadIcon size={18} style={{ color: colors.accent.main, flexShrink: 0 }} />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* (B) PATHWAY & DEVELOPMENT SECTION - Merged */}
      <InfinitySection id="pathway-explainer" bridge={false} style={{ padding: 0, paddingTop: 0, paddingBottom: 0 }}>
        <motion.section
          ref={pathwayRef}
          style={{
            position: "relative",
            overflow: "hidden",
            padding: `${spacing["3xl"]} ${spacing.xl}`,
          }}
        >
          {/* Cinematic background (local layer above global video) */}
          <motion.div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -40,
              zIndex: 0,
              y: pathwayBgY,
              opacity: pathwayBgOpacity,
              filter: "saturate(1.05) contrast(1.05) brightness(0.85)",
              transform: "translateZ(0)",
            }}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/assets/20251007-DSC_0557.jpg"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.9,
              }}
            >
              <source src="/assets/night-shoot-render-v1.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Navy vignette + scrims */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              background: `
                radial-gradient(1200px 520px at 50% 10%, rgba(0, 224, 255, 0.10), transparent 60%),
                radial-gradient(900px 560px at 10% 35%, rgba(255, 169, 0, 0.10), transparent 62%),
                linear-gradient(180deg, rgba(5, 11, 32, 0.86) 0%, rgba(5, 11, 32, 0.72) 45%, rgba(5, 11, 32, 0.92) 100%)
              `,
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
              boxShadow: "inset 0 0 140px rgba(0,0,0,0.75)",
            }}
          />

          {/* Subtle grain (animated) */}
          <motion.div
            aria-hidden="true"
            animate={{ backgroundPosition: ["0px 0px", "120px 80px"] }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              opacity: 0.035,
              mixBlendMode: "overlay",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "220px 220px",
            }}
          />

          <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 4 }}>
            {/* Title (minimal copy) */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                textAlign: "center",
                marginBottom: spacing["2xl"],
              }}
            >
              <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
                REALVERSE PATHWAY
              </div>
              <h2
                style={{
                  ...typography.h2,
                  fontSize: `clamp(2rem, 5vw, 3.5rem)`,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                  fontWeight: typography.fontWeight.bold,
                  textShadow: "0 10px 50px rgba(0,0,0,0.65)",
                }}
              >
                Your Pathway Through RealVerse
              </h2>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  fontSize: typography.fontSize.lg,
                  maxWidth: "860px",
                  margin: "0 auto",
                  lineHeight: 1.75,
                  textShadow: "0 6px 30px rgba(0,0,0,0.65)",
                }}
              >
                Where every player grows — from grassroots to elite — guided by licensed coaches, a unified club philosophy,
                and RealVerse data tools that support development at every stage.
              </p>
            </motion.div>

            {/* Cinematic ribbon (film strip) */}
            <div style={{ position: "relative", marginBottom: spacing.xl }}>
              {/* Progression thread */}
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={viewportOnce}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  transformOrigin: "left center",
                  position: "absolute",
                  left: isMobile ? 28 : 24,
                  right: isMobile ? "auto" : 24,
                  top: isMobile ? 18 : "50%",
                  width: isMobile ? 2 : "auto",
                  height: isMobile ? "calc(100% - 36px)" : 2,
                  opacity: isMobile ? 1 : isTablet ? 0 : 1,
                  background: isMobile
                    ? `linear-gradient(180deg, ${colors.accent.main}00, ${colors.accent.main}AA, ${colors.primary.main}80, ${colors.accent.main}00)`
                    : `linear-gradient(90deg, ${colors.accent.main}00, ${colors.accent.main}AA, ${colors.primary.main}80, ${colors.accent.main}00)`,
                  boxShadow: `0 0 26px ${colors.accent.main}35`,
                  borderRadius: 999,
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
                  gap: isMobile ? spacing.lg : isTablet ? spacing.lg : 0,
                  alignItems: "stretch",
                }}
              >
                {pathwayStages.map((stage, idx) => {
                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewportOnce}
                      transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{
                        y: -6,
                        filter: "brightness(1.06)",
                        boxShadow: shadows.cardHover,
                      }}
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        minHeight: isMobile ? 168 : 260,
                        borderRadius: borderRadius["2xl"],
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: shadows.card,
                        ...(isMobile || isTablet
                          ? {}
                          : {
                              marginLeft: idx === 0 ? 0 : -24,
                              zIndex: 10 + idx,
                            }),
                        background: "rgba(10, 16, 32, 0.35)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {/* Background image */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundImage: `url("${stage.image}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          transform: "scale(1.05)",
                          filter: "saturate(1.02) contrast(1.05)",
                          opacity: 0.72,
                        }}
                      />
                      {/* Dark-blue overlay for readability */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(90deg, rgba(5, 11, 32, 0.92) 0%, rgba(5, 11, 32, 0.62) 45%, rgba(5, 11, 32, 0.90) 100%)",
                        }}
                      />
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "radial-gradient(560px 260px at 20% 30%, rgba(0,224,255,0.12), transparent 60%)",
                          opacity: 0.9,
                        }}
                      />

                      {/* Stage content */}
                      <div
                        style={{
                          position: "relative",
                          zIndex: 2,
                          padding: spacing.xl,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: "100%",
                          gap: spacing.md,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                            <div
                              aria-hidden="true"
                              style={{
                                width: 46,
                                height: 46,
                                borderRadius: 999,
                                background: `linear-gradient(135deg, ${colors.accent.main}22, ${colors.primary.main}18)`,
                                border: `1px solid ${colors.accent.main}55`,
                                boxShadow: `0 0 30px ${colors.accent.main}22`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <span style={{ ...typography.h4, color: colors.accent.main, fontWeight: typography.fontWeight.bold }}>
                                {idx + 1}
                              </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <div
                                style={{
                                  ...typography.overline,
                                  color: colors.accent.main,
                                  letterSpacing: "0.12em",
                                  fontSize: typography.fontSize.xs,
                                }}
                              >
                                {stage.ageGroup}
                              </div>
                              <div
                                style={{
                                  ...typography.h4,
                                  color: colors.text.primary,
                                  fontWeight: typography.fontWeight.bold,
                                  lineHeight: 1.15,
                                }}
                              >
                                {stage.title}
                              </div>
                            </div>
                          </div>
                          {!isMobile && (
                            <div
                              aria-hidden="true"
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                background: colors.accent.main,
                                boxShadow: `0 0 22px ${colors.accent.main}`,
                                opacity: 0.75,
                              }}
                            />
                          )}
                        </div>
                        <div
                          style={{
                            ...typography.body,
                            color: "rgba(255,255,255,0.82)",
                            fontSize: typography.fontSize.sm,
                            lineHeight: 1.5,
                            maxWidth: 360,
                          }}
                        >
                          {stage.description}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Compact tiles (merged coaching + training USP) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
                gap: spacing.lg,
                alignItems: "stretch",
                marginBottom: spacing.xl,
              }}
            >
              {pathwayTiles.map((tile, idx) => {
                const Icon = tile.icon;
                return (
                  <motion.div
                    key={`${tile.title}-${idx}`}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewportOnce}
                    transition={{ duration: 0.6, delay: 0.05 + idx * 0.08 }}
                    whileHover={{
                      y: -4,
                      boxShadow: `0 18px 60px rgba(0,0,0,0.45), 0 0 46px ${colors.accent.main}22`,
                    }}
                    style={{
                      borderRadius: borderRadius.xl,
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.04)",
                      boxShadow: shadows.md,
                      padding: spacing.xl,
                      display: "flex",
                      flexDirection: "column",
                      gap: spacing.sm,
                      minHeight: isMobile ? "auto" : 120,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("${tile.image}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.22,
                        filter: "saturate(1.02) contrast(1.06)",
                        transform: "scale(1.08)",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(5, 11, 32, 0.90) 0%, rgba(5, 11, 32, 0.70) 55%, rgba(5, 11, 32, 0.92) 100%)",
                      }}
                    />
                    <motion.div
                      aria-hidden="true"
                      initial={{ opacity: 0.45 }}
                      whileHover={{ opacity: 0.85 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: `radial-gradient(520px 220px at 20% 30%, ${colors.accent.main}14, transparent 60%)`,
                        transition: "opacity 220ms ease",
                      }}
                    />

                    <div style={{ position: "relative", zIndex: 1, display: "flex", gap: spacing.md, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: borderRadius.lg,
                          background: `linear-gradient(135deg, ${colors.accent.main}20, ${colors.primary.main}16)`,
                          border: `1px solid rgba(255,255,255,0.14)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: `0 0 24px ${colors.accent.main}1f`,
                        }}
                      >
                        <Icon size={20} color={colors.accent.main} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div
                          style={{
                            ...typography.h5,
                            color: colors.text.primary,
                            fontWeight: typography.fontWeight.bold,
                            lineHeight: 1.1,
                          }}
                        >
                          {tile.title}
                        </div>
                        <div
                          style={{
                            ...typography.body,
                            color: "rgba(255,255,255,0.78)",
                            fontSize: typography.fontSize.sm,
                            lineHeight: 1.45,
                          }}
                        >
                          {tile.description}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Scroll cue (icon-only, not a CTA) */}
            <div style={{ display: "flex", justifyContent: "center", paddingTop: spacing.sm }}>
              <motion.button
                type="button"
                aria-label="Scroll down"
                onClick={() => {
                  const next = document.getElementById("programs-grid");
                  next?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.6, delay: 0.05 }}
                whileHover={{ opacity: 1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: 44,
                  height: 44,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: 999,
                  background: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.78,
                }}
              >
                <motion.div
                  aria-hidden="true"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    border: `1px solid rgba(255,255,255,0.14)`,
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 10px 30px rgba(0,0,0,0.35)`,
                  }}
                >
                  <div style={{ transform: "rotate(90deg)" }}>
                    <ArrowRightIcon size={18} color={colors.accent.main} />
                  </div>
                </motion.div>
              </motion.button>
            </div>
          </div>
        </motion.section>
      </InfinitySection>

      {/* (C) PROGRAM CARDS SECTION */}
      <InfinitySection id="programs-grid" bridge={true} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              REALVERSE PROGRAMS
            </div>
            <h2
              style={{
                ...typography.h2,
                fontSize: `clamp(2rem, 5vw, 3.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Choose Your Pathway
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, maxWidth: "800px", margin: "0 auto" }}>
              All programs share the same tactical identity, coaching methodology, and RealVerse analytics.
            </p>
          </motion.div>

          {/* Program Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: spacing.xl,
            }}
          >
            {realversePrograms.map((program, idx) => {
              // Encode the background image URL to handle spaces and special characters in filenames
              // Only encode the filename part (last segment), keep the path as-is
              const encodedBackgroundImage = program.backgroundImage 
                ? (() => {
                    const lastSlashIndex = program.backgroundImage.lastIndexOf('/');
                    if (lastSlashIndex === -1) {
                      return encodeURIComponent(program.backgroundImage);
                    }
                    const path = program.backgroundImage.substring(0, lastSlashIndex + 1);
                    const filename = program.backgroundImage.substring(lastSlashIndex + 1);
                    return path + encodeURIComponent(filename);
                  })()
                : null;
              
              return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link to={program.link} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <motion.div
                    style={{
                      position: "relative",
                      ...glass.card,
                      ...(encodedBackgroundImage
                        ? {
                            backgroundImage: `url("${encodedBackgroundImage}")`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                          }
                        : {
                            background: `rgba(10, 16, 32, 0.9)`,
                          }),
                      borderRadius: borderRadius["2xl"],
                      padding: spacing.xl,
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                      overflow: "hidden",
                      minHeight: "400px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${program.accent}60`;
                      e.currentTarget.style.boxShadow = `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px ${program.accent}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Branded overlay stack for text readability (blue + gold + subtle blur) */}
                    <div aria-hidden="true" style={{ ...programCardOverlay(program.accent), zIndex: 0 }} />
                    <div aria-hidden="true" style={{ ...glass.overlay, zIndex: 1, opacity: 0.55 }} />
                    <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                      {/* Acronym Badge */}
                      <div style={{ marginBottom: spacing.md }}>
                        <span
                          style={{
                            ...typography.overline,
                            color: program.accent,
                            letterSpacing: "0.1em",
                            fontSize: typography.fontSize.xs,
                            padding: `${spacing.xs} ${spacing.md}`,
                            background: `${program.accent}15`,
                            border: `1px solid ${program.accent}40`,
                            borderRadius: borderRadius.full,
                            display: "inline-block",
                          }}
                        >
                          {program.acronym}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        style={{
                          ...typography.h3,
                          color: colors.text.primary,
                          marginBottom: spacing.sm,
                          fontWeight: typography.fontWeight.bold,
                          lineHeight: 1.2,
                          textShadow: "0 2px 18px rgba(0,0,0,0.65)",
                        }}
                      >
                        {program.name}
                      </h3>

                      {/* Positioning */}
                      <p
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.md,
                          lineHeight: 1.7,
                          opacity: 0.9,
                          textShadow: "0 2px 14px rgba(0,0,0,0.55)",
                        }}
                      >
                        {program.positioning}
                      </p>

                      {/* Age Group & Intensity */}
                      <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg, flexWrap: "wrap" }}>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          Age: <span style={{ color: colors.text.secondary }}>{program.ageGroup}</span>
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted }}>
                          Intensity: <span style={{ color: colors.text.secondary }}>{program.intensity}</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm, flex: 1, marginBottom: spacing.lg }}>
                        {program.highlights.map((highlight, hIdx) => (
                          <div key={hIdx} style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: program.accent,
                                flexShrink: 0,
                                boxShadow: `0 0 12px ${program.accent}60`,
                              }}
                            />
                            <span
                              style={{
                                ...typography.body,
                                color: colors.text.secondary,
                                fontSize: typography.fontSize.sm,
                                opacity: 0.9,
                                textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                              }}
                            >
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <motion.div
                        style={{
                          ...heroCTAPillStyles.base,
                          ...(program.accent === colors.primary.main ? heroCTAPillStyles.blue : heroCTAPillStyles.gold),
                          marginTop: "auto",
                        }}
                        whileHover={{ y: -2 }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          Learn More{" "}
                          <ArrowRightIcon
                            size={16}
                            style={{ color: program.accent === colors.primary.main ? colors.primary.main : colors.accent.main }}
                          />
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
              );
            })}
          </div>
        </div>
      </InfinitySection>

      {/* (G) FAQ SECTION */}
      <InfinitySection id="faq" bridge={true} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2
              style={{
                ...typography.h2,
                fontSize: `clamp(2rem, 5vw, 3.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Common Questions
            </h2>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            {faqData.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.6 }}
                style={{
                  borderRadius: borderRadius.xl,
                  ...glass.card,
                  overflow: "hidden",
                  boxShadow: shadows.md,
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  style={{
                    width: "100%",
                    padding: spacing.lg,
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                  }}
                >
                  <h3 style={{ ...typography.h5, color: colors.text.primary, margin: 0, fontWeight: typography.fontWeight.semibold, flex: 1 }}>
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      fontSize: typography.fontSize.lg,
                      color: colors.accent.main,
                      flexShrink: 0,
                    }}
                  >
                    ▼
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ padding: `0 ${spacing.lg} ${spacing.lg}`, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                        <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.8 }}>
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </InfinitySection>

      {/* (H) SPONSORS STRIP */}
      <InfinitySection id="sponsors" bridge={true} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              OUR SPONSORS
            </div>
            <h2
              style={{
                ...typography.h2,
                fontSize: `clamp(2rem, 5vw, 3.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Proud Partners
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
              gap: spacing.md,
            }}
          >
            {sponsors.map((sponsor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                style={{
                  borderRadius: borderRadius.xl,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.03)",
                  padding: isMobile ? 12 : 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: isMobile ? 74 : 84,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: shadows.md,
                }}
              >
                <img
                  src={sponsor.logoSrc}
                  alt={`${sponsor.name} logo`}
                  loading="lazy"
                  style={{
                    width: "100%",
                    maxWidth: 220,
                    height: 44,
                    objectFit: "contain",
                    filter: "grayscale(100%) brightness(1.25)",
                    opacity: 0.92,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </InfinitySection>

      {/* (I) CONTACT & JOIN CTA */}
      <InfinitySection id="contact-cta" bridge={false} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
          >
            <h2
              style={{
                ...typography.h2,
                fontSize: `clamp(2rem, 5vw, 3.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Ready to Begin Your Journey?
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, marginBottom: spacing["2xl"], maxWidth: "700px", margin: `0 auto ${spacing["2xl"]}` }}>
              Join the RealVerse Football Academy and become part of Bengaluru's next generation of football talent.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: spacing.md,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: spacing["2xl"],
              }}
            >
              <Link to="/realverse/join" style={{ textDecoration: "none", width: isMobile ? "100%" : "auto" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...heroCTAStyles.yellow,
                    width: isMobile ? "100%" : "auto",
                    minWidth: isMobile ? "100%" : 280,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={heroCTAStyles.yellow.textStyle}>Join RealVerse Academy</span>
                    <span style={heroCTAStyles.yellow.subtitleStyle}>Start with a trial and pathway mapping</span>
                  </div>
                  <ArrowRightIcon size={20} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                </motion.div>
              </Link>

              <motion.a
                href="tel:+918660843598"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAPillStyles.base,
                  ...heroCTAPillStyles.gold,
                  textDecoration: "none",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <PhoneIcon size={16} style={{ color: colors.accent.main }} /> +91 8660843598
                </span>
              </motion.a>

              <motion.a
                href="mailto:contact@realbengaluru.com"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAPillStyles.base,
                  ...heroCTAPillStyles.gold,
                  textDecoration: "none",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <EmailIcon size={16} style={{ color: colors.accent.main }} /> contact@realbengaluru.com
                </span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </InfinitySection>
    </div>
  );
};

export default ProgramsOverviewPage;

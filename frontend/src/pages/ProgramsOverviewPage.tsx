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
 * (G) FAQ (with Ready to Begin Your Journey? CTA merged)
 * (H) Sponsors Strip
 */

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YouTubeIcon,
  LocationIcon,
  StarIcon,
} from "../components/icons/IconSet";
import { galleryAssets, clubAssets, heroAssets } from "../config/assets";
import { clubInfo } from "../data/club";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { useHeroParallax } from "../hooks/useParallaxMotion";
import { heroCTAStyles, heroCTAPillStyles, programCardOverlay } from "../theme/hero-design-patterns";

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

const ProgramsOverviewPage: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [centres, setCentres] = useState<Centre[]>([]);
  const { 
    infinitySectionVariants, 
    viewportOnce,
    heroVariants,
    heroContentVariants,
    headingVariants,
    cardVariants,
    staggerContainer,
  } = useHomepageAnimation();
  const heroParallax = useHeroParallax({ speed: 0.15 });
  const heroVideoRef = useRef<HTMLIFrameElement>(null);
  const overlayVideoRef = useRef<HTMLIFrameElement>(null);

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

  // Ensure video starts playing immediately on load
  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.style.opacity = "0.7";
      heroVideoRef.current.style.visibility = "visible";
    }
    if (overlayVideoRef.current) {
      overlayVideoRef.current.style.opacity = "1";
      overlayVideoRef.current.style.visibility = "visible";
    }
  }, []);

  useEffect(() => {
    document.title = "The RealVerse Football Academy | FC Real Bengaluru";
  }, []);

  // Load centres for footer
  useEffect(() => {
    const loadCentres = async () => {
      try {
        const data = await api.getPublicCentres();
        setCentres(data);
      } catch (error) {
        console.error("Error loading centres:", error);
      }
    };
    loadCentres();
  }, []);

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

  // InfinitySection wrapper component
  const InfinitySection: React.FC<{
    children: React.ReactNode;
    id?: string;
    style?: React.CSSProperties;
    bridge?: boolean;
    backgroundImage?: string;
  }> = ({ children, id, style, bridge = false, backgroundImage }) => {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, {
      once: false,
      amount: 0.1,
      margin: "-100px",
    });

    // Extract padding values from style prop, with minimal defaults
    const paddingTop = style?.paddingTop ?? (isMobile ? spacing["2xl"] : spacing["3xl"]);
    const paddingBottom = style?.paddingBottom ?? (isMobile ? spacing["2xl"] : spacing["3xl"]);
    const paddingHorizontal = isMobile ? spacing.lg : spacing.xl;

    // Merge style but ensure critical properties are not overridden
    const sectionStyle: React.CSSProperties = {
      position: "relative",
      marginTop: 0, // Remove negative margins to prevent overlap
      marginBottom: 0,
      paddingTop: paddingTop,
      paddingBottom: paddingBottom,
      paddingLeft: 0,
      paddingRight: 0,
      overflow: "hidden",
      zIndex: 1, // Ensure proper stacking
      ...(style || {}),
      // Override any conflicting properties from style prop
      ...(backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "scroll",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        paddingLeft: 0,
        paddingRight: 0,
      } : {}),
    };

    return (
      <motion.section
        ref={sectionRef}
        id={id}
        initial="offscreen"
        animate={isInView ? "onscreen" : "offscreen"}
        variants={infinitySectionVariants}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        viewport={{ once: false, amount: 0.1 }}
        style={sectionStyle}
      >
        {/* Background Image with blur overlay */}
        {backgroundImage && (
          <>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(18px)",
                opacity: 0.18,
                transform: "scale(1.06)",
                zIndex: 0,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 18% 25%, rgba(0,224,255,0.20) 0%, transparent 55%), radial-gradient(circle at 78% 70%, rgba(255,169,0,0.14) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.82) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.86) 100%)",
                opacity: 0.98,
                zIndex: 0,
              }}
            />
          </>
        )}
        <div style={{ position: "relative", zIndex: 2, paddingLeft: paddingHorizontal, paddingRight: paddingHorizontal }}>
          {children}
        </div>
      </motion.section>
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
      backgroundImage: "/assets/DSC09768.JPG",
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
      backgroundImage: "/assets/DSC09918.JPG",
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
      backgroundImage: "/assets/DSC09828.JPG",
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
      backgroundImage: "/assets/DSC09927.JPG",
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
      image: "/assets/DSC_0205-3.jpg",
    },
    {
      id: "stage-2",
      title: "Development → Competitive",
      ageGroup: "U15–U17",
      description: "Structured growth with match-ready standards.",
      image: "/assets/DSC09723.JPG",
    },
    {
      id: "stage-3",
      title: "Competitive → Elite Pathway",
      ageGroup: "U17+",
      description: "Progression to higher levels and pro targets.",
      image: "/assets/DSC09957.JPG",
    },
  ];

  // “How We Train” merged into pathway as compact tiles (coaching + tech)
  const pathwayTiles = [
    {
      title: "Licensed Coaches",
      description: "A-licensed and certified coaches leading every age group.",
      icon: GraduationCapIcon,
      image: "/assets/20251007-DSC_0563.jpg",
    },
    {
      title: "Unified Club Philosophy",
      description: "One game model across programs and sessions.",
      icon: ShieldIcon,
      image: "/assets/DSC09619 (1).JPG",
    },
    {
      title: "AI, Data & Metrics",
      description: "RealVerse tools track progress, loads and decision-making.",
      icon: ChartBarIcon,
      image: "/assets/Screenshot 2025-12-15 110643.png",
    },
    {
      title: "Complete Development Stack",
      description: "From camps to year-round training and game analysis.",
      icon: FireIcon,
      image: "/assets/Screenshot 2025-12-15 111322.png",
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
      {/* (A) HERO SECTION - Matching Homepage Design */}
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
          paddingTop: isMobile ? "120px" : "140px",
          paddingBottom: spacing["4xl"],
          overflow: "hidden",
        }}
      >
        {/* Multi-layer Background System - Matching Homepage */}
        {/* Layer 1: Background Video */}
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
            src={`https://www.youtube-nocookie.com/embed/23kUIDR1d7Q?autoplay=1&mute=1&loop=1&playlist=23kUIDR1d7Q&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=1&fs=0&cc_load_policy=0&showinfo=0`}
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

        {/* Layer 3: Video background with animated gradient overlay */}
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
          {/* YouTube Video Background */}
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
              src="https://www.youtube-nocookie.com/embed/23kUIDR1d7Q?autoplay=1&mute=1&loop=1&playlist=23kUIDR1d7Q&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=1&fs=0&cc_load_policy=0&showinfo=0&origin=https://www.youtube.com"
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
          
          {/* Stadium Light Overlay - Soft Vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at center top, transparent 0%, rgba(2,12,27,0.4) 40%, rgba(2,12,27,0.85) 100%),
                          linear-gradient(135deg, rgba(10,61,145,0.15) 0%, transparent 50%, rgba(245,179,0,0.08) 100%)`,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        
          {/* Pitch Texture Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(10,61,145,0.03) 100px, rgba(10,61,145,0.03) 200px)
              `,
              opacity: 0.4,
            }}
          />
        </motion.div>

        {/* Stadium Light Effect */}
        <motion.div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(245,179,0,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            zIndex: 1,
            transform: "translateX(-50%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* HERO CONTENT */}
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
            {/* Club identity lockup (logo + full name) */}
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.md,
                padding: isMobile ? "8px 12px" : "10px 14px",
                borderRadius: borderRadius.full,
                background: "rgba(10, 16, 32, 0.42)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 18px 56px rgba(0,0,0,0.55)",
                backdropFilter: "blur(14px)",
                marginBottom: spacing.lg,
              }}
              aria-label="FC Real Bengaluru"
            >
              <img
                src="/fcrb-logo.png"
                alt="FC Real Bengaluru logo"
                style={{
                  width: isMobile ? 34 : 40,
                  height: isMobile ? 34 : 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 10px 26px rgba(0,0,0,0.45), 0 0 18px rgba(0,224,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  flexShrink: 0,
                }}
                loading="eager"
              />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <div
                  style={{
                    ...typography.overline,
                    color: colors.text.muted,
                    letterSpacing: "0.16em",
                    opacity: 0.9,
                  }}
                >
                  FOOTBALL CLUB
                </div>
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: "-0.01em",
                    fontSize: isMobile ? typography.fontSize.lg : typography.fontSize.xl,
                    textShadow: "0 6px 28px rgba(0,0,0,0.65)",
                  }}
                >
                  FC Real Bengaluru
                </div>
              </div>
            </motion.div>

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
                The Real Bengaluru
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  style={{ 
                    background: `linear-gradient(90deg, ${colors.accent.main}, rgba(255, 194, 51, 0.95))`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow: "none",
                  }}
                >
                  Football Academy
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
              A modern, structured pathway from grassroots to elite, backed by licensed coaches and data-driven development.
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
              {/* Primary CTA - Join Academy */}
              <Link
                to="/realverse/join"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: `${spacing.lg} ${spacing.xl}`,
                    borderRadius: borderRadius.button,
                    background: colors.accent.main,
                    border: "none",
                    boxShadow: shadows.button,
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                    cursor: "pointer",
                    width: "100%",
                    minHeight: 72,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={{ ...typography.body, color: colors.text.onAccent, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg }}>
                      Join our Academy
                    </span>
                    <span style={{ ...typography.caption, color: "rgba(2,12,27,0.85)", fontSize: typography.fontSize.sm }}>
                      Start your football journey with us
                    </span>
                  </div>
                  <ArrowRightIcon size={20} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                </motion.div>
              </Link>

              <Link to="/brochure" style={{ textDecoration: "none", width: "100%" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: `${spacing.lg} ${spacing.xl}`,
                    borderRadius: borderRadius.button,
                    background: colors.primary.main,
                    border: "none",
                    boxShadow: shadows.button,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                    cursor: "pointer",
                    width: "100%",
                    minHeight: 72,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={{ ...typography.body, color: colors.text.onPrimary, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg }}>
                      Explore Programs
                    </span>
                    <span style={{ ...typography.caption, color: "rgba(255,255,255,0.85)", fontSize: typography.fontSize.sm }}>
                      Discover our training pathways
                    </span>
                  </div>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
                  >
                    <ArrowRightIcon size={20} color={colors.text.onPrimary} />
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>

            {/* Pathway Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...typography.caption,
                color: colors.text.muted,
                fontSize: typography.fontSize.sm,
                letterSpacing: "0.05em",
                marginTop: spacing.md,
              }}
            >
              From grassroots to elite — one unified pathway
            </motion.div>
          </motion.div>
        </div>

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
        `}</style>
      </motion.section>

      {/* (B) PATHWAY SECTION - Below Hero, Clean & Scannable */}
      <InfinitySection 
        id="pathways-section" 
        backgroundImage="/assets/DSC00893.jpg"
        style={{ paddingTop: isMobile ? spacing["3xl"] : spacing["4xl"], paddingBottom: isMobile ? spacing["3xl"] : spacing["4xl"] }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: spacing["2xl"] }}
          >
            <h2
              style={{
                ...typography.h2,
                fontSize: `clamp(1.75rem, 4vw, 2.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.sm,
                fontWeight: typography.fontWeight.bold,
              }}
            >
              Your Pathway Through RealVerse
            </h2>
            <p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                maxWidth: "800px",
                lineHeight: 1.75,
              }}
            >
              Where every player grows — from grassroots to elite — guided by licensed coaches, a unified club philosophy,
              and RealVerse data tools that support development at every stage.
            </p>
          </motion.div>

          {/* Pathway Cards - Simplified, Equal Height, Minimal Text */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))",
              gap: isMobile ? spacing.lg : spacing.md,
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
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{
                    y: -6,
                    filter: "brightness(1.06)",
                    boxShadow: shadows.cardHover,
                  }}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    minHeight: isMobile ? 200 : 240,
                    borderRadius: borderRadius["2xl"],
                    ...glass.card,
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
                      opacity: 0.65,
                    }}
                  />
                  {/* Glass overlay */}
                  <div aria-hidden="true" style={{ ...glass.overlay, zIndex: 1 }} />

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
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
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
                    <div
                      style={{
                        ...typography.body,
                        color: "rgba(255,255,255,0.82)",
                        fontSize: typography.fontSize.sm,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
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
      </InfinitySection>

      {/* (B.2) FEATURE STRIP - What You Get */}
      <InfinitySection 
        backgroundImage="/assets/20251007-DSC_0535.jpg"
        style={{ paddingTop: isMobile ? spacing["2xl"] : spacing["3xl"], paddingBottom: isMobile ? spacing["2xl"] : spacing["3xl"] }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: spacing.xl }}
          >
            <h3
              style={{
                ...typography.h3,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontWeight: typography.fontWeight.bold,
                textAlign: "center",
              }}
            >
              What You Get
            </h3>
          </motion.div>

          {/* Feature Strip - 4 Icon Cards in Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
              gap: spacing.md,
              alignItems: "stretch",
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
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  whileHover={{
                    y: -4,
                    boxShadow: `0 18px 60px rgba(0,0,0,0.45), 0 0 46px ${colors.accent.main}22`,
                  }}
                  style={{
                    borderRadius: borderRadius.xl,
                    position: "relative",
                    overflow: "hidden",
                    ...glass.card,
                    padding: spacing.lg,
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.sm,
                    minHeight: isMobile ? "auto" : 140,
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
                      opacity: 0.18,
                      filter: "saturate(1.02) contrast(1.06)",
                      transform: "scale(1.08)",
                    }}
                  />
                  <div aria-hidden="true" style={{ ...glass.overlaySoft, zIndex: 1 }} />

                  <div style={{ position: "relative", zIndex: 2, display: "flex", gap: spacing.md, alignItems: "flex-start" }}>
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
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
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
        </div>
      </InfinitySection>

      {/* (C) PROGRAM CARDS SECTION */}
      <InfinitySection 
        id="programs-grid" 
        backgroundImage="/assets/20250927-DSC_0446.jpg"
        style={{ paddingTop: isMobile ? spacing["3xl"] : spacing["4xl"], paddingBottom: isMobile ? spacing["3xl"] : spacing["4xl"] }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
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
                            color: program.accent === colors.primary.main ? colors.primary.light : program.accent,
                            letterSpacing: "0.1em",
                            fontSize: typography.fontSize.xs,
                            padding: `${spacing.xs} ${spacing.md}`,
                            background: program.accent === colors.primary.main ? `${colors.primary.main}25` : `${program.accent}20`,
                            border: program.accent === colors.primary.main ? `1px solid ${colors.primary.light}60` : `1px solid ${program.accent}50`,
                            borderRadius: borderRadius.full,
                            display: "inline-block",
                            fontWeight: typography.fontWeight.semibold,
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
                                background: program.accent === colors.primary.main ? colors.primary.light : program.accent,
                                flexShrink: 0,
                                boxShadow: program.accent === colors.primary.main 
                                  ? `0 0 12px ${colors.primary.light}80, 0 0 6px ${colors.primary.main}60`
                                  : `0 0 12px ${program.accent}80`,
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
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Learn More</span>
                          <ArrowRightIcon
                            size={16}
                            style={{ 
                              color: program.accent === colors.primary.main ? colors.primary.light : colors.accent.main,
                              display: "flex",
                              alignItems: "center",
                              flexShrink: 0
                            }}
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

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: spacing["2xl"],
            }}
          >
            <Link to="/brochure" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAPillStyles.base,
                  ...heroCTAPillStyles.gold,
                  padding: `${spacing.md} ${spacing.xl}`,
                  minWidth: isMobile ? "100%" : 320,
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1, color: colors.text.primary }}>
                    Click here to find Your Program
                  </span>
                  <ArrowRightIcon size={18} style={{ color: colors.accent.main, display: "flex", alignItems: "center", flexShrink: 0 }} />
                </span>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </InfinitySection>

      {/* (G) FAQ SECTION */}
      <InfinitySection 
        id="faq" 
        backgroundImage="/assets/DSC09619 (1).JPG"
        style={{ paddingTop: isMobile ? spacing["3xl"] : spacing["4xl"], paddingBottom: isMobile ? spacing["3xl"] : spacing["4xl"] }}
      >
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

          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md, marginBottom: spacing["2xl"] }}>
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

          {/* Ready to Begin Your Journey? CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginTop: spacing["2xl"] }}
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
                    <span style={heroCTAStyles.yellow.textStyle}>Join Real Bengaluru Academy</span>
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

      {/* Footer */}
      <section
        id="footer"
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(4,8,18,0.95) 0%, rgba(4,8,18,0.98) 100%)",
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
                        { label: "Homepage", to: "/" },
                        { label: "About Us", to: "/about" },
                        { label: "Latest News", to: "/#content-stream" },
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
                        { label: "Fixtures", to: "/#matches" },
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
      </section>
      </main>
    </div>
  );
};

export default ProgramsOverviewPage;

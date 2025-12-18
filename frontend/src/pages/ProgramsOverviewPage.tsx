/**
 * Programs / Academy Page
 * Complete rebuild using RealVerse data + old-site content + football-first design system
 * 
 * Sections:
 * (A) Hero Section
 * (B) Pathway Explainer Section
 * (C) Program Cards (RealVerse data)
 * (D) Specialized Programs
 * (E) Training Experience
 * (F) Player Development & Opportunities
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
import {
  ArrowRightIcon,
  TrophyIcon,
  ChartBarIcon,
  StarIcon,
  FireIcon,
  FootballIcon,
  UsersIcon,
  GraduationCapIcon,
  MedalIcon,
  ShieldIcon,
  CalendarIcon,
  DownloadIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  BoltIcon,
  FlagIcon,
} from "../components/icons/IconSet";
import { galleryAssets, heroAssets, academyAssets } from "../config/assets";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { Button } from "../components/ui/Button";

const ProgramsOverviewPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const { infinitySectionVariants, cardVariants, headingVariants, viewportOnce } = useHomepageAnimation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
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
            paddingTop: bridge ? "150px" : style?.paddingTop || spacing.sectionGap,
          }}
        >
          {children}
        </motion.section>
      </>
    );
  };

  // RealVerse Programs Data (Primary Source)
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
      link: "/programs/fydp",
    },
    {
      id: "grassroots",
      name: "Grassroots Program",
      acronym: "GRASSROOTS",
      positioning: "Open programs for all ages focusing on basic skills, fitness, and love for the game.",
      ageGroup: "All Ages",
      intensity: "Moderate",
      highlights: [
        "Open to all",
        "Basic skills development",
        "Fitness & fun",
        "Foundation building",
        "Community focus",
      ],
      accent: colors.primary.main,
      image: galleryAssets.actionShots[4]?.medium || galleryAssets.actionShots[0]?.medium,
      link: "/realverse/join",
    },
    {
      id: "goalkeeper",
      name: "Goalkeeper Training Program",
      acronym: "GK",
      positioning: "Specialized goalkeeper development with position-specific training.",
      ageGroup: "All Ages",
      intensity: "Specialized",
      highlights: [
        "Position-specific training",
        "Technical mastery",
        "Match preparation",
        "Professional standards",
        "RealVerse tracking",
      ],
      accent: colors.accent.main,
      image: galleryAssets.actionShots[5]?.medium || galleryAssets.actionShots[1]?.medium,
      link: "/realverse/join",
    },
  ];

  // Pathway Timeline Steps
  const pathwaySteps = [
    {
      step: "Grassroots",
      next: "Development",
      ageGroup: "U9-U13",
      description: "Foundation building with tactical identity from day one.",
      icon: FootballIcon,
    },
    {
      step: "Development",
      next: "Competitive",
      ageGroup: "U15-U17",
      description: "Structured training with competitive readiness focus.",
      icon: ChartBarIcon,
    },
    {
      step: "Competitive",
      next: "Elite Pathway",
      ageGroup: "U17+",
      description: "Merit-based progression to professional levels.",
      icon: TrophyIcon,
    },
  ];

  // Training Experience Cards
  const trainingExperiences = [
    {
      title: "Training Camp",
      description: "Intensive residential camps focusing on technical mastery and tactical understanding.",
      icon: FireIcon,
    },
    {
      title: "Year-Round Training",
      description: "Consistent, structured training sessions aligned with competitive calendars.",
      icon: CalendarIcon,
    },
    {
      title: "Training Experience",
      description: "Professional-grade facilities and coaching methodologies used at all levels.",
      icon: StarIcon,
    },
  ];

  // Player Development Opportunities
  const developmentOpportunities = [
    {
      title: "Pathway Progression",
      description: "Clear, merit-based advancement through program tiers with transparent criteria.",
      icon: FlagIcon,
    },
    {
      title: "Youth League Integration",
      description: "Regular competitive exposure through organized youth leagues and tournaments.",
      icon: TrophyIcon,
    },
    {
      title: "Scouting Exposure",
      description: "Opportunities for identification and advancement to higher competitive levels.",
      icon: StarIcon,
    },
    {
      title: "Individualized Development Plans",
      description: "Personalized training programs based on RealVerse data and coach assessment.",
      icon: ChartBarIcon,
    },
    {
      title: "Pro Infrastructure Access",
      description: "Access to professional-grade facilities, equipment, and sports science support.",
      icon: ShieldIcon,
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
      <PublicHeader />

      {/* (A) HERO SECTION */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          position: "relative",
          overflow: "hidden",
          minHeight: "85vh",
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

        {/* Heavy Dark Overlay + Pitch Texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, 
              rgba(5, 11, 32, 0.88) 0%, 
              rgba(10, 22, 51, 0.82) 50%, 
              rgba(5, 11, 32, 0.88) 100%)`,
            zIndex: 1,
          }}
        />

        {/* Subtle Pitch Texture Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
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
              <Link to="/realverse/join" style={{ textDecoration: "none" }}>
                <Button
                  variant="primary"
                  size="lg"
                  style={{
                    borderRadius: borderRadius.full,
                    padding: `${spacing.md} ${spacing.xl}`,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.bold,
                  }}
                >
                  Join RealVerse Academy <ArrowRightIcon size={18} style={{ marginLeft: spacing.sm }} />
                </Button>
              </Link>
              <motion.a
                href="#"
                whileHover={{ x: 4 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  color: colors.text.secondary,
                  textDecoration: "none",
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                Download Program Brochure <DownloadIcon size={18} />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* (B) PATHWAY EXPLAINER SECTION */}
      <InfinitySection id="pathway-explainer" bridge={true} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              YOUR PATHWAY
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
              Your Pathway Through RealVerse
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, maxWidth: "800px", margin: "0 auto" }}>
              A clear progression from grassroots to elite, built on merit, data, and shared tactical identity.
            </p>
          </motion.div>

          {/* 3-Step Timeline */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: spacing.xl,
              position: "relative",
            }}
          >
            {pathwaySteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  style={{
                    position: "relative",
                    background: `rgba(10, 16, 32, 0.6)`,
                    backdropFilter: "blur(20px)",
                    borderRadius: borderRadius["2xl"],
                    border: `1px solid rgba(255,255,255,0.1)`,
                    padding: spacing.xl,
                    boxShadow: shadows.lg,
                  }}
                >
                  {/* Step Number */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${colors.accent.main}20, ${colors.primary.main}20)`,
                      border: `2px solid ${colors.accent.main}40`,
                      marginBottom: spacing.md,
                    }}
                  >
                    <span style={{ ...typography.h4, color: colors.accent.main, fontWeight: typography.fontWeight.bold }}>
                      {idx + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div style={{ marginBottom: spacing.md }}>
                    <Icon size={32} color={colors.accent.main} />
                  </div>

                  {/* Step Name */}
                  <h3
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      fontWeight: typography.fontWeight.bold,
                    }}
                  >
                    {step.step} → {step.next}
                  </h3>

                  {/* Age Group */}
                  <div
                    style={{
                      ...typography.overline,
                      color: colors.accent.main,
                      letterSpacing: "0.1em",
                      marginBottom: spacing.sm,
                      fontSize: typography.fontSize.xs,
                    }}
                  >
                    {step.ageGroup}
                  </div>

                  {/* Description */}
                  <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.7, marginBottom: spacing.md }}>
                    {step.description}
                  </p>

                  {/* CTA */}
                  <Link to="/realverse/join" style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: spacing.xs,
                        color: colors.accent.main,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Explore this program <ArrowRightIcon size={14} />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
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
            {realversePrograms.map((program, idx) => (
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
                      background: `rgba(10, 16, 32, 0.6)`,
                      backdropFilter: "blur(20px)",
                      borderRadius: borderRadius["2xl"],
                      border: `1px solid rgba(255,255,255,0.1)`,
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
                    {/* Background Image */}
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
                            <span style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, opacity: 0.85 }}>
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
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
                        <span style={{ ...typography.body, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold }}>
                          Learn More
                        </span>
                        <ArrowRightIcon size={18} />
                      </motion.div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </InfinitySection>

      {/* (D) SPECIALIZED PROGRAMS */}
      <InfinitySection id="specialized-programs" bridge={true} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              SPECIALIZED PATHWAYS
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
              Specialized Programs
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: spacing.xl,
            }}
          >
            {[
              {
                title: "Elite Pathway",
                subtitle: "Professional Academy equivalent",
                description: "For players targeting top-tier football with highest intensity training and Super Division focus.",
                link: "/programs/epp",
              },
              {
                title: "Junior Development",
                subtitle: "Junior Academy equivalent",
                description: "Foundation building for young players with tactical identity and data-assisted development.",
                link: "/programs/fydp",
              },
              {
                title: "Women's Competitive Pathway",
                subtitle: "Women's Academy equivalent",
                description: "Unified pathway for women footballers with equal standards and professional development.",
                link: "/programs/wpp",
              },
            ].map((program, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                style={{
                  background: `rgba(10, 16, 32, 0.6)`,
                  backdropFilter: "blur(20px)",
                  borderRadius: borderRadius["2xl"],
                  border: `1px solid rgba(255,255,255,0.1)`,
                  padding: spacing.xl,
                  boxShadow: shadows.lg,
                }}
              >
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs, fontWeight: typography.fontWeight.bold }}>
                  {program.title}
                </h3>
                <div
                  style={{
                    ...typography.overline,
                    color: colors.accent.main,
                    letterSpacing: "0.1em",
                    marginBottom: spacing.sm,
                    fontSize: typography.fontSize.xs,
                  }}
                >
                  {program.subtitle}
                </div>
                <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.7, marginBottom: spacing.md }}>
                  {program.description}
                </p>
                <Link to={program.link} style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: spacing.xs,
                      color: colors.accent.main,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    Explore Program <ArrowRightIcon size={14} />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </InfinitySection>

      {/* (E) TRAINING EXPERIENCE SECTION */}
      <InfinitySection id="training-experience" bridge={true} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              TRAINING EXPERIENCE
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
              How We Train
            </h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: spacing.xl,
            }}
          >
            {trainingExperiences.map((exp, idx) => {
              const Icon = exp.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  style={{
                    background: `rgba(10, 16, 32, 0.6)`,
                    backdropFilter: "blur(20px)",
                    borderRadius: borderRadius["2xl"],
                    border: `1px solid rgba(255,255,255,0.1)`,
                    padding: spacing.xl,
                    boxShadow: shadows.lg,
                  }}
                >
                  <div style={{ marginBottom: spacing.md }}>
                    <Icon size={32} color={colors.accent.main} />
                  </div>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm, fontWeight: typography.fontWeight.bold }}>
                    {exp.title}
                  </h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.7, marginBottom: spacing.md }}>
                    {exp.description}
                  </p>
                  <motion.div
                    whileHover={{ x: 4 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: spacing.xs,
                      color: colors.accent.main,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    Learn More <ArrowRightIcon size={14} />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </InfinitySection>

      {/* (F) PLAYER DEVELOPMENT & OPPORTUNITIES */}
      <InfinitySection id="development-opportunities" bridge={true} style={{ padding: `${spacing["4xl"]} ${spacing.xl}` }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              PLAYER DEVELOPMENT
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
              Development & Opportunities
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, maxWidth: "800px", margin: "0 auto" }}>
              Every player gets access to comprehensive development pathways and professional infrastructure.
            </p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: spacing.xl,
            }}
          >
            {developmentOpportunities.map((opp, idx) => {
              const Icon = opp.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewportOnce}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  style={{
                    background: `rgba(10, 16, 32, 0.6)`,
                    backdropFilter: "blur(20px)",
                    borderRadius: borderRadius["2xl"],
                    border: `1px solid rgba(255,255,255,0.1)`,
                    padding: spacing.xl,
                    boxShadow: shadows.lg,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.md }}>
                    <div
                      style={{
                        flexShrink: 0,
                        width: 48,
                        height: 48,
                        borderRadius: borderRadius.lg,
                        background: `linear-gradient(135deg, ${colors.accent.main}20, ${colors.primary.main}20)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={24} color={colors.accent.main} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs, fontWeight: typography.fontWeight.bold }}>
                        {opp.title}
                      </h3>
                      <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.7, fontSize: typography.fontSize.sm }}>
                        {opp.description}
                      </p>
                    </div>
                  </div>
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
                  background: `rgba(10, 16, 32, 0.6)`,
                  backdropFilter: "blur(20px)",
                  borderRadius: borderRadius.xl,
                  border: `1px solid rgba(255,255,255,0.1)`,
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
              <Link to="/realverse/join" style={{ textDecoration: "none" }}>
                <Button
                  variant="primary"
                  size="lg"
                  style={{
                    borderRadius: borderRadius.full,
                    padding: `${spacing.md} ${spacing.xl}`,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.bold,
                  }}
                >
                  Join RealVerse Academy <ArrowRightIcon size={18} style={{ marginLeft: spacing.sm }} />
                </Button>
              </Link>
              <motion.a
                href="tel:+918660843598"
                whileHover={{ x: 4 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  color: colors.text.secondary,
                  textDecoration: "none",
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                <PhoneIcon size={18} /> +91 8660843598
              </motion.a>
              <motion.a
                href="mailto:contact@realbengaluru.com"
                whileHover={{ x: 4 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  color: colors.text.secondary,
                  textDecoration: "none",
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                }}
              >
                <EmailIcon size={18} /> contact@realbengaluru.com
              </motion.a>
            </div>
          </motion.div>
        </div>
      </InfinitySection>
    </div>
  );
};

export default ProgramsOverviewPage;

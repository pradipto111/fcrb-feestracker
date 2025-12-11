import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import OurCentresSection from "../components/OurCentresSection";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import {
  clubInfo,
  teams,
  mockNews,
  academyFeatures,
  NewsItem,
} from "../data/club";

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

// Animation variants for different effects
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Animated Section Wrapper
const AnimatedSection: React.FC<{
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ children, id, style, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      transition={{ delay }}
      style={style}
    >
      {children}
    </motion.section>
  );
};

const LandingPage: React.FC = () => {
  const [upcomingFixtures, setUpcomingFixtures] = useState<PublicFixture[]>([]);
  const [recentResults, setRecentResults] = useState<PublicFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const heroCopyOptions = [
    {
      headline: "Every Great Journey Begins With a Single Step",
      subhead: "From your first touch to fierce competition. FC Real Bengaluru is where passion meets professionalism, where dreams take shape.",
    },
    {
      headline: "Train Like Champions. Play With Heart.",
      subhead: "Professional coaching, structured pathways, and competitive exposure across Bengaluru. Your legacy starts here.",
    },
    {
      headline: "This Is Where Legacies Are Born",
      subhead: "Join Bengaluru's fastest-growing football club. Structured training, honest feedback, and a clear pathway from academy to senior football.",
    },
  ];

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

  // Handle scroll to section when navigating from other pages
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, []);

  // Auto-rotate hero text
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroCopyOptions.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
        overflowX: "hidden",
      }}
    >
      <PublicHeader />

      {/* Hero Section with Parallax */}
      <motion.section
        ref={heroRef}
        id="hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "80px",
          overflow: "hidden",
          opacity: heroOpacity,
          scale: heroScale,
        }}
      >
        {/* Animated Background Image with Parallax */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url(/photo1.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            filter: "brightness(0.4) contrast(1.2)",
          }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Gradient Overlay */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(4, 61, 208, 0.4) 0%, rgba(255, 169, 0, 0.3) 100%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Floating Particles Effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.3)",
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            width: "100%",
            padding: spacing.xl,
            textAlign: "center",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                style={{
                  ...typography.display,
                  fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                  marginBottom: spacing.lg,
                  color: colors.text.primary,
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                  lineHeight: 1.2,
                  fontWeight: 900,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {heroCopyOptions[currentHeroIndex].headline}
              </motion.h1>
              <motion.p
                style={{
                  ...typography.h4,
                  fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
                  marginBottom: spacing["2xl"],
                  color: colors.text.secondary,
                  maxWidth: "800px",
                  margin: `0 auto ${spacing["2xl"]}`,
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                  lineHeight: 1.6,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {heroCopyOptions[currentHeroIndex].subhead}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* CTAs */}
          <motion.div
            style={{
              display: "flex",
              gap: spacing.lg,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link to="/realverse/join" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="primary" size="lg">
                  Join RealVerse Academy
                </Button>
              </motion.div>
            </Link>
            <a href="#academy" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" size="lg">
                  Explore Academy
                </Button>
              </motion.div>
            </a>
          </motion.div>

          {/* Hero Indicators */}
          <motion.div
            style={{
              display: "flex",
              gap: spacing.xs,
              justifyContent: "center",
              marginTop: spacing["2xl"],
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {heroCopyOptions.map((_, idx) => (
              <motion.div
                key={idx}
                onClick={() => setCurrentHeroIndex(idx)}
                style={{
                  width: currentHeroIndex === idx ? 32 : 12,
                  height: 12,
                  borderRadius: 6,
                  background:
                    currentHeroIndex === idx ? colors.accent.main : "rgba(255, 255, 255, 0.3)",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.2 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>

          {/* Brochure CTA Section */}
          <motion.div
            style={{
              marginTop: spacing["3xl"],
              padding: spacing["2xl"],
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: borderRadius.xl,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "800px",
              margin: `${spacing["3xl"]} auto 0`,
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3
              style={{
                ...typography.h3,
                textAlign: "center",
                marginBottom: spacing.md,
                color: colors.text.primary,
              }}
            >
              Get to Know FC Real Bengaluru
            </h3>
            <p
              style={{
                ...typography.body,
                textAlign: "center",
                color: colors.text.secondary,
                marginBottom: spacing.lg,
                fontSize: typography.fontSize.base,
              }}
            >
              Our philosophy, methods, pathway, and people — all in one place.
            </p>
            <div
              style={{
                display: "flex",
                gap: spacing.md,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link to="/brochure" style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" size="md">
                    View Club Brochure
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Stats Strip with Animation */}
          <motion.div
            style={{
              display: "flex",
              gap: spacing["2xl"],
              justifyContent: "center",
              marginTop: spacing["3xl"],
              flexWrap: "wrap",
            }}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { label: "Years Active", value: clubInfo.stats.yearsActive },
              { label: "Players Trained", value: clubInfo.stats.playersTrained },
              { label: "Training Centers", value: clubInfo.stats.centers },
              { label: "Teams", value: clubInfo.stats.teams },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                style={{
                  textAlign: "center",
                  padding: spacing.lg,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: borderRadius.xl,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  minWidth: "150px",
                }}
                variants={scaleIn}
                whileHover={{ 
                  scale: 1.05,
                  background: "rgba(255, 255, 255, 0.08)",
                  borderColor: colors.accent.main,
                }}
              >
                <motion.div
                  style={{
                    ...typography.h2,
                    fontSize: typography.fontSize["3xl"],
                    color: colors.accent.main,
                    marginBottom: spacing.xs,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 1.2 + idx * 0.1, 
                    type: "spring",
                    stiffness: 200,
                    damping: 10
                  }}
                >
                  {stat.value}+
                </motion.div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            style={{
              marginTop: spacing["3xl"],
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: spacing.sm,
              color: colors.text.muted,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            <div style={{ ...typography.caption, fontSize: typography.fontSize.sm }}>
              Scroll to explore
            </div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                fontSize: typography.fontSize.xl,
              }}
            >
              ↓
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* About the Club */}
      <AnimatedSection
        id="club"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: spacing["2xl"],
            alignItems: "center",
          }}
        >
          {/* Text Content */}
          <motion.div variants={fadeInLeft}>
            <motion.div
              style={{
                display: "inline-block",
                padding: `${spacing.xs} ${spacing.md}`,
                background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
              }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span style={{ ...typography.overline, color: colors.accent.main }}>
                OUR STORY
              </span>
            </motion.div>
            <h2
              style={{
                ...typography.h1,
                marginBottom: spacing.lg,
                color: colors.text.primary,
              }}
            >
              About FC Real Bengaluru
            </h2>
            <p
              style={{
                ...typography.body,
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                marginBottom: spacing.lg,
                lineHeight: 1.7,
              }}
            >
              FC Real Bengaluru is a professionally run club and academy built around clear, long-term player
              development. We combine daily training standards with honest feedback so every player—and parent—knows
              the path ahead.
            </p>
            <p
              style={{
                ...typography.body,
                color: colors.text.muted,
                marginBottom: spacing.xl,
                lineHeight: 1.7,
              }}
            >
              Our squads train under qualified coaches, compete across age groups, and progress through a defined
              pathway into senior football. The focus is steady growth: technical detail, tactical awareness,
              physical readiness, and the mentality to compete.
            </p>
            <motion.ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
              }}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "Structured club + academy model with squads from grassroots to senior levels",
                "Qualified coaching staff, session plans, and seasonal periodisation",
                "Regular league and tournament exposure across Bengaluru and beyond",
                "Transparent pathways into senior football with clear expectations",
              ].map((point, idx) => (
                <motion.li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.md,
                    color: colors.text.secondary,
                  }}
                  variants={fadeInUp}
                >
                  <motion.span
                    style={{
                      color: colors.accent.main,
                      fontSize: typography.fontSize.xl,
                      marginTop: "2px",
                    }}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    ✓
                  </motion.span>
                  <span>{point}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Image */}
          <motion.div
            style={{
              position: "relative",
              borderRadius: borderRadius["2xl"],
              overflow: "hidden",
              boxShadow: shadows["2xl"],
            }}
            variants={fadeInRight}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src="/photo2.png"
              alt="FC Real Bengaluru Team"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(to top, rgba(5, 11, 32, 0.9) 0%, transparent 100%)`,
                padding: spacing.xl,
              }}
              initial={{ y: 100 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                }}
              >
                Founded in {clubInfo.founded}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Teams & Pathways */}
      <AnimatedSection
        id="teams"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              style={{
                display: "inline-block",
                padding: `${spacing.xs} ${spacing.md}`,
                background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
              }}
            >
              <span style={{ ...typography.overline, color: colors.accent.main }}>
                YOUR PATHWAY
              </span>
            </motion.div>
            <h2
              style={{
                ...typography.h1,
                marginBottom: spacing.xl,
                color: colors.text.primary,
              }}
            >
              Teams & Pathways
            </h2>
            <p
              style={{
                ...typography.body,
                color: colors.text.muted,
                maxWidth: "700px",
                margin: `0 auto`,
              }}
            >
              From grassroots programs to senior competition, we offer structured pathways for players
              at every level.
            </p>
          </motion.div>

          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: spacing.xl,
            }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {teams.map((team, idx) => (
              <motion.div
                key={team.id}
                variants={scaleIn}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 20px 40px rgba(255, 169, 0, 0.2)",
                }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="elevated" padding="lg">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: spacing.md,
                      height: "100%",
                    }}
                  >
                    {team.ageGroup && (
                      <motion.div
                        style={{
                          ...typography.overline,
                          color: colors.accent.main,
                          marginBottom: spacing.xs,
                        }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        {team.ageGroup}
                      </motion.div>
                    )}
                    <h3
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {team.name}
                    </h3>
                    <div
                      style={{
                        ...typography.caption,
                        color: colors.accent.main,
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      {team.tagline}
                    </div>
                    <p
                      style={{
                        ...typography.body,
                        color: colors.text.muted,
                        flex: 1,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {team.description}
                    </p>
                    <motion.a
                      href="#academy"
                      style={{
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                        color: colors.primary.light,
                        textDecoration: "none",
                        fontWeight: typography.fontWeight.semibold,
                        marginTop: spacing.md,
                        display: "inline-block",
                      }}
                      whileHover={{ x: 5, color: colors.primary.main }}
                    >
                      Learn more →
                    </motion.a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Academy & Training */}
      <AnimatedSection
        id="academy"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <motion.div
          style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            style={{
              display: "inline-block",
              padding: `${spacing.xs} ${spacing.md}`,
              background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
              borderRadius: borderRadius.full,
              marginBottom: spacing.lg,
            }}
          >
            <span style={{ ...typography.overline, color: colors.accent.main }}>
              PROFESSIONAL DEVELOPMENT
            </span>
          </motion.div>
          <h2
            style={{
              ...typography.h1,
              marginBottom: spacing.xl,
              color: colors.text.primary,
            }}
          >
            Academy & Training
          </h2>
          <p
            style={{
              ...typography.body,
              color: colors.text.muted,
              maxWidth: "700px",
              margin: `0 auto`,
            }}
          >
            Our academy is designed for steady, long-term growth. Sessions build from fundamentals to match realism,
            keeping players challenged without skipping steps.
          </p>
        </motion.div>

        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: spacing.xl,
            marginBottom: spacing["2xl"],
          }}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            {
              title: "Grassroots & Foundation Training",
              desc: "1–3 sessions per week focused on ball mastery, coordination, and enjoying the game the right way.",
            },
            {
              title: "Development & Performance Pathway",
              desc: "Position-specific detail, tactical habits, and physical prep that ready players for competitive squads.",
            },
            {
              title: "Competitive Exposure & Match Play",
              desc: "Planned friendlies, leagues, and tournaments so players test their training in real match scenarios.",
            },
          ].map((block, idx) => (
            <motion.div key={idx} variants={fadeInUp}>
              <Card variant="outlined" padding="lg">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.2 }}
                  style={{
                    height: 4,
                    background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                    borderRadius: 2,
                    marginBottom: spacing.md,
                  }}
                />
                <h4
                  style={{
                    ...typography.h4,
                    color: colors.text.primary,
                    marginBottom: spacing.sm,
                  }}
                >
                  {block.title}
                </h4>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.sm,
                    lineHeight: 1.6,
                  }}
                >
                  {block.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Our Centres Section */}
        <OurCentresSection />

        {/* Academy Features */}
        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: spacing.lg,
            marginTop: spacing["2xl"],
          }}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {academyFeatures.map((feature, idx) => (
            <motion.div key={idx} variants={scaleIn}>
              <Card variant="outlined" padding="lg">
                <motion.div
                  style={{
                    fontSize: typography.fontSize["4xl"],
                    marginBottom: spacing.md,
                  }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h4
                  style={{
                    ...typography.h4,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {feature.title}
                </h4>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          style={{ textAlign: "center", marginTop: spacing["2xl"] }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <a href="#contact" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="primary" size="lg">
                Explore Academy Programmes
              </Button>
            </motion.div>
          </a>
        </motion.div>
      </AnimatedSection>

      {/* RealVerse Feature Highlight */}
      <AnimatedSection
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: spacing["2xl"],
              alignItems: "center",
            }}
          >
            {/* Content */}
            <motion.div variants={fadeInLeft}>
              <motion.div
                style={{
                  display: "inline-block",
                  padding: `${spacing.xs} ${spacing.md}`,
                  background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
                  borderRadius: borderRadius.full,
                  marginBottom: spacing.lg,
                }}
              >
                <span style={{ ...typography.overline, color: colors.accent.main }}>
                  DIGITAL PLATFORM
                </span>
              </motion.div>
              <h2
                style={{
                  ...typography.h1,
                  marginBottom: spacing.lg,
                  color: colors.text.primary,
                }}
              >
                RealVerse: Your Digital Home at FC Real Bengaluru
              </h2>
              <p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
                  marginBottom: spacing.lg,
                  lineHeight: 1.7,
                }}
              >
                RealVerse keeps players, parents, and coaches aligned. It is the single source of truth for schedules,
                attendance, communication, and progress—so development stays organised and transparent.
              </p>
              <motion.ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: `0 0 ${spacing.xl} 0`,
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                }}
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  "Attendance tracking and accountability for every session",
                  "Session schedules, fixtures, and timely updates in one place",
                  "Clear fees and payments with no surprises",
                  "Central record of player milestones and communication",
                ].map((feature, idx) => (
                  <motion.li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      color: colors.text.secondary,
                    }}
                    variants={fadeInUp}
                  >
                    <motion.span
                      style={{
                        color: colors.primary.light,
                        fontSize: typography.fontSize.xl,
                        marginTop: "2px",
                      }}
                      whileHover={{ x: 5 }}
                    >
                      →
                    </motion.span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>
              <Link to="/realverse" style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="primary" size="lg">
                    Join RealVerse
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Visual */}
            <motion.div variants={fadeInRight}>
              <Card variant="elevated" padding="none">
                <motion.div
                  style={{
                    padding: spacing.xl,
                    background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
                    borderRadius: borderRadius.xl,
                    minHeight: "400px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: spacing.lg,
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    style={{
                      fontSize: typography.fontSize["6xl"],
                      marginBottom: spacing.md,
                    }}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    📊
                  </motion.div>
                  <div
                    style={{
                      ...typography.h3,
                      color: colors.text.primary,
                      textAlign: "center",
                    }}
                  >
                    RealVerse Dashboard
                  </div>
                  <div
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      textAlign: "center",
                      maxWidth: "300px",
                    }}
                  >
                    Your complete football management platform
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Fixtures & Results */}
      <AnimatedSection
        id="fixtures"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <motion.div
          style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            style={{
              display: "inline-block",
              padding: `${spacing.xs} ${spacing.md}`,
              background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
              borderRadius: borderRadius.full,
              marginBottom: spacing.lg,
            }}
          >
            <span style={{ ...typography.overline, color: colors.accent.main }}>
              COMPETITIVE FOOTBALL
            </span>
          </motion.div>
          <h2
            style={{
              ...typography.h1,
              color: colors.text.primary,
            }}
          >
            Fixtures & Results
          </h2>
        </motion.div>

        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: spacing["2xl"],
          }}
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Upcoming Fixtures */}
          <motion.div variants={fadeInLeft}>
            <h3
              style={{
                ...typography.h3,
                color: colors.text.primary,
                marginBottom: spacing.lg,
              }}
            >
              Upcoming Fixtures
            </h3>
            {fixturesLoading ? (
              <Card variant="outlined" padding="lg">
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    textAlign: "center",
                  }}
                >
                  Loading fixtures...
                </div>
              </Card>
            ) : upcomingFixtures.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {upcomingFixtures.map((fixture, idx) => (
                  <motion.div
                    key={fixture.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card variant="elevated" padding="md">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: spacing.md,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              ...typography.overline,
                              color: colors.accent.main,
                              marginBottom: spacing.xs,
                            }}
                          >
                            {formatDate(fixture.matchDate)} • {fixture.matchTime}
                          </div>
                          <div
                            style={{
                              ...typography.h4,
                              color: colors.text.primary,
                              marginBottom: spacing.xs,
                            }}
                          >
                            vs {fixture.opponent}
                          </div>
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.text.muted,
                            }}
                          >
                            {fixture.matchType} • {fixture.venue}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card variant="elevated" padding="xl">
                <motion.div
                  style={{
                    textAlign: "center",
                    padding: spacing.lg,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    style={{ 
                      fontSize: "48px", 
                      marginBottom: spacing.md,
                      opacity: 0.6,
                    }}
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⚽
                  </motion.div>
                  <div
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Stay Tuned for Upcoming Matches
                  </div>
                  <div
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    New fixtures will be announced soon
                  </div>
                </motion.div>
              </Card>
            )}
          </motion.div>

          {/* Recent Results */}
          <motion.div variants={fadeInRight}>
            <h3
              style={{
                ...typography.h3,
                color: colors.text.primary,
                marginBottom: spacing.lg,
              }}
            >
              Recent Results
            </h3>
            {fixturesLoading ? (
              <Card variant="outlined" padding="lg">
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    textAlign: "center",
                  }}
                >
                  Loading results...
                </div>
              </Card>
            ) : recentResults.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {recentResults.map((result, idx) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card variant="elevated" padding="md">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: spacing.md,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              ...typography.overline,
                              color: colors.text.muted,
                              marginBottom: spacing.xs,
                            }}
                          >
                            {formatDate(result.matchDate)}
                          </div>
                          <div
                            style={{
                              ...typography.h4,
                              color: colors.text.primary,
                              marginBottom: spacing.xs,
                            }}
                          >
                            vs {result.opponent}
                          </div>
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.text.muted,
                            }}
                          >
                            {result.matchType} • {result.venue}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card variant="elevated" padding="xl">
                <motion.div
                  style={{
                    textAlign: "center",
                    padding: spacing.lg,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    style={{ 
                      fontSize: "48px", 
                      marginBottom: spacing.md,
                      opacity: 0.6,
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🏆
                  </motion.div>
                  <div
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    Results Coming Soon
                  </div>
                  <div
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    Match results will appear here
                  </div>
                </motion.div>
              </Card>
            )}
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* News / Stories */}
      <AnimatedSection
        id="news"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              style={{
                display: "inline-block",
                padding: `${spacing.xs} ${spacing.md}`,
                background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
              }}
            >
              <span style={{ ...typography.overline, color: colors.accent.main }}>
                STAY UPDATED
              </span>
            </motion.div>
            <h2
              style={{
                ...typography.h1,
                color: colors.text.primary,
              }}
            >
              Latest News & Updates
            </h2>
          </motion.div>
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: spacing.xl,
            }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {mockNews.map((news, idx) => (
              <motion.div
                key={news.id}
                variants={scaleIn}
                whileHover={{ y: -10 }}
              >
                <Card variant="elevated" padding="none">
                  {news.imageUrl && (
                    <motion.div
                      style={{
                        width: "100%",
                        height: "200px",
                        overflow: "hidden",
                        borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img
                        src={news.imageUrl}
                        alt={news.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </motion.div>
                  )}
                  <div style={{ padding: spacing.lg }}>
                    <div
                      style={{
                        ...typography.overline,
                        color: colors.accent.main,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {news.category} • {formatDate(news.date)}
                    </div>
                    <h3
                      style={{
                        ...typography.h4,
                        color: colors.text.primary,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {news.title}
                    </h3>
                    <p
                      style={{
                        ...typography.body,
                        color: colors.text.muted,
                        fontSize: typography.fontSize.sm,
                        marginBottom: spacing.md,
                      }}
                    >
                      {news.summary}
                    </p>
                    <motion.a
                      href="#"
                      style={{
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                        color: colors.primary.light,
                        textDecoration: "none",
                        fontWeight: typography.fontWeight.semibold,
                      }}
                      whileHover={{ x: 5, color: colors.primary.main }}
                    >
                      Read more →
                    </motion.a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* CTA Strip */}
      <AnimatedSection
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
        }}
      >
        <motion.div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            style={{
              ...typography.h1,
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}
          >
            Ready to Chase Your Legacy?
          </h2>
          <p
            style={{
              ...typography.body,
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              marginBottom: spacing["2xl"],
            }}
          >
            Join our academy, connect with RealVerse, and become part of Bengaluru's football
            future.
          </p>
          <motion.div
            style={{
              display: "flex",
              gap: spacing.lg,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={scaleIn}>
              <Link to="/realverse/join" style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="primary" size="lg">
                    Join RealVerse Academy
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            <motion.div variants={scaleIn}>
              <a href="#academy" style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="secondary" size="lg">
                    Explore Academy
                  </Button>
                </motion.div>
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Footer */}
      <footer
        id="contact"
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 100%)`,
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: spacing["2xl"],
              marginBottom: spacing["2xl"],
            }}
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Club Info */}
            <motion.div variants={fadeInUp}>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
                <img
                  src="/fcrb-logo.png"
                  alt="FC Real Bengaluru"
                  className="logo-transparent-dark"
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "contain",
                  }}
                />
                <div>
                  <div
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                    }}
                  >
                    FC Real Bengaluru
                  </div>
                  <div
                    style={{
                      ...typography.caption,
                      color: colors.accent.main,
                      fontSize: typography.fontSize.xs,
                    }}
                  >
                    {clubInfo.tagline}
                  </div>
                </div>
              </div>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.7,
                }}
              >
                {clubInfo.contact.address}
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={fadeInUp}>
              <h4
                style={{
                  ...typography.h5,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Quick Links
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.sm,
                }}
              >
                {[
                  { label: "Fixtures & Results", href: "/#fixtures" },
                  { label: "Academy", href: "/#academy" },
                  { label: "RealVerse", href: "/realverse" },
                  { label: "Contact", href: "/#contact" },
                ].map((link, idx) => (
                  <motion.a
                    key={idx}
                    href={link.href}
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.muted,
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                    whileHover={{ x: 5, color: colors.text.secondary }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div variants={fadeInUp}>
              <h4
                style={{
                  ...typography.h5,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Contact
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.sm,
                }}
              >
                <div
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.muted,
                  }}
                >
                  {clubInfo.contact.email}
                </div>
                <div
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.muted,
                  }}
                >
                  {clubInfo.contact.phone}
                </div>
              </div>
            </motion.div>

            {/* Social */}
            <motion.div variants={fadeInUp}>
              <h4
                style={{
                  ...typography.h5,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Follow Us
              </h4>
              <div
                style={{
                  display: "flex",
                  gap: spacing.md,
                }}
              >
                {[
                  { name: "Instagram", href: clubInfo.social.instagram, icon: "📷" },
                  { name: "YouTube", href: clubInfo.social.youtube, icon: "▶️" },
                  { name: "Facebook", href: clubInfo.social.facebook, icon: "👥" },
                ].map((social, idx) => (
                  <motion.a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: borderRadius.md,
                      textDecoration: "none",
                      fontSize: typography.fontSize.lg,
                      transition: "all 0.2s ease",
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      background: "rgba(255, 255, 255, 0.2)",
                      y: -5
                    }}
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            style={{
              paddingTop: spacing.xl,
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
              textAlign: "center",
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                ...typography.caption,
                color: colors.text.muted,
                fontSize: typography.fontSize.xs,
              }}
            >
              © {new Date().getFullYear()} FC Real Bengaluru. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

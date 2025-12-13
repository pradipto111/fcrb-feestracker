import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import OurCentresSection from "../components/OurCentresSection";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import { clubInfo, teams, mockNews, NewsItem } from "../data/club";
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
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });

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
          paddingTop: bridge ? "150px" : (style?.paddingTop || "100px"),
          paddingBottom: bridge ? "150px" : (style?.paddingBottom || "100px"),
          zIndex: bridge ? 2 : 1,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          {children}
        </div>
      </motion.section>
    </>
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
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

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

  // Fetch featured products
  useEffect(() => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (timeString: string) => {
    return timeString || "TBD";
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      <PublicHeader />

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
          paddingTop: "80px",
          overflow: "hidden",
          opacity: heroOpacity,
          scale: heroScale,
        }}
      >
        {/* Multi-layer Background System */}
        {/* Layer 1: Background Video (desktop only) - No black bars, no thumbnail */}
        <motion.iframe
          src={`${heroAssets.backgroundVideoEmbed}&fs=0&cc_load_policy=0`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "177.77777778vh",
            height: "100vh",
            minWidth: "100%",
            minHeight: "56.25vw",
            transform: "translate(-50%, -50%) scale(1.2)",
            border: "none",
            pointerEvents: "none",
            zIndex: 0,
            opacity: 0.7,
            overflow: "hidden",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2 }}
          allow="autoplay; encrypted-media; picture-in-picture"
          frameBorder="0"
          allowFullScreen={false}
        />
        
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

        {/* Layer 4: Animated gradient overlays */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: heroAssets.overlayGradientLeft,
            zIndex: 1,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

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

        {/* Content Container */}
        <div
          style={{
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            padding: `0 ${spacing.xl}`,
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          {/* Enhanced Text Content */}
          <motion.div 
            variants={heroContentVariants}
            style={{
              maxWidth: "800px",
              paddingBottom: spacing["2xl"],
            }}
          >
            {/* Badge/Overline with animation */}
            <motion.div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.sm,
                padding: `${spacing.xs} ${spacing.md}`,
                background: "rgba(0, 224, 255, 0.1)",
                border: `1px solid ${colors.accent.main}`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
                backdropFilter: "blur(10px)",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: colors.accent.main,
                  boxShadow: `0 0 10px ${colors.accent.main}`,
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <span
                style={{
                  ...typography.overline,
                  color: colors.accent.main,
                  letterSpacing: "0.15em",
                  fontSize: typography.fontSize.sm,
                }}
              >
                WE ARE FC REAL BENGALURU
              </span>
            </motion.div>

            {/* Main Headline with word-by-word animation */}
            <motion.h1
              style={{
                ...typography.display,
                fontSize: `clamp(2.5rem, 8vw, 5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                lineHeight: 1.1,
                fontWeight: typography.fontWeight.bold,
                textShadow: "0 4px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 224, 255, 0.3)",
              }}
              variants={headingVariants}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                It's more than a club.
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                style={{ 
                  color: colors.accent.main,
                  display: "inline-block",
                }}
              >
                FC Real Bengaluru.
              </motion.span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              style={{
                ...typography.body,
                fontSize: `clamp(${typography.fontSize.base}, 1.5vw, ${typography.fontSize.lg})`,
                color: colors.accent.main,
                marginBottom: spacing.sm,
                fontWeight: typography.fontWeight.semibold,
                letterSpacing: "0.1em",
                textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)",
              }}
              variants={subheadingVariants}
            >
              Tradition Pride & Future
            </motion.p>

            {/* Enhanced Description */}
            <motion.p
              style={{
                ...typography.body,
                fontSize: `clamp(${typography.fontSize.lg}, 2vw, ${typography.fontSize.xl})`,
                color: colors.text.secondary,
                marginBottom: spacing["2xl"],
                lineHeight: 1.8,
                maxWidth: "700px",
                textShadow: "0 2px 15px rgba(0, 0, 0, 0.5)",
              }}
              variants={subheadingVariants}
            >
              Where passion meets community, join the journey to the top of Indian football—building a legacy of excellence, community, and sustainable growth.
            </motion.p>

            {/* Enhanced CTA Buttons with icons */}
            <motion.div
              style={{ 
                display: "flex", 
                gap: spacing.md, 
                flexWrap: "wrap",
                marginBottom: spacing["2xl"],
              }}
              variants={buttonVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={viewportOnce}
            >
              <Link to="#teams" style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={primaryButtonHover}
                  whileTap={primaryButtonTap}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Button 
                    variant="primary" 
                    size="lg"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.accent.light} 100%)`,
                      boxShadow: `0 4px 20px rgba(0, 224, 255, 0.4)`,
                      fontSize: typography.fontSize.lg,
                      padding: `${spacing.sm} ${spacing.xl}`,
                    }}
                  >
                    <span>Explore Our Teams</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                      style={{ marginLeft: spacing.xs }}
                    >
                      →
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
              <Link to="#matches" style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={secondaryButtonHover}
                  whileTap={secondaryButtonTap}
                >
                  <Button 
                    variant="secondary" 
                    size="lg"
                    style={{
                      fontSize: typography.fontSize.lg,
                      padding: `${spacing.md} ${spacing.xl}`,
                    }}
                  >
                    View Fixtures & Results
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: spacing.xl,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: spacing.xs,
            cursor: "pointer",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={() => {
            document.getElementById("pyramid")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <motion.span
            style={{
              color: colors.text.muted,
              fontSize: typography.fontSize.sm,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Scroll to explore
          </motion.span>
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: colors.accent.main }}
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

      {/* 3. OUR FOOTBALL PYRAMID */}
      <InfinitySection
        id="pyramid"
        bridge={true}
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.space.nebula,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simplified background - single layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${centresAssets.genericPitchBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            variants={headingVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
          >
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Our Football Pyramid
            </h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.lg,
              }}
              variants={subheadingVariants}
            >
              From grassroots to Super Division, built on merit and work ethic.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            {[
              { level: "Super Division", desc: "First Team - Top tier competition" },
              { level: "Karnataka B Division", desc: "Senior competitive level" },
              { level: "Karnataka C Division", desc: "Development competitive" },
              { level: "Karnataka D Division", desc: "Entry competitive level" },
              { level: "Youth Leagues", desc: "U13, U15, U17, U19 development" },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                {...getStaggeredCard(idx)}
                whileHover={cardHover}
                style={{
                  padding: spacing.lg,
                  background: colors.surface.card,
                  borderRadius: borderRadius.xl,
                  border: `2px solid ${idx === 0 ? colors.accent.main : "rgba(255, 255, 255, 0.1)"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.md,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: idx === 0 ? colors.accent.main : colors.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.text.onPrimary,
                    fontWeight: typography.fontWeight.bold,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                    }}
                  >
                    {step.level}
                  </div>
                  <div
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </InfinitySection>

      {/* 4. MATCH CENTRE */}
      <InfinitySection
        id="matches"
        bridge={true}
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.surface.section,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simplified background - single layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${newsAssets.news1.medium})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: spacing["2xl"] }}>
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Match Centre
            </h2>
            <p
              style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.lg,
              }}
            >
              Upcoming fixtures and recent results
            </p>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: spacing.md,
              justifyContent: "center",
              marginBottom: spacing.xl,
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
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            {fixturesLoading ? (
              <div style={{ textAlign: "center", color: colors.text.muted }}>
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
                      {/* Subtle background image */}
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
                      {/* Team logos */}
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
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "contain",
                          }}
                        />
                        <span style={{ color: colors.text.muted, fontSize: typography.fontSize.sm }}>vs</span>
                        <img
                          src={matchImage.opponent}
                          alt={match.opponent}
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "contain",
                            borderRadius: borderRadius.md,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            ...typography.h4,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                          }}
                        >
                          {match.opponent}
                        </div>
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                          }}
                        >
                          {match.matchType} • {match.venue}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <div
                          style={{
                            ...typography.body,
                            color: colors.text.secondary,
                            fontWeight: typography.fontWeight.semibold,
                          }}
                        >
                          {formatDate(match.matchDate)}
                        </div>
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                          }}
                        >
                          {formatTime(match.matchTime)}
                        </div>
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
        </div>
      </InfinitySection>

      {/* 5. TEAMS OVERVIEW */}
      <InfinitySection
        id="teams"
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.space.nebula,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            variants={headingVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
          >
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Our Teams
            </h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.lg,
              }}
              variants={subheadingVariants}
            >
              Competing across multiple divisions and age groups
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: spacing.xl,
              width: "100%",
            }}
          >
            {[
              teams.find((t) => t.id === "senior-men"),
              teams.find((t) => t.id === "women"),
              teams.find((t) => t.id === "u21"),
            ]
              .filter(Boolean)
              .map((team, idx) => (
                <motion.div
                  key={team!.id}
                  {...getStaggeredCard(idx)}
                  whileHover={cardHover}
                  style={{
                    background: colors.surface.card,
                    borderRadius: borderRadius.xl,
                    overflow: "hidden",
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    cursor: "pointer",
                  }}
                >
                  <motion.div
                    style={{
                      height: "200px",
                      background: `linear-gradient(135deg, rgba(4, 61, 208, 0.8) 0%, rgba(255, 169, 0, 0.8) 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    variants={imageVariants}
                  >
                    {/* Background team image */}
                    <motion.img
                      src={
                        idx === 0
                          ? galleryAssets.actionShots[0].medium
                          : idx === 1
                          ? galleryAssets.actionShots[2].medium
                          : galleryAssets.actionShots[1].medium
                      }
                      alt={team!.name}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: 0.3,
                      }}
                    />
                    {/* Overlay gradient */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: `linear-gradient(135deg, rgba(4, 61, 208, 0.7) 0%, rgba(255, 169, 0, 0.7) 100%)`,
                      }}
                    />
                    {/* Team logo/name overlay */}
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: spacing.sm,
                      }}
                    >
                      <motion.img
                        src={clubAssets.logo.withStroke}
                        alt={team!.name}
                        style={{
                          width: "80px",
                          height: "auto",
                          objectFit: "contain",
                          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                        }}
                        variants={imageVariants}
                      />
                      <div
                        style={{
                          ...typography.h4,
                          color: colors.text.onPrimary,
                          textAlign: "center",
                          fontWeight: typography.fontWeight.bold,
                          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        }}
                      >
                        {team!.name}
                      </div>
                    </div>
                  </motion.div>
                  <div style={{ padding: spacing.lg }}>
                    <div
                      style={{
                        ...typography.h4,
                        color: colors.text.primary,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {team!.tagline}
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.muted,
                        marginBottom: spacing.md,
                      }}
                    >
                      {team!.description}
                    </div>
                    <motion.div
                      whileHover={secondaryButtonHover}
                      whileTap={secondaryButtonTap}
                    >
                      <Button variant="secondary" size="sm" fullWidth>
                        View Squad →
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </InfinitySection>

      {/* 6. CLUB PHILOSOPHY & CULTURE */}
      <InfinitySection
        id="philosophy"
        bridge={true}
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.surface.section,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simplified background - single layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${academyAssets.coachTalk})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
              gap: spacing["2xl"],
              alignItems: "center",
              width: "100%",
            }}
          >
            <motion.div variants={headingVariants}>
              <h2
                style={{
                  ...typography.h2,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                }}
              >
                Club Philosophy & Culture
              </h2>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  marginBottom: spacing.xl,
                  lineHeight: 1.6,
                }}
              >
                {clubInfo.philosophy}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {[
                  "Merit-based pathway",
                  "Modern training & load management",
                  "Data-backed decisions",
                  "Transparent communication with players & parents",
                ].map((point, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: colors.primary.main,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ color: colors.text.onPrimary, fontSize: "12px" }}>✓</span>
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                      }}
                    >
                      {point}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: spacing.xl }}>
                <Link to="/brochure">
                  <Button variant="primary" size="md">
                    Read Our Club Brochure →
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              {...getStaggeredCard(1)}
              whileHover={cardHover}
              style={{
                background: colors.surface.card,
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
              }}
            >
              <div
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                  textAlign: "center",
                }}
              >
                RealVerse Integration
              </div>
              <div
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  textAlign: "center",
                  marginBottom: spacing.lg,
                }}
              >
                Our digital backbone powers player development, attendance tracking, and transparent communication.
              </div>
              <motion.div
                style={{
                  height: "200px",
                  borderRadius: borderRadius.lg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  position: "relative",
                  overflow: "hidden",
                  background: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(255, 169, 0, 0.2) 100%)`,
                }}
                variants={imageVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={viewportOnce}
              >
                {/* Background training image */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url(${academyAssets.trainingShot})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.3,
                    filter: "blur(5px)",
                  }}
                />
                {/* Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg, rgba(4, 61, 208, 0.6) 0%, rgba(255, 169, 0, 0.4) 100%)`,
                  }}
                />
                {/* RealVerse logo/text */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <img
                    src={clubAssets.logo.white}
                    alt="RealVerse"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                      filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
                    }}
                  />
                  <div
                    style={{
                      ...typography.body,
                      color: colors.text.onPrimary,
                      textAlign: "center",
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    RealVerse Dashboard
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </InfinitySection>

      {/* 7. ACADEMY & PLAYER PATHWAY */}
      <InfinitySection
        id="academy"
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.space.nebula,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simplified background - single layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${academyAssets.drillsWideShot})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            variants={headingVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
          >
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Academy & Player Development
            </h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.lg,
                maxWidth: "800px",
                margin: "0 auto",
              }}
              variants={subheadingVariants}
            >
              Integrated with club teams and connected to the pathway described above. 
              Our academy provides structured development from grassroots to professional football.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: spacing.lg,
              marginBottom: spacing.xl,
              width: "100%",
            }}
          >
            {[
              { title: "Non-Residential Program", desc: "Flexible training schedules for local players" },
              { title: "Residential Program", desc: "Intensive development with accommodation" },
              { title: "High-Performance Streams", desc: "Elite training for competitive players" },
            ].map((program, idx) => (
              <motion.div
                key={idx}
                {...getStaggeredCard(idx)}
                whileHover={cardHover}
                style={{
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Card variant="elevated" padding="none" style={{ height: "100%" }}>
                  {/* Program image background */}
                  <div
                    style={{
                      height: "180px",
                      backgroundImage: `url(${academyAssets.trainingShots[idx % academyAssets.trainingShots.length]})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                    }}
                  >
                    {/* Overlay gradient */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, rgba(4, 61, 208, 0.7) 0%, rgba(255, 169, 0, 0.6) 100%)`,
                      }}
                    />
                  </div>
                  <div style={{ padding: spacing.lg }}>
                    <div
                      style={{
                        ...typography.h4,
                        color: colors.text.primary,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {program.title}
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.muted,
                        marginBottom: spacing.md,
                      }}
                    >
                      {program.desc}
                    </div>
                    <motion.div
                      whileHover={secondaryButtonHover}
                      whileTap={secondaryButtonTap}
                    >
                      <Button variant="secondary" size="sm" fullWidth>
                        Learn More →
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div style={{ textAlign: "center" }}>
            <Link to="/realverse/join">
              <motion.div
                whileHover={primaryButtonHover}
                whileTap={primaryButtonTap}
              >
                <Button variant="primary" size="lg">
                  Trial / Join Us →
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </InfinitySection>

      {/* 8. OUR CENTRES SECTION */}
      <OurCentresSection />

      {/* 9. REALVERSE CTA */}
      <InfinitySection
        id="realverse"
        bridge={true}
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.surface.section,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${realverseAssets.dashboards[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
            filter: "blur(8px)",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            variants={sectionVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
            style={{
              background: colors.surface.card,
              borderRadius: borderRadius["3xl"],
              padding: spacing["2xl"],
              textAlign: "center",
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Inner background image */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${realverseAssets.dashboards[1]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.18,
                filter: "blur(6px)",
                zIndex: 0,
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
            <motion.h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
              variants={headingVariants}
            >
              RealVerse — The Club's Digital Backbone
            </motion.h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                maxWidth: "700px",
                margin: `0 auto ${spacing.xl}`,
                lineHeight: 1.6,
              }}
              variants={subheadingVariants}
            >
              Player & parent portal for attendance & fees tracking, feedback & reports, 
              and internal operations for the club. Built with modern technology for transparency and efficiency.
            </motion.p>
            <motion.div
              style={{
                display: "flex",
                gap: spacing.md,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <Link to="/realverse/login">
                <motion.div
                  whileHover={primaryButtonHover}
                  whileTap={primaryButtonTap}
                >
                  <Button variant="primary" size="lg">
                    Player / Parent Login
                  </Button>
                </motion.div>
              </Link>
              <Link to="/realverse/login">
                <motion.div
                  whileHover={secondaryButtonHover}
                  whileTap={secondaryButtonTap}
                >
                  <Button variant="secondary" size="lg">
                    Staff Login
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            </div>
          </motion.div>
        </div>
      </InfinitySection>

      {/* 10. SHOP HIGHLIGHT */}
      <InfinitySection
        id="shop"
        bridge={true}
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.space.nebula,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simplified background - single layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${shopAssets.jerseys[0]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.1,
            filter: "blur(15px)",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            variants={headingVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
          >
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Shop FC Real Bengaluru
            </h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.lg,
              }}
              variants={subheadingVariants}
            >
              Official merchandise and club gear
            </motion.p>
          </motion.div>

          {products.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))",
              gap: spacing.xl,
              marginBottom: spacing.xl,
              width: "100%",
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
                  }}
                >
                  <div
                    style={{
                      height: "200px",
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
            </motion.div>
          ) : (
            <div style={{ textAlign: "center", color: colors.text.muted, padding: spacing.xl }}>
              No products available at the moment.
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <Link to="/shop">
              <motion.div
                whileHover={primaryButtonHover}
                whileTap={primaryButtonTap}
              >
                <Button variant="primary" size="lg">
                  View Full Shop →
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </InfinitySection>

      {/* 11. CLUB BROCHURE CTA */}
      <InfinitySection
        id="brochure-cta"
        bridge={true}
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.surface.section,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simplified background - single layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${getGalleryImage(0, 'medium')})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Card variant="glass" padding="lg" style={{ textAlign: "center" }}>
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              New to FC Real Bengaluru?
            </h2>
            <p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                maxWidth: "700px",
                margin: `0 auto ${spacing.xl}`,
                lineHeight: 1.6,
              }}
            >
              Understand our club, philosophy, pathway, and structure in one place.
            </p>
            <div
              style={{
                display: "flex",
                gap: spacing.md,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link to="/brochure">
                <Button variant="primary" size="lg">
                  View Club Brochure
                </Button>
              </Link>
              <Link to="/brochure">
                <Button variant="secondary" size="lg">
                  Download as PDF
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </InfinitySection>

      {/* 12. NEWS / MEDIA */}
      <InfinitySection
        id="news"
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.space.nebula,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Simplified background - single layer */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${galleryAssets.actionShots[2].medium})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            variants={headingVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
          >
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Latest News & Updates
            </h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.lg,
              }}
              variants={subheadingVariants}
            >
              Stay updated with club news, match reports, and announcements
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: spacing.xl,
              width: "100%",
            }}
          >
            {mockNews.slice(0, 3).map((item, idx) => {
              const newsImage = getNewsImage(idx, 'medium');
              
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
                  }}
                >
                  <motion.div
                    style={{
                      height: "200px",
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
                    {/* Gradient overlay for text readability */}
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
                  <div
                    style={{
                      ...typography.overline,
                      color: colors.accent.main,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {item.category}
                  </div>
                  <div
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      marginBottom: spacing.md,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {item.summary}
                  </div>
                  <div
                    style={{
                      ...typography.caption,
                      color: colors.text.disabled,
                    }}
                  >
                    {formatDate(item.date)}
                  </div>
                </div>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </InfinitySection>

      {/* 12. GALLERY SECTION */}
      <InfinitySection
        id="gallery"
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.space.nebula,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
            variants={headingVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
          >
            <h2
              style={{
                ...typography.h2,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Our Gallery
            </h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.lg,
              }}
              variants={subheadingVariants}
            >
              Moments from training, matches, and club life
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
              gap: spacing.md,
              width: "100%",
            }}
          >
            {galleryAssets.actionShots.map((image, idx) => (
              <motion.div
                key={idx}
                {...getStaggeredCard(idx)}
                whileHover={cardHover}
                style={{
                  borderRadius: borderRadius.xl,
                  overflow: "hidden",
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  cursor: "pointer",
                  aspectRatio: "4/3",
                  position: "relative",
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
        </div>
      </InfinitySection>

      {/* 13. FOOTER */}
      <footer
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: colors.surface.dark,
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: spacing.xl,
              marginBottom: spacing.xl,
            }}
          >
            <div>
              <img
                src={clubAssets.logo.crestCropped}
                alt="FC Real Bengaluru"
                style={{ width: "120px", height: "auto", marginBottom: spacing.md }}
              />
              <p
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  fontSize: typography.fontSize.sm,
                }}
              >
                {clubInfo.description}
              </p>
            </div>
            <div>
              <h4
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Quick Links
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                {[
                  { label: "Club", to: "#philosophy" },
                  { label: "Teams", to: "#teams" },
                  { label: "Academy", to: "#academy" },
                  { label: "RealVerse", to: "#realverse" },
                  { label: "Shop", to: "#shop" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.to}
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      textDecoration: "none",
                      fontSize: typography.fontSize.sm,
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary.light)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.text.muted)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Contact
              </h4>
              <div
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  fontSize: typography.fontSize.sm,
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.sm,
                }}
              >
                <div>{clubInfo.contact.phone}</div>
                <div>{clubInfo.contact.email}</div>
                <div>{clubInfo.contact.address}</div>
              </div>
            </div>
            <div>
              <h4
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Follow Us
              </h4>
              <div style={{ display: "flex", gap: spacing.md }}>
                {[
                  { name: "Instagram", url: clubInfo.social.instagram },
                  { name: "YouTube", url: clubInfo.social.youtube },
                  { name: "Facebook", url: clubInfo.social.facebook },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      textDecoration: "none",
                      fontSize: typography.fontSize.sm,
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent.main)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = colors.text.muted)}
                  >
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              paddingTop: spacing.xl,
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
              textAlign: "center",
              ...typography.caption,
              color: colors.text.disabled,
            }}
          >
            © {new Date().getFullYear()} FC Real Bengaluru. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
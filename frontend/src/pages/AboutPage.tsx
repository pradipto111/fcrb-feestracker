/**
 * About FC Real Bengaluru Page
 * System-level redesign following premium design uniformity & narrative discipline
 * 
 * 7 foundational rules:
 * 1. Section-based storytelling (one question per section)
 * 2. One background asset per section (different for each)
 * 3. Strict content hierarchy (eyebrow → headline → paragraph → UI → CTA)
 * 4. CTA discipline (max one per section, secondary style)
 * 5. Glassmorphism & card system (consistent)
 * 6. Spacing & rhythm (8-point system)
 * 7. Design intent (calm, credible, long-term, community-first)
 */

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { SponsorLogoWall } from "../components/home/SponsorLogoWall";
import {
  ArrowRightIcon,
  StarIcon,
  FireIcon,
  MedalIcon,
  FootballIcon,
  GraduationCapIcon,
  UsersIcon,
  ShieldIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YouTubeIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
} from "../components/icons/IconSet";
import { galleryAssets, heroAssets, clubAssets } from "../config/assets";
import { SPONSOR_BENEFITS } from "../data/fanclubBenefits";
import { clubInfo } from "../data/club";

const MOBILE_BREAKPOINT = 768;

const AboutPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
  const [expandedFounder, setExpandedFounder] = useState<string | null>(null);

  useEffect(() => {
    document.title = "About FC Real Bengaluru";
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20, filter: "blur(6px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  };

  // Section wrapper with background asset treatment
  const SectionWrapper: React.FC<{
    children: React.ReactNode;
    backgroundImage?: string;
    backgroundVideo?: string;
    sectionId?: string;
    hideVignette?: boolean;
    hideDarkOverlay?: boolean;
  }> = ({ children, backgroundImage, backgroundVideo, sectionId, hideVignette = false, hideDarkOverlay = false }) => {
    return (
      <section
        id={sectionId}
        style={{
          position: "relative",
          minHeight: "100vh",
          padding: isMobile ? `${spacing["4xl"]} ${spacing.lg}` : `${spacing["4xl"]} ${spacing.xl}`,
          paddingTop: isMobile ? "120px" : "140px",
          overflow: "hidden",
        }}
      >
        {/* Background Asset */}
        {backgroundVideo ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              overflow: "hidden",
            }}
          >
            <iframe
              src={backgroundVideo}
              title="Section background"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100vw",
                height: "56.25vw",
                minWidth: "177.77777778vh",
                minHeight: "100vh",
                transform: "translate(-50%, -50%) scale(1.2)",
                border: "none",
                opacity: 0.4,
              }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
            />
          </div>
        ) : backgroundImage ? (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              zIndex: 0,
            }}
          />
        ) : null}

        {/* Dark overlay + vignette + color grading (consistent treatment) */}
        {!hideDarkOverlay && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg,
                rgba(5, 11, 32, 0.88) 0%,
                rgba(10, 22, 51, 0.82) 50%,
                rgba(5, 11, 32, 0.92) 100%)`,
              zIndex: 1,
            }}
          />
        )}
        {!hideVignette && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at center, transparent 0%, rgba(5, 11, 32, 0.6) 100%)`,
              zIndex: 2,
            }}
          />
        )}

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            maxWidth: "1400px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          {children}
        </div>
      </section>
    );
  };

  return (
    <div
      data-realverse-page
      style={{
        minHeight: "100vh",
        background: colors.club.deep,
        position: "relative",
        overflowX: "hidden",
        overflowY: "visible",
        width: "100%",
        maxWidth: "100vw",
      }}
    >
      {/* Fixed header that stays visible */}
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

      {/* SECTION 1 — HERO: WHO WE ARE */}
      <SectionWrapper
        backgroundVideo={heroAssets.backgroundVideoEmbed}
        sectionId="hero"
      >
        <motion.div {...fadeInUp} style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.15em",
              marginBottom: spacing.sm,
            }}
          >
            ABOUT FC REAL BENGALURU
          </div>
          <h1
            style={{
              ...typography.h1,
              fontSize: `clamp(2.6rem, 6vw, 5.2rem)`,
              color: colors.text.primary,
              marginBottom: spacing.md,
              lineHeight: 1.08,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            One city. One club. One shared ambition.
          </h1>
          <p
            style={{
              ...typography.body,
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              maxWidth: "70ch",
              margin: "0 auto",
              lineHeight: 1.85,
              marginBottom: spacing.lg,
            }}
          >
            FC Real Bengaluru is a Bengaluru-based football club competing across KSFA leagues, built on community-first values and long-term ambition. From grassroots training to Super Division targets, we use modern coaching and data to help players rise the right way.
          </p>
          <motion.button
            type="button"
            onClick={() => {
              const element = document.getElementById("origin-story");
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...heroCTAPillStyles.base,
              ...heroCTAPillStyles.blue,
              padding: `${spacing.md} ${spacing.xl}`,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Meet the Club
              <ArrowRightIcon size={16} color={colors.primary.main} />
            </span>
          </motion.button>
        </motion.div>
      </SectionWrapper>

      {/* SECTION 2 — ORIGIN STORY: FROM IDEA TO CLUB */}
      <SectionWrapper
        backgroundImage={galleryAssets.actionShots[0]?.medium || galleryAssets.actionShots[0]?.full}
        sectionId="origin-story"
      >
        <motion.div {...fadeInUp}>
          <div
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.15em",
              marginBottom: spacing.xs,
            }}
          >
            OUR STORY
          </div>
          <h2
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing.md,
            }}
          >
            From an idea to a long-term vision
          </h2>
          <p
            style={{
              ...typography.body,
              color: colors.text.secondary,
              maxWidth: "70ch",
              lineHeight: 1.85,
              marginBottom: spacing.xl,
            }}
          >
            FC Real Bengaluru started with a simple belief: Bengaluru deserves a club built on community, modern coaching, and clear pathways from grassroots to the highest levels. We're building a long-term project — competitive football powered by development, data, and detail.
          </p>
          <div
            style={{
              borderRadius: borderRadius["2xl"],
              border: "1px solid rgba(255,255,255,0.10)",
              ...glass.panel,
              padding: isMobile ? spacing.lg : spacing["2xl"],
              position: "relative",
              overflow: "hidden",
              marginBottom: spacing.xl,
            }}
          >
            <div aria-hidden="true" style={glass.overlayStrong} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.secondary,
                  lineHeight: 1.85,
                  margin: 0,
                }}
              >
                At the heart of our club lies a powerful culture, driven by a clear vision, an unwavering mission, and an inspiring motto. These principles guide every decision, every training session, and every interaction, shaping us into more than just a football club—we are a community united by shared ambition.
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: spacing.lg,
            }}
          >
            {/* Vision Card */}
            <div
              style={{
                borderRadius: borderRadius.card,
                ...glass.card,
                padding: spacing.cardPadding,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 18% 18%, ${colors.accent.main}14 0%, transparent 55%)`,
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ marginBottom: spacing.md }}>
                  <StarIcon size={26} color={colors.accent.main} />
                </div>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
                  Vision
                </h3>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  To be a leading force in Indian football, developing world-class talent while building a sustainable, community-driven club that inspires the next generation.
                </p>
              </div>
            </div>

            {/* Motto Card */}
            <div
              style={{
                borderRadius: borderRadius.card,
                ...glass.card,
                padding: spacing.cardPadding,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 18% 18%, ${colors.accent.main}14 0%, transparent 55%)`,
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ marginBottom: spacing.md }}>
                  <MedalIcon size={26} color={colors.accent.main} />
                </div>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
                  Motto
                </h3>
                <p
                  style={{
                    ...typography.h3,
                    color: colors.accent.main,
                    fontWeight: typography.fontWeight.bold,
                    margin: 0,
                  }}
                >
                  Chase Your Legacy
                </p>
              </div>
            </div>

            {/* Mission Card */}
            <div
              style={{
                borderRadius: borderRadius.card,
                ...glass.card,
                padding: spacing.cardPadding,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `radial-gradient(circle at 18% 18%, ${colors.primary.main}14 0%, transparent 55%)`,
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ marginBottom: spacing.md }}>
                  <FireIcon size={26} color={colors.primary.main} />
                </div>
                <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>
                  Mission
                </h3>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.sm,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Our mission is to develop young footballers through structured pathways, compete with integrity at all levels, and create a vibrant football culture that unites communities across Bengaluru and beyond.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* SECTION 3 — CORE PILLARS */}
      <SectionWrapper
        backgroundImage={galleryAssets.actionShots[2]?.medium || galleryAssets.actionShots[2]?.full}
        sectionId="pillars"
      >
        <motion.div {...fadeInUp}>
          <div
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.15em",
              marginBottom: spacing.xs,
            }}
          >
            OUR CORE PILLARS
          </div>
          <h2
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing.md,
            }}
          >
            Built on three connected pillars
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.lg,
              marginTop: spacing.xl,
            }}
          >
            {[
              {
                title: "Football Team",
                description: "Our senior team competes in the prestigious KSFA Super Division and BDFA Super Division, embodying the club's competitive spirit and tactical identity.",
                icon: <FootballIcon size={32} color={colors.primary.main} />,
                cta: "View fixtures & results",
                ctaLink: "/#content-stream",
                accent: colors.primary.main,
              },
              {
                title: "Football Academy",
                description: "The RealVerse Football Academy is the heart of our long-term vision. We provide structured youth development programs from U9 upwards, offering age-appropriate training and clear pathways to senior football.",
                icon: <GraduationCapIcon size={32} color={colors.accent.main} />,
                cta: "Explore coaching programs",
                ctaLink: "/programs",
                accent: colors.accent.main,
              },
              {
                title: "Fan Club",
                description: "The 'Blue Army' is more than just a fan base; it's the soul of FC Real Bengaluru. Our passionate supporters back the club through thick and thin, creating an electrifying atmosphere on and off the pitch.",
                icon: <UsersIcon size={32} color={colors.primary.main} />,
                cta: "Coming soon",
                ctaLink: "#",
                accent: colors.primary.main,
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  borderRadius: borderRadius.card,
                  ...glass.card,
                  padding: spacing.cardPadding,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 18% 18%, ${item.accent}14 0%, transparent 55%)`,
                    opacity: 0.95,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.lg,
                      marginBottom: spacing.md,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: borderRadius.card,
                        background: `${item.accent}14`,
                        border: `1px solid ${item.accent}40`,
                        display: "grid",
                        placeItems: "center",
                        boxShadow: `0 0 24px ${item.accent}20`,
                      }}
                    >
                      {item.icon}
                    </div>
                    <h3
                      style={{
                        ...typography.h4,
                        color: colors.text.primary,
                        margin: 0,
                        fontWeight: typography.fontWeight.bold,
                      }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      lineHeight: 1.7,
                      marginBottom: spacing.md,
                    }}
                  >
                    {item.description}
                  </p>
                  <Link to={item.ctaLink} style={{ textDecoration: "none", display: "inline-block" }}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        ...heroCTAPillStyles.base,
                        ...(item.accent === colors.primary.main ? heroCTAPillStyles.blue : heroCTAPillStyles.gold),
                        padding: `${spacing.sm} ${spacing.md}`,
                        display: "inline-flex",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {item.cta}
                        <ArrowRightIcon
                          size={14}
                          style={{
                            color: item.accent === colors.primary.main ? colors.primary.main : colors.accent.main,
                          }}
                        />
                      </span>
                    </motion.div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* SECTION 4 — LEADERSHIP */}
      <SectionWrapper
        backgroundImage={galleryAssets.actionShots[3]?.medium || galleryAssets.actionShots[3]?.full}
        sectionId="leadership"
      >
        <motion.div {...fadeInUp}>
          <div
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.15em",
              marginBottom: spacing.xs,
            }}
          >
            LEADERSHIP
          </div>
          <h2
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing.md,
            }}
          >
            Led by people who believe in the process
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: spacing.lg,
              marginTop: spacing.xl,
            }}
          >
            {[
              {
                name: "Sudhir Prabhu",
                role: "President",
                contribution: "Provides the overarching leadership and vision for FC Real Bengaluru.",
                detail:
                  "His commitment to the club's core values and his strategic guidance are crucial in driving our ambition to compete at the highest levels and build a lasting legacy in Indian football.",
              },
              {
                name: "Nitesh Sharma",
                role: "Technical Director & Head Coach",
                contribution: "The architect of FC Real Bengaluru's on-field philosophy.",
                detail:
                  "He oversees all technical aspects, from youth development pathways to senior team tactics, ensuring a consistent, modern, and data-driven approach to player progression.",
              },
              {
                name: "Dhruv Katyal",
                role: "Secretary",
                contribution: "Instrumental in shaping the club's strategic direction and ensuring seamless operations.",
                detail:
                  "His dedication to community engagement and long-term planning helps lay the groundwork for FC Real Bengaluru's sustainable growth and impact.",
              },
            ].map((founder) => (
              <div
                key={founder.name}
                style={{
                  borderRadius: borderRadius.card,
                  ...glass.card,
                  padding: spacing.cardPadding,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at 50% 0%, rgba(0,224,255,0.08) 0%, transparent 60%)",
                    opacity: 0.95,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      border: "2px solid rgba(255,255,255,0.10)",
                      margin: "0 auto",
                      marginBottom: spacing.md,
                      display: "grid",
                      placeItems: "center",
                      boxShadow: shadows.card,
                    }}
                  >
                    <ShieldIcon size={32} color={colors.primary.main} />
                  </div>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs, textAlign: "center" }}>
                    {founder.name}
                  </h3>
                  <div
                    style={{
                      ...typography.overline,
                      color: colors.accent.main,
                      letterSpacing: "0.12em",
                      marginBottom: spacing.sm,
                      textAlign: "center",
                    }}
                  >
                    {founder.role}
                  </div>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      lineHeight: 1.6,
                      marginBottom: spacing.sm,
                      textAlign: "center",
                    }}
                  >
                    {founder.contribution}
                  </p>
                  {expandedFounder === founder.name ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: spacing.sm }}
                    >
                      <p
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          fontSize: typography.fontSize.sm,
                          lineHeight: 1.6,
                          textAlign: "center",
                        }}
                      >
                        {founder.detail}
                      </p>
                      <button
                        type="button"
                        onClick={() => setExpandedFounder(null)}
                        style={{
                          marginTop: spacing.sm,
                          ...typography.caption,
                          color: colors.accent.main,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "center",
                          width: "100%",
                        }}
                      >
                        Show less
                      </button>
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExpandedFounder(founder.name)}
                      style={{
                        marginTop: spacing.sm,
                        ...typography.caption,
                        color: colors.accent.main,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      Learn more
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </SectionWrapper>

      {/* SECTION 5 — PARTNERS */}
      <SectionWrapper
        backgroundImage={galleryAssets.actionShots[0]?.medium || galleryAssets.actionShots[0]?.full}
        sectionId="partners"
      >
        <motion.div {...fadeInUp}>
          <div
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.15em",
              marginBottom: spacing.xs,
            }}
          >
            OUR PARTNERS
          </div>
          <h2
            style={{
              ...typography.h2,
              color: colors.text.primary,
              marginBottom: spacing.md,
            }}
          >
            Powered by shared belief
          </h2>
          <p
            style={{
              ...typography.body,
              color: colors.text.secondary,
              maxWidth: "70ch",
              lineHeight: 1.8,
              marginBottom: spacing.xl,
            }}
          >
            Our journey is powered by the unwavering support of our partners. Their commitment enables us to invest in talent development, maintain facilities, and expand our community initiatives.
          </p>
          <div
            style={{
              borderRadius: borderRadius.card,
              ...glass.panel,
              padding: spacing.cardPadding,
              marginBottom: spacing.xl,
            }}
          >
            <SponsorLogoWall
              sponsors={SPONSOR_BENEFITS.map((s) => ({
                id: s.id,
                name: s.name,
                logoSrc: s.logoSrc,
                accent: s.accent,
                accent2: s.accent2,
                glow: s.glow,
                tagline: "",
                websiteUrl: s.websiteUrl,
              }))}
              isMobile={isMobile}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <span
              style={{
                ...heroCTAPillStyles.base,
                ...heroCTAPillStyles.gold,
                padding: `${spacing.md} ${spacing.xl}`,
                display: "inline-flex",
                opacity: 0.7,
                cursor: "default",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Explore partner benefits
                <span style={{ ...typography.caption, background: colors.warning.soft, color: colors.warning.main, padding: "2px 8px", borderRadius: 999, fontWeight: typography.fontWeight.semibold }}>Coming soon</span>
              </span>
            </span>
          </div>
        </motion.div>
      </SectionWrapper>

      {/* FOOTER */}
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
                        <Link
                          key={link.label}
                          to={link.to}
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
                        </Link>
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
                        <Link
                          key={link.label}
                          to={link.to}
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
                        </Link>
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
    </div>
  );
};

export default AboutPage;

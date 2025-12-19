/**
 * About FC Real Bengaluru Page
 * Story-driven narrative experience with cinematic background
 */

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { TrophyCabinet } from "./LandingPage";
import { SponsorLogoWall } from "../components/home/SponsorLogoWall";
import {
  ArrowRightIcon,
  StarIcon,
  FireIcon,
  MedalIcon,
  LocationIcon,
  GraduationCapIcon,
  ChartBarIcon,
  TrophyIcon,
  FootballIcon,
  UsersIcon,
  ShieldIcon,
  EmailIcon,
  PhoneIcon,
  BuildingIcon,
  DumbbellIcon,
  ShoppingBagIcon,
  FlagIcon,
} from "../components/icons/IconSet";
import { galleryAssets } from "../config/assets";
import { SPONSOR_BENEFITS } from "../data/fanclubBenefits";

const AboutPage: React.FC = () => {
  // Component state and refs
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const aboutClubRef = useRef<HTMLElement>(null);
  const joinJourneyRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.title = "About FC Real Bengaluru";
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(ref.current, { offset: -100, duration: 1.0 });
      } else {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20, filter: "blur(6px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  };

  // Infinity Flow Wrapper - seamless transitions between sections
  const AboutInfinitySection: React.FC<{
    children: React.ReactNode;
    bridge?: boolean;
    bridgeTop?: boolean;
    bridgeBottom?: boolean;
    sectionRef?: React.Ref<HTMLElement>;
    style?: React.CSSProperties;
  }> = ({ children, bridge = false, bridgeTop, bridgeBottom, sectionRef, style }) => {
    const BRIDGE_HEIGHT = 100;
    const PAD = isMobile ? 120 : 150;
    const showTop = bridgeTop ?? bridge;
    const showBottom = bridgeBottom ?? bridge;

    const bridgeTopStyle: React.CSSProperties = {
      background: "linear-gradient(180deg, rgba(5,11,32,0) 0%, rgba(5,11,32,0.55) 100%)",
    };

    const bridgeBottomStyle: React.CSSProperties = {
      background: "linear-gradient(180deg, rgba(5,11,32,0.55) 0%, rgba(5,11,32,0) 100%)",
    };

    return (
      <>
        {showTop && (
          <div
            aria-hidden="true"
            style={{
              position: "relative",
              height: BRIDGE_HEIGHT,
              marginTop: -BRIDGE_HEIGHT,
              zIndex: 1,
              pointerEvents: "none",
              ...bridgeTopStyle,
            }}
          />
        )}

        <motion.section
          {...fadeInUp}
          ref={sectionRef}
          style={{
            ...(style || {}),
            position: "relative",
            zIndex: showTop || showBottom ? 2 : 1,
            marginTop: showTop ? -BRIDGE_HEIGHT : (style?.marginTop as any),
            marginBottom: showBottom ? -BRIDGE_HEIGHT : (style?.marginBottom as any),
            paddingTop: showTop || showBottom ? PAD : (style?.paddingTop as any),
            paddingBottom: showTop || showBottom ? PAD : (style?.paddingBottom as any),
            overflow: "visible",
          }}
        >
          {/* Subtle texture keeps the flow cohesive */}
          {(showTop || showBottom) && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)",
                opacity: 0.22,
              }}
            />
          )}
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </motion.section>

        {showBottom && (
          <div
            aria-hidden="true"
            style={{
              position: "relative",
              height: BRIDGE_HEIGHT,
              marginBottom: -BRIDGE_HEIGHT,
              zIndex: 1,
              pointerEvents: "none",
              ...bridgeBottomStyle,
            }}
          />
        )}
      </>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.club.deep,
        position: "relative",
      }}
    >
      {/* Full-bleed video background for the entire page */}
      <motion.div
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          width: "100vw",
          height: "100vh",
          transform: "translateX(-50%) scale(1.15)",
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <iframe
          ref={heroVideoRef}
          src="https://www.youtube-nocookie.com/embed/23kUIDR1d7Q?autoplay=1&mute=1&loop=1&playlist=23kUIDR1d7Q&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=1&fs=0&cc_load_policy=0&showinfo=0"
          title="FC Real Bengaluru About Us Background"
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
      </motion.div>

      {/* Dark club overlay + subtle noise so header and text stay readable */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: `linear-gradient(135deg,
            rgba(5, 11, 32, 0.92) 0%,
            rgba(10, 22, 51, 0.86) 50%,
            rgba(5, 11, 32, 0.96) 100%)`,
          zIndex: 1,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <PublicHeader />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          position: "relative",
          zIndex: 3,
          padding: isMobile ? `${spacing.xl} ${spacing.lg}` : `${spacing["3xl"]} ${spacing.xl}`,
          paddingTop: isMobile ? "110px" : "120px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* 1. HERO - Who We Are */}
        <motion.section {...fadeInUp} style={{ marginBottom: 0 }}>
          <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
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
              About FC Real Bengaluru
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
              One nation, one team, one dream. FC Real Bengaluru is a Bengaluru-based football club competing across KSFA
              leagues, built on community-first values and long-term ambition. From grassroots training to Super Division
              targets, we use modern coaching and data to help players rise the right way.
            </p>
            <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.button
                type="button"
                onClick={() => scrollToSection(aboutClubRef)}
                whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                whileTap={{ scale: 0.98 }}
                style={{
                  ...heroCTAStyles.blue,
                  width: isMobile ? "100%" : "auto",
                  minWidth: isMobile ? "100%" : 280,
                }}
                aria-label="Meet the Club"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                  <span style={heroCTAStyles.blue.textStyle}>Meet the Club</span>
                  <span style={heroCTAStyles.blue.subtitleStyle}>Our story, leadership, and pillars</span>
                </div>
                <ArrowRightIcon size={20} color={colors.text.onPrimary} style={{ flexShrink: 0 }} />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => scrollToSection(joinJourneyRef)}
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
                aria-label="Join the Journey"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                  <span style={heroCTAStyles.darkWithBorder.textStyle}>Join the Journey</span>
                  <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>
                    Fan club + updates + exclusive perks
                  </span>
                </div>
                <StarIcon size={18} style={{ color: colors.accent.main, flexShrink: 0 }} />
              </motion.button>
            </div>
          </div>
        </motion.section>

        {/* 2. OUR STORY & CULTURE (woven) + ACHIEVEMENTS (sticky side panel) */}
        <AboutInfinitySection bridge sectionRef={aboutClubRef}>
          <div
            style={{
              position: "relative",
              borderRadius: borderRadius["2xl"],
              border: "1px solid rgba(255,255,255,0.10)",
              ...glass.panel,
              padding: isMobile ? spacing.lg : spacing["2xl"],
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "saturate(1.06) contrast(1.06)",
                opacity: 0.16,
                pointerEvents: "none",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 14% 18%, rgba(0,224,255,0.12) 0%, transparent 60%), radial-gradient(circle at 86% 16%, rgba(255,169,0,0.10) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.78) 0%, rgba(10,22,51,0.52) 45%, rgba(5,11,32,0.82) 100%)",
                opacity: 0.98,
                pointerEvents: "none",
              }}
            />
            <div aria-hidden="true" style={glass.overlayStrong} />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1.45fr 0.85fr",
                gap: isMobile ? spacing.xl : spacing["2xl"],
                alignItems: "start",
              }}
            >
              {/* Left: Story + Culture woven */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    ...typography.overline,
                    color: colors.accent.main,
                    letterSpacing: "0.18em",
                    marginBottom: spacing.xs,
                  }}
                >
                  OUR STORY &amp; CULTURE
                </div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>From idea to club</h2>
                <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.85, marginBottom: spacing.md }}>
                  FC Real Bengaluru started with a simple belief: Bengaluru deserves a club built on community, modern coaching, and clear pathways from grassroots to the highest levels. We’re building a long-term project — competitive football powered by development, data, and detail.
                </p>
                <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.85, marginBottom: spacing.md }}>
                  At the heart of FC Real Bengaluru lies a powerful culture, driven by a clear vision, an unwavering mission, and an inspiring motto. These principles guide every decision, every training session, and every interaction, shaping us into more than just a football club—we are a community united by shared ambition.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: spacing.lg }}>
                  {["Community-first", "Modern coaching", "Clear pathways", "KSFA + BDFA"].map((t) => (
                    <div
                      key={t}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: colors.text.secondary,
                        ...typography.caption,
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                    gap: spacing.lg,
                    marginBottom: spacing.lg,
                  }}
                >
                  {[
                    {
                      title: "Vision",
                      icon: <StarIcon size={26} color={colors.accent.main} />,
                      content:
                        "To be a leading force in Indian football, developing world-class talent while building a sustainable, community-driven club that inspires the next generation.",
                      accent: colors.accent.main,
                    },
                    {
                      title: "Mission",
                      icon: <FireIcon size={26} color={colors.primary.main} />,
                      content:
                        "Our mission is to develop young footballers through structured pathways, compete with integrity at all levels, and create a vibrant football culture that unites communities across Bengaluru and beyond.",
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
                        <div style={{ marginBottom: spacing.md }}>{item.icon}</div>
                        <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>{item.title}</h3>
                        <p
                          style={{
                            ...typography.body,
                            color: colors.text.secondary,
                            fontSize: typography.fontSize.sm,
                            lineHeight: 1.7,
                            margin: 0,
                          }}
                        >
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Motto callout (woven into culture) */}
                <div
                  style={{
                    borderRadius: borderRadius["2xl"],
                    border: "1px solid rgba(255,255,255,0.10)",
                    ...glass.inset,
                    padding: spacing.lg,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div aria-hidden="true" style={glass.overlaySoft} />
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(circle at 18% 18%, ${colors.accent.main}14 0%, transparent 58%)`,
                      opacity: 0.95,
                      pointerEvents: "none",
                    }}
                  />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 16,
                          border: `1px solid ${colors.accent.main}40`,
                          background: `${colors.accent.main}14`,
                          display: "grid",
                          placeItems: "center",
                          boxShadow: `0 0 24px ${colors.accent.main}20`,
                          flexShrink: 0,
                        }}
                      >
                        <MedalIcon size={20} color={colors.accent.main} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em" }}>MOTTO</div>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, marginTop: 6 }}>Chase Your Legacy</div>
                      </div>
                    </div>
                    <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.75, marginTop: 12 }}>
                      Every season, every training cycle, every academy intake — one step closer. This is more than a slogan; it's a call to action for every player, coach, and supporter. Every match, every training session, every season—we build excellence through dedication, teamwork, and an unwavering commitment to the game we love.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Achievements sticky panel */}
              <div
                style={{
                  minWidth: 0,
                  position: isMobile ? "relative" : "sticky",
                  top: isMobile ? undefined : 120,
                  alignSelf: "start",
                }}
              >
                <div
                  style={{
                    borderRadius: borderRadius["2xl"],
                    border: "1px solid rgba(255,255,255,0.12)",
                    ...glass.card,
                    padding: isMobile ? spacing.lg : spacing.xl,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div aria-hidden="true" style={glass.overlaySoft} />
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(circle at 78% 22%, rgba(255,169,0,0.14) 0%, transparent 60%), radial-gradient(circle at 18% 16%, rgba(0,224,255,0.10) 0%, transparent 58%)",
                      opacity: 0.95,
                      pointerEvents: "none",
                    }}
                  />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 18,
                          border: `1px solid ${colors.accent.main}40`,
                          background: `${colors.accent.main}14`,
                          display: "grid",
                          placeItems: "center",
                          boxShadow: `0 0 24px ${colors.accent.main}20`,
                          flexShrink: 0,
                        }}
                      >
                        <TrophyIcon size={20} color={colors.accent.main} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: 2 }}>
                          OUR HONOURS
                        </div>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.1 }}>Trophy Cabinet</div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>
                          Tap to reveal our achievements
                        </div>
                      </div>
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.sm, lineHeight: 1.7 }}>
                      Victory is in the DNA of FC Real Bengaluru. Each trophy represents not just a win, but the collective effort of our players, staff, and supporters.
                    </div>

                    <div style={{ marginTop: spacing.md }}>
                      <TrophyCabinet variant="royal" isMobile={isMobile} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AboutInfinitySection>

        {/* 3. CLUB PATHWAY (merged with WHAT WE DO) */}
        <AboutInfinitySection bridge>
          <div
            style={{
              borderRadius: borderRadius["2xl"],
              border: "1px solid rgba(255,255,255,0.10)",
              ...glass.panel,
              overflow: "hidden",
              position: "relative",
              padding: isMobile ? spacing.lg : spacing["2xl"],
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "saturate(1.08) contrast(1.05)",
                opacity: 0.18,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.10) 0%, transparent 60%), radial-gradient(circle at 82% 16%, rgba(255,169,0,0.10) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.78) 0%, rgba(10,22,51,0.50) 45%, rgba(5,11,32,0.82) 100%)",
                opacity: 0.98,
              }}
            />
            <div aria-hidden="true" style={glass.overlayStrong} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ textAlign: "center", maxWidth: 860, margin: "0 auto" }}>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                  CLUB PATHWAY
                </div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Grassroots → Competitive → Legacy</div>
                <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs, lineHeight: 1.6 }}>
                  One club philosophy from academy to senior team — modern coaching, strong culture, and community at the core.
                </div>
              </div>

              <div style={{ marginTop: spacing.xl, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
                {[
                  { n: 1, kicker: "PILLAR 1", title: "Develop players", desc: "Structured academy pathways, league exposure, and clear progression.", accent: "rgba(0,224,255,0.80)", Icon: GraduationCapIcon },
                  { n: 2, kicker: "PILLAR 2", title: "Compete with intent", desc: "KSFA + BDFA competition built on detail, discipline, and identity.", accent: "rgba(255,169,0,0.85)", Icon: TrophyIcon },
                  { n: 3, kicker: "PILLAR 3", title: "Belong to a community", desc: "Fans, families, and partners powering a real Bengaluru football culture.", accent: "rgba(34,197,94,0.80)", Icon: UsersIcon },
                ].map(({ n, kicker, title, desc, accent, Icon }) => (
                  <div
                    key={n}
                    style={{
                      borderRadius: borderRadius["2xl"],
                      border: "1px solid rgba(255,255,255,0.12)",
                      ...glass.card,
                      overflow: "hidden",
                      position: "relative",
                      minHeight: 172,
                      padding: spacing.lg,
                    }}
                  >
                    <div aria-hidden="true" style={glass.overlaySoft} />
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 22% 18%, ${accent}18 0%, transparent 62%)`, opacity: 0.9 }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                        <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em" }}>{kicker}</div>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                            border: `1px solid ${accent}55`,
                            background: "rgba(0,0,0,0.22)",
                            display: "grid",
                            placeItems: "center",
                            boxShadow: `0 0 26px ${accent.replace("0.80", "0.18").replace("0.85", "0.18")}`,
                            color: colors.text.primary,
                            fontWeight: 800,
                          }}
                        >
                          {n}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 16,
                            border: `1px solid ${accent}40`,
                            background: `${accent}14`,
                            display: "grid",
                            placeItems: "center",
                            boxShadow: `0 0 24px ${accent}20`,
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={20} color={accent} />
                        </div>
                        <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.1 }}>{title}</div>
                      </div>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 10, lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: spacing.xl, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: spacing.md }}>
                {[
                  { label: "KSFA + BDFA", sub: "Competitive league pathway", Icon: TrophyIcon, accent: colors.accent.main },
                  { label: "Academy System", sub: "U9+ structured development", Icon: GraduationCapIcon, accent: colors.primary.main },
                  { label: "Centres", sub: "Multiple training locations", Icon: LocationIcon, accent: "rgba(34,197,94,0.9)" },
                  { label: "Fan Club", sub: "Perks + community", Icon: StarIcon, accent: colors.accent.main },
                ].map(({ label, sub, Icon, accent }) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: borderRadius.xl,
                      border: "1px solid rgba(255,255,255,0.10)",
                      ...glass.inset,
                      padding: spacing.md,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div aria-hidden="true" style={glass.overlaySoft} />
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        width: 44,
                        height: 44,
                        borderRadius: 16,
                        border: `1px solid ${accent}40`,
                        background: `${accent}14`,
                        display: "grid",
                        placeItems: "center",
                        boxShadow: `0 0 24px ${accent}20`,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color={accent} />
                    </div>
                    <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                      <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>{label}</div>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Story beat divider (Pathway → Pillars) + WHAT WE DO (embedded) */}
              <div
                style={{
                  marginTop: isMobile ? spacing["2xl"] : spacing["3xl"],
                  paddingTop: isMobile ? spacing["2xl"] : spacing["3xl"],
                  borderTop: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div style={{ marginBottom: spacing.lg }}>
                  <div
                    style={{
                      ...typography.overline,
                      color: colors.accent.main,
                      letterSpacing: "0.15em",
                      marginBottom: spacing.xs,
                    }}
                  >
                    WHAT WE DO
                  </div>
                  <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Our Core Pillars</h2>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      maxWidth: "70ch",
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    FC Real Bengaluru operates on three fundamental pillars that define our identity and drive our daily efforts. These interconnected areas—competitive football, youth development, and community engagement—form the bedrock of our club, ensuring we not only strive for on-pitch excellence but also cultivate a lasting impact off the pitch.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                  {[
                    {
                      title: "Football Team",
                      description:
                        "Our senior team competes in the prestigious KSFA Super Division and BDFA Super Division, embodying the club's competitive spirit and tactical identity. Every match is an opportunity to showcase the talent nurtured within our system and to represent Bengaluru with pride and determination.",
                      icon: <FootballIcon size={32} color={colors.primary.main} />,
                      cta: "View fixtures & results",
                      ctaLink: "/#content-stream",
                      accent: colors.primary.main,
                    },
                    {
                      title: "Football Academy",
                      description:
                        "The RealVerse Football Academy is the heart of our long-term vision. We provide structured youth development programs from U9 upwards, offering age-appropriate training, competitive league exposure, and clear, data-driven pathways to senior football.",
                      icon: <GraduationCapIcon size={32} color={colors.accent.main} />,
                      cta: "Explore coaching programs",
                      ctaLink: "/programs",
                      accent: colors.accent.main,
                    },
                    {
                      title: "Fan Club",
                      description:
                        "The 'Blue Army' is more than just a fan base; it's the soul of FC Real Bengaluru. Our passionate supporters back the club through thick and thin, creating an electrifying atmosphere on and off the pitch. Joining the Fan Club offers exclusive perks, rewards, and unparalleled access to the club, fostering a deep sense of belonging and community.",
                      icon: <UsersIcon size={32} color={colors.primary.main} />,
                      cta: "Discover the Blue Army",
                      ctaLink: "/fan-club/benefits",
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
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: spacing.lg,
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
                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.lg,
                          flexShrink: 0,
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
                      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
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
                            }}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                              {item.cta}{" "}
                              <ArrowRightIcon
                                size={16}
                                style={{ color: item.accent === colors.primary.main ? colors.primary.main : colors.accent.main }}
                              />
                            </span>
                          </motion.div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AboutInfinitySection>

        {/* 5. FOUNDERS / LEADERSHIP */}
        <AboutInfinitySection bridge>
          <div style={{ marginBottom: spacing.lg }}>
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
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Meet the Founders</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              FC Real Bengaluru is led by a passionate team of founders, united by a shared vision to elevate football in
              Bengaluru. Their combined expertise in sports management, technical development, and community building drives
              the club's mission to nurture talent and foster a vibrant football culture.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: spacing.lg,
            }}
          >
            {[
              {
                name: "Dhruv Katyal",
                role: "Secretary",
                description:
                  "As Secretary, Dhruv Katyal is instrumental in shaping the club's strategic direction and ensuring seamless operations. His dedication to community engagement and long-term planning helps lay the groundwork for FC Real Bengaluru's sustainable growth and impact.",
              },
              {
                name: "Nitesh Sharma",
                role: "Technical Director & Head Coach",
                description:
                  "Nitesh Sharma, our Technical Director and Head Coach, is the architect of FC Real Bengaluru's on-field philosophy. He oversees all technical aspects, from youth development pathways to senior team tactics, ensuring a consistent, modern, and data-driven approach to player progression.",
              },
              {
                name: "Sudhir Prabhu",
                role: "President",
                description:
                  "President Sudhir Prabhu provides the overarching leadership and vision for FC Real Bengaluru. His commitment to the club's core values and his strategic guidance are crucial in driving our ambition to compete at the highest levels and build a lasting legacy in Indian football.",
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
                  textAlign: "center",
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
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.xs }}>{founder.name}</h3>
                  <div
                    style={{
                      ...typography.overline,
                      color: colors.accent.main,
                      letterSpacing: "0.12em",
                      marginBottom: spacing.sm,
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
                      marginBottom: spacing.md,
                    }}
                  >
                    {founder.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AboutInfinitySection>

        {/* 9. OUR PARTNERS */}
        <AboutInfinitySection bridge>
          <div style={{ marginBottom: spacing.lg }}>
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
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>They Supported Us</h2>
            <p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                maxWidth: "70ch",
                lineHeight: 1.8,
              }}
            >
              Our journey is powered by the unwavering support of our partners. Their commitment enables us to invest in
              talent development, maintain facilities, and expand our community initiatives.
            </p>
          </div>

          <div
            style={{
              borderRadius: borderRadius.card,
              ...glass.panel,
              padding: spacing.cardPadding,
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
            <div style={{ textAlign: "center" }}>
              <Link to="/fan-club/benefits" style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...heroCTAStyles.darkWithBorder,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                    width: isMobile ? "100%" : "auto",
                    minWidth: isMobile ? "100%" : 320,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={heroCTAStyles.darkWithBorder.textStyle}>Explore sponsor benefits</span>
                    <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>Partner perks for members</span>
                  </div>
                  <ArrowRightIcon size={20} color={colors.accent.main} style={{ flexShrink: 0 }} />
                </motion.div>
              </Link>
            </div>
          </div>
        </AboutInfinitySection>

        {/* 10. MAILING LIST / JOIN CTA */}
        <AboutInfinitySection bridgeTop bridgeBottom={false} sectionRef={joinJourneyRef}>
          <div
            style={{
              borderRadius: borderRadius["2xl"],
              border: "1px solid rgba(255,255,255,0.10)",
              ...glass.panel,
              padding: isMobile ? spacing.lg : spacing["2xl"],
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 16% 22%, rgba(255,169,0,0.12) 0%, transparent 58%), radial-gradient(circle at 88% 18%, rgba(0,224,255,0.10) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.70) 0%, rgba(10,22,51,0.44) 42%, rgba(5,11,32,0.72) 100%)",
                opacity: 0.95,
                pointerEvents: "none",
              }}
            />
            <div aria-hidden="true" style={glass.overlayStrong} />

            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: spacing.xl, alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                  JOIN THE JOURNEY
                </div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Become part of the Blue Army</h2>
                <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.8, marginBottom: spacing.md }}>
                  Get match updates, academy announcements, and Fan Club drops — no spam. When memberships go live, you’ll be first to know.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {["Match updates", "Academy news", "Partner perks", "Member drops"].map((t) => (
                    <div
                      key={t}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        color: colors.text.secondary,
                        ...typography.caption,
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  borderRadius: borderRadius["2xl"],
                  border: "1px solid rgba(255,255,255,0.12)",
                  ...glass.card,
                  padding: spacing.lg,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div aria-hidden="true" style={glass.overlaySoft} />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Newsletter signup coming soon!");
                  }}
                  style={{ position: "relative", zIndex: 1, display: "grid", gap: spacing.sm }}
                >
                  <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em" }}>EMAIL</div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    style={{
                      width: "100%",
                      padding: `${spacing.md} ${spacing.lg}`,
                      borderRadius: borderRadius.button,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(0,0,0,0.22)",
                      color: colors.text.primary,
                      ...typography.body,
                      fontSize: typography.fontSize.base,
                      outline: "none",
                    }}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                    whileTap={{ scale: 0.98 }}
                    style={{ ...heroCTAStyles.yellow, width: "100%", minHeight: 56 }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                      <span style={heroCTAStyles.yellow.textStyle}>Join the mailing list</span>
                      <span style={heroCTAStyles.yellow.subtitleStyle}>Monthly highlights + key drops</span>
                    </div>
                    <ArrowRightIcon size={20} color={colors.text.onAccent} style={{ flexShrink: 0 }} />
                  </motion.button>
                  <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.6 }}>
                    Preview-only. We’ll activate signup soon.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </AboutInfinitySection>

        {/* Back to Home */}
        <motion.div {...fadeInUp} style={{ textAlign: "center", marginTop: spacing["2xl"] }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...heroCTAPillStyles.base,
                ...heroCTAPillStyles.gold,
                display: "inline-flex",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Back to Home
                <ArrowRightIcon size={16} style={{ color: colors.accent.main, transform: "rotate(180deg)" }} />
              </span>
            </motion.div>
          </Link>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default AboutPage;

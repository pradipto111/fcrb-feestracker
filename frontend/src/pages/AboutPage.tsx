/**
 * About FC Real Bengaluru Page
 * Complete narrative story using old site content + new football-first design system
 */

import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { TrophyCabinet, TabbedPanel } from "./LandingPage";
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
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  EmailIcon,
  PhoneIcon,
  BuildingIcon,
  DumbbellIcon,
  ShoppingBagIcon,
  FlagIcon,
} from "../components/icons/IconSet";
import { SectionBackground } from "../components/shared/SectionBackground";
import { galleryAssets, heroAssets } from "../config/assets";
import { Button } from "../components/ui/Button";
import { SPONSOR_BENEFITS } from "../data/fanclubBenefits";
import { clubInfo } from "../data/club";

const AboutPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const aboutClubRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "About FC Real Bengaluru";
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.club.deep,
        position: "relative",
      }}
    >
      <PublicHeader />

      {/* Lively Background */}
      <SectionBackground
        variant="story"
        type="image"
        src={galleryAssets.actionShots[0]?.medium || heroAssets.teamBackground1024}
        overlayIntensity="strong"
        style={{ position: "absolute", inset: 0 }}
      />

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
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
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
              One nation, one team, one dream. FC Real Bengaluru is a Bengaluru-based football club competing across KSFA leagues, built on community-first values and long-term ambition. From grassroots training to Super Division targets, we use modern coaching and data to help players rise the right way.
            </p>
            <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="primary" size="lg" onClick={() => scrollToSection(aboutClubRef)} style={{ borderRadius: 999 }}>
                Meet the Club <ArrowRightIcon size={18} style={{ marginLeft: spacing.sm }} />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => scrollToSection(pricingRef)} style={{ borderRadius: 999 }}>
                Join the Journey <ArrowRightIcon size={18} style={{ marginLeft: spacing.sm }} />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* 2. ABOUT THE CLUB */}
        <motion.section {...fadeInUp} ref={aboutClubRef} style={{ marginBottom: spacing["3xl"] }}>
          <div
            style={{
              borderRadius: borderRadius.card,
              background: colors.surface.card,
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(14px)",
              boxShadow: shadows.card,
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
                background:
                  "radial-gradient(circle at 20% 20%, rgba(0,224,255,0.08) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.08) 0%, transparent 55%)",
                opacity: 0.95,
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: spacing.xl, alignItems: "center" }}>
                <div>
                  <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>
                    Welcome to FC Real Bengaluru
                  </h2>
                  <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.75, marginBottom: spacing.md }}>
                    We believe in the power of football to unite communities, develop young talent, and build a strong sporting culture. FC Real Bengaluru is more than a club—it's a movement dedicated to nurturing football excellence in Bengaluru and beyond.
                  </p>
                  <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.75 }}>
                    Our focus is on youth development, fair play, and creating pathways from grassroots to professional football. We compete with ambition, train with purpose, and build for the future—one player, one match, one season at a time.
                  </p>
                </div>
                <div
                  style={{
                    borderRadius: borderRadius.lg,
                    overflow: "hidden",
                    aspectRatio: "16/9",
                    background: "rgba(0,0,0,0.2)",
                    backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: shadows.card,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. HISTORY & TRAJECTORY */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
              OUR STORY
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>History & Trajectory</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              Born in 2024, built for tomorrow. FC Real Bengaluru entered the KSFA league system with a clear vision: develop talent, compete with integrity, and climb the Indian football ladder.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
            {[
              {
                period: "2024",
                title: "The Beginning",
                description: "Club founded, entry into KSFA D Division and BDFA Super Division. Established academy pathways and community-first values.",
                icon: <StarIcon size={24} color={colors.accent.main} />,
                accent: colors.accent.main,
              },
              {
                period: "Present",
                title: "Current Status",
                description: "Competing in KSFA Super Division and BDFA Super Division. Active youth development across U9 to senior levels.",
                icon: <FireIcon size={24} color={colors.primary.main} />,
                accent: colors.primary.main,
              },
              {
                period: "Future",
                title: "Our Ambition",
                description: "Climb to higher divisions, develop players for national and international success, build a sustainable football ecosystem.",
                icon: <MedalIcon size={24} color={colors.accent.main} />,
                accent: colors.accent.main,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: borderRadius.card,
                  background: colors.surface.card,
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: shadows.card,
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
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.md }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
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
                    <div>
                      <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.12em" }}>{item.period}</div>
                      <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{item.title}</div>
                    </div>
                  </div>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.7 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 4. FOUNDERS / LEADERSHIP */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
              LEADERSHIP
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Meet the Founders</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              The visionaries behind FC Real Bengaluru, committed to building a club that develops talent and serves the community.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
            {[
              {
                name: "Dhruv Katyal",
                role: "Secretary",
                description: "Leading the club's strategic vision and community engagement initiatives.",
                social: { instagram: "#", twitter: "#", linkedin: "#" },
              },
              {
                name: "Nitesh Sharma",
                role: "Technical Director & Head Coach",
                description: "Overseeing technical development, coaching standards, and player pathway progression.",
                social: { instagram: "#", twitter: "#", linkedin: "#" },
              },
              {
                name: "Sudhir Prabhu",
                role: "President",
                description: "Guiding the club's mission, values, and long-term growth strategy.",
                social: { instagram: "#", twitter: "#", linkedin: "#" },
              },
            ].map((founder, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: borderRadius.card,
                  background: colors.surface.card,
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: shadows.card,
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
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.12em", marginBottom: spacing.sm }}>
                    {founder.role}
                  </div>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.6, marginBottom: spacing.md }}>
                    {founder.description}
                  </p>
                  <div style={{ display: "flex", gap: spacing.sm, justifyContent: "center" }}>
                    <a href={founder.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <InstagramIcon size={18} color={colors.text.secondary} style={{ opacity: 0.7 }} />
                    </a>
                    <a href={founder.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                      <TwitterIcon size={18} color={colors.text.secondary} style={{ opacity: 0.7 }} />
                    </a>
                    <a href={founder.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <TwitterIcon size={18} color={colors.text.secondary} style={{ opacity: 0.7 }} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. WHAT WE DO - Team / Academy / Fan Club */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
              WHAT WE DO
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Our Core Programs</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              Three pillars of excellence: competitive football, youth development, and community engagement.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
            {[
              {
                title: "Football Team",
                description: "Our senior team competes in KSFA Super Division and BDFA Super Division, representing FC Real Bengaluru with passion and determination.",
                icon: <FootballIcon size={32} color={colors.primary.main} />,
                cta: "View fixtures & results",
                ctaLink: "/#content-stream",
              },
              {
                title: "Football Academy",
                description: "Structured youth development from U9 upwards, with age-appropriate training, competitive leagues, and clear pathways to senior football.",
                icon: <GraduationCapIcon size={32} color={colors.accent.main} />,
                cta: "Explore coaching programs",
                ctaLink: "/programs",
              },
              {
                title: "Fan Club",
                description: "The Blue Army—our passionate supporters who back the club on and off the pitch. Join for exclusive perks, rewards, and community access.",
                icon: <UsersIcon size={32} color={colors.primary.main} />,
                cta: "Discover the Blue Army",
                ctaLink: "/fan-club/benefits",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: borderRadius.card,
                  background: colors.surface.card,
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: shadows.card,
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
                    background: `radial-gradient(circle at 18% 18%, ${idx === 1 ? colors.accent.main : colors.primary.main}14 0%, transparent 55%)`,
                    opacity: 0.95,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: borderRadius.card,
                      background: `${idx === 1 ? colors.accent.main : colors.primary.main}14`,
                      border: `1px solid ${idx === 1 ? colors.accent.main : colors.primary.main}40`,
                      display: "grid",
                      placeItems: "center",
                      marginBottom: spacing.md,
                      boxShadow: `0 0 24px ${idx === 1 ? colors.accent.main : colors.primary.main}20`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>{item.title}</h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.7, marginBottom: spacing.md }}>
                    {item.description}
                  </p>
                  <Link to={item.ctaLink} style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: spacing.xs,
                        color: idx === 1 ? colors.accent.main : colors.primary.main,
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      {item.cta} <ArrowRightIcon size={16} />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 6. CLUB OVERVIEW - HQ, Training Center, Merch, Ground */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
              CLUB OVERVIEW
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Our Facilities & Resources</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: spacing.md }}>
            {[
              { title: "Club Headquarters", icon: <BuildingIcon size={24} color={colors.primary.main} />, description: "Administrative hub" },
              { title: "Training Center", icon: <DumbbellIcon size={24} color={colors.accent.main} />, description: "Multi-location facilities" },
              { title: "Official Merch", icon: <ShoppingBagIcon size={24} color={colors.primary.main} />, description: "Club store & gear" },
              { title: "Training Ground", icon: <FlagIcon size={24} color={colors.accent.main} />, description: "Match & practice venue" },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: borderRadius.card,
                  background: colors.surface.soft,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: spacing.lg,
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: spacing.sm }}>{item.icon}</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                  {item.title}
                </div>
                <div style={{ ...typography.caption, color: colors.text.muted }}>{item.description}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 7. CULTURE - Vision, Mission, Motto */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
              OUR CULTURE
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Vision, Mission & Motto</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
            {[
              {
                title: "Vision",
                content: "To be a leading force in Indian football, developing world-class talent while building a sustainable, community-driven club that inspires the next generation.",
                icon: <StarIcon size={28} color={colors.accent.main} />,
              },
              {
                title: "Mission",
                content: "Develop young footballers through structured pathways, compete with integrity at all levels, and create a football culture that unites communities across Bengaluru and beyond.",
                icon: <FireIcon size={28} color={colors.primary.main} />,
              },
              {
                title: "Motto",
                content: "Chase Your Legacy. Every player, every match, every season—we build excellence through dedication, teamwork, and unwavering commitment to the game we love.",
                icon: <MedalIcon size={28} color={colors.accent.main} />,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: borderRadius.card,
                  background: colors.surface.card,
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: shadows.card,
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
                    background: `radial-gradient(circle at 18% 18%, ${idx === 1 ? colors.primary.main : colors.accent.main}14 0%, transparent 55%)`,
                    opacity: 0.95,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ marginBottom: spacing.md }}>{item.icon}</div>
                  <h3 style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.sm }}>{item.title}</h3>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.7 }}>
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 8. ACHIEVEMENTS & HONOURS */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
              ACHIEVEMENTS & HONOURS
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Our Trophy Cabinet</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch", marginBottom: spacing.lg }}>
              Victory is in the DNA of FC Real Bengaluru. From our first season, we've competed with determination and earned recognition on the pitch.
            </p>
          </div>

          <div
            style={{
              borderRadius: borderRadius.card,
              background: colors.surface.card,
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: shadows.card,
              padding: spacing.cardPadding,
            }}
          >
            <TrophyCabinet variant="royal" isMobile={isMobile} />
          </div>
        </motion.section>

        {/* 9. SPONSORS */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
              OUR PARTNERS
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>They Supported Us</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              Our sponsors and partners enable us to compete, develop talent, and serve our community. Explore exclusive benefits available to Fan Club members.
            </p>
          </div>

          <div
            style={{
              borderRadius: borderRadius.card,
              background: colors.surface.card,
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: shadows.card,
              padding: spacing.cardPadding,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: spacing.lg, marginBottom: spacing.lg }}>
              {SPONSOR_BENEFITS.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: spacing.lg,
                    borderRadius: borderRadius.lg,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <img
                    src={sponsor.logoSrc}
                    alt={sponsor.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "60px",
                      objectFit: "contain",
                      filter: "grayscale(100%) brightness(1.2)",
                      opacity: 0.85,
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </a>
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <Link to="/fan-club/benefits" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="md" style={{ borderRadius: 999 }}>
                  Explore sponsor benefits <ArrowRightIcon size={18} style={{ marginLeft: spacing.sm }} />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* 10. EMAIL CAPTURE / STAY UPDATED */}
        <motion.section {...fadeInUp} ref={pricingRef} style={{ marginBottom: spacing["2xl"] }}>
          <div
            style={{
              borderRadius: borderRadius.card,
              background: colors.surface.card,
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: shadows.card,
              padding: spacing.cardPadding,
              textAlign: "center",
            }}
          >
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              STAY UPDATED
            </div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>Leave Us Your Email to Stay Up to Date!</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "60ch", margin: "0 auto", marginBottom: spacing.lg }}>
              Get the latest news, match updates, academy announcements, and exclusive Fan Club offers delivered to your inbox.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Placeholder - wire to newsletter API later
                alert("Newsletter signup coming soon!");
              }}
              style={{ display: "flex", gap: spacing.md, maxWidth: "500px", margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                style={{
                  flex: isMobile ? "1 1 100%" : "1 1 auto",
                  minWidth: "200px",
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.button,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.05)",
                  color: colors.text.primary,
                  ...typography.body,
                  fontSize: typography.fontSize.base,
                }}
              />
              <Button type="submit" variant="primary" size="md" style={{ borderRadius: 999 }}>
                Join the mailing list <ArrowRightIcon size={18} style={{ marginLeft: spacing.sm }} />
              </Button>
            </form>
          </div>
        </motion.section>

        {/* Back to Home */}
        <motion.div {...fadeInUp} style={{ textAlign: "center", marginTop: spacing["2xl"] }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.sm,
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: borderRadius.lg,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.03)",
                color: colors.text.secondary,
              }}
            >
              <span style={{ ...typography.body, fontSize: typography.fontSize.sm }}>Back to Home</span>
              <ArrowRightIcon size={16} style={{ color: colors.accent.main, transform: "rotate(180deg)" }} />
            </div>
          </Link>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default AboutPage;

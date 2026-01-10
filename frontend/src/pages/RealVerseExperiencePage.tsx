import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../components/ui/Card";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { heroCTAStyles } from "../theme/hero-design-patterns";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { clubAssets, academyAssets, realverseAssets, galleryAssets } from "../config/assets";
import PublicHeader from "../components/PublicHeader";
import {
  TrophyIcon,
  ChartBarIcon,
  FireIcon,
  MedalIcon,
  FootballIcon,
  ArrowRightIcon,
} from "../components/icons/IconSet";

// Dashboard Preview Component
const DashboardPreview: React.FC<{ previewType: string }> = ({ previewType }) => {
  const renderPreview = () => {
    switch (previewType) {
      case "dashboard":
        return (
          <div
            style={{
              background: `linear-gradient(135deg, rgba(20, 31, 58, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)`,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            <h4
              style={{
                ...typography.h4,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                textAlign: "center",
              }}
            >
              Dashboard Preview
            </h4>
            {/* Player Identity Header Mock */}
            <Card
              variant="default"
              padding="lg"
              style={{
                marginBottom: spacing.md,
                background: `linear-gradient(135deg, ${colors.surface.card} 0%, ${colors.surface.elevated} 100%)`,
                border: `1px solid ${colors.primary.main}20`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: spacing.md }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs }}>
                    Player Name
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" }}>
                    <span style={{ ...typography.body, color: colors.text.secondary }}>Academy Program</span>
                    <span style={{ color: colors.text.muted }}>•</span>
                    <span style={{ ...typography.body, color: colors.text.secondary }}>Center Name</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ ...typography.h4, color: colors.primary.main, marginBottom: spacing.xs }}>85%</div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>Attendance</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ ...typography.h4, color: colors.accent.main, marginBottom: spacing.xs }}>Level 3</div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>Current Level</div>
                  </div>
                </div>
              </div>
            </Card>
            {/* Next Step Snapshot Mock */}
            <Card
              variant="default"
              padding="lg"
              style={{
                marginBottom: spacing.md,
                background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
                border: `2px solid ${colors.primary.main}40`,
              }}
            >
              <div style={{ ...typography.overline, color: colors.text.muted, marginBottom: spacing.xs }}>
                What's Next for Me?
              </div>
              <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.sm }}>
                Level 4 - Advanced
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <span style={{ color: colors.success.main }}>✓</span>
                  <span style={{ ...typography.body, color: colors.text.secondary }}>Attendance: 85% (Required: 80%)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <span style={{ color: colors.success.main }}>✓</span>
                  <span style={{ ...typography.body, color: colors.text.secondary }}>Physical Benchmark: Met</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
                  <span style={{ color: colors.warning.main }}>○</span>
                  <span style={{ ...typography.body, color: colors.text.secondary }}>Tactical Understanding: In Progress</span>
                </div>
              </div>
            </Card>
            {/* Progress Roadmap Mock */}
            <div style={{ display: "flex", gap: spacing.sm, justifyContent: "center", flexWrap: "wrap" }}>
              {["Level 1", "Level 2", "Level 3", "Level 4"].map((level, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: borderRadius.md,
                    background: idx <= 2 ? colors.primary.main : `rgba(255, 255, 255, 0.1)`,
                    color: idx <= 2 ? colors.text.onPrimary : colors.text.secondary,
                    ...typography.body,
                    fontWeight: idx === 2 ? typography.fontWeight.bold : typography.fontWeight.regular,
                    border: idx === 2 ? `2px solid ${colors.accent.main}` : `1px solid rgba(255, 255, 255, 0.2)`,
                  }}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        );
      case "drills":
        return (
          <div
            style={{
              background: `linear-gradient(135deg, rgba(20, 31, 58, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)`,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            <h4
              style={{
                ...typography.h4,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                textAlign: "center",
              }}
            >
              Drills & Tutorials Preview
            </h4>
            {/* Filter Bar Mock */}
            <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg, flexWrap: "wrap" }}>
              <select
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  background: colors.surface.bg,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  ...typography.body,
                }}
              >
                <option>All Categories</option>
                <option>Passing</option>
                <option>Shooting</option>
                <option>Dribbling</option>
              </select>
              <select
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  background: colors.surface.bg,
                  border: `1px solid ${colors.border.light}`,
                  borderRadius: borderRadius.md,
                  color: colors.text.primary,
                  ...typography.body,
                }}
              >
                <option>All Platforms</option>
                <option>YouTube</option>
                <option>Vimeo</option>
              </select>
            </div>
            {/* Video Grid Mock */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
                gap: spacing.md,
              }}
            >
              {[
                { title: "Passing Drills", category: "Passing", image: galleryAssets.actionShots[0]?.thumbnail },
                { title: "Shooting Techniques", category: "Shooting", image: galleryAssets.actionShots[1]?.thumbnail },
                { title: "Dribbling Skills", category: "Dribbling", image: galleryAssets.actionShots[2]?.thumbnail },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    variant="default"
                    padding="md"
                    style={{
                      background: colors.surface.card,
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "16/9",
                        backgroundImage: item.image ? `url(${item.image})` : `linear-gradient(135deg, ${colors.primary.main}30 0%, ${colors.accent.main}30 100%)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: borderRadius.md,
                        marginBottom: spacing.sm,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(135deg, ${colors.primary.main}40 0%, ${colors.accent.main}40 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ...typography.h2,
                          color: colors.text.onPrimary,
                          textShadow: `0 2px 8px rgba(0, 0, 0, 0.5)`,
                        }}
                      >
                        ▶
                      </div>
                    </div>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                      {item.title}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>{item.category} • 5:30 min</div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case "feed":
        return (
          <div
            style={{
              background: `linear-gradient(135deg, rgba(20, 31, 58, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)`,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            <h4
              style={{
                ...typography.h4,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                textAlign: "center",
              }}
            >
              Social Feed Preview
            </h4>
            {/* Post Mock */}
            <Card
              variant="default"
              padding="lg"
              style={{
                marginBottom: spacing.md,
                background: colors.surface.card,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
              }}
            >
              <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.md }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...typography.h4,
                    color: colors.text.onPrimary,
                  }}
                >
                  FC
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                    FC Real Bengaluru
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>2 hours ago</div>
                </div>
              </div>
              <div style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
                Great training session today! Keep up the hard work! 💪
              </div>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  backgroundImage: `url(${galleryAssets.actionShots[0]?.medium || galleryAssets.actionShots[0]?.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: borderRadius.md,
                  marginBottom: spacing.md,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(255, 169, 0, 0.2) 100%)`,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: spacing.lg }}>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.text.secondary,
                    ...typography.body,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                  }}
                >
                  ❤️ 24
                </button>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.text.secondary,
                    ...typography.body,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.xs,
                  }}
                >
                  💬 5
                </button>
              </div>
            </Card>
          </div>
        );
      case "leaderboard":
        return (
          <div
            style={{
              background: `linear-gradient(135deg, rgba(20, 31, 58, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)`,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            <h4
              style={{
                ...typography.h4,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                textAlign: "center",
              }}
            >
              Leaderboard Preview
            </h4>
            {/* Leaderboard Table Mock */}
            <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.md, justifyContent: "center" }}>
              {["All Time", "Weekly", "Monthly"].map((period, idx) => (
                <button
                  key={idx}
                  style={{
                    padding: `${spacing.xs} ${spacing.md}`,
                    borderRadius: borderRadius.md,
                    background: idx === 0 ? colors.primary.main : `rgba(255, 255, 255, 0.1)`,
                    color: idx === 0 ? colors.text.onPrimary : colors.text.secondary,
                    border: "none",
                    ...typography.body,
                    cursor: "pointer",
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
              {[
                { rank: 1, name: "Player A", points: 1250, badge: "🥇" },
                { rank: 2, name: "Player B", points: 1180, badge: "🥈" },
                { rank: 3, name: "You", points: 1150, badge: "🥉", highlight: true },
                { rank: 4, name: "Player D", points: 980, badge: "#4" },
              ].map((player) => (
                <Card
                  key={player.rank}
                  variant="default"
                  padding="md"
                  style={{
                    background: player.highlight
                      ? `linear-gradient(135deg, ${colors.accent.main}20 0%, ${colors.primary.main}20 100%)`
                      : colors.surface.card,
                    border: player.highlight ? `2px solid ${colors.accent.main}` : `1px solid rgba(255, 255, 255, 0.1)`,
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.md,
                  }}
                >
                  <div style={{ ...typography.h4, color: colors.text.primary, minWidth: "40px" }}>
                    {player.badge}
                  </div>
                  <div style={{ flex: 1, ...typography.body, color: colors.text.primary, fontWeight: player.highlight ? typography.fontWeight.bold : typography.fontWeight.regular }}>
                    {player.name}
                  </div>
                  <div style={{ ...typography.body, color: colors.accent.main, fontWeight: typography.fontWeight.bold }}>
                    {player.points} pts
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      case "analytics":
        return (
          <div
            style={{
              background: `linear-gradient(135deg, rgba(20, 31, 58, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)`,
              borderRadius: borderRadius.xl,
              padding: spacing.xl,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
            }}
          >
            <h4
              style={{
                ...typography.h4,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                textAlign: "center",
              }}
            >
              Analytics Preview
            </h4>
            {/* Metrics Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))",
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              {[
                { label: "Training Sessions", value: "45", color: colors.primary.main },
                { label: "Attendance Rate", value: "85%", color: colors.success.main },
                { label: "Coach Feedback", value: "12", color: colors.accent.main },
                { label: "Matches Played", value: "8", color: colors.warning.main },
              ].map((metric, idx) => (
                <Card
                  key={idx}
                  variant="default"
                  padding="md"
                  style={{
                    background: colors.surface.card,
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ ...typography.h3, color: metric.color, marginBottom: spacing.xs }}>
                    {metric.value}
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>{metric.label}</div>
                </Card>
              ))}
            </div>
            {/* Chart Mock */}
            <Card
              variant="default"
              padding="lg"
              style={{
                background: colors.surface.card,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
              }}
            >
              <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>
                Performance Trend
              </div>
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  background: `linear-gradient(135deg, ${colors.primary.main}10 0%, ${colors.accent.main}10 100%)`,
                  borderRadius: borderRadius.md,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...typography.body,
                  color: colors.text.muted,
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                }}
              >
                📈 Performance Chart
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {renderPreview()}
    </motion.div>
  );
};

const RealVerseExperiencePage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    program: "",
    message: "",
  });

  const {
    headingVariants,
    subheadingVariants,
    cardVariants,
    cardHover,
    primaryButtonHover,
    primaryButtonTap,
    staggerContainer,
    viewportOnce,
    getStaggeredCard,
  } = useHomepageAnimation();

  const features = [
    {
      id: "dashboard",
      title: "Player Dashboard",
      icon: ChartBarIcon,
      description: "Track your progress, view your development roadmap, and see what's next in your journey.",
      highlights: [
        "Real-time progress tracking",
        "Personalized development roadmap",
        "Attendance & performance metrics",
        "Coach feedback & insights",
      ],
      color: colors.primary.main,
      preview: "dashboard",
    },
    {
      id: "drills",
      title: "Drills & Tutorials",
      icon: FootballIcon,
      description: "Access a comprehensive library of training drills and video tutorials to improve your skills.",
      highlights: [
        "Categorized training videos",
        "Skill-specific drills",
        "Professional coaching content",
        "Progress tracking per drill",
      ],
      color: colors.accent.main,
      preview: "drills",
    },
    {
      id: "feed",
      title: "Social Feed",
      icon: FireIcon,
      description: "Stay connected with your team, share achievements, and engage with the RealVerse community.",
      highlights: [
        "Team updates & announcements",
        "Share your achievements",
        "Community engagement",
        "Photo & video sharing",
      ],
      color: colors.accent.light,
      preview: "feed",
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      icon: TrophyIcon,
      description: "Compete with your peers, see where you rank, and stay motivated to improve.",
      highlights: [
        "Real-time rankings",
        "Multiple competition categories",
        "Achievement badges",
        "Progress milestones",
      ],
      color: colors.accent.main,
      preview: "leaderboard",
    },
    {
      id: "analytics",
      title: "Data Analytics",
      icon: ChartBarIcon,
      description: "Get data-driven insights into your performance with detailed analytics and reports.",
      highlights: [
        "Performance metrics",
        "Trend analysis",
        "Comparative statistics",
        "Personalized recommendations",
      ],
      color: colors.primary.main,
      preview: "analytics",
    },
  ];

  const programs = [
    {
      name: "Non-Residential Program",
      description: "Flexible training schedules for local players",
      features: ["Regular training sessions", "RealVerse access", "Performance tracking"],
    },
    {
      name: "Residential Program",
      description: "Intensive development with accommodation",
      features: ["Full-time training", "Accommodation", "Complete RealVerse access"],
    },
    {
      name: "High-Performance Streams",
      description: "Elite training for competitive players",
      features: ["Advanced coaching", "Competition focus", "Premium RealVerse features"],
    },
  ];

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement lead submission API call
    console.log("Lead submitted:", leadData);
    alert("Thank you for your interest! We'll contact you soon.");
    setShowLeadForm(false);
    setLeadData({
      name: "",
      email: "",
      phone: "",
      age: "",
      program: "",
      message: "",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        position: "relative",
      }}
    >
      <PublicHeader />
      
      {/* Background Effects */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(/assets/20250927-DSC_0446.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          opacity: 0.15,
          filter: "blur(10px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `rgba(5, 11, 32, 0.6)`,
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, 
            rgba(4, 61, 208, 0.4) 0%, 
            rgba(255, 169, 0, 0.3) 100%)`,
          zIndex: 2,
        }}
      />

      <div style={{ position: "relative", zIndex: 3, paddingTop: "100px" }}>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            textAlign: "center",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <motion.div
            style={{
              display: "inline-block",
              padding: `${spacing.xs} ${spacing.md}`,
              background: "rgba(0, 224, 255, 0.1)",
              border: `1px solid ${colors.accent.main}`,
              borderRadius: borderRadius.full,
              marginBottom: spacing.lg,
            }}
          >
            <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em" }}>
              EXPERIENCE REALVERSE
            </span>
          </motion.div>
          <motion.h1
            style={{
              ...typography.h1,
              fontSize: `clamp(2.5rem, 5vw, 4.5rem)`,
              color: colors.text.primary,
              marginBottom: spacing.lg,
              lineHeight: 1.2,
            }}
          >
            Discover How RealVerse
            <br />
            <span style={{ color: colors.accent.main }}>Transforms Player Development</span>
          </motion.h1>
          <motion.p
            style={{
              ...typography.body,
              fontSize: typography.fontSize.xl,
              color: colors.text.secondary,
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: 1.8,
              marginBottom: spacing["2xl"],
            }}
          >
            Take an interactive tour of RealVerse—our cutting-edge platform that combines technology, 
            data analytics, and modern training methodologies to accelerate your football journey.
          </motion.p>
        </motion.section>

        {/* Interactive Feature Tour */}
        <section style={{ padding: `0 ${spacing.xl} ${spacing["4xl"]}`, maxWidth: "1400px", margin: "0 auto" }}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: spacing.xl,
              marginBottom: spacing["3xl"],
            }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={feature.id}
                {...getStaggeredCard(idx)}
                whileHover={cardHover}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => setCurrentStep(idx)}
              >
                <Card
                  variant="elevated"
                  padding="xl"
                  style={{
                    height: "100%",
                    background: currentStep === idx
                      ? `linear-gradient(135deg, 
                          rgba(20, 31, 58, 0.95) 0%, 
                          rgba(15, 23, 42, 0.9) 100%)`
                      : `linear-gradient(135deg, 
                          rgba(20, 31, 58, 0.8) 0%, 
                          rgba(15, 23, 42, 0.7) 100%)`,
                    border: currentStep === idx
                      ? `2px solid ${feature.color}`
                      : `1px solid rgba(255, 255, 255, 0.15)`,
                    boxShadow: currentStep === idx
                      ? `0 8px 32px ${feature.color}30`
                      : `0 4px 16px rgba(0, 0, 0, 0.2)`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${colors.primary.main} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: spacing.lg,
                    }}
                  >
                    <feature.icon size={32} color={colors.text.onPrimary} />
                  </div>
                  <h3
                    style={{
                      ...typography.h3,
                      color: colors.text.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      marginBottom: spacing.md,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                    {feature.highlights.map((highlight, hIdx) => (
                      <div
                        key={hIdx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.sm,
                        }}
                      >
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            background: feature.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            ...typography.body,
                            color: colors.text.muted,
                            fontSize: typography.fontSize.sm,
                          }}
                        >
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Feature Showcase */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {(() => {
                const currentFeature = features[currentStep];
                const FeatureIcon = currentFeature.icon;
                return (
                  <Card
                    variant="elevated"
                    padding="xl"
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(20, 31, 58, 0.95) 0%, 
                        rgba(15, 23, 42, 0.9) 100%)`,
                      border: `1px solid rgba(255, 255, 255, 0.15)`,
                      marginBottom: spacing["3xl"],
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.xl }}>
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${currentFeature.color} 0%, ${colors.primary.main} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FeatureIcon size={32} color={colors.text.onPrimary} />
                      </div>
                      <div>
                        <h2
                          style={{
                            ...typography.h2,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                          }}
                        >
                          {currentFeature.title}
                        </h2>
                        <p
                          style={{
                            ...typography.body,
                            color: colors.text.secondary,
                          }}
                        >
                          {currentFeature.description}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))",
                        gap: spacing.lg,
                      }}
                    >
                      {currentFeature.highlights.map((highlight, hIdx) => (
                        <div
                          key={hIdx}
                          style={{
                            padding: spacing.md,
                            background: `rgba(255, 255, 255, 0.05)`,
                            borderRadius: borderRadius.lg,
                            border: `1px solid rgba(255, 255, 255, 0.1)`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: spacing.sm,
                              marginBottom: spacing.xs,
                            }}
                          >
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                background: currentFeature.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <span style={{ color: colors.text.onPrimary, fontSize: "12px", fontWeight: "bold" }}>✓</span>
                            </div>
                            <span
                              style={{
                                ...typography.body,
                                color: colors.text.primary,
                                fontWeight: typography.fontWeight.semibold,
                              }}
                            >
                              {highlight}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Dashboard Preview */}
                    {currentFeature.preview && (
                      <div style={{ marginTop: spacing["2xl"] }}>
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                            textAlign: "center",
                            marginBottom: spacing.md,
                            fontStyle: "italic",
                          }}
                        >
                          Interactive Preview - Click on feature cards above to explore different sections
                        </div>
                        <DashboardPreview previewType={currentFeature.preview} />
                      </div>
                    )}
                  </Card>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Programs Section */}
        <section
          style={{
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            background: `rgba(5, 11, 32, 0.5)`,
            marginTop: spacing["4xl"],
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            <motion.div
              variants={headingVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={viewportOnce}
              style={{ textAlign: "center", marginBottom: spacing["3xl"] }}
            >
              <h2
                style={{
                  ...typography.h2,
                  fontSize: `clamp(2rem, 4vw, 3rem)`,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Join Our Programs & Access RealVerse
              </h2>
              <p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                RealVerse is included with all our training programs. Choose the program that fits your goals.
              </p>
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
                marginBottom: spacing["3xl"],
              }}
            >
              {programs.map((program, idx) => (
                <motion.div
                  key={idx}
                  {...getStaggeredCard(idx)}
                  whileHover={cardHover}
                >
                  <Card
                    variant="elevated"
                    padding="xl"
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h3
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {program.name}
                    </h3>
                    <p
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        marginBottom: spacing.lg,
                      }}
                    >
                      {program.description}
                    </p>
                    <div style={{ flex: 1, marginBottom: spacing.lg }}>
                      {program.features.map((feature, fIdx) => (
                        <div
                          key={fIdx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: spacing.sm,
                            marginBottom: spacing.sm,
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: colors.primary.main,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <span style={{ color: colors.text.onPrimary, fontSize: "10px" }}>✓</span>
                          </div>
                          <span
                            style={{
                              ...typography.body,
                              color: colors.text.muted,
                              fontSize: typography.fontSize.sm,
                            }}
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    <motion.div
                      whileHover={primaryButtonHover}
                      whileTap={primaryButtonTap}
                      onClick={() => {
                        setLeadData({ ...leadData, program: program.name });
                        setShowLeadForm(true);
                      }}
                    >
                      <div
                        style={{
                          ...heroCTAStyles.blue,
                          width: "100%",
                          minHeight: 60,
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                          <span style={heroCTAStyles.blue.textStyle}>Get Started</span>
                          <span style={heroCTAStyles.blue.subtitleStyle}>Request a call from our team</span>
                        </div>
                        <span style={{ color: colors.text.onPrimary, fontWeight: 800, display: "flex", alignItems: "center", fontSize: "1.25rem", lineHeight: 1 }}>→</span>
                      </div>
                    </motion.div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            textAlign: "center",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8 }}
          >
            <h2
              style={{
                ...typography.h2,
                fontSize: `clamp(2rem, 4vw, 3rem)`,
                color: colors.text.primary,
                marginBottom: spacing.lg,
              }}
            >
              Ready to Transform Your Game?
            </h2>
            <p
              style={{
                ...typography.body,
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                marginBottom: spacing["2xl"],
                maxWidth: "700px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Join FC Real Bengaluru and get access to RealVerse—the platform that's revolutionizing 
              how players develop, train, and compete.
            </p>
            <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", flexWrap: "wrap" }}>
              <motion.div
                whileHover={primaryButtonHover}
                whileTap={primaryButtonTap}
                onClick={() => setShowLeadForm(true)}
              >
                <div style={{ ...heroCTAStyles.yellow, width: "auto", minWidth: 280 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={heroCTAStyles.yellow.textStyle}>Start Your Journey</span>
                    <span style={heroCTAStyles.yellow.subtitleStyle}>Talk to our coaching team</span>
                  </div>
                  <span style={{ color: colors.text.onAccent, fontWeight: 800, display: "flex", alignItems: "center", fontSize: "1.25rem", lineHeight: 1 }}>→</span>
                </div>
              </motion.div>
              <Link to="/brochure" style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={primaryButtonHover}
                  whileTap={primaryButtonTap}
                >
                  <div
                    style={{
                      ...heroCTAStyles.darkWithBorder,
                      width: "auto",
                      minWidth: 260,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing.md,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                      <span style={heroCTAStyles.darkWithBorder.textStyle}>Download Brochure</span>
                      <span style={heroCTAStyles.darkWithBorder.subtitleStyle}>Programs, fees, and pathways</span>
                    </div>
                    <span style={{ color: colors.accent.main, fontWeight: 800, display: "flex", alignItems: "center", fontSize: "1.25rem", lineHeight: 1 }}>→</span>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {showLeadForm && (
          <motion.div
            key="lead-form-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: spacing.xl,
            }}
            onClick={() => setShowLeadForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "500px", width: "100%" }}
            >
              <Card
                variant="elevated"
                padding="xl"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(20, 31, 58, 0.98) 0%, 
                    rgba(15, 23, 42, 0.95) 100%)`,
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl }}>
                  <h2
                    style={{
                      ...typography.h2,
                      color: colors.text.primary,
                    }}
                  >
                    Get Started Today
                  </h2>
                  <button
                    onClick={() => setShowLeadForm(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: colors.text.muted,
                      fontSize: "24px",
                      cursor: "pointer",
                      padding: spacing.xs,
                    }}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleLeadSubmit}>
                  <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                    <div>
                      <label
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.xs,
                          display: "block",
                        }}
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={leadData.name}
                        onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: spacing.md,
                          background: `rgba(255, 255, 255, 0.1)`,
                          border: `1px solid rgba(255, 255, 255, 0.2)`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          fontSize: typography.fontSize.base,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.xs,
                          display: "block",
                        }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={leadData.email}
                        onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                        style={{
                          width: "100%",
                          padding: spacing.md,
                          background: `rgba(255, 255, 255, 0.1)`,
                          border: `1px solid rgba(255, 255, 255, 0.2)`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          fontSize: typography.fontSize.base,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.xs,
                          display: "block",
                        }}
                      >
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={leadData.phone}
                        onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                        style={{
                          width: "100%",
                          padding: spacing.md,
                          background: `rgba(255, 255, 255, 0.1)`,
                          border: `1px solid rgba(255, 255, 255, 0.2)`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          fontSize: typography.fontSize.base,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.xs,
                          display: "block",
                        }}
                      >
                        Age
                      </label>
                      <input
                        type="number"
                        value={leadData.age}
                        onChange={(e) => setLeadData({ ...leadData, age: e.target.value })}
                        style={{
                          width: "100%",
                          padding: spacing.md,
                          background: `rgba(255, 255, 255, 0.1)`,
                          border: `1px solid rgba(255, 255, 255, 0.2)`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          fontSize: typography.fontSize.base,
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.xs,
                          display: "block",
                        }}
                      >
                        Program Interest
                      </label>
                      <select
                        value={leadData.program}
                        onChange={(e) => setLeadData({ ...leadData, program: e.target.value })}
                        style={{
                          width: "100%",
                          padding: spacing.md,
                          background: `rgba(255, 255, 255, 0.1)`,
                          border: `1px solid rgba(255, 255, 255, 0.2)`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          fontSize: typography.fontSize.base,
                        }}
                      >
                        <option value="">Select a program</option>
                        {programs.map((p, idx) => (
                          <option key={idx} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          marginBottom: spacing.xs,
                          display: "block",
                        }}
                      >
                        Message
                      </label>
                      <textarea
                        value={leadData.message}
                        onChange={(e) => setLeadData({ ...leadData, message: e.target.value })}
                        rows={4}
                        style={{
                          width: "100%",
                          padding: spacing.md,
                          background: `rgba(255, 255, 255, 0.1)`,
                          border: `1px solid rgba(255, 255, 255, 0.2)`,
                          borderRadius: borderRadius.md,
                          color: colors.text.primary,
                          fontSize: typography.fontSize.base,
                          fontFamily: typography.fontFamily.body,
                          resize: "vertical",
                        }}
                      />
                    </div>
                    <motion.div
                      whileHover={primaryButtonHover}
                      whileTap={primaryButtonTap}
                    >
                      <button
                        type="submit"
                        style={{
                          ...heroCTAStyles.yellow,
                          width: "100%",
                          border: "none",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                          <span style={heroCTAStyles.yellow.textStyle}>Submit Inquiry</span>
                          <span style={heroCTAStyles.yellow.subtitleStyle}>We'll contact you within 24–48 hours</span>
                        </div>
                        <span style={{ color: colors.text.onAccent, fontWeight: 800, display: "flex", alignItems: "center", fontSize: "1.25rem", lineHeight: 1 }}>→</span>
                      </button>
                    </motion.div>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealVerseExperiencePage;


import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { galleryAssets, academyAssets } from "../../config/assets";
import EnablePillarCard from "../ui/EnablePillarCard";
import { Button } from "../ui/Button";

const EnableSystemSection: React.FC = () => {
  const {
    staggerContainer,
    headingVariants,
    subheadingVariants,
    primaryButtonHover,
    primaryButtonTap,
    viewportOnce,
    getStaggeredCard,
    imageVariants,
  } = useHomepageAnimation();

  const leftPillar = {
    icon: "⚡",
    title: "Top-Tier Coaching & Modern Techniques",
    description:
      "We combine elite coaches and data to produce the promotions and performances you see above. Evidence-backed pathway planning, load management, and modern training prepare every player to compete and win.",
    bullets: [
      "Merit-based player pathway",
      "Modern training & load management",
      "Data-backed coaching decisions",
      "Personalized player development",
      "Advanced training techniques",
      "Transparent communication",
    ],
    ctaLabel: "Explore Coaching Pathways →",
    ctaHref: "/brochure",
    mediaImage: galleryAssets.actionShots[3]?.large || galleryAssets.actionShots[0]?.large || academyAssets.trainingShot,
    mediaAlt: "Modern Training",
  };

  const rightPillar = {
    icon: "💻",
    title: "RealVerse & Data Analytics",
    description:
      "Our integrated digital ecosystem powers every team with real-time data, performance tracking, and seamless communication—giving each player clear insights and actions to improve.",
    bullets: [
      "Real-time performance dashboards and KPIs",
      "Match & training video review with feedback",
      "Individual goals and progression tracking",
      "Load management alerts for player welfare",
      "Communication hub for schedules and updates",
      "Reports that tie effort to outcomes",
    ],
    ctaLabel: "Experience RealVerse →",
    ctaHref: "/realverse/experience",
    mediaImage: academyAssets.trainingShot,
    mediaAlt: "Data-Driven Development",
    mediaLabel: "Data-Driven Development",
  };

  return (
    <motion.div
      id="enable-system"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      viewport={{ once: false, amount: 0.2 }}
      style={{
        padding: `${spacing["4xl"]} ${spacing.xl}`,
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: spacing["2xl"] }}>
        <h3
          style={{
            ...typography.h2,
            color: colors.text.primary,
            marginBottom: spacing.xs,
            fontSize: "28px",
            lineHeight: 1.2,
          }}
        >
          How We Enable This
        </h3>
        <p
          style={{
            ...typography.body,
            color: colors.text.secondary,
            fontSize: "14.5px",
            opacity: 0.85,
            margin: 0,
          }}
        >
          Through RealVerse, data-driven insights, and top-tier coaching
        </p>
      </div>

      {/* System Frame */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        style={{
          position: "relative",
          borderRadius: 24,
          padding: spacing.lg,
          background: "rgba(8, 12, 24, 0.35)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: spacing.lg,
          alignItems: "stretch",
        }}
      >
        {/* Connector (desktop) */}
        <div
          className="enable-connector"
          style={{
            position: "absolute",
            top: "15%",
            bottom: "15%",
            left: "50%",
            width: "1px",
            background: "linear-gradient(transparent, rgba(0,255,255,0.35), transparent)",
            display: "none",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        <style>{`
          @media (min-width: 1024px) {
            .enable-connector { display: block; }
          }
          @media (max-width: 768px) {
            #enable-system-frame { padding: 16px; }
          }
        `}</style>

        {/* Left Pillar */}
        <motion.div variants={headingVariants} style={{ zIndex: 2 }}>
          <EnablePillarCard {...leftPillar} />
        </motion.div>

        {/* Right Pillar */}
        <motion.div variants={headingVariants} style={{ zIndex: 2 }}>
          <EnablePillarCard {...rightPillar} />
        </motion.div>
      </motion.div>

      {/* Section CTA */}
      <motion.div
        style={{ textAlign: "center", marginTop: spacing["3xl"] }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={viewportOnce}
      >
        <Link to="/brochure">
          <Button variant="primary" size="lg">
            Explore Our Complete Program →
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default EnableSystemSection;


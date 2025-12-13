/**
 * Interactive Brochure Page
 * Progressive, personalized experience that collects lead information
 * while showing relevant brochure content based on user inputs
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { api } from "../api/client";
import ExpandableCard from "../components/ExpandableCard";
import InfoModal from "../components/InfoModal";
import { 
  brochureAssets, 
  academyAssets, 
  heroAssets, 
  clubAssets,
  galleryAssets 
} from "../config/assets";

interface LeadData {
  age?: number;
  playerName?: string;
  playerDob?: string;
  ageBracket?: string;
  guardianName?: string;
  phone?: string;
  email?: string;
  preferredCentre?: string;
  programmeInterest?: string;
  playingPosition?: string;
  currentLevel?: string;
  heardFrom?: string;
  notes?: string;
}

type ProgramType = "youth" | "elite" | null;
type Step = "welcome" | "age" | "program" | "details" | "contact" | "summary" | "success";

const InteractiveBrochurePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [leadData, setLeadData] = useState<LeadData>({});
  const [programType, setProgramType] = useState<ProgramType>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const {
    infinitySectionVariants,
    headingVariants,
    cardVariants,
    buttonVariants,
    cardHover,
    viewportOnce,
    getStaggeredCard,
  } = useHomepageAnimation();

  // Determine program type based on age
  useEffect(() => {
    if (leadData.age !== undefined) {
      setProgramType(leadData.age <= 15 ? "youth" : "elite");
    }
  }, [leadData.age]);

  const updateLeadData = (field: keyof LeadData, value: any) => {
    setLeadData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case "age":
        if (!leadData.age || leadData.age < 5 || leadData.age > 50) {
          newErrors.age = "Please enter a valid age (5-50)";
        }
        break;
      case "details":
        if (!leadData.playerName?.trim()) {
          newErrors.playerName = "Player name is required";
        }
        if (!leadData.guardianName?.trim()) {
          newErrors.guardianName = "Guardian name is required";
        }
        break;
      case "contact":
        if (!leadData.phone?.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!/^[0-9]{10}$/.test(leadData.phone.replace(/\D/g, ""))) {
          newErrors.phone = "Please enter a valid 10-digit phone number";
        }
        if (!leadData.email?.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
          newErrors.email = "Please enter a valid email address";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    const stepOrder: Step[] = ["welcome", "age", "program", "details", "contact", "summary"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ["welcome", "age", "program", "details", "contact", "summary"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep("contact")) return;

    setLoading(true);
    try {
      // Determine age bracket
      const ageBracket = leadData.age! <= 11 ? "U11" :
                        leadData.age! <= 13 ? "U13" :
                        leadData.age! <= 15 ? "U15" :
                        leadData.age! <= 17 ? "U17" :
                        leadData.age! <= 19 ? "U19" :
                        leadData.age! <= 21 ? "U21" : "Senior";

      await api.createWebsiteLead({
        playerName: leadData.playerName!,
        playerDob: leadData.playerDob || null,
        ageBracket,
        guardianName: leadData.guardianName!,
        phone: leadData.phone!,
        email: leadData.email!,
        preferredCentre: leadData.preferredCentre || "TBD",
        programmeInterest: programType === "youth" ? "Youth Development" : "Elite Training",
        playingPosition: leadData.playingPosition || null,
        currentLevel: leadData.currentLevel || "Beginner",
        heardFrom: leadData.heardFrom || "Website",
        notes: leadData.notes || null,
      });

      setCurrentStep("success");
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Program-specific content
  const programContent = {
    youth: {
      title: "Youth Development Program",
      subtitle: "Building the Foundation for Future Stars",
      description: "Our Youth Development Program focuses on building fundamental skills, fostering a love for the game, and developing young players through age-appropriate training methods.",
      features: [
        "Age-appropriate skill development",
        "Focus on fun and fundamentals",
        "Youth League competition opportunities",
        "Character building and teamwork",
        "Regular progress assessments",
      ],
      leagues: ["U11 League", "U13 League", "U15 League", "Youth Tournaments"],
      image: academyAssets.trainingShot,
    },
    elite: {
      title: "Elite Training Program",
      subtitle: "Competitive Excellence & Professional Pathway",
      description: "Our Elite Training Program is designed for serious players aiming to compete at higher levels. We provide intensive training, tactical development, and pathway to professional divisions.",
      features: [
        "Advanced tactical training",
        "Physical conditioning programs",
        "Competitive league pathways (B, C, D, Super Division)",
        "Performance analytics",
        "Professional coaching staff",
      ],
      leagues: ["Karnataka B Division", "Karnataka C Division", "Karnataka D Division", "BDFA Super Division"],
      image: academyAssets.coachTalk,
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
        position: "relative",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
      }}
    >
      <PublicHeader />

      {/* Continuous background gradient */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(
            ellipse at 50% 50%,
            rgba(0, 224, 255, 0.1) 0%,
            transparent 70%
          )`,
          pointerEvents: "none",
          zIndex: 0,
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, paddingTop: "100px" }}>
        <AnimatePresence mode="wait">
          {/* WELCOME STEP */}
          {currentStep === "welcome" && (
            <motion.div
              key="welcome"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: `${spacing["2xl"]} ${spacing.xl}`,
                textAlign: "center",
              }}
            >
              <motion.div
                variants={headingVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={viewportOnce}
              >
                <h1
                  style={{
                    ...typography.display,
                    fontSize: `clamp(2.5rem, 6vw, 4rem)`,
                    color: colors.text.primary,
                    marginBottom: spacing.lg,
                  }}
                >
                  Welcome to FC Real Bengaluru
                </h1>
                <p
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.xl,
                    color: colors.text.secondary,
                    marginBottom: spacing["2xl"],
                    lineHeight: 1.8,
                  }}
                >
                  Let's personalize your journey. We'll show you exactly what matters to you
                  while learning more about your football aspirations.
                </p>
              </motion.div>

              <motion.div
                variants={buttonVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={viewportOnce}
              >
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleNext}
                  style={{
                    fontSize: typography.fontSize.lg,
                    padding: `${spacing.md} ${spacing["2xl"]}`,
                  }}
                >
                  Start Your Journey →
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* AGE STEP */}
          {currentStep === "age" && (
            <motion.div
              key="age"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: `${spacing["2xl"]} ${spacing.xl}`,
              }}
            >
              <Card variant="glass" padding="lg">
                <motion.div
                  variants={headingVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={viewportOnce}
                  style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
                >
                  <h2
                    style={{
                      ...typography.h2,
                      color: colors.text.primary,
                      marginBottom: spacing.md,
                    }}
                  >
                    Let's Start with Your Age
                  </h2>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.lg,
                    }}
                  >
                    This helps us show you the most relevant program information
                  </p>
                </motion.div>

                <div style={{ marginBottom: spacing.xl }}>
                  <label
                    style={{
                      ...typography.body,
                      color: colors.text.primary,
                      display: "block",
                      marginBottom: spacing.sm,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    Player's Age
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={leadData.age || ""}
                    onChange={(e) => updateLeadData("age", parseInt(e.target.value))}
                    style={{
                      width: "100%",
                      padding: spacing.md,
                      background: colors.surface.card,
                      border: `2px solid ${errors.age ? colors.error.main : "rgba(255, 255, 255, 0.1)"}`,
                      borderRadius: borderRadius.lg,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.lg,
                      textAlign: "center",
                    }}
                    placeholder="Enter age (5-50)"
                  />
                  {errors.age && (
                    <p style={{ color: colors.error.main, marginTop: spacing.xs, fontSize: typography.fontSize.sm }}>
                      {errors.age}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: spacing.md, justifyContent: "center" }}>
                  <Button variant="secondary" onClick={() => navigate("/")}>
                    Back to Home
                  </Button>
                  <Button variant="primary" onClick={handleNext} disabled={!leadData.age}>
                    Continue →
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* PROGRAM INFORMATION STEP */}
          {currentStep === "program" && programType && (
            <motion.div
              key="program"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: `${spacing["2xl"]} ${spacing.xl}`,
              }}
            >
              <motion.div
                variants={infinitySectionVariants}
                initial="offscreen"
                whileInView="onscreen"
                viewport={viewportOnce}
              >
                <Card variant="glass" padding="lg">
                  {/* Program Header */}
                  <motion.div
                    variants={headingVariants}
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={viewportOnce}
                    style={{
                      textAlign: "center",
                      marginBottom: spacing["2xl"],
                      position: "relative",
                    }}
                  >
                    {/* Logo/Image - Positioned above title with proper spacing */}
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        margin: "0 auto",
                        marginBottom: spacing.xl,
                        backgroundImage: `url(${programContent[programType].image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "50%",
                        border: `4px solid ${colors.accent.main}`,
                        boxShadow: `0 8px 32px rgba(0, 224, 255, 0.3)`,
                        position: "relative",
                        zIndex: 1,
                      }}
                    />
                    <h2
                      style={{
                        ...typography.h2,
                        color: colors.text.primary,
                        marginBottom: spacing.md,
                        marginTop: 0,
                      }}
                    >
                      {programContent[programType].title}
                    </h2>
                    <p
                      style={{
                        ...typography.body,
                        color: colors.accent.main,
                        fontSize: typography.fontSize.lg,
                        marginBottom: spacing.md,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      {programContent[programType].subtitle}
                    </p>
                    <p
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.base,
                        maxWidth: "700px",
                        margin: "0 auto",
                        lineHeight: 1.8,
                      }}
                    >
                      {programContent[programType].description}
                    </p>
                  </motion.div>

                  {/* Program Features */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: spacing.lg,
                      marginBottom: spacing["2xl"],
                    }}
                  >
                    {programContent[programType].features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        {...getStaggeredCard(idx)}
                        whileHover={cardHover}
                      >
                        <Card variant="elevated" padding="md">
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: spacing.md,
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: colors.accent.main,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: colors.text.onPrimary,
                                fontWeight: typography.fontWeight.bold,
                                flexShrink: 0,
                              }}
                            >
                              ✓
                            </div>
                            <p
                              style={{
                                ...typography.body,
                                color: colors.text.primary,
                                margin: 0,
                              }}
                            >
                              {feature}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* League Information */}
                  <motion.div
                    variants={headingVariants}
                    initial="offscreen"
                    whileInView="onscreen"
                    viewport={viewportOnce}
                    style={{
                      background: colors.surface.card,
                      borderRadius: borderRadius.xl,
                      padding: spacing.xl,
                      marginBottom: spacing.xl,
                    }}
                  >
                    <h3
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        marginBottom: spacing.md,
                        textAlign: "center",
                      }}
                    >
                      {programType === "youth" 
                        ? "Youth League Pathways" 
                        : "Competitive League Pathways"}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: spacing.md,
                        justifyContent: "center",
                      }}
                    >
                      {programContent[programType].leagues.map((league, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={cardHover}
                          style={{
                            padding: `${spacing.sm} ${spacing.md}`,
                            background: `linear-gradient(135deg, ${colors.accent.main}20, ${colors.primary.main}20)`,
                            border: `2px solid ${colors.accent.main}40`,
                            borderRadius: borderRadius.full,
                            color: colors.accent.main,
                            fontWeight: typography.fontWeight.semibold,
                          }}
                        >
                          {league}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <div style={{ display: "flex", gap: spacing.md, justifyContent: "center" }}>
                    <Button variant="secondary" onClick={handleBack}>
                      ← Back
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                      Continue to Details →
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* DETAILS STEP */}
          {currentStep === "details" && (
            <motion.div
              key="details"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: `${spacing["2xl"]} ${spacing.xl}`,
              }}
            >
              <Card variant="glass" padding="lg">
                <motion.div
                  variants={headingVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={viewportOnce}
                  style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
                >
                  <h2
                    style={{
                      ...typography.h2,
                      color: colors.text.primary,
                      marginBottom: spacing.md,
                    }}
                  >
                    Tell Us About the Player
                  </h2>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                    }}
                  >
                    Help us understand your football journey
                  </p>
                </motion.div>

                <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Player's Full Name *
                    </label>
                    <input
                      type="text"
                      value={leadData.playerName || ""}
                      onChange={(e) => updateLeadData("playerName", e.target.value)}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: `2px solid ${errors.playerName ? colors.error.main : "rgba(255, 255, 255, 0.1)"}`,
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                      placeholder="Enter player's full name"
                    />
                    {errors.playerName && (
                      <p style={{ color: colors.error.main, marginTop: spacing.xs, fontSize: typography.fontSize.sm }}>
                        {errors.playerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Guardian/Parent Name *
                    </label>
                    <input
                      type="text"
                      value={leadData.guardianName || ""}
                      onChange={(e) => updateLeadData("guardianName", e.target.value)}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: `2px solid ${errors.guardianName ? colors.error.main : "rgba(255, 255, 255, 0.1)"}`,
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                      placeholder="Enter guardian/parent name"
                    />
                    {errors.guardianName && (
                      <p style={{ color: colors.error.main, marginTop: spacing.xs, fontSize: typography.fontSize.sm }}>
                        {errors.guardianName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Current Playing Level
                    </label>
                    <select
                      value={leadData.currentLevel || ""}
                      onChange={(e) => updateLeadData("currentLevel", e.target.value)}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                    >
                      <option value="">Select level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Academy">Academy</option>
                      <option value="School Team">School Team</option>
                      <option value="District Level">District Level</option>
                      <option value="State Level">State Level</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Preferred Playing Position
                    </label>
                    <select
                      value={leadData.playingPosition || ""}
                      onChange={(e) => updateLeadData("playingPosition", e.target.value)}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                    >
                      <option value="">Select position</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                      <option value="Any">Any</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", marginTop: spacing.xl }}>
                  <Button variant="secondary" onClick={handleBack}>
                    ← Back
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Continue →
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* CONTACT STEP */}
          {currentStep === "contact" && (
            <motion.div
              key="contact"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: `${spacing["2xl"]} ${spacing.xl}`,
              }}
            >
              <Card variant="glass" padding="lg">
                <motion.div
                  variants={headingVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={viewportOnce}
                  style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
                >
                  <h2
                    style={{
                      ...typography.h2,
                      color: colors.text.primary,
                      marginBottom: spacing.md,
                    }}
                  >
                    How Can We Reach You?
                  </h2>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                    }}
                  >
                    We'll use this to get in touch about next steps
                  </p>
                </motion.div>

                <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={leadData.phone || ""}
                      onChange={(e) => updateLeadData("phone", e.target.value.replace(/\D/g, ""))}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: `2px solid ${errors.phone ? colors.error.main : "rgba(255, 255, 255, 0.1)"}`,
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                      placeholder="10-digit phone number"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p style={{ color: colors.error.main, marginTop: spacing.xs, fontSize: typography.fontSize.sm }}>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={leadData.email || ""}
                      onChange={(e) => updateLeadData("email", e.target.value)}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: `2px solid ${errors.email ? colors.error.main : "rgba(255, 255, 255, 0.1)"}`,
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p style={{ color: colors.error.main, marginTop: spacing.xs, fontSize: typography.fontSize.sm }}>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      Preferred Training Centre
                    </label>
                    <select
                      value={leadData.preferredCentre || ""}
                      onChange={(e) => updateLeadData("preferredCentre", e.target.value)}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                    >
                      <option value="">Select centre</option>
                      <option value="Depot 18">Depot 18</option>
                      <option value="3LOKK">3LOKK</option>
                      <option value="Training Center 3">Training Center 3</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        display: "block",
                        marginBottom: spacing.sm,
                        fontWeight: typography.fontWeight.semibold,
                      }}
                    >
                      How did you hear about us?
                    </label>
                    <select
                      value={leadData.heardFrom || ""}
                      onChange={(e) => updateLeadData("heardFrom", e.target.value)}
                      style={{
                        width: "100%",
                        padding: spacing.md,
                        background: colors.surface.card,
                        border: "2px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: borderRadius.lg,
                        color: colors.text.primary,
                        fontSize: typography.fontSize.base,
                      }}
                    >
                      <option value="">Select option</option>
                      <option value="Website">Website</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Referral">Referral</option>
                      <option value="Tournament">Tournament</option>
                      <option value="Friend/Family">Friend/Family</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", marginTop: spacing.xl }}>
                  <Button variant="secondary" onClick={handleBack}>
                    ← Back
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Review & Submit →
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* SUMMARY STEP */}
          {currentStep === "summary" && (
            <motion.div
              key="summary"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: `${spacing["2xl"]} ${spacing.xl}`,
              }}
            >
              <Card variant="glass" padding="lg">
                <motion.div
                  variants={headingVariants}
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={viewportOnce}
                  style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
                >
                  <h2
                    style={{
                      ...typography.h2,
                      color: colors.text.primary,
                      marginBottom: spacing.md,
                    }}
                  >
                    Review Your Information
                  </h2>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                    }}
                  >
                    Please review and submit to complete your application
                  </p>
                </motion.div>

                <div
                  style={{
                    background: colors.surface.card,
                    borderRadius: borderRadius.xl,
                    padding: spacing.xl,
                    marginBottom: spacing.xl,
                  }}
                >
                  <div style={{ display: "grid", gap: spacing.md }}>
                    <div>
                      <strong style={{ color: colors.text.muted }}>Program:</strong>{" "}
                      <span style={{ color: colors.text.primary }}>
                        {programType === "youth" ? "Youth Development Program" : "Elite Training Program"}
                      </span>
                    </div>
                    <div>
                      <strong style={{ color: colors.text.muted }}>Player Name:</strong>{" "}
                      <span style={{ color: colors.text.primary }}>{leadData.playerName}</span>
                    </div>
                    <div>
                      <strong style={{ color: colors.text.muted }}>Age:</strong>{" "}
                      <span style={{ color: colors.text.primary }}>{leadData.age} years</span>
                    </div>
                    <div>
                      <strong style={{ color: colors.text.muted }}>Guardian Name:</strong>{" "}
                      <span style={{ color: colors.text.primary }}>{leadData.guardianName}</span>
                    </div>
                    <div>
                      <strong style={{ color: colors.text.muted }}>Phone:</strong>{" "}
                      <span style={{ color: colors.text.primary }}>{leadData.phone}</span>
                    </div>
                    <div>
                      <strong style={{ color: colors.text.muted }}>Email:</strong>{" "}
                      <span style={{ color: colors.text.primary }}>{leadData.email}</span>
                    </div>
                    {leadData.currentLevel && (
                      <div>
                        <strong style={{ color: colors.text.muted }}>Current Level:</strong>{" "}
                        <span style={{ color: colors.text.primary }}>{leadData.currentLevel}</span>
                      </div>
                    )}
                    {leadData.preferredCentre && (
                      <div>
                        <strong style={{ color: colors.text.muted }}>Preferred Centre:</strong>{" "}
                        <span style={{ color: colors.text.primary }}>{leadData.preferredCentre}</span>
                      </div>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div
                    style={{
                      background: colors.error.main + "20",
                      border: `1px solid ${colors.error.main}`,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      marginBottom: spacing.lg,
                      color: colors.error.main,
                    }}
                  >
                    {errors.submit}
                  </div>
                )}

                <div style={{ display: "flex", gap: spacing.md, justifyContent: "center" }}>
                  <Button variant="secondary" onClick={handleBack}>
                    ← Back
                  </Button>
                  <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* SUCCESS STEP */}
          {currentStep === "success" && (
            <motion.div
              key="success"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                maxWidth: "700px",
                margin: "0 auto",
                padding: `${spacing["2xl"]} ${spacing.xl}`,
                textAlign: "center",
              }}
            >
              <Card variant="glass" padding="lg">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  style={{
                    width: "100px",
                    height: "100px",
                    margin: "0 auto",
                    marginBottom: spacing.xl,
                    borderRadius: "50%",
                    background: colors.success.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "48px",
                  }}
                >
                  ✓
                </motion.div>
                <h2
                  style={{
                    ...typography.h2,
                    color: colors.text.primary,
                    marginBottom: spacing.md,
                  }}
                >
                  Application Submitted!
                </h2>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.secondary,
                    fontSize: typography.fontSize.lg,
                    marginBottom: spacing["2xl"],
                    lineHeight: 1.8,
                  }}
                >
                  Thank you for your interest in FC Real Bengaluru! Our team will review your
                  application and get back to you within 24-48 hours.
                </p>
                <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button variant="primary" onClick={() => navigate("/")}>
                    Return to Home
                  </Button>
                  <Button variant="secondary" onClick={() => navigate("/realverse/login")}>
                    Already a Member? Login
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        {currentStep !== "welcome" && currentStep !== "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "fixed",
              bottom: spacing.xl,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
            }}
          >
            <div
              style={{
                background: colors.surface.card,
                backdropFilter: "blur(20px)",
                borderRadius: borderRadius.full,
                padding: `${spacing.sm} ${spacing.lg}`,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                display: "flex",
                gap: spacing.sm,
                alignItems: "center",
              }}
            >
              {["age", "program", "details", "contact", "summary"].map((step, idx) => {
                const stepOrder: Step[] = ["welcome", "age", "program", "details", "contact", "summary"];
                const currentIndex = stepOrder.indexOf(currentStep);
                const stepIndex = stepOrder.indexOf(step as Step);
                const isActive = stepIndex <= currentIndex;

                return (
                  <div
                    key={step}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: isActive ? colors.accent.main : "rgba(255, 255, 255, 0.3)",
                      transition: "all 0.3s ease",
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Info Modals */}
      <InfoModal
        isOpen={activeModal === "who-we-are"}
        onClose={() => setActiveModal(null)}
        title="Who We Are"
        image={brochureAssets.collage[0]}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
            FC Real Bengaluru is a multi-centre, Bengaluru-based football club operating across 4 strategic
            locations with consistent standards. We actively participate in youth & KSFA leagues across Karnataka.
          </p>
          <div style={{ display: "grid", gap: spacing.md }}>
            <Card variant="outlined" padding="md">
              <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                Multi-Centre Operations
              </h4>
              <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                Operating across 4 strategic locations with consistent standards and quality coaching.
              </p>
            </Card>
            <Card variant="outlined" padding="md">
              <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                Active League Participation
              </h4>
              <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                Competing in youth & KSFA leagues across Karnataka, providing regular competitive exposure.
              </p>
            </Card>
            <Card variant="outlined" padding="md">
              <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                Long-Term Development Model
              </h4>
              <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                Structured pathways from grassroots to senior competition, focusing on long-term growth.
              </p>
            </Card>
            <Card variant="outlined" padding="md">
              <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                Performance-Driven Environment
              </h4>
              <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                Merit-based advancement with transparent expectations and clear progress tracking.
              </p>
            </Card>
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "coaching-philosophy"}
        onClose={() => setActiveModal(null)}
        title="Our Coaching Philosophy"
        image={academyAssets.coachTalk}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            Our coaching philosophy is built on four core pillars that guide everything we do:
          </p>
          <div style={{ display: "grid", gap: spacing.md }}>
            {[
              {
                icon: "🎯",
                title: "Understanding the Game",
                desc: "We focus on developing tactical awareness and decision-making under pressure. Players learn to read the game, anticipate movements, and make intelligent choices on and off the ball.",
              },
              {
                icon: "📈",
                title: "Long-Term Growth",
                desc: "We prioritize development over short-term wins. Our approach ensures players build a strong foundation that serves them throughout their football journey, not just in the next match.",
              },
              {
                icon: "💬",
                title: "Accountability & Feedback",
                desc: "Honest communication and clear expectations are essential. We provide regular, constructive feedback that helps players understand their progress and areas for improvement.",
              },
              {
                icon: "🏆",
                title: "Competitive Excellence",
                desc: "We build winners through process and discipline. Success comes from consistent effort, proper preparation, and a commitment to excellence in every training session and match.",
              },
            ].map((item, idx) => (
              <Card key={idx} variant="elevated" padding="md">
                <div style={{ display: "flex", gap: spacing.md, alignItems: "flex-start" }}>
                  <div style={{ fontSize: typography.fontSize["2xl"], flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                      {item.title}
                    </h4>
                    <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "how-we-train"}
        onClose={() => setActiveModal(null)}
        title="How We Train"
        image={academyAssets.trainingShot}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            Our training methodology follows a structured 5-step process designed to develop complete footballers:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            {[
              {
                step: "1",
                title: "Technical Foundation",
                desc: "Ball mastery, passing, receiving, dribbling - building the fundamental skills that form the base of every great player. We focus on both feet and all surfaces of the foot.",
              },
              {
                step: "2",
                title: "Tactical Understanding",
                desc: "Position-specific work and match scenarios help players understand their role, spatial awareness, and how to work effectively within a team structure.",
              },
              {
                step: "3",
                title: "Physical Conditioning",
                desc: "Age-appropriate strength, speed, and agility training ensures players develop physically while avoiding injury and burnout.",
              },
              {
                step: "4",
                title: "Match Exposure",
                desc: "Regular competitive matches and tournaments provide real-world application of skills learned in training, building match intelligence and confidence.",
              },
              {
                step: "5",
                title: "Review & Feedback",
                desc: "Data-driven insights and improvement plans help players understand their progress, identify areas for growth, and set clear development goals.",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                variant="elevated"
                padding="md"
                style={{
                  display: "flex",
                  gap: spacing.md,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.primary.light})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.text.onPrimary,
                    fontWeight: typography.fontWeight.bold,
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                    {item.title}
                  </h4>
                  <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                    {item.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "data-feedback"}
        onClose={() => setActiveModal(null)}
        title="Data, Feedback & Modern Practices"
        image={academyAssets.trainingShot}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            We use technology and data to ensure transparency, accountability, and continuous improvement:
          </p>
          <div style={{ display: "grid", gap: spacing.md }}>
            {[
              {
                title: "Data-Backed Tracking",
                desc: "Attendance & load monitoring for accountability. We track every training session, match, and player metric to ensure optimal development and prevent overtraining.",
              },
              {
                title: "Performance Reviews",
                desc: "Structured assessments and progress tracking help players and parents understand development trajectory. Regular reviews ensure everyone stays aligned on goals.",
              },
              {
                title: "Transparent Communication",
                desc: "RealVerse platform keeps everyone aligned. Players, parents, and coaches have access to the same information, ensuring clear communication and expectations.",
              },
              {
                title: "Clear Progress Visibility",
                desc: "Players & parents see development trajectory in real-time. No guessing - you always know where you stand and what's needed to reach the next level.",
              },
            ].map((item, idx) => (
              <Card key={idx} variant="glass" padding="md">
                <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                  {item.title}
                </h4>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "coaches"}
        onClose={() => setActiveModal(null)}
        title="Our Coaches"
        image={academyAssets.coachTalk}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            Qualified professionals committed to systematic player development. Our coaching system ensures
            consistency across all centres.
          </p>
          <div style={{ display: "grid", gap: spacing.md }}>
            {[
              {
                role: "Head Coach",
                level: "AFC Licensed",
                philosophy: "Long-term development through structured progression. Focus on building complete footballers who understand the game at a deep level.",
                responsibilities: [
                  "Overall program strategy and development",
                  "Senior team and elite pathway coaching",
                  "Coach development and mentoring",
                ],
              },
              {
                role: "Development Coach",
                level: "KSFA Certified",
                philosophy: "Building technical foundations and tactical awareness. Creating players who can think and adapt on the pitch.",
                responsibilities: [
                  "Age-group specific training programs",
                  "Technical skill development",
                  "Tactical education and game understanding",
                ],
              },
              {
                role: "Grassroots Coach",
                level: "Youth Specialist",
                philosophy: "Creating positive environments for young players. Making football fun while building fundamental skills and love for the game.",
                responsibilities: [
                  "U11-U15 age group coaching",
                  "Fundamental skill development",
                  "Character building and values",
                ],
              },
            ].map((coach, idx) => (
              <Card key={idx} variant="elevated" padding="md">
                <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                  {coach.role}
                </h4>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.accent.main,
                    marginBottom: spacing.sm,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {coach.level}
                </div>
                <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                  {coach.philosophy}
                </p>
                <div>
                  <strong style={{ color: colors.text.primary, fontSize: typography.fontSize.sm }}>Key Responsibilities:</strong>
                  <ul style={{ marginTop: spacing.xs, paddingLeft: spacing.md, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                    {coach.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "pathway"}
        onClose={() => setActiveModal(null)}
        title="Merit-Based Pathway"
        image={heroAssets.teamCelebration}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            Advancement is based on consistency, discipline, and performance. No fixed guarantees - players earn
            their place through dedication and results.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
            {[
              {
                level: "Super Division Team",
                desc: "Top-tier competitive football. The highest level of competition in Karnataka state football.",
                requirements: ["Consistent high performance", "Excellent attendance", "Leadership qualities", "Tactical maturity"],
                color: colors.accent.main,
              },
              {
                level: "Karnataka B Division",
                desc: "Advanced competitive level. Strong technical and tactical players ready for state-level competition.",
                requirements: ["Strong technical skills", "Good tactical understanding", "Regular attendance", "Competitive mindset"],
                color: colors.primary.light,
              },
              {
                level: "Karnataka C Division",
                desc: "Intermediate competitive play. Developing players with solid fundamentals and growing game intelligence.",
                requirements: ["Solid fundamentals", "Improving tactical awareness", "Commitment to training", "Positive attitude"],
                color: colors.primary.main,
              },
              {
                level: "Karnataka D Division",
                desc: "Entry-level competitive exposure. Players building experience and confidence in competitive environments.",
                requirements: ["Basic skills", "Willingness to learn", "Regular attendance", "Team player mentality"],
                color: colors.info.main,
              },
              {
                level: "Youth Leagues",
                desc: "Foundation and development. Where young players learn the game, build skills, and develop a love for football.",
                requirements: ["Enthusiasm for football", "Basic coordination", "Regular participation", "Respect for coaches and teammates"],
                color: colors.success.main,
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                variant="elevated"
                padding="md"
                style={{
                  borderLeft: `4px solid ${item.color}`,
                }}
              >
                <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                  {item.level}
                </h4>
                <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm, marginBottom: spacing.sm }}>
                  {item.desc}
                </p>
                <div>
                  <strong style={{ color: colors.text.primary, fontSize: typography.fontSize.sm }}>Key Requirements:</strong>
                  <ul style={{ marginTop: spacing.xs, paddingLeft: spacing.md, color: colors.text.secondary, fontSize: typography.fontSize.sm }}>
                    {item.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "match-exposure"}
        onClose={() => setActiveModal(null)}
        title="Match Exposure & Off-Season Work"
        image={academyAssets.coachTalk}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            Regular competitive exposure is essential for player development. We provide multiple opportunities
            for match play throughout the year.
          </p>
          <div style={{ display: "grid", gap: spacing.md }}>
            {[
              {
                label: "League Matches",
                desc: "Regular competitive league fixtures provide consistent match exposure. Players compete in age-appropriate leagues throughout the season.",
                color: colors.primary.main,
              },
              {
                label: "Friendly Fixtures",
                desc: "Additional friendly matches against quality opposition help players develop without the pressure of league points. Great for trying new tactics and positions.",
                color: colors.info.main,
              },
              {
                label: "Off-Season Conditioning",
                desc: "Structured off-season programs ensure players maintain fitness and continue developing during breaks. Prevents regression and builds on previous season's gains.",
                color: colors.success.main,
              },
              {
                label: "Exposure Planning",
                desc: "Strategic planning ensures players get appropriate match exposure at the right level. We balance challenge with success to build confidence and skills.",
                color: colors.accent.main,
              },
            ].map((item, idx) => (
              <Card key={idx} variant="elevated" padding="md">
                <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm }}>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <h4 style={{ ...typography.h5, color: colors.text.primary, margin: 0 }}>
                    {item.label}
                  </h4>
                </div>
                <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, margin: 0 }}>
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "values"}
        onClose={() => setActiveModal(null)}
        title="Values Beyond Football"
        image={heroAssets.teamCelebration}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            We believe football is a vehicle for developing character and life skills that extend far beyond the pitch.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: spacing.md }}>
            {[
              {
                value: "Discipline",
                impact: "Regular attendance and commitment teach players the importance of showing up, even when it's hard. This builds habits that serve them in all areas of life.",
              },
              {
                value: "Responsibility",
                impact: "Ownership of development means players learn to take charge of their growth. They understand that success comes from their own effort and choices.",
              },
              {
                value: "Leadership",
                impact: "Leading by example on and off the pitch develops confidence and the ability to influence others positively. These skills transfer to school, work, and relationships.",
              },
              {
                value: "Team Coordination",
                impact: "Collective success mindset teaches players that individual achievement is enhanced by working together. They learn collaboration and mutual support.",
              },
              {
                value: "Time Management",
                impact: "Balancing football and life teaches essential organizational skills. Players learn to prioritize, plan, and manage multiple commitments effectively.",
              },
            ].map((item, idx) => (
              <Card key={idx} variant="outlined" padding="md">
                <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                  {item.value}
                </h4>
                <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                  {item.impact}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === "seminars"}
        onClose={() => setActiveModal(null)}
        title="Seminars, Networking & Tech"
        image={academyAssets.trainingShot}
      >
        <div>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg }}>
            We provide comprehensive support beyond training through seminars, networking, and technology.
          </p>
          <div style={{ display: "grid", gap: spacing.md }}>
            {[
              {
                title: "Player & Parent Seminars",
                desc: "Regular seminars on nutrition, injury prevention, and academic balance help players and families navigate the challenges of competitive football. Topics include proper recovery, mental health, and balancing sport with education.",
              },
              {
                title: "Career Discussions",
                desc: "Pathways beyond football and education are explored through career discussions. We help players understand their options, whether pursuing professional football, higher education, or other career paths.",
              },
              {
                title: "Networking Events",
                desc: "Connecting with the football community through networking events helps players build relationships, learn from others' experiences, and create opportunities for their future.",
              },
              {
                title: "Tech-Enabled Operations",
                desc: "RealVerse platform provides transparency and efficiency. Players and parents can track progress, view schedules, communicate with coaches, and access resources all in one place.",
              },
            ].map((item, idx) => (
              <Card key={idx} variant="elevated" padding="md">
                <h4 style={{ ...typography.h5, color: colors.text.primary, marginBottom: spacing.xs }}>
                  {item.title}
                </h4>
                <p style={{ ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm }}>
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </InfoModal>
    </div>
  );
};

export default InteractiveBrochurePage;



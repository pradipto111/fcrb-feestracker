import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { heroCTAStyles, heroCTAPillStyles } from "../theme/hero-design-patterns";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { api } from "../api/client";

type TabType = "apply" | "login";

const RealVerseJoinPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("apply");
  const [formData, setFormData] = useState({
    playerName: "",
    playerDob: "",
    ageBracket: "",
    guardianName: "",
    phone: "",
    email: "",
    preferredCentre: "",
    programmeInterest: "",
    playingPosition: "",
    currentLevel: "",
    heardFrom: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const centers = ["Depot 18", "3LOKK", "Training Center 3"];
  const programmes = [
    "Grassroots",
    "Development",
    "High Performance",
    "Women's Programme",
    "Goalkeeper Training",
  ];
  const levels = [
    "Beginner",
    "Academy",
    "School Team",
    "State Level",
    "District Level",
    "Other",
  ];
  const heardFromOptions = [
    "Referral",
    "Instagram",
    "Facebook",
    "Tournament",
    "Friend/Family",
    "Website",
    "Other",
  ];
  const ageBrackets = ["U11", "U13", "U15", "U17", "U19", "U21", "Senior"];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.playerName.trim()) {
      newErrors.playerName = "Player name is required";
    }
    if (!formData.playerDob && !formData.ageBracket) {
      newErrors.ageBracket = "Please provide date of birth or age bracket";
    }
    if (!formData.guardianName.trim()) {
      newErrors.guardianName = "Guardian name is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.preferredCentre) {
      newErrors.preferredCentre = "Please select a preferred centre";
    }
    if (!formData.programmeInterest) {
      newErrors.programmeInterest = "Please select a programme interest";
    }
    if (!formData.currentLevel) {
      newErrors.currentLevel = "Please select current football level";
    }
    if (!formData.heardFrom) {
      newErrors.heardFrom = "Please let us know how you heard about us";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.createWebsiteLead({
        playerName: formData.playerName,
        playerDob: formData.playerDob || null,
        ageBracket: formData.ageBracket || null,
        guardianName: formData.guardianName,
        phone: formData.phone,
        email: formData.email,
        preferredCentre: formData.preferredCentre,
        programmeInterest: formData.programmeInterest,
        playingPosition: formData.playingPosition || null,
        currentLevel: formData.currentLevel,
        heardFrom: formData.heardFrom,
        notes: formData.notes || null,
      });
      setSubmitted(true);
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to submit application. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
          color: colors.text.primary,
        }}
      >
        <PublicHeader />
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: `${spacing["4xl"]} ${spacing.xl}`,
            paddingTop: "120px",
            textAlign: "center",
          }}
        >
          <Card variant="elevated" padding="xl">
            <div style={{ fontSize: typography.fontSize["6xl"], marginBottom: spacing.lg }}>✓</div>
            <h1
              style={{
                ...typography.h1,
                marginBottom: spacing.lg,
                color: colors.text.primary,
              }}
            >
              Application Received
            </h1>
            <p
              style={{
                ...typography.body,
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                marginBottom: spacing.xl,
                lineHeight: 1.7,
              }}
            >
              Thank you for your interest in RealVerse Academy. Our team will review your
              application and contact you within 24–48 hours.
            </p>
            <div
              style={{
                display: "flex",
                gap: spacing.md,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: spacing["2xl"],
              }}
            >
              <Link to="/" style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...heroCTAPillStyles.base, ...heroCTAPillStyles.blue, padding: "10px 14px" }}
                >
                  Go Back to Home
                </motion.div>
              </Link>
              <Link to="/shop" style={{ textDecoration: "none" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...heroCTAPillStyles.base, ...heroCTAPillStyles.gold, padding: "10px 14px" }}
                >
                  Visit Shop
                </motion.div>
              </Link>
              <a
                href="https://www.instagram.com/realbengaluru/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...heroCTAPillStyles.base, padding: "10px 14px" }}
                >
                  Follow Us on Instagram
                </motion.div>
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
      }}
    >
      <PublicHeader />
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          paddingTop: "120px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: spacing["2xl"],
            alignItems: "flex-start",
          }}
        >
          {/* Left Side - Brand Messaging */}
          <div>
            <h1
              style={{
                ...typography.h1,
                marginBottom: spacing.lg,
                color: colors.text.primary,
              }}
            >
              RealVerse Academy
            </h1>
            <p
              style={{
                ...typography.body,
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                marginBottom: spacing.lg,
                lineHeight: 1.7,
              }}
            >
              FC Real Bengaluru's data-backed football pathway. RealVerse Academy connects players,
              parents, and coaches through structured training, transparent communication, and clear
              progression into competitive squads.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
              }}
            >
              {[
                "Structured academy programmes from grassroots to high performance",
                "Attendance & sessions tracked on record",
                "Transparent fees & clear communication",
                "Pathway into competitive squads",
              ].map((point, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.md,
                    color: colors.text.secondary,
                  }}
                >
                  <span
                    style={{
                      color: colors.primary.light,
                      fontSize: typography.fontSize.xl,
                      marginTop: "2px",
                    }}
                  >
                    →
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side - Tabs */}
          <Card variant="elevated" padding="none">
            {/* Tab Headers */}
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
              }}
            >
              <motion.button
                type="button"
                onClick={() => setActiveTab("apply")}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  flex: 1,
                  padding: spacing.lg,
                  ...heroCTAPillStyles.base,
                  borderRadius: 0,
                  boxShadow: "none",
                  border: "none",
                  borderBottom: activeTab === "apply" ? `2px solid ${colors.accent.main}` : "2px solid transparent",
                  background: activeTab === "apply" ? "rgba(255,255,255,0.04)" : "transparent",
                  color: activeTab === "apply" ? colors.text.primary : colors.text.muted,
                  fontWeight: activeTab === "apply" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                  transition: "all 0.2s ease",
                }}
              >
                Apply to RealVerse Academy
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setActiveTab("login")}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  flex: 1,
                  padding: spacing.lg,
                  ...heroCTAPillStyles.base,
                  borderRadius: 0,
                  boxShadow: "none",
                  border: "none",
                  borderBottom: activeTab === "login" ? `2px solid ${colors.accent.main}` : "2px solid transparent",
                  background: activeTab === "login" ? "rgba(255,255,255,0.04)" : "transparent",
                  color: activeTab === "login" ? colors.text.primary : colors.text.muted,
                  fontWeight: activeTab === "login" ? typography.fontWeight.semibold : typography.fontWeight.medium,
                  transition: "all 0.2s ease",
                }}
              >
                Already a member? Log in
              </motion.button>
            </div>

            {/* Tab Content */}
            <div style={{ padding: spacing.xl }}>
              {activeTab === "apply" ? (
                <div>
                  <h2
                    style={{
                      ...typography.h2,
                      marginBottom: spacing.lg,
                      color: colors.text.primary,
                    }}
                  >
                    Application Form
                  </h2>

                  {errors.submit && (
                    <div
                      style={{
                        padding: spacing.md,
                        background: colors.danger.soft,
                        color: colors.danger.main,
                        borderRadius: borderRadius.md,
                        marginBottom: spacing.lg,
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {errors.submit}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: spacing.lg,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Player Full Name *
                        </label>
                        <Input
                          value={formData.playerName}
                          onChange={(e) =>
                            setFormData({ ...formData, playerName: e.target.value })
                          }
                          placeholder="Enter player's full name"
                          error={errors.playerName}
                        />
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: spacing.md,
                        }}
                      >
                        <div>
                          <label
                            style={{
                              ...typography.body,
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.semibold,
                              color: colors.text.primary,
                              marginBottom: spacing.xs,
                              display: "block",
                            }}
                          >
                            Date of Birth
                          </label>
                          <Input
                            type="date"
                            value={formData.playerDob}
                            onChange={(e) =>
                              setFormData({ ...formData, playerDob: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              ...typography.body,
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.semibold,
                              color: colors.text.primary,
                              marginBottom: spacing.xs,
                              display: "block",
                            }}
                          >
                            Age Bracket
                          </label>
                          <select
                            value={formData.ageBracket}
                            onChange={(e) =>
                              setFormData({ ...formData, ageBracket: e.target.value })
                            }
                            style={{
                              width: "100%",
                              padding: spacing.md,
                              background: colors.surface.card,
                              border: `1px solid ${errors.ageBracket ? colors.danger.main : "rgba(255, 255, 255, 0.1)"}`,
                              borderRadius: borderRadius.md,
                              color: colors.text.primary,
                              fontSize: typography.fontSize.base,
                              fontFamily: typography.fontFamily.primary,
                            }}
                          >
                            <option value="">Select age bracket</option>
                            {ageBrackets.map((bracket) => (
                              <option key={bracket} value={bracket}>
                                {bracket}
                              </option>
                            ))}
                          </select>
                          {errors.ageBracket && (
                            <div
                              style={{
                                ...typography.caption,
                                color: colors.danger.main,
                                marginTop: spacing.xs,
                              }}
                            >
                              {errors.ageBracket}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Guardian Name *
                        </label>
                        <Input
                          value={formData.guardianName}
                          onChange={(e) =>
                            setFormData({ ...formData, guardianName: e.target.value })
                          }
                          placeholder="Enter guardian's full name"
                          error={errors.guardianName}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Primary Phone (WhatsApp) *
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="10-digit phone number"
                          error={errors.phone}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="your.email@example.com"
                          error={errors.email}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Preferred Centre *
                        </label>
                        <select
                          value={formData.preferredCentre}
                          onChange={(e) =>
                            setFormData({ ...formData, preferredCentre: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: spacing.md,
                            background: colors.surface.card,
                            border: `1px solid ${errors.preferredCentre ? colors.danger.main : "rgba(255, 255, 255, 0.1)"}`,
                            borderRadius: borderRadius.md,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.base,
                            fontFamily: typography.fontFamily.primary,
                          }}
                        >
                          <option value="">Select centre</option>
                          {centers.map((center) => (
                            <option key={center} value={center}>
                              {center}
                            </option>
                          ))}
                        </select>
                        {errors.preferredCentre && (
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.danger.main,
                              marginTop: spacing.xs,
                            }}
                          >
                            {errors.preferredCentre}
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Programme Interest *
                        </label>
                        <select
                          value={formData.programmeInterest}
                          onChange={(e) =>
                            setFormData({ ...formData, programmeInterest: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: spacing.md,
                            background: colors.surface.card,
                            border: `1px solid ${errors.programmeInterest ? colors.danger.main : "rgba(255, 255, 255, 0.1)"}`,
                            borderRadius: borderRadius.md,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.base,
                            fontFamily: typography.fontFamily.primary,
                          }}
                        >
                          <option value="">Select programme</option>
                          {programmes.map((programme) => (
                            <option key={programme} value={programme}>
                              {programme}
                            </option>
                          ))}
                        </select>
                        {errors.programmeInterest && (
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.danger.main,
                              marginTop: spacing.xs,
                            }}
                          >
                            {errors.programmeInterest}
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Playing Position (Optional)
                        </label>
                        <Input
                          value={formData.playingPosition}
                          onChange={(e) =>
                            setFormData({ ...formData, playingPosition: e.target.value })
                          }
                          placeholder="e.g., Forward, Midfielder, Defender, Goalkeeper"
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Current Football Level *
                        </label>
                        <select
                          value={formData.currentLevel}
                          onChange={(e) =>
                            setFormData({ ...formData, currentLevel: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: spacing.md,
                            background: colors.surface.card,
                            border: `1px solid ${errors.currentLevel ? colors.danger.main : "rgba(255, 255, 255, 0.1)"}`,
                            borderRadius: borderRadius.md,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.base,
                            fontFamily: typography.fontFamily.primary,
                          }}
                        >
                          <option value="">Select level</option>
                          {levels.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        {errors.currentLevel && (
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.danger.main,
                              marginTop: spacing.xs,
                            }}
                          >
                            {errors.currentLevel}
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          How did you hear about us? *
                        </label>
                        <select
                          value={formData.heardFrom}
                          onChange={(e) =>
                            setFormData({ ...formData, heardFrom: e.target.value })
                          }
                          style={{
                            width: "100%",
                            padding: spacing.md,
                            background: colors.surface.card,
                            border: `1px solid ${errors.heardFrom ? colors.danger.main : "rgba(255, 255, 255, 0.1)"}`,
                            borderRadius: borderRadius.md,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.base,
                            fontFamily: typography.fontFamily.primary,
                          }}
                        >
                          <option value="">Select option</option>
                          {heardFromOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.heardFrom && (
                          <div
                            style={{
                              ...typography.caption,
                              color: colors.danger.main,
                              marginTop: spacing.xs,
                            }}
                          >
                            {errors.heardFrom}
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          style={{
                            ...typography.body,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                            display: "block",
                          }}
                        >
                          Anything you'd like us to know? (Optional)
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                          placeholder="Additional information, questions, or special requests..."
                          rows={4}
                          style={{
                            width: "100%",
                            padding: spacing.md,
                            background: colors.surface.card,
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: borderRadius.md,
                            color: colors.text.primary,
                            fontSize: typography.fontSize.base,
                            fontFamily: typography.fontFamily.primary,
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { y: -2, boxShadow: shadows.buttonHover } : undefined}
                        whileTap={!loading ? { scale: 0.98 } : undefined}
                        style={{
                          ...heroCTAStyles.yellow,
                          width: "100%",
                          opacity: loading ? 0.65 : 1,
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                        aria-label="Submit Application"
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                          <span style={heroCTAStyles.yellow.textStyle}>{loading ? "Submitting..." : "Submit Application"}</span>
                          <span style={heroCTAStyles.yellow.subtitleStyle}>We'll contact you within 24–48 hours</span>
                        </div>
                        <span style={{ color: colors.text.onAccent, fontWeight: 800, display: "flex", alignItems: "center", fontSize: "1.25rem", lineHeight: 1 }}>→</span>
                      </motion.button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <h2
                    style={{
                      ...typography.h2,
                      marginBottom: spacing.lg,
                      color: colors.text.primary,
                    }}
                  >
                    Log in to RealVerse
                  </h2>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      marginBottom: spacing.xl,
                      lineHeight: 1.7,
                    }}
                  >
                    If you already have a RealVerse Academy account, log in to access your dashboard,
                    view attendance, manage payments, and stay connected with your team.
                  </p>
                  <Link to="/realverse/login" style={{ textDecoration: "none" }}>
                    <motion.div
                      whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                      whileTap={{ scale: 0.98 }}
                      style={{ ...heroCTAStyles.blue, width: "100%" }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                        <span style={heroCTAStyles.blue.textStyle}>Go to Login Page</span>
                        <span style={heroCTAStyles.blue.subtitleStyle}>Access your dashboard and updates</span>
                      </div>
                      <span style={{ color: colors.text.onPrimary, fontWeight: 800, display: "flex", alignItems: "center", fontSize: "1.25rem", lineHeight: 1 }}>→</span>
                    </motion.div>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealVerseJoinPage;

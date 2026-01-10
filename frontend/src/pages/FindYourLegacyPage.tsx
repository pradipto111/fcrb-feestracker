import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { api } from "../api/client";

interface Player {
  id: string;
  name: string;
  position: string;
  archetype: string;
  primeAge: number;
  heightCm: number;
  weightKg: number;
  legacy: {
    spark: string;
    breakthrough: string;
    peak: string;
    legacy: string;
  };
}

interface LegacyLeadData {
  name: string;
  phone: string;
  age: number;
  heightCmInput: number;
  weightKgInput: number;
  heightCmBucket: number;
  weightKgBucket: number;
  matchedPlayerId: string;
  matchedPlayerName: string;
  matchedPlayerPosition: string;
  matchedPlayerArchetype: string;
  matchedPlayerLegacy: Player["legacy"];
  consent: boolean;
}

const FindYourLegacyPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<LegacyLeadData>>({
    name: "",
    phone: "",
    age: undefined,
    heightCmInput: undefined,
    weightKgInput: undefined,
    consent: false,
  });
  const [matchedPlayer, setMatchedPlayer] = useState<Player | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  // Load dataset once
  useEffect(() => {
    const loadDataset = async () => {
      try {
        const response = await fetch("/data/find_your_legacy_players.json");
        const data = await response.json();
        setPlayers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load player dataset:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDataset();
  }, []);

  // Validation functions
  const validateStep1 = () => true; // Intro step
  const validateStep2 = () => {
    return (
      formData.name &&
      formData.name.length >= 2 &&
      formData.name.length <= 40 &&
      formData.phone &&
      formData.phone.length >= 10 &&
      formData.consent
    );
  };
  const validateStep3 = () => {
    return (
      formData.age !== undefined &&
      formData.age >= 6 &&
      formData.age <= 60 &&
      formData.heightCmInput !== undefined &&
      formData.heightCmInput >= 140 &&
      formData.heightCmInput <= 220 &&
      formData.weightKgInput !== undefined &&
      formData.weightKgInput >= 35 &&
      formData.weightKgInput <= 140
    );
  };
  const validateStep4 = () => true; // Confirmation step

  const snapToBucket = (value: number, min: number, max: number, step: number): number => {
    const clamped = Math.max(min, Math.min(max, value));
    return Math.round(clamped / step) * step;
  };

  const findMatch = (age: number, height: number, weight: number): Player | null => {
    if (players.length === 0) return null;

    // Snap to buckets
    const heightBucket = snapToBucket(height, 150, 205, 5);
    const weightBucket = snapToBucket(weight, 45, 115, 5);
    const ageClamped = Math.max(6, Math.min(60, age));

    // Try exact match first
    const exactMatch = players.find(
      (p) => p.primeAge === ageClamped && p.heightCm === heightBucket && p.weightKg === weightBucket
    );

    if (exactMatch) return exactMatch;

    // Fallback: find nearest by score
    let bestMatch: Player | null = null;
    let bestScore = Infinity;

    for (const player of players) {
      const heightDiff = Math.abs(player.heightCm - heightBucket);
      const weightDiff = Math.abs(player.weightKg - weightBucket);
      const ageDiff = Math.abs(player.primeAge - ageClamped);
      const score = heightDiff * 1.2 + weightDiff * 1.0 + ageDiff * 0.6;

      if (score < bestScore) {
        bestScore = score;
        bestMatch = player;
      }
    }

    return bestMatch;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    } else if (step === 4 && validateStep4()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || formData.age === undefined || formData.heightCmInput === undefined || formData.weightKgInput === undefined) {
      return;
    }

    setSubmitting(true);

    try {
      // Find match
      const match = findMatch(formData.age, formData.heightCmInput, formData.weightKgInput);
      if (!match) {
        alert("Could not find a match. Please try again.");
        setSubmitting(false);
        return;
      }

      setMatchedPlayer(match);

      // Snap to buckets
      const heightBucket = snapToBucket(formData.heightCmInput, 150, 205, 5);
      const weightBucket = snapToBucket(formData.weightKgInput, 45, 115, 5);

      // Save lead
      const leadData: LegacyLeadData = {
        name: formData.name!,
        phone: formData.phone!,
        age: formData.age,
        heightCmInput: formData.heightCmInput,
        weightKgInput: formData.weightKgInput,
        heightCmBucket: heightBucket,
        weightKgBucket: weightBucket,
        matchedPlayerId: match.id,
        matchedPlayerName: match.name,
        matchedPlayerPosition: match.position,
        matchedPlayerArchetype: match.archetype,
        matchedPlayerLegacy: match.legacy,
        consent: formData.consent || false,
      };

      await api.createLegacyLead(leadData);

      // Move to result step
      setStep(5);
    } catch (error: any) {
      console.error("Failed to submit:", error);
      alert("Failed to save your information. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestCall = async () => {
    try {
      // Note: In a real implementation, we'd store the lead ID and update it here
      // For now, we'll just show the toast as the lead was already created with status NEW
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Failed to request call:", error);
    }
  };

  const normalizePhone = (phone: string): string => {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, "");
  };

  const handlePhoneChange = (value: string) => {
    const normalized = normalizePhone(value);
    setFormData({ ...formData, phone: normalized });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: colors.club.deep, color: colors.text.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...typography.h3, color: colors.text.secondary }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.club.deep, color: colors.text.primary, position: "relative" }}>
      <PublicHeader />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 100,
              right: spacing.xl,
              background: colors.success.main,
              color: colors.text.primary,
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              boxShadow: shadows.lg,
              zIndex: 1000,
              ...typography.body,
            }}
          >
            Locked in. We'll reach out soon.
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <WizardStep
            key="step1"
            stepNumber={1}
            totalSteps={5}
            backgroundVariant="intro"
            headline="FIND YOUR LEGACY"
            subhead="Your build. Your match. Your story."
            body="Enter a few details and we'll reveal the football profile closest to you."
            primaryButton="Start"
            secondaryText="Takes 30 seconds."
            onNext={handleNext}
            onBack={() => navigate("/")}
          />
        )}

        {step === 2 && (
          <WizardStep
            key="step2"
            stepNumber={2}
            totalSteps={5}
            backgroundVariant="lead"
            headline="WHO ARE YOU, BALLER?"
            formFields={
              <>
                <FormField
                  label="Full Name"
                  value={formData.name || ""}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
                <FormField
                  label="Phone Number"
                  value={formData.phone || ""}
                  onChange={handlePhoneChange}
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                />
                <ConsentCheckbox
                  checked={formData.consent || false}
                  onChange={(checked) => setFormData({ ...formData, consent: checked })}
                />
              </>
            }
            primaryButton="Next"
            onNext={handleNext}
            onBack={() => setStep(1)}
            isValid={validateStep2()}
          />
        )}

        {step === 3 && (
          <WizardStep
            key="step3"
            stepNumber={3}
            totalSteps={5}
            backgroundVariant="metrics"
            headline="YOUR BUILD"
            helperText="Don't overthink it. Close is perfect."
            formFields={
              <>
                <FormField
                  label="Age"
                  value={formData.age?.toString() || ""}
                  onChange={(value) => setFormData({ ...formData, age: parseInt(value) || undefined })}
                  type="number"
                  placeholder="25"
                  min={6}
                  max={60}
                  required
                />
                <FormField
                  label="Height (cm)"
                  value={formData.heightCmInput?.toString() || ""}
                  onChange={(value) => setFormData({ ...formData, heightCmInput: parseInt(value) || undefined })}
                  type="number"
                  placeholder="175"
                  min={140}
                  max={220}
                  required
                />
                <FormField
                  label="Weight (kg)"
                  value={formData.weightKgInput?.toString() || ""}
                  onChange={(value) => setFormData({ ...formData, weightKgInput: parseInt(value) || undefined })}
                  type="number"
                  placeholder="70"
                  min={35}
                  max={140}
                  required
                />
              </>
            }
            primaryButton="Reveal My Match"
            onNext={handleNext}
            onBack={() => setStep(2)}
            isValid={validateStep3()}
          />
        )}

        {step === 4 && (
          <WizardStep
            key="step4"
            stepNumber={4}
            totalSteps={5}
            backgroundVariant="confirm"
            headline="READY?"
            body="We'll match you with a player profile closest to your build and show the legacy you could create."
            primaryButton={submitting ? "Processing..." : "Confirm & Reveal"}
            onNext={handleNext}
            onBack={() => setStep(3)}
            isValid={true}
            disabled={submitting}
          />
        )}

        {step === 5 && matchedPlayer && (
          <ResultStep
            key="step5"
            player={matchedPlayer}
            userData={{
              age: formData.age!,
              height: formData.heightCmInput!,
              weight: formData.weightKgInput!,
            }}
            onRequestCall={handleRequestCall}
            onTryAgain={() => {
              setStep(1);
              setFormData({});
              setMatchedPlayer(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Wizard Step Component
interface WizardStepProps {
  stepNumber: number;
  totalSteps: number;
  backgroundVariant: "intro" | "lead" | "metrics" | "confirm";
  headline: string;
  subhead?: string;
  body?: string;
  helperText?: string;
  formFields?: React.ReactNode;
  primaryButton: string;
  secondaryText?: string;
  onNext: () => void;
  onBack: () => void;
  isValid?: boolean;
  disabled?: boolean;
}

const WizardStep: React.FC<WizardStepProps> = ({
  stepNumber,
  totalSteps,
  backgroundVariant,
  headline,
  subhead,
  body,
  helperText,
  formFields,
  primaryButton,
  secondaryText,
  onNext,
  onBack,
  isValid = true,
  disabled = false,
}) => {
  const backgroundImages = {
    intro: "linear-gradient(135deg, rgba(2, 12, 27, 0.95) 0%, rgba(10, 22, 51, 0.9) 100%), url('/assets/DSC_0205-3.jpg')",
    lead: "linear-gradient(135deg, rgba(2, 12, 27, 0.95) 0%, rgba(10, 22, 51, 0.9) 100%), url('/assets/DSC00893.jpg')",
    metrics: "linear-gradient(135deg, rgba(2, 12, 27, 0.95) 0%, rgba(10, 22, 51, 0.9) 100%), url('/assets/DSC09619 (1).JPG')",
    confirm: "linear-gradient(135deg, rgba(2, 12, 27, 0.95) 0%, rgba(10, 22, 51, 0.9) 100%)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: "100vh",
        paddingTop: 100,
        paddingBottom: spacing["4xl"],
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: backgroundImages[backgroundVariant],
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.3,
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
          background: `linear-gradient(135deg, rgba(2, 12, 27, 0.75) 0%, rgba(10, 22, 51, 0.7) 50%, rgba(2, 12, 27, 0.75) 100%)`,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 600,
          width: "100%",
          padding: `0 ${spacing.xl}`,
        }}
      >
        {/* Progress Indicator */}
        <div style={{ marginBottom: spacing.xl, textAlign: "center" }}>
          <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>
            Step {stepNumber} of {totalSteps}
          </div>
          <div
            style={{
              height: 4,
              background: colors.surface.card,
              borderRadius: borderRadius.full,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stepNumber / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${colors.accent.main} 0%, ${colors.accent.light} 100%)`,
              }}
            />
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: colors.surface.card,
            borderRadius: borderRadius.xl,
            padding: spacing["2xl"],
            boxShadow: shadows["2xl"],
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}
        >
          <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.md, textAlign: "center" }}>
            {headline}
          </h1>
          {subhead && (
            <h2 style={{ ...typography.h3, color: colors.accent.main, marginBottom: spacing.lg, textAlign: "center" }}>
              {subhead}
            </h2>
          )}
          {body && (
            <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl, textAlign: "center" }}>
              {body}
            </p>
          )}
          {helperText && (
            <p style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.lg, textAlign: "center", fontStyle: "italic" }}>
              {helperText}
            </p>
          )}

          {formFields && (
            <div style={{ marginBottom: spacing.xl, display: "flex", flexDirection: "column", gap: spacing.lg }}>
              {formFields}
            </div>
          )}

          <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", flexWrap: "wrap" }}>
            {stepNumber > 1 && (
              <button
                onClick={onBack}
                style={{
                  ...typography.body,
                  padding: `${spacing.md} ${spacing.xl}`,
                  borderRadius: borderRadius.md,
                  background: "transparent",
                  color: colors.text.secondary,
                  border: `1px solid rgba(255, 255, 255, 0.25)`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={onNext}
              disabled={!isValid || disabled}
              style={{
                ...typography.body,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.bold,
                padding: `${spacing.md} ${spacing.xl}`,
                borderRadius: borderRadius.md,
                background: isValid && !disabled
                  ? `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`
                  : colors.surface.elevated,
                color: isValid && !disabled ? colors.brand.charcoal : colors.text.muted,
                border: "none",
                cursor: isValid && !disabled ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                boxShadow: isValid && !disabled ? `0 4px 16px rgba(255, 169, 0, 0.35)` : "none",
              }}
              onMouseEnter={(e) => {
                if (isValid && !disabled) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 6px 24px rgba(255, 169, 0, 0.5)`;
                }
              }}
              onMouseLeave={(e) => {
                if (isValid && !disabled) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 4px 16px rgba(255, 169, 0, 0.35)`;
                }
              }}
            >
              {primaryButton}
            </button>
          </div>

          {secondaryText && (
            <p style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.md, textAlign: "center" }}>
              {secondaryText}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// Form Field Component
interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, value, onChange, type = "text", placeholder, min, max, required }) => {
  return (
    <div>
      <label style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xs, display: "block" }}>
        {label} {required && <span style={{ color: colors.danger.main }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        required={required}
        style={{
          width: "100%",
          padding: spacing.md,
          borderRadius: borderRadius.md,
          background: colors.surface.elevated,
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          color: colors.text.primary,
          ...typography.body,
          fontSize: typography.fontSize.base,
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.accent.main;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent.soft}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
};

// Consent Checkbox Component
interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({ checked, onChange }) => {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: spacing.sm }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        style={{
          width: 20,
          height: 20,
          marginTop: 2,
          cursor: "pointer",
        }}
      />
      <label style={{ ...typography.caption, color: colors.text.secondary, flex: 1 }}>
        I agree to be contacted by Real Bengaluru to help build my legacy.
      </label>
    </div>
  );
};

// Result Step Component
interface ResultStepProps {
  player: Player;
  userData: { age: number; height: number; weight: number };
  onRequestCall: () => void;
  onTryAgain: () => void;
}

const ResultStep: React.FC<ResultStepProps> = ({ player, userData, onRequestCall, onTryAgain }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: "100vh",
        paddingTop: 100,
        paddingBottom: spacing["4xl"],
        position: "relative",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, rgba(2, 12, 27, 0.95) 0%, rgba(10, 22, 51, 0.9) 100%), url('/assets/DSC09918.JPG')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.3,
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
          background: `linear-gradient(135deg, rgba(2, 12, 27, 0.75) 0%, rgba(10, 22, 51, 0.7) 50%, rgba(2, 12, 27, 0.75) 100%)`,
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1000,
          margin: "0 auto",
          padding: `0 ${spacing.xl}`,
        }}
      >
        {/* Section A: Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: colors.surface.card,
            borderRadius: borderRadius.xl,
            padding: spacing["2xl"],
            marginBottom: spacing.xl,
            boxShadow: shadows["2xl"],
            border: `1px solid rgba(255, 255, 255, 0.1)`,
          }}
        >
          <h1 style={{ ...typography.h1, color: colors.text.primary, marginBottom: spacing.sm, textAlign: "center" }}>
            YOUR LEGACY MATCH
          </h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl, textAlign: "center" }}>
            Closest profile to your build:
          </p>

          <div style={{ textAlign: "center", marginBottom: spacing.xl }}>
            <h2 style={{ ...typography.h2, color: colors.accent.main, marginBottom: spacing.md }}>
              {player.name}
            </h2>
            <div style={{ display: "flex", gap: spacing.sm, justifyContent: "center", flexWrap: "wrap", marginBottom: spacing.lg }}>
              <span
                style={{
                  ...typography.caption,
                  padding: `${spacing.xs} ${spacing.md}`,
                  background: colors.primary.soft,
                  color: colors.primary.main,
                  borderRadius: borderRadius.full,
                }}
              >
                {player.position}
              </span>
              <span
                style={{
                  ...typography.caption,
                  padding: `${spacing.xs} ${spacing.md}`,
                  background: colors.accent.soft,
                  color: colors.accent.main,
                  borderRadius: borderRadius.full,
                }}
              >
                {player.archetype}
              </span>
            </div>
          </div>

          {/* Comparison */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: spacing.lg,
              marginBottom: spacing.xl,
              padding: spacing.lg,
              background: colors.surface.elevated,
              borderRadius: borderRadius.md,
            }}
          >
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>YOU</div>
              <div style={{ ...typography.body, color: colors.text.primary }}>
                Age: {userData.age} / Height: {userData.height}cm / Weight: {userData.weight}kg
              </div>
            </div>
            <div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>MATCH</div>
              <div style={{ ...typography.body, color: colors.text.primary }}>
                Prime Age: {player.primeAge} / Height: {player.heightCm}cm / Weight: {player.weightKg}kg
              </div>
            </div>
          </div>

          {/* Legacy Timeline */}
          <div style={{ marginBottom: spacing.xl }}>
            <h3 style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.lg, textAlign: "center" }}>
              THE LEGACY ARC
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: spacing.md }}>
              {[
                { label: "Spark", text: player.legacy.spark },
                { label: "Breakthrough", text: player.legacy.breakthrough },
                { label: "Peak", text: player.legacy.peak },
                { label: "Legacy", text: player.legacy.legacy },
              ].map((stage, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: spacing.lg,
                    background: colors.surface.elevated,
                    borderRadius: borderRadius.md,
                    border: `1px solid rgba(245, 179, 0, 0.2)`,
                  }}
                >
                  <div style={{ ...typography.overline, color: colors.accent.main, marginBottom: spacing.xs }}>
                    {stage.label}
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.secondary }}>{stage.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: spacing.md, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={onTryAgain}
              style={{
                ...typography.body,
                padding: `${spacing.md} ${spacing.xl}`,
                borderRadius: borderRadius.md,
                background: "transparent",
                color: colors.text.secondary,
                border: `1px solid rgba(255, 255, 255, 0.25)`,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Try Again
            </button>
          </div>
        </motion.div>

        {/* Section B: Conversion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: colors.surface.card,
            borderRadius: borderRadius.xl,
            padding: spacing["2xl"],
            boxShadow: shadows["2xl"],
            border: `1px solid rgba(245, 179, 0, 0.3)`,
            textAlign: "center",
          }}
        >
          <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>
            NOW BUILD YOUR LEGACY.
          </h2>
          <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl }}>
            This match is just the start. Real Bengaluru will help you train smarter, play stronger, and build a real football journey.
          </p>
          <button
            onClick={onRequestCall}
            style={{
              ...typography.body,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.bold,
              padding: `${spacing.md} ${spacing.xl}`,
              borderRadius: borderRadius.md,
              background: `linear-gradient(135deg, ${colors.accent.main} 0%, #FFB82E 100%)`,
              color: colors.brand.charcoal,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: `0 4px 16px rgba(255, 169, 0, 0.35)`,
              marginBottom: spacing.md,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 6px 24px rgba(255, 169, 0, 0.5)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 16px rgba(255, 169, 0, 0.35)`;
            }}
          >
            Get a Call From Our Team
          </button>
          <p style={{ ...typography.caption, color: colors.text.muted }}>
            We'll contact you within 24–48 hours.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FindYourLegacyPage;


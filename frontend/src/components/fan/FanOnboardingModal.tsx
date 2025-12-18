import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";

export type FanPersona = "PURE_FAN" | "ASPIRING_PLAYER" | "ANALYST" | "COMMUNITY_SUPPORTER";

export type FanOnboardingPayload = {
  persona?: FanPersona;
  favoritePlayer?: string;
  locality?: string;
  goals?: string[];
};

export const FanOnboardingModal: React.FC<{
  isOpen: boolean;
  fanName?: string;
  onSubmit: (payload: FanOnboardingPayload) => Promise<void>;
}> = ({ isOpen, fanName, onSubmit }) => {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [favoritePlayer, setFavoritePlayer] = useState("");
  const [persona, setPersona] = useState<FanPersona | "">("");
  const [locality, setLocality] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  const steps = useMemo(
    () => [
      { title: "Pick your favourite player", kicker: "FAN ONBOARDING" },
      { title: "What kind of fan are you?", kicker: "YOUR STYLE" },
      { title: "Where in Bengaluru are you?", kicker: "LOCALITY" },
      { title: "What do you want from RealVerse?", kicker: "GOALS" },
    ],
    []
  );

  const progress = (step + 1) / steps.length;

  const canNext =
    (step === 0 && favoritePlayer.trim().length > 0) ||
    (step === 1 && persona !== "") ||
    (step === 2 && locality.trim().length > 0) ||
    (step === 3 && goals.length > 0);

  const toggleGoal = (g: string) => {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const submit = async () => {
    setError("");
    setIsSaving(true);
    try {
      await onSubmit({
        favoritePlayer: favoritePlayer.trim(),
        persona: persona || undefined,
        locality: locality.trim(),
        goals,
      });
    } catch (e: any) {
      setError(e?.message || "Failed to save onboarding");
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              background:
                "radial-gradient(1200px 700px at 20% 20%, rgba(0,224,255,0.10) 0%, transparent 60%), radial-gradient(1100px 760px at 80% 70%, rgba(255,169,0,0.10) 0%, transparent 62%), rgba(0,0,0,0.78)",
              backdropFilter: "blur(12px)",
            }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Fan onboarding"
            initial={{ opacity: 0, y: 18, scale: 0.98, filter: reduce ? "none" : "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, scale: 0.98, filter: reduce ? "none" : "blur(10px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1201,
              display: "grid",
              placeItems: "center",
              padding: spacing.xl,
            }}
          >
            <Card
              variant="default"
              padding="xl"
              style={{
                width: "min(860px, 100%)",
                borderRadius: borderRadius["2xl"],
                background: "rgba(10, 16, 32, 0.62)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 28px 90px rgba(0,0,0,0.65)",
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
                    "radial-gradient(900px 560px at 14% 20%, rgba(0,224,255,0.16) 0%, transparent 55%), radial-gradient(900px 620px at 86% 70%, rgba(255,169,0,0.14) 0%, transparent 60%)",
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                  <div>
                    <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: 8 }}>
                      {steps[step]?.kicker}
                    </div>
                    <h2 style={{ ...typography.h2, color: colors.text.primary, margin: 0, lineHeight: 1.12 }}>
                      {steps[step]?.title}
                    </h2>
                    <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.sm, lineHeight: 1.7, maxWidth: 680 }}>
                      {fanName ? `Welcome, ${fanName}. ` : ""}
                      Set your fan profile once—then your dashboard adapts to you.
                    </p>
                  </div>

                  <div style={{ minWidth: 140, textAlign: "right" }}>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>{String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</div>
                    <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.round(progress * 100)}%`,
                          background: "linear-gradient(90deg, rgba(0,224,255,0.85), rgba(4,117,255,0.85), rgba(255,169,0,0.72))",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: spacing.lg }}>
                  {step === 0 && (
                    <Input
                      label="Favourite player"
                      placeholder="e.g., Sunil Chhetri"
                      value={favoritePlayer}
                      onChange={(e) => setFavoritePlayer(e.target.value)}
                      fullWidth
                    />
                  )}

                  {step === 1 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: spacing.md }}>
                      {[
                        { id: "PURE_FAN" as const, label: "Pure Fan", desc: "Matchdays, perks, and club energy." },
                        { id: "ASPIRING_PLAYER" as const, label: "Aspiring Player", desc: "Progression, programs, and training." },
                        { id: "ANALYST" as const, label: "Analyst", desc: "Stats, systems, and tactical curiosity." },
                        { id: "COMMUNITY_SUPPORTER" as const, label: "Community Supporter", desc: "Support the movement in Bengaluru." },
                      ].map((p) => {
                        const active = persona === p.id;
                        return (
                          <motion.button
                            key={p.id}
                            type="button"
                            whileHover={reduce ? undefined : { y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setPersona(p.id)}
                            style={{
                              textAlign: "left",
                              padding: spacing.lg,
                              borderRadius: borderRadius.xl,
                              border: active ? "1px solid rgba(0,224,255,0.45)" : "1px solid rgba(255,255,255,0.10)",
                              background: active ? "rgba(0,224,255,0.10)" : "rgba(0,0,0,0.16)",
                              color: colors.text.primary,
                              cursor: "pointer",
                              boxShadow: active ? "0 18px 48px rgba(0,0,0,0.45), 0 0 26px rgba(0,224,255,0.14)" : "0 14px 40px rgba(0,0,0,0.35)",
                            }}
                          >
                            <div style={{ ...typography.body, fontWeight: typography.fontWeight.bold, marginBottom: 6 }}>{p.label}</div>
                            <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.6 }}>{p.desc}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {step === 2 && (
                    <Input label="Locality" placeholder="e.g., Indiranagar" value={locality} onChange={(e) => setLocality(e.target.value)} fullWidth />
                  )}

                  {step === 3 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: spacing.md }}>
                      {[
                        "Attend matches",
                        "Collect perks",
                        "Improve football skills",
                        "Support the club",
                      ].map((g) => {
                        const active = goals.includes(g);
                        return (
                          <motion.button
                            key={g}
                            type="button"
                            whileHover={reduce ? undefined : { y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => toggleGoal(g)}
                            style={{
                              textAlign: "left",
                              padding: spacing.lg,
                              borderRadius: borderRadius.xl,
                              border: active ? "1px solid rgba(255,169,0,0.45)" : "1px solid rgba(255,255,255,0.10)",
                              background: active ? "rgba(255,169,0,0.10)" : "rgba(0,0,0,0.16)",
                              color: colors.text.primary,
                              cursor: "pointer",
                              boxShadow: active ? "0 18px 48px rgba(0,0,0,0.45), 0 0 26px rgba(255,169,0,0.14)" : "0 14px 40px rgba(0,0,0,0.35)",
                            }}
                          >
                            <div style={{ ...typography.body, fontWeight: typography.fontWeight.semibold }}>{g}</div>
                            <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.6 }}>
                              Selected
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {error && <div style={{ marginTop: spacing.md, ...typography.caption, color: colors.danger.main }}>{error}</div>}

                <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md, marginTop: spacing.xl }}>
                  <Button variant="secondary" size="md" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || isSaving}>
                    Back
                  </Button>

                  {step < steps.length - 1 ? (
                    <Button variant="primary" size="md" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} disabled={!canNext || isSaving}>
                      Next →
                    </Button>
                  ) : (
                    <Button variant="primary" size="md" onClick={submit} disabled={!canNext || isSaving}>
                      {isSaving ? "Saving…" : "Finish setup →"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};



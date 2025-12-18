import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useFanMotion } from "../../hooks/useFanMotion";
import { ArrowRightIcon, StarIcon, TrophyIcon } from "../../components/icons/IconSet";

const FanGamesPage: React.FC = () => {
  const { pageEnter, cardReveal, viewportOnce } = useFanMotion();
  const [me, setMe] = useState<any>(null);
  const [quests, setQuests] = useState<any[] | null>(null);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [prediction, setPrediction] = useState("2-1");
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.getFanMe().then(setMe).catch(() => setMe(null));
    api.getFanQuests().then(setQuests).catch(() => setQuests([]));
  }, []);
  const flags = (me?.tier?.featureFlags || me?.profile?.tier?.featureFlags || {}) as Record<string, any>;

  const submitQuiz = async () => {
    setToast("");
    const session = await api.submitFanGameSession({
      gameType: "QUIZ",
      input: { answer: quizAnswer },
      result: { ok: !!quizAnswer },
      pointsEarned: quizAnswer ? 15 : 0,
    });
    setToast(`Quiz recorded. +${session?.profile?.points ? "" : ""} points added.`);
    setQuizAnswer("");
  };

  const submitPrediction = async () => {
    setToast("");
    await api.submitFanGameSession({
      gameType: "PREDICT_SCORE",
      input: { predicted: prediction },
      result: { recorded: true },
      pointsEarned: 10,
    });
    setToast("Prediction recorded. +10 points.");
  };

  const spin = async () => {
    setToast("");
    const outcomes = ["+5 points", "+10 points", "+20 points", "Try again"];
    const pick = outcomes[Math.floor(Math.random() * outcomes.length)];
    const pointsEarned = pick.includes("+") ? parseInt(pick.replace("+", "").replace(" points", ""), 10) : 0;
    await api.submitFanGameSession({ gameType: "SPIN", input: { spin: true }, result: { outcome: pick }, pointsEarned });
    setToast(`Spin result: ${pick}`);
  };

  return (
    <motion.main {...pageEnter} style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        {/* Hero */}
        <Card
          variant="default"
          padding="xl"
          style={{
            borderRadius: 28,
            padding: 28,
            background: "rgba(8,12,24,0.42)",
            border: "1px solid rgba(255,255,255,0.12)",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 26px 80px rgba(0,0,0,0.55)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("/assets/20251007-DSC_0557.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px)",
              opacity: 0.20,
              transform: "scale(1.06)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(1100px 680px at 18% 25%, rgba(0,224,255,0.20) 0%, transparent 55%), radial-gradient(900px 620px at 78% 70%, rgba(255,169,0,0.14) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.82) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.86) 100%)",
              opacity: 0.98,
            }}
          />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.lg, flexWrap: "wrap" }}>
            <div style={{ minWidth: 320 }}>
              <div style={{ ...typography.overline, color: colors.primary.light, letterSpacing: "0.18em", marginBottom: 10 }}>GAMES & QUESTS</div>
              <h1 style={{ ...typography.h1, margin: 0, fontSize: "clamp(2.8rem, 4.2vw, 3.4rem)", lineHeight: 1.06, color: colors.text.primary }}>
                Play. Earn XP. Unlock perks.
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.75, maxWidth: 760 }}>
                This is your daily ritual hub—quick actions that build streak, badges, and sponsor unlocks.
              </p>
            </div>

            <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
              <div style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)" }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>XP</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>
                  <TrophyIcon size={16} color={colors.accent.main} /> {me?.points ?? me?.profile?.points ?? 0}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)" }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Streak</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>
                  <StarIcon size={16} color={colors.primary.light} /> {me?.streakDays ?? me?.profile?.streakDays ?? 0} days
                </div>
              </div>
            </div>
          </div>
        </Card>

        {toast && <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>{toast}</div>}

        {flags.games === false ? (
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Games are locked for your tier</div>
            <div style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
              Games & quests are disabled via Admin feature flags. Ask Admin to upgrade your tier when ready.
            </div>
          </Card>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: spacing.lg }}>
          <motion.div variants={cardReveal} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>QUEST TRACKS</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Active quests</div>
                </div>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Rolling</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: spacing.md, marginBottom: spacing.md }}>
                {[
                  { t: "Fan Loyalty Track", d: "Daily actions → streak + XP" },
                  { t: "Matchday Track", d: "Predictions → weekly unlocks" },
                  { t: "Sponsor Explorer Track", d: "Engage sponsors → perks" },
                  { t: "Knowledge Track", d: "Quizzes → club IQ" },
                ].map((x) => (
                  <div key={x.t} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: 16 }}>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{x.t}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.6 }}>{x.d}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: spacing.sm }}>
                {(quests || []).slice(0, 8).map((q) => (
                  <div key={q.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: "12px 12px" }}>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{q.title}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>{q.description}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>Reward: {q.pointsReward} pts {q.badgeReward ? `• Badge: ${q.badgeReward}` : ""}</div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardReveal} initial="hidden" whileInView="show" viewport={viewportOnce}>
            <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: spacing.sm }}>QUICK GAMES</div>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Daily boosts</div>

              <div style={{ display: "grid", gap: spacing.md }}>
                <div style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Weekly trivia (QUIZ)</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>Answer fast. Earn points. No long forms.</div>
                  <div style={{ marginTop: spacing.md }}>
                    <Input label="Your answer" placeholder="Type a quick answer" value={quizAnswer} onChange={(e) => setQuizAnswer(e.target.value)} fullWidth />
                  </div>
                  <Button variant="primary" size="md" onClick={submitQuiz} style={{ marginTop: spacing.md, width: "100%" }}>
                    Submit Quiz →
                  </Button>
                </div>

                <div style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Score prediction (PREDICT_SCORE)</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>Your pick fuels matchday unlocks (rolling soon).</div>
                  <div style={{ marginTop: spacing.md }}>
                    <Input label="Predicted score" placeholder="e.g. 2-1" value={prediction} onChange={(e) => setPrediction(e.target.value)} fullWidth />
                  </div>
                  <Button variant="secondary" size="md" onClick={submitPrediction} style={{ marginTop: spacing.md, width: "100%" }}>
                    Submit Prediction →
                  </Button>
                </div>

                <div style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Spin the wheel (SPIN)</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>Limited spins (tier gating coming).</div>
                  <Button variant="secondary" size="md" onClick={spin} style={{ marginTop: spacing.md, width: "100%" }}>
                    Spin →
                  </Button>
                </div>

                <div style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Penalty shootout (coming soon)</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>
                    A matchday mini‑game. Faster than a form. More fun than a dashboard.
                  </div>
                  <Button variant="secondary" size="md" disabled style={{ marginTop: spacing.md, width: "100%" }}>
                    Play →
                  </Button>
                </div>
              </div>

              <div style={{ marginTop: spacing.md }}>
                <a href="/realverse/fan" style={{ textDecoration: "none" }}>
                  <Button variant="secondary" size="md" style={{ width: "100%" }}>
                    Back to Fan Club HQ <ArrowRightIcon size={16} style={{ transform: "rotate(180deg)" }} />
                  </Button>
                </a>
              </div>
            </Card>
          </motion.div>
        </div>
        )}
      </div>
    </motion.main>
  );
};

export default FanGamesPage;




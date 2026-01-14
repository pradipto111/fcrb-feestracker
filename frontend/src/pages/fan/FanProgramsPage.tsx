import React, { useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { ArrowRightIcon, StarIcon } from "../../components/icons/IconSet";

const FanProgramsPage: React.FC = () => {
  const { headingVariants, cardVariants, viewportOnce } = useHomepageAnimation();
  const [me, setMe] = useState<any>(null);
  const [toast, setToast] = useState("");

  React.useEffect(() => {
    api.getFanMe().then(setMe).catch(() => setMe(null));
  }, []);
  const flags = (me?.tier?.featureFlags || me?.profile?.tier?.featureFlags || {}) as Record<string, any>;
  const onboarding = me?.onboarding || null;
  const goals: string[] = Array.isArray(onboarding?.goals) ? onboarding.goals : [];
  const isSkillGoal = goals.some((g) => String(g).toLowerCase().includes("skill"));
  const isAspiring = onboarding?.persona === "ASPIRING_PLAYER";

  const createLead = async (programInterest: "EPP" | "SCP" | "WPP" | "FYDP") => {
    setToast("");
    try {
      await api.submitFanProgramInterest({ programInterest });
      setToast("Interest recorded. The club will follow up.");
    } catch (e: any) {
      setToast(e?.message || "Failed to record interest");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
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
              backgroundImage: `url("/assets/20250927-DSC_0446.jpg")`,
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
              <div style={{ ...typography.overline, color: colors.primary.light, letterSpacing: "0.18em", marginBottom: 10 }}>TRAIN WITH US</div>
              <h1 style={{ ...typography.h1, margin: 0, fontSize: "clamp(2.8rem, 4.2vw, 3.4rem)", lineHeight: 1.06, color: colors.text.primary }}>
                From supporter to squad.
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.75, maxWidth: 760 }}>
                A football-first pathway. RealVerse makes progress visible—without guesswork.
              </p>
            </div>

            <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
              <div style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)" }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Entry context</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>
                  {isAspiring || isSkillGoal ? "Skill-first track" : "Fan-first track"}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)" }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Locality</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>{onboarding?.locality || me?.city || "—"}</div>
              </div>
            </div>
          </div>
        </Card>

        {toast && <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>{toast}</div>}

        {flags.programs === false ? (
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Programs conversion is disabled</div>
            <div style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
              Program interest capture is disabled via Admin feature flags for your tier.
            </div>
          </Card>
        ) : (
        <motion.div variants={cardVariants} initial="initial" animate="animate">
          <Card variant="default" padding="xl" style={{ borderRadius: 26, padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md, flexWrap: "wrap" }}>
              <div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>From supporter to squad</div>
                <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>
                  Pick a program. We’ll capture your interest and the club will follow up. No spam. No pressure.
                </div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)" }}>
                <StarIcon size={16} color={colors.primary.light} />
                <span style={{ ...typography.caption, color: colors.text.muted }}>RealVerse‑backed pathway</span>
              </div>
            </div>

            {/* Conversion funnels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md, marginBottom: spacing.lg }}>
              {[
                { title: "Your skill matches SCP", desc: "If you want competitive minutes, SCP is the bridge." },
                { title: "Your matchday streak qualifies you", desc: "Member perks can unlock trial discounts (rolling soon)." },
                { title: "RealVerse analytics preview", desc: "Pace, endurance, reaction, dribbling—visible progress." },
              ].map((x) => (
                <div key={x.title} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: 18 }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{x.title}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8, lineHeight: 1.6 }}>{x.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: spacing.md }}>
              {[
                { id: "FYDP" as const, name: "Foundation & Youth Development", code: "FYDP", one: "Build intelligent footballers before building competitors." },
                { id: "SCP" as const, name: "Senior Competitive Program", code: "SCP", one: "The competitive bridge between youth and elite football." },
                { id: "WPP" as const, name: "Women’s Performance Pathway", code: "WPP", one: "A unified pathway for women footballers aiming professional levels." },
                { id: "EPP" as const, name: "Elite Pathway Program", code: "EPP", one: "For players targeting top-tier football in India and abroad." },
              ].map((p) => (
                <motion.div key={p.id}>
                  <div style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg, minHeight: 220, display: "flex", flexDirection: "column" }}>
                    <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em" }}>{p.code}</div>
                    <div style={{ ...typography.h4, color: colors.text.primary, marginTop: 6 }}>{p.name}</div>
                    <div style={{ ...typography.caption, color: colors.text.secondary, marginTop: 10, lineHeight: 1.6 }}>{p.one}</div>
                    <div style={{ marginTop: "auto" }}>
                      <Button variant="primary" size="md" style={{ width: "100%", background: colors.accent.main, color: colors.text.onAccent }} onClick={() => createLead(p.id)}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Train with us</span>
                          <ArrowRightIcon size={16} color={colors.text.onAccent} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                        </span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
        )}
      </div>
    </div>
  );
};

export default FanProgramsPage;




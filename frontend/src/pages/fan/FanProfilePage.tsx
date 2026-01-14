import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { useFanMotion } from "../../hooks/useFanMotion";
import { TrophyIcon, StarIcon } from "../../components/icons/IconSet";

const FanProfilePage: React.FC = () => {
  const { headingVariants, cardVariants, viewportOnce } = useHomepageAnimation();
  const { cardReveal } = useFanMotion();
  const [me, setMe] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    api.getFanMe().then(setMe).catch(() => setMe(null));
    api.getFanHistory().then(setHistory).catch(() => setHistory({ redemptions: [], gameSessions: [], leads: [] }));
  }, []);

  const badges = useMemo(() => me?.badges || me?.profile?.badges || [], [me]);
  const onboarding = me?.onboarding || null;
  const personaLabel =
    onboarding?.persona === "ASPIRING_PLAYER"
      ? "Aspiring Player"
      : onboarding?.persona === "ANALYST"
      ? "Analyst"
      : onboarding?.persona === "COMMUNITY_SUPPORTER"
      ? "Community Supporter"
      : onboarding?.persona === "PURE_FAN"
      ? "Pure Fan"
      : "—";

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
        {/* Fan Card */}
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
              backgroundImage: `url("/assets/DSC09619 (1).JPG")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px)",
              opacity: 0.18,
              transform: "scale(1.06)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(1100px 680px at 18% 25%, rgba(0,224,255,0.18) 0%, transparent 55%), radial-gradient(900px 620px at 78% 70%, rgba(255,169,0,0.12) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.84) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.88) 100%)",
              opacity: 0.98,
            }}
          />
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", gap: spacing.lg, flexWrap: "wrap" }}>
            <div style={{ minWidth: 320 }}>
              <div style={{ ...typography.overline, color: colors.primary.light, letterSpacing: "0.18em", marginBottom: 10 }}>MY PROFILE</div>
              <h1 style={{ ...typography.h1, margin: 0, fontSize: "clamp(2.8rem, 4.2vw, 3.4rem)", lineHeight: 1.06, color: colors.text.primary }}>
                Fan Card
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.75, maxWidth: 760 }}>
                Camera‑ready identity—tier, mode, streak, and your club journey.
              </p>
            </div>

            <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
              <div style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)" }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Mode</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>{personaLabel}</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)" }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Favourite Player</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>{onboarding?.favoritePlayer || "—"}</div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)" }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Locality</div>
                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>{onboarding?.locality || me?.city || "—"}</div>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.lg }}>
          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Status</div>
              <div style={{ display: "grid", gap: spacing.sm }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md }}>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>Name</div>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{me?.fullName || me?.profile?.fullName || "—"}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md }}>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>Tier</div>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{me?.tier?.name || me?.profile?.tier?.name || "Unassigned"}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md }}>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>Points</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                    <TrophyIcon size={16} color={colors.accent.main} /> {me?.points ?? me?.profile?.points ?? 0}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md }}>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>Streak</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                    <StarIcon size={16} color={colors.primary.light} /> {me?.streakDays ?? me?.profile?.streakDays ?? 0} days
                  </div>
                </div>
              </div>
              <div style={{ marginTop: spacing.md, ...typography.caption, color: colors.text.muted }}>
                Upgrade tier (pricing) will be admin-controlled in the next iteration.
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Badges</div>
              <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                {badges.length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No badges yet.</div>}
                {badges.map((b: string) => (
                  <div key={b} style={{ padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.secondary, ...typography.caption }}>
                    {b}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: spacing.md }}>
                <Button variant="secondary" size="md" disabled style={{ width: "100%" }}>
                  Share Fan Card (coming soon)
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={cardReveal} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Redemption history</div>
            <div style={{ display: "grid", gap: spacing.sm }}>
              {(history?.redemptions || []).slice(0, 10).map((r: any) => (
                <div key={r.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: "12px 12px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                      {r.pool?.sponsor?.name || "Sponsor"} • {r.pool?.name || "Coupon"}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>{new Date(r.redeemedAt).toLocaleString()}</div>
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>Code: {r.codeUsed}</div>
                </div>
              ))}
              {(history?.redemptions || []).length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No redemptions yet.</div>}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FanProfilePage;




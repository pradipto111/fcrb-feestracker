import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { useFanMotion } from "../../hooks/useFanMotion";
import { TrophyIcon, CalendarIcon, ArrowRightIcon } from "../../components/icons/IconSet";

const FanMatchdayPage: React.FC = () => {
  const { headingVariants, cardVariants, viewportOnce } = useHomepageAnimation();
  const { cardReveal } = useFanMotion();
  const [me, setMe] = useState<any>(null);
  const [fixtures, setFixtures] = useState<any[] | null>(null);
  const [rewards, setRewards] = useState<any[] | null>(null);
  const [moments, setMoments] = useState<any[] | null>(null);

  useEffect(() => {
    api.getFanMe().then(setMe).catch(() => setMe(null));
    api.getPublicFixtures()
      .then((data: any) => {
        // API returns { upcoming: [...], results: [...] }
        const allFixtures = [...(data?.upcoming || []), ...(data?.results || [])];
        setFixtures(allFixtures);
      })
      .catch(() => setFixtures([]));
    api.getFanRewards()
      .then((data: any) => {
        // Ensure data is an array
        setRewards(Array.isArray(data) ? data : []);
      })
      .catch(() => setRewards([]));
    api.getFanMatchdayMoments()
      .then((data: any) => {
        // Ensure data is an array
        setMoments(Array.isArray(data) ? data : []);
      })
      .catch(() => setMoments([]));
  }, []);
  const flags = (me?.tier?.featureFlags || me?.profile?.tier?.featureFlags || {}) as Record<string, any>;

  const upcoming = useMemo(() => {
    const fixturesArray = Array.isArray(fixtures) ? fixtures : [];
    return fixturesArray.filter((f: any) => f.status !== "COMPLETED").slice(0, 6);
  }, [fixtures]);
  const matchdayRewards = useMemo(() => {
    const rewardsArray = Array.isArray(rewards) ? rewards : [];
    return rewardsArray.slice(0, 4);
  }, [rewards]);
  const nextFixture = useMemo(() => {
    const upcomingArray = Array.isArray(upcoming) ? upcoming : [];
    return upcomingArray[0] || null;
  }, [upcoming]);

  const countdown = useMemo(() => {
    if (!nextFixture?.matchDate) return null;
    const dt = new Date(nextFixture.matchDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, dt - now);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    return { d, h, m };
  }, [nextFixture]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
        {/* Matchday Hero Panel */}
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
              backgroundImage: `url("/assets/DSC00893.jpg")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(18px)",
              opacity: 0.22,
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
              <div style={{ ...typography.overline, color: colors.primary.light, letterSpacing: "0.18em", marginBottom: 10 }}>MATCHDAY HUB</div>
              <h1 style={{ ...typography.h1, margin: 0, fontSize: "clamp(2.8rem, 4.2vw, 3.4rem)", lineHeight: 1.06, color: colors.text.primary }}>
                Countdown. Unlocks. Moments.
              </h1>
              <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.75, maxWidth: 760 }}>
                Next match, weekly bonuses, and the story moments that drop after matchdays.
              </p>
            </div>

            <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap" }}>
              {[
                { k: "D", v: countdown ? countdown.d : "—" },
                { k: "H", v: countdown ? countdown.h : "—" },
                { k: "M", v: countdown ? countdown.m : "—" },
              ].map((x) => (
                <div key={x.k} style={{ padding: "12px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.22)", minWidth: 78, textAlign: "center" }}>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>{x.v}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{x.k}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {flags.matchday === false ? (
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Matchday is locked for your tier</div>
            <div style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
              Matchday unlocks are disabled via Admin feature flags. You can still view public fixtures elsewhere in RealVerse.
            </div>
          </Card>
        ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: spacing.lg }}>
          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>UPCOMING</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Fixtures</div>
                </div>
                <CalendarIcon size={16} color={colors.text.muted} />
              </div>
              <div style={{ display: "grid", gap: spacing.sm }}>
                {Array.isArray(upcoming) && upcoming.map((f: any) => (
                  <div key={f.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: "12px 12px" }}>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                      vs {f.opponent}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>
                      {new Date(f.matchDate).toLocaleDateString()} • {f.matchTime} • {f.venue || "Venue TBA"}
                    </div>
                  </div>
                ))}
                {(!Array.isArray(upcoming) || upcoming.length === 0) && (
                  <div style={{ ...typography.caption, color: colors.text.muted }}>No upcoming fixtures available.</div>
                )}
              </div>
              <div style={{ marginTop: spacing.md }}>
                <Button variant="secondary" size="md" style={{ width: "100%" }} disabled>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                    <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Predicted XI (locked)</span>
                    <ArrowRightIcon size={16} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                  </span>
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>UNLOCKS</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>This week’s reward messaging</div>
                </div>
                <TrophyIcon size={16} color={colors.accent.main} />
              </div>
              <div style={{ display: "grid", gap: spacing.sm }}>
                {Array.isArray(matchdayRewards) && matchdayRewards.map((r: any) => (
                  <div key={r.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: "12px 12px" }}>
                    <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{r?.sponsor?.name || "Sponsor"}</div>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6, lineHeight: 1.35 }}>{r.copy}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>Dynamic rewards (rolling soon)</div>
                  </div>
                ))}
                {(!Array.isArray(matchdayRewards) || matchdayRewards.length === 0) && <div style={{ ...typography.caption, color: colors.text.muted }}>No campaigns available.</div>}
              </div>
            </Card>
          </motion.div>
        </div>
        )}

        {/* Moments gallery */}
        <motion.div variants={cardReveal} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <Card variant="default" padding="xl" style={{ borderRadius: 24, padding: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
              <div>
                <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>MOMENTS</div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Highlights • Goals • Behind the scenes</div>
              </div>
              <ArrowRightIcon size={18} color={colors.text.muted} />
            </div>

            <div style={{ display: "flex", gap: spacing.md, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" as any }}>
              {Array.isArray(moments) && moments.slice(0, 12).map((m: any) => {
                const locked = !!m.isLocked;
                return (
                  <div key={m.id} style={{ width: 240, flex: "0 0 auto", borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", overflow: "hidden", position: "relative" }}>
                    <div aria-hidden style={{ height: 120, backgroundImage: `url(${m.thumbnailUrl || "/assets/20250927-DSC_0446.jpg"})`, backgroundSize: "cover", backgroundPosition: "center", filter: locked ? "blur(8px) grayscale(100%)" : "none", opacity: locked ? 0.55 : 0.9 }} />
                    <div style={{ padding: 14 }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{(m.category || "MOMENT").toUpperCase()}</div>
                      <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6, lineHeight: 1.25 }}>{m.title}</div>
                    </div>
                    {locked && (
                      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.60) 100%)" }}>
                        <div style={{ padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.45)", color: colors.text.primary, ...typography.caption }}>
                          Locked — keep building
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {(!Array.isArray(moments) || moments.length === 0) && <div style={{ ...typography.caption, color: colors.text.muted }}>No moments yet.</div>}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FanMatchdayPage;




import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { TrophyIcon, StarIcon, CalendarIcon, ArrowRightIcon } from "../../components/icons/IconSet";
import { useMarquee } from "../../hooks/useMarquee";
import { SPONSORS, DUMMY_OFFERS } from "../../data/sponsors";

const SkeletonLine = ({ w = "100%", h = 12 }: { w?: string; h?: number }) => (
  <div style={{ width: w, height: h, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
);

const FanDashboardOverview: React.FC = () => {
  const { headingVariants, cardVariants, viewportOnce } = useHomepageAnimation();
  const reduce = useReducedMotion();
  const [me, setMe] = useState<any>(() => {
    const cached = sessionStorage.getItem('fan-dashboard-me');
    return cached ? JSON.parse(cached) : null;
  });
  const [coupons, setCoupons] = useState<any[] | null>(() => {
    const cached = sessionStorage.getItem('fan-dashboard-coupons');
    return cached ? JSON.parse(cached) : null;
  });
  const [rewards, setRewards] = useState<any[] | null>(() => {
    const cached = sessionStorage.getItem('fan-dashboard-rewards');
    return cached ? JSON.parse(cached) : null;
  });
  const [quests, setQuests] = useState<any[] | null>(() => {
    const cached = sessionStorage.getItem('fan-dashboard-quests');
    return cached ? JSON.parse(cached) : null;
  });
  const [fixtures, setFixtures] = useState<any[] | null>(() => {
    const cached = sessionStorage.getItem('fan-dashboard-fixtures');
    return cached ? JSON.parse(cached) : null;
  });
  const [moments, setMoments] = useState<any[] | null>(null);
  const [dynamicRewards, setDynamicRewards] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(!sessionStorage.getItem('fan-dashboard-me'));
  const [marqueePaused, setMarqueePaused] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [m, c, r, q, f, mm, dr] = await Promise.all([
          api.getFanMe(),
          api.getFanCoupons().catch(() => []),
          api.getFanRewards().catch(() => []),
          api.getFanQuests().catch(() => []),
          api.getPublicFixtures().catch(() => []),
          api.getFanMatchdayMoments().catch(() => []),
          api.getFanDynamicRewards().catch(() => []),
        ]);
        if (!mounted) return;
        setMe(m);
        setCoupons(c);
        setRewards(r);
        setQuests(q);
        // `/fixtures/public` may return `{ fixtures: [...] }` depending on backend version.
        const normalizedFixtures = Array.isArray(f) ? f : Array.isArray((f as any)?.fixtures) ? (f as any).fixtures : [];
        setFixtures(normalizedFixtures);
        setMoments(Array.isArray(mm) ? mm : []);
        setDynamicRewards(Array.isArray(dr) ? dr : []);
        
        // Cache data for instant display
        sessionStorage.setItem('fan-dashboard-me', JSON.stringify(m));
        sessionStorage.setItem('fan-dashboard-coupons', JSON.stringify(c));
        sessionStorage.setItem('fan-dashboard-rewards', JSON.stringify(r));
        sessionStorage.setItem('fan-dashboard-quests', JSON.stringify(q));
        sessionStorage.setItem('fan-dashboard-fixtures', JSON.stringify(normalizedFixtures));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const topCoupons = useMemo(() => (coupons || []).slice(0, 3), [coupons]);
  const topRewards = useMemo(() => (rewards || []).slice(0, 3), [rewards]);
  const topQuests = useMemo(() => (quests || []).slice(0, 3), [quests]);
  const nextFixture = useMemo(() => {
    const arr = Array.isArray(fixtures) ? fixtures : [];
    return arr.find((x: any) => x?.status !== "COMPLETED") || arr[0] || null;
  }, [fixtures]);
  const flags = (me?.tier?.featureFlags || me?.profile?.tier?.featureFlags || {}) as Record<string, any>;

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

  const tierName = me?.tier?.name || me?.profile?.tier?.name || "Unassigned";
  const points = me?.points ?? me?.profile?.points ?? 0;
  const streakDays = me?.streakDays ?? me?.profile?.streakDays ?? 0;
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
      : null;

  const { sequenceRef, offsetPx, sequenceWidthPx } = useMarquee({
    speedPxPerSec: 64,
    paused: marqueePaused,
    disabled: !!reduce,
  });

  const sponsorSequence = useMemo(() => SPONSORS.concat(SPONSORS), []);

  const onInterest = async (programInterest: "EPP" | "SCP" | "WPP" | "FYDP") => {
    await api.submitFanProgramInterest({ programInterest });
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
        {/* Stadium Hero Welcome Block */}
        <motion.div variants={cardVariants} initial="initial" animate="animate">
          <Card
            variant="default"
            padding="xl"
            style={{
              borderRadius: borderRadius.card, // 16px - football-first
              padding: spacing.cardPadding, // 32px minimum
              background: colors.surface.card, // Football-first card background
              border: "1px solid rgba(255,255,255,0.10)",
              position: "relative",
              overflow: "hidden",
              boxShadow: shadows.card, // Sports broadcast style
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url("/assets/DSC09918.JPG")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(18px)",
                opacity: 0.26,
                transform: "scale(1.06)",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(1100px 680px at 18% 25%, rgba(0,224,255,0.22) 0%, transparent 55%), radial-gradient(900px 620px at 78% 70%, rgba(255,169,0,0.16) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.78) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.82) 100%)",
                opacity: 0.98,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.35fr 0.65fr", gap: spacing.xl, alignItems: "stretch" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...typography.overline, color: colors.primary.light, letterSpacing: "0.18em", marginBottom: 10 }}>
                  REALVERSE • FAN CLUB HQ
                </div>
                <h1
                  style={{
                    ...typography.h1,
                    margin: 0,
                    fontSize: "clamp(3rem, 4.6vw, 3.5rem)",
                    lineHeight: 1.06,
                    color: colors.text.primary,
                    textShadow: "0 10px 60px rgba(0,0,0,0.70)",
                  }}
                >
                  {loading ? "Welcome back" : `Welcome back, ${me?.fullName || me?.profile?.fullName || "Fan"}`}
                </h1>
                <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.75, maxWidth: 720 }}>
                  Your fan journey. Your perks. Your matchdays. Your progression.
                </p>

                <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap", marginTop: spacing.lg }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm, padding: `${spacing['8']} ${spacing['12']}`, borderRadius: borderRadius.full, border: `1px solid ${colors.primary.main}40`, background: colors.surface.soft, boxShadow: shadows.sm }}>
                    <StarIcon size={16} color={colors.primary.main} />
                    <span style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>Tier</span>
                    <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm }}>
                      {loading ? "—" : tierName}
                    </span>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm, padding: `${spacing['8']} ${spacing['12']}`, borderRadius: borderRadius.full, border: `1px solid ${colors.accent.main}40`, background: colors.surface.soft, boxShadow: shadows.sm }}>
                    <TrophyIcon size={16} color={colors.accent.main} />
                    <span style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>XP</span>
                    <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm }}>
                      {loading ? "—" : points}
                    </span>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm, padding: `${spacing['8']} ${spacing['12']}`, borderRadius: borderRadius.full, border: `1px solid ${colors.success.main}40`, background: colors.surface.soft, boxShadow: shadows.sm }}>
                    <CalendarIcon size={16} color={colors.success.main} />
                    <span style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>Streak</span>
                    <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm }}>
                      {loading ? "—" : `${streakDays} days`}
                    </span>
                  </div>
                  {personaLabel ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 999, border: "1px solid rgba(0,224,255,0.18)", background: "rgba(0,224,255,0.06)" }}>
                      <span style={{ ...typography.caption, color: colors.text.muted }}>Mode</span>
                      <span style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{personaLabel}</span>
                    </div>
                  ) : null}
                </div>

                {/* Quick actions */}
                <div style={{ marginTop: spacing.lg, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
                  {[
                    { label: "Claim Reward", href: "/realverse/fan/benefits" },
                    { label: "Matchday Hub", href: "/realverse/fan/matchday" },
                    { label: "Daily Boost", href: "/realverse/fan/games" },
                    { label: "Sponsor Offers", href: "/realverse/fan/benefits" },
                    { label: "Games & Quizzes", href: "/realverse/fan/games" },
                    { label: "Explore Programmes", href: "/realverse/fan/programs" },
                  ].map((a) => (
                    <a key={a.label} href={a.href} style={{ textDecoration: "none" }}>
                      <motion.div whileHover={reduce ? undefined : { y: -2 }} whileTap={{ scale: 0.99 }} style={{ height: "100%" }}>
                        <div
                          style={{
                            height: "100%",
                            minHeight: 56,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: spacing.md,
                            padding: `${spacing.md} ${spacing['16']}`, // 16px padding - readable text zones
                            borderRadius: borderRadius.button, // 8px - sports badge feel
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: colors.surface.card, // Football-first card background
                            boxShadow: shadows.button, // Sports broadcast shadow
                            color: colors.text.primary,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1, ...typography.body, fontWeight: typography.fontWeight.semibold }}>{a.label}</span>
                          <ArrowRightIcon size={16} color={colors.text.secondary} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                        </div>
                      </motion.div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right side: tier badge + XP bar + matchday countdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                <div style={{ borderRadius: borderRadius.card, border: "1px solid rgba(255,255,255,0.10)", background: colors.surface.soft, padding: spacing.cardPadding, boxShadow: shadows.card }}>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: spacing['8'] }}>PROGRESSION</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, fontWeight: typography.fontWeight.bold }}>Season XP</div>
                  <div style={{ marginTop: spacing['12'], height: 12, borderRadius: borderRadius.full, background: colors.surface.dark, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loading ? 24 : Math.min(100, 18 + streakDays * 6)}%` }}
                      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{
                        height: "100%",
                        background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                        boxShadow: `0 0 8px ${colors.accent.main}40`,
                      }}
                    />
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing['12'], lineHeight: 1.6, paddingLeft: spacing['4'] }}>
                    {loading ? "Loading…" : "Streak + matchday actions push you forward."}
                  </div>
                </div>

                <div style={{ borderRadius: borderRadius.card, border: `1px solid ${colors.accent.main}40`, background: colors.surface.soft, padding: spacing.cardPadding, boxShadow: shadows.card, position: "relative", overflow: "hidden" }}>
                  {/* Matchday badge accent */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                    }}
                  />
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.14em", marginBottom: spacing['8'], marginTop: spacing['4'] }}>NEXT MATCHDAY</div>
                  <div style={{ ...typography.h4, color: colors.text.primary, fontWeight: typography.fontWeight.bold, lineHeight: 1.25, marginBottom: spacing['8'] }}>
                    {loading ? "Loading…" : nextFixture ? `vs ${nextFixture.opponent}` : "Fixtures unavailable"}
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.secondary, marginBottom: spacing.md, paddingLeft: spacing['4'] }}>
                    {loading
                      ? "—"
                      : nextFixture
                      ? `${new Date(nextFixture.matchDate).toLocaleDateString()} • ${nextFixture.matchTime || ""} • ${nextFixture.venue || "Venue TBA"}`
                      : "—"}
                  </div>
                  <div style={{ marginTop: spacing.md, display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                    {[
                      { k: "D", v: countdown ? countdown.d : "—" },
                      { k: "H", v: countdown ? countdown.h : "—" },
                      { k: "M", v: countdown ? countdown.m : "—" },
                    ].map((x) => (
                      <div key={x.k} style={{ padding: `${spacing['12']} ${spacing['16']}`, borderRadius: borderRadius.button, border: `1px solid ${colors.accent.main}40`, background: colors.surface.card, minWidth: 64, textAlign: "center", boxShadow: shadows.sm }}>
                        <div style={{ ...typography.h3, color: colors.accent.main, margin: 0, fontWeight: typography.fontWeight.bold }}>{x.v}</div>
                        <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em", marginTop: spacing['4'] }}>{x.k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Sponsor strip + offers */}
        {flags.offers === false ? null : (
          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card
              variant="default"
              padding="xl"
              style={{
                borderRadius: borderRadius.card, // 16px - football-first
                padding: spacing.cardPadding, // 32px minimum
                background: colors.surface.card, // Football-first card background
                border: "1px solid rgba(255,255,255,0.10)",
                position: "relative",
                overflow: "hidden",
                boxShadow: shadows.card, // Sports broadcast style
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em", marginBottom: 6 }}>SPONSORS</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Benefits that feel matchday‑earned</div>
                </div>
                <a href="/realverse/fan/benefits" style={{ ...typography.caption, color: colors.primary.light, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View all</span>
                  <ArrowRightIcon size={14} color={colors.primary.light} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                </a>
              </div>

              {/* Marquee */}
              <div
                onMouseEnter={() => setMarqueePaused(true)}
                onMouseLeave={() => setMarqueePaused(false)}
                style={{
                  borderRadius: borderRadius.xl,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(0,0,0,0.18)",
                  overflow: "hidden",
                  padding: "14px 0",
                }}
              >
                <div style={{ display: "flex", gap: 22, whiteSpace: "nowrap" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 22,
                      alignItems: "center",
                      transform: `translateX(${-offsetPx}px)`,
                      willChange: "transform",
                      paddingLeft: 18,
                    }}
                  >
                    <div ref={sequenceRef} style={{ display: "flex", gap: 22, alignItems: "center" }}>
                      {sponsorSequence.map((s, idx) => (
                        <div
                          key={`${s.id}-${idx}`}
                          style={{
                            width: 170,
                            height: 54,
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.03)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "10px 14px",
                          }}
                        >
                          <img
                            src={s.logoSrc}
                            alt={`${s.name} logo`}
                            style={{ width: "100%", height: "100%", objectFit: "contain", filter: "grayscale(100%) brightness(1.25)", opacity: 0.92 }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* Safety duplicate if ResizeObserver hasn’t computed yet */}
                    {sequenceWidthPx ? null : (
                      <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
                        {sponsorSequence.map((s, idx) => (
                          <div key={`fallback-${s.id}-${idx}`} style={{ width: 170, height: 54 }} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Offers grid (themed) */}
              <div style={{ marginTop: spacing.lg, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
                {SPONSORS.map((s) => {
                  const offers = DUMMY_OFFERS[s.id] || [];
                  const headline = offers[0]?.title || "Members-only offer";
                  const condition = offers[0]?.condition || "Rolling soon";
                  return (
                    <motion.div key={s.id} whileHover={reduce ? undefined : { y: -2 }} style={{ height: "100%" }}>
                      <div
                        style={{
                          height: "100%",
                          minHeight: 150,
                          borderRadius: borderRadius.card, // 16px - football-first
                          border: `1px solid ${s.accent}40`, // Sponsor-branded border
                          background: colors.surface.card, // Football-first card background
                          padding: spacing.cardPadding, // 32px minimum - readable text zones
                          position: "relative",
                          overflow: "hidden",
                          boxShadow: shadows.card, // Sports broadcast style
                        }}
                      >
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(800px 380px at 20% 20%, ${s.accent}20 0%, transparent 55%), radial-gradient(700px 420px at 86% 75%, ${s.accent2}18 0%, transparent 60%)`, opacity: 0.9 }} />
                        <div style={{ position: "relative", zIndex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{s.name.toUpperCase()}</div>
                            <div style={{ width: 26, height: 26, borderRadius: 999, background: `${s.accent}2A`, border: `1px solid ${s.accent}33` }} />
                          </div>
                          <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 10, lineHeight: 1.35 }}>
                            {headline}
                          </div>
                          <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 10, lineHeight: 1.5 }}>{condition}</div>
                          <div style={{ marginTop: 12, ...typography.caption, color: colors.text.muted, opacity: 0.9 }}>Dynamic rewards (rolling soon)</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Dynamic incentives */}
              <div style={{ marginTop: spacing.lg, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
                {[
                  { title: "🏆 Win Bonus", desc: "Extra perks if FCRB wins this week", tag: "WIN_BONUS" },
                  { title: "🎟 Matchday Special", desc: "Matchday-only reward window", tag: "MATCHDAY_SPECIAL" },
                  { title: "👟 Training Boost", desc: "Training-week offer for Fan Club members", tag: "TRAINING_BOOST" },
                ].map((d) => {
                  const live = (dynamicRewards || []).some((x: any) => x.key === d.tag && x.isActive);
                  return (
                    <div key={d.tag} style={{ borderRadius: borderRadius.card, border: `1px solid ${live ? colors.success.main + '60' : 'rgba(255,255,255,0.10)'}`, background: colors.surface.card, padding: spacing.cardPadding, boxShadow: live ? shadows.cardHover : shadows.card }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md, alignItems: "flex-start", marginBottom: spacing['8'] }}>
                        <div style={{ ...typography.h5, color: colors.text.primary, fontWeight: typography.fontWeight.bold }}>{d.title}</div>
                        <div style={{ ...typography.caption, color: live ? colors.success.main : colors.text.muted, fontWeight: typography.fontWeight.semibold, padding: `${spacing['4']} ${spacing['8']}`, borderRadius: borderRadius.full, background: live ? colors.success.soft : colors.surface.soft }}>{live ? "Live" : "Rolling soon"}</div>
                      </div>
                      <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.6, paddingLeft: spacing['4'] }}>{d.desc}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Matchday module */}
        {flags.matchday === false ? null : (
          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card variant="default" padding="xl" style={{ borderRadius: borderRadius.card, padding: spacing.cardPadding, background: colors.surface.card, border: "1px solid rgba(255,255,255,0.10)", overflow: "hidden", boxShadow: shadows.card }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em", marginBottom: 6 }}>MATCHDAY</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Countdown, unlocks, moments</div>
                </div>
                <a href="/realverse/fan/matchday" style={{ ...typography.caption, color: colors.primary.light, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Open hub</span>
                  <ArrowRightIcon size={14} color={colors.primary.light} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: spacing.lg, alignItems: "stretch" }}>
                <div style={{ borderRadius: borderRadius.card, border: `1px solid ${colors.accent.main}40`, background: colors.surface.card, padding: spacing.cardPadding, boxShadow: shadows.card, position: "relative", overflow: "hidden" }}>
                  {/* Matchday badge accent */}
                  <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)` }} />
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.12em", marginBottom: spacing['8'], marginTop: spacing['4'] }}>NEXT MATCH</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing['8'], fontWeight: typography.fontWeight.bold }}>{nextFixture ? `FCRB vs ${nextFixture.opponent}` : "Fixture loading"}</div>
                  <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.md, paddingLeft: spacing['4'], lineHeight: 1.6 }}>
                    {nextFixture ? `${new Date(nextFixture.matchDate).toLocaleDateString()} • ${nextFixture.matchTime || ""} • ${nextFixture.venue || "Venue TBA"}` : "—"}
                  </div>
                  <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                    <div style={{ padding: `${spacing['12']} ${spacing['16']}`, borderRadius: borderRadius.button, border: `1px solid ${colors.primary.main}40`, background: colors.surface.soft, boxShadow: shadows.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>Countdown</div>
                      <div style={{ ...typography.h4, color: colors.primary.main, fontWeight: typography.fontWeight.bold, marginTop: spacing['4'] }}>
                        {countdown ? `${countdown.d}d ${countdown.h}h ${countdown.m}m` : "—"}
                      </div>
                    </div>
                    <div style={{ padding: `${spacing['12']} ${spacing['16']}`, borderRadius: borderRadius.button, border: `1px solid ${colors.accent.main}40`, background: colors.surface.soft, boxShadow: shadows.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>Predicted XI</div>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing['4'] }}>Locked for now</div>
                    </div>
                    <div style={{ padding: `${spacing['12']} ${spacing['16']}`, borderRadius: borderRadius.button, border: "1px solid rgba(255,255,255,0.10)", background: colors.surface.soft, boxShadow: shadows.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>Weekly unlock</div>
                      <div style={{ ...typography.body, color: colors.accent.main, fontWeight: typography.fontWeight.bold, marginTop: spacing['4'] }}>Streak bonus active</div>
                    </div>
                  </div>
                </div>

                <div style={{ borderRadius: borderRadius.card, border: "1px solid rgba(255,255,255,0.10)", background: colors.surface.card, padding: spacing.cardPadding, overflow: "hidden", boxShadow: shadows.card }}>
                  <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.12em", marginBottom: spacing.md }}>MOMENTS GALLERY</div>
                  <div style={{ display: "flex", gap: spacing.md, overflowX: "auto", paddingBottom: spacing['6'], scrollbarWidth: "none" as any }}>
                    {(moments || []).slice(0, 10).map((m: any) => {
                      const locked = !!m.isLocked;
                      return (
                        <div
                          key={m.id}
                          style={{
                            width: 220,
                            flex: "0 0 auto",
                            borderRadius: borderRadius.card, // 16px - football-first
                            border: locked ? "1px solid rgba(255,255,255,0.08)" : `1px solid ${colors.accent.main}40`,
                            background: colors.surface.soft,
                            overflow: "hidden",
                            position: "relative",
                            boxShadow: shadows.sm,
                          }}
                          title={locked ? "Locked — keep building" : "Open moment"}
                        >
                          <div
                            aria-hidden="true"
                            style={{
                              height: 110,
                              backgroundImage: `url(${m.thumbnailUrl || "/assets/DSC00893.jpg"})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              filter: locked ? "blur(8px) grayscale(100%)" : "none",
                              opacity: locked ? 0.55 : 0.9,
                            }}
                          />
                          <div style={{ padding: spacing.md }}>
                            <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.12em", fontSize: typography.fontSize.xs, marginBottom: spacing['8'] }}>{(m.category || "MOMENT").toUpperCase()}</div>
                            <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, lineHeight: 1.3, paddingLeft: spacing['4'] }}>
                              {m.title}
                            </div>
                          </div>
                          {locked && (
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "grid",
                                placeItems: "center",
                                background: "linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.60) 100%)",
                                color: colors.text.primary,
                              }}
                            >
                              <div style={{ padding: "8px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.45)", ...typography.caption }}>
                                Locked — keep building
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(moments || []).length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>Moments will appear after matchdays.</div>}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Games & Quests teaser */}
        {flags.games === false ? null : (
          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card variant="default" padding="xl" style={{ borderRadius: 26, padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em", marginBottom: 6 }}>GAMES & QUESTS</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Quest tracks</div>
                </div>
                <a href="/realverse/fan/games" style={{ ...typography.caption, color: colors.primary.light, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Play</span>
                  <ArrowRightIcon size={14} color={colors.primary.light} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
                {[
                  { title: "Fan Loyalty Track", desc: "Daily ritual actions → tier progression" },
                  { title: "Matchday Track", desc: "Predictions, streaks, weekly unlocks" },
                  { title: "Knowledge Track", desc: "Quizzes, trivia, club IQ boosts" },
                ].map((t) => (
                  <div key={t.title} style={{ borderRadius: borderRadius.card, border: `1px solid ${colors.accent.main}40`, background: colors.surface.card, padding: spacing.cardPadding, boxShadow: shadows.card }}>
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, marginBottom: spacing['8'] }}>
                      <span style={{ fontSize: 24 }}>{t.icon}</span>
                      <div style={{ ...typography.h5, color: colors.text.primary, fontWeight: typography.fontWeight.bold }}>{t.title}</div>
                    </div>
                    <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, paddingLeft: spacing['32'], lineHeight: 1.6 }}>{t.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: spacing.lg, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
                {(loading ? [0, 1, 2] : topQuests).map((q: any, idx: number) => (
                  <div key={q?.id || idx} style={{ borderRadius: borderRadius.card, border: `1px solid ${colors.primary.main}40`, background: colors.surface.card, padding: spacing.cardPadding, boxShadow: shadows.card }}>
                    <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.12em", marginBottom: spacing['8'] }}>QUEST</div>
                    <div style={{ ...typography.h5, color: colors.text.primary, fontWeight: typography.fontWeight.bold, marginBottom: spacing['8'] }}>{loading ? "Loading…" : q?.title}</div>
                    <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.6, paddingLeft: spacing['4'] }}>{loading ? "…" : q?.description}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: spacing.lg }}>
                <a href="/realverse/fan/games" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="md" style={{ width: "100%", background: colors.accent.main, color: colors.text.onAccent }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                      <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Open Games & Quests</span>
                      <ArrowRightIcon size={16} color={colors.text.onAccent} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                    </span>
                  </Button>
                </a>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Programmes conversion */}
        {flags.programs === false ? null : (
          <motion.div variants={cardVariants} initial="initial" animate="animate">
            <Card variant="default" padding="xl" style={{ borderRadius: 26, padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                <div>
                  <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em", marginBottom: 6 }}>TRAIN WITH US</div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>From supporter to squad</div>
                </div>
                <a href="/realverse/fan/programs" style={{ ...typography.caption, color: colors.primary.light, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Explore</span>
                  <ArrowRightIcon size={14} color={colors.primary.light} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                </a>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.lg, alignItems: "stretch" }}>
                <div style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: 20 }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>RealVerse preview</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>Mock analytics — this is what players unlock.</div>
                  <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: spacing.sm }}>
                    {[
                      { k: "Pace", v: 72 },
                      { k: "Endurance", v: 68 },
                      { k: "Reaction", v: 70 },
                      { k: "Dribbling", v: 66 },
                    ].map((s) => (
                      <div key={s.k} style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: 14 }}>
                        <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{s.k.toUpperCase()}</div>
                        <div style={{ ...typography.h3, color: colors.text.primary, marginTop: 6 }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderRadius: borderRadius.card, border: "1px solid rgba(255,255,255,0.10)", background: colors.surface.card, padding: spacing.cardPadding, boxShadow: shadows.card }}>
                  <div style={{ ...typography.h5, color: colors.text.primary, fontWeight: typography.fontWeight.bold, marginBottom: spacing['8'] }}>Tell us your intent</div>
                  <div style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, marginBottom: spacing.md, paddingLeft: spacing['4'], lineHeight: 1.6 }}>
                    We'll route you to the right pathway: FYDP → SCP → EPP, or Women's Performance Pathway.
                  </div>
                  <div style={{ display: "grid", gap: spacing.sm, marginTop: spacing.md }}>
                    {[
                      { id: "FYDP" as const, label: "Foundation & Youth Development (FYDP)" },
                      { id: "SCP" as const, label: "Senior Competitive Programme (SCP)" },
                      { id: "WPP" as const, label: "Women's Performance Pathway (WPP)" },
                      { id: "EPP" as const, label: "Elite Pathway Programme (EPP)" },
                    ].map((p) => (
                      <Button key={p.id} variant="secondary" size="md" onClick={() => onInterest(p.id)} style={{ justifyContent: "space-between", borderRadius: borderRadius.button }}>
                        <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>{p.label}</span>
                        <ArrowRightIcon size={16} color={colors.text.secondary} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                      </Button>
                    ))}
                  </div>
                  <div style={{ marginTop: spacing.md }}>
                    <a href="/realverse/fan/programs" style={{ textDecoration: "none" }}>
                      <Button variant="primary" size="md" style={{ width: "100%", borderRadius: borderRadius.button, background: colors.accent.main, color: colors.text.onAccent }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                          <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Explore Programmes</span>
                          <ArrowRightIcon size={16} color={colors.text.onAccent} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                        </span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FanDashboardOverview;




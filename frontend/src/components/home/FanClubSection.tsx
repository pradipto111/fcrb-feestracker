import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { heroCTAPillStyles } from "../../theme/hero-design-patterns";
import { Button } from "../ui/Button";
import { CheckIcon, StarIcon, TrophyIcon, ArrowRightIcon, LockIcon } from "../icons/IconSet";
import { FAN_CLUB_TIERS, SPONSOR_BENEFITS } from "../../data/fanclubBenefits";
import type { FanClubTierId } from "../../types/fanclub";
import {
  trackFanClubCtaHover,
  trackFanClubJoinClicked,
  trackFanClubOnboardingStep,
  trackFanClubRewardHover,
  trackFanClubScrollDepth,
  trackFanClubSectionView,
  trackFanClubSponsorCardView,
  trackFanClubTierSelected,
} from "../../analytics/fanclubAnalytics";

type Step = 1 | 2 | 3 | 4;

const STORAGE_JOIN_KEY = "rv_fanclub_join_v1";

function getTierMeta(tierId: FanClubTierId) {
  return FAN_CLUB_TIERS.find((t) => t.id === tierId) || FAN_CLUB_TIERS[1];
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function tierRank(tierId: FanClubTierId) {
  if (tierId === "rookie") return 1;
  if (tierId === "regular") return 2;
  return 3;
}

const BadgePreview: React.FC<{ tierId: FanClubTierId }> = ({ tierId }) => {
  const tier = getTierMeta(tierId);
  const isInner = tierId === "inner";
  const accent = isInner ? colors.accent.main : colors.primary.main;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 999,
        border: `1px solid ${accent}33`,
        background: "rgba(255,255,255,0.04)",
        boxShadow: `0 12px 32px rgba(0,0,0,0.35), 0 0 26px ${isInner ? "rgba(255,169,0,0.14)" : "rgba(0,224,255,0.12)"}`,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.14)",
          display: "grid",
          placeItems: "center",
          background: "rgba(0,0,0,0.18)",
        }}
      >
        {isInner ? <TrophyIcon size={18} color={colors.accent.main} /> : <StarIcon size={18} color={colors.primary.main} />}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.16em", fontSize: typography.fontSize.xs }}>FAN BADGE</div>
        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.1 }}>{tier.name}</div>
      </div>
    </div>
  );
};

export const FanClubSection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const hasViewedRef = useRef(false);
  const maxDepthRef = useRef(0);
  const hoverStartRef = useRef<Record<string, number>>({});

  const [step, setStep] = useState<Step>(1);
  const [selectedTierId, setSelectedTierId] = useState<FanClubTierId>("regular");
  const [joined, setJoined] = useState(false);

  const topSponsors = useMemo(() => SPONSOR_BENEFITS.slice(0, 3), []);

  useEffect(() => {
    // Restore joined state (UI-only)
    try {
      const raw = localStorage.getItem(STORAGE_JOIN_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.joined && parsed?.tierId) {
        setJoined(true);
        setSelectedTierId(parsed.tierId);
        setStep(4);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const total = Math.max(1, rect.height);
      const seen = vh - rect.top;
      const depth = clamp01(seen / total);
      const pct = Math.round(depth * 100);
      if (pct > maxDepthRef.current) {
        maxDepthRef.current = pct;
        trackFanClubScrollDepth("fan-club", pct);
      }
      if (!hasViewedRef.current && rect.top < vh * 0.75 && rect.bottom > 0) {
        hasViewedRef.current = true;
        trackFanClubSectionView("fan-club");
      }
    };

    const rafScroll = () => {
      if ((rafScroll as any)._r) return;
      (rafScroll as any)._r = requestAnimationFrame(() => {
        (rafScroll as any)._r = 0;
        onScroll();
      });
    };

    onScroll();
    window.addEventListener("scroll", rafScroll, { passive: true });
    return () => window.removeEventListener("scroll", rafScroll as any);
  }, []);

  useEffect(() => {
    trackFanClubOnboardingStep(step);
  }, [step]);

  const setTier = (tierId: FanClubTierId) => {
    setSelectedTierId(tierId);
    trackFanClubTierSelected(tierId);
  };

  const ctaHoverHandlers = (ctaId: string) => ({
    onMouseEnter: () => {
      hoverStartRef.current[ctaId] = Date.now();
    },
    onMouseLeave: () => {
      const start = hoverStartRef.current[ctaId];
      if (!start) return;
      delete hoverStartRef.current[ctaId];
      trackFanClubCtaHover(ctaId, Date.now() - start);
    },
  });

  const scrollToPerks = () => {
    const target = document.getElementById("fanclub-perks");
    if (!target) return;
    const lenis = (window as any).lenis;
    if (lenis) lenis.scrollTo(target, { offset: -100, duration: 1.0 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const joinNow = () => {
    trackFanClubJoinClicked(selectedTierId, "homepage_section");
    setJoined(true);
    setStep(4);
    try {
      localStorage.setItem(STORAGE_JOIN_KEY, JSON.stringify({ joined: true, tierId: selectedTierId, joinedAt: new Date().toISOString() }));
    } catch {
      // ignore
    }
  };

  const stepCardStyle: React.CSSProperties = {
    borderRadius: borderRadius["2xl"],
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10,16,32,0.34)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 22px 64px rgba(0,0,0,0.42)",
    overflow: "hidden",
    position: "relative",
  };

  const stepWrap: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
    gap: spacing.xl,
    alignItems: "stretch",
  };

  const title = "The FC Real Bengaluru Fan Club";
  const subline = "More than a membership — it’s how you stay part of the journey.";

  return (
    <div ref={sectionRef} style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: spacing.xl }}
      >
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: spacing.lg, alignItems: "end" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              FAN CLUB
            </div>
            <h2 style={{ ...typography.h1, fontSize: `clamp(2.1rem, 4.0vw, 3.1rem)`, margin: 0, color: colors.text.primary, lineHeight: 1.06 }}>
              {title}
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.7, marginTop: spacing.md, maxWidth: "70ch" }}>
              {subline}
            </p>
          </div>

          <div style={{ display: "flex", gap: spacing.sm, justifyContent: isMobile ? "flex-start" : "flex-end", flexWrap: "wrap" }}>
            <motion.button
              type="button"
              onClick={() => setStep(1)}
              whileHover={!reduce ? { y: -2 } : undefined}
              whileTap={!reduce ? { scale: 0.98 } : undefined}
              style={{
                ...heroCTAPillStyles.base,
                padding: "10px 14px",
                boxShadow: "none",
                opacity: joined ? 1 : 0.85,
              }}
              {...ctaHoverHandlers("fanclub_cta_restart")}
            >
              See Your Progress
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setStep(joined ? 4 : 1)}
              whileHover={!reduce ? { y: -2 } : undefined}
              whileTap={!reduce ? { scale: 0.98 } : undefined}
              style={{
                ...heroCTAPillStyles.base,
                ...heroCTAPillStyles.gold,
                padding: "10px 14px",
                boxShadow: "none",
              }}
              {...ctaHoverHandlers("fanclub_cta_primary")}
            >
              {joined ? "Explore Fan Benefits" : "Join the Fan Club"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Onboarding + Hub */}
      <div style={{ ...stepCardStyle }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.14) 0%, transparent 56%), radial-gradient(circle at 82% 16%, rgba(255,169,0,0.12) 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.70) 0%, rgba(10,22,51,0.44) 42%, rgba(5,11,32,0.72) 100%)",
            opacity: 0.95,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, padding: isMobile ? spacing.lg : spacing["2xl"] }}>
          <div style={stepWrap}>
            {/* Left: Steps */}
            <div style={{ minWidth: 0 }}>
              {/* Step rail */}
              <div style={{ display: "flex", gap: spacing.xs, flexWrap: "wrap", marginBottom: spacing.lg }}>
                {[1, 2, 3, 4].map((s) => {
                  const active = step === s;
                  const done = step > s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStep(s as Step)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: active ? `1px solid rgba(0,224,255,0.40)` : "1px solid rgba(255,255,255,0.12)",
                        background: active ? "rgba(0,224,255,0.08)" : "rgba(255,255,255,0.04)",
                        color: colors.text.primary,
                        cursor: "pointer",
                        boxShadow: active ? "0 0 26px rgba(0,224,255,0.12)" : "none",
                      }}
                      aria-current={active ? "step" : undefined}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 8,
                          display: "grid",
                          placeItems: "center",
                          background: done ? "rgba(34,197,94,0.18)" : "rgba(0,0,0,0.22)",
                          border: "1px solid rgba(255,255,255,0.14)",
                          color: done ? "#22C55E" : colors.text.muted,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {done ? "✓" : s}
                      </span>
                      <span style={{ ...typography.caption, color: active ? colors.text.primary : colors.text.secondary, letterSpacing: "0.10em" }}>
                        {s === 1 ? "Welcome" : s === 2 ? "Choose Tier" : s === 3 ? "Unlocks" : "Confirm"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>
                      You’re backing FC Real Bengaluru. This is how we give back.
                    </div>
                    <p style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.75, maxWidth: "70ch", marginBottom: spacing.lg }}>
                      A premium Fan Club built for belonging, progress, and real rewards — without clutter or long forms.
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.sm, marginBottom: spacing.lg }}>
                      {[
                        { label: "Belonging", sub: "Badge + community preview", Icon: StarIcon, accent: "rgba(0,224,255,0.55)" },
                        { label: "Rewards", sub: "Sponsor perks (dynamic soon)", Icon: TrophyIcon, accent: "rgba(255,169,0,0.60)" },
                        { label: "Progress", sub: "Next unlock hints", Icon: ArrowRightIcon, accent: "rgba(34,197,94,0.60)" },
                      ].map(({ label, sub, Icon, accent }) => (
                        <div
                          key={label}
                          style={{
                            borderRadius: borderRadius.xl,
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(255,255,255,0.03)",
                            padding: spacing.md,
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 14,
                              border: `1px solid ${accent}`,
                              background: "rgba(0,0,0,0.20)",
                              display: "grid",
                              placeItems: "center",
                              boxShadow: `0 0 24px ${accent.replace("0.55", "0.14").replace("0.60", "0.14")}`,
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={18} color={accent.replace("0.55", "1").replace("0.60", "1")} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>
                              {label}
                            </div>
                            <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.45 }}>{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                      <Button variant="primary" size="md" onClick={() => setStep(2)} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_continue")}>
                        Continue
                      </Button>
                      <Button variant="secondary" size="md" onClick={scrollToPerks} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_view_perks_from_step1")}>
                        Explore Fan Benefits
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>Choose Your Fan Level</div>
                    <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.7, marginBottom: spacing.md }}>
                      Upgrade anytime. Benefits stack instantly.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.md, marginBottom: spacing.lg }}>
                      {FAN_CLUB_TIERS.map((tier) => {
                        const active = selectedTierId === tier.id;
                        const recommended = tier.id === "regular";
                        const premium = tier.id === "inner";
                        const accent = recommended ? colors.primary.main : premium ? colors.accent.main : "rgba(255,255,255,0.14)";
                        return (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setTier(tier.id)}
                            style={{
                              textAlign: "left",
                              borderRadius: borderRadius["2xl"],
                              border: active ? `1px solid ${accent}55` : "1px solid rgba(255,255,255,0.12)",
                              background: active ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                              padding: spacing.lg,
                              cursor: "pointer",
                              position: "relative",
                              overflow: "hidden",
                              boxShadow: active ? `0 22px 60px rgba(0,0,0,0.45), 0 0 28px ${accent}26` : "0 16px 48px rgba(0,0,0,0.35)",
                            }}
                            aria-pressed={active}
                          >
                            <div
                              aria-hidden="true"
                              style={{
                                position: "absolute",
                                inset: 0,
                                background: premium
                                  ? "radial-gradient(circle at 16% 18%, rgba(255,169,0,0.18) 0%, transparent 58%), radial-gradient(circle at 88% 22%, rgba(0,224,255,0.16) 0%, transparent 62%)"
                                  : recommended
                                    ? "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.18) 0%, transparent 58%), radial-gradient(circle at 88% 18%, rgba(255,169,0,0.12) 0%, transparent 62%)"
                                    : "radial-gradient(circle at 16% 18%, rgba(255,255,255,0.06) 0%, transparent 58%)",
                                opacity: 0.95,
                              }}
                            />

                            <div style={{ position: "relative", zIndex: 1 }}>
                              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm }}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ ...typography.h4, margin: 0, color: colors.text.primary }}>{tier.name}</div>
                                  <div style={{ ...typography.overline, marginTop: 4, color: colors.text.muted, letterSpacing: "0.14em" }}>{tier.id.toUpperCase()}</div>
                                </div>
                                {recommended && (
                                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(0,224,255,0.28)", background: "rgba(0,224,255,0.10)", color: colors.text.primary, ...typography.caption, fontSize: typography.fontSize.xs }}>
                                    Recommended
                                  </div>
                                )}
                              </div>

                              <div style={{ marginTop: spacing.md, display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                                <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                                  {tier.priceLabel}
                                </div>
                                <div style={{ ...typography.caption, color: colors.text.muted }}>
                                  {tier.benefits.length} unlocks
                                </div>
                              </div>

                              <div style={{ marginTop: spacing.md, display: "grid", gap: 8 }}>
                                {tier.benefits.slice(0, 3).map((b) => (
                                  <div key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                    <CheckIcon size={16} color={colors.success.main} />
                                    <span style={{ ...typography.caption, color: colors.text.secondary, lineHeight: 1.4 }}>{b}</span>
                                  </div>
                                ))}
                              </div>

                              {premium && (
                                <div style={{ marginTop: spacing.md, display: "inline-flex", alignItems: "center", gap: 8, color: colors.text.muted, ...typography.caption }}>
                                  <LockIcon size={16} color={colors.text.muted} />
                                  Locked glow — premium tier
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                      <Button variant="secondary" size="md" onClick={() => setStep(1)} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_back_to_step1")}>
                        Back
                      </Button>
                      <Button variant="primary" size="md" onClick={() => setStep(3)} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_select_tier")}>
                        Select Your Fan Level
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>What You Unlock</div>
                    <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.7, marginBottom: spacing.lg }}>
                      Immediate perks + a system that grows with your engagement.
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr", gap: spacing.lg, marginBottom: spacing.lg }}>
                      {/* Checklist */}
                      <div style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: spacing.lg }}>
                        {[
                          { title: "Sponsor rewards preview", sub: "Perks from official partners" },
                          { title: "Dynamic rewards (rolling soon)", sub: "Matchday + win-based drops" },
                          { title: "Fan badge preview", sub: "Your identity in the ecosystem" },
                          { title: "Community access", sub: "Discussions • polls • updates (UI preview)" },
                        ].map((row, idx) => (
                          <motion.div
                            key={row.title}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : idx * 0.06 }}
                            style={{ display: "flex", gap: 12, padding: "10px 0" }}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: 10, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.12)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                              <CheckIcon size={16} color={colors.success.main} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>{row.title}</div>
                              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.45 }}>{row.sub}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Badge preview */}
                      <div style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.md }}>
                        <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em" }}>YOUR BADGE</div>
                        <BadgePreview tierId={selectedTierId} />
                        <div style={{ marginTop: "auto", ...typography.caption, color: colors.text.muted, lineHeight: 1.6 }}>
                          Preview only — your badge activates after joining.
                        </div>
                      </div>
                    </div>

                    {/* Sponsor rewards preview */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.md, marginBottom: spacing.lg }}>
                      {topSponsors.map((s) => (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.25 }}
                          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                          onViewportEnter={() => trackFanClubSponsorCardView(s.id, s.incentiveTag)}
                          style={{
                            borderRadius: borderRadius["2xl"],
                            border: "1px solid rgba(255,255,255,0.10)",
                            background: "rgba(8,12,24,0.26)",
                            overflow: "hidden",
                            position: "relative",
                          }}
                        >
                          <div
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: `radial-gradient(circle at 16% 18%, ${s.accent}18 0%, transparent 60%), radial-gradient(circle at 88% 18%, ${s.accent2}14 0%, transparent 62%)`,
                              opacity: 0.95,
                            }}
                          />
                          <div style={{ position: "relative", zIndex: 1, padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.sm }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 42, height: 42, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", overflow: "hidden" }}>
                                <img src={s.logoSrc} alt={`${s.name} logo`} style={{ width: "88%", height: "88%", objectFit: "contain", filter: "grayscale(100%) brightness(1.25)" }} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ ...typography.overline, color: s.accent2, letterSpacing: "0.14em" }}>{s.roleLabel}</div>
                                <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.15 }}>{s.name}</div>
                              </div>
                            </div>

                            <div
                              style={{
                                marginTop: 6,
                                borderRadius: borderRadius.lg,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "rgba(0,0,0,0.16)",
                                padding: spacing.md,
                              }}
                              onMouseEnter={() => trackFanClubRewardHover(s.id)}
                            >
                              <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>Reward preview</div>
                              <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6, lineHeight: 1.35 }}>
                                {s.rewards[0]}
                              </div>
                              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8, opacity: 0.9 }}>Dynamic rewards (rolling soon)</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                      <Button variant="secondary" size="md" onClick={() => setStep(2)} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_back_to_step2")}>
                        Back
                      </Button>
                      <Button variant="primary" size="md" onClick={joinNow} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_join")}>
                        Join the Fan Club
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                    transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>
                      Welcome to the FC Real Bengaluru Fan Club.
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm, alignItems: "center", marginBottom: spacing.lg }}>
                      <BadgePreview tierId={selectedTierId} />
                      <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.6 }}>
                        Attend matches. Engage. Unlock more.
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                      <Button variant="primary" size="md" onClick={scrollToPerks} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_explore_benefits")}>
                        Explore Your Benefits
                      </Button>
                      <Button variant="secondary" size="md" onClick={() => setStep(3)} style={{ borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_view_rewards")}>
                        View Rewards
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Fan Hub (UI-only) */}
            <div style={{ minWidth: 0 }}>
              <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: spacing.sm }}>
                FAN CLUB HUB (UI ONLY)
              </div>

              {/* Status card */}
              <div style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: spacing.lg, marginBottom: spacing.md, position: "relative", overflow: "hidden" }}>
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.12) 0%, transparent 60%), radial-gradient(circle at 82% 18%, rgba(255,169,0,0.10) 0%, transparent 62%)", opacity: 0.95 }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>Tier</div>
                      <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{getTierMeta(selectedTierId).name}</div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <BadgePreview tierId={selectedTierId} />
                    </div>
                  </div>

                  <div style={{ marginTop: spacing.md }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: spacing.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted }}>Progress</div>
                      <div style={{ ...typography.caption, color: colors.text.muted }}>Visual only</div>
                    </div>
                    <div style={{ marginTop: 8, height: 10, borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${joined ? (tierRank(selectedTierId) / 3) * 100 : 18}%`,
                          background: "linear-gradient(90deg, rgba(0,224,255,0.75), rgba(255,169,0,0.65))",
                        }}
                      />
                    </div>
                    <div style={{ marginTop: spacing.sm, ...typography.caption, color: colors.text.muted }}>
                      Next unlock: {selectedTierId === "inner" ? "Inner Circle recognition (future)" : selectedTierId === "regular" ? "Upgrade to Inner Circle for maximum perks" : "Move to Matchday Regular for win bonuses"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards snapshot */}
              <div style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: spacing.lg, marginBottom: spacing.md }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.sm, marginBottom: spacing.sm }}>
                  <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>Rewards Snapshot</div>
                  <div style={{ ...typography.caption, color: colors.text.muted }}>Top 3 perks</div>
                </div>
                <div style={{ display: "grid", gap: spacing.sm }}>
                  {topSponsors.map((s, idx) => {
                    const unlocked = joined && tierRank(selectedTierId) >= (idx === 0 ? 1 : idx === 1 ? 2 : 3);
                    return (
                      <div
                        key={s.id}
                        style={{
                          borderRadius: borderRadius.xl,
                          border: "1px solid rgba(255,255,255,0.10)",
                          background: "rgba(0,0,0,0.16)",
                          padding: "12px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={() => trackFanClubRewardHover(s.id)}
                      >
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 16% 18%, ${s.accent}12 0%, transparent 65%)`, opacity: 0.9 }} />
                        <div style={{ position: "relative", zIndex: 1, width: 36, height: 36, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", display: "grid", placeItems: "center", overflow: "hidden", flexShrink: 0 }}>
                          <img src={s.logoSrc} alt="" aria-hidden="true" style={{ width: "88%", height: "88%", objectFit: "contain", filter: "grayscale(100%) brightness(1.25)" }} />
                        </div>
                        <div style={{ position: "relative", zIndex: 1, minWidth: 0 }}>
                          <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{s.incentiveCopy}</div>
                          <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.25, marginTop: 4, opacity: unlocked ? 1 : 0.55 }}>
                            {s.rewards[0]}
                          </div>
                        </div>
                        <div style={{ marginLeft: "auto", position: "relative", zIndex: 1 }}>
                          {unlocked ? (
                            <div style={{ ...typography.caption, color: "#22C55E", fontWeight: 700 }}>Unlocked</div>
                          ) : (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, ...typography.caption, color: colors.text.muted }}>
                              <LockIcon size={14} color={colors.text.muted} /> Locked
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Community preview */}
              <div style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: spacing.lg }}>
                <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, marginBottom: spacing.sm }}>Community Preview</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: spacing.sm }}>
                  {["Fan discussions", "Matchday polls", "Club updates"].map((t) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: borderRadius.lg, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.14)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(0,224,255,0.55)", boxShadow: "0 0 18px rgba(0,224,255,0.18)" }} />
                      <div style={{ ...typography.body, color: colors.text.secondary }}>{t}</div>
                    </div>
                  ))}
                </div>

                {!joined && (
                  <div style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.6, marginBottom: spacing.sm }}>
                      Preview only — join the Fan Club to activate rewards and identity.
                    </div>
                    <Button variant="primary" size="md" onClick={() => setStep(1)} style={{ width: "100%", borderRadius: 999 }} {...ctaHoverHandlers("fanclub_cta_start_from_hub")}>
                      Join the Fan Club
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



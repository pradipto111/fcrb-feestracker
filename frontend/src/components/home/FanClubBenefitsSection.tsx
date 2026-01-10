import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { FAN_CLUB_TIERS, SPONSOR_BENEFITS, type IncentiveTag, type SponsorBenefit } from "../../data/fanclubBenefits";
import { SponsorLogoWall } from "./SponsorLogoWall";
import { Button } from "../ui/Button";
import { CalendarIcon, DumbbellIcon, TrophyIcon } from "../icons/IconSet";

const IncentiveBadge = ({ tag, accent }: { tag: IncentiveTag; accent: string }) => {
  const meta = useMemo(() => {
    if (tag === "WIN_BONUS") return { label: "Win Bonus", Icon: TrophyIcon };
    if (tag === "MATCHDAY_SPECIAL") return { label: "Matchday Special", Icon: CalendarIcon };
    return { label: "Training Boost", Icon: DumbbellIcon };
  }, [tag]);
  const Icon = meta.Icon;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 999,
        border: `1px solid ${accent}33`,
        background: "rgba(0,0,0,0.18)",
        color: colors.text.secondary,
        ...typography.caption,
        fontSize: typography.fontSize.xs,
        letterSpacing: "0.12em",
        whiteSpace: "nowrap",
      }}
    >
      <Icon size={14} color={accent} />
      {meta.label}
    </div>
  );
};

const RewardTile = ({ text, accent, accent2 }: { text: string; accent: string; accent2: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={!reduce ? { y: -2, scale: 1.01 } : undefined}
      style={{
        scrollSnapAlign: "start",
        flex: "0 0 auto",
        width: 320,
        borderRadius: borderRadius.card, // 16px - football-first
        border: "1px solid rgba(255,255,255,0.10)",
        background: colors.surface.card, // Football-first card background
        boxShadow: shadows.card, // Sports broadcast style
        overflow: "hidden",
        position: "relative",
        minHeight: 88,
        padding: spacing.cardPadding, // 32px minimum - readable text zones
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 18% 22%, ${accent}1E 0%, transparent 60%), radial-gradient(circle at 88% 18%, ${accent2}18 0%, transparent 62%)`,
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, padding: spacing.md, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em" }}>MEMBER REWARD</div>
        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.3 }}>{text}</div>
      </div>
    </motion.div>
  );
};

const LockMark = ({ color = "rgba(255,255,255,0.92)" }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ display: "block" }}>
    <path
      fill={color}
      d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm7 12H7v-8h10v8Z"
    />
  </svg>
);

const HorizontalSnap = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean }) => (
  <div
    style={{
      display: "flex",
      gap: spacing.md,
      overflowX: "auto",
      paddingBottom: 6,
      scrollSnapType: "x mandatory",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
      paddingLeft: isMobile ? 2 : 2,
      paddingRight: isMobile ? 2 : 2,
    }}
  >
    {children}
  </div>
);

// (Legacy card left in history; replaced by SponsorRewardsCardWithLocks below for tier-lock UX)

export const FanClubBenefitsSection: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const navigate = useNavigate();
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const [tierHint, setTierHint] = useState<null | string>(null);
  const [previewTier, setPreviewTier] = useState<"rookie" | "regular" | "inner">("regular");

  const tooltip = "Coming soon — Fan Club unlocks perks";

  const onExploreBenefits = () => {
    if (!pricingRef.current) return;
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(pricingRef.current, { offset: -100, duration: 1.0 });
    } else {
      pricingRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const onJoinFanClub = () => {
    navigate("/fan-club/join");
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}>
      {/* Section identity (fixed) */}
      <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 0.7fr", gap: spacing.lg, alignItems: "center", marginBottom: spacing.xl }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>FAN CLUB ECOSYSTEM</div>
            <h2 style={{ ...typography.h1, fontSize: `clamp(2.2rem, 4.4vw, 3.2rem)`, margin: 0, color: colors.text.primary, lineHeight: 1.08 }}>
              Your Benefits for Backing FC Real Bengaluru
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.lg, lineHeight: 1.7, marginTop: spacing.md, maxWidth: "70ch" }}>
              Backing the club comes with real rewards — on and off the pitch.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: isMobile ? "flex-start" : "flex-end", gap: spacing.sm, flexWrap: "wrap" }}>
            <Button variant="primary" size="md" onClick={onJoinFanClub} style={{ borderRadius: 999 }}>
              Join the Fan Club
            </Button>
            <Button variant="secondary" size="md" onClick={onExploreBenefits} style={{ borderRadius: 999 }}>
              Explore All Fan Benefits
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Sponsors announcement + logos */}
      <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
        <div
          style={{
            borderRadius: borderRadius.card, // 16px - football-first
            border: "1px solid rgba(255,255,255,0.10)",
            background: colors.surface.card, // Football-first card background
            backdropFilter: "blur(14px)",
            boxShadow: shadows.card, // Sports broadcast style
            overflow: "hidden",
            padding: spacing.cardPadding, // 32px minimum
            position: "relative",
            marginBottom: spacing["2xl"],
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 20% 20%, rgba(0,224,255,0.08) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.08) 0%, transparent 55%), linear-gradient(135deg, rgba(5,11,32,0.62) 0%, rgba(10,22,51,0.48) 45%, rgba(5,11,32,0.68) 100%)",
              opacity: 0.95,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md, flexWrap: "wrap" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, lineHeight: 1.1 }}>Perks from Our Sponsors</div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
                color: colors.text.secondary,
              }}
            >
              <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.9 }}>OFFICIAL SPONSORS 2025</span>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: colors.accent.main, boxShadow: "0 0 18px rgba(255,169,0,0.35)" }} />
              <span style={{ ...typography.caption, letterSpacing: "0.14em", opacity: 0.85 }}>MEMBERS-ONLY REWARDS</span>
            </div>
          </div>
          <SponsorLogoWall
            sponsors={SPONSOR_BENEFITS.map((s) => ({ id: s.id, name: s.name, logoSrc: s.logoSrc, accent: s.accent, accent2: s.accent2, glow: s.glow, tagline: "" }))}
            isMobile={isMobile}
          />
        </div>
      </motion.div>

      {/* Sponsor reward system */}
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: spacing.lg }}
      >
        <div
          style={{
            display: "flex",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: spacing.md,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.15em", marginBottom: 6 }}>TIER PREVIEW</div>
            <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.5 }}>
              Rewards appear locked above your tier. Preview what each tier unlocks.
            </div>
          </div>

          <div style={{ display: "inline-flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { id: "rookie" as const, label: "Rookie Fan" },
              { id: "regular" as const, label: "Matchday Regular" },
              { id: "inner" as const, label: "Inner Circle" },
            ].map((t) => {
              const active = previewTier === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPreviewTier(t.id)}
                  style={{
                    ...typography.caption,
                    fontSize: typography.fontSize.sm,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: active ? "1px solid rgba(0,224,255,0.40)" : "1px solid rgba(255,255,255,0.12)",
                    background: active ? "rgba(0,224,255,0.10)" : "rgba(255,255,255,0.04)",
                    color: active ? colors.text.primary : colors.text.secondary,
                    cursor: "pointer",
                    boxShadow: active ? "0 12px 32px rgba(0,0,0,0.35), 0 0 24px rgba(0,224,255,0.10)" : "none",
                    transition: "all 0.18s ease",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: spacing.lg, alignItems: "stretch" }}>
        {SPONSOR_BENEFITS.map((s) => (
          <SponsorRewardsCardWithLocks key={s.id} sponsor={s} isMobile={isMobile} previewTier={previewTier} />
        ))}
      </div>

      {/* Pricing & Benefits matrix */}
      <div ref={pricingRef} style={{ marginTop: spacing["3xl"] }}>
        <motion.div initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap", marginBottom: spacing.lg }}>
            <div>
              <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>FAN CLUB TIERS</div>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Pricing & Benefits</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>1 membership → perks from all partners</div>
            </div>
            {tierHint ? <div style={{ ...typography.caption, color: colors.text.muted }}>{tierHint}</div> : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: spacing.lg }}>
            {FAN_CLUB_TIERS.map((t) => (
              <div
                key={t.id}
                style={{
                  borderRadius: borderRadius["2xl"],
                  border: t.highlight ? `1px solid rgba(0,224,255,0.28)` : "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: t.highlight ? "0 24px 70px rgba(0,0,0,0.45), 0 0 36px rgba(0,224,255,0.10)" : "0 18px 56px rgba(0,0,0,0.40)",
                  overflow: "hidden",
                  position: "relative",
                }}
                onMouseEnter={() => setTierHint(t.name)}
                onMouseLeave={() => setTierHint(null)}
              >
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: t.highlight
                      ? "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.14) 0%, transparent 55%), radial-gradient(circle at 80% 10%, rgba(255,169,0,0.10) 0%, transparent 55%)"
                      : "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.06) 0%, transparent 55%)",
                    opacity: 0.95,
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1, padding: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.md }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                    <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{t.name}</div>
                    {t.highlight ? (
                      <div style={{ ...typography.caption, color: colors.primary.main, letterSpacing: "0.14em", fontWeight: 800 }}>RECOMMENDED</div>
                    ) : null}
                  </div>
                  <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>{t.priceLabel}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {t.benefits.map((b) => (
                      <div key={b} style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.sm, lineHeight: 1.5 }}>
                        • {b}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <Button variant={t.highlight ? "primary" : "secondary"} size="md" onClick={onJoinFanClub} style={{ width: "100%", borderRadius: 999 }}>
                      {t.ctaLabel}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* "WHY THIS MATTERS" card removed per request */}
    </div>
  );
};

const tierRank: Record<"rookie" | "regular" | "inner", number> = { rookie: 0, regular: 1, inner: 2 };
const rewardTierLabel: Record<number, string> = { 0: "Rookie Fan", 1: "Matchday Regular", 2: "Inner Circle" };

const SponsorRewardsCardWithLocks = ({
  sponsor,
  isMobile,
  previewTier,
}: {
  sponsor: SponsorBenefit;
  isMobile: boolean;
  previewTier: "rookie" | "regular" | "inner";
}) => {
  const reduce = useReducedMotion();
  const tooltip = "Coming soon — Fan Club unlocks perks";
  const currentRank = tierRank[previewTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={!reduce ? { y: -4 } : undefined}
      style={{
        borderRadius: borderRadius.card, // 16px - football-first
        border: `1px solid ${sponsor.accent}40`, // Sponsor-branded border
        background: colors.surface.card, // Football-first card background
        backdropFilter: "blur(14px)",
        boxShadow: shadows.card, // Sports broadcast style
        overflow: "hidden",
        position: "relative",
        minWidth: 0,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 14% 18%, ${sponsor.accent}22 0%, transparent 58%), radial-gradient(circle at 88% 22%, ${sponsor.accent2}1C 0%, transparent 62%), linear-gradient(135deg, rgba(5,11,32,0.55) 0%, rgba(10,22,51,0.45) 45%, rgba(5,11,32,0.62) 100%)`,
          opacity: 0.95,
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(180deg, ${sponsor.accent}AA, ${sponsor.accent2}AA)`,
          opacity: 0.55,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: spacing.cardPadding, display: "flex", flexDirection: "column", gap: spacing.md }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                border: `1px solid rgba(255,255,255,0.12)`,
                background: "rgba(255,255,255,0.04)",
                display: "grid",
                placeItems: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={sponsor.logoSrc}
                alt={`${sponsor.name} logo`}
                loading="lazy"
                style={{ width: "92%", height: "92%", objectFit: "contain", filter: "grayscale(100%) brightness(1.35)" }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ ...typography.overline, color: sponsor.accent2, letterSpacing: "0.14em", marginBottom: 4 }}>{sponsor.roleLabel}</div>
              <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, lineHeight: 1.15 }}>{sponsor.name}</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>{sponsor.themeLabel}</div>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <IncentiveBadge tag={sponsor.incentiveTag} accent={sponsor.accent} />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: spacing.md,
            overflowX: "auto",
            paddingBottom: 6,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {sponsor.rewards.map((r, idx) => {
            const locked = idx > currentRank;
            const unlockAt = rewardTierLabel[idx] || "Higher tier";
            return (
              <div key={r} style={{ position: "relative" }}>
                <RewardTile text={r} accent={sponsor.accent} accent2={sponsor.accent2} />
                {locked ? (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                  borderRadius: borderRadius.card, // 16px - football-first
                  background: colors.surface.dark,
                  border: `1px solid ${sponsor.accent}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: spacing.cardPadding,
                  textAlign: "center",
                  boxShadow: shadows.card,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 14,
                          border: `1px solid ${sponsor.accent}33`,
                          background: `${sponsor.accent}14`,
                          display: "grid",
                          placeItems: "center",
                          boxShadow: `0 0 26px ${sponsor.glow}`,
                        }}
                      >
                        <LockMark />
                      </div>
                      <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.25 }}>
                        Locked
                      </div>
                      <div style={{ ...typography.caption, color: colors.text.muted }}>Unlocks at {unlockAt}</div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "space-between", gap: spacing.md, flexDirection: isMobile ? "column" : "row" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.14em" }}>{sponsor.incentiveCopy}</div>
            {sponsor.secondaryIncentiveCopy ? (
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, opacity: 0.92 }}>
                Also: {sponsor.secondaryIncentiveCopy}
              </div>
            ) : null}
            <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, opacity: 0.9 }}>Dynamic rewards (rolling soon)</div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <Button
              variant="primary"
              size="md"
              onClick={onJoinFanClub}
              style={{
                borderRadius: 999,
                padding: isMobile ? "12px 18px" : "12px 22px",
                background: `linear-gradient(135deg, ${sponsor.accent2} 0%, ${sponsor.accent} 100%)`,
                boxShadow: `0 8px 26px ${sponsor.glow}`,
                width: isMobile ? "100%" : "auto",
              }}
            >
              Join the Fan Club
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};



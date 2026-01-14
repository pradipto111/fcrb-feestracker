import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { useHomepageAnimation } from "../../hooks/useHomepageAnimation";
import { TrophyIcon, CheckIcon, LockIcon } from "../../components/icons/IconSet";
import { SPONSORS } from "../../data/sponsors";
import { useMarquee } from "../../hooks/useMarquee";

const FanBenefitsPage: React.FC = () => {
  const { headingVariants, cardVariants, viewportOnce } = useHomepageAnimation();
  const reduce = useReducedMotion();
  const [me, setMe] = useState<any>(null);
  const [rewards, setRewards] = useState<any[] | null>(null);
  const [coupons, setCoupons] = useState<any[] | null>(null);
  const [busyPoolId, setBusyPoolId] = useState<number | null>(null);
  const [toast, setToast] = useState<string>("");
  const [marqueePaused, setMarqueePaused] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [m, r, c] = await Promise.all([api.getFanMe().catch(() => null), api.getFanRewards().catch(() => []), api.getFanCoupons().catch(() => [])]);
      setMe(m);
      setRewards(r);
      setCoupons(c);
    };
    load();
  }, []);
  const flags = (me?.tier?.featureFlags || me?.profile?.tier?.featureFlags || {}) as Record<string, any>;

  const { sequenceRef, offsetPx } = useMarquee({ speedPxPerSec: 60, paused: marqueePaused, disabled: !!reduce });
  const sponsorSequence = useMemo(() => SPONSORS.concat(SPONSORS), []);

  const sponsorGroups = useMemo(() => {
    const map = new Map<string, { sponsor: any; rewards: any[] }>();
    (rewards || []).forEach((rw) => {
      const k = rw?.sponsor?.name || "Sponsor";
      if (!map.has(k)) map.set(k, { sponsor: rw?.sponsor, rewards: [] });
      map.get(k)!.rewards.push(rw);
    });
    return Array.from(map.values());
  }, [rewards]);

  const redeem = async (poolId: number) => {
    setBusyPoolId(poolId);
    setToast("");
    try {
      const res = await api.redeemFanCoupon(poolId);
      setToast(`Redeemed: ${res.codeUsed}`);
      const c = await api.getFanCoupons().catch(() => []);
      setCoupons(c);
    } catch (e: any) {
      setToast(e?.message || "Redeem failed");
    } finally {
      setBusyPoolId(null);
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
              backgroundImage: `url("/assets/DSC09918.JPG")`,
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
                "radial-gradient(1100px 680px at 18% 25%, rgba(0,224,255,0.20) 0%, transparent 55%), radial-gradient(900px 620px at 78% 70%, rgba(255,169,0,0.14) 0%, transparent 60%), linear-gradient(135deg, rgba(5,11,32,0.82) 0%, rgba(10,22,51,0.62) 50%, rgba(5,11,32,0.86) 100%)",
              opacity: 0.98,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ ...typography.overline, color: colors.primary.light, letterSpacing: "0.18em", marginBottom: 10 }}>SPONSORS</div>
            <h1 style={{ ...typography.h1, margin: 0, fontSize: "clamp(2.8rem, 4.2vw, 3.4rem)", lineHeight: 1.06, color: colors.text.primary }}>
              Offers & rewards
            </h1>
            <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.75, maxWidth: 860 }}>
              Redeem coupons, track campaign rewards, and unlock matchday specials—filtered by your tier.
            </p>

            {/* Sponsor marquee */}
            <div
              onMouseEnter={() => setMarqueePaused(true)}
              onMouseLeave={() => setMarqueePaused(false)}
              style={{
                marginTop: spacing.lg,
                borderRadius: borderRadius.xl,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.18)",
                overflow: "hidden",
                padding: "14px 0",
              }}
            >
              <div style={{ display: "flex", gap: 22, whiteSpace: "nowrap" }}>
                <div style={{ display: "flex", gap: 22, alignItems: "center", transform: `translateX(${-offsetPx}px)`, willChange: "transform", paddingLeft: 18 }}>
                  <div ref={sequenceRef} style={{ display: "flex", gap: 22, alignItems: "center" }}>
                    {sponsorSequence.map((s, idx) => (
                      <div key={`${s.id}-${idx}`} style={{ width: 170, height: 54, borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 14px" }}>
                        <img src={s.logoSrc} alt={`${s.name} logo`} style={{ width: "100%", height: "100%", objectFit: "contain", filter: "grayscale(100%) brightness(1.25)", opacity: 0.92 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {toast && (
          <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>
            {toast}
          </div>
        )}

        {flags.offers === false ? (
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Benefits locked for your tier</div>
            <div style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
              Offers and coupons are disabled for your tier via Admin feature flags. If this looks wrong, contact Admin to update your tier.
            </div>
          </Card>
        ) : (
        <>
        {/* Coupons */}
        <motion.div variants={cardVariants} initial="initial" animate="animate">
          <Card variant="default" padding="xl" style={{ borderRadius: 26, padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
              <div>
                <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>COUPONS</div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Redeem now</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              {(coupons || []).slice(0, 9).map((c) => {
                const redeemed = !!c.myRedemption;
                const disabled = redeemed || !c.hasAvailableCode || busyPoolId === c.id;
                return (
                  <motion.div key={c.id}>
                    <div style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg, minHeight: 170, display: "flex", flexDirection: "column", gap: spacing.sm }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{c.sponsor?.name || "Sponsor"}</div>
                      <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.25 }}>{c.name}</div>
                      <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.5 }}>{c.conditionsText}</div>

                      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...typography.caption, color: redeemed ? "#22C55E" : colors.text.muted }}>
                          {redeemed ? <CheckIcon size={14} color="#22C55E" /> : <LockIcon size={14} color={colors.text.muted} />}
                          {redeemed ? "Redeemed" : c.hasAvailableCode ? "Available" : "Unavailable"}
                        </div>
                        <Button variant="primary" size="sm" disabled={disabled} onClick={() => redeem(c.id)} style={{ borderRadius: 999, background: disabled ? undefined : colors.accent.main, color: disabled ? undefined : colors.text.onAccent }}>
                          {redeemed ? "Redeemed" : busyPoolId === c.id ? "Redeeming..." : "Redeem"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Rewards */}
        <motion.div variants={cardVariants} initial="initial" animate="animate">
          <Card variant="default" padding="xl" style={{ borderRadius: 26, padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
              <div>
                <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>REWARD CAMPAIGNS</div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Dynamic rewards (rolling soon)</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: colors.text.muted, ...typography.caption }}>
                <TrophyIcon size={16} color={colors.accent.main} />
                Sponsors • Win bonus • Matchday specials
              </div>
            </div>

            <div style={{ display: "grid", gap: spacing.lg }}>
              {sponsorGroups.map((g) => (
                <div key={g.sponsor?.id || g.sponsor?.name} style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{g.sponsor?.name || "Sponsor"}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>{g.sponsor?.description || "Partner rewards"}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md, marginTop: spacing.md }}>
                    {g.rewards.slice(0, 3).map((rw: any) => (
                      <div key={rw.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", padding: spacing.md }}>
                        <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{rw.title}</div>
                        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 10, lineHeight: 1.35 }}>{rw.copy}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
};

export default FanBenefitsPage;




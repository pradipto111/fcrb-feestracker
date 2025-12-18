import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Tooltip } from "../components/ui/Tooltip";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { getFanClubAnalyticsSnapshot } from "../analytics/fanclubAnalytics";
import { ChartBarIcon, InfoIcon, TrophyIcon, StarIcon } from "../components/icons/IconSet";

const MetricCard: React.FC<{
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  tooltip: string;
  icon?: React.ReactNode;
}> = ({ title, value, subtitle, tooltip, icon }) => {
  return (
    <Card
      variant="default"
      padding="lg"
      style={{
        borderRadius: borderRadius["2xl"],
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.03)",
        boxShadow: "0 18px 54px rgba(0,0,0,0.35)",
        position: "relative",
        overflow: "hidden",
        minHeight: 140,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 18% 18%, rgba(0,224,255,0.10) 0%, transparent 60%), radial-gradient(circle at 82% 18%, rgba(255,169,0,0.08) 0%, transparent 62%)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.md }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            {icon ? (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.16)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
            ) : null}
            <div style={{ ...typography.body, color: colors.text.secondary, fontWeight: typography.fontWeight.semibold, lineHeight: 1.2 }}>
              {title}
            </div>
          </div>

          <div style={{ ...typography.h2, color: colors.text.primary, margin: 0, lineHeight: 1.05 }}>{value}</div>
          {subtitle ? <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8, lineHeight: 1.4 }}>{subtitle}</div> : null}
        </div>

        <Tooltip content={tooltip} position="left">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              display: "grid",
              placeItems: "center",
              color: colors.text.muted,
              flexShrink: 0,
              cursor: "default",
            }}
          >
            <InfoIcon size={16} color={colors.text.muted} />
          </div>
        </Tooltip>
      </div>
    </Card>
  );
};

const FunnelRow: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => {
  const pct = max <= 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 70px", gap: spacing.md, alignItems: "center" }}>
      <div style={{ ...typography.body, color: colors.text.secondary }}>{label}</div>
      <div style={{ height: 12, borderRadius: 999, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, rgba(0,224,255,0.70), rgba(255,169,0,0.65))" }} />
      </div>
      <div style={{ ...typography.caption, color: colors.text.muted, textAlign: "right" }}>{value}</div>
    </div>
  );
};

const FanClubPartnerAnalyticsPage: React.FC = () => {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  // Lightweight refresh so the page updates as you interact with Fan Club UI (dev-friendly).
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1500);
    return () => window.clearInterval(id);
  }, []);

  const snapshot = useMemo(() => getFanClubAnalyticsSnapshot(), [tick]);

  const tierTotal = snapshot.tierDistribution.rookie + snapshot.tierDistribution.regular + snapshot.tierDistribution.inner;
  const tierPct = (n: number) => (tierTotal <= 0 ? 0 : Math.round((n / tierTotal) * 100));

  const funnelMax = Math.max(snapshot.funnel.visited, snapshot.funnel.viewedBenefits, snapshot.funnel.selectedTier, snapshot.funnel.joined);
  const topSponsor = snapshot.topSponsorByViews || "—";

  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{ padding: `${spacing.xl} ${spacing.xl}` }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.lg, flexWrap: "wrap", marginBottom: spacing.xl }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>
              REALVERSE ANALYTICS
            </div>
            <h1 style={{ ...typography.h1, margin: 0, color: colors.text.primary, lineHeight: 1.06 }}>
              Fan Club & Partner Analytics
            </h1>
            <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, maxWidth: "80ch", lineHeight: 1.7 }}>
              Read-only, UI-first analytics for Fan Club growth, engagement, and sponsor exposure. This is schema-ready and can be wired to backend events later.
            </p>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: colors.text.muted, ...typography.caption }}>
            <ChartBarIcon size={16} color={colors.text.muted} />
            Live from local events (dev)
          </div>
        </div>

        {/* KPI groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.xl }}>
          {/* 1) Fan Club Growth Metrics */}
          <div>
            <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>Fan Club Growth Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              <MetricCard
                title="Total Fan Club Members"
                value={snapshot.totalMembers}
                subtitle="UI-only (counts Join intent for now)"
                tooltip="Total members is currently measured as how many times users hit “Join the Fan Club” in the onboarding flow. This becomes true membership count when wired to payments."
                icon={<TrophyIcon size={18} color={colors.accent.main} />}
              />
              <MetricCard
                title="New Members (Weekly / Monthly)"
                value={
                  <span>
                    {snapshot.newMembers7d} / {snapshot.newMembers30d}
                  </span>
                }
                subtitle="Last 7 days / last 30 days"
                tooltip="New members are join-intent events in the last 7 and 30 days. This becomes payment-confirmed members later."
                icon={<StarIcon size={18} color={colors.primary.main} />}
              />
              <MetricCard
                title="Tier Distribution"
                value={
                  <span>
                    R {tierPct(snapshot.tierDistribution.rookie)}% • M {tierPct(snapshot.tierDistribution.regular)}% • I {tierPct(snapshot.tierDistribution.inner)}%
                  </span>
                }
                subtitle={`Rookie ${snapshot.tierDistribution.rookie} • Regular ${snapshot.tierDistribution.regular} • Inner ${snapshot.tierDistribution.inner}`}
                tooltip="Tier distribution shows which tiers users choose when joining (intent). This helps optimize recommended tier positioning and messaging."
                icon={<ChartBarIcon size={18} color={colors.text.primary} />}
              />
            </div>
            <div style={{ marginTop: spacing.md, ...typography.caption, color: colors.text.muted }}>
              Upgrade Rate: <strong style={{ color: colors.text.primary }}>{snapshot.upgradeRatePlaceholder}</strong> (UI placeholder)
            </div>
          </div>

          {/* 2) Engagement Metrics */}
          <div>
            <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>Engagement Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: spacing.md }}>
              <MetricCard
                title="Section Views (Fan Club)"
                value={snapshot.sectionViews}
                tooltip="Section Views count how often the Fan Club section enters the viewport."
                icon={<ChartBarIcon size={18} color={colors.text.primary} />}
              />
              <MetricCard
                title="Reward Card Hovers"
                value={snapshot.rewardHovers}
                tooltip="Reward hovers show how often fans explore sponsor benefits. High hovers indicate strong sponsor curiosity."
                icon={<TrophyIcon size={18} color={colors.accent.main} />}
              />
              <MetricCard
                title="CTA Hover Time"
                value={`${Math.round(snapshot.ctaHoverMs / 1000)}s`}
                subtitle="Total hover time (all fan CTAs)"
                tooltip="CTA Hover Time measures hesitation/interest before a click. Longer time can mean curiosity or confusion; optimize clarity accordingly."
                icon={<StarIcon size={18} color={colors.primary.main} />}
              />
              <MetricCard
                title="Scroll Depth"
                value={`${snapshot.maxScrollDepthPct}%`}
                subtitle="Max depth (Fan Club section)"
                tooltip="Scroll depth shows how far users get through the Fan Club section. Low depth suggests the top needs clearer value or tighter layout."
                icon={<ChartBarIcon size={18} color={colors.text.primary} />}
              />
            </div>
          </div>

          {/* 3) Sponsor Exposure Metrics */}
          <div>
            <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>Sponsor Exposure Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              <MetricCard
                title="Sponsor Card Views"
                value={Object.values(snapshot.sponsorCardViews).reduce((a, b) => a + b, 0)}
                tooltip="Sponsor Card Views count how often sponsor preview cards enter the viewport within the Fan Club unlocks step."
                icon={<ChartBarIcon size={18} color={colors.text.primary} />}
              />
              <MetricCard
                title="Top Performing Sponsor (views)"
                value={topSponsor}
                subtitle="Based on sponsor preview views"
                tooltip="Top performing sponsor is the one getting the most preview card views. This guides partner placement and creative updates."
                icon={<TrophyIcon size={18} color={colors.accent.main} />}
              />
              <MetricCard
                title="Contextual Incentive Visibility"
                value={Object.values(snapshot.incentiveVisibility).reduce((a, b) => a + b, 0)}
                subtitle="Win / Matchday / Training tags (views)"
                tooltip="This shows how often incentive tags appear in viewed sponsor previews. It helps sponsors understand what context drives attention."
                icon={<StarIcon size={18} color={colors.primary.main} />}
              />
            </div>
            <div style={{ marginTop: spacing.md, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              {Object.entries(snapshot.rewardImpressionsPerSponsor).slice(0, 3).map(([sponsorId, count]) => (
                <Card
                  key={sponsorId}
                  variant="default"
                  padding="md"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: borderRadius.xl }}
                >
                  <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>Reward impressions</div>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, marginTop: 6 }}>
                    {sponsorId}
                  </div>
                  <div style={{ ...typography.h3, color: colors.text.primary, marginTop: 6 }}>{count}</div>
                </Card>
              ))}
            </div>
          </div>

          {/* 4) Conversion Funnel (Visual Only) */}
          <div>
            <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>Conversion Funnel (Visual Only)</div>
            <Card
              variant="default"
              padding="lg"
              style={{
                borderRadius: borderRadius["2xl"],
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "grid", gap: spacing.md }}>
                <FunnelRow label="Visited Fan Club Section" value={snapshot.funnel.visited} max={funnelMax} />
                <FunnelRow label="Viewed Benefits" value={snapshot.funnel.viewedBenefits} max={funnelMax} />
                <FunnelRow label="Selected Tier" value={snapshot.funnel.selectedTier} max={funnelMax} />
                <FunnelRow label="Joined (future)" value={snapshot.funnel.joined} max={funnelMax} />
              </div>
              <div style={{ marginTop: spacing.md, ...typography.caption, color: colors.text.muted, lineHeight: 1.6 }}>
                “Joined” is currently measured as join intent. This becomes a payment-confirmed step when integrated with the existing payment flow.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FanClubPartnerAnalyticsPage;



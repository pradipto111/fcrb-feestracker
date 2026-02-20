import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

type Flags = { offers?: boolean; games?: boolean; matchday?: boolean; content?: boolean; programs?: boolean };

const flagKeys: Array<{ key: keyof Flags; label: string; note: string }> = [
  { key: "offers", label: "Offers / Coupons", note: "Benefits + redemption modules" },
  { key: "games", label: "Games & Quests", note: "Mini-games + quests in Fan UI" },
  { key: "matchday", label: "Matchday", note: "Weekly moments + fixture-linked messaging" },
  { key: "content", label: "Fan-only content", note: "Behind-the-scenes / gallery placeholders" },
  { key: "programs", label: "Programmes conversion", note: "Fan → coaching programme interest nudges" },
];

const AdminFanSettingsPage: React.FC = () => {
  const [tiers, setTiers] = useState<any[]>([]);
  const [toast, setToast] = useState("");

  const load = async () => {
    const t = await api.adminGetFanTiers().catch(() => []);
    setTiers(t || []);
  };

  useEffect(() => {
    load();
  }, []);

  const tierRows = useMemo(() => tiers.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)), [tiers]);

  const updateFlags = async (tierId: number, next: Flags) => {
    setToast("");
    await api.adminUpdateFanTier(tierId, { featureFlags: next });
    setToast("Feature flags updated.");
    await load();
  };

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        <div>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>REALVERSE • ADMIN</div>
          <h1 style={{ ...typography.h1, margin: 0 }}>Fan Club — Settings</h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
            Operational toggles for the Fan experience. These flags are tier-driven (admin-controlled) and power module visibility.
          </p>
        </div>

        {toast && <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>{toast}</div>}

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Feature flags by tier</div>
            <Button variant="secondary" size="md" onClick={load} style={{ borderRadius: 999 }}>
              Refresh
            </Button>
          </div>

          <div style={{ display: "grid", gap: spacing.md }}>
            {tierRows.map((t) => {
              const flags: Flags = t.featureFlags || {};
              return (
                <div key={t.id} style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                    <div>
                      <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{t.name}</div>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>These flags gate modules across `/realverse/fan/*`.</div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateFlags(t.id, flags)}
                      style={{ borderRadius: 999 }}
                      disabled
                    >
                      Saved
                    </Button>
                  </div>

                  <div style={{ marginTop: spacing.md, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: spacing.md }}>
                    {flagKeys.map((f) => (
                      <label
                        key={String(f.key)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          padding: spacing.md,
                          borderRadius: borderRadius.xl,
                          border: "1px solid rgba(255,255,255,0.10)",
                          background: "rgba(255,255,255,0.03)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{f.label}</div>
                          <input
                            type="checkbox"
                            checked={!!flags[f.key]}
                            onChange={(e) => {
                              const next = { ...flags, [f.key]: e.target.checked };
                              updateFlags(t.id, next);
                            }}
                          />
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.5 }}>{f.note}</div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Notes</div>
          <div style={{ ...typography.body, color: colors.text.secondary, lineHeight: 1.7 }}>
            Deeper settings like force-logout, invite links, and engagement instrumentation will be added once we persist client analytics events.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminFanSettingsPage;



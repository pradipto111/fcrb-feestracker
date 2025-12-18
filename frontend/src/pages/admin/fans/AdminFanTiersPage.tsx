import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

const safeJson = (v: string, fallback: any) => {
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
};

const AdminFanTiersPage: React.FC = () => {
  const [tiers, setTiers] = useState<any[]>([]);
  const [toast, setToast] = useState("");

  const [create, setCreate] = useState({
    name: "",
    monthlyPriceINR: "0",
    yearlyPriceINR: "0",
    sortOrder: "0",
    benefitsJson: JSON.stringify([{ title: "Benefit", note: "Short description" }], null, 2),
    featureFlags: JSON.stringify({ offers: true, games: true, matchday: true }, null, 2),
    isActive: true,
  });

  const load = async () => {
    const t = await api.adminGetFanTiers();
    setTiers(t || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createTier = async () => {
    setToast("");
    await api.adminCreateFanTier({
      name: create.name,
      monthlyPriceINR: Number(create.monthlyPriceINR || 0),
      yearlyPriceINR: Number(create.yearlyPriceINR || 0),
      sortOrder: Number(create.sortOrder || 0),
      benefitsJson: safeJson(create.benefitsJson, []),
      featureFlags: safeJson(create.featureFlags, {}),
      isActive: !!create.isActive,
    });
    setToast("Tier created.");
    setCreate((s) => ({ ...s, name: "" }));
    await load();
  };

  const updateTier = async (tierId: number, patch: any) => {
    await api.adminUpdateFanTier(tierId, patch);
    await load();
  };

  const tierRows = useMemo(() => tiers.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)), [tiers]);

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        <div>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>REALVERSE • ADMIN</div>
          <h1 style={{ ...typography.h1, margin: 0 }}>Fan Club — Tiers</h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
            Pricing + benefits matrix + module feature flags. Everything here drives the Fan dashboard.
          </p>
        </div>

        {toast && <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>{toast}</div>}

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Create tier</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: spacing.md }}>
            <Input label="Name" placeholder="Bronze / Silver / Gold / Elite" value={create.name} onChange={(e) => setCreate((s) => ({ ...s, name: e.target.value }))} fullWidth />
            <Input label="Monthly price (INR)" value={create.monthlyPriceINR} onChange={(e) => setCreate((s) => ({ ...s, monthlyPriceINR: e.target.value }))} fullWidth />
            <Input label="Yearly price (INR)" value={create.yearlyPriceINR} onChange={(e) => setCreate((s) => ({ ...s, yearlyPriceINR: e.target.value }))} fullWidth />
            <Input label="Sort order" value={create.sortOrder} onChange={(e) => setCreate((s) => ({ ...s, sortOrder: e.target.value }))} fullWidth />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md, marginTop: spacing.md }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Benefits JSON</div>
              <textarea value={create.benefitsJson} onChange={(e) => setCreate((s) => ({ ...s, benefitsJson: e.target.value }))} style={{ width: "100%", minHeight: 160, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary, padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Feature flags JSON</div>
              <textarea value={create.featureFlags} onChange={(e) => setCreate((s) => ({ ...s, featureFlags: e.target.value }))} style={{ width: "100%", minHeight: 160, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary, padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }} />
            </div>
          </div>
          <div style={{ marginTop: spacing.lg, display: "flex", gap: spacing.sm }}>
            <Button variant="primary" size="md" onClick={createTier} disabled={!create.name} style={{ borderRadius: 999 }}>
              Create tier →
            </Button>
          </div>
        </Card>

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Existing tiers</div>
            <Button variant="secondary" size="md" onClick={load} style={{ borderRadius: 999 }}>
              Refresh
            </Button>
          </div>

          <div style={{ display: "grid", gap: spacing.md }}>
            {tierRows.map((t) => (
              <div key={t.id} style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: spacing.md, alignItems: "baseline" }}>
                  <div>
                    <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{t.name}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>
                      Monthly ₹{t.monthlyPriceINR} • Yearly ₹{t.yearlyPriceINR} • Sort {t.sortOrder} • {t.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button variant="secondary" size="sm" onClick={() => updateTier(t.id, { isActive: !t.isActive })} style={{ borderRadius: 999 }}>
                      {t.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminFanTiersPage;




import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

const AdminFanRewardsPage: React.FC = () => {
  const [toast, setToast] = useState("");
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);

  const load = async () => {
    const [s, c, p, t] = await Promise.all([
      api.adminGetFanSponsors().catch(() => []),
      api.adminGetFanCampaigns().catch(() => []),
      api.adminGetFanCouponPools().catch(() => []),
      api.adminGetFanTiers().catch(() => []),
    ]);
    setSponsors(s || []);
    setCampaigns(c || []);
    setPools(p || []);
    setTiers(t || []);
  };

  useEffect(() => {
    load();
  }, []);

  const tierOptions = useMemo(() => tiers.map((t) => ({ id: t.id, name: t.name })), [tiers]);

  const [newSponsor, setNewSponsor] = useState({
    name: "",
    logoAssetKey: "",
    brandPrimary: "#0EA5E9",
    brandSecondary: "#F59E0B",
    description: "",
    isActive: true,
  });

  const [newCampaign, setNewCampaign] = useState({
    sponsorId: "",
    title: "",
    type: "DYNAMIC_ROLLING",
    copy: "",
    priority: "1",
    tierEligibility: [] as number[],
    isActive: true,
  });

  const [newPool, setNewPool] = useState({
    sponsorId: "",
    name: "",
    codeType: "MULTI_USE" as "MULTI_USE" | "SINGLE_USE",
    multiUseCode: "",
    discountType: "PERCENT" as "PERCENT" | "FLAT" | "FREEBIE",
    discountValue: "10",
    conditionsText: "",
    tierEligibility: [] as number[],
    maxRedemptions: "100",
    expiresAt: "",
    codesText: "",
    isActive: true,
  });

  const createSponsor = async () => {
    setToast("");
    await api.adminCreateFanSponsor({ ...newSponsor, isActive: !!newSponsor.isActive });
    setToast("Sponsor created.");
    setNewSponsor({ name: "", logoAssetKey: "", brandPrimary: "#0EA5E9", brandSecondary: "#F59E0B", description: "", isActive: true });
    await load();
  };

  const createCampaign = async () => {
    setToast("");
    await api.adminCreateFanCampaign({
      sponsorId: Number(newCampaign.sponsorId),
      title: newCampaign.title,
      type: newCampaign.type,
      copy: newCampaign.copy,
      priority: Number(newCampaign.priority || 0),
      tierEligibility: newCampaign.tierEligibility,
      isActive: !!newCampaign.isActive,
      validFrom: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      validTo: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    });
    setToast("Campaign created.");
    setNewCampaign({ sponsorId: "", title: "", type: "DYNAMIC_ROLLING", copy: "", priority: "1", tierEligibility: [], isActive: true });
    await load();
  };

  const createPool = async () => {
    setToast("");
    const codes =
      newPool.codeType === "SINGLE_USE"
        ? newPool.codesText
            .split(/\r?\n/)
            .map((x) => x.trim())
            .filter(Boolean)
        : [];
    await api.adminCreateFanCouponPool({
      sponsorId: Number(newPool.sponsorId),
      name: newPool.name,
      codeType: newPool.codeType,
      multiUseCode: newPool.codeType === "MULTI_USE" ? newPool.multiUseCode : null,
      discountType: newPool.discountType,
      discountValue: Number(newPool.discountValue || 0),
      conditionsText: newPool.conditionsText,
      tierEligibility: newPool.tierEligibility,
      maxRedemptions: Number(newPool.maxRedemptions || 0),
      expiresAt: newPool.expiresAt ? new Date(newPool.expiresAt).toISOString() : null,
      isActive: !!newPool.isActive,
      codes,
    });
    setToast("Coupon pool created.");
    setNewPool({
      sponsorId: "",
      name: "",
      codeType: "MULTI_USE",
      multiUseCode: "",
      discountType: "PERCENT",
      discountValue: "10",
      conditionsText: "",
      tierEligibility: [],
      maxRedemptions: "100",
      expiresAt: "",
      codesText: "",
      isActive: true,
    });
    await load();
  };

  const toggleTier = (tierId: number, checked: boolean) => {
    setNewCampaign((s) => ({
      ...s,
      tierEligibility: checked ? [...s.tierEligibility, tierId] : s.tierEligibility.filter((x) => x !== tierId),
    }));
  };
  const toggleTierPool = (tierId: number, checked: boolean) => {
    setNewPool((s) => ({
      ...s,
      tierEligibility: checked ? [...s.tierEligibility, tierId] : s.tierEligibility.filter((x) => x !== tierId),
    }));
  };

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        <div>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>REALVERSE • ADMIN</div>
          <h1 style={{ ...typography.h1, margin: 0 }}>Fan Club — Rewards</h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
            Sponsors, campaigns, and coupon pools. This powers the Fan Benefits page.
          </p>
        </div>

        {toast && <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>{toast}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: spacing.lg }}>
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Sponsors</div>
              <Button variant="secondary" size="md" onClick={load} style={{ borderRadius: 999 }}>
                Refresh
              </Button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              <Input label="Name" value={newSponsor.name} onChange={(e) => setNewSponsor((s) => ({ ...s, name: e.target.value }))} fullWidth />
              <Input label="Logo asset key" placeholder="notch / sparsh / ..." value={newSponsor.logoAssetKey} onChange={(e) => setNewSponsor((s) => ({ ...s, logoAssetKey: e.target.value }))} fullWidth />
              <Input label="Description" value={newSponsor.description} onChange={(e) => setNewSponsor((s) => ({ ...s, description: e.target.value }))} fullWidth />
              <Input label="Brand primary" value={newSponsor.brandPrimary} onChange={(e) => setNewSponsor((s) => ({ ...s, brandPrimary: e.target.value }))} fullWidth />
              <Input label="Brand secondary" value={newSponsor.brandSecondary} onChange={(e) => setNewSponsor((s) => ({ ...s, brandSecondary: e.target.value }))} fullWidth />
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <Button variant="primary" size="md" onClick={createSponsor} disabled={!newSponsor.name || !newSponsor.logoAssetKey} style={{ borderRadius: 999 }}>
                  Add sponsor →
                </Button>
              </div>
            </div>
            <div style={{ marginTop: spacing.lg, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              {sponsors.map((s) => (
                <div key={s.id} style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>{s.name}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>{s.description}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 10 }}>logoAssetKey: {s.logoAssetKey}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Reward campaigns</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Sponsor</div>
                <select value={newCampaign.sponsorId} onChange={(e) => setNewCampaign((s) => ({ ...s, sponsorId: e.target.value }))} style={{ padding: "12px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>
                  <option value="">Select sponsor</option>
                  {sponsors.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Title" value={newCampaign.title} onChange={(e) => setNewCampaign((s) => ({ ...s, title: e.target.value }))} fullWidth />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Type</div>
                <select value={newCampaign.type} onChange={(e) => setNewCampaign((s) => ({ ...s, type: e.target.value }))} style={{ padding: "12px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>
                  <option value="STATIC">STATIC</option>
                  <option value="DYNAMIC_ROLLING">DYNAMIC_ROLLING</option>
                </select>
              </div>
              <Input label="Copy" value={newCampaign.copy} onChange={(e) => setNewCampaign((s) => ({ ...s, copy: e.target.value }))} fullWidth />
              <Input label="Priority" value={newCampaign.priority} onChange={(e) => setNewCampaign((s) => ({ ...s, priority: e.target.value }))} fullWidth />
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <Button variant="primary" size="md" onClick={createCampaign} disabled={!newCampaign.sponsorId || !newCampaign.title || !newCampaign.copy} style={{ borderRadius: 999 }}>
                  Add campaign →
                </Button>
              </div>
            </div>
            <div style={{ marginTop: spacing.md, padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.14)" }}>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: 8 }}>Tier eligibility</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {tierOptions.map((t) => (
                  <label key={t.id} style={{ display: "inline-flex", gap: 8, alignItems: "center", color: colors.text.secondary, ...typography.caption }}>
                    <input type="checkbox" checked={newCampaign.tierEligibility.includes(t.id)} onChange={(e) => toggleTier(t.id, e.target.checked)} />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginTop: spacing.lg, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              {campaigns.slice(0, 9).map((c) => (
                <div key={c.id} style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{c.sponsor?.name}</div>
                  <div style={{ ...typography.h4, color: colors.text.primary, marginTop: 6 }}>{c.title}</div>
                  <div style={{ ...typography.caption, color: colors.text.secondary, marginTop: 8, lineHeight: 1.6 }}>{c.copy}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Coupon pools</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Sponsor</div>
                <select value={newPool.sponsorId} onChange={(e) => setNewPool((s) => ({ ...s, sponsorId: e.target.value }))} style={{ padding: "12px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>
                  <option value="">Select sponsor</option>
                  {sponsors.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Pool name" value={newPool.name} onChange={(e) => setNewPool((s) => ({ ...s, name: e.target.value }))} fullWidth />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Code type</div>
                <select value={newPool.codeType} onChange={(e) => setNewPool((s) => ({ ...s, codeType: e.target.value as any }))} style={{ padding: "12px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>
                  <option value="MULTI_USE">MULTI_USE</option>
                  <option value="SINGLE_USE">SINGLE_USE</option>
                </select>
              </div>
              <Input label="Multi-use code" disabled={newPool.codeType !== "MULTI_USE"} value={newPool.multiUseCode} onChange={(e) => setNewPool((s) => ({ ...s, multiUseCode: e.target.value }))} fullWidth />
              <Input label="Conditions text" value={newPool.conditionsText} onChange={(e) => setNewPool((s) => ({ ...s, conditionsText: e.target.value }))} fullWidth />
              <Input label="Expires at (YYYY-MM-DD)" value={newPool.expiresAt} onChange={(e) => setNewPool((s) => ({ ...s, expiresAt: e.target.value }))} fullWidth />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Discount type</div>
                <select value={newPool.discountType} onChange={(e) => setNewPool((s) => ({ ...s, discountType: e.target.value as any }))} style={{ padding: "12px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>
                  <option value="PERCENT">PERCENT</option>
                  <option value="FLAT">FLAT</option>
                  <option value="FREEBIE">FREEBIE</option>
                </select>
              </div>
              <Input label="Discount value" value={newPool.discountValue} onChange={(e) => setNewPool((s) => ({ ...s, discountValue: e.target.value }))} fullWidth />
              <Input label="Max redemptions" value={newPool.maxRedemptions} onChange={(e) => setNewPool((s) => ({ ...s, maxRedemptions: e.target.value }))} fullWidth />
            </div>
            {newPool.codeType === "SINGLE_USE" && (
              <div style={{ marginTop: spacing.md }}>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: 8 }}>Bulk codes (one per line)</div>
                <textarea value={newPool.codesText} onChange={(e) => setNewPool((s) => ({ ...s, codesText: e.target.value }))} style={{ width: "100%", minHeight: 120, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary, padding: 12, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }} />
              </div>
            )}
            <div style={{ marginTop: spacing.md, padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.14)" }}>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: 8 }}>Tier eligibility</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {tierOptions.map((t) => (
                  <label key={t.id} style={{ display: "inline-flex", gap: 8, alignItems: "center", color: colors.text.secondary, ...typography.caption }}>
                    <input type="checkbox" checked={newPool.tierEligibility.includes(t.id)} onChange={(e) => toggleTierPool(t.id, e.target.checked)} />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginTop: spacing.lg }}>
              <Button variant="primary" size="md" onClick={createPool} disabled={!newPool.sponsorId || !newPool.name || !newPool.conditionsText} style={{ borderRadius: 999 }}>
                Add coupon pool →
              </Button>
            </div>

            <div style={{ marginTop: spacing.lg, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
              {pools.slice(0, 9).map((p) => (
                <div key={p.id} style={{ borderRadius: borderRadius["2xl"], border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                  <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{p.sponsor?.name}</div>
                  <div style={{ ...typography.h4, color: colors.text.primary, marginTop: 6 }}>{p.name}</div>
                  <div style={{ ...typography.caption, color: colors.text.secondary, marginTop: 8, lineHeight: 1.6 }}>{p.conditionsText}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 10 }}>
                    {p.codeType} • {p.discountType} {p.discountValue}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminFanRewardsPage;




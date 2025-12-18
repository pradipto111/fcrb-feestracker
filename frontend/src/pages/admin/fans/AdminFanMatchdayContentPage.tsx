import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

const AdminFanMatchdayContentPage: React.FC = () => {
  const [toast, setToast] = useState("");
  const [moments, setMoments] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);

  const [newMoment, setNewMoment] = useState({
    title: "",
    category: "HIGHLIGHT",
    thumbnailUrl: "",
    mediaUrl: "",
    isFeatured: true,
    isLocked: false,
  });

  const [newRule, setNewRule] = useState({
    key: "WIN_BONUS",
    title: "Win Bonus",
    description: "Extra perks if FCRB wins this week",
    isActive: false,
  });

  const load = async () => {
    const [m, r] = await Promise.all([api.adminGetFanMatchdayMoments().catch(() => []), api.adminGetDynamicRewardRules().catch(() => [])]);
    setMoments(m || []);
    setRules(r || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createMoment = async () => {
    setToast("");
    await api.adminCreateFanMatchdayMoment({
      title: newMoment.title,
      category: newMoment.category,
      thumbnailUrl: newMoment.thumbnailUrl || null,
      mediaUrl: newMoment.mediaUrl || null,
      isFeatured: !!newMoment.isFeatured,
      isLocked: !!newMoment.isLocked,
    });
    setToast("Matchday moment created.");
    setNewMoment({ title: "", category: "HIGHLIGHT", thumbnailUrl: "", mediaUrl: "", isFeatured: true, isLocked: false });
    await load();
  };

  const createRule = async () => {
    setToast("");
    await api.adminCreateDynamicRewardRule({
      key: newRule.key,
      title: newRule.title,
      description: newRule.description,
      isActive: !!newRule.isActive,
      rulesJson: {},
    });
    setToast("Dynamic reward rule created.");
    await load();
  };

  const toggleRule = async (ruleId: number, isActive: boolean) => {
    setToast("");
    await api.adminUpdateDynamicRewardRule(ruleId, { isActive });
    setToast("Rule updated.");
    await load();
  };

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        <div>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>REALVERSE • ADMIN</div>
          <h1 style={{ ...typography.h1, margin: 0 }}>Fan Club — Matchday Content</h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
            Upload matchday moments and toggle dynamic reward windows. (Rules engine is intentionally minimal for now.)
          </p>
        </div>

        {toast && <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>{toast}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.lg, alignItems: "start" }}>
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Matchday moments</div>
              <Button variant="secondary" size="md" onClick={load} style={{ borderRadius: 999 }}>
                Refresh
              </Button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: spacing.md }}>
              <Input label="Title" value={newMoment.title} onChange={(e) => setNewMoment((s) => ({ ...s, title: e.target.value }))} fullWidth />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ ...typography.caption, color: colors.text.muted }}>Category</div>
                <select
                  value={newMoment.category}
                  onChange={(e) => setNewMoment((s) => ({ ...s, category: e.target.value }))}
                  style={{ padding: "12px 12px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}
                >
                  {["GOAL", "HIGHLIGHT", "POTW", "BTS"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Thumbnail URL (optional)" value={newMoment.thumbnailUrl} onChange={(e) => setNewMoment((s) => ({ ...s, thumbnailUrl: e.target.value }))} fullWidth />
              <Input label="Media URL (optional)" value={newMoment.mediaUrl} onChange={(e) => setNewMoment((s) => ({ ...s, mediaUrl: e.target.value }))} fullWidth />
            </div>

            <div style={{ display: "flex", gap: spacing.md, alignItems: "center", marginTop: spacing.md, flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.text.secondary, ...typography.body }}>
                <input type="checkbox" checked={!!newMoment.isFeatured} onChange={(e) => setNewMoment((s) => ({ ...s, isFeatured: e.target.checked }))} /> Featured
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.text.secondary, ...typography.body }}>
                <input type="checkbox" checked={!!newMoment.isLocked} onChange={(e) => setNewMoment((s) => ({ ...s, isLocked: e.target.checked }))} /> Locked
              </label>
              <Button variant="primary" size="md" onClick={createMoment} disabled={!newMoment.title} style={{ borderRadius: 999, marginLeft: "auto" }}>
                Add moment →
              </Button>
            </div>

            <div style={{ marginTop: spacing.lg, display: "grid", gap: spacing.sm }}>
              {moments.slice(0, 12).map((m) => (
                <div key={m.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: "12px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md }}>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{m.title}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>{m.category}</div>
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>
                    {m.isFeatured ? "Featured" : "—"} • {m.isLocked ? "Locked" : "Unlocked"}
                  </div>
                </div>
              ))}
              {moments.length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No moments yet.</div>}
            </div>
          </Card>

          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Dynamic reward rules</div>
            <div style={{ display: "grid", gap: spacing.md }}>
              <Input label="Key" value={newRule.key} onChange={(e) => setNewRule((s) => ({ ...s, key: e.target.value }))} fullWidth />
              <Input label="Title" value={newRule.title} onChange={(e) => setNewRule((s) => ({ ...s, title: e.target.value }))} fullWidth />
              <Input label="Description" value={newRule.description} onChange={(e) => setNewRule((s) => ({ ...s, description: e.target.value }))} fullWidth />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, color: colors.text.secondary, ...typography.body }}>
                <input type="checkbox" checked={!!newRule.isActive} onChange={(e) => setNewRule((s) => ({ ...s, isActive: e.target.checked }))} /> Active
              </label>
              <Button variant="primary" size="md" onClick={createRule} disabled={!newRule.key || !newRule.title} style={{ borderRadius: 999 }}>
                Create rule →
              </Button>
            </div>

            <div style={{ marginTop: spacing.lg, display: "grid", gap: spacing.sm }}>
              {rules.map((r) => (
                <div key={r.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: "12px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md, alignItems: "baseline" }}>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{r.title}</div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>{r.key}</div>
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>{r.description}</div>
                  <div style={{ marginTop: 10 }}>
                    <Button variant="secondary" size="sm" onClick={() => toggleRule(r.id, !r.isActive)} style={{ borderRadius: 999 }}>
                      {r.isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              ))}
              {rules.length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No rules yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminFanMatchdayContentPage;



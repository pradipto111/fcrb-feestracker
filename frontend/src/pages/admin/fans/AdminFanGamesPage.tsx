import React, { useEffect, useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

const AdminFanGamesPage: React.FC = () => {
  const [toast, setToast] = useState("");
  const [quests, setQuests] = useState<any[]>([]);

  const [create, setCreate] = useState({
    title: "",
    description: "",
    pointsReward: "10",
    badgeReward: "",
    unlockRule: "matchday",
    isActive: true,
  });

  const load = async () => {
    const q = await api.adminGetFanQuests().catch(() => []);
    setQuests(q || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createQuest = async () => {
    setToast("");
    await api.adminCreateFanQuest({
      title: create.title,
      description: create.description,
      pointsReward: Number(create.pointsReward || 0),
      badgeReward: create.badgeReward || null,
      unlockRule: create.unlockRule || null,
      tierEligibility: [], // start open; tier-gating can be added later
      isActive: !!create.isActive,
    });
    setToast("Quest created.");
    setCreate({ title: "", description: "", pointsReward: "10", badgeReward: "", unlockRule: "matchday", isActive: true });
    await load();
  };

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        <div>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>REALVERSE • ADMIN</div>
          <h1 style={{ ...typography.h1, margin: 0 }}>Fan Club — Games & Quests</h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
            Admin-driven quests + mini games scaffolding. Fan game sessions are recorded via Fan UI.
          </p>
        </div>

        {toast && <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>{toast}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.lg }}>
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Create quest</div>
            <div style={{ display: "grid", gap: spacing.md }}>
              <Input label="Title" value={create.title} onChange={(e) => setCreate((s) => ({ ...s, title: e.target.value }))} fullWidth />
              <Input label="Description" value={create.description} onChange={(e) => setCreate((s) => ({ ...s, description: e.target.value }))} fullWidth />
              <Input label="Points reward" value={create.pointsReward} onChange={(e) => setCreate((s) => ({ ...s, pointsReward: e.target.value }))} fullWidth />
              <Input label="Badge reward (optional)" value={create.badgeReward} onChange={(e) => setCreate((s) => ({ ...s, badgeReward: e.target.value }))} fullWidth />
              <Input label="Unlock rule (matchday/win-bonus/rolling soon)" value={create.unlockRule} onChange={(e) => setCreate((s) => ({ ...s, unlockRule: e.target.value }))} fullWidth />
              <Button variant="primary" size="md" onClick={createQuest} disabled={!create.title || !create.description} style={{ borderRadius: 999 }}>
                Create quest →
              </Button>
            </div>
          </Card>

          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Active quests</div>
              <Button variant="secondary" size="md" onClick={load} style={{ borderRadius: 999 }}>
                Refresh
              </Button>
            </div>
            <div style={{ display: "grid", gap: spacing.sm }}>
              {quests.slice(0, 12).map((q) => (
                <div key={q.id} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: "12px 12px" }}>
                  <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{q.title}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6, lineHeight: 1.5 }}>{q.description}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>
                    Reward: {q.pointsReward} pts {q.badgeReward ? `• Badge: ${q.badgeReward}` : ""} • {q.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
              ))}
              {quests.length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No quests yet.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminFanGamesPage;




import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

const AdminFansPage: React.FC = () => {
  const [fans, setFans] = useState<any[]>([]);
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string>("");
  const [busyFanId, setBusyFanId] = useState<number | null>(null);
  const [badgeDraft, setBadgeDraft] = useState<Record<number, string>>({});

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    centerPreference: "",
    tierId: "",
    password: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [f, t] = await Promise.all([api.adminGetFans(), api.adminGetFanTiers()]);
      setFans(f || []);
      setTiers(t || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tierOptions = useMemo(() => [{ id: "", name: "Unassigned" }, ...tiers], [tiers]);

  const createFan = async () => {
    setToast("");
    const payload: any = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      city: form.city || undefined,
      centerPreference: form.centerPreference || undefined,
      tierId: form.tierId ? Number(form.tierId) : null,
      password: form.password || undefined,
    };
    const res = await api.adminCreateFan(payload);
    setToast(`Created Fan Club login for ${payload.email}. Temp password: ${res.tempPassword}`);
    setForm({ fullName: "", email: "", phone: "", city: "", centerPreference: "", tierId: "", password: "" });
    await load();
  };

  const toggleStatus = async (fanUserId: number, current: string) => {
    const next = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await api.adminUpdateFanStatus(fanUserId, next);
    await load();
  };

  const assignTier = async (fanUserId: number, tierId: string) => {
    await api.adminAssignFanTier(fanUserId, tierId ? Number(tierId) : null);
    await load();
  };

  const resetPassword = async (fanUserId: number) => {
    const res = await api.adminResetFanPassword(fanUserId);
    setToast(`Password reset for fanUserId=${fanUserId}. Temp password: ${res.tempPassword}`);
  };

  const adjustPoints = async (fanUserId: number, delta: number, reason: string) => {
    setToast("");
    setBusyFanId(fanUserId);
    try {
      await api.adminAdjustFanPoints(fanUserId, { delta, reason });
      setToast(`Adjusted points (${delta}) for fanUserId=${fanUserId}.`);
      await load();
    } catch (e: any) {
      setToast(e?.message || "Failed to adjust points");
    } finally {
      setBusyFanId(null);
    }
  };

  const assignBadge = async (fanUserId: number) => {
    const badgeKey = (badgeDraft[fanUserId] || "").trim();
    if (!badgeKey) return;
    setToast("");
    setBusyFanId(fanUserId);
    try {
      await api.adminAssignFanBadge(fanUserId, { badgeKey, badgeName: badgeKey, source: "ADMIN_ASSIGN" });
      setToast(`Assigned badge "${badgeKey}" to fanUserId=${fanUserId}.`);
      setBadgeDraft((s) => ({ ...s, [fanUserId]: "" }));
      await load();
    } catch (e: any) {
      setToast(e?.message || "Failed to assign badge");
    } finally {
      setBusyFanId(null);
    }
  };

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        <div>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>REALVERSE • ADMIN</div>
          <h1 style={{ ...typography.h1, margin: 0 }}>Fan Club — Accounts</h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
            Admin-controlled Fan Club credentials. Fans cannot self-escalate.
          </p>
        </div>

        {toast && (
          <div style={{ padding: spacing.md, borderRadius: 14, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.18)", color: colors.text.primary }}>
            {toast}
          </div>
        )}

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Create Fan Club account</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: spacing.md }}>
            <Input label="Full name" placeholder="Fan name" value={form.fullName} onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))} fullWidth />
            <Input label="Email" placeholder="fan@example.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} fullWidth />
            <Input label="Phone" placeholder="Optional" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} fullWidth />
            <Input label="City" placeholder="Optional" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} fullWidth />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Center preference</div>
              <select
                value={form.centerPreference}
                onChange={(e) => setForm((s) => ({ ...s, centerPreference: e.target.value }))}
                style={{
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: colors.text.primary,
                  outline: "none",
                }}
              >
                <option value="">Not set</option>
                <option value="THREELOK">3lok</option>
                <option value="DEPOT18">Depot18</option>
                <option value="BLITZZ">Blitzz</option>
                <option value="TRONIC">Tronic</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ ...typography.caption, color: colors.text.muted }}>Tier</div>
              <select
                value={form.tierId}
                onChange={(e) => setForm((s) => ({ ...s, tierId: e.target.value }))}
                style={{
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: colors.text.primary,
                  outline: "none",
                }}
              >
                {tierOptions.map((t: any) => (
                  <option key={String(t.id)} value={String(t.id)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <Input label="Temp password (optional)" placeholder="Leave empty to auto-generate" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} fullWidth />
          </div>
          <div style={{ marginTop: spacing.lg }}>
            <Button variant="primary" size="md" onClick={createFan} disabled={!form.fullName || !form.email} style={{ borderRadius: 999 }}>
              Create Fan Club login →
            </Button>
          </div>
        </Card>

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
            <div>
              <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Fan Club members</div>
              <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 8 }}>Showing up to 200 (dev)</div>
            </div>
            <Button variant="secondary" size="md" onClick={load} style={{ borderRadius: 999 }}>
              Refresh
            </Button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                  {["Name", "Email", "Tier", "Points", "Streak", "Onboarding", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: colors.text.muted, ...typography.caption, letterSpacing: "0.12em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(fans || []).map((f) => {
                  const tierName = f?.profile?.tier?.name || "Unassigned";
                  const status = f?.status || "ACTIVE";
                  const points = f?.profile?.points ?? 0;
                  const streak = f?.profile?.streakDays ?? 0;
                  const onboarded = !!f?.profile?.onboarding || !!f?.profile?.onboardingId;
                  return (
                    <tr key={f.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "10px 12px", color: colors.text.primary, ...typography.body, fontWeight: typography.fontWeight.semibold }}>
                        {f?.profile?.fullName || "—"}
                      </td>
                      <td style={{ padding: "10px 12px", color: colors.text.secondary, ...typography.body }}>{f.email}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <select
                          value={String(f?.profile?.tierId || "")}
                          onChange={(e) => assignTier(f.id, e.target.value)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(0,0,0,0.18)",
                            color: colors.text.primary,
                            outline: "none",
                          }}
                        >
                          {tierOptions.map((t: any) => (
                            <option key={String(t.id)} value={String(t.id)}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 6 }}>{tierName}</div>
                      </td>
                      <td style={{ padding: "10px 12px", color: colors.text.primary, ...typography.body, fontWeight: typography.fontWeight.semibold }}>{points}</td>
                      <td style={{ padding: "10px 12px", color: colors.text.primary, ...typography.body, fontWeight: typography.fontWeight.semibold }}>{streak}</td>
                      <td style={{ padding: "10px 12px", color: onboarded ? "#22C55E" : colors.text.muted, ...typography.body, fontWeight: typography.fontWeight.semibold }}>
                        {onboarded ? "Done" : "Pending"}
                      </td>
                      <td style={{ padding: "10px 12px", color: status === "ACTIVE" ? "#22C55E" : colors.danger.main, ...typography.body, fontWeight: typography.fontWeight.semibold }}>
                        {status}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Button variant="secondary" size="sm" onClick={() => toggleStatus(f.id, status)} style={{ borderRadius: 999 }}>
                            {status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => resetPassword(f.id)} style={{ borderRadius: 999 }}>
                            Reset password
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={busyFanId === f.id}
                            onClick={() => adjustPoints(f.id, 50, "Admin bonus")}
                            style={{ borderRadius: 999 }}
                          >
                            +50 XP
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={busyFanId === f.id}
                            onClick={() => adjustPoints(f.id, -25, "Admin correction")}
                            style={{ borderRadius: 999 }}
                          >
                            -25 XP
                          </Button>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              value={badgeDraft[f.id] || ""}
                              onChange={(e) => setBadgeDraft((s) => ({ ...s, [f.id]: e.target.value }))}
                              placeholder="Badge key (e.g. LOYAL_FAN)"
                              style={{
                                padding: "8px 10px",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.12)",
                                background: "rgba(0,0,0,0.18)",
                                color: colors.text.primary,
                                outline: "none",
                                width: 220,
                              }}
                            />
                            <Button variant="secondary" size="sm" disabled={busyFanId === f.id || !(badgeDraft[f.id] || "").trim()} onClick={() => assignBadge(f.id)} style={{ borderRadius: 999 }}>
                              Assign
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {loading && <div style={{ marginTop: spacing.md, ...typography.caption, color: colors.text.muted }}>Loading…</div>}
        </Card>
      </div>
    </div>
  );
};

export default AdminFansPage;




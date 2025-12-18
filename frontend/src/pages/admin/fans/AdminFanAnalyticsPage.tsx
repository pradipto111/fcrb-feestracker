import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../../../theme/design-tokens";

function toCsv(rows: any[], headers: Array<{ key: string; label: string }>) {
  const esc = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = headers.map((h) => esc(h.label)).join(",");
  const body = rows
    .map((r) => headers.map((h) => esc(h.key.split(".").reduce((acc: any, k) => (acc ? acc[k] : undefined), r))).join(","))
    .join("\n");
  return `${head}\n${body}\n`;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const AdminFanAnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, r, l] = await Promise.all([
        api.adminGetFanAnalyticsSummary().catch(() => null),
        api.adminGetFanRedemptions().catch(() => []),
        api.adminGetFanLeads().catch(() => []),
      ]);
      setSummary(s);
      setRedemptions(r || []);
      setLeads(l || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tierRows = useMemo(() => {
    const dist = summary?.tierDistribution || {};
    return Object.keys(dist).map((k) => ({ name: k, value: dist[k] }));
  }, [summary]);

  const sponsorRows = useMemo(() => {
    const dist = summary?.redemptionsBySponsor || {};
    return Object.keys(dist).map((k) => ({ name: k, value: dist[k] })).sort((a, b) => b.value - a.value);
  }, [summary]);

  const programRows = useMemo(() => {
    const dist = summary?.programInterestCounts || {};
    return Object.keys(dist).map((k) => ({ name: k, value: dist[k] })).sort((a, b) => b.value - a.value);
  }, [summary]);

  return (
    <div style={{ padding: `${spacing.xl} ${spacing.xl}` }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: spacing.xl }}>
        <div>
          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.sm }}>REALVERSE • ADMIN</div>
          <h1 style={{ ...typography.h1, margin: 0 }}>Fan Club — Analytics</h1>
          <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 1.7 }}>
            KPI story: growth → engagement → sponsor value → conversion. Read-only for now.
          </p>
        </div>

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Summary KPIs</div>
            <Button variant="secondary" size="md" onClick={load} style={{ borderRadius: 999 }}>
              Refresh
            </Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: spacing.md }}>
            {[
              { label: "Total Fan Club members", value: summary?.fanCount ?? "—" },
              { label: "Active fans", value: summary?.activeFans ?? "—" },
              { label: "Total redemptions", value: summary?.redemptionCount ?? "—" },
              { label: "Program interest leads", value: summary?.leadsCount ?? "—" },
            ].map((k) => (
              <div key={k.label} style={{ borderRadius: borderRadius.xl, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.16)", padding: spacing.lg }}>
                <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.12em" }}>{k.label}</div>
                <div style={{ ...typography.h3, color: colors.text.primary, marginTop: 10 }}>{k.value}</div>
              </div>
            ))}
          </div>
          {loading && <div style={{ marginTop: spacing.md, ...typography.caption, color: colors.text.muted }}>Loading…</div>}
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: spacing.lg }}>
          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Tier distribution</div>
            <div style={{ display: "grid", gap: 10 }}>
              {tierRows.map((r) => (
                <div key={r.name} style={{ display: "flex", justifyContent: "space-between", gap: spacing.md, color: colors.text.secondary, ...typography.body }}>
                  <span>{r.name}</span>
                  <span style={{ color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{r.value}</span>
                </div>
              ))}
              {tierRows.length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No data yet.</div>}
            </div>
          </Card>

          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Sponsor value (redemptions)</div>
            <div style={{ display: "grid", gap: 10 }}>
              {sponsorRows.slice(0, 8).map((r) => (
                <div key={r.name} style={{ display: "flex", justifyContent: "space-between", gap: spacing.md, color: colors.text.secondary, ...typography.body }}>
                  <span>{r.name}</span>
                  <span style={{ color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{r.value}</span>
                </div>
              ))}
              {sponsorRows.length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No redemptions yet.</div>}
            </div>
          </Card>

          <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, marginBottom: spacing.md }}>Conversion (program interest)</div>
            <div style={{ display: "grid", gap: 10 }}>
              {programRows.map((r) => (
                <div key={r.name} style={{ display: "flex", justifyContent: "space-between", gap: spacing.md, color: colors.text.secondary, ...typography.body }}>
                  <span>{r.name}</span>
                  <span style={{ color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{r.value}</span>
                </div>
              ))}
              {programRows.length === 0 && <div style={{ ...typography.caption, color: colors.text.muted }}>No leads yet.</div>}
            </div>
          </Card>
        </div>

        <Card variant="default" padding="xl" style={{ borderRadius: borderRadius["2xl"], background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
            <div style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>Exports</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  const csv = toCsv(redemptions, [
                    { key: "id", label: "id" },
                    { key: "redeemedAt", label: "redeemedAt" },
                    { key: "status", label: "status" },
                    { key: "codeUsed", label: "codeUsed" },
                    { key: "pool.name", label: "couponPool" },
                    { key: "pool.sponsor.name", label: "sponsor" },
                    { key: "fan.fullName", label: "fanName" },
                    { key: "fan.city", label: "fanCity" },
                    { key: "fan.tier.name", label: "fanTier" },
                  ]);
                  downloadCsv("realverse_fanclub_redemptions.csv", csv);
                }}
                style={{ borderRadius: 999 }}
              >
                Export redemptions CSV
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  const csv = toCsv(leads, [
                    { key: "id", label: "id" },
                    { key: "createdAt", label: "createdAt" },
                    { key: "status", label: "status" },
                    { key: "programInterest", label: "programInterest" },
                    { key: "fan.fullName", label: "fanName" },
                    { key: "fan.city", label: "fanCity" },
                    { key: "fan.tier.name", label: "fanTier" },
                  ]);
                  downloadCsv("realverse_fanclub_program_leads.csv", csv);
                }}
                style={{ borderRadius: 999 }}
              >
                Export leads CSV
              </Button>
            </div>
          </div>
          <div style={{ ...typography.caption, color: colors.text.muted, lineHeight: 1.6 }}>
            Engagement metrics (hovers / scroll depth / CTA hover time) will be wired once we connect client analytics events to persistence.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminFanAnalyticsPage;



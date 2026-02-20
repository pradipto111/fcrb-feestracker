import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { api } from "../../api/client";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors, spacing, typography, borderRadius } from "../../theme/design-tokens";
import { pageVariants, cardVariants } from "../../utils/motion";

function parseCsv(text: string): Array<Record<string, any>> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const headers = parseLine(lines[0]).map((h) => h || "");
  const rows: Array<Record<string, any>> = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = parseLine(lines[i]);
    const row: Record<string, any> = {};
    headers.forEach((h, idx) => {
      row[h] = parts[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function guessKey(headers: string[], candidates: string[]) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase());
    if (idx >= 0) return headers[idx];
  }
  // fuzzy contains
  for (let i = 0; i < lower.length; i++) {
    for (const c of candidates) {
      if (lower[i].includes(c.toLowerCase())) return headers[i];
    }
  }
  return "";
}

const CrmImportPage: React.FC = () => {
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [mapping, setMapping] = useState<any>({ primaryName: "", phone: "", email: "", preferredCentre: "", programmeInterest: "" });
  const [job, setJob] = useState<any>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [jobs, setJobs] = useState<any[]>([]);

  const headers = useMemo(() => {
    if (!rows.length) return [];
    const first = rows[0] || {};
    return Object.keys(first);
  }, [rows]);

  useEffect(() => {
    if (!headers.length) return;
    setMapping({
      primaryName: guessKey(headers, ["name", "full name", "player name", "customer name"]),
      phone: guessKey(headers, ["phone", "mobile", "parent phone"]),
      email: guessKey(headers, ["email", "mail"]),
      preferredCentre: guessKey(headers, ["preferred centre", "centre", "center", "location"]),
      programmeInterest: guessKey(headers, ["programme", "program", "interest", "programme interest", "program interest"]),
    });
  }, [headers.join("|")]);

  const loadJobs = async () => {
    try {
      const data = await api.crmImportJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const onPickFile = async (f: File | null) => {
    setError("");
    setStatus("");
    setJob(null);
    setPreviewRows([]);
    if (!f) return;
    setFileName(f.name);

    try {
      const ext = f.name.toLowerCase().split(".").pop();
      if (ext === "csv") {
        const text = await f.text();
        const parsed = parseCsv(text);
        setRows(parsed);
        return;
      }
      if (ext === "xlsx" || ext === "xls") {
        const buf = await f.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];
        setRows(json);
        return;
      }
      setError("Unsupported file type. Please upload .csv or .xlsx");
    } catch (e: any) {
      setError(e.message || "Failed to read file");
    }
  };

  const createPreview = async () => {
    setError("");
    setStatus("Creating import preview…");
    try {
      const source = fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls") ? "xlsx_upload" : "csv_upload";
      const res = await api.crmImportPreview({ source, filename: fileName, rows, mapping });
      setJob(res.job);
      setPreviewRows(res.previewRows || []);
      setStatus("Preview created. Next: Validate → Commit.");
      loadJobs();
    } catch (e: any) {
      setError(e.message || "Failed to create preview");
      setStatus("");
    }
  };

  const validate = async () => {
    if (!job?.id) return;
    setError("");
    setStatus("Validating rows…");
    try {
      const res = await api.crmImportValidate(job.id, { mapping });
      setJob(res.job);
      setStatus(`Validated: ${res.validCount} valid, ${res.invalidCount} invalid.`);
      loadJobs();
    } catch (e: any) {
      setError(e.message || "Failed to validate import");
      setStatus("");
    }
  };

  const commit = async () => {
    if (!job?.id) return;
    setError("");
    setStatus("Committing import…");
    try {
      const res = await api.crmImportCommit(job.id);
      setJob(res.job);
      setStatus(`Committed: ${res.createdCount} created, ${res.skippedCount} skipped.`);
      loadJobs();
    } catch (e: any) {
      setError(e.message || "Failed to commit import");
      setStatus("");
    }
  };

  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <PageHeader title="Import Leads" subtitle="Upload CSV/XLSX and map columns into the CRM." />

      <Card variant="elevated" padding="lg" style={{ marginTop: spacing.lg }}>
        <div style={{ display: "flex", gap: spacing.md, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => onPickFile(e.target.files?.[0] || null)} />
          <div style={{ ...typography.caption, color: colors.text.muted }}>
            {rows.length ? `${rows.length} rows loaded` : "No file loaded"}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: spacing.sm }}>
            <Button variant="secondary" onClick={loadJobs}>
              Refresh Jobs
            </Button>
          </div>
        </div>

        {error && <div style={{ marginTop: spacing.md, ...typography.body, color: colors.danger.main }}>{error}</div>}
        {status && <div style={{ marginTop: spacing.md, ...typography.body, color: colors.text.secondary }}>{status}</div>}
      </Card>

      {rows.length > 0 && (
        <Card variant="elevated" padding="lg" style={{ marginTop: spacing.lg }}>
          <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Column Mapping</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: spacing.md }}>
            {[
              { key: "primaryName", label: "Name (required)" },
              { key: "phone", label: "Phone" },
              { key: "email", label: "Email" },
              { key: "preferredCentre", label: "Centre" },
              { key: "programmeInterest", label: "Programme Interest" },
            ].map((f) => (
              <div key={f.key}>
                <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: spacing.xs }}>{f.label}</div>
                <select
                  value={mapping[f.key] || ""}
                  onChange={(e) => setMapping((p: any) => ({ ...p, [f.key]: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: spacing.sm,
                    background: colors.surface.card,
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                    borderRadius: borderRadius.md,
                    color: colors.text.primary,
                  }}
                >
                  <option value="">(none)</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.md, flexWrap: "wrap" }}>
            <Button variant="primary" onClick={createPreview} disabled={!mapping.primaryName || rows.length === 0}>
              Create Preview
            </Button>
            <Button variant="secondary" onClick={validate} disabled={!job?.id}>
              Validate
            </Button>
            <Button variant="primary" onClick={commit} disabled={!job?.id}>
              Commit
            </Button>
          </div>
        </Card>
      )}

      {previewRows.length > 0 && (
        <Card variant="elevated" padding="lg" style={{ marginTop: spacing.lg }}>
          <div style={{ ...typography.h4, color: colors.text.primary, marginBottom: spacing.md }}>Preview (first 25 rows)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: spacing.sm, color: colors.text.muted }}>Row</th>
                  {headers.slice(0, 6).map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: spacing.sm, color: colors.text.muted }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ padding: spacing.sm, borderTop: "1px solid rgba(255,255,255,0.06)", color: colors.text.secondary }}>
                      {r.rowNumber}
                    </td>
                    {headers.slice(0, 6).map((h) => (
                      <td key={h} style={{ padding: spacing.sm, borderTop: "1px solid rgba(255,255,255,0.06)", color: colors.text.secondary }}>
                        {String((r.raw || {})[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {jobs.length > 0 && (
        <div style={{ marginTop: spacing.lg }}>
          <div style={{ ...typography.h3, color: colors.text.primary, marginBottom: spacing.md }}>Recent Import Jobs</div>
          <div style={{ display: "grid", gap: spacing.md }}>
            {jobs.slice(0, 10).map((j: any) => (
              <motion.div key={j.id} variants={cardVariants}>
                <Card variant="elevated" padding="lg">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                        {j.filename || j.source}
                      </div>
                      <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 2 }}>
                        {j.status} • {j.createdAt ? new Date(j.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.muted }}>
                      {j.summary?.validCount !== undefined ? `${j.summary.validCount} valid` : ""}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.main>
  );
};

export default CrmImportPage;


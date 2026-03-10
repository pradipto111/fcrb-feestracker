import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart } from "recharts/es6/chart/BarChart";
import { LineChart } from "recharts/es6/chart/LineChart";
import { Bar } from "recharts/es6/cartesian/Bar";
import { CartesianGrid } from "recharts/es6/cartesian/CartesianGrid";
import { Line } from "recharts/es6/cartesian/Line";
import { XAxis } from "recharts/es6/cartesian/XAxis";
import { YAxis } from "recharts/es6/cartesian/YAxis";
import { Legend } from "recharts/es6/component/Legend";
import { ResponsiveContainer } from "recharts/es6/component/ResponsiveContainer";
import { Tooltip } from "recharts/es6/component/Tooltip";
import { api, RevenueAnalyticsQuery, RevenueFilterOptions } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { DataTableCard } from "../../components/ui/DataTableCard";
import { RevenueMultiSelectDropdown } from "../../components/ui/RevenueMultiSelectDropdown";
import { Section } from "../../components/ui/Section";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";
import { cardVariants, pageVariants } from "../../utils/motion";

type RevenueDraftFilters = {
  centerIds: number[];
  programmes: string[];
  statuses: string[];
  paymentFrequency: "all" | number;
  datePreset:
    | "this_month"
    | "last_3_months"
    | "last_6_months"
    | "last_12_months"
    | "this_financial_year"
    | "last_financial_year"
    | "custom_range";
  dateFrom: string;
  dateTo: string;
};

const DEFAULT_FILTERS: RevenueDraftFilters = {
  centerIds: [],
  programmes: [],
  statuses: [],
  paymentFrequency: "all",
  datePreset: "last_12_months",
  dateFrom: "",
  dateTo: "",
};

const TAB_KEYS = ["trend", "center", "programme", "players"] as const;
type TabKey = (typeof TAB_KEYS)[number];
const ProgrammeBreakdownChart = lazy(() => import("./charts/ProgrammeBreakdownChart"));

const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const EMPTY_FILTER_META: RevenueFilterOptions = {
  centers: [],
  programmes: [],
  statuses: [],
  paymentFrequencies: [],
  dateBounds: { min: null, max: null },
};

function getPaymentFrequencyLabel(freq: number): string {
  if (freq === 1) return "Monthly";
  if (freq === 3) return "Quarterly";
  if (freq === 6) return "Semi-Annual";
  if (freq === 12) return "Annual";
  return `${freq} months`;
}

function parseNumbers(input: string | null): number[] {
  if (!input) return [];
  return input.split(",").map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0);
}

function parseStrings(input: string | null): string[] {
  if (!input) return [];
  return input.split(",").map((v) => decodeURIComponent(v)).filter(Boolean);
}

function fromSearchParams(searchParams: URLSearchParams): RevenueDraftFilters {
  const preset = (searchParams.get("datePreset") || DEFAULT_FILTERS.datePreset) as RevenueDraftFilters["datePreset"];
  return {
    centerIds: parseNumbers(searchParams.get("centerIds")),
    programmes: parseStrings(searchParams.get("programmes")),
    statuses: parseStrings(searchParams.get("statuses")).map((v) => v.toUpperCase()),
    paymentFrequency: searchParams.get("paymentFrequency") ? Number(searchParams.get("paymentFrequency")) : "all",
    datePreset: preset,
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
  };
}

function toSearchParams(filters: RevenueDraftFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.centerIds.length > 0) params.set("centerIds", filters.centerIds.join(","));
  if (filters.programmes.length > 0) params.set("programmes", filters.programmes.map((v) => encodeURIComponent(v)).join(","));
  if (filters.statuses.length > 0) params.set("statuses", filters.statuses.join(","));
  if (filters.paymentFrequency !== "all") params.set("paymentFrequency", String(filters.paymentFrequency));
  if (filters.datePreset !== "last_12_months") params.set("datePreset", filters.datePreset);
  if (filters.datePreset === "custom_range" && filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.datePreset === "custom_range" && filters.dateTo) params.set("dateTo", filters.dateTo);
  return params;
}

function toQuery(filters: RevenueDraftFilters): RevenueAnalyticsQuery {
  return {
    centerIds: filters.centerIds,
    programmes: filters.programmes,
    statuses: filters.statuses,
    paymentFrequency: filters.paymentFrequency,
    datePreset: filters.datePreset,
    dateFrom: filters.datePreset === "custom_range" ? filters.dateFrom || undefined : undefined,
    dateTo: filters.datePreset === "custom_range" ? filters.dateTo || undefined : undefined,
  };
}

const AdminRevenuePage: React.FC = () => {
  const navigate = useNavigate();
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const isMobile = viewportWidth <= 768;
  const isTablet = viewportWidth > 768 && viewportWidth <= 1024;
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState<RevenueDraftFilters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<RevenueDraftFilters>(DEFAULT_FILTERS);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterMeta, setFilterMeta] = useState<RevenueFilterOptions>(EMPTY_FILTER_META);
  const [activeTab, setActiveTab] = useState<TabKey>("trend");
  const [centerView, setCenterView] = useState<"chart" | "table">("chart");
  const [showDuesModal, setShowDuesModal] = useState(false);
  const [playerSearch, setPlayerSearch] = useState("");
  const [sortBy, setSortBy] = useState("outstanding");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadRevenue = async (filters: RevenueDraftFilters) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getRevenueAnalytics(toQuery(filters));
      setData(response);
    } catch (err: any) {
      setError(err.message || "Failed to load revenue analytics");
    } finally {
      setLoading(false);
    }
  };

  const loadFilterMeta = async () => {
    try {
      const response = await api.getRevenueFilterOptions();
      const nextMeta: RevenueFilterOptions = {
        centers: Array.isArray(response?.centers) ? response.centers : [],
        programmes: Array.isArray(response?.programmes) ? response.programmes : [],
        statuses: Array.isArray(response?.statuses) ? response.statuses : [],
        paymentFrequencies: Array.isArray(response?.paymentFrequencies) ? response.paymentFrequencies : [],
        dateBounds: {
          min: response?.dateBounds?.min || null,
          max: response?.dateBounds?.max || null,
        },
      };
      setFilterMeta(nextMeta);
    } catch {
      // Keep page usable with fallback metadata from analytics payload.
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const fromUrl = fromSearchParams(searchParams);
      setDraft(fromUrl);
      await loadFilterMeta();
      if ([...searchParams.keys()].length > 0) {
        setApplied(fromUrl);
        setHasAppliedFilters(true);
        await loadRevenue(fromUrl);
      }
    };
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = async () => {
    const nextApplied = { ...draft };
    setApplied(nextApplied);
    setHasAppliedFilters(true);
    setPage(1);
    setSearchParams(toSearchParams(nextApplied));
    await loadRevenue(nextApplied);
  };

  const handleClear = () => {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setHasAppliedFilters(false);
    setData(null);
    setError("");
    setActiveTab("trend");
    setCenterView("chart");
    setPlayerSearch("");
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (applied.centerIds.length) count += 1;
    if (applied.programmes.length) count += 1;
    if (applied.statuses.length) count += 1;
    if (applied.paymentFrequency !== "all") count += 1;
    if (applied.datePreset !== "last_12_months") count += 1;
    if (applied.datePreset === "custom_range" && (applied.dateFrom || applied.dateTo)) count += 1;
    return count;
  }, [applied]);

  const summary = data?.summary || {};
  const tabs = data?.tabs || {};
  const filtersMeta = useMemo(() => {
    const fallback = data?.filtersMeta || {};
    return {
      centers: filterMeta.centers.length > 0 ? filterMeta.centers : fallback.centers || [],
      programmes: filterMeta.programmes.length > 0 ? filterMeta.programmes : fallback.programmes || [],
      statuses: filterMeta.statuses.length > 0 ? filterMeta.statuses : fallback.statuses || [],
      paymentFrequencies:
        filterMeta.paymentFrequencies.length > 0 ? filterMeta.paymentFrequencies : fallback.paymentFrequencies || [],
      dateBounds:
        filterMeta.dateBounds?.min || filterMeta.dateBounds?.max
          ? filterMeta.dateBounds
          : fallback.dateBounds || EMPTY_FILTER_META.dateBounds,
    };
  }, [data?.filtersMeta, filterMeta]);
  const updatedAt = data?.updatedAt ? new Date(data.updatedAt).toLocaleString("en-IN") : "Not loaded";
  const paymentFrequencyOptions = useMemo(() => {
    const options = Array.from(
      new Set<number>(
        (filtersMeta.paymentFrequencies || [])
          .map((value: number) => Number(value))
          .filter((value: number) => Number.isFinite(value) && value > 0)
      )
    ) as number[];
    if (draft.paymentFrequency !== "all" && !options.includes(draft.paymentFrequency)) {
      options.push(draft.paymentFrequency);
    }
    return options.sort((a, b) => a - b);
  }, [filtersMeta.paymentFrequencies, draft.paymentFrequency]);

  const playerRows: any[] = tabs.playerDetails || [];
  const filteredRows = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    return playerRows
      .filter((row) => !q || row.fullName.toLowerCase().includes(q))
      .sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (typeof av === "string" && typeof bv === "string") {
          return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
      });
  }, [playerRows, playerSearch, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / 25));
  const pagedRows = filteredRows.slice((page - 1) * 25, page * 25);

  const centerTable = tabs.centerTable || [];
  const centreMonthly = tabs.centerMonthlyBreakdown || [];
  const programmeBreakdown = tabs.programmeBreakdown || [];
  const outstandingPlayers = tabs.outstandingPlayers || [];

  const centerChartData = useMemo(() => {
    return centreMonthly.map((monthRow: any) => {
      const row: any = { month: monthRow.month };
      monthRow.centres.forEach((center: any) => {
        row[center.centerName] = center.collected;
      });
      return row;
    });
  }, [centreMonthly]);

  const handleCsvDownload = () => {
    const header = [
      "Player Name",
      "Center",
      "Programme",
      "Fee",
      "Frequency",
      "Status",
      "Months In Period",
      "Expected",
      "Paid",
      "Outstanding",
      "Collection %",
      "Last Payment Date",
    ];
    const rows = filteredRows.map((row) => [
      row.fullName,
      row.centerName,
      row.programme,
      row.monthlyFeeAmount,
      row.paymentFrequency,
      row.status,
      row.monthsInPeriod,
      row.expected,
      row.paid,
      row.outstanding,
      row.collectionPct,
      row.lastPaymentDate ? new Date(row.lastPaymentDate).toLocaleDateString("en-IN") : "",
    ]);
    const csv = [header, ...rows].map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "revenue-player-details.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const kpiCard = (title: string, value: string, subtitle: string, gradient: string, onClick?: () => void) => (
    <Card
      key={title}
      variant="elevated"
      padding="md"
      onClick={onClick}
      style={{
        background: gradient,
        color: colors.text.onPrimary,
        cursor: onClick ? "pointer" : "default",
        minHeight: 132,
      }}
    >
      <div style={{ ...typography.caption, opacity: 0.9 }}>{title}</div>
      <div style={{ ...typography.h2, marginTop: spacing.sm }}>{value}</div>
      <div style={{ ...typography.caption, opacity: 0.85, marginTop: spacing.sm }}>{subtitle}</div>
    </Card>
  );

  return (
    <motion.main
      className="rv-page rv-page--revenue"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ background: colors.surface.bg, minHeight: "100%" }}
    >
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      <motion.section
        style={{ position: "relative", overflow: "hidden", marginBottom: spacing["2xl"], borderRadius: borderRadius.xl }}
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(5, 58, 184, 0.72) 0%, rgba(255, 179, 0, 0.48) 100%)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, padding: spacing["2xl"] }}>
          <p style={{ ...typography.overline, color: colors.accent.main, margin: 0 }}>RealVerse • Revenue Analysis</p>
          <h1 style={{ ...typography.h1, color: colors.text.onPrimary, margin: `${spacing.sm} 0 0` }}>Revenue Dashboard</h1>
          <p style={{ ...typography.body, color: colors.text.onPrimary, marginTop: spacing.sm }}>
            Data as of: {updatedAt}
          </p>
        </div>
      </motion.section>

      <Section title="Revenue Filters" description="Apply filters to load data" variant="default" style={{ marginBottom: spacing.xl }}>
        <div className="rv-filter-bar" style={{ marginBottom: spacing.md }}>
          <div className="rv-filter-field">
            <RevenueMultiSelectDropdown
              label="Center (multi-select)"
              options={(filtersMeta.centers || []).map((center: any) => ({
                value: String(center.id),
                label: center.name,
              }))}
              selectedValues={draft.centerIds.map(String)}
              onChange={(nextValues) =>
                setDraft((prev) => ({
                  ...prev,
                  centerIds: nextValues.map((value) => Number(value)).filter((value) => Number.isFinite(value)),
                }))
              }
              placeholder="All centers"
              searchPlaceholder="Search centers..."
            />
          </div>

          <div className="rv-filter-field">
            <RevenueMultiSelectDropdown
              label="Programme (multi-select)"
              options={(filtersMeta.programmes || []).map((programme: string) => ({
                value: programme,
                label: programme,
              }))}
              selectedValues={draft.programmes}
              onChange={(nextValues) =>
                setDraft((prev) => ({
                  ...prev,
                  programmes: nextValues,
                }))
              }
              placeholder="All programmes"
              searchPlaceholder="Search programmes..."
            />
          </div>

          <div className="rv-filter-field">
            <RevenueMultiSelectDropdown
              label="Player Status (multi-select)"
              options={(filtersMeta.statuses || []).map((status: string) => ({
                value: status,
                label: status,
              }))}
              selectedValues={draft.statuses}
              onChange={(nextValues) =>
                setDraft((prev) => ({
                  ...prev,
                  statuses: nextValues,
                }))
              }
              placeholder="All statuses"
              searchPlaceholder="Search statuses..."
            />
          </div>

          <div className="rv-filter-field">
            <label>Payment Frequency</label>
            <select
              value={String(draft.paymentFrequency)}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  paymentFrequency: e.target.value === "all" ? "all" : Number(e.target.value),
                }))
              }
            >
              <option value="all">All Frequencies</option>
              {paymentFrequencyOptions.map((freq: number) => (
                <option key={freq} value={freq}>
                  {getPaymentFrequencyLabel(freq)}
                </option>
              ))}
            </select>
          </div>

          <div className="rv-filter-field">
            <label>Date Range</label>
            <select
              value={draft.datePreset}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  datePreset: e.target.value as RevenueDraftFilters["datePreset"],
                }))
              }
            >
              <option value="this_month">This Month</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="this_financial_year">This Financial Year (Apr-Mar)</option>
              <option value="last_financial_year">Last Financial Year</option>
              <option value="custom_range">Custom Range</option>
            </select>
          </div>

          <div className="rv-filter-field">
            <label>Date From</label>
            <input
              type="date"
              value={draft.dateFrom}
              disabled={draft.datePreset !== "custom_range"}
              min={filtersMeta.dateBounds?.min || undefined}
              max={filtersMeta.dateBounds?.max || undefined}
              onChange={(e) => setDraft((prev) => ({ ...prev, dateFrom: e.target.value }))}
              style={{ opacity: draft.datePreset === "custom_range" ? 1 : 0.55 }}
            />
          </div>

          <div className="rv-filter-field">
            <label>Date To</label>
            <input
              type="date"
              value={draft.dateTo}
              disabled={draft.datePreset !== "custom_range"}
              min={filtersMeta.dateBounds?.min || undefined}
              max={filtersMeta.dateBounds?.max || undefined}
              onChange={(e) => setDraft((prev) => ({ ...prev, dateTo: e.target.value }))}
              style={{ opacity: draft.datePreset === "custom_range" ? 1 : 0.55 }}
            />
          </div>

          <div className="rv-filter-field" style={{ display: "flex", alignItems: "flex-end", gap: spacing.sm }}>
            <Button variant="secondary" onClick={handleApply} disabled={loading}>
              {loading ? "Loading..." : `Apply Filters${hasAppliedFilters && activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
            </Button>
            <Button variant="secondary" onClick={handleClear}>
              Clear Filters
            </Button>
          </div>
        </div>
      </Section>

      {error && (
        <Card variant="default" padding="md" style={{ marginBottom: spacing.md, background: colors.danger.soft }}>
          <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
        </Card>
      )}

      {loading && (
        <div style={{ display: "grid", gap: spacing.lg, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: spacing.xl }}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rv-session-card--skeleton">
              <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--lg" />
              <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
              <div className="rv-skeleton rv-skeleton-bar" />
            </div>
          ))}
        </div>
      )}

      {!loading && hasAppliedFilters && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: spacing.lg, marginBottom: spacing.lg }}>
            {kpiCard(
              "Total Revenue",
              `₹${INR.format(summary.totalRevenue || 0)}`,
              `${summary.revenueChangePct >= 0 ? "↑" : "↓"} ${Math.abs(summary.revenueChangePct || 0).toFixed(1)}% vs previous period`,
              "linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)"
            )}
            {kpiCard(
              "Average Monthly Collection",
              `₹${INR.format(summary.averageMonthlyCollection || 0)}`,
              `Peak: ${summary.peakMonth?.month || "-"} — ₹${INR.format(summary.peakMonth?.collected || 0)}`,
              "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
            )}
            {kpiCard(
              "Collection Rate",
              `${Number(summary.collectionRate || 0).toFixed(1)}%`,
              `${summary.fullyPaidPlayers || 0} of ${summary.totalPlayersConsidered || 0} players fully paid`,
              Number(summary.collectionRate || 0) >= 90
                ? "linear-gradient(135deg, #16A34A 0%, #15803D 100%)"
                : Number(summary.collectionRate || 0) >= 70
                ? "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)"
                : "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)"
            )}
            {kpiCard(
              "Active Players",
              String(summary.activePlayers || 0),
              `+${summary.activePlayersDeltaThisMonth?.new || 0} new this month, -${summary.activePlayersDeltaThisMonth?.dropped || 0} dropped`,
              "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)"
            )}
            {kpiCard(
              "Outstanding Dues",
              `₹${INR.format(summary.outstandingDues || 0)}`,
              `${summary.pendingPlayers || 0} players with pending dues`,
              "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
              () => setShowDuesModal(true)
            )}
            {kpiCard(
              "Revenue per Player (avg)",
              `₹${INR.format(summary.revenuePerPlayer || 0)}`,
              summary.topProgramme
                ? `Top programme: ${summary.topProgramme.name} — ₹${INR.format(summary.topProgramme.monthlyFee || 0)}/mo`
                : "Top programme: -",
              "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)"
            )}
          </div>

          <DataTableCard
            title="Revenue Analytics"
            description="Apply filters to refresh data"
            actions={
            <div className="rv-action-row">
                {([
                  ["trend", "Revenue Trend"],
                  ["center", "Center-wise Breakdown"],
                  ["programme", "Programme-wise Breakdown"],
                  ["players", "Player-level Detail"],
                ] as Array<[TabKey, string]>).map(([key, label]) => (
                  <Button key={key} variant={activeTab === key ? "primary" : "secondary"} size="sm" onClick={() => setActiveTab(key)}>
                    {label}
                  </Button>
                ))}
              </div>
            }
            isEmpty={false}
          >
            {activeTab === "trend" && (
              <div className="rv-table-wrap">
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tabs.monthlyTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke={colors.text.muted} />
                      <YAxis stroke={colors.text.muted} tickFormatter={(v) => `₹${INR.format(v)}`} />
                      <Tooltip
                        formatter={(value: any, name: string) =>
                          name === "collectionPct" ? `${Number(value).toFixed(1)}%` : `₹${INR.format(Number(value || 0))}`
                        }
                      />
                      <Legend />
                      <Line type="monotone" dataKey="collected" stroke="#3B82F6" strokeWidth={3} name="Collected Revenue" />
                      <Line type="monotone" dataKey="expected" stroke="#94A3B8" strokeDasharray="6 4" name="Expected Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.md }}>
                  Last updated: {updatedAt}
                </p>
              </div>
            )}

            {activeTab === "center" && (
              <div>
                <div style={{ marginBottom: spacing.md }}>
                  <Button variant={centerView === "chart" ? "primary" : "secondary"} size="sm" onClick={() => setCenterView("chart")}>
                    Chart
                  </Button>
                  <Button
                    variant={centerView === "table" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setCenterView("table")}
                    style={{ marginLeft: spacing.sm }}
                  >
                    Table
                  </Button>
                </div>
                {centerView === "chart" ? (
                  <div className="rv-table-wrap" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={centerChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke={colors.text.muted} />
                        <YAxis stroke={colors.text.muted} tickFormatter={(v) => `₹${INR.format(v)}`} />
                        <Tooltip formatter={(v: any) => `₹${INR.format(Number(v || 0))}`} />
                        <Legend />
                        {centerTable.map((center: any) => (
                          <Bar key={center.centerName} dataKey={center.centerName} stackId="revenue" />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="rv-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <th style={{ textAlign: "left", padding: spacing.sm }}>Center</th>
                        <th style={{ textAlign: "right", padding: spacing.sm }}>Players</th>
                        <th style={{ textAlign: "right", padding: spacing.sm }}>Expected ₹</th>
                        <th style={{ textAlign: "right", padding: spacing.sm }}>Collected ₹</th>
                        <th style={{ textAlign: "right", padding: spacing.sm }}>Collection %</th>
                        <th style={{ textAlign: "right", padding: spacing.sm }}>Outstanding ₹</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centerTable.map((row: any) => (
                        <tr key={row.centerId} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          <td style={{ padding: spacing.sm }}>{row.centerName}</td>
                          <td style={{ textAlign: "right", padding: spacing.sm }}>{row.players}</td>
                          <td style={{ textAlign: "right", padding: spacing.sm }}>{INR.format(row.expected)}</td>
                          <td style={{ textAlign: "right", padding: spacing.sm }}>{INR.format(row.collected)}</td>
                          <td style={{ textAlign: "right", padding: spacing.sm }}>{Number(row.collectionPct).toFixed(1)}%</td>
                          <td style={{ textAlign: "right", padding: spacing.sm }}>{INR.format(row.outstanding)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "programme" && (
              <div className="rv-table-wrap">
                <Suspense fallback={<div style={{ height: 300 }} />}>
                  <ProgrammeBreakdownChart data={programmeBreakdown} height={300} />
                </Suspense>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: spacing.md }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      <th style={{ textAlign: "left", padding: spacing.sm }}>Programme Name</th>
                      <th style={{ textAlign: "right", padding: spacing.sm }}>Players</th>
                      <th style={{ textAlign: "right", padding: spacing.sm }}>Monthly Fee</th>
                      <th style={{ textAlign: "right", padding: spacing.sm }}>Total Expected</th>
                      <th style={{ textAlign: "right", padding: spacing.sm }}>Total Collected</th>
                      <th style={{ textAlign: "right", padding: spacing.sm }}>Collection %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programmeBreakdown.map((row: any) => (
                      <tr key={row.programme} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: spacing.sm }}>{row.programme}</td>
                        <td style={{ textAlign: "right", padding: spacing.sm }}>{row.players}</td>
                        <td style={{ textAlign: "right", padding: spacing.sm }}>₹{INR.format(row.monthlyFee)}</td>
                        <td style={{ textAlign: "right", padding: spacing.sm }}>₹{INR.format(row.totalExpected)}</td>
                        <td style={{ textAlign: "right", padding: spacing.sm }}>₹{INR.format(row.totalCollected)}</td>
                        <td style={{ textAlign: "right", padding: spacing.sm }}>{Number(row.collectionPct).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "players" && (
              <div>
                <div className="rv-action-row" style={{ marginBottom: spacing.md }}>
                  <input
                    type="text"
                    placeholder="Search by player name"
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      minWidth: 240,
                      padding: "0.55rem 0.7rem",
                      borderRadius: "var(--rv-radius-sm)",
                      border: "1px solid var(--rv-border-subtle)",
                      background: "rgba(3, 9, 28, 0.9)",
                      color: "var(--rv-text-body)",
                    }}
                  />
                  <Button variant="secondary" size="sm" onClick={handleCsvDownload}>
                    Download CSV
                  </Button>
                </div>
                {isMobile ? (
                  <div style={{ display: "grid", gap: spacing.sm }}>
                    {pagedRows.map((row: any) => (
                      <Card key={row.id} variant="default" padding="md">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.sm }}>
                          <button
                            style={{
                              color: colors.primary.light,
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              ...typography.body,
                              fontWeight: typography.fontWeight.semibold,
                            }}
                            onClick={() => navigate(`/realverse/admin/players/${row.id}/profile`)}
                          >
                            {row.fullName}
                          </button>
                          <span style={{ ...typography.caption, color: colors.text.muted }}>{Number(row.collectionPct).toFixed(1)}%</span>
                        </div>
                        <div style={{ ...typography.caption, color: colors.text.muted, marginTop: spacing.xs }}>
                          {row.centerName} • {row.programme}
                        </div>
                        <div style={{ marginTop: spacing.sm, display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.sm }}>
                          <div>
                            <div style={{ ...typography.caption, color: colors.text.muted }}>Expected</div>
                            <div style={{ ...typography.body, color: colors.text.primary }}>₹{INR.format(row.expected)}</div>
                          </div>
                          <div>
                            <div style={{ ...typography.caption, color: colors.text.muted }}>Outstanding</div>
                            <div style={{ ...typography.body, color: row.outstanding > 0 ? colors.danger.main : colors.success.main }}>
                              ₹{INR.format(row.outstanding)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rv-table-wrap">
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isTablet ? 1040 : 1100 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      {[
                        ["fullName", "Player Name"],
                        ["centerName", "Center"],
                        ["programme", "Programme"],
                        ["monthlyFeeAmount", "Fee ₹"],
                        ["paymentFrequency", "Frequency"],
                        ["status", "Status"],
                        ["monthsInPeriod", "Months in Period"],
                        ["expected", "Expected ₹"],
                        ["paid", "Paid ₹"],
                        ["outstanding", "Outstanding ₹"],
                        ["collectionPct", "Collection %"],
                        ["lastPaymentDate", "Last Payment Date"],
                      ].map(([key, label]) => (
                        <th
                          key={key}
                          style={{ textAlign: "left", padding: spacing.sm, cursor: "pointer" }}
                          onClick={() => {
                            if (sortBy === key) {
                              setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
                            } else {
                              setSortBy(key);
                              setSortDir("desc");
                            }
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row: any) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          background:
                            Number(row.collectionPct) < 50
                              ? "rgba(239,68,68,0.12)"
                              : Number(row.collectionPct) < 80
                              ? "rgba(245,158,11,0.12)"
                              : "transparent",
                        }}
                      >
                        <td style={{ padding: spacing.sm }}>
                          <button
                            style={{ color: colors.primary.light, background: "transparent", border: "none", cursor: "pointer" }}
                            onClick={() => navigate(`/realverse/admin/players/${row.id}/profile`)}
                          >
                            {row.fullName}
                          </button>
                        </td>
                        <td style={{ padding: spacing.sm }}>{row.centerName}</td>
                        <td style={{ padding: spacing.sm }}>{row.programme}</td>
                        <td style={{ padding: spacing.sm }}>₹{INR.format(row.monthlyFeeAmount)}</td>
                        <td style={{ padding: spacing.sm }}>{row.paymentFrequency}</td>
                        <td style={{ padding: spacing.sm }}>{row.status}</td>
                        <td style={{ padding: spacing.sm }}>{row.monthsInPeriod}</td>
                        <td style={{ padding: spacing.sm }}>₹{INR.format(row.expected)}</td>
                        <td style={{ padding: spacing.sm }}>₹{INR.format(row.paid)}</td>
                        <td style={{ padding: spacing.sm }}>₹{INR.format(row.outstanding)}</td>
                        <td style={{ padding: spacing.sm }}>{Number(row.collectionPct).toFixed(1)}%</td>
                        <td style={{ padding: spacing.sm }}>
                          {row.lastPaymentDate ? new Date(row.lastPaymentDate).toLocaleDateString("en-IN") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                )}
                <div className="rv-action-row" style={{ justifyContent: "space-between", marginTop: spacing.md }}>
                  <span style={{ ...typography.caption, color: colors.text.muted }}>
                    Showing {(page - 1) * 25 + 1}-{Math.min(page * 25, filteredRows.length)} of {filteredRows.length}
                  </span>
                  <div style={{ display: "flex", gap: spacing.sm }}>
                    <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      Previous
                    </Button>
                    <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DataTableCard>
        </>
      )}

      {!loading && hasAppliedFilters && data && (tabs.monthlyTrend || []).length === 0 && (
        <Card variant="default" padding="lg" style={{ textAlign: "center", marginTop: spacing.lg }}>
          <h3 style={{ ...typography.h3, marginBottom: spacing.sm }}>No revenue data found</h3>
          <p style={{ ...typography.body, color: colors.text.muted }}>
            No revenue data found for the selected filters. Try adjusting your filters.
          </p>
        </Card>
      )}

      {showDuesModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 10000,
            padding: spacing.xl,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowDuesModal(false)}
        >
          <Card
            variant="elevated"
            padding="lg"
            style={{ width: "min(920px, 100%)", maxHeight: "85vh", overflowY: "auto", background: colors.surface.card }}
            onClick={(e) => e?.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
              <h3 style={{ ...typography.h3, margin: 0 }}>Players with Pending Dues</h3>
              <Button variant="secondary" size="sm" onClick={() => setShowDuesModal(false)}>
                Close
              </Button>
            </div>
            <div className="rv-table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ textAlign: "left", padding: spacing.sm }}>Player Name</th>
                  <th style={{ textAlign: "left", padding: spacing.sm }}>Center</th>
                  <th style={{ textAlign: "left", padding: spacing.sm }}>Programme</th>
                  <th style={{ textAlign: "right", padding: spacing.sm }}>Amount Due</th>
                  <th style={{ textAlign: "left", padding: spacing.sm }}>Last Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {outstandingPlayers.map((row: any) => (
                  <tr key={row.playerId} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: spacing.sm }}>{row.playerName}</td>
                    <td style={{ padding: spacing.sm }}>{row.center}</td>
                    <td style={{ padding: spacing.sm }}>{row.programme}</td>
                    <td style={{ textAlign: "right", padding: spacing.sm }}>₹{INR.format(row.amountDue)}</td>
                    <td style={{ padding: spacing.sm }}>
                      {row.lastPaymentDate ? new Date(row.lastPaymentDate).toLocaleDateString("en-IN") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>
        </div>
      )}
    </motion.main>
  );
};

export default AdminRevenuePage;

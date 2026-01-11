import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import type { ClubEventDTO, ClubEventStatus, ClubEventType, HomeAway } from "../types/calendar";

type FilterKey = "ALL" | ClubEventType;
const IST = "Asia/Kolkata";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function isoDateOnly(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dateKeyInTZ(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function formatMonth(d: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
}

function formatTimeInIST(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: IST, hour: "numeric", minute: "2-digit" }).format(date);
}

function formatDateInIST(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: IST, month: "short", day: "numeric", year: "numeric" }).format(date);
}

function toLocalInputValue(dateISO: string) {
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(v: string) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function typeDot(type: ClubEventType) {
  switch (type) {
    case "MATCH":
      return "rgba(255,169,0,0.95)";
    case "TRAINING":
      return "rgba(0,224,255,0.90)";
    case "TRIAL":
      return "rgba(120,160,255,0.95)";
    case "SEMINAR":
      return "rgba(255,255,255,0.75)";
    case "MEETING":
      return "rgba(255,255,255,0.65)";
    default:
      return "rgba(255,255,255,0.55)";
  }
}

const ScheduleManagementPage: React.FC = () => {
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(() => dateKeyInTZ(new Date(), IST));
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const [events, setEvents] = useState<ClubEventDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    type: "MATCH" as ClubEventType,
    title: "",
    startAtLocal: "",
    endAtLocal: "",
    allDay: false,
    venueName: "",
    venueAddress: "",
    googleMapsUrl: "",
    competition: "",
    opponent: "",
    homeAway: null as HomeAway,
    status: "SCHEDULED" as ClubEventStatus,
    notes: "",
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const moduleIn = useMemo(
    () => ({
      initial: reduce ? { opacity: 0, y: 4 } : { opacity: 0, y: 14, filter: "blur(6px)" },
      animate: reduce
        ? { opacity: 1, y: 0, transition: { duration: 0.25 } }
        : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    }),
    [reduce]
  );

  const loadMonth = async () => {
    try {
      setLoading(true);
      setError("");
      setNotice("");
      const from = startOfMonth(monthCursor).toISOString();
      const to = endOfMonth(monthCursor).toISOString();
      const types = filter === "ALL" ? undefined : filter;
      const data = (await api.getEvents({ from, to, type: types })) as ClubEventDTO[];
      setEvents(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor, filter]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ClubEventDTO[]>();
    for (const e of events) {
      const key = dateKeyInTZ(new Date(e.startAt), IST);
      const list = map.get(key) || [];
      list.push(e);
      map.set(key, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      map.set(k, list);
    }
    return map;
  }, [events]);

  const selectedDayEvents = useMemo(() => eventsByDay.get(selectedDateKey) || [], [eventsByDay, selectedDateKey]);

  const monthGrid = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startWeekday = first.getDay();
    const totalDays = last.getDate();
    const cells: Array<{ key: string; date: Date | null; dayNum?: number }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ key: `pad-${i}`, date: null });
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(y, m, d);
      cells.push({ key: isoDateOnly(date), date, dayNum: d });
    }
    while (cells.length % 7 !== 0) cells.push({ key: `pad-end-${cells.length}`, date: null });
    while (cells.length < 42) cells.push({ key: `pad-last-${cells.length}`, date: null });
    return cells;
  }, [monthCursor]);

  const openCreate = () => {
    setSelectedEventId(null);
    const defaultStart = new Date(`${selectedDateKey}T18:00:00`);
    setDraft((p) => ({
      ...p,
      type: "MATCH",
      title: "",
      startAtLocal: toLocalInputValue(defaultStart.toISOString()),
      endAtLocal: "",
      allDay: false,
      venueName: "",
      venueAddress: "",
      googleMapsUrl: "",
      competition: "",
      opponent: "",
      homeAway: null,
      status: "SCHEDULED",
      notes: "",
    }));
  };

  const openEdit = (ev: ClubEventDTO) => {
    setSelectedEventId(ev.id);
    setDraft({
      type: ev.type,
      title: ev.title,
      startAtLocal: toLocalInputValue(ev.startAt),
      endAtLocal: ev.endAt ? toLocalInputValue(ev.endAt) : "",
      allDay: !!ev.allDay,
      venueName: ev.venueName || "",
      venueAddress: ev.venueAddress || "",
      googleMapsUrl: ev.googleMapsUrl || "",
      competition: ev.competition || "",
      opponent: ev.opponent || "",
      homeAway: (ev.homeAway ?? null) as HomeAway,
      status: ev.status,
      notes: ev.notes || "",
    });
  };

  const save = async () => {
    setNotice("");
    setError("");
    if (!draft.type || !draft.title.trim() || !draft.startAtLocal) {
      setError("Please fill required fields: type, title, startAt");
      return;
    }
    const startAt = fromLocalInputValue(draft.startAtLocal);
    const endAt = draft.endAtLocal ? fromLocalInputValue(draft.endAtLocal) : null;
    if (!startAt) {
      setError("Invalid start time");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        type: draft.type,
        title: draft.title.trim(),
        startAt,
        endAt,
        allDay: draft.allDay,
        venueName: draft.venueName || null,
        venueAddress: draft.venueAddress || null,
        googleMapsUrl: draft.googleMapsUrl || null,
        competition: draft.competition || null,
        opponent: draft.opponent || null,
        homeAway: draft.homeAway,
        status: draft.status,
        notes: draft.notes || null,
      };
      if (selectedEventId) {
        await api.updateEvent(selectedEventId, payload);
        setNotice("Event updated");
      } else {
        await api.createEvent(payload);
        setNotice("Event created");
      }
      await loadMonth();
    } catch (e: any) {
      setError(e?.message || "Failed to save event");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedEventId) return;
    const ok = confirm("Delete this event? This cannot be undone.");
    if (!ok) return;
    try {
      setSaving(true);
      await api.deleteEvent(selectedEventId);
      setSelectedEventId(null);
      setNotice("Event deleted");
      await loadMonth();
      openCreate();
    } catch (e: any) {
      setError(e?.message || "Failed to delete event");
    } finally {
      setSaving(false);
    }
  };

  const seedDemo = async () => {
    if (!isAdmin) return;
    try {
      setSeeding(true);
      setError("");
      setNotice("");
      const res = await api.seedDemoEvents();
      setNotice(res?.message || "Demo fixtures created");
      await loadMonth();
    } catch (e: any) {
      setError(e?.message || "Failed to seed demo fixtures");
    } finally {
      setSeeding(false);
    }
  };

  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const todayKey = dateKeyInTZ(new Date(), IST);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: spacing.md }}>
      <motion.div initial={moduleIn.initial} animate={moduleIn.animate}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap", marginBottom: spacing.lg }}>
          <div>
            <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>Schedule</div>
            <div style={{ ...typography.h2, color: colors.text.primary, margin: 0 }}>Club Calendar</div>
            <div style={{ ...typography.body, color: colors.text.secondary, marginTop: 8 }}>
              Create and manage matchdays, trainings, trials, and events.
            </div>
          </div>

          <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
            {isAdmin ? (
              <Button variant="secondary" onClick={seedDemo} disabled={seeding}>
                {seeding ? "Seeding…" : "Seed Demo Fixtures"}
              </Button>
            ) : null}
            <Button variant="primary" onClick={openCreate}>
              Create new event
            </Button>
          </div>
        </div>

        {error ? (
          <div style={{ marginBottom: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, border: "1px solid rgba(255,80,80,0.25)", background: "rgba(255,80,80,0.06)", color: colors.text.primary }}>
            {error}
          </div>
        ) : null}
        {notice ? (
          <div style={{ marginBottom: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, border: "1px solid rgba(0,224,255,0.22)", background: "rgba(0,224,255,0.06)", color: colors.text.primary }}>
            {notice}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: spacing.lg, alignItems: "start" }}>
          {/* Left: Month calendar */}
          <Card
            variant="glass"
            padding="lg"
            style={{
              borderRadius: borderRadius.xl,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" }}>
              <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
                {formatMonth(monthCursor)}
              </div>
              <div style={{ display: "flex", gap: spacing.sm }}>
                <button
                  type="button"
                  onClick={() => setMonthCursor(startOfMonth(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)))}
                  style={{
                    padding: "8px 10px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: colors.text.secondary,
                    cursor: "pointer",
                  }}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMonthCursor(startOfMonth(new Date()));
                    setSelectedDateKey(dateKeyInTZ(new Date(), IST));
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(0,224,255,0.18)",
                    background: "rgba(0,224,255,0.06)",
                    color: colors.text.primary,
                    cursor: "pointer",
                    ...typography.caption,
                  }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setMonthCursor(startOfMonth(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)))}
                  style={{
                    padding: "8px 10px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: colors.text.secondary,
                    cursor: "pointer",
                  }}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>
            </div>

            <div style={{ marginTop: spacing.md, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["ALL", "MATCH", "TRAINING", "TRIAL", "SEMINAR", "MEETING", "OTHER"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k as any)}
                  style={{
                    borderRadius: borderRadius.full,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: k === filter ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                    color: k === filter ? colors.text.primary : colors.text.muted,
                    padding: "8px 10px",
                    cursor: "pointer",
                    ...typography.caption,
                  }}
                >
                  {k === "ALL" ? "All" : k}
                </button>
              ))}
            </div>

            <div style={{ marginTop: spacing.md, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {weekdayLabels.map((w) => (
                <div key={w} style={{ ...typography.caption, color: colors.text.muted, textAlign: "center", letterSpacing: "0.12em" }}>
                  {w}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {monthGrid.map((cell) => {
                if (!cell.date) return <div key={cell.key} aria-hidden="true" style={{ height: 52 }} />;
                const key = isoDateOnly(cell.date);
                const dayEvents = eventsByDay.get(key) || [];
                const isSelected = key === selectedDateKey;
                const isToday = key === todayKey;
                return (
                  <motion.button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDateKey(key)}
                    whileHover={!reduce ? { y: -2 } : undefined}
                    whileTap={!reduce ? { scale: 0.98 } : undefined}
                    style={{
                      height: 56,
                      borderRadius: 14,
                      border: isSelected
                        ? "1px solid rgba(0,224,255,0.34)"
                        : isToday
                          ? "1px solid rgba(255,169,0,0.22)"
                          : "1px solid rgba(255,255,255,0.10)",
                      background: isSelected
                        ? "rgba(0,224,255,0.08)"
                        : isToday
                          ? "rgba(255,169,0,0.05)"
                          : dayEvents.length
                            ? "rgba(255,255,255,0.04)"
                            : "rgba(255,255,255,0.02)",
                      color: colors.text.primary,
                      cursor: "pointer",
                      padding: "10px 8px",
                      outline: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                    }}
                  >
                    <div style={{ ...typography.body, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, lineHeight: 1 }}>
                      {cell.dayNum}
                    </div>
                    <div style={{ display: "flex", gap: 4, height: 10 }}>
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: typeDot(e.type) }} />
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div style={{ marginTop: spacing.md }}>
              <div style={{ ...typography.caption, color: colors.text.muted, marginBottom: 8 }}>Events on {selectedDateKey}</div>
              {loading ? (
                <div style={{ ...typography.body, color: colors.text.muted }}>Loading…</div>
              ) : selectedDayEvents.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedDayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => openEdit(ev)}
                      style={{
                        textAlign: "left",
                        width: "100%",
                        borderRadius: borderRadius.lg,
                        border: ev.id === selectedEventId ? "1px solid rgba(0,224,255,0.30)" : "1px solid rgba(255,255,255,0.10)",
                        background: "rgba(255,255,255,0.03)",
                        padding: "10px 12px",
                        cursor: "pointer",
                        outline: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ ...typography.caption, color: colors.accent.main }}>{ev.type} • {formatTimeInIST(new Date(ev.startAt))}</div>
                        <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ev.title}
                        </div>
                      </div>
                      <div style={{ ...typography.caption, color: colors.text.muted, whiteSpace: "nowrap" }}>{ev.status}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ ...typography.body, color: colors.text.muted }}>No events on this day.</div>
              )}
            </div>
          </Card>

          {/* Right: Event editor */}
          <Card
            variant="glass"
            padding="lg"
            style={{
              borderRadius: borderRadius.xl,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap" }}>
              <div>
                <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em", marginBottom: 6 }}>
                  {selectedEventId ? "Edit Event" : "Create Event"}
                </div>
                <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>
                  {selectedEventId ? "Update details" : "New event details"}
                </div>
              </div>
              {selectedEventId ? (
                <Button variant="secondary" onClick={remove} disabled={saving}>
                  Delete
                </Button>
              ) : null}
            </div>

            <div style={{ marginTop: spacing.md, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: spacing.md }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Type *</span>
                <select
                  value={draft.type}
                  onChange={(e) => setDraft((p) => ({ ...p, type: e.target.value as ClubEventType }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                >
                  {(["MATCH", "TRAINING", "TRIAL", "SEMINAR", "MEETING", "OTHER"] as ClubEventType[]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Status</span>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ClubEventStatus }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                >
                  {(["SCHEDULED", "CONFIRMED", "POSTPONED", "CANCELLED", "COMPLETED"] as ClubEventStatus[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Title *</span>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder='e.g., "FC Real Bengaluru vs Bangalore Rangers"'
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Start *</span>
                <input
                  type="datetime-local"
                  value={draft.startAtLocal}
                  onChange={(e) => setDraft((p) => ({ ...p, startAtLocal: e.target.value }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>End</span>
                <input
                  type="datetime-local"
                  value={draft.endAtLocal}
                  onChange={(e) => setDraft((p) => ({ ...p, endAtLocal: e.target.value }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Opponent</span>
                <input
                  value={draft.opponent}
                  onChange={(e) => setDraft((p) => ({ ...p, opponent: e.target.value }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Competition</span>
                <input
                  value={draft.competition}
                  onChange={(e) => setDraft((p) => ({ ...p, competition: e.target.value }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Venue name</span>
                <input
                  value={draft.venueName}
                  onChange={(e) => setDraft((p) => ({ ...p, venueName: e.target.value }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Home/Away</span>
                <select
                  value={draft.homeAway || ""}
                  onChange={(e) => setDraft((p) => ({ ...p, homeAway: (e.target.value ? (e.target.value as any) : null) }))}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                  }}
                >
                  <option value="">—</option>
                  <option value="HOME">HOME</option>
                  <option value="AWAY">AWAY</option>
                </select>
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
                <span style={{ ...typography.caption, color: colors.text.muted }}>Notes</span>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
                  rows={4}
                  style={{
                    padding: "10px 12px",
                    borderRadius: borderRadius.lg,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,32,0.35)",
                    color: colors.text.primary,
                    resize: "vertical",
                  }}
                />
              </label>
            </div>

            <div style={{ marginTop: spacing.lg, display: "flex", gap: spacing.sm, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button variant="secondary" onClick={loadMonth} disabled={loading}>
                Refresh
              </Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>

            <div style={{ marginTop: spacing.md, ...typography.caption, color: colors.text.muted }}>
              Times are saved in your local timezone; the public site displays in {IST}.
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleManagementPage;



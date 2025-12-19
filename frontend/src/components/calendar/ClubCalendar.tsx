import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { api } from "../../api/client";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { heroCTAPillStyles } from "../../theme/hero-design-patterns";
import { Button } from "../ui/Button";
import { ArrowRightIcon } from "../icons/IconSet";
import type { ClubEventDTO, ClubEventType } from "../../types/calendar";
import { galleryAssets } from "../../config/assets";

interface PublicFixture {
  id: number;
  opponent: string;
  matchDate: string;
  matchTime: string;
  venue: string;
  matchType: string;
  status: string;
  center: string;
  score?: string | null;
}

type FilterKey = "ALL" | "MATCH" | "TRAINING" | "TRIAL" | "EVENTS";
const IST = "Asia/Kolkata";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function isoDateOnly(d: Date) {
  // YYYY-MM-DD using local date (fine because we map display via IST separately)
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

function formatDateLongInIST(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: IST, month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatTimeInIST(date: Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: IST, hour: "numeric", minute: "2-digit" }).format(date);
}

function typeAccent(type: ClubEventType) {
  switch (type) {
    case "MATCH":
      return { dot: "rgba(255,169,0,0.95)", bg: "rgba(255,169,0,0.10)", border: "rgba(255,169,0,0.22)" };
    case "TRAINING":
      return { dot: "rgba(0,224,255,0.90)", bg: "rgba(0,224,255,0.10)", border: "rgba(0,224,255,0.22)" };
    case "TRIAL":
      return { dot: "rgba(120,160,255,0.95)", bg: "rgba(120,160,255,0.10)", border: "rgba(120,160,255,0.20)" };
    default:
      return { dot: "rgba(255,255,255,0.70)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.14)" };
  }
}

function filterMatches(filter: FilterKey, e: ClubEventDTO) {
  if (filter === "ALL") return true;
  if (filter === "EVENTS") return e.type !== "MATCH" && e.type !== "TRAINING" && e.type !== "TRIAL";
  return e.type === filter;
}

export const ClubCalendar: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const reduce = useReducedMotion();
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(() => dateKeyInTZ(new Date(), IST));
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const [events, setEvents] = useState<ClubEventDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestResult, setLatestResult] = useState<PublicFixture | null>(null);
  const [fixturesLoading, setFixturesLoading] = useState(false);

  const gridRef = useRef<HTMLDivElement | null>(null);

  const moduleIn = useMemo(
    () => ({
      hidden: reduce ? { opacity: 0, y: 4 } : { opacity: 0, y: 14, filter: "blur(6px)" },
      show: reduce
        ? { opacity: 1, y: 0, transition: { duration: 0.25 } }
        : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as any } },
    }),
    [reduce]
  );

  // Generate comprehensive dummy data for testing
  const generateDummyEvents = (month: Date): ClubEventDTO[] => {
    const dummy: ClubEventDTO[] = [];
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const now = new Date();
    
    const opponents = ["Bangalore Rangers", "Mysore United", "Mangalore FC", "Hubli Warriors", "Belagavi Strikers", "Shimoga City FC", "Davangere Dynamos"];
    const venues = ["3Lok Football Fitness Hub", "FCRB Training Ground", "KSFA Stadium", "Bangalore Football Arena", "City Sports Complex"];
    const competitions = ["KSFA Super Division", "KSFA C Division", "KSFA D Division", "Friendly", "Cup Match"];
    
    // Add matches (2-3 per week)
    for (let week = 0; week < 4; week++) {
      const matchDay = new Date(year, monthNum, 2 + week * 7 + Math.floor(Math.random() * 3));
      if (matchDay.getMonth() === monthNum) {
        dummy.push({
          id: `match-${week}`,
          type: "MATCH",
          title: `vs ${opponents[week % opponents.length]}`,
          startAt: new Date(matchDay.getFullYear(), matchDay.getMonth(), matchDay.getDate(), 18, 0).toISOString(),
          endAt: new Date(matchDay.getFullYear(), matchDay.getMonth(), matchDay.getDate(), 20, 0).toISOString(),
          allDay: false,
          venueName: venues[week % venues.length],
          competition: competitions[week % competitions.length],
          opponent: opponents[week % opponents.length],
          homeAway: week % 2 === 0 ? "HOME" : "AWAY",
          status: matchDay < now ? "COMPLETED" : "CONFIRMED",
          createdByUserId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    // Add training sessions (3-4 per week)
    for (let week = 0; week < 4; week++) {
      for (let day = 0; day < 3; day++) {
        const trainingDay = new Date(year, monthNum, 1 + week * 7 + day * 2 + 1);
        if (trainingDay.getMonth() === monthNum && trainingDay <= endOfMonth(month)) {
          dummy.push({
            id: `training-${week}-${day}`,
            type: "TRAINING",
            title: "Senior Squad Training",
            startAt: new Date(trainingDay.getFullYear(), trainingDay.getMonth(), trainingDay.getDate(), 17, 0).toISOString(),
            endAt: new Date(trainingDay.getFullYear(), trainingDay.getMonth(), trainingDay.getDate(), 19, 0).toISOString(),
            allDay: false,
            venueName: venues[0],
            status: trainingDay < now ? "COMPLETED" : "CONFIRMED",
            createdByUserId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
    
    // Add youth training (2 per week)
    for (let week = 0; week < 4; week++) {
      const youthDay = new Date(year, monthNum, 3 + week * 7);
      if (youthDay.getMonth() === monthNum) {
        dummy.push({
          id: `youth-${week}`,
          type: "TRAINING",
          title: "Youth Academy Training",
          startAt: new Date(youthDay.getFullYear(), youthDay.getMonth(), youthDay.getDate(), 16, 0).toISOString(),
          endAt: new Date(youthDay.getFullYear(), youthDay.getMonth(), youthDay.getDate(), 18, 0).toISOString(),
          allDay: false,
          venueName: venues[1],
          status: youthDay < now ? "COMPLETED" : "CONFIRMED",
          createdByUserId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    // Add trials (1-2 per month)
    for (let i = 0; i < 2; i++) {
      const trialDay = new Date(year, monthNum, 8 + i * 10);
      if (trialDay.getMonth() === monthNum) {
        dummy.push({
          id: `trial-${i}`,
          type: "TRIAL",
          title: "Open Trial Session",
          startAt: new Date(trialDay.getFullYear(), trialDay.getMonth(), trialDay.getDate(), 10, 0).toISOString(),
          endAt: new Date(trialDay.getFullYear(), trialDay.getMonth(), trialDay.getDate(), 12, 0).toISOString(),
          allDay: false,
          venueName: venues[0],
          status: trialDay < now ? "COMPLETED" : "CONFIRMED",
          createdByUserId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    // Add other events (seminars, meetings)
    const eventDay = new Date(year, monthNum, 15);
    if (eventDay.getMonth() === monthNum) {
      dummy.push({
        id: "seminar-1",
        type: "SEMINAR",
        title: "Coaching Workshop",
        startAt: new Date(eventDay.getFullYear(), eventDay.getMonth(), eventDay.getDate(), 14, 0).toISOString(),
        endAt: new Date(eventDay.getFullYear(), eventDay.getMonth(), eventDay.getDate(), 16, 0).toISOString(),
        allDay: false,
        venueName: venues[2],
        status: "CONFIRMED",
        createdByUserId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    return dummy.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const from = startOfMonth(monthCursor).toISOString();
        const to = endOfMonth(monthCursor).toISOString();
        const data = (await api.getEvents({ from, to })) as ClubEventDTO[];
        if (!cancelled) {
          // Use dummy data if API returns empty or for testing
          const finalData = Array.isArray(data) && data.length > 0 ? data : generateDummyEvents(monthCursor);
          setEvents(finalData);
        }
      } catch (e: any) {
        if (!cancelled) {
          // On error, use dummy data for testing
          setEvents(generateDummyEvents(monthCursor));
          setError("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [monthCursor]);

  // Fetch latest result from fixtures
  useEffect(() => {
    let cancelled = false;
    const loadFixtures = async () => {
      try {
        setFixturesLoading(true);
        const data = await api.getPublicFixtures();
        const results = (data.results || []) as PublicFixture[];
        if (!cancelled && results.length > 0) {
          setLatestResult(results[0]);
        } else if (!cancelled) {
          // Fallback dummy data
          setLatestResult({
            id: 0,
            opponent: "Bangalore Rangers",
            matchDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            matchTime: "18:00",
            venue: "3Lok Football Fitness Hub",
            matchType: "League",
            status: "COMPLETED",
            center: "FCRB",
            score: "3-1",
          });
        }
      } catch (error) {
        console.error("Failed to load fixtures:", error);
        if (!cancelled) {
          // Fallback dummy data on error
          setLatestResult({
            id: 0,
            opponent: "Bangalore Rangers",
            matchDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            matchTime: "18:00",
            venue: "3Lok Football Fitness Hub",
            matchType: "League",
            status: "COMPLETED",
            center: "FCRB",
            score: "3-1",
          });
        }
      } finally {
        if (!cancelled) setFixturesLoading(false);
      }
    };
    loadFixtures();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleEvents = useMemo(() => events.filter((e) => filterMatches(filter, e)), [events, filter]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ClubEventDTO[]>();
    for (const e of visibleEvents) {
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
  }, [visibleEvents]);

  const selectedEvents = useMemo(() => eventsByDay.get(selectedDateKey) || [], [eventsByDay, selectedDateKey]);

  const upcoming = useMemo(() => {
    const now = new Date();
    const start = now.getTime();
    return visibleEvents
      .filter((e) => new Date(e.startAt).getTime() >= start)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, 6);
  }, [visibleEvents]);

  const nextMatch = useMemo(() => upcoming.find((e) => e.type === "MATCH") || null, [upcoming]);

  const monthGrid = useMemo(() => {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const startWeekday = first.getDay(); // Sun=0
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

  const todayKey = useMemo(() => dateKeyInTZ(new Date(), IST), []);

  const handleSelect = (key: string) => {
    setSelectedDateKey(key);
  };

  const jumpToToday = () => {
    setMonthCursor(startOfMonth(new Date()));
    setSelectedDateKey(dateKeyInTZ(new Date(), IST));
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    e.preventDefault();

    const current = new Date(`${selectedDateKey}T00:00:00`);
    if (Number.isNaN(current.getTime())) return;
    const delta = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" ? -7 : e.key === "ArrowDown" ? 7 : 0;

    let next = new Date(current);
    if (e.key === "Home") next = new Date(current.getFullYear(), current.getMonth(), 1);
    else if (e.key === "End") next = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    else next.setDate(next.getDate() + delta);

    const nextKey = isoDateOnly(next);
    setSelectedDateKey(nextKey);
    // move month cursor if crossing months
    if (next.getFullYear() !== monthCursor.getFullYear() || next.getMonth() !== monthCursor.getMonth()) {
      setMonthCursor(startOfMonth(next));
    }
  };

  const DayDots: React.FC<{ items: ClubEventDTO[] }> = ({ items }) => {
    const dots = items.slice(0, 3);
    return (
      <div style={{ display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}>
        {dots.map((d, idx) => {
          const acc = typeAccent(d.type);
          return (
            <motion.span
              key={d.id}
              aria-hidden="true"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: acc.dot,
                boxShadow: `0 0 0 2px rgba(255,255,255,0.06), 0 0 8px ${acc.dot}40`,
                border: `1px solid ${acc.border}`,
              }}
            />
          );
        })}
        {items.length > 3 && (
          <span
            aria-hidden="true"
            style={{
              ...typography.caption,
              fontSize: 8,
              color: colors.text.muted,
              marginLeft: 2,
              fontWeight: typography.fontWeight.bold,
            }}
          >
            +{items.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: spacing.lg }}>
      {/* Left: Matchday Drawer / Timeline */}
      <div
        style={{
          borderRadius: borderRadius.xl,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "linear-gradient(135deg, rgba(10,16,32,0.45) 0%, rgba(15,23,42,0.35) 100%)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 15%, rgba(0,224,255,0.14) 0%, transparent 55%), radial-gradient(circle at 85% 80%, rgba(255,169,0,0.12) 0%, transparent 60%)",
            opacity: 0.95,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Header art strip - Enhanced */}
          <div
            style={{
              position: "relative",
              height: isMobile ? 110 : 130,
              overflow: "hidden",
              padding: spacing.lg,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${galleryAssets.actionShots[1]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.22,
                filter: "blur(12px)",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(5,11,32,0.85) 0%, rgba(5,11,32,0.60) 45%, rgba(5,11,32,0.90) 100%)",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 20% 20%, rgba(0,224,255,0.12) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(255,169,0,0.10) 0%, transparent 60%)",
                opacity: 0.8,
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
              <div>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.16em", marginBottom: 6, fontWeight: typography.fontWeight.semibold }}>CLUB CALENDAR</div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, fontSize: isMobile ? typography.fontSize.xl : typography.fontSize["2xl"], fontWeight: typography.fontWeight.bold }}>Schedule • Matchdays</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...typography.body, color: colors.text.secondary, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>{formatDateLongInIST(new Date())}</div>
                <div style={{ ...typography.caption, color: colors.text.muted, marginTop: 2 }}>Updates weekly</div>
              </div>
            </div>
          </div>

          <div style={{ padding: spacing.md, display: "flex", flexDirection: "column", gap: spacing.md }}>
            {/* Latest Result Card - Enhanced with better styling */}
            <motion.div variants={moduleIn} initial="hidden" animate="show">
              <div
                style={{
                  borderRadius: borderRadius.xl,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "linear-gradient(135deg, rgba(10,16,32,0.45) 0%, rgba(15,23,42,0.35) 100%)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 18px 48px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05) inset",
                  padding: isMobile ? spacing.md : spacing.lg,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: isMobile ? undefined : 280,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Enhanced background gradient */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 20% 20%, rgba(255,169,0,0.16) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(0,224,255,0.12) 0%, transparent 60%)",
                    opacity: 0.95,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                />
                
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", justifyContent: "space-between", gap: isMobile ? 12 : 16, marginBottom: spacing.md }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.12em", fontSize: 11, marginBottom: 6, fontWeight: typography.fontWeight.semibold }}>NEXT STEPS</div>
                      <div style={{ ...typography.h3, color: colors.text.primary, fontSize: 22, margin: 0, lineHeight: 1.2, fontWeight: typography.fontWeight.bold }}>Latest Result</div>
                    </div>
                  </div>

                  {/* LatestResultCard - Enhanced */}
                  <div style={{ flex: 1, display: "flex" }}>
                    <div
                      style={{
                        flex: 1,
                        alignSelf: "stretch",
                        borderRadius: borderRadius.xl,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "linear-gradient(135deg, rgba(20,31,58,0.50) 0%, rgba(15,23,42,0.40) 100%)",
                        padding: spacing.md,
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(circle at 25% 25%, rgba(255,169,0,0.18) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,224,255,0.14) 0%, transparent 60%)",
                          opacity: 0.9,
                        }}
                      />

                      {latestResult ? (
                        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                          <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.16em", fontSize: 10, fontWeight: typography.fontWeight.semibold, textTransform: "uppercase" }}>LATEST RESULT</div>

                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  ...typography.body,
                                  color: colors.text.primary,
                                  fontWeight: typography.fontWeight.bold,
                                  fontSize: typography.fontSize.base,
                                  lineHeight: 1.3,
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  marginBottom: 6,
                                }}
                              >
                                FC Real Bengaluru vs {latestResult.opponent}
                              </div>
                              <div style={{ ...typography.caption, color: colors.text.secondary, fontSize: typography.fontSize.xs, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span>{latestResult.matchType || "Match"}</span>
                                <span style={{ color: colors.text.muted }}>•</span>
                                <span>{latestResult.venue || "TBA"}</span>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                              <motion.div
                                whileHover={!reduce ? { scale: 1.1 } : undefined}
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: borderRadius.full,
                                  border: "1px solid rgba(255,169,0,0.35)",
                                  background: "linear-gradient(135deg, rgba(255,169,0,0.15) 0%, rgba(255,169,0,0.08) 100%)",
                                  color: colors.accent.main,
                                  ...typography.body,
                                  fontWeight: typography.fontWeight.bold,
                                  fontSize: typography.fontSize.sm,
                                  boxShadow: "0 4px 12px rgba(255,169,0,0.20)",
                                }}
                              >
                                W
                              </motion.div>
                              <motion.div
                                whileHover={!reduce ? { scale: 1.05 } : undefined}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: borderRadius.full,
                                  border: "1px solid rgba(0,224,255,0.35)",
                                  background: "linear-gradient(135deg, rgba(0,224,255,0.15) 0%, rgba(0,224,255,0.08) 100%)",
                                  color: colors.primary.light,
                                  ...typography.body,
                                  fontSize: typography.fontSize.base,
                                  fontWeight: typography.fontWeight.bold,
                                  letterSpacing: "0.08em",
                                  boxShadow: "0 4px 12px rgba(0,224,255,0.20)",
                                }}
                              >
                                {latestResult.score || "—"}
                              </motion.div>
                            </div>
                          </div>

                          {/* Enhanced CTA */}
                          <div style={{ marginTop: "auto" }}>
                            <Link to="/fixtures" style={{ textDecoration: "none" }}>
                              <motion.div
                                whileHover={!reduce ? { y: -2 } : undefined}
                                whileTap={!reduce ? { scale: 0.98 } : undefined}
                                style={{
                                  ...heroCTAPillStyles.base,
                                  ...heroCTAPillStyles.gold,
                                  width: isMobile ? "100%" : "auto",
                                  justifyContent: "center",
                                }}
                              >
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                                  View Fixtures <ArrowRightIcon size={16} style={{ color: colors.accent.main }} />
                                </span>
                              </motion.div>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div style={{ position: "relative", zIndex: 1, ...typography.body, color: colors.text.muted, fontSize: typography.fontSize.sm, textAlign: "center", padding: spacing.lg }}>
                          {fixturesLoading ? "Loading last result…" : "No recent results"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Next match mini strip - Enhanced */}
            {nextMatch ? (
              <motion.div variants={moduleIn} initial="hidden" animate="show">
                <motion.div
                  whileHover={!reduce ? { scale: 1.01, y: -1 } : undefined}
                  style={{
                    borderRadius: borderRadius.xl,
                    border: "1px solid rgba(255,169,0,0.25)",
                    background: "linear-gradient(135deg, rgba(255,169,0,0.12) 0%, rgba(255,169,0,0.06) 100%)",
                    padding: spacing.md,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                    boxShadow: "0 8px 24px rgba(255,169,0,0.15), 0 0 0 1px rgba(255,169,0,0.10) inset",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const key = dateKeyInTZ(new Date(nextMatch.startAt), IST);
                    setMonthCursor(startOfMonth(new Date(nextMatch.startAt)));
                    setSelectedDateKey(key);
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ ...typography.caption, color: colors.accent.main, letterSpacing: "0.14em", marginBottom: 4, fontWeight: typography.fontWeight.semibold, fontSize: 10 }}>NEXT MATCH</div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                        fontSize: typography.fontSize.base,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        marginBottom: 4,
                      }}
                    >
                      {nextMatch.title}
                    </div>
                    <div style={{ ...typography.caption, color: colors.text.secondary, fontSize: typography.fontSize.xs, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span>{formatDateLongInIST(new Date(nextMatch.startAt))}</span>
                      <span style={{ color: colors.text.muted }}>•</span>
                      <span>{formatTimeInIST(new Date(nextMatch.startAt))}</span>
                      <span style={{ color: colors.text.muted }}>•</span>
                      <span>{nextMatch.venueName || "TBA"}</span>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={!reduce ? { scale: 1.05 } : undefined}
                    whileTap={!reduce ? { scale: 0.95 } : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      const key = dateKeyInTZ(new Date(nextMatch.startAt), IST);
                      setMonthCursor(startOfMonth(new Date(nextMatch.startAt)));
                      setSelectedDateKey(key);
                    }}
                    style={{
                      ...heroCTAPillStyles.base,
                      ...heroCTAPillStyles.gold,
                      padding: "10px 16px",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      View details <ArrowRightIcon size={16} style={{ color: colors.accent.main }} />
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : null}

            {/* Drawer content - Enhanced */}
            <div
              style={{
                borderRadius: borderRadius.xl,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "linear-gradient(135deg, rgba(10,16,32,0.50) 0%, rgba(15,23,42,0.40) 100%)",
                backdropFilter: "blur(12px)",
                padding: spacing.lg,
                boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
              }}
            >
              {loading ? (
                <div style={{ ...typography.body, color: colors.text.muted }}>Loading schedule…</div>
              ) : error ? (
                <div style={{ ...typography.body, color: colors.text.muted }}>{error}</div>
              ) : events.length === 0 ? (
                <div style={{ ...typography.body, color: colors.text.muted, lineHeight: 1.6 }}>
                  No fixtures yet — check back soon.
                  <div style={{ marginTop: 10, ...typography.caption, color: colors.text.muted, opacity: 0.85 }}>
                    Season calendar updates weekly.
                  </div>
                </div>
              ) : selectedEvents.length ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`selected-${selectedDateKey}-${filter}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md }}>
                      <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.10em" }}>MATCHDAY DETAILS</div>
                      <div style={{ ...typography.caption, color: colors.text.secondary }}>{selectedDateKey}</div>
                    </div>
                    {selectedEvents.slice(0, 3).map((ev, idx) => {
                      const acc = typeAccent(ev.type);
                      return (
                        <motion.div
                          key={ev.id}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                          whileHover={!reduce ? { y: -2, scale: 1.01 } : undefined}
                          style={{
                            borderRadius: borderRadius.xl,
                            border: `1px solid ${acc.border}`,
                            background: `linear-gradient(135deg, ${acc.bg} 0%, ${acc.bg.replace("0.10", "0.06")} 100%)`,
                            padding: spacing.md,
                            boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px ${acc.border.replace("0.22", "0.08")} inset`,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                            <div style={{ 
                              ...typography.caption, 
                              color: acc.dot, 
                              letterSpacing: "0.12em", 
                              fontSize: 10,
                              fontWeight: typography.fontWeight.bold,
                              textTransform: "uppercase",
                            }}>
                              {ev.type}
                            </div>
                            <div style={{ 
                              ...typography.body, 
                              color: colors.text.secondary, 
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.semibold,
                            }}>
                              {formatTimeInIST(new Date(ev.startAt))}
                            </div>
                          </div>
                          <div
                            style={{
                              ...typography.body,
                              color: colors.text.primary,
                              fontWeight: typography.fontWeight.bold,
                              marginBottom: 8,
                              lineHeight: 1.3,
                              fontSize: typography.fontSize.base,
                            }}
                          >
                            {ev.title}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", ...typography.caption, color: colors.text.secondary, fontSize: typography.fontSize.xs }}>
                            {ev.competition && <span style={{ padding: "2px 8px", borderRadius: borderRadius.full, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>{ev.competition}</span>}
                            {ev.venueName && <span>{ev.venueName}</span>}
                            <span style={{ color: colors.text.muted, fontSize: 9 }}>{ev.status}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                    {selectedEvents.length > 3 ? (
                      <div style={{ ...typography.caption, color: colors.text.muted }}>+{selectedEvents.length - 3} more on this day</div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`upcoming-${filter}`}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.10em" }}>UPCOMING MATCHDAYS</div>
                    {upcoming.slice(0, 6).map((ev, idx) => {
                      const acc = typeAccent(ev.type);
                      return (
                        <motion.button
                          key={ev.id}
                          type="button"
                          initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.04 }}
                          whileHover={!reduce ? { x: 4, scale: 1.01 } : undefined}
                          whileTap={!reduce ? { scale: 0.98 } : undefined}
                          onClick={() => {
                            const key = dateKeyInTZ(new Date(ev.startAt), IST);
                            setSelectedDateKey(key);
                            setMonthCursor(startOfMonth(new Date(ev.startAt)));
                          }}
                          style={{
                            textAlign: "left",
                            width: "100%",
                            borderRadius: borderRadius.xl,
                            border: `1px solid ${acc.border}`,
                            background: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
                            padding: spacing.md,
                            cursor: "pointer",
                            outline: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                            <div style={{ 
                              ...typography.caption, 
                              color: acc.dot, 
                              fontWeight: typography.fontWeight.bold,
                              fontSize: 10,
                              letterSpacing: "0.10em",
                              textTransform: "uppercase",
                            }}>
                              {ev.type}
                            </div>
                            <div style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.xs }}>{formatDateLongInIST(new Date(ev.startAt))}</div>
                          </div>
                          <div
                            style={{
                              ...typography.body,
                              color: colors.text.primary,
                              fontWeight: typography.fontWeight.bold,
                              marginBottom: 4,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize: typography.fontSize.sm,
                            }}
                          >
                            {ev.title}
                          </div>
                          <div style={{ ...typography.caption, color: colors.text.secondary, fontSize: typography.fontSize.xs, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{formatTimeInIST(new Date(ev.startAt))}</span>
                            <span style={{ color: colors.text.muted }}>•</span>
                            <span>{ev.venueName || "TBA"}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: borderRadius.full,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                  ...typography.caption,
                  color: colors.text.muted,
                }}
              >
                Tip: Use filters + click a day for details
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Calendar grid */}
      <div
        style={{
          borderRadius: borderRadius.xl,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "linear-gradient(135deg, rgba(10,16,32,0.45) 0%, rgba(15,23,42,0.35) 50%, rgba(10,16,32,0.45) 100%)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Enhanced background gradient */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 25% 20%, rgba(0,224,255,0.12) 0%, transparent 55%), radial-gradient(circle at 75% 80%, rgba(255,169,0,0.10) 0%, transparent 60%)",
            opacity: 0.9,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ padding: spacing.lg, paddingBottom: spacing.md, display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md, flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ ...typography.h4, color: colors.text.primary, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl }}>
            {formatMonth(monthCursor)}
          </div>
          <div style={{ display: "flex", gap: spacing.sm, alignItems: "center" }}>
            <motion.button
              type="button"
              whileTap={reduce ? undefined : { scale: 0.98 }}
              onClick={() => setMonthCursor(startOfMonth(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1)))}
              style={{
                ...heroCTAPillStyles.base,
                border: "1px solid rgba(255,255,255,0.14)",
                color: colors.text.secondary,
                padding: "8px 12px",
              }}
              aria-label="Previous month"
            >
              ‹
            </motion.button>
            <motion.button
              type="button"
              whileTap={reduce ? undefined : { scale: 0.98 }}
              onClick={jumpToToday}
              style={{
                ...heroCTAPillStyles.base,
                ...heroCTAPillStyles.gold,
                padding: "8px 12px",
              }}
            >
              Today
            </motion.button>
            <motion.button
              type="button"
              whileTap={reduce ? undefined : { scale: 0.98 }}
              onClick={() => setMonthCursor(startOfMonth(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1)))}
              style={{
                ...heroCTAPillStyles.base,
                border: "1px solid rgba(255,255,255,0.14)",
                color: colors.text.secondary,
                padding: "8px 12px",
              }}
              aria-label="Next month"
            >
              ›
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: `0 ${spacing.lg}px ${spacing.md}px`, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(
            [
              { k: "ALL" as const, label: "All" },
              { k: "MATCH" as const, label: "Matches" },
              { k: "TRAINING" as const, label: "Trainings" },
              { k: "TRIAL" as const, label: "Trials" },
              { k: "EVENTS" as const, label: "Events" },
            ] as const
          ).map((f) => (
            <motion.button
              key={f.k}
              type="button"
              onClick={() => setFilter(f.k)}
              whileHover={!reduce ? { y: -2 } : undefined}
              whileTap={!reduce ? { scale: 0.98 } : undefined}
              style={{
                ...heroCTAPillStyles.base,
                padding: "10px 14px",
                boxShadow: "none",
                border:
                  f.k === filter ? `2px solid ${colors.accent.main}` : "1px solid rgba(255,255,255,0.14)",
                background: f.k === filter ? "rgba(245,179,0,0.08)" : "rgba(255,255,255,0.03)",
                color: f.k === filter ? colors.text.primary : colors.text.muted,
              }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        <div style={{ padding: spacing.lg, paddingTop: spacing.md }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, marginBottom: 12, paddingBottom: spacing.sm, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((w) => (
              <div key={w} style={{ ...typography.caption, color: colors.text.secondary, textAlign: "center", letterSpacing: "0.14em", fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.xs }}>
                {w}
              </div>
            ))}
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-label="Club calendar month view"
            tabIndex={0}
            onKeyDown={handleKeyNav}
            style={{
              outline: "none",
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 10,
            }}
          >
            {monthGrid.map((cell) => {
              if (!cell.date) {
                return <div key={cell.key} aria-hidden="true" style={{ height: 64 }} />;
              }

              const key = isoDateOnly(cell.date);
              const dayEvents = eventsByDay.get(key) || [];
              const isSelected = key === selectedDateKey;
              const isToday = key === todayKey;
              const hasEvents = dayEvents.length > 0;
              const matchCount = dayEvents.filter(e => e.type === "MATCH").length;
              const trainingCount = dayEvents.filter(e => e.type === "TRAINING").length;

              return (
                <motion.button
                  key={cell.key}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${formatDateLongInIST(cell.date)}${hasEvents ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                  onClick={() => handleSelect(key)}
                  whileHover={!reduce ? { 
                    y: -3, 
                    scale: 1.02,
                    boxShadow: isSelected 
                      ? "0 0 0 2px rgba(0,224,255,0.24), 0 8px 24px rgba(0,224,255,0.15), 0 16px 40px rgba(0,0,0,0.45)" 
                      : isToday
                        ? "0 0 0 2px rgba(255,169,0,0.20), 0 8px 24px rgba(255,169,0,0.12), 0 16px 40px rgba(0,0,0,0.45)"
                        : "0 0 0 1px rgba(255,255,255,0.16), 0 8px 24px rgba(0,0,0,0.35)"
                  } : undefined}
                  whileTap={!reduce ? { scale: 0.96 } : undefined}
                  style={{
                    height: 64,
                    borderRadius: borderRadius.lg,
                    border: isSelected
                      ? "2px solid rgba(0,224,255,0.40)"
                      : isToday
                        ? "2px solid rgba(255,169,0,0.30)"
                        : hasEvents
                          ? "1px solid rgba(255,255,255,0.14)"
                          : "1px solid rgba(255,255,255,0.08)",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(0,224,255,0.12) 0%, rgba(0,224,255,0.06) 100%)"
                      : isToday
                        ? "linear-gradient(135deg, rgba(255,169,0,0.08) 0%, rgba(255,169,0,0.04) 100%)"
                        : hasEvents
                          ? "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)"
                          : "rgba(255,255,255,0.02)",
                    color: isSelected ? colors.text.primary : isToday ? colors.accent.main : colors.text.primary,
                    cursor: "pointer",
                    padding: "12px 8px",
                    outline: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    position: "relative",
                    boxShadow: isSelected 
                      ? "0 4px 16px rgba(0,224,255,0.20), 0 0 0 1px rgba(0,224,255,0.10) inset" 
                      : isToday
                        ? "0 4px 16px rgba(255,169,0,0.15), 0 0 0 1px rgba(255,169,0,0.08) inset"
                        : hasEvents
                          ? "0 2px 8px rgba(0,0,0,0.25)"
                          : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Today indicator dot */}
                  {isToday && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: colors.accent.main,
                        boxShadow: `0 0 8px ${colors.accent.main}60`,
                      }}
                    />
                  )}
                  
                  <div style={{ 
                    ...typography.body, 
                    fontSize: typography.fontSize.base, 
                    fontWeight: isSelected || isToday ? typography.fontWeight.bold : typography.fontWeight.semibold, 
                    lineHeight: 1,
                    color: isSelected ? colors.primary.light : isToday ? colors.accent.main : colors.text.primary,
                  }}>
                    {cell.dayNum}
                  </div>
                  {hasEvents ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
                      <DayDots items={dayEvents} />
                      {matchCount > 0 && (
                        <div style={{ 
                          ...typography.caption, 
                          fontSize: 9, 
                          color: colors.accent.main, 
                          fontWeight: typography.fontWeight.bold,
                          letterSpacing: "0.05em",
                        }}>
                          {matchCount}M
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ height: 16 }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ClubCalendar;



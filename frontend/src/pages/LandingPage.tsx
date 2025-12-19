import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { heroCTAStyles, heroTypography, programCardOverlay } from "../theme/hero-design-patterns";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { api } from "../api/client";
import { clubInfo, teams } from "../data/club";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  TwitterIcon,
  YouTubeIcon,
  PhoneIcon,
  EmailIcon,
  LocationIcon,
  ArrowRightIcon,
  FootballIcon,
  DumbbellIcon,
  TrophyIcon,
  ChartBarIcon,
  FireIcon,
  MedalIcon,
  CheckIcon,
  StarIcon,
} from "../components/icons/IconSet";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { useHeroParallax } from "../hooks/useParallaxMotion";
import SupportCelebrateBelongSection from "../components/home/SupportCelebrateBelongSection";
import GalleryUpdatesModule from "../components/home/GalleryUpdatesModule";
import ClubCalendarModule from "../components/calendar/ClubCalendar"; // Default export
// FanClubBenefitsSection moved to FanClubBenefitsPreviewPage - removed from homepage
import { FanClubTeaserSection } from "../components/home/FanClubTeaserSection";
import { 
  heroAssets, 
  matchAssets, 
  galleryAssets, 
  academyAssets, 
  centresAssets, 
  shopAssets, 
  brochureAssets, 
  newsAssets,
  miscAssets,
  clubAssets,
  realverseAssets,
  trophyAssets,
  getGalleryImage, 
  getNewsImage 
} from "../config/assets";
import { homepageAssets } from "../config/homepageAssets";
import "../styles/connect-section.css";

// Interface for fixtures from API
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

const DUMMY_LAST_RESULT: PublicFixture = {
  id: 0,
  opponent: "Bangalore Rangers",
  matchDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  matchTime: "18:00",
  venue: "3Lok Football Fitness Hub",
  matchType: "League",
  status: "COMPLETED",
  center: "FCRB",
  score: "3-1",
};

type CalendarEvent = {
  id: string;
  dateKey: string; // YYYY-MM-DD
  date: Date; // normalized to midnight
  title: string; // vs Opponent
  opponent: string;
  timeLabel: string;
  competition: string;
  venue: string;
  status: string;
  kind: "match" | "result";
};

const StoryNavDock: React.FC<{
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  isMobile: boolean;
}> = ({ currentIndex, total, onPrev, onNext, canPrev, canNext, isMobile }) => {
  const btnSize = isMobile ? 36 : 40;
  const progress = total <= 1 ? 1 : (currentIndex + 1) / total;
  const progressPct = Math.round(progress * 100);

  const buttonBase: React.CSSProperties = {
    width: btnSize,
    height: btnSize,
    borderRadius: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: colors.text.primary,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    outline: "none",
    boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
    WebkitTapHighlightColor: "transparent",
  };

  const focusRing = (el: HTMLButtonElement) => {
    el.style.boxShadow = "0 10px 28px rgba(0,0,0,0.35), 0 0 0 2px rgba(0,224,255,0.22), 0 0 26px rgba(0,224,255,0.10)";
    el.style.borderColor = "rgba(0,224,255,0.28)";
  };
  const blurRing = (el: HTMLButtonElement) => {
    el.style.boxShadow = "0 10px 28px rgba(0,0,0,0.35)";
    el.style.borderColor = "rgba(255,255,255,0.12)";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: spacing.sm,
        padding: "10px 10px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(10,16,32,0.26)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.42)",
        width: isMobile ? "100%" : "auto",
      }}
      aria-label="Story navigation"
    >
      {/* Progress pill + micro bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 86 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.04)",
            color: colors.text.secondary,
            ...typography.caption,
            letterSpacing: "0.16em",
            fontSize: typography.fontSize.xs,
            whiteSpace: "nowrap",
          }}
        >
          <span>
            {String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: colors.accent.main,
              boxShadow: "0 0 0 2px rgba(255,169,0,0.14), 0 0 18px rgba(255,169,0,0.22)",
              flexShrink: 0,
            }}
          />
        </div>

        <div
          aria-label={`Progress ${progressPct}%`}
          style={{
            height: 5,
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.round(progress * 100)}%`,
              background: "linear-gradient(90deg, rgba(255,169,0,0.80), rgba(0,224,255,0.70))",
              position: "relative",
            }}
          >
            <motion.div
              aria-hidden="true"
              animate={{ x: ["-40%", "140%"] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
              style={{
                position: "absolute",
                top: -6,
                bottom: -6,
                width: "45%",
                left: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 45%, transparent 100%)",
                filter: "blur(6px)",
                opacity: 0.55,
              }}
            />
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <div style={{ display: "flex", gap: spacing.xs, marginLeft: "auto" }}>
        <motion.button
          type="button"
          aria-label="Previous section"
          disabled={!canPrev}
          onClick={onPrev}
          whileHover={canPrev ? { scale: 1.03, boxShadow: "0 0 0 1px rgba(0,224,255,0.18), 0 14px 40px rgba(0,0,0,0.42), 0 0 26px rgba(0,224,255,0.10)" } : undefined}
          whileTap={canPrev ? { scale: 0.98 } : undefined}
          style={{
            ...buttonBase,
            opacity: canPrev ? 0.95 : 0.35,
            cursor: canPrev ? "pointer" : "not-allowed",
          }}
          onFocus={(e) => focusRing(e.currentTarget)}
          onBlur={(e) => blurRing(e.currentTarget)}
        >
          <ArrowRightIcon size={16} style={{ transform: "rotate(180deg)" }} />
        </motion.button>
        <motion.button
          type="button"
          aria-label="Next section"
          disabled={!canNext}
          onClick={onNext}
          whileHover={canNext ? { scale: 1.03, boxShadow: "0 0 0 1px rgba(255,169,0,0.18), 0 14px 40px rgba(0,0,0,0.42), 0 0 26px rgba(255,169,0,0.10)" } : undefined}
          whileTap={canNext ? { scale: 0.98 } : undefined}
          style={{
            ...buttonBase,
            opacity: canNext ? 0.95 : 0.35,
            cursor: canNext ? "pointer" : "not-allowed",
          }}
          onFocus={(e) => focusRing(e.currentTarget)}
          onBlur={(e) => blurRing(e.currentTarget)}
        >
          <ArrowRightIcon size={16} />
        </motion.button>
      </div>
    </div>
  );
};

const ClubCalendar: React.FC<{
  isMobile: boolean;
  loading?: boolean;
  fixtures?: PublicFixture[];
  results?: PublicFixture[];
}> = ({ isMobile, loading = false, fixtures = [], results = [] }) => {
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtMonth = (d: Date) => d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const fmtTime = (t: string) => {
    // Handles "HH:mm", "HH:mm:ss", or an ISO-ish string.
    try {
      if (!t) return "TBA";
      if (t.includes("T")) {
        const dt = new Date(t);
        if (!Number.isNaN(dt.getTime())) return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      }
      const match = t.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        const hh = Number(match[1]);
        const mm = Number(match[2]);
        const dt = new Date();
        dt.setHours(hh, mm, 0, 0);
        return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      }
      return t;
    } catch {
      return t || "TBA";
    }
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [hoveredLocked, setHoveredLocked] = useState(false);

  const events = useMemo<CalendarEvent[]>(() => {
    const toEvent = (f: PublicFixture, kind: "match" | "result"): CalendarEvent => {
      const d = new Date(f.matchDate);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return {
        id: `${kind}-${f.id}-${dateKey}`,
        dateKey,
        date,
        title: `vs ${f.opponent}`,
        opponent: f.opponent,
        timeLabel: f.matchTime ? fmtTime(f.matchTime) : "TBA",
        competition: f.matchType || "Match",
        venue: f.venue || "TBA",
        status: f.status || (kind === "result" ? "RESULT" : "SCHEDULED"),
        kind,
      };
    };

    const merged = [
      ...results.map((r) => toEvent(r, "result")),
      ...fixtures.map((f) => toEvent(f, "match")),
    ];
    // de-dupe (id includes kind+fixtureId+dateKey)
    const seen = new Set<string>();
    return merged.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }, [fixtures, results]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.dateKey) || [];
      list.push(e);
      map.set(e.dateKey, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.date.getTime() - b.date.getTime());
      map.set(k, list);
    }
    return map;
  }, [events]);

  const selectedEvents = useMemo(() => eventsByDay.get(selectedDateKey) || [], [eventsByDay, selectedDateKey]);

  const nextMatch = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const upcoming = events
      .filter((e) => e.kind === "match" && e.date.getTime() >= start)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    return upcoming[0] || null;
  }, [events]);

  const primaryEvent = useMemo(() => {
    return (selectedEvents[0] || nextMatch) ?? null;
  }, [selectedEvents, nextMatch]);

  const monthGrid = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay(); // Sun=0
    const totalDays = last.getDate();

    const cells: Array<{ key: string; date: Date | null; dayNum?: number }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ key: `pad-${i}`, date: null });
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ key, date, dayNum: d });
    }
    while (cells.length % 7 !== 0) cells.push({ key: `pad-end-${cells.length}`, date: null });
    while (cells.length < 42) cells.push({ key: `pad-last-${cells.length}`, date: null });
    return cells;
  }, [monthCursor]);

  const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const isCurrentMonth = monthCursor.getFullYear() === today.getFullYear() && monthCursor.getMonth() === today.getMonth();
  const daysInMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0).getDate();
  const monthProgress = isCurrentMonth ? Math.min(1, Math.max(0, today.getDate() / Math.max(1, daysInMonth))) : 0;
  const opponentAbbr = (name: string) =>
    (name || "TBA")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr", gap: spacing.md }}>
      {/* Left: Details */}
      <div
        style={{
          borderRadius: borderRadius.xl,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)",
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
              "radial-gradient(circle at 20% 15%, rgba(0,224,255,0.12) 0%, transparent 55%), radial-gradient(circle at 85% 80%, rgba(255,169,0,0.10) 0%, transparent 60%)",
            opacity: 0.95,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* EAFC-style match card art strip */}
          <div
            style={{
              position: "relative",
              height: isMobile ? 96 : 112,
              overflow: "hidden",
              padding: spacing.md,
              borderBottom: "1px solid rgba(255,255,255,0.10)",
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
                opacity: 0.18,
                filter: "blur(10px)",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(5,11,32,0.80) 0%, rgba(5,11,32,0.55) 45%, rgba(5,11,32,0.86) 100%)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                {/* FCRB crest placeholder */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
                    color: colors.text.primary,
                    ...typography.caption,
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: "0.12em",
                  }}
                  aria-label="FC Real Bengaluru crest"
                >
                  FCRB
                </div>

                <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.9 }}>
                  {primaryEvent ? primaryEvent.title : "No match selected"}
                </div>

                {/* Opponent crest placeholder */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.text.secondary,
                    ...typography.caption,
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: "0.12em",
                    opacity: 0.9,
                  }}
                  aria-label="Opponent crest"
                >
                  {primaryEvent ? opponentAbbr(primaryEvent.opponent) : "—"}
                </div>
              </div>

              {/* Competition badge */}
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: borderRadius.full,
                  border: "1px solid rgba(0,224,255,0.22)",
                  background: "rgba(0,224,255,0.06)",
                  color: colors.text.secondary,
                  ...typography.caption,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                {primaryEvent ? primaryEvent.competition : "SCHEDULE"}
              </div>
            </div>
          </div>

          <div style={{ padding: spacing.md }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.sm }}>
            <div>
              <div style={{ ...typography.overline, color: colors.text.muted, letterSpacing: "0.14em" }}>CLUB CALENDAR</div>
              <div style={{ ...typography.h4, color: colors.text.primary, margin: 0 }}>Matchdays & Moments</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...typography.caption, color: colors.text.secondary }}>{fmtDate(today)}</div>
              <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.9 }}>Today</div>
            </div>
          </div>

          <div
            style={{
              borderRadius: borderRadius.lg,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(10,16,32,0.35)",
              padding: spacing.md,
              boxShadow: "0 16px 46px rgba(0,0,0,0.45)",
            }}
          >
            {loading ? (
              <div style={{ ...typography.body, color: colors.text.muted }}>Loading schedule…</div>
            ) : selectedEvents.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
                  <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.1em" }}>
                    {selectedEvents[0].competition.toUpperCase()}
                  </div>
                  <div style={{ ...typography.caption, color: colors.text.secondary }}>{selectedEvents[0].timeLabel}</div>
                </div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, lineHeight: 1.12 }}>
                  {selectedEvents[0].title}
                </div>
                <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ ...typography.caption, color: colors.text.secondary }}>{selectedEvents[0].venue}</div>
                  <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.9 }}>{selectedEvents[0].status}</div>
                </div>
                {selectedEvents.length > 1 && (
                  <div style={{ ...typography.caption, color: colors.text.muted }}>+{selectedEvents.length - 1} more on this day</div>
                )}
              </div>
            ) : nextMatch ? (
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
                <div style={{ ...typography.caption, color: colors.text.muted, letterSpacing: "0.1em" }}>NEXT MATCH</div>
                <div style={{ ...typography.h3, color: colors.text.primary, margin: 0, lineHeight: 1.12 }}>{nextMatch.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: spacing.md }}>
                  <div style={{ ...typography.caption, color: colors.text.secondary }}>{fmtDate(nextMatch.date)}</div>
                  <div style={{ ...typography.caption, color: colors.text.secondary }}>{nextMatch.timeLabel}</div>
                </div>
                <div style={{ ...typography.caption, color: colors.text.muted }}>{nextMatch.competition}</div>
              </div>
            ) : (
              <div style={{ ...typography.body, color: colors.text.muted, lineHeight: 1.6 }}>
                No fixtures on the board yet. Check back soon.
              </div>
            )}
          </div>

          <div style={{ marginTop: spacing.md, display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
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
              Click a matchday to view details
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Right: Month grid */}
      <div
        style={{
          borderRadius: borderRadius.xl,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: spacing.md, display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
          <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>
            {fmtMonth(monthCursor)}
          </div>
          <div style={{ display: "flex", gap: spacing.sm }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const d = new Date(monthCursor);
                d.setMonth(d.getMonth() - 1);
                setMonthCursor(d);
              }}
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
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const d = new Date();
                d.setDate(1);
                d.setHours(0, 0, 0, 0);
                setMonthCursor(d);
              }}
              style={{
                padding: "8px 10px",
                borderRadius: borderRadius.lg,
                border: "1px solid rgba(0,224,255,0.22)",
                background: "rgba(0,224,255,0.06)",
                color: colors.text.secondary,
                cursor: "pointer",
              }}
              aria-label="Jump to current month"
            >
              Today
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const d = new Date(monthCursor);
                d.setMonth(d.getMonth() + 1);
                setMonthCursor(d);
              }}
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
            </motion.button>
          </div>
        </div>

        {/* Season progress + locked tooltip */}
        <div style={{ padding: `0 ${spacing.md} ${spacing.sm}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
          <div style={{ ...typography.caption, color: colors.text.muted }}>
            Season progress:{" "}
            <span style={{ color: colors.text.secondary, fontWeight: typography.fontWeight.semibold }}>
              {isCurrentMonth ? `${Math.round(monthProgress * 100)}%` : "—"}
            </span>
          </div>
          {hoveredLocked && (
            <div
              style={{
                padding: "6px 10px",
                borderRadius: borderRadius.full,
                border: "1px solid rgba(255,169,0,0.22)",
                background: "rgba(255,169,0,0.08)",
                ...typography.caption,
                color: colors.text.secondary,
                whiteSpace: "nowrap",
              }}
            >
              Milestone ahead — keep building
            </div>
          )}
        </div>

        {isCurrentMonth && (
          <div style={{ padding: `0 ${spacing.md} ${spacing.md}` }}>
            <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.round(monthProgress * 100)}%`,
                  background: "linear-gradient(90deg, rgba(255,169,0,0.85), rgba(0,224,255,0.75))",
                }}
              />
            </div>
          </div>
        )}

        <div style={{ padding: `0 ${spacing.md} ${spacing.md}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
            {weekdayLabels.map((w) => (
              <div
                key={w}
                style={{
                  ...typography.caption,
                  color: colors.text.muted,
                  textAlign: "center",
                  letterSpacing: "0.14em",
                }}
              >
                {w}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {monthGrid.map((cell) => {
              if (!cell.date) return <div key={cell.key} />;
              const d = cell.date;
              const dateKey = cell.key;
              const isToday = d.getTime() === today.getTime();
              const isSelected = dateKey === selectedDateKey;
              const dayEvents = eventsByDay.get(dateKey) || [];
              const hasMatch = dayEvents.some((e) => e.kind === "match");
              const hasResult = dayEvents.some((e) => e.kind === "result");
              const isFuture = d.getTime() > today.getTime();
              const isLocked = isFuture && hasMatch;

              return (
                <motion.button
                  key={cell.key}
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (isLocked) return;
                    setSelectedDateKey(dateKey);
                  }}
                  onMouseEnter={() => {
                    if (isLocked) setHoveredLocked(true);
                  }}
                  onMouseLeave={() => {
                    if (isLocked) setHoveredLocked(false);
                  }}
                  style={{
                    height: 48,
                    borderRadius: borderRadius.lg,
                    border: isSelected
                      ? "1px solid rgba(0,224,255,0.45)"
                      : isToday
                        ? "1px solid rgba(255,169,0,0.45)"
                        : "1px solid rgba(255,255,255,0.10)",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(0,224,255,0.10) 0%, rgba(255,169,0,0.06) 100%)"
                      : "rgba(10,16,32,0.30)",
                    boxShadow: isSelected
                      ? "0 14px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,224,255,0.10) inset"
                      : isToday
                        ? "0 12px 34px rgba(0,0,0,0.42), 0 0 18px rgba(255,169,0,0.18)"
                        : "none",
                    color: colors.text.secondary,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    position: "relative",
                    overflow: "hidden",
                    padding: 0,
                    opacity: isLocked ? 0.55 : 1,
                  }}
                  aria-label={`Day ${cell.dayNum}`}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <span
                      style={{
                        ...typography.body,
                        fontSize: typography.fontSize.sm,
                        color: isToday ? colors.text.primary : colors.text.secondary,
                        fontWeight: isToday ? 700 : 600,
                        filter: isLocked ? "blur(1px)" : "none",
                      }}
                    >
                      {cell.dayNum}
                    </span>
                  </div>

                  {(hasMatch || hasResult) && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        left: 8,
                        right: 8,
                        bottom: 6,
                        height: 4,
                        borderRadius: 999,
                        background: hasMatch
                          ? "linear-gradient(90deg, rgba(255,169,0,0.85), rgba(0,224,255,0.75))"
                          : "rgba(255,255,255,0.20)",
                        opacity: 0.95,
                      }}
                    />
                  )}

                  {hasMatch && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "rgba(255,169,0,0.9)",
                        boxShadow: "0 0 0 2px rgba(255,169,0,0.20)",
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Interface for centres
interface Centre {
  id: number;
  name: string;
  shortName: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  googleMapsUrl: string;
  displayOrder: number;
}

// Infinity Section Wrapper - Seamless, continuous flow like a movie
const InfinitySection: React.FC<{
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  delay?: number;
  bridge?: boolean;
}> = ({ children, id, style, delay = 0, bridge = false }) => {
  const { infinitySectionVariants, viewportOnce } = useHomepageAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { 
    once: false, 
    amount: 0.1,
    margin: "-100px", // Negative margin to trigger earlier for smoother transitions
  });

  // If a section uses a background image/gradient, mirror it onto the
  // transition bridges so we don't see "frame" borders between sections.
  const bridgeBackgroundStyle: React.CSSProperties = (() => {
    if (style?.backgroundImage) {
      return {
        backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize ?? "cover",
        backgroundPosition: style.backgroundPosition ?? "center",
        backgroundRepeat: style.backgroundRepeat ?? "no-repeat",
        backgroundAttachment: style.backgroundAttachment ?? "fixed",
      };
    }

    if (style?.background) {
      return { background: style.background };
    }

    return { background: "transparent" };
  })();

  return (
    <>
      {/* Smooth transition bridge - eliminates blank zones */}
      {bridge && (
        <div
          style={{
            position: "relative",
            height: "100px",
            marginTop: "-100px",
            zIndex: 1,
            ...bridgeBackgroundStyle,
            pointerEvents: "none",
          }}
        />
      )}
      
      <motion.section
        ref={sectionRef}
        id={id}
        initial="offscreen"
        animate={isInView ? "onscreen" : "offscreen"}
        variants={infinitySectionVariants}
        transition={{ 
          delay,
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad-like curve for smooth sports broadcast feel
        }}
        viewport={{ once: false, amount: 0.1 }}
        style={{
          ...style,
          position: "relative",
          marginTop: bridge ? "-100px" : "0",
          marginBottom: bridge ? "-100px" : "0",
          // Fixed header overlap - ensure top padding accounts for sticky header (120px)
          paddingTop: bridge ? "150px" : (style?.paddingTop !== undefined ? style.paddingTop : spacing.sectionGap),
          paddingBottom: bridge ? "150px" : (style?.paddingBottom !== undefined ? style.paddingBottom : spacing.sectionGap),
          zIndex: bridge ? 2 : 1,
          overflow: "visible",
          overflowY: "visible",
          overflowX: "hidden",
          width: "100%",
          // Allow explicit section height (e.g. 100vh hero/story blocks)
          height: style?.height ?? undefined,
          // Respect per-section minHeight (e.g. full-viewport hero/story sections)
          minHeight: style?.minHeight ?? "1px",
          // Respect backgroundImage if provided, otherwise use background or transparent
          background: style?.backgroundImage ? undefined : (style?.background || "transparent"),
          backgroundImage: style?.backgroundImage || undefined,
          backgroundSize: style?.backgroundSize || undefined,
          backgroundPosition: style?.backgroundPosition || undefined,
          backgroundRepeat: style?.backgroundRepeat || undefined,
          backgroundAttachment: style?.backgroundAttachment || undefined,
        }}
      >
        {/* Subtle pitch texture overlay for football-first feel */}
        {bridge && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              pointerEvents: "none",
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(10,61,145,0.02) 100px, rgba(10,61,145,0.02) 200px)
              `,
              opacity: 0.3,
            }}
          />
        )}
        
        <div style={{ 
          position: "relative", 
          zIndex: 1, 
          width: "100%",
          minHeight: "1px",
          isolation: "isolate",
          overflow: "visible",
          overflowY: "visible",
          background: "transparent", // Ensure no background interference
        }}>
          {children}
        </div>
      </motion.section>
      
      {/* Bottom transition bridge */}
      {bridge && (
        <div
          style={{
            position: "relative",
            height: "100px",
            marginBottom: "-100px",
            zIndex: 1,
            ...bridgeBackgroundStyle,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
};

// Trophy Cabinet Component - Interactive Achievement Display

export const TrophyCabinet: React.FC<{
  onOpenChange?: (isOpen: boolean) => void;
  variant?: "compact" | "royal";
  isMobile?: boolean;
}> = ({ onOpenChange, variant = "compact", isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onOpenChange) {
      onOpenChange(newState);
    }
  };

  const achievements = [
    { 
      year: "2025",
      label: "Champions — KSFA D Division", 
      glow: colors.accent.main,
      kind: "trophy" as const,
      color: "rgba(255, 194, 51, 0.95)",
    },
    { 
      year: "2025",
      label: "Runners-up — KSFA C Division", 
      glow: colors.primary.main,
      kind: "medal" as const,
      color: "rgba(0, 224, 255, 0.95)",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="button"
      tabIndex={0}
      aria-label={isOpen ? "Close trophy cabinet" : "Open trophy cabinet"}
      aria-expanded={isOpen}
      style={{
        marginBottom: 0,
        maxWidth: "100%",
        cursor: "pointer",
        width: "100%",
        outline: "none",
      }}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleToggle();
        }
      }}
    >
      {/* Cabinet Structure */}
      <motion.div
        animate={{
          scale: isOpen ? (variant === "royal" ? 1.02 : 1.05) : 1,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          background: `linear-gradient(135deg, 
            rgba(30, 20, 10, 0.8) 0%, 
            rgba(40, 25, 15, 0.7) 50%, 
            rgba(30, 20, 10, 0.8) 100%)`,
          backdropFilter: "blur(20px)",
          borderRadius: borderRadius.xl,
          border: `2px solid rgba(255, 169, 0, 0.3)`,
          boxShadow: isOpen 
            ? `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 169, 0, 0.2), inset 0 0 20px rgba(255, 169, 0, 0.1)`
            : `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 169, 0, 0.15), inset 0 0 10px rgba(255, 169, 0, 0.05)`,
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Wood Grain Texture Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255, 200, 100, 0.03) 2px,
              rgba(255, 200, 100, 0.03) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(200, 150, 80, 0.02) 2px,
              rgba(200, 150, 80, 0.02) 4px
            )`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Royal shimmer overlay (variant only) */}
        {variant === "royal" && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: -2,
              background:
                "linear-gradient(110deg, rgba(255,169,0,0.10) 0%, rgba(255,255,255,0.06) 35%, rgba(0,224,255,0.06) 55%, rgba(255,169,0,0.10) 100%)",
              filter: "blur(10px)",
              opacity: 0.6,
              zIndex: 1,
              pointerEvents: "none",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 58%, rgba(0,0,0,0.7) 100%)",
            }}
            animate={{
              x: ["-18%", "18%", "-18%"],
              opacity: [0.45, 0.7, 0.45],
            }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {variant === "compact" ? (
          <>
            {/* Cabinet Header - Always Visible */}
            <motion.div
              style={{
                padding: spacing.lg,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 2,
                borderBottom: isOpen ? `1px solid rgba(255, 169, 0, 0.2)` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, rgba(255, 169, 0, 0.2) 0%, rgba(255, 194, 51, 0.15) 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid rgba(255, 169, 0, 0.4)`,
                    boxShadow: `0 4px 16px rgba(255, 169, 0, 0.3)`,
                  }}
                >
                  <TrophyIcon size={20} color={colors.accent.main} />
                </motion.div>
                <div>
                  <span
                    style={{
                      ...typography.body,
                      color: colors.text.primary,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Trophy Cabinet
                  </span>
                  <p
                    style={{
                      ...typography.caption,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.xs,
                      margin: 0,
                      marginTop: "4px",
                    }}
                  >
                    {isOpen ? "Tap to close" : "Tap to open Trophy Cabinet"}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ArrowRightIcon size={20} color={colors.accent.main} style={{ transform: "rotate(90deg)" }} />
              </motion.div>
            </motion.div>
          </>
        ) : (
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: isMobile ? spacing.sm : spacing.md,
              textAlign: "center",
              // Keep the page flow stable: reserve a consistent footprint for both states.
              minHeight: isMobile ? 360 : 330,
              display: "block",
            }}
          >
            <AnimatePresence initial={false} mode="wait">
              {!isOpen ? (
                <motion.div
                  key="royal-cta"
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(12px)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%" }}
                >
                  <motion.div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      margin: `0 auto ${spacing.lg}`,
                      background:
                        "linear-gradient(135deg, rgba(255, 169, 0, 0.25) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 194, 51, 0.12) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid rgba(255, 169, 0, 0.45)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.55), 0 0 22px rgba(255,169,0,0.25)",
                    }}
                    animate={{
                      boxShadow: [
                        "0 10px 30px rgba(0,0,0,0.55), 0 0 18px rgba(255,169,0,0.22)",
                        "0 12px 34px rgba(0,0,0,0.55), 0 0 26px rgba(255,169,0,0.32)",
                        "0 10px 30px rgba(0,0,0,0.55), 0 0 18px rgba(255,169,0,0.22)",
                      ],
                    }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <TrophyIcon
                      size={30}
                      color="rgba(255, 194, 51, 0.95)"
                      style={{ display: "block", lineHeight: 0 }}
                    />
                  </motion.div>

                  <div style={{ maxWidth: 560, margin: "0 auto" }}>
                    <div
                      style={{
                        ...typography.overline,
                        color: "rgba(255, 194, 51, 0.95)",
                        letterSpacing: "0.18em",
                        marginBottom: spacing.sm,
                        textTransform: "uppercase",
                      }}
                    >
                      Our Honours
                    </div>
                    <div
                      style={{
                        ...typography.h3,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                        letterSpacing: "-0.01em",
                        marginBottom: spacing.xs,
                      }}
                    >
                      Trophy Cabinet
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.base,
                        opacity: 0.9,
                      }}
                    >
                      Tap to reveal our achievements
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="royal-reveal"
                  initial={{ opacity: 0, y: 10, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(14px)" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      ...typography.overline,
                      color: "rgba(255, 194, 51, 0.95)",
                      letterSpacing: "0.18em",
                      marginBottom: spacing.sm,
                      textTransform: "uppercase",
                      textAlign: "center",
                    }}
                  >
                    Trophy Cabinet
                  </div>

                  {/* Cabinet (wood frame + glass doors + lit bays) */}
                  <div
                    style={{
                      position: "relative",
                      maxWidth: 560,
                      margin: "0 auto",
                      borderRadius: borderRadius.xl,
                      padding: isMobile ? spacing.xs : spacing.sm,
                      background:
                        "linear-gradient(135deg, rgba(92, 54, 28, 0.92) 0%, rgba(66, 38, 20, 0.90) 40%, rgba(84, 48, 25, 0.92) 100%)",
                      border: "1px solid rgba(255, 194, 51, 0.16)",
                      boxShadow:
                        "0 20px 64px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(0,0,0,0.28)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Wood grain + vignette */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 7px), radial-gradient(circle at 50% 10%, rgba(255,194,51,0.10) 0%, transparent 55%), radial-gradient(circle at 50% 100%, rgba(0,0,0,0.35) 0%, transparent 55%)",
                        opacity: 0.7,
                        pointerEvents: "none",
                      }}
                    />

                    {/* Inner cabinet area (glass back + depth) */}
                    <div
                      style={{
                        position: "relative",
                        borderRadius: borderRadius.lg,
                        padding: isMobile ? spacing.xs : spacing.sm,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(10,16,32,0.35) 35%, rgba(10,16,32,0.55) 100%)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 30px 90px rgba(0,0,0,0.55)",
                        overflow: "hidden",
                      }}
                    >
                      {/* Cabinet mullions */}
                      {!isMobile && (
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: "50%",
                            width: 2,
                            background: "linear-gradient(180deg, rgba(255,194,51,0.20), rgba(0,0,0,0.55))",
                            opacity: 0.9,
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {/* Sliding glass doors (open animation) */}
                      <motion.div
                        aria-hidden="true"
                        initial={{ x: "0%", opacity: 0.95 }}
                        animate={{ x: "-56%", opacity: 0 }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: "50%",
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.10) 100%)",
                          borderRight: "1px solid rgba(255,255,255,0.10)",
                          backdropFilter: "blur(2px)",
                          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.06)",
                          pointerEvents: "none",
                          zIndex: 3,
                        }}
                      />
                      <motion.div
                        aria-hidden="true"
                        initial={{ x: "0%", opacity: 0.95 }}
                        animate={{ x: "56%", opacity: 0 }}
                        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          right: 0,
                          width: "50%",
                          background:
                            "linear-gradient(225deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.10) 100%)",
                          borderLeft: "1px solid rgba(255,255,255,0.10)",
                          backdropFilter: "blur(2px)",
                          boxShadow: "inset 1px 0 0 rgba(255,255,255,0.06)",
                          pointerEvents: "none",
                          zIndex: 3,
                        }}
                      />

                      {/* Content bays */}
                      <div
                        style={{
                          position: "relative",
                          zIndex: 2,
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                          gap: isMobile ? spacing.lg : spacing.xl,
                          alignItems: "stretch",
                        }}
                      >
                        {achievements.map((achievement, idx) => {
                          const Icon = achievement.kind === "trophy" ? TrophyIcon : MedalIcon;
                          const glow = achievement.glow;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 16, scale: 0.99 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.65, delay: 0.18 + idx * 0.10, ease: [0.22, 1, 0.36, 1] }}
                              whileHover={{ y: -3 }}
                              style={{
                                position: "relative",
                                borderRadius: borderRadius.xl,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background:
                                  "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(10,16,32,0.22) 45%, rgba(10,16,32,0.40) 100%)",
                                boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.25)",
                                overflow: "hidden",
                                minHeight: isMobile ? 160 : 180,
                              }}
                            >
                              {/* Spotlight (lamp + cone) */}
                              <div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  top: 14,
                                  left: 0,
                                  right: 0,
                                  height: 170,
                                  pointerEvents: "none",
                                }}
                              >
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: "50%",
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    transform: "translateX(-50%)",
                                    background: "rgba(255,255,255,0.22)",
                                    boxShadow: `0 0 0 1px rgba(255,255,255,0.10), 0 0 22px ${glow}55`,
                                    opacity: 0.9,
                                  }}
                                />
                                <motion.div
                                  style={{
                                    position: "absolute",
                                    top: 6,
                                    left: "50%",
                                    width: "140%",
                                    height: 170,
                                    transform: "translateX(-50%)",
                                    background: `radial-gradient(ellipse at 50% 0%, ${glow}33 0%, rgba(255,255,255,0.08) 22%, transparent 70%)`,
                                    filter: "blur(2px)",
                                    opacity: 0.85,
                                  }}
                                  animate={{ opacity: [0.7, 0.95, 0.7] }}
                                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: idx * 0.25 }}
                                />
                              </div>

                              {/* Glass shelf */}
                              <div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  left: 12,
                                  right: 12,
                                  top: isMobile ? 104 : 116,
                                  height: 10,
                                  borderRadius: 999,
                                  background:
                                    "linear-gradient(180deg, rgba(180,255,230,0.12) 0%, rgba(255,255,255,0.14) 35%, rgba(0,0,0,0.18) 100%)",
                                  boxShadow:
                                    "0 10px 25px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                                  opacity: 0.75,
                                }}
                              />

                              {/* Trophy sitting on shelf */}
                              <motion.div
                                style={{
                                  position: "absolute",
                                  top: isMobile ? 40 : 44,
                                  left: "50%",
                                  x: "-50%",
                                  width: 56,
                                  height: 56,
                                  borderRadius: 18,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,169,0,0.10) 35%, rgba(0,224,255,0.08) 100%)",
                                  border: "1px solid rgba(255,255,255,0.12)",
                                  boxShadow: `0 26px 70px rgba(0,0,0,0.55), 0 0 34px ${glow}26`,
                                  backdropFilter: "blur(10px)",
                                }}
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 + idx * 0.12 }}
                              >
                                <Icon
                                  size={34}
                                  color={achievement.color}
                                  style={{
                                    display: "block",
                                    lineHeight: 0,
                                    filter: `drop-shadow(0 0 14px ${glow}66)`,
                                  }}
                                />
                              </motion.div>

                              {/* Copy */}
                              <div
                                style={{
                                  position: "absolute",
                                  left: 18,
                                  right: 18,
                                  top: isMobile ? 114 : 122,
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    ...typography.body,
                                    color: colors.text.primary,
                                    fontWeight: typography.fontWeight.bold,
                                    fontSize: "0.72rem",
                                    lineHeight: 1.15,
                                    marginBottom: 0,
                                  }}
                                >
                                  {achievement.label}{" "}
                                  <span style={{ color: "rgba(255, 194, 51, 0.92)" }}>
                                    ({achievement.year})
                                  </span>
                                </div>
                              </div>

                              {/* Glass reflections */}
                              <motion.div
                                aria-hidden="true"
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background:
                                    "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.12) 28%, rgba(255,255,255,0.04) 42%, transparent 65%)",
                                  opacity: 0.45,
                                  filter: "blur(6px)",
                                  transform: "translateX(-40%)",
                                  pointerEvents: "none",
                                }}
                                animate={{ x: ["-45%", "45%", "-45%"] }}
                                transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 + idx * 0.25 }}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ ...typography.caption, color: colors.text.muted, opacity: 0.75, marginTop: spacing.md }}>
                    Tap again to close
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Cabinet Doors - Animated Opening */}
        <AnimatePresence>
          {variant === "compact" && isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                overflow: "hidden",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Glass Door Effect */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%, 
                    transparent 50%, 
                    rgba(255, 255, 255, 0.05) 100%)`,
                  backdropFilter: "blur(2px)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />

              {/* Achievements Display - Horizontal Layout */}
              <div style={{
                padding: spacing.xl,
                display: "flex",
                flexDirection: "row",
                gap: spacing.lg,
                position: "relative",
                zIndex: 2,
                alignItems: "stretch",
                justifyContent: "center",
                flexWrap: "nowrap",
              }}>
                {achievements.map((achievement, idx) => {
                  const Icon = achievement.kind === "trophy" ? TrophyIcon : MedalIcon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ 
                        delay: idx * 0.15 + 0.2,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      whileHover={{ 
                        x: 4,
                        transition: { duration: 0.2 }
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: spacing.sm,
                        padding: spacing.lg,
                        background: `linear-gradient(135deg, 
                          rgba(255, 255, 255, 0.05) 0%, 
                          rgba(255, 255, 255, 0.02) 100%)`,
                        borderRadius: borderRadius.lg,
                        border: `1px solid rgba(255, 169, 0, 0.2)`,
                        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.2), 0 0 20px ${achievement.glow}20`,
                        cursor: "default",
                        flex: "1 1 0",
                        maxWidth: "300px",
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: idx * 0.5,
                        }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, 
                            rgba(255, 169, 0, 0.25) 0%, 
                            rgba(255, 194, 51, 0.2) 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: `2px solid ${achievement.glow}60`,
                          boxShadow: `0 0 20px ${achievement.glow}40, inset 0 0 10px ${achievement.glow}20`,
                        }}
                      >
                        <Icon
                          size={32}
                          color={achievement.color}
                          style={{
                            display: "block",
                            lineHeight: 0,
                            filter: `drop-shadow(0 0 10px ${achievement.glow}55)`,
                          }}
                        />
                      </motion.div>
                      <span
                        style={{
                          ...typography.body,
                          color: colors.text.primary,
                          fontSize: "0.68rem",
                          fontWeight: typography.fontWeight.semibold,
                          letterSpacing: "0.02em",
                          textAlign: "center",
                          textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`,
                          lineHeight: 1.35,
                        }}
                      >
                        {achievement.label}{" "}
                        <span style={{ color: "rgba(255, 194, 51, 0.92)" }}>
                          ({achievement.year})
                        </span>
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Cabinet Bottom Decoration */}
              <div
                style={{
                  height: 4,
                  background: `linear-gradient(90deg, 
                    transparent 0%, 
                    rgba(255, 169, 0, 0.4) 20%, 
                    rgba(255, 169, 0, 0.6) 50%, 
                    rgba(255, 169, 0, 0.4) 80%, 
                    transparent 100%)`,
                  marginTop: spacing.md,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Programs Preview Tabs Component for Homepage
const ProgramsPreviewTabs: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const [activeTab, setActiveTab] = useState("epp");

  const programs = [
    {
      id: "epp",
      name: "Elite Pathway Program",
      acronym: "EPP",
      positioning: "For players targeting top-tier football in India and abroad.",
      outcomes: [
        "Super Division focused competition",
        "Highest training intensity & smallest groups",
        "Individual development plans with AI-assisted simulation",
      ],
    },
    {
      id: "scp",
      name: "Senior Competitive Program",
      acronym: "SCP",
      positioning: "The competitive bridge between youth and elite football.",
      outcomes: [
        "KSFA C & D Division exposure",
        "Regular match minutes & structured progression",
        "Primary internal feeder to EPP",
      ],
    },
    {
      id: "wpp",
      name: "Women's Performance Pathway",
      acronym: "WPP",
      positioning: "A unified pathway for women footballers aiming professional levels.",
      outcomes: [
        "Women's B Division exposure",
        "Year-round matches & same data rigor",
        "Long-term career pathway",
      ],
    },
    {
      id: "fydp",
      name: "Foundation & Youth Development Program",
      acronym: "FYDP",
      positioning: "Building intelligent footballers before building competitors.",
      outcomes: [
        "U9, U11, U13 gender-neutral development",
        "Tactical foundations aligned with senior teams",
        "Data-assisted development from youth level",
      ],
    },
  ];

  const activeProgram = programs.find(p => p.id === activeTab) || programs[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      {/* Tabs - Horizontal on desktop, scrollable on mobile */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "row" : "row",
        gap: spacing.sm,
        marginBottom: spacing["2xl"],
        overflowX: isMobile ? "auto" : "visible",
        paddingBottom: isMobile ? spacing.sm : 0,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        {programs.map((program) => {
          const isActive = program.id === activeTab;
          return (
            <motion.button
              key={program.id}
              onClick={() => setActiveTab(program.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: spacing.md,
                background: isActive 
                  ? `linear-gradient(135deg, rgba(0,224,255,0.15) 0%, rgba(255,169,0,0.1) 100%)`
                  : `rgba(255, 255, 255, 0.03)`,
                border: `1px solid ${isActive ? "rgba(0,224,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: borderRadius.lg,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: isActive ? `0 0 20px rgba(0,224,255,0.2)` : "none",
                minWidth: isMobile ? "200px" : "auto",
                flexShrink: 0,
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                }
              }}
            >
              <div style={{ marginBottom: spacing.xs }}>
                <span style={{
                  ...typography.h5,
                  color: isActive ? colors.text.primary : colors.text.secondary,
                  fontSize: typography.fontSize.base,
                  fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                }}>
                  {program.acronym}
                </span>
              </div>
              <p style={{
                ...typography.body,
                color: colors.text.muted,
                fontSize: typography.fontSize.xs,
                margin: 0,
                opacity: isActive ? 0.85 : 0.6,
                lineHeight: 1.4,
              }}>
                {program.name}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Active Program Preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: `rgba(10, 16, 32, 0.55)`,
            backdropFilter: "blur(10px)",
            borderRadius: borderRadius["2xl"],
            border: `1px solid rgba(255,255,255,0.08)`,
            padding: isMobile ? spacing.lg : spacing.xl,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: spacing.xl, alignItems: "start" }}>
            <div>
              <h3 style={{
                ...typography.h3,
                color: colors.text.primary,
                marginBottom: spacing.sm,
                fontSize: typography.fontSize["2xl"],
              }}>
                {activeProgram.name} ({activeProgram.acronym})
              </h3>
              <p style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.base,
                marginBottom: spacing.lg,
                lineHeight: 1.6,
                opacity: 0.9,
              }}>
                {activeProgram.positioning}
              </p>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}>
                {activeProgram.outcomes.map((outcome, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.sm,
                  }}>
                    <CheckIcon size={18} color={colors.accent.main} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      lineHeight: 1.6,
                      opacity: 0.85,
                    }}>
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Link
                to={`/programs/${activeTab}`}
                style={{ textDecoration: "none" }}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.sm,
                    padding: `${spacing.md} ${spacing.lg}`,
                    background: `linear-gradient(135deg, rgba(0,224,255,0.15) 0%, rgba(255,169,0,0.1) 100%)`,
                    border: `1px solid rgba(0,224,255,0.3)`,
                    borderRadius: borderRadius.lg,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(0,224,255,0.2) 0%, rgba(255,169,0,0.15) 100%)`;
                    e.currentTarget.style.borderColor = "rgba(0,224,255,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, rgba(0,224,255,0.15) 0%, rgba(255,169,0,0.1) 100%)`;
                    e.currentTarget.style.borderColor = "rgba(0,224,255,0.3)";
                  }}
                >
                  <span style={{
                    ...typography.body,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                  }}>
                    Explore Program
                  </span>
                  <ArrowRightIcon size={18} color={colors.accent.main} />
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// Story Timeline Stack (progressive revelation) for Our Story Section
export const TabbedPanel: React.FC<{
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    oneLiner: string;
    paragraph?: string;
    miniNote?: string;
  }>;
  isMobile: boolean;
}> = ({ tabs, isMobile }) => {
  // fixed order (as required)
  const orderedIds = ["our-story", "what-we-build", "our-vision"];
  const orderedTabs = orderedIds
    .map((id) => tabs.find((t) => t.id === id))
    .filter(Boolean) as typeof tabs;
  const safeTabs = orderedTabs.length ? orderedTabs : tabs;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = safeTabs[activeIndex]?.id || safeTabs[0]?.id;
  const activeTabData = safeTabs[activeIndex] || safeTabs[0];

  const [visited, setVisited] = useState<Record<string, boolean>>(() => ({
    ...(safeTabs[0]?.id ? { [safeTabs[0].id]: true } : {}),
  }));

  useEffect(() => {
    if (!activeTab) return;
    setVisited((prev) => ({ ...prev, [activeTab]: true }));
  }, [activeTab]);

  const storyNodeVariants = {
    inactive: { opacity: 0.4, scale: 0.98, filter: "blur(1px)" },
    active: {
      opacity: 1,
      scale: 1,
      boxShadow: "0 0 18px rgba(0,180,255,0.35)",
      filter: "blur(0px)",
      transition: { duration: 0.3 },
    },
  } as const;

  const panelSwap = {
    initial: { opacity: 0, x: 24, filter: "blur(8px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } },
    exit: { opacity: 0, x: -24, filter: "blur(8px)", transition: { duration: 0.25 } },
  } as const;

  const cardStagger = {
    animate: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
  } as const;

  const cardItem = {
    initial: { opacity: 0, y: 10, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
  } as const;

  const getNodeTitle = (id: string) => {
    if (id === "our-story") return "The Beginning";
    if (id === "what-we-build") return "What We’re Building";
    return "Our Vision Forward";
  };

  const getNarrative = (id: string) => {
    if (id === "our-story") {
      return {
        lead: "A Bengaluru club — community-first, built to rise.",
        insights: [
          { k: "COMPETE", v: "Started in KSFA D Division with promotion ambitions from day one. Multiple squads across local competitions and tournaments." },
          { k: "PATHWAY", v: "Grassroots academy → youth teams → senior squads. Training built to bridge the gap from school football to state leagues." },
          { k: "STANDARDS", v: "Structured coaching with UEFA/AFC/IFF-licensed staff. Environments that demand professionalism, even at youth level." },
        ],
        direction: "",
      };
    }
    if (id === "what-we-build") {
      return {
        lead: "One club, multiple pathways — from kids to Super Division.",
        insights: [
          { k: "COMPETE", v: "KSFA Super Division ambition, women’s B Division, C & D Division squads, youth leagues." },
          { k: "PATHWAY", v: "Clear progression from FYDP into SCP, EPP, and Women’s Performance Pathway (WPP)." },
          { k: "STANDARDS", v: "Unified playing philosophy across age groups so transitions feel natural." },
        ],
        direction: "",
      };
    }
    return {
      lead: "Long-term excellence with ambition.",
      insights: [
        { k: "COMPETE", v: "Sustain presence at the top of Karnataka football and push towards national relevance." },
        { k: "PATHWAY", v: "Turn Bengaluru into a serious football destination for youth from across India." },
        { k: "STANDARDS", v: "Use RealVerse data, modern sports science, and consistent coaching to track growth season over season." },
      ],
      direction: "",
    };
  };

  const getPanelTint = (id: string) => {
    if (id === "our-story") return { a: "rgba(255,169,0,0.12)", b: "rgba(0,224,255,0.08)" };
    if (id === "what-we-build") return { a: "rgba(0,224,255,0.12)", b: "rgba(255,169,0,0.07)" };
    return { a: "rgba(0,224,255,0.10)", b: "rgba(255,169,0,0.10)" };
  };

  const panelHeight = isMobile ? 360 : 340; // stable footprint: no height jumps

  const handleMove = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(nextIndex, safeTabs.length - 1));
    setActiveIndex(clamped);
  };

  const narrative = getNarrative(activeTab);

  return (
    <div
      onKeyDown={(e) => {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        const isTypingTarget =
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          target?.isContentEditable ||
          (target?.getAttribute?.("contenteditable") === "true");
        if (isTypingTarget) return;

        // Keyboard navigation (←/→ per spec). Keep ↑/↓ as a convenience.
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          handleMove(activeIndex + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          handleMove(activeIndex - 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          handleMove(0);
        } else if (e.key === "End") {
          e.preventDefault();
          handleMove(safeTabs.length - 1);
        }
      }}
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "292px 1fr",
        gap: isMobile ? spacing.md : spacing.lg,
        alignItems: "stretch",
      }}
    >
      {/* LEFT: Story Nodes (index) */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          paddingRight: isMobile ? 0 : spacing.sm,
        }}
        aria-label="Story timeline"
      >
        {/* subtle vertical rail */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 14,
            top: 8,
            bottom: 8,
            width: 1,
            background: "linear-gradient(transparent, rgba(255,255,255,0.16), transparent)",
            opacity: 0.9,
            pointerEvents: "none",
          }}
        />

        {safeTabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          const isDone = !!visited[tab.id] && !isActive;
          const nodeTitle = getNodeTitle(tab.id);
          const step = String(idx + 1).padStart(2, "0");
          return (
            <motion.button
              key={tab.id}
              type="button"
              aria-current={isActive ? "step" : undefined}
              onClick={() => handleMove(idx)}
              variants={storyNodeVariants}
              animate={isActive ? "active" : "inactive"}
              whileHover={isActive ? undefined : { opacity: 0.7, scale: 0.99, filter: "blur(0px)" }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%",
                padding: spacing.sm,
                paddingLeft: 34,
                background: isActive
                  ? "linear-gradient(135deg, rgba(0,224,255,0.14) 0%, rgba(255,169,0,0.08) 100%)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? "rgba(0,224,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: borderRadius.lg,
                cursor: "pointer",
                textAlign: "left",
                outline: "none",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 180ms ease, background 180ms ease",
              }}
            >
              {/* progress dot */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: isDone ? "rgba(255, 194, 51, 0.95)" : isActive ? colors.accent.main : "rgba(255,255,255,0.25)",
                  boxShadow: isActive
                    ? "0 0 0 3px rgba(0,224,255,0.16), 0 0 18px rgba(0,180,255,0.30)"
                    : isDone
                    ? "0 0 0 3px rgba(255,194,51,0.12), 0 0 18px rgba(255,194,51,0.18)"
                    : "none",
                }}
              />

              {/* step + icon + title */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, minWidth: 0 }}>
                  <span
                    style={{
                      ...typography.caption,
                      color: isActive ? colors.text.primary : colors.text.muted,
                      fontSize: typography.fontSize.xs,
                      letterSpacing: "0.18em",
                      opacity: isActive ? 0.9 : 0.55,
                      padding: `2px 8px`,
                      borderRadius: borderRadius.full,
                      border: `1px solid ${isActive ? "rgba(0,224,255,0.30)" : "rgba(255,255,255,0.10)"}`,
                      background: isActive ? "rgba(0,224,255,0.08)" : "rgba(255,255,255,0.04)",
                      flexShrink: 0,
                    }}
                  >
                    {step}
                  </span>
                  <div style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }}>{tab.icon}</div>
                  <span
                    style={{
                      ...typography.h5,
                      color: isActive ? colors.text.primary : colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {nodeTitle}
                  </span>
                </div>

                {/* completed tick */}
                {isDone ? (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(255,194,51,0.12)",
                      border: "1px solid rgba(255,194,51,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon size={12} color="rgba(255, 194, 51, 0.95)" />
                  </div>
                ) : (
                  <div aria-hidden="true" style={{ width: 22, height: 22, flexShrink: 0 }} />
                )}
              </div>

              {/* subtle progress hint */}
              <div
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  fontSize: typography.fontSize.xs,
                  marginTop: 6,
                  opacity: isActive ? 0.75 : 0.55,
                  lineHeight: 1.45,
                }}
              >
                {tab.oneLiner}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* RIGHT: Living Content Panel (fixed height, depth swaps) */}
      <div
        style={{
          position: "relative",
          height: panelHeight,
          minHeight: panelHeight,
        }}
        aria-label="Narrative panel"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(10,16,32,0.62) 0%, rgba(10,16,32,0.48) 100%)",
            borderRadius: borderRadius["2xl"],
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 22px 70px rgba(0,0,0,0.55)",
            overflow: "hidden",
            backdropFilter: "blur(14px)",
          }}
        >
          {/* background shift per narrative */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`bg-${activeTab}`}
              initial={{ opacity: 0, scale: 1.02, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: (() => {
                  const tint = getPanelTint(activeTab);
                  return `radial-gradient(circle at 22% 18%, ${tint.a} 0%, transparent 58%), radial-gradient(circle at 85% 78%, ${tint.b} 0%, transparent 60%)`;
                })(),
                pointerEvents: "none",
              }}
            />
          </AnimatePresence>

          <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                variants={panelSwap}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                  height: "100%",
                  padding: spacing.lg,
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                }}
              >
                {/* top row: context */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
                  <div style={{ display: "flex", alignItems: "center", gap: spacing.sm, minWidth: 0 }}>
                    <div style={{ opacity: 0.95, flexShrink: 0 }}>{activeTabData.icon}</div>
                    <div
                      style={{
                        ...typography.caption,
                        color: colors.text.muted,
                        fontSize: typography.fontSize.xs,
                        letterSpacing: "0.18em",
                        opacity: 0.9,
                        whiteSpace: "nowrap",
                      }}
                    >
                      TIMELINE
                    </div>
                  </div>
                </div>

                {/* Lead */}
                <motion.div
                  initial={{ opacity: 0, x: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } }}
                  style={{
                    ...typography.body,
                    color: colors.text.primary,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    lineHeight: 1.35,
                    letterSpacing: "-0.01em",
                    textShadow: "0 10px 36px rgba(0,0,0,0.55)",
                  }}
                >
                  {narrative.lead}
                </motion.div>

                {/* Insight blocks */}
                <motion.div
                  variants={cardStagger}
                  initial="initial"
                  animate="animate"
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                    gap: spacing.sm,
                    marginTop: spacing.xs,
                  }}
                >
                  {narrative.insights.slice(0, 3).map((it) => (
                    <motion.div
                      variants={cardItem}
                      key={it.k}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: borderRadius.xl,
                        padding: spacing.md,
                        boxShadow: "0 12px 34px rgba(0,0,0,0.35)",
                        minWidth: 0,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", gap: spacing.sm, marginBottom: 6 }}>
                        <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.14em" }}>
                          {it.k}
                        </span>
                        <div
                          aria-hidden="true"
                          style={{
                            flex: 1,
                            height: 1,
                            background: "linear-gradient(90deg, rgba(0,224,255,0.22), transparent)",
                            opacity: 0.7,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          fontSize: typography.fontSize.sm,
                          lineHeight: 1.55,
                          opacity: 0.95,
                        }}
                      >
                        {it.v}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Directional line */}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: spacing.sm,
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "stretch" : "flex-end",
                    justifyContent: narrative.direction ? "space-between" : "flex-end",
                    gap: spacing.md,
                  }}
                >
                  {narrative.direction ? (
                    <div style={{ ...typography.caption, color: colors.text.muted, fontSize: typography.fontSize.sm, opacity: 0.9, maxWidth: isMobile ? "100%" : "46ch" }}>
                      {narrative.direction}
                    </div>
                  ) : null}

                  <StoryNavDock
                    currentIndex={activeIndex}
                    total={safeTabs.length}
                    onPrev={() => handleMove(activeIndex - 1)}
                    onNext={() => handleMove(activeIndex + 1)}
                    canPrev={activeIndex > 0}
                    canNext={activeIndex < safeTabs.length - 1}
                    isMobile={isMobile}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const reduceMotion = useReducedMotion();
  // Use centralized animation hook
  const {
    sectionVariants,
    headingVariants,
    subheadingVariants,
    cardVariants,
    listItemVariants,
    statVariants,
    imageVariants,
    imageFloatVariants,
    heroVariants,
    heroContentVariants,
    buttonVariants,
    cardHover,
    imageHover,
    primaryButtonHover,
    primaryButtonTap,
    secondaryButtonHover,
    secondaryButtonTap,
    staggerContainer,
    viewportOnce,
    getStaggeredCard,
    getStaggeredListItem,
  } = useHomepageAnimation();

  // Parallax for hero background
  const heroParallax = useHeroParallax({ speed: 0.15 });

  const [upcomingFixtures, setUpcomingFixtures] = useState<PublicFixture[]>([]);
  const [recentResults, setRecentResults] = useState<PublicFixture[]>([]);
  const [fixturesLoading, setFixturesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"fixtures" | "results">("fixtures");
  const [products, setProducts] = useState<any[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [centresLoading, setCentresLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  // NOTE: Trophy Cabinet is intentionally NOT rendered in the Hero.
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackImageRef = useRef<HTMLDivElement>(null);
  // integratedFallbackRef removed (background is now handled by the Story Weave wrapper)
  const heroVideoRef = useRef<HTMLIFrameElement>(null);
  const overlayVideoRef = useRef<HTMLIFrameElement>(null);
  const productsFetchedRef = useRef(false);
  const centresFetchedRef = useRef(false);

  // =========================================================
  // Post-hero STORY WEAVE (Act 1 → Act 2 → Act 3) scroll logic
  // =========================================================
  // Post-hero Story Weave: shared scroll progression across Act 1 (our-story) + Act 2/3 (integrated-program)
  const storyWeaveRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: weaveP } = useScroll({
    target: storyWeaveRef,
    offset: ["start end", "end start"],
  });

  const weaveBgScale = useTransform(weaveP, [0, 1], reduceMotion ? [1, 1] : [1.06, 1]);
  const weaveBgY = useTransform(weaveP, [0, 1], reduceMotion ? [0, 0] : [-40, 40]);
  const weaveBgOpacity = useTransform(weaveP, [0, 0.18, 1], reduceMotion ? [0.12, 0.12, 0.12] : [0.22, 0.16, 0.12]);

  const act1Opacity = useTransform(weaveP, [0, 0.08, 0.40, 0.55], [0, 1, 1, 0.15]);
  const act1Y = useTransform(weaveP, [0.30, 0.62], reduceMotion ? [0, -20] : [0, -80]);
  const act1Scale = useTransform(weaveP, [0.30, 0.62], reduceMotion ? [1, 0.99] : [1, 0.96]);

  const trophyFloatY = useTransform(weaveP, [0.06, 0.22], reduceMotion ? [0, 0] : [18, 0]);
  const trophyFloatOpacity = useTransform(weaveP, [0.05, 0.14], [0, 1]);

  const act2Opacity = useTransform(weaveP, [0.40, 0.54, 0.86], [0, 1, 1]);
  const act2Y = useTransform(weaveP, [0.40, 0.56], reduceMotion ? [8, 0] : [34, 0]);
  const act3Opacity = useTransform(weaveP, [0.64, 0.78, 1], [0, 1, 1]);
  const act3Y = useTransform(weaveP, [0.64, 0.80], reduceMotion ? [8, 0] : [28, 0]);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure video starts playing immediately on load - YouTube autoplay requires visible iframe
  useEffect(() => {
    // Force video to be visible immediately for autoplay to work
    if (heroVideoRef.current) {
      heroVideoRef.current.style.opacity = "0.7";
      // Ensure iframe is in viewport for autoplay
      heroVideoRef.current.style.visibility = "visible";
    }
    // Ensure overlay video is visible and playing
    if (overlayVideoRef.current) {
      overlayVideoRef.current.style.opacity = "1";
      overlayVideoRef.current.style.visibility = "visible";
    }
  }, []);

  // Fetch fixtures from API
  useEffect(() => {
    const loadFixtures = async () => {
      try {
        setFixturesLoading(true);
        const data = await api.getPublicFixtures();
        setUpcomingFixtures(data.upcoming || []);
        setRecentResults(data.results || []);
      } catch (error) {
        console.error("Failed to load fixtures:", error);
        setUpcomingFixtures([]);
        setRecentResults([]);
      } finally {
        setFixturesLoading(false);
      }
    };
    loadFixtures();
  }, []);

  const latestResult = useMemo<PublicFixture | null>(() => {
    if (fixturesLoading) return null;
    return (recentResults && recentResults.length > 0 ? recentResults[0] : DUMMY_LAST_RESULT);
  }, [fixturesLoading, recentResults]);

  // Handle navigation to section when navigating from other pages
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }, 300);
    }
  }, []);

  // Fetch featured products
  useEffect(() => {
    if (productsFetchedRef.current) return; // prevent dev double fetch
    productsFetchedRef.current = true;
    const loadProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data); // Show all products for homepage marquee (marquee may cap if list is huge)
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };
    loadProducts();
  }, []);

  // Fetch centres
  useEffect(() => {
    if (centresFetchedRef.current) return; // prevent dev double fetch
    centresFetchedRef.current = true;
    const loadCentres = async () => {
      try {
        setCentresLoading(true);
        const data = await api.getPublicCentres();
        setCentres(data);
      } catch (error) {
        console.error("Error loading centres:", error);
        setCentres([]);
      } finally {
        setCentresLoading(false);
      }
    };
    loadCentres();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (timeString: string) => {
    return timeString || "TBD";
  };

  const handleOpenInMaps = (centre: Centre) => {
    if (centre.googleMapsUrl) {
      window.open(centre.googleMapsUrl, "_blank");
    } else if (centre.latitude && centre.longitude) {
      // Fallback: create Google Maps URL from coordinates
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${centre.latitude},${centre.longitude}`,
        "_blank"
      );
    }
  };

  return (
    <div
      style={{
        position: "relative",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
        overflowX: "hidden",
        overflowY: "visible",
        width: "100%",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Subtle fixed header that stays visible */}
      <div
        style={{
          position: "fixed",
          top: spacing.sm,
          left: 0,
          right: 0,
          zIndex: 1200,
          padding: `0 ${spacing.md}`,
          pointerEvents: "auto",
          background: "transparent",
        }}
      >
        <PublicHeader />
      </div>
      <style>{`
        #vision-2026 { display: none !important; }
        .hero-link:focus-visible {
          outline: 2px solid rgba(255, 169, 0, 0.75);
          outline-offset: 3px;
          border-radius: 16px;
        }
      `}</style>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          paddingTop: 0,
          position: "relative",
          overflow: "visible",
          overflowY: "visible",
        }}
      >
      {/* 1. HERO SECTION - STUNNING INTERACTIVE EXPERIENCE */}
      <motion.section
        ref={heroParallax.ref}
        id="hero"
        variants={heroVariants}
        initial="initial"
        animate="animate"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: isMobile ? "120px" : "140px", // Fixed header overlap - increased padding
          // Reserve space for the scroll cue so it never overlaps the bottom-most CTA
          paddingBottom: spacing["4xl"],
          overflow: "hidden",
        }}
      >
        {/* Multi-layer Background System */}
        {/* Layer 1: Background Video (desktop only) - Only visible in hero section with infinity flow */}
        <motion.div
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            width: "177.77777778vh",
            height: "120vh",
            minWidth: "100%",
            minHeight: "calc(56.25vw + 20vh)",
            transform: "translateX(-50%) scale(1.2)",
            zIndex: -1,
            opacity: 0.7,
            overflow: "hidden",
            pointerEvents: "none",
          }}
          initial={{ opacity: 0.7 }}
        >
          <iframe
            ref={heroVideoRef}
            src={`${heroAssets.backgroundVideoEmbed}&fs=0&cc_load_policy=0&mute=1&autoplay=1&loop=1&playlist=_iplvxf8JCo&controls=0&showinfo=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=0`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
              pointerEvents: "none",
              opacity: 1,
            }}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen={false}
            loading="eager"
            title="Background Video"
        />
        </motion.div>
        
        {/* Layer 2: Background image fallback with parallax */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${heroAssets.teamBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            zIndex: -1,
            display: "none",
            y: heroParallax.y,
            opacity: heroParallax.opacity,
          }}
        />

        {/* Layer 4: Video background with animated gradient overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            overflow: "hidden",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* YouTube Video Background - Full coverage with no thumbnail */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
            initial={{ opacity: 1 }}
          >
            <iframe
              ref={overlayVideoRef}
              src="https://www.youtube-nocookie.com/embed/_iplvxf8JCo?autoplay=1&mute=1&loop=1&playlist=_iplvxf8JCo&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=0&start=0&fs=0&cc_load_policy=0&showinfo=0&origin=https://www.youtube.com"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100vw",
                height: "56.25vw",
                minWidth: "177.77777778vh",
                minHeight: "100vh",
                transform: "translate(-50%, -50%)",
                border: "none",
                pointerEvents: "none",
                opacity: 1,
              }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
              loading="eager"
              title="Overlay Background Video"
            />
          </motion.div>
          {/* Stadium Light Overlay - Soft Vignette for Football-First Feel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              // Soft vignette effect - stadium light feel
              background: `radial-gradient(ellipse at center top, transparent 0%, rgba(2,12,27,0.4) 40%, rgba(2,12,27,0.85) 100%),
                          linear-gradient(135deg, rgba(10,61,145,0.15) 0%, transparent 50%, rgba(245,179,0,0.08) 100%)`,
            zIndex: 1,
              pointerEvents: "none",
          }}
        />
        
        {/* Pitch Texture Gradient Overlay - Subtle Football Field Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            // Subtle pitch grid pattern overlay
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px),
              repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(10,61,145,0.03) 100px, rgba(10,61,145,0.03) 200px)
            `,
            opacity: 0.4,
          }}
        />
        
        {/* FC Real Bengaluru Strip Motif - Diagonal Club Strip */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: "20%",
            left: "-10%",
            width: "40%",
            height: "8px",
            background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.accent.main} 50%, ${colors.primary.main} 100%)`,
            transform: "rotate(-12deg)",
            zIndex: 2,
            boxShadow: `0 0 20px ${colors.primary.main}40`,
            opacity: 0.6,
          }}
        />
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: "25%",
            left: "-8%",
            width: "35%",
            height: "6px",
            background: `linear-gradient(90deg, ${colors.accent.main} 0%, ${colors.primary.main} 50%, ${colors.accent.main} 100%)`,
            transform: "rotate(-12deg)",
            zIndex: 2,
            boxShadow: `0 0 15px ${colors.accent.main}40`,
            opacity: 0.5,
          }}
        />
        </motion.div>

        {/* Stadium Light Effect - Subtle, Warm, Football-Focused */}
        <motion.div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse, rgba(245,179,0,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
            zIndex: 1,
            transform: "translateX(-50%)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* LAYER 2: HERO HOOK (Revamped) */}
        <div
          style={{
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            padding: `0 ${spacing.xl}`,
            position: "relative",
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.15fr 0.85fr",
            gap: isMobile ? spacing["2xl"] : spacing["3xl"],
                alignItems: "center",
            minHeight: "calc(100vh - 96px)",
            paddingBottom: spacing["3xl"],
          }}
        >
          {/* LEFT: Message + Primary actions */}
          <motion.div 
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: "860px" }}
          >
            {/* Floating Stat Badges - Football Broadcast Style */}
            {!isMobile && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
                    position: "absolute",
                    top: "10%",
                    right: "5%",
                    padding: `${spacing['8']} ${spacing['16']}`,
                    borderRadius: borderRadius.button,
                    background: colors.surface.card,
                    border: `1px solid ${colors.accent.main}40`,
                    boxShadow: shadows.card,
                    backdropFilter: "blur(12px)",
                    zIndex: 5,
                  }}
                >
                  <div style={{ ...typography.overline, color: colors.text.muted, fontSize: "10px", marginBottom: 2 }}>FOUNDED</div>
                  <div style={{ ...typography.h5, color: colors.accent.main, margin: 0, fontWeight: typography.fontWeight.bold }}>2024</div>
                </motion.div>
                
            <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    top: "20%",
                    right: "8%",
                    padding: `${spacing['8']} ${spacing['16']}`,
                    borderRadius: borderRadius.button,
                    background: colors.surface.card,
                    border: `1px solid ${colors.primary.main}40`,
                    boxShadow: shadows.card,
                    backdropFilter: "blur(12px)",
                    zIndex: 5,
                  }}
                >
                  {/* Floating hero stat badges removed as requested */}
                </motion.div>
              </>
            )}

            {/* Club identity lockup (logo + full name) */}
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.md,
                padding: isMobile ? "8px 12px" : "10px 14px",
                borderRadius: borderRadius.full,
                background: "rgba(10, 16, 32, 0.42)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 18px 56px rgba(0,0,0,0.55)",
                backdropFilter: "blur(14px)",
                marginBottom: spacing.lg,
              }}
              aria-label="FC Real Bengaluru"
            >
              <img
                src="/fcrb-logo.png"
                alt="FC Real Bengaluru logo"
                style={{
                  width: isMobile ? 34 : 40,
                  height: isMobile ? 34 : 40,
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 10px 26px rgba(0,0,0,0.45), 0 0 18px rgba(0,224,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  flexShrink: 0,
                }}
                loading="eager"
              />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <div
                style={{
                  ...typography.overline,
                    color: colors.text.muted,
                    letterSpacing: "0.16em",
                    opacity: 0.9,
                  }}
                >
                  FOOTBALL CLUB
                </div>
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.primary,
                    fontWeight: typography.fontWeight.bold,
                    letterSpacing: "-0.01em",
                    fontSize: isMobile ? typography.fontSize.lg : typography.fontSize.xl,
                    textShadow: "0 6px 28px rgba(0,0,0,0.65)",
                  }}
                >
                  FC Real Bengaluru
                </div>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              style={{
                ...typography.display,
                fontSize: `clamp(3.2rem, 8.6vw, 6.2rem)`,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                lineHeight: 1.02,
                fontWeight: typography.fontWeight.bold,
                letterSpacing: "-0.03em",
                textShadow: "0 6px 50px rgba(0, 0, 0, 0.85), 0 0 70px rgba(0, 224, 255, 0.18)",
              }}
            >
              <motion.span
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                A Revolution
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                Begins{" "}
                <span
                style={{ 
                    background: `linear-gradient(90deg, ${colors.accent.main}, rgba(255, 194, 51, 0.95))`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow: "none",
                }}
              >
                In Bengaluru.
                </span>
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 0.92, y: 0 }}
              transition={{ delay: 0.6, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...typography.body,
                fontSize: `clamp(${typography.fontSize.lg}, 2vw, ${typography.fontSize.xl})`,
                color: colors.text.secondary,
                marginBottom: spacing.xl,
                lineHeight: 1.75,
                maxWidth: "720px",
                textShadow: "0 2px 24px rgba(0, 0, 0, 0.65)",
              }}
            >
              It’s more than a club, coaching meets community, and data supports development. Join the journey to the top of Indian football
            </motion.p>

            {/* Primary CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{ 
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: spacing.md, 
                alignItems: "stretch",
                maxWidth: isMobile ? "100%" : "680px",
              }}
            >
              {/* Football-First CTA Buttons - Solid, Bold, Sports Badge Style */}
              <Link
                to="/shop"
                className="hero-link"
                style={{ textDecoration: "none", width: "100%" }}
              >
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: `${spacing.lg} ${spacing.xl}`,
                    borderRadius: borderRadius.button,
                    background: colors.primary.main, // Royal blue - solid club color
                    border: "none",
                    boxShadow: shadows.button,
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                    cursor: "pointer",
                    width: "100%",
                    minHeight: 72, // Increased tap area
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={{ ...typography.body, color: colors.text.onPrimary, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg }}>
                      Support the Club
                    </span>
                    <span style={{ ...typography.caption, color: "rgba(255,255,255,0.85)", fontSize: typography.fontSize.sm }}>
                      Shop official FC Real Bengaluru merchandise
                    </span>
                  </div>
                  <ArrowRightIcon size={20} color={colors.text.onPrimary} style={{ flexShrink: 0 }} />
                </motion.div>
              </Link>

              <Link to="/programs" className="hero-link" style={{ textDecoration: "none", width: "100%" }}>
                <motion.div
                  whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                  whileTap={{ scale: 0.98 }}
                    style={{
                    padding: `${spacing.lg} ${spacing.xl}`,
                    borderRadius: borderRadius.button,
                    background: colors.accent.main, // FC Real Bengaluru gold - solid club color
                    border: "none",
                    boxShadow: shadows.button,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.md,
                    cursor: "pointer",
                    width: "100%",
                    minHeight: 72, // Increased tap area
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "left" }}>
                    <span style={{ ...typography.body, color: colors.text.onAccent, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg }}>
                      Train With Us
                    </span>
                    <span style={{ ...typography.caption, color: "rgba(2,12,27,0.85)", fontSize: typography.fontSize.sm }}>
                      Explore competitive coaching pathways
                    </span>
                  </div>
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
                  >
                    <ArrowRightIcon size={20} color={colors.text.onAccent} />
                  </motion.div>
                </motion.div>
              </Link>
                </motion.div>

            {/* Join the Journey CTA - Football Badge Style */}
            <a
              href="#content-stream"
              className="hero-link"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("content-stream");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTimeout(() => {
                    const fanClubSection = document.querySelector('#fan-club-teaser') as HTMLElement | null;
                    if (fanClubSection) fanClubSection.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }
              }}
              style={{ textDecoration: "none", display: "block" }}
              aria-label="Join the Journey — discover the Fanclub for exclusive gifts and VIP access"
            >
                <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
                whileTap={{ scale: 0.99 }}
                    style={{
                  marginTop: spacing.md,
                  width: "100%",
                  maxWidth: isMobile ? "100%" : "680px",
                  padding: `${spacing.lg} ${spacing.xl}`,
                  borderRadius: borderRadius.button,
                  background: colors.surface.card, // Dark card background
                  border: `2px solid ${colors.accent.main}`, // Gold border - sports badge feel
                  boxShadow: shadows.button,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: spacing.md }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: colors.accent.main, // Gold background
                      border: `2px solid ${colors.accent.main}`,
                      display: "flex", 
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: shadows.sm,
                      flexShrink: 0,
                    }}
                  >
                    <StarIcon size={20} style={{ color: colors.text.onAccent }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.primary,
                        fontWeight: typography.fontWeight.bold,
                      fontSize: typography.fontSize.lg,
                        lineHeight: 1.25,
                        marginBottom: 4,
                      }}
                    >
                      Join the Journey
                    </div>
                    <div
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                        lineHeight: 1.5,
                      }}
                    >
                      Fanclub benefits: <span style={{ color: colors.accent.main, fontWeight: typography.fontWeight.semibold }}>exclusive gifts</span>,{" "}
                      <span style={{ color: colors.accent.main, fontWeight: typography.fontWeight.semibold }}>VIP access</span>, member-only drops
                    </div>
                  </div>

                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
                  >
                    <ArrowRightIcon size={20} color={colors.accent.main} />
                </motion.div>
                </div>
            </motion.div>
            </a>
          </motion.div>

          {/* RIGHT: Interactive CTA cards (removed per request) */}
        </div>

        {/* SCROLL INDICATOR - Match Scoreboard Ticker Style */}
        <motion.div
          style={{
            position: "absolute",
            bottom: spacing.xl,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: spacing.sm,
            pointerEvents: "none",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Match Scoreboard Ticker Style */}
          <div
            style={{
              padding: `${spacing.xs} ${spacing.md}`,
              borderRadius: borderRadius.button,
              background: "rgba(10,61,145,0.85)",
              border: `1px solid ${colors.accent.main}`,
              boxShadow: shadows.button,
              display: "flex",
              alignItems: "center",
              gap: spacing.sm,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
            style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: colors.accent.main,
                boxShadow: `0 0 8px ${colors.accent.main}`,
              }}
            />
            <span
              style={{
                ...typography.caption,
                color: colors.text.primary,
                fontWeight: typography.fontWeight.bold,
              letterSpacing: "0.1em",
                fontSize: "11px",
            }}
          >
              SCROLL
            </span>
          </div>
          <motion.div
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{ color: colors.accent.main }}
            >
              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </motion.div>

        {/* Bottom fade gradient for seamless transition */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: `linear-gradient(to bottom, 
              transparent 0%, 
              rgba(5, 11, 32, 0.3) 50%, 
              rgba(5, 11, 32, 0.6) 100%)`,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />

        {/* Mobile Optimizations & Video Fixes */}
        <style>{`
          /* Prevent overflow and ensure smooth flow */
          * {
            box-sizing: border-box;
          }
          
          @media (max-width: 768px) {
            #hero > div {
              padding: 0 ${spacing.md} !important;
            }
            #hero .text-content-mobile {
              text-align: center;
              padding-bottom: ${spacing.xl} !important;
            }
            #hero iframe {
              display: none !important;
            }
            
            /* Reduce bridge padding on mobile */
            section[style*="bridge"] {
              padding-top: 80px !important;
              padding-bottom: 80px !important;
              margin-top: -50px !important;
              margin-bottom: -50px !important;
            }
            
            /* Ensure no horizontal overflow */
            section {
              max-width: 100vw !important;
              overflow-x: hidden !important;
            }
          }
          
          /* Hide YouTube thumbnail, branding, and prevent black bars */
          #hero iframe {
            pointer-events: none !important;
          }
          
          /* Ensure video covers full area without black bars on desktop */
          @media (min-width: 769px) {
            #hero iframe {
              width: 177.77777778vh !important;
              height: 100vh !important;
              min-width: 100% !important;
              min-height: 56.25vw !important;
              transform: translate(-50%, -50%) scale(1.2) !important;
              overflow: hidden !important;
            }
          }
          
          /* Ensure all sections respect viewport */
          section {
            max-width: 100vw;
            overflow-x: hidden;
          }
          
          /* Fix any absolute positioned elements that might overflow */
          [style*="position: absolute"] {
            max-width: 100vw;
          }
          
          /* Responsive match cards */
          @media (max-width: 768px) {
            .match-card {
              grid-template-columns: 1fr !important;
              text-align: center !important;
            }
            
            /* Stack match card elements vertically on mobile */
            .match-card > div {
              justify-content: center !important;
            }
          }
          
          /* Ensure all content containers respect max-width */
          [style*="maxWidth"] {
            width: 100% !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          @media (max-width: 768px) {
            [style*="maxWidth"] {
              padding-left: 0.75rem !important;
              padding-right: 0.75rem !important;
            }
          }
        `}</style>
      </motion.section>

      {/* 2. COMBINED: ORIGIN STORY & DEBUT SEASON 2024 */}
      <InfinitySection
        id="origin"
        bridge={true}
        style={{
          display: "none", // merged into hero above
        }}
      >
        {/* Background - Match Photo (Extended Height) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{
            position: "absolute",
            top: "-10%",
            left: 0,
            right: 0,
            bottom: "-10%",
            backgroundImage: `url(/assets/DSC00893.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            opacity: 0.15,
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />
        
        {/* Dark Overlay for better text readability */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `rgba(5, 11, 32, 0.6)`,
            zIndex: 1,
          }}
        />
        
        {/* Gradient Overlay - matching other sections */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, 
              rgba(4, 61, 208, 0.4) 0%, 
              rgba(255, 169, 0, 0.3) 100%)`,
            zIndex: 2,
          }}
        />
        
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 3, width: "100%" }}>
          {/* Unified Content Container */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            style={{
              maxWidth: "1400px",
              margin: 0,
            }}
          >
            {/* Origin Story Section */}
            <motion.div variants={headingVariants} style={{ marginBottom: spacing["3xl"] }}>
              <motion.div
                style={{
                  display: "inline-block",
                  padding: `${spacing.xs} ${spacing.md}`,
                  background: "rgba(0, 224, 255, 0.1)",
                  border: `1px solid ${colors.accent.main}`,
                  borderRadius: borderRadius.full,
                  marginBottom: spacing.lg,
                }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em" }}>
                  WHERE IT ALL BEGAN
                </span>
              </motion.div>
              <motion.h2
                style={{
                  ...typography.h1,
                  fontSize: `clamp(2.5rem, 5vw, 4rem)`,
                  color: colors.text.primary,
                  marginBottom: spacing.lg,
                  lineHeight: 1.2,
                  textAlign: "left",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Born in the Heart of
                <br />
                <span style={{ color: colors.accent.main }}>Bengaluru, Karnataka</span>
              </motion.h2>
              <motion.p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
                  lineHeight: 1.8,
                  marginBottom: spacing.xl,
                  textAlign: "left",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                In 2024, a vision was born in the vibrant city of Bengaluru. FC Real Bengaluru emerged not just as another football club, but as a movement—a commitment to revolutionize Indian football through innovation, community, and unwavering dedication to excellence.
              </motion.p>
              <motion.p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.base,
                  color: colors.text.muted,
                  lineHeight: 1.8,
                  textAlign: "left",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Rooted in Karnataka's rich football culture, we set out to build something different. Something sustainable. Something that would stand the test of time.
              </motion.p>
            </motion.div>
            
            {/* Seamless Transition to Debut Season */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: false, amount: 0.2 }}
              style={{
                textAlign: "left",
              }}
            >
        <motion.div
              initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: false }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.sm,
                padding: `${spacing.sm} ${spacing.lg}`,
                background: `linear-gradient(135deg, ${colors.accent.main}15 0%, ${colors.primary.main}15 100%)`,
                border: `1px solid ${colors.accent.main}40`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.xl,
                backdropFilter: "blur(10px)",
                boxShadow: `0 8px 32px ${colors.accent.main}20`,
              }}
            >
              <TrophyIcon size={16} color={colors.accent.main} />
              <span style={{ 
                ...typography.overline, 
                color: colors.accent.main, 
                letterSpacing: "0.2em",
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.sm,
              }}>
                DEBUT SEASON 2024
              </span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false }}
              style={{
                ...typography.h1,
                fontSize: `clamp(3.5rem, 8vw, 6.5rem)`,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing.lg,
                lineHeight: 1.1,
                textShadow: `0 4px 20px rgba(255, 169, 0, 0.3)`,
                letterSpacing: "-0.02em",
              }}
            >
              A{" "}
              <motion.span 
                style={{ 
                  color: colors.accent.main,
                  background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.light} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                }}
                animate={{
                  textShadow: [
                    `0 0 20px ${colors.accent.main}40`,
                    `0 0 40px ${colors.accent.main}60`,
                    `0 0 20px ${colors.accent.main}40`,
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Statement
              </motion.span>{" "}
              Season
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: false }}
              style={{
                ...typography.body,
                fontSize: `clamp(${typography.fontSize.lg}, 2.5vw, ${typography.fontSize["2xl"]})`,
                color: colors.text.secondary,
                maxWidth: "900px",
                margin: 0,
                lineHeight: 1.9,
                fontWeight: typography.fontWeight.medium,
                letterSpacing: "0.01em",
                marginBottom: spacing["3xl"],
              }}
            >
              Champions in D Division. Runners-up in C Division. In our debut season, we didn't just compete—we conquered.
            </motion.p>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(350px, 100%), 1fr))",
              gap: spacing["2xl"],
              marginTop: spacing["2xl"],
              maxWidth: "1400px",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            {[
              { 
                label: "D Division", 
                value: "Champions", 
                subValue: "Unbeaten",
                Icon: TrophyIcon,
                gradient: `linear-gradient(135deg, rgba(255, 169, 0, 0.3) 0%, rgba(255, 194, 51, 0.3) 100%)`,
                glowColor: colors.accent.main,
                description: "Perfect record. Perfect season.",
              },
              { 
                label: "C Division", 
                value: "Runners-Up", 
                subValue: "Second Place",
                Icon: MedalIcon,
                gradient: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(45, 95, 232, 0.3) 100%)`,
                glowColor: colors.primary.main,
                description: "One step from the top.",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: idx * 0.15,
                  type: "spring",
                  stiffness: 100,
                }}
                viewport={{ once: false, amount: 0.3 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 },
                }}
                style={{
                  position: "relative",
                  background: `linear-gradient(135deg, 
                    rgba(20, 31, 58, 0.95) 0%, 
                    rgba(15, 23, 42, 0.9) 100%)`,
                  backdropFilter: "blur(10px)",
                  borderRadius: borderRadius.xl,
                  padding: spacing["2xl"],
                  textAlign: "center",
                  border: `1px solid rgba(255, 255, 255, 0.15)`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
                  overflow: "hidden",
                }}
              >
                {/* Card Background Gradient */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: stat.gradient,
                    opacity: 0.3,
                    zIndex: 0,
                  }}
                />
                
                {/* Animated Glow Effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: idx * 0.5,
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "200px",
                    height: "200px",
                    background: `radial-gradient(circle, ${stat.glowColor}30 0%, transparent 70%)`,
                    borderRadius: "50%",
                    filter: "blur(40px)",
                    zIndex: 0,
                  }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                  {/* Icon Container */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: idx * 0.15 + 0.3,
                      type: "spring",
                      stiffness: 150,
                    }}
                    viewport={{ once: false }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${stat.glowColor}20 0%, ${stat.glowColor}10 100%)`,
                      border: `2px solid ${stat.glowColor}40`,
                      marginBottom: spacing.xl,
                      boxShadow: `0 0 30px ${stat.glowColor}30`,
                    }}
                  >
                    <stat.Icon 
                      size={48} 
                      color={stat.glowColor}
                      style={{
                        filter: `drop-shadow(0 0 10px ${stat.glowColor}60)`,
                      }}
                    />
                  </motion.div>

                  {/* Value */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.15 + 0.5 }}
                    viewport={{ once: false }}
                    style={{
                      marginBottom: spacing.xs,
                    }}
                  >
                    <div
                      style={{
                        ...typography.h2,
                        fontSize: `clamp(2rem, 4vw, 3rem)`,
                        color: stat.glowColor,
                        fontWeight: typography.fontWeight.bold,
                        textShadow: `0 4px 20px ${stat.glowColor}40`,
                        letterSpacing: "0.02em",
                        lineHeight: 1.1,
                      }}
                    >
                      {stat.value}
                    </div>
                  </motion.div>

                  {/* Sub Value */}
                    {stat.subValue && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.15 + 0.6 }}
                      viewport={{ once: false }}
                        style={{
                          ...typography.body,
                  fontSize: typography.fontSize.lg,
                          color: colors.text.secondary,
                        marginBottom: spacing.sm,
                          fontWeight: typography.fontWeight.medium,
                        }}
                      >
                        {stat.subValue}
                  </motion.div>
                  )}

                  {/* Description */}
                  {stat.description && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.15 + 0.7 }}
                      viewport={{ once: false }}
                      style={{
                        ...typography.caption,
                        fontSize: typography.fontSize.xs,
                        color: colors.text.muted,
                        marginBottom: spacing.md,
                        fontStyle: "italic",
                        lineHeight: 1.4,
                      }}
                    >
                      {stat.description}
                    </motion.div>
                  )}

                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: idx * 0.15 + 0.8 }}
                    viewport={{ once: false }}
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.lg,
                      color: colors.text.muted,
                      fontWeight: typography.fontWeight.medium,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </motion.div>
                </div>
              </motion.div>
            ))}
            </motion.div>
          </motion.div>
        </div>
      </InfinitySection>

      {/* 4. 2026 VISION - I-LEAGUE 3 (removed) */}

      {/* Post-Hero Story Weave Wrapper (Act 1 → Act 2 → Act 3) - Smooth Continuity */}
      {/* Backgrounds for each act are now handled per-section, wrapper is transparent */}
      <div
        ref={storyWeaveRef}
        style={{
          position: "relative",
          background: "transparent",
          overflow: "visible",
        }}
      >

      {/* 6. OUR STORY (teaser) — full story moved to /about */}
      <InfinitySection
        id="our-story"
        bridge={false}
        style={{
          padding: 0,
          margin: 0,
          minHeight: "100vh",
          height: "100vh",
          background: "transparent", // Explicitly transparent to allow backgroundImage
          backgroundImage: "url('/assets/20251007-DSC_0535.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed", // Fixed attachment for full coverage
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Content wrapper with padding - transparent to show background image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: isMobile ? `${spacing['48']} ${spacing.xl}` : `${spacing['64']} ${spacing.xl}`,
            background: "transparent", // Explicitly transparent
            zIndex: 1,
          }}
        >
          <motion.div
            style={{
            maxWidth: "1100px",
            margin: "0 auto",
            position: "relative",
            zIndex: 3, // Above background layers
            width: "100%",
            padding: isMobile ? `${spacing.xl} ${spacing.md}` : `${spacing["2xl"]} ${spacing.xl}`, // Horizontal padding for readable text zones
            opacity: act1Opacity,
            y: act1Y,
            scale: act1Scale,
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
                style={{
              display: "inline-flex",
              alignItems: "center",
              gap: spacing.sm,
                  padding: `${spacing.xs} ${spacing.md}`,
              background: colors.surface.soft, // Football-first background
              border: `1px solid ${colors.accent.main}40`, // Subtle accent border
                  borderRadius: borderRadius.full,
              backdropFilter: "blur(12px)",
              boxShadow: shadows.sm, // Sports broadcast style
                  marginBottom: spacing.lg,
                }}
          >
            <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em" }}>OUR STORY</span>
          </div>

          <h2
                style={{
                  ...typography.h1,
              fontSize: `clamp(2.2rem, 5vw, 3.4rem)`,
                  color: colors.text.primary,
              marginBottom: spacing.md,
              lineHeight: 1.12,
              fontWeight: typography.fontWeight.bold,
              letterSpacing: "-0.02em",
              textShadow: "0 8px 56px rgba(0,0,0,0.65)",
            }}
          >
            Born in <span style={{ color: colors.accent.main }}>2024</span>, Built for{" "}
            <span style={{ color: colors.primary.main }}>Tomorrow</span>
          </h2>

          <p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
              maxWidth: "72ch",
              margin: `0 auto ${spacing.lg}`,
              lineHeight: 1.85,
              opacity: 0.92,
              textShadow: "0 4px 28px rgba(0,0,0,0.55)",
            }}
          >
            FC Real Bengaluru is a relatively new club that is making its mark in the Indian football landscape. Founded recently, it has quickly established itself as a force to be reckoned with in the KSFA Super Division, while winning the D division and finishing as runner's up in C Division. With a strong emphasis on youth development using data and a commitment to building a winning culture, FC Real Bengaluru aims to climb the Indian football ladder and achieve national and international success.
          </p>

          <Link to="/about" className="hero-link" style={{ textDecoration: "none", display: "inline-block" }}>
              <motion.div
              whileHover={{ y: -2, boxShadow: shadows.buttonHover }}
              whileTap={{ scale: 0.98 }}
                    style={{
                display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                gap: spacing.sm,
                padding: `${spacing.md} ${spacing.xl}`, // 16px 32px - readable text zones
                borderRadius: borderRadius.button, // 8px - football-first
                background: colors.primary.main, // Royal blue - football-first solid button
                border: "none",
                boxShadow: shadows.button, // Sports broadcast style
                color: colors.text.onPrimary,
                transition: "all 0.2s ease",
                fontWeight: typography.fontWeight.bold, // Bold for football-first
              }}
            >
              <span style={{ ...typography.body, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold }}>
                To know more About Us
              </span>
              <ArrowRightIcon size={18} color={colors.text.onPrimary} />
                  </motion.div>
          </Link>
        </motion.div>
        </div>
      </InfinitySection>

        {/* 5. INTEGRATED FOOTBALL PROGRAM - Teams, Tech, Data & Training */}
      <InfinitySection
          id="integrated-program"
        bridge={true}
        style={{
            // Match "OUR STORY" full-bleed background (image 1) to avoid framed edges.
            // Keep outer padding at 0 so the background is edge-to-edge; add padding in an inner wrapper.
            padding: 0,
            margin: 0,
            background: "transparent", // Explicitly transparent to allow backgroundImage
            backgroundImage: "url('/assets/20251007-DSC_0535.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Content wrapper with padding - transparent to show background image */}
        <motion.div
          style={{
            position: "relative",
            width: "100%",
            zIndex: 1,
            padding: isMobile ? `${spacing.sectionGap} ${spacing.lg}` : `${spacing.sectionGap} ${spacing.xl}`,
            background: "transparent",
          }}
        >
        <motion.div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2, opacity: act2Opacity, y: act2Y }}>
          {/* Unified Header */}
          <motion.div
            style={{ textAlign: "center", marginBottom: spacing["3xl"] }}
            variants={headingVariants}
              initial="offscreen"
              whileInView="onscreen"
            viewport={viewportOnce}
          >
            <motion.div
              style={{
                display: "inline-block",
                padding: `${spacing.xs} ${spacing.md}`,
                background: colors.surface.soft, // Football-first background
                border: `1px solid ${colors.accent.main}40`, // Subtle accent border
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
                boxShadow: shadows.sm, // Sports broadcast style
              }}
            >
              <span style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em" }}>
                OUR FOOTBALL PROGRAM
              </span>
            </motion.div>
            <h2
              style={{
                ...typography.h1,
                fontSize: `clamp(2.5rem, 5vw, 4rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
              }}
            >
              Competing Across <span style={{ color: colors.accent.main }}>Leagues</span>,{" "}
              <span style={{ color: colors.primary.main }}>Powered by</span>{" "}
              <span style={{ color: colors.accent.main }}>Innovation</span>
            </h2>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                maxWidth: "900px",
                margin: "0 auto",
                lineHeight: 1.8,
              }}
              variants={subheadingVariants}
            >
              Our teams actively compete across multiple leagues, representing FC Real Bengaluru at every level. We enable this through RealVerse, data-driven insights, and top-tier coaching—creating a unified pathway from grassroots to professional football.
            </motion.p>
          </motion.div>

          {/* Part 1: Where We Compete - Football Pyramid with Academy Impact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.2 }}
                style={{
              marginBottom: spacing["3xl"],
                }}
              >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            style={{
              display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(400px, 100%), 1fr))",
              gap: spacing.xl,
                alignItems: "stretch",
                gridAutoRows: "1fr",
              }}
            >
              {/* Left: Where We Compete */}
              <motion.div
                variants={headingVariants}
                style={{
                  ...glass.panel,
                  borderRadius: borderRadius.card, // 16px - football-first card style
                  padding: spacing.cardPadding, // 32px minimum - readable text zones
                  boxShadow: shadows.card,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  height: "100%",
                  minHeight: "100%",
                  alignSelf: "stretch",
                  justifyContent: "space-between",
                }}
              >
                {/* Blue glass wash overlay (match reference) */}
                <div aria-hidden="true" style={{ ...glass.overlay, zIndex: 1, opacity: 0.92 }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                <div
            style={{
                    display: "flex",
              alignItems: "center",
                    gap: spacing.md,
                  marginBottom: spacing.lg,
                }}
                >
                  <div
                style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TrophyIcon size={24} color={colors.text.onPrimary} />
        </div>
                  <h3
              style={{
                ...typography.h2,
                color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    Where We Compete
                  </h3>
                </div>
                {/* (removed per request) */}
                 <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing.md }}>
                  {/* Senior Leagues & Programs */}
                  {[
                    {
                      level: "KSFA Super Division League",
                      desc: "First Team - Top Tier Competition",
                      highlighted: true,
                      importance: "highest",
                      program: "Elite Pathway Program (EPP) + Senior Competitive Program (SCP)",
                      programDesc: "Promotions via EPP and SCP into Super Division.",
                    isChild: false,
                    },
                    {
                      level: "KSFA Women's B Division League",
                      desc: "Women's B Division - Women's Elite Competition",
                      highlighted: true,
                      importance: "high",
                      program: "Women’s Performance Pathway (WPP)",
                      programDesc: "Dedicated women’s pathway feeding the B Division squad.",
                    isChild: false,
                    },
                    {
                      level: "KSFA C Division League",
                      desc: "Development Competitive",
                      highlighted: false,
                      importance: "medium",
                      program: "Senior Competitive Program (SCP)",
                      programDesc: "SCP develops and rotates players for KSFA C & D Divisions.",
                    isChild: false,
                    },
                    {
                      level: "KSFA D Division League",
                      desc: "Entry-level Competitive",
                      highlighted: false,
                      importance: "medium",
                      program: "Senior Competitive Program (SCP)",
                      programDesc: "SCP supports players not yet selected for higher divisions.",
                    isChild: false,
                    },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       transition={{ duration: 0.5, delay: idx * 0.1 }}
                       viewport={{ once: false }}
                style={{
                        ...glass.inset,
                         borderRadius: borderRadius.card, // 16px - football-first
                        padding: spacing['16'], // 16px - readable text zones
                        paddingLeft: step.isChild ? spacing['32'] + spacing['16'] : spacing['16'],
                         border: step.importance === "highest"
                           ? `2px solid ${colors.accent.main}`
                           : step.importance === "high"
                           ? `1px solid ${colors.accent.main}60`
                          : `1px solid rgba(255, 255, 255, 0.10)`,
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.md,
                  cursor: "default",
                         boxShadow: step.importance === "highest"
                           ? shadows.cardHover // Sports broadcast hover shadow
                           : step.importance === "high"
                           ? shadows.card
                           : shadows.sm,
                         position: "relative",
                         overflow: "hidden",
                }}
              >
                <div aria-hidden="true" style={{ ...glass.overlaySoft, opacity: 0.85 }} />
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: step.isChild ? "32px" : "40px",
                    height: step.isChild ? "32px" : "40px",
                    borderRadius: "50%",
                           background: step.importance === "highest"
                             ? colors.accent.main
                             : step.importance === "high"
                      ? `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.main} 100%)`
                      : step.importance === "medium"
                      ? colors.primary.main
                      : colors.primary.soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.text.onPrimary,
                    fontWeight: typography.fontWeight.bold,
                    flexShrink: 0,
                           border: step.importance === "highest"
                             ? `2px solid ${colors.accent.main}`
                             : step.importance === "high"
                             ? `2px solid ${colors.accent.main}80`
                             : "none",
                           boxShadow: step.importance === "highest"
                             ? `0 0 20px ${colors.accent.main}60`
                             : step.importance === "high"
                             ? `0 0 15px ${colors.accent.main}40`
                             : "none",
                  }}
                    >
                      {step.isChild ? String.fromCharCode(65 + (idx - 5)) : idx + 1}
                </div>
                <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                             ...typography.h5,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                      paddingLeft: spacing['4'], // 4px padding from border - readable text zones
                             fontWeight: step.importance === "highest" || step.importance === "high"
                               ? typography.fontWeight.bold
                               : typography.fontWeight.semibold,
                             // Unify font sizes across the entire "Where We Compete" list
                             fontSize: typography.fontSize.base,
                    }}
                  >
                    {step.level}
                  </div>
                  <div
                    style={{
                      ...typography.body,
                        color: step.importance === "highest"
                          ? colors.accent.main
                          : step.importance === "high"
                          ? colors.text.secondary
                          : step.importance === "youth-parent"
                          ? colors.text.secondary
                          : colors.text.muted,
                        // Unify subtitle size (including any child rows)
                      fontSize: typography.fontSize.sm,
                        lineHeight: 1.5,
                        paddingLeft: spacing['4'], // 4px padding from border - readable text zones
                        fontWeight: step.importance === "highest"
                          ? typography.fontWeight.medium
                          : typography.fontWeight.normal,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
              </motion.div>
            ))}

                   {/* Youth Leagues Parent */}
                   <motion.div
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ duration: 0.5, delay: 0.4 }}
                     viewport={{ once: false }}
        style={{
                       ...glass.inset,
                       borderRadius: borderRadius.lg,
                       padding: spacing.md,
                       border: `2px solid rgba(255, 255, 255, 0.15)`,
                       display: "flex",
                       alignItems: "center",
                       gap: spacing.md,
                       cursor: "default",
                       marginTop: spacing.sm,
                       position: "relative",
                       overflow: "hidden",
                     }}
                   >
        <div aria-hidden="true" style={{ ...glass.overlaySoft, opacity: 0.85 }} />
        <div
          style={{
                         position: "relative",
                         zIndex: 1,
                         width: "40px",
                         height: "40px",
                         borderRadius: "50%",
                         background: colors.primary.soft,
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         color: colors.text.onPrimary,
                         fontWeight: typography.fontWeight.bold,
                         flexShrink: 0,
                       }}
                     >
                       5
                     </div>
                     <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                       <div
              style={{
                           ...typography.h5,
                color: colors.text.primary,
                           marginBottom: spacing.xs,
                           fontWeight: typography.fontWeight.semibold,
                           fontSize: typography.fontSize.base,
                         }}
                       >
                         Youth Leagues
                       </div>
                       <div
              style={{
                ...typography.body,
                           color: colors.text.secondary,
                           fontSize: typography.fontSize.sm,
                           lineHeight: 1.5,
              }}
            >
                         Grassroots Development Programs
          </div>
                     </div>
                   </motion.div>

                   {/* Youth League Sub-items */}
          <div
            style={{
                       marginLeft: spacing.xl,
                       paddingLeft: spacing.lg,
                       borderLeft: `2px solid rgba(255, 255, 255, 0.1)`,
              display: "flex",
                       flexDirection: "column",
                       gap: spacing.sm,
                     }}
                   >
                     {[
                       { level: "BLR Super League", desc: "U9 Competitive" },
                     { level: "BLR Super League", desc: "U11 Competitive" },
                     { level: "KSFA Youth League", desc: "U13 Competitive" },
                     ].map((youthLeague, youthIdx) => (
              <motion.div
                         key={youthIdx}
                         initial={{ opacity: 0, x: -20 }}
                         whileInView={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.5, delay: 0.5 + youthIdx * 0.1 }}
                         viewport={{ once: false }}
                      style={{
                           ...glass.inset,
                           borderRadius: borderRadius.md,
                           padding: spacing.sm,
                           paddingLeft: spacing.md,
                           border: `2px solid rgba(255, 255, 255, 0.08)`,
                           display: "flex",
                        alignItems: "center",
                           gap: spacing.sm,
                           cursor: "default",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                         <div aria-hidden="true" style={{ ...glass.overlaySoft, opacity: 0.82 }} />
                         {/* Connecting line indicator */}
                      <div
                        style={{
                          position: "absolute",
                             left: "-12px",
                             top: "50%",
                             transform: "translateY(-50%)",
                             width: "8px",
                             height: "2px",
                             background: `linear-gradient(to right, 
                               rgba(255, 255, 255, 0.2) 0%, 
                               transparent 100%)`,
                           }}
                         />
                      <div
                        style={{
                             position: "relative",
                             zIndex: 1,
                             width: "28px",
                             height: "28px",
                             borderRadius: "50%",
                             background: colors.primary.soft,
                          display: "flex",
                          alignItems: "center",
                             justifyContent: "center",
                             color: colors.text.onPrimary,
                             fontWeight: typography.fontWeight.medium,
                             flexShrink: 0,
                             fontSize: typography.fontSize.xs,
                           }}
                         >
                          {String.fromCharCode(65 + youthIdx)} {/* A, B, C */}
                      </div>
                         <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                      <div
                        style={{
                               ...typography.body,
                            color: colors.text.primary,
                               marginBottom: `calc(${spacing.xs} / 2)`,
                               fontWeight: typography.fontWeight.medium,
                               // Unify with main row title sizing
                               fontSize: typography.fontSize.base,
                          }}
                        >
                             {youthLeague.level}
                        </div>
                        <div
                          style={{
                            ...typography.body,
                            color: colors.text.muted,
                               // Unify with main row subtitle sizing
                               fontSize: typography.fontSize.sm,
                               lineHeight: 1.4,
                          }}
                        >
                             {youthLeague.desc}
                        </div>
                      </div>
                    </motion.div>
                     ))}
                  </div>
                  {/* Point 6: Year-long Friendly & Exhibition */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    viewport={{ once: false }}
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(20, 31, 58, 0.5) 0%, 
                        rgba(15, 23, 42, 0.4) 100%)`,
                      borderRadius: borderRadius.lg,
                      padding: spacing.md,
                      border: `2px solid rgba(255, 255, 255, 0.15)`,
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                      marginTop: spacing.lg,
                      cursor: "default",
                    }}
                  >
                      <div
                        style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: colors.primary.soft,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.text.onPrimary,
                        fontWeight: typography.fontWeight.bold,
                        flexShrink: 0,
                      }}
                    >
                      6
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                          style={{
                          ...typography.h5,
                          color: colors.text.primary,
                          marginBottom: spacing.xs,
                            fontWeight: typography.fontWeight.semibold,
                          fontSize: typography.fontSize.base,
                          }}
                        >
                        Year-long Friendly & Exhibition
                        </div>
                        <div
                          style={{
                          ...typography.body,
                          color: colors.text.secondary,
                          fontSize: typography.fontSize.sm,
                          lineHeight: 1.5,
                        }}
                      >
                        Season-long competitive friendlies
                        </div>
                      </div>
                    </motion.div>
                  <div style={{ height: spacing.md }} />
                  </div>
          </div>
              </motion.div>

              {/* Right: Academy Impact Stats */}
          <motion.div
            variants={headingVariants}
              style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                  height: "100%",
                  minHeight: "100%",
                  alignSelf: "stretch",
            }}
          >
            {[
                  {
                    value: "5",
                    label: "Players Promoted",
                    subLabel: "To Super Division",
                  description: "",
                  program: "Elite Pathway Program (EPP) + Senior Competitive Program (SCP)",
                  programDesc: "Promotions via EPP and SCP into Super Division.",
                    gradient: `linear-gradient(135deg, rgba(255, 169, 0, 0.32) 0%, rgba(255, 194, 51, 0.18) 50%, rgba(4, 61, 208, 0.12) 100%)`,
                    glowColor: colors.accent.main,
                    Icon: TrophyIcon,
                    imageOpacity: 0.5,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/20250927-DSC_0446.jpg`,
                    signature: "ember",
                  },
                  {
                    value: "8",
                    label: "Players Promoted",
                    subLabel: "To Women's B Division League",
                  description: "",
                  program: "Women’s Performance Pathway (WPP)",
                  programDesc: "Dedicated women’s pathway feeding the B Division squad.",
                    gradient: `linear-gradient(135deg, rgba(0, 224, 255, 0.28) 0%, rgba(4, 61, 208, 0.16) 55%, rgba(15, 23, 42, 0.2) 100%)`,
                    glowColor: "#00E0FF",
                    Icon: TrophyIcon,
                    imageOpacity: 0.5,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/Screenshot 2025-12-15 110643.png`,
                    signature: "sheen",
                  },
                  {
                    value: "40",
                    label: "Players Competing",
                    subLabel: "In KSFA C & D Division",
                  description: "",
                  program: "Senior Competitive Program (SCP)",
                  programDesc: "SCP develops and rotates players for KSFA C & D Divisions.",
                    gradient: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(45, 95, 232, 0.2) 100%)`,
                    glowColor: colors.primary.light,
                    Icon: MedalIcon,
                    imageOpacity: 0.5,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/Screenshot 2025-12-15 113324.png`,
                    signature: "scan",
                  },
                  {
                    value: "80",
                    label: "Youth Players",
                    subLabel: "In Youth Leagues",
                  description: "",
                  program: "Foundation & Youth Development Program (FYDP)",
                  programDesc: "FYDP develops U9–U13 talent for youth competitions.",
                    gradient: `linear-gradient(135deg, rgba(42, 153, 107, 0.26) 0%, rgba(77, 184, 138, 0.14) 55%, rgba(0, 224, 255, 0.12) 100%)`,
                    glowColor: colors.success.main,
                    Icon: FootballIcon,
                    imageOpacity: 0.6,
                    overlayOpacity: 0.75,
                    backgroundImage: `/assets/Screenshot 2025-12-15 111322.png`,
                    signature: "bloom",
                  },
                ].map((stat, idx) => (
                <motion.div
                    key={idx}
                  {...getStaggeredCard(idx)}
                  style={{
                    borderRadius: borderRadius.xl,
                      padding: spacing.lg,
                      border: `1px solid rgba(255, 255, 255, 0.15)`,
                      boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset`,
                      backdropFilter: "blur(10px)",
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                      flex: 1,
                      cursor: "default",
                    }}
                  >
                    {/* Background Image - replaces gradient overlay */}
                    {stat.backgroundImage ? (
                      <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `url("${encodeURI(stat.backgroundImage)}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: stat.imageOpacity || 0.5,
                          filter: "blur(2px)", // Add subtle blur like other sections
                          zIndex: 0,
                        }}
                      />
                    ) : null}
                    {/* Branded overlay - improves text contrast (blue + gold) */}
                    <div
                      aria-hidden="true"
                      style={{
                        ...programCardOverlay(stat.glowColor || colors.accent.main),
                        zIndex: 1,
                        opacity: stat.backgroundImage ? (stat.overlayOpacity ?? 0.75) : 0.95,
                      }}
                    />
                    {/* Background gradient overlay - only if no background image */}
                    {!stat.backgroundImage && (
                    <div
                      style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: stat.gradient,
                          opacity: 0.3,
                          zIndex: 2,
                        }}
                      />
                    )}

                    {/* Accent top stroke (ties card to its program color) */}
                      <div
                        style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: `linear-gradient(90deg, transparent 0%, ${stat.glowColor} 45%, transparent 100%)`,
                        opacity: 0.9,
                        zIndex: 3,
                        pointerEvents: "none",
                      }}
                    />

                    {/* Signature motion layer (subtle, premium; different per program) */}
                    {stat.signature === "ember" ? (
                      <motion.div
                        aria-hidden="true"
                      style={{
                          position: "absolute",
                          inset: -40,
                          background: `radial-gradient(circle at 18% 35%, ${stat.glowColor}2b 0%, transparent 60%)`,
                          filter: "blur(18px)",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.07, 1] }}
                        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ) : stat.signature === "sheen" ? (
                      <motion.div
                        aria-hidden="true"
                      style={{
                          position: "absolute",
                          top: -40,
                          bottom: -40,
                          width: "55%",
                          left: "-60%",
                          background:
                            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 45%, transparent 100%)",
                          transform: "skewX(-14deg)",
                          filter: "blur(6px)",
                          zIndex: 2,
                          pointerEvents: "none",
                          opacity: 0.7,
                        }}
                        animate={{ x: ["0%", "220%"] }}
                        transition={{ duration: 5.6, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                      />
                    ) : stat.signature === "scan" ? (
                    <motion.div
                        aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
                          height: 2,
                          top: -10,
                          background: `linear-gradient(90deg, transparent 0%, ${stat.glowColor}55 40%, transparent 100%)`,
                          filter: "blur(2px)",
                          zIndex: 2,
                          pointerEvents: "none",
                          opacity: 0.8,
                        }}
                        animate={{ y: [-10, 220] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: "linear", delay: 0.4 }}
                      />
                    ) : stat.signature === "bloom" ? (
          <motion.div
                        aria-hidden="true"
            style={{
                          position: "absolute",
                          inset: -50,
                          background: `radial-gradient(circle at 75% 20%, ${stat.glowColor}26 0%, transparent 58%)`,
                          filter: "blur(20px)",
                          zIndex: 2,
                          pointerEvents: "none",
                        }}
                        animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.06, 1] }}
                        transition={{ duration: 6.0, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      />
                    ) : null}

                    {/* Value */}
                    <motion.div
                style={{
                        position: "relative",
                        zIndex: 3,
                        marginBottom: spacing.xs,
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 + 0.3 }}
                      viewport={{ once: false }}
                    >
                      <div
                style={{
                          ...typography.h1,
                          fontSize: `clamp(2rem, 4vw, 2.5rem)`,
                          color: stat.signature === "scan" ? colors.primary.light : stat.glowColor,
                          fontWeight: typography.fontWeight.bold,
                          textShadow:
                            stat.signature === "scan"
                              ? `0 2px 0 rgba(0,0,0,0.55), 0 10px 28px ${colors.primary.light}88, 0 0 22px rgba(0,224,255,0.16)`
                              : `0 4px 20px ${stat.glowColor}40`,
                          letterSpacing: "-0.02em",
                          lineHeight: 1.1,
                          marginBottom: spacing.xs,
                        }}
                      >
                        {stat.value}
                    </div>
                  </motion.div>

                    {/* Label */}
                    <motion.div
                    style={{
                        position: "relative",
                        zIndex: 3,
                        marginBottom: spacing.xs,
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 + 0.3 }}
                      viewport={{ once: false }}
                  >
                    <div
                      style={{
                          ...typography.h5,
                        color: colors.text.primary,
                          fontWeight: typography.fontWeight.semibold,
                          marginBottom: `calc(${spacing.xs} / 2)`,
                      }}
                    >
                        {stat.label}
                    </div>
                    <div
                      style={{
                        ...typography.body,
                          color: stat.signature === "scan" ? colors.primary.light : stat.glowColor,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          textShadow: stat.signature === "scan" ? "0 2px 10px rgba(0,0,0,0.55)" : undefined,
                      }}
                    >
                        {stat.subLabel}
              </div>
            </motion.div>

                    {/* Description */}
            <motion.div
              style={{
                        position: "relative",
                        zIndex: 3,
                      }}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: idx * 0.1 + 0.4 }}
                      viewport={{ once: false }}
                    >
              <div
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                          fontSize: typography.fontSize.xs,
                          lineHeight: 1.4,
                          fontStyle: "italic",
                }}
              >
                        {stat.description}
              </div>
                    </motion.div>
                    {/* Program info and CTA placeholder */}
                    {stat.program && (
              <motion.div
                style={{
                  position: "relative",
                          zIndex: 3,
                          marginTop: spacing.sm,
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: idx * 0.1 + 0.5 }}
                        viewport={{ once: false }}
                      >
                <div
                  style={{
                            ...typography.body,
                            color: colors.text.secondary,
                            fontSize: typography.fontSize.sm,
                            fontWeight: typography.fontWeight.semibold,
                          marginBottom: spacing.xs,
                          }}
                        >
                          {stat.program}
                        </div>
                        {stat.programDesc && (
                <div
                  style={{
                              ...typography.body,
                              color: colors.text.muted,
                              fontSize: typography.fontSize.xs,
                              lineHeight: 1.5,
                            }}
                          >
                            {stat.programDesc}
                          </div>
                        )}
                        <div style={{ marginTop: spacing.sm, display: "flex", justifyContent: "center" }}>
                          {(() => {
                            const cta = (() => {
                              if (!stat.program) return null;
                              // Conversion-driven labels (destinations unchanged)
                              // - Parents: clarity + age band + outcomes
                              // - Competitive athletes: pathway + progression framing (no promises)
                              if (stat.program.includes("Elite Pathway Program (EPP)")) {
                                return {
                                  to: "/programs/epp",
                                  label: "See Elite Pathway Details",
                                  ariaLabel: "See Elite Pathway Program details",
                                };
                              }
                              if (stat.program.includes("WPP")) {
                                return {
                                  to: "/programs/wpp",
                                  label: "See Women’s Pathway Details",
                                  ariaLabel: "See Women’s Performance Pathway details",
                                };
                              }
                              if (stat.program.includes("Senior Competitive Program (SCP)")) {
                                return {
                                  to: "/programs/scp",
                                  label: "See Competitive Squad Pathway",
                                  ariaLabel: "See Senior Competitive Program pathway details",
                                };
                              }
                              if (
                                stat.program.includes("Foundation & Youth Development Program (FYDP)") ||
                                stat.program.includes("FYDP")
                              ) {
                                return {
                                  to: "/programs/fydp",
                                  label: "Parents: See Youth Program (U9–U13)",
                                  ariaLabel: "For parents: see Foundation and Youth Development Program details for U9 to U13",
                                };
                              }
                              return null;
                            })();

                            // Unified CTA design matching hero section - using dark with border style
                            const unifiedAccent = colors.accent.main; // Yellow/gold from hero
                            
                            const pillBase: React.CSSProperties = {
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: spacing.xs,
                              padding: `${spacing.sm} ${spacing.md}`,
                              borderRadius: borderRadius.button,
                              background: colors.surface.card, // Dark card background matching hero
                              border: `2px solid ${unifiedAccent}`, // Gold border matching hero "Join the Journey"
                              boxShadow: shadows.button,
                              cursor: cta ? "pointer" : "default",
                              userSelect: "none",
                              WebkitTapHighlightColor: "transparent",
                              transition: "all 0.2s ease",
                              minWidth: isMobile ? "100%" : "auto",
                              width: isMobile ? "100%" : "auto",
                              maxWidth: "100%",
                              position: "relative" as const,
                              overflow: "hidden" as const,
                            };

                            const textStyle: React.CSSProperties = {
                              ...typography.body,
                              color: colors.text.primary,
                              fontSize: typography.fontSize.sm,
                              fontWeight: typography.fontWeight.bold,
                              letterSpacing: "0.02em",
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                            };

                            const content = (
                              <motion.div
                                style={{
                                  ...pillBase,
                                  opacity: cta ? 1 : 0.65,
                                }}
                                whileHover={
                                  cta
                                    ? {
                                        y: -2,
                                        boxShadow: shadows.buttonHover,
                                      }
                                    : undefined
                                }
                                whileTap={cta ? { scale: 0.98 } : undefined}
                              >
                                <div style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: spacing.xs }}>
                                  <ArrowRightIcon size={16} style={{ color: unifiedAccent }} />
                                  <span style={textStyle}>{cta ? cta.label : "Explore Program (coming soon)"}</span>
                                  <motion.div
                                    aria-hidden="true"
                                    animate={cta ? { x: [0, 3, 0] } : undefined}
                                    transition={cta ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
                                    style={{ display: "inline-flex" }}
                                  >
                                    <ArrowRightIcon size={14} style={{ color: unifiedAccent }} />
                                  </motion.div>
                                </div>
                              </motion.div>
                            );

                            if (!cta) return <div aria-disabled="true">{content}</div>;

                            return (
                              <Link
                                to={cta.to}
                                aria-label={cta.ariaLabel}
                                style={{ textDecoration: "none", display: "inline-block", maxWidth: "100%" }}
                              >
                                {content}
                              </Link>
                            );
                          })()}
                </div>
              </motion.div>
                    )}
            </motion.div>
              ))}
          </motion.div>
            </motion.div>
          </motion.div>

          {/* Removed: hard visual divider (story weave should reflow, not reset) */}

          {/* Part 2: How We Enable This - MOVED TO /about page */}
          {/* This section has been migrated to About Us page for better narrative flow */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false, amount: 0.2 }}
        style={{
              marginBottom: spacing["2xl"],
              opacity: act3Opacity,
              y: act3Y,
              display: "none", // Hidden - content moved to /about
            }}
          >
            {/* System Engine Frame (keeps flow with Part 1) */}
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: false, amount: 0.2 }}
              style={{
          position: "relative",
                borderRadius: borderRadius["2xl"],
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(8,12,24,0.22)",
                backdropFilter: "blur(14px)",
                boxShadow: "0 18px 60px rgba(0,0,0,0.38)",
          overflow: "hidden",
        }}
      >
              {/* shared texture so it feels like the same “Our Football Program” world */}
        <div
                aria-hidden="true"
          style={{
            position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 18% 20%, rgba(0,224,255,0.12) 0%, transparent 55%), radial-gradient(circle at 82% 75%, rgba(255,169,0,0.10) 0%, transparent 55%), linear-gradient(135deg, rgba(5,11,32,0.55) 0%, rgba(10,16,32,0.35) 60%, rgba(5,11,32,0.55) 100%)",
                  opacity: 0.95,
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${galleryAssets.actionShots[2]?.medium || galleryAssets.actionShots[0]?.medium || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
                  opacity: 0.10,
                  filter: "blur(14px)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 1, padding: isMobile ? spacing.xl : spacing["2xl"] }}>
                {/* Header (left-aligned so it reads as a continuation, not a new section) */}
          <motion.div
            variants={headingVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={viewportOnce}
                  style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: spacing.lg,
                    alignItems: isMobile ? "flex-start" : "center",
                    justifyContent: "space-between",
                    marginBottom: spacing.xl,
                  }}
                >
                  <div style={{ maxWidth: 780 }}>
                    <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.18em", marginBottom: spacing.xs }}>
                      SYSTEM ENGINE
                    </div>
              <h3
              style={{
                ...typography.h2,
                color: colors.text.primary,
                        margin: 0,
                        marginBottom: spacing.xs,
                        fontSize: `clamp(1.6rem, 2.4vw, 2.1rem)`,
                        lineHeight: 1.2,
                }}
              >
                How We Enable This
              </h3>
              <p
              style={{
                ...typography.body,
                  color: colors.text.secondary,
                  fontSize: typography.fontSize.base,
                        opacity: 0.9,
                        margin: 0,
                        lineHeight: 1.7,
                }}
              >
                Through RealVerse, data-driven insights, and top-tier coaching
              </p>
            </div>

                  {/* Small “flow” pill */}
                  <div
                    style={{
                      padding: `${spacing.xs} ${spacing.md}`,
                      borderRadius: borderRadius.full,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.04)",
                      backdropFilter: "blur(12px)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: spacing.sm,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                      whiteSpace: "nowrap",
                    }}
                    aria-label="Coaching and RealVerse combine to drive performance and promotions"
                  >
                    <span style={{ color: colors.accent.main, fontWeight: typography.fontWeight.bold }}>Coaching</span>
                    <span style={{ opacity: 0.7 }}>+</span>
                    <span style={{ color: colors.primary.main, fontWeight: typography.fontWeight.bold }}>RealVerse</span>
                    <span style={{ opacity: 0.7 }}>→</span>
                    <span style={{ color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>Performance</span>
                  </div>
          </motion.div>

                {/* Two pillars, visually connected */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
            style={{
                    position: "relative",
              display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
              gap: spacing.lg,
              alignItems: "stretch",
                    justifyItems: "stretch",
                  }}
                >
                  {/* connector overlay (desktop) — overlay only, not a grid column */}
                  {!isMobile && (
                    <div
                      aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: spacing.lg,
                        bottom: spacing.lg,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 72,
                  display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        zIndex: 2,
                }}
              >
                    <div
                      style={{
                        position: "absolute",
                          top: "10%",
                          bottom: "10%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 1,
                          background: "linear-gradient(transparent, rgba(255,255,255,0.22), transparent)",
                          opacity: 0.9,
                        }}
                      />
                    <div
                      style={{
                          width: 42,
                          height: 42,
                      borderRadius: "50%",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                        color: colors.text.primary,
                          backdropFilter: "blur(10px)",
                      }}
                    >
                        <ArrowRightIcon size={18} />
                    </div>
                    </div>
                  )}

                  {/* Left pillar: Coaching */}
              <motion.div
                    variants={headingVariants}
                    whileHover={{ y: -4 }}
        style={{
          position: "relative",
                      borderRadius: borderRadius.xl,
                      border: "1px solid rgba(255,255,255,0.14)",
                      boxShadow: "0 14px 46px rgba(0,0,0,0.35)",
          overflow: "hidden",
                      background: "rgba(10, 16, 32, 0.55)",
                      backdropFilter: "blur(14px)",
                      minWidth: 0,
                      width: "100%",
        }}
      >
        <div
                      aria-hidden="true"
          style={{
            position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${galleryAssets.actionShots[3]?.large || galleryAssets.actionShots[0]?.large || academyAssets.trainingShot})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
                        opacity: 0.10,
            filter: "blur(8px)",
                    }}
                    />
                    <div
                      aria-hidden="true"
              style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(20,31,58,0.92) 0%, rgba(15,23,42,0.88) 100%)",
                      }}
                    />

                    <div style={{ position: "relative", zIndex: 1, padding: spacing.xl, display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.md }}>
                  <div
                    style={{
                            width: 48,
                            height: 48,
                          borderRadius: "50%",
                            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                          flexShrink: 0,
                            fontSize: 24,
                        }}
                          aria-hidden="true"
                      >
                          ⚡
                  </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.14em", marginBottom: 2 }}>
                            Coaching
                          </div>
                          <h4 style={{ ...typography.h3, color: colors.text.primary, margin: 0, fontSize: typography.fontSize.xl, lineHeight: 1.2 }}>
                            Top-Tier Coaching & Modern Techniques
                          </h4>
                        </div>
                      </div>

                      <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg, lineHeight: 1.7, fontSize: typography.fontSize.sm, opacity: 0.95 }}>
                        We combine elite coaches and data to produce the promotions and performances you see above. Evidence-backed pathway planning, load management, and modern training prepare every player to compete and win.
                      </p>

                    <div
                      style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: spacing.sm,
                          marginBottom: spacing.lg,
                        }}
                      >
                        {[
                          "Merit-based player pathway",
                          "Modern training & load management",
                          "Data-backed coaching decisions",
                          "Personalized player development",
                          "Advanced training techniques",
                          "Transparent communication",
                        ].map((bullet, idx) => (
                    <motion.div
                            key={bullet}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.03 }}
                            viewport={{ once: false }}
                      style={{
                display: "flex",
                              alignItems: "center",
                              gap: spacing.sm,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.lg,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.accent.main, flexShrink: 0 }} />
                            <span style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.xs, lineHeight: 1.35 }}>
                              {bullet}
                            </span>
                </motion.div>
              ))}
            </div>

                      <div style={{ marginTop: "auto" }}>
                        <Link to="/brochure" style={{ textDecoration: "none" }}>
                          <Button variant="secondary" size="md" style={{ width: "100%" }}>
                      Explore Coaching Pathways →
                </Button>
            </Link>
          </div>
        </div>
                </motion.div>

                  {/* Right pillar: RealVerse */}
                <motion.div
                    variants={headingVariants}
                    whileHover={{ y: -4 }}
        style={{
          position: "relative",
                      borderRadius: borderRadius.xl,
                      border: "1px solid rgba(255,255,255,0.14)",
                      boxShadow: "0 14px 46px rgba(0,0,0,0.35)",
          overflow: "hidden",
                      background: "rgba(10, 16, 32, 0.55)",
                      backdropFilter: "blur(14px)",
                      minWidth: 0,
                      width: "100%",
        }}
      >
        <div
                      aria-hidden="true"
          style={{
            position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${academyAssets.trainingShot})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
                        opacity: 0.10,
                        filter: "blur(8px)",
                      }}
                    />
                    <div
                      aria-hidden="true"
              style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(20,31,58,0.92) 0%, rgba(15,23,42,0.88) 100%)",
                      }}
                    />

                    <div style={{ position: "relative", zIndex: 1, padding: spacing.xl, display: "flex", flexDirection: "column", height: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.md }}>
                  <div
              style={{
                            width: 48,
                            height: 48,
                      borderRadius: "50%",
                            background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.primary.main} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                            fontSize: 24,
                    }}
                          aria-hidden="true"
                  >
                          💻
                  </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ ...typography.overline, color: colors.primary.main, letterSpacing: "0.14em", marginBottom: 2 }}>
                            RealVerse
                          </div>
                          <h4 style={{ ...typography.h3, color: colors.text.primary, margin: 0, fontSize: typography.fontSize.xl, lineHeight: 1.2 }}>
                    RealVerse & Data Analytics
                          </h4>
              </div>
                      </div>

                      <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg, lineHeight: 1.7, fontSize: typography.fontSize.sm, opacity: 0.95 }}>
                        Our integrated digital ecosystem powers every team with real-time data, performance tracking, and seamless communication—giving each player clear insights and actions to improve.
                      </p>

                    <div
                      style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: spacing.sm,
                          marginBottom: spacing.lg,
                        }}
                      >
                  {[
                    "Real-time performance dashboards and KPIs",
                    "Match & training video review with feedback",
                    "Individual goals and progression tracking",
                    "Load management alerts for player welfare",
                    "Communication hub for schedules and updates",
                    "Reports that tie effort to outcomes",
                        ].map((bullet, idx) => (
                          <motion.div
                            key={bullet}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.03 }}
                            viewport={{ once: false }}
              style={{
                display: "flex",
                        alignItems: "center",
                              gap: spacing.sm,
                              padding: `${spacing.xs} ${spacing.sm}`,
                              borderRadius: borderRadius.lg,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.primary.main, flexShrink: 0 }} />
                            <span style={{ ...typography.body, color: colors.text.secondary, fontSize: typography.fontSize.xs, lineHeight: 1.35 }}>
                              {bullet}
                            </span>
                          </motion.div>
                  ))}
                    </div>

                      <div style={{ marginTop: "auto" }}>
                        <Link to="/realverse/experience" style={{ textDecoration: "none" }}>
                          <Button variant="primary" size="md" style={{ width: "100%" }}>
                            Experience RealVerse →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

                {/* End integrated-program section */}
              </motion.div>
            </motion.div>
          </InfinitySection>

      {/* End Post-Hero Story Weave Wrapper */}
      </div>



      {/* Fan Club Ecosystem × Sponsor Rewards × Pricing × Sales Enablement */}
      {/* Fan Club Teaser - Concise single-screen preview */}
      <div
        style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
        }}
      >
        <InfinitySection
          id="fan-club-teaser"
          bridge={true}
          style={{
            padding: `${spacing.sectionGap} ${spacing.xl}`,
            position: "relative",
            overflow: "hidden",
            scrollMarginTop: 120,
            minHeight: "100vh",
            backgroundImage: "url('/assets/DSC_0205-3.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "scroll",
          }}
          data-section="fan-club"
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <FanClubTeaserSection isMobile={isMobile} />
          </div>
        </InfinitySection>
      </div>

      {/* Unified Content Stream: Shop + Matches + News + Gallery */}
      <InfinitySection
        id="content-stream"
        bridge={true}
          style={{
          paddingTop: spacing.sectionGap, // Uniform 64px padding
          paddingBottom: spacing.sectionGap,
          paddingLeft: spacing.xl,
          paddingRight: spacing.xl,
          background: colors.club.deep, // Football-first background
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Unified background - club experience video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <source src="/assets/InShot_20251107_005145872.mp4" type="video/mp4" />
        </video>

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: spacing["3xl"] }}>
          {/* Stream header */}
          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.25 }}
            style={{ textAlign: "center", marginBottom: spacing["2xl"] }}
          >
                    <div
                      style={{
                ...typography.overline,
                color: colors.accent.main,
                letterSpacing: "0.15em",
                        marginBottom: spacing.md,
                      }}
                    >
              Your Complete Club Experience
                    </div>
            <h2
              style={{
                ...typography.display,
                fontSize: `clamp(2.5rem, 5vw, 3.5rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                fontWeight: typography.fontWeight.bold,
                letterSpacing: "-0.03em",
                textShadow: "0 6px 50px rgba(0, 0, 0, 0.85), 0 0 70px rgba(0, 224, 255, 0.18)",
              }}
            >
              Connect, Support & Celebrate
            </h2>
                <p
              style={{
                ...typography.body,
                color: colors.text.secondary,
                fontSize: typography.fontSize.lg,
                maxWidth: "800px",
                margin: "0 auto",
                lineHeight: 1.75,
                textShadow: "0 2px 24px rgba(0, 0, 0, 0.65)",
              }}
            >
              From matchday essentials to exclusive moments—everything you need to be part of the FC Real Bengaluru family.
                </p>
          </motion.div>

          {/* Connect, Support & Celebrate - Vertical Stack Layout */}
          {/* All breakpoints: Single column stack (Support → Calendar → Gallery) */}
          <div
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
              width: "100%",
              padding: isMobile ? spacing.md : spacing.xl,
            }}
          >
            <div 
                  style={{
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? spacing.lg : spacing["2xl"], // 24px mobile, 48px desktop
                alignItems: "stretch",
              }}
              className="connect-support-celebrate-grid"
            >

              {/* Section 1: Support & Participate */}
                  <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.25 }}
                    style={{
                  background: colors.surface.soft,
                  border: `1px solid rgba(255,255,255,0.10)`,
                  borderRadius: borderRadius.card,
                  padding: isMobile ? spacing.md : spacing.lg, // 16px mobile, 24px desktop
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "auto",
                  width: "100%",
                  boxShadow: shadows.card,
                  overflow: "hidden",
                }}
              >
                <SupportCelebrateBelongSection isMobile={isMobile} products={products} latestResult={latestResult} compact={true} />
                  </motion.div>

              {/* Section 2: Club Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                viewport={{ once: true, amount: 0.25 }}
                    style={{
                  background: colors.surface.soft,
                  border: `1px solid rgba(255,255,255,0.10)`,
                  borderRadius: borderRadius.card,
                  padding: isMobile ? spacing.md : spacing.lg, // 16px mobile, 24px desktop
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "auto",
                  width: "100%",
                  boxShadow: shadows.card,
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }}>
                  <div>
                    <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.14em", marginBottom: spacing.xs }}>
                      CLUB CALENDAR
                  </div>
                    <div style={{ ...typography.h4, color: colors.text.primary, margin: 0, fontWeight: typography.fontWeight.bold }}>Schedule • Matchdays</div>
                  </div>
                  </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: spacing.md }}>
                  <ClubCalendarModule isMobile={isMobile} />
                </div>
              </motion.div>

              {/* Section 3: Gallery & Updates */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                viewport={{ once: true, amount: 0.25 }}
                    style={{
                  background: colors.surface.soft,
                  border: `1px solid rgba(255,255,255,0.10)`,
                  borderRadius: borderRadius.card,
                  padding: isMobile ? spacing.md : spacing.lg, // 16px mobile, 24px desktop
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "auto",
                  width: "100%",
                  boxShadow: shadows.card,
                  overflow: "hidden",
                }}
              >
                <GalleryUpdatesModule />
              </motion.div>
                  </div>
                </div>
        </div>
      </InfinitySection>

      </main>

      {/* 13. FOOTER as part of infinity flow */}
      <InfinitySection
        id="footer"
        bridge={false}
        style={{
          padding: 0,
          paddingTop: "100px",
          paddingBottom: 0,
          marginBottom: 0,
          marginTop: 0,
          background: "transparent",
          position: "relative",
          overflow: "hidden",
          minHeight: "auto",
        }}
      >
        <motion.footer
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", marginTop: "auto", marginBottom: 0, paddingBottom: 0 }}
        >
          <div
              style={{
              position: "relative",
              width: "100%",
              overflow: "hidden",
            }}
          >
        <div
              style={{
            position: "absolute",
            inset: 0,
                background: "linear-gradient(180deg, rgba(4,8,18,0.95) 0%, rgba(4,8,18,0.98) 100%)",
            zIndex: 1,
          }}
        />

            <div
            style={{
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  maxWidth: "1400px",
                  margin: "0 auto",
                  paddingTop: isMobile ? 40 : 48,
                  paddingBottom: 0,
                  paddingLeft: isMobile ? 16 : 32,
                  paddingRight: isMobile ? 16 : 32,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
                    opacity: 0.6,
                    marginBottom: isMobile ? 20 : 24,
                  }}
                />

          <div
            style={{
              display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr 1.2fr",
                    gap: isMobile ? 20 : 24,
              alignItems: "flex-start",
            }}
          >
                  {/* Logo + Social */}
            <div>
              <img
                src={clubAssets.logo.crestCropped}
                alt="FC Real Bengaluru"
                      style={{ width: isMobile ? 90 : 100, height: "auto", marginBottom: isMobile ? spacing.sm : spacing.md }}
              />
                    <div style={{ display: "flex", gap: 10, marginTop: spacing.sm, flexWrap: "wrap" }}>
                {[
                  { name: "Facebook", url: clubInfo.social.facebook, Icon: FacebookIcon },
                  { name: "Instagram", url: clubInfo.social.instagram, Icon: InstagramIcon },
                  { name: "TikTok", url: clubInfo.social.tiktok || "#", Icon: TikTokIcon },
                  { name: "Twitter", url: clubInfo.social.twitter || "#", Icon: TwitterIcon },
                  { name: "YouTube", url: clubInfo.social.youtube, Icon: YouTubeIcon },
                ].map((social) => {
                  const Icon = social.Icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                              display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "rgba(255,255,255,0.08)",
                              color: colors.text.primary,
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                      }}
                      onMouseEnter={(e) => {
                              e.currentTarget.style.background = `${colors.primary.soft}`;
                        e.currentTarget.style.color = colors.primary.main;
                      }}
                      onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                              e.currentTarget.style.color = colors.text.primary;
                      }}
                      title={social.name}
                    >
                            <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* About Clubs */}
            <div>
                    <div
                style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                }}
              >
                About Clubs
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                {[
                  { label: "Homepage", to: "#" },
                  { label: "About Us", to: "#philosophy" },
                        { label: "Latest News", to: "#content-stream" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.to}
                    style={{
                            color: colors.text.secondary,
                      textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Teams Info */}
            <div>
                    <div
                style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                }}
              >
                Teams Info
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                      {[
                        { label: "Player & Coach", to: "/student" },
                        { label: "Player Profile", to: "/players" },
                        { label: "Fixtures", to: "#matches" },
                        { label: "Tournament", to: "/tournaments" },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.to}
                    style={{
                            color: colors.text.secondary,
                      textDecoration: "none",
                            fontSize: 13,
                            lineHeight: 1.8,
                            opacity: 0.85,
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.style.textDecoration = "underline";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "0.85";
                            e.currentTarget.style.textDecoration = "none";
                          }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Us */}
            <div>
              <div
                style={{
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                  textTransform: "uppercase",
                        color: colors.text.primary,
                        opacity: 0.9,
                        marginBottom: isMobile ? 8 : 10,
                }}
              >
                Contact Us
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 10 }}>
                      <a
                        href={`tel:${clubInfo.contact.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <PhoneIcon size={16} />
                        <span>{clubInfo.contact.phone}</span>
                      </a>
                      <a
                        href={`mailto:${clubInfo.contact.email}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          color: colors.text.secondary,
                          textDecoration: "none",
                          fontSize: 13,
                          opacity: 0.9,
                        }}
                      >
                        <EmailIcon size={16} />
                        <span>{clubInfo.contact.email}</span>
                      </a>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          color: colors.text.secondary,
                          fontSize: 13,
                          lineHeight: 1.6,
                          opacity: 0.9,
                        }}
                      >
                        <LocationIcon size={16} style={{ marginTop: 2 }} />
                        <span>{clubInfo.contact.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Training Centres Subsection */}
                {centres.length > 0 && (
                  <>
                    <div
                      style={{
                        marginTop: isMobile ? 32 : 40,
                        marginBottom: isMobile ? 20 : 24,
                        paddingTop: isMobile ? 20 : 24,
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: colors.text.primary,
                          opacity: 0.9,
                          marginBottom: isMobile ? 16 : 20,
                          textAlign: "center",
                        }}
                      >
                        Our Training Centres
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
                          gap: isMobile ? spacing.md : spacing.lg,
                          maxWidth: "1200px",
                          margin: "0 auto",
                        }}
                      >
                        {centres.map((centre, idx) => (
                          <motion.div
                            key={centre.id}
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              borderRadius: borderRadius.lg,
                              padding: spacing.md,
                              border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.sm,
                }}
              >
                            {/* Centre Number Badge & Name */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: spacing.sm,
                              }}
                            >
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: `linear-gradient(135deg, rgba(4, 61, 208, 0.3) 0%, rgba(4, 61, 208, 0.2) 100%)`,
                                  border: `2px solid ${colors.primary.main}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: typography.fontSize.xs,
                                  fontWeight: typography.fontWeight.bold,
                                  color: colors.text.onPrimary,
                                  flexShrink: 0,
                                }}
                              >
                                {idx + 1}
              </div>
              <h4
                style={{
                  ...typography.body,
                  color: colors.text.primary,
                  fontSize: typography.fontSize.sm,
                                  fontWeight: typography.fontWeight.semibold,
                                  margin: 0,
                                  flex: 1,
                }}
              >
                                {centre.name}
              </h4>
                            </div>

                            {/* Location */}
                            <div
                              style={{
                  display: "flex",
                                alignItems: "flex-start",
                  gap: spacing.xs,
                                paddingLeft: spacing.md + spacing.xs,
                              }}
                            >
                              <LocationIcon
                                style={{
                                  width: 14,
                                  height: 14,
                                  flexShrink: 0,
                                  marginTop: "2px",
                                  color: colors.text.secondary,
                                }}
                              />
                              <div
                    style={{
                      ...typography.body,
                                  color: colors.text.secondary,
                                  fontSize: typography.fontSize.xs,
                                  lineHeight: 1.5,
                                }}
                              >
                                {centre.locality}, {centre.city}
                </div>
                </div>

                            {/* Address */}
                            {centre.addressLine && (
                              <div
                                style={{
                                  ...typography.caption,
                      color: colors.text.muted,
                                  fontSize: typography.fontSize.xs,
                                  paddingLeft: spacing.md + spacing.xs,
                                  lineHeight: 1.5,
                                }}
                              >
                                {centre.addressLine}
                </div>
                            )}

                            {/* CTA Button */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              style={{ marginTop: spacing.xs }}
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                fullWidth
                                onClick={() => handleOpenInMaps(centre)}
                                style={{
                                  fontSize: typography.fontSize.xs,
                                  padding: `${spacing.xs} ${spacing.sm}`,
                                }}
                              >
                                View on Google Maps →
                              </Button>
                            </motion.div>
                          </motion.div>
                ))}
              </div>
            </div>
                  </>
                )}

          <div
            style={{
                    marginTop: isMobile ? 20 : 24,
                    paddingTop: isMobile ? 16 : 18,
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    justifyContent: "center",
                    color: colors.text.muted,
                    fontSize: 12,
                    opacity: 0.85,
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} FC Real Bengaluru. All rights reserved.
          </div>
        </div>
            </div>
          </div>
        </motion.footer>
      </InfinitySection>
    </div>
  );
};

export default LandingPage;
export { LandingPage };


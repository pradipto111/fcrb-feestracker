import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { KPICard } from "../components/ui/KPICard";
import { PageShell } from "../components/ui/PageShell";
import { PageHeader } from "../components/ui/PageHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { CalendarIcon, CheckIcon, CloseIcon } from "../components/icons/IconSet";

interface TrainingSession {
  id: number;
  title: string;
  description?: string;
  programmeId?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  center: { id: number; name: string; shortName?: string };
  coach: { id: number; fullName: string };
  attendanceStatus: "PRESENT" | "ABSENT" | "EXCUSED" | "PENDING";
  attendanceNotes?: string;
  markedBy?: { id: number; fullName: string } | null;
  markedAt?: string | null;
  isPast: boolean;
  isToday: boolean;
  isFuture: boolean;
}

const StudentTrainingCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [calendarData, metricsData] = await Promise.all([
        api.getStudentTrainingCalendar({ month: selectedMonth, year: selectedYear }),
        api.getStudentAttendanceMetrics(),
      ]);

      setSessions(calendarData?.sessions || []);
      setMetrics(metricsData);
    } catch (error: any) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calendar rendering logic
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const days: Date[] = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [selectedMonth, selectedYear]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, TrainingSession[]>();
    sessions.forEach(session => {
      const dateKey = new Date(session.sessionDate).toISOString().split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(session);
    });
    return map;
  }, [sessions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT": return "#27ae60";
      case "ABSENT": return "#e74c3c";
      case "EXCUSED": return "#f39c12";
      default: return colors.text.secondary;
    }
  };

  const getStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    return (
      <span
        style={{
          padding: `${spacing.xs} ${spacing.sm}`,
          borderRadius: borderRadius.sm,
          background: `${color}20`,
          color: color,
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <PageShell>
        <div style={{ padding: spacing.xl, textAlign: "center" }}>
          <p style={{ color: colors.text.secondary }}>Loading...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        tone="dark"
        title="My Training Calendar"
        subtitle="View your training sessions and attendance"
      />

      {/* Attendance Metrics */}
      {metrics && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: spacing.md, marginBottom: spacing.lg }}>
          <KPICard
            title="Total Sessions"
            value={metrics.summary.totalSessions}
            icon={<CalendarIcon size={32} color="#FFFFFF" />}
            variant="primary"
          />
          <KPICard
            title="Attendance Rate"
            value={`${metrics.summary.attendancePercentage}%`}
            icon={<CheckIcon size={32} color="#FFFFFF" />}
            variant="info"
          />
          <KPICard
            title="Present"
            value={metrics.summary.presentCount}
            icon={<CheckIcon size={32} color="#FFFFFF" />}
            variant="success"
          />
          <KPICard
            title="Absent"
            value={metrics.summary.absentCount}
            icon={<CloseIcon size={32} color="#FFFFFF" />}
            variant="danger"
          />
        </div>
      )}

      {/* Controls */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.button,
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              background: colors.surface.card,
              color: colors.text.primary,
              fontSize: typography.fontSize.base,
              fontFamily: typography.fontFamily.primary,
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FFFFFF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 16px center",
              paddingRight: "48px",
              minWidth: "180px",
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1} style={{ background: colors.surface.card, color: colors.text.primary }}>
                {new Date(2000, i, 1).toLocaleDateString("en-US", { month: "long" })}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: `${spacing.md} ${spacing.lg}`,
              borderRadius: borderRadius.button,
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              background: colors.surface.card,
              color: colors.text.primary,
              fontSize: typography.fontSize.base,
              fontFamily: typography.fontFamily.primary,
              width: "120px",
            }}
          />
        </div>
      </Card>

      {/* Calendar */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: spacing.sm }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div
              key={day}
              style={{
                padding: spacing.sm,
                textAlign: "center",
                fontWeight: 600,
                color: colors.text.secondary,
              }}
            >
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, idx) => {
            const dateKey = day.toISOString().split('T')[0];
            const daySessions = sessionsByDate.get(dateKey) || [];
            const isCurrentMonth = day.getMonth() === selectedMonth - 1;
            const isToday = dateKey === new Date().toISOString().split('T')[0];

            return (
              <div
                key={idx}
                style={{
                  minHeight: "120px",
                  padding: spacing.xs,
                  border: `1px solid rgba(255, 255, 255, 0.2)`,
                  borderRadius: borderRadius.sm,
                  background: isCurrentMonth ? glass.card.background : "rgba(255,255,255,0.02)",
                  opacity: isCurrentMonth ? 1 : 0.4,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? colors.accent.main : colors.text.primary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {day.getDate()}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                  {daySessions.map(session => (
                    <div
                      key={session.id}
                      style={{
                        padding: spacing.xs,
                        borderRadius: borderRadius.sm,
                        background: "rgba(0, 224, 255, 0.2)",
                        fontSize: "0.75rem",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: spacing.xs }}>
                        {session.startTime} - {session.title}
                      </div>
                      {getStatusBadge(session.attendanceStatus)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Sessions */}
      {metrics && metrics.recentSessions && metrics.recentSessions.length > 0 && (
        <Card variant="default" padding="lg">
          <h3 style={{ ...typography.h3, marginBottom: spacing.md }}>Recent Sessions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.sm }}>
            {metrics.recentSessions.map((session: any) => (
              <div
                key={session.id}
                style={{
                  padding: spacing.md,
                  background: glass.inset.background,
                  borderRadius: borderRadius.sm,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: colors.text.primary, marginBottom: spacing.xs }}>
                    {session.title}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: colors.text.secondary }}>
                    {new Date(session.sessionDate).toLocaleDateString()} • {session.startTime} - {session.endTime}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: spacing.md }}>
                  {getStatusBadge(session.status)}
                  {session.markedAt && (
                    <div style={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                      {new Date(session.markedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
};

export default StudentTrainingCalendarPage;

import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { KPICard } from "../components/ui/KPICard";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

const StudentAttendancePage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAttendance();
  }, [selectedMonth, selectedYear]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentAttendance({
        month: selectedMonth,
        year: selectedYear
      });
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const date = new Date(selectedYear, month - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return { background: "#27ae60", color: "white" };
      case "ABSENT":
        return { background: "#e74c3c", color: "white" };
      case "EXCUSED":
        return { background: "#f39c12", color: "white" };
      default:
        return { background: "#e0e0e0", color: "#666" };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "✓ Present";
      case "ABSENT":
        return "✗ Absent";
      case "EXCUSED":
        return "~ Excused";
      default:
        return "Not Marked";
    }
  };

  // Calculate statistics
  const stats = {
    total: sessions.length,
    present: sessions.filter(s => s.attendanceStatus === "PRESENT").length,
    absent: sessions.filter(s => s.attendanceStatus === "ABSENT").length,
    excused: sessions.filter(s => s.attendanceStatus === "EXCUSED").length,
    notMarked: sessions.filter(s => s.attendanceStatus === "NOT_MARKED").length
  };

  const attendanceRate = stats.total > 0 
    ? ((stats.present + stats.excused) / stats.total * 100).toFixed(1)
    : "0";

  return (
    <div>
      <div style={{ marginBottom: spacing.lg }}>
        <h1 style={{ 
          ...typography.h2,
          marginBottom: spacing.sm,
          color: colors.text.primary,
        }}>
          📅 My Attendance
        </h1>
        <p style={{ 
          color: colors.text.muted, 
          margin: 0,
          ...typography.body,
        }}>
          View your session attendance for the month
        </p>
      </div>

      {error && (
        <div style={{
          padding: 12,
          background: "#fee",
          color: "#c33",
          borderRadius: 8,
          marginBottom: 16
        }}>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: spacing.md, marginBottom: spacing.lg }}>
        <KPICard
          label="Total Sessions"
          value={stats.total.toString()}
          color={colors.primary.main}
        />
        <KPICard
          label="Present"
          value={stats.present.toString()}
          color={colors.success.main}
        />
        <KPICard
          label="Absent"
          value={stats.absent.toString()}
          color={colors.danger.main}
        />
        <KPICard
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          color={colors.primary.main}
        />
      </div>

      {/* Filters */}
      <Card variant="default" padding="lg" style={{
        marginBottom: spacing.lg,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: spacing.md,
      }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "2px solid #e0e0e0",
              borderRadius: 6,
              fontSize: 13
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{getMonthName(month)}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
            Year
          </label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "2px solid #e0e0e0",
              borderRadius: 6,
              fontSize: 13
            }}
          />
        </div>
      </Card>

      {/* Sessions List */}
      <Card variant="default" padding="lg">
        <h2 style={{ 
          ...typography.h3,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}>
          Sessions for {getMonthName(selectedMonth)} {selectedYear}
        </h2>
        {loading ? (
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'],
            color: colors.text.muted,
            ...typography.body,
          }}>
            Loading...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'], 
            color: colors.text.muted,
            ...typography.body,
          }}>
            No sessions found for this month
          </div>
        ) : (
          <div style={{ display: "grid", gap: spacing.md }}>
            {sessions.map(session => {
              const sessionDate = new Date(session.sessionDate);
              const statusStyle = getStatusColor(session.attendanceStatus);
              
              return (
                <Card
                  key={session.id}
                  variant="default"
                  padding="md"
                  style={{
                    border: `1px solid rgba(255, 255, 255, 0.1)`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm }}>
                        <div style={{ 
                          fontSize: typography.fontSize.lg, 
                          fontWeight: typography.fontWeight.bold,
                          color: colors.text.primary,
                        }}>
                          {sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ 
                          fontSize: typography.fontSize.base, 
                          color: colors.text.muted,
                        }}>
                          {session.startTime} - {session.endTime}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        color: colors.text.muted,
                      }}>
                        {session.center.name} • Coach: {session.coach.fullName}
                      </div>
                      {session.notes && (
                        <div style={{ 
                          fontSize: typography.fontSize.xs, 
                          color: colors.text.muted, 
                          marginTop: spacing.xs, 
                          fontStyle: "italic",
                        }}>
                          Session Notes: {session.notes}
                        </div>
                      )}
                    </div>
                    <div style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: borderRadius.full,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      ...statusStyle
                    }}>
                      {getStatusLabel(session.attendanceStatus)}
                    </div>
                  </div>
                  {session.attendanceNotes && (
                    <div style={{
                      padding: spacing.md,
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: borderRadius.md,
                      borderLeft: `4px solid ${colors.primary.main}`,
                      marginTop: spacing.sm,
                    }}>
                      <div style={{ 
                        fontSize: typography.fontSize.xs, 
                        fontWeight: typography.fontWeight.semibold, 
                        color: colors.text.secondary, 
                        marginBottom: spacing.xs,
                      }}>
                        Coach Remarks:
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        color: colors.text.primary,
                      }}>
                        {session.attendanceNotes}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Attendance Summary */}
      {sessions.length > 0 && (
        <Card variant="default" padding="lg" style={{ marginTop: spacing.lg }}>
          <h2 style={{ 
            ...typography.h3,
            marginBottom: spacing.md,
            color: colors.text.primary,
          }}>
            Summary
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: spacing.md }}>
            <div style={{ 
              padding: spacing.md, 
              background: colors.success.soft, 
              borderRadius: borderRadius.md,
            }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginBottom: spacing.xs,
              }}>
                Present
              </div>
              <div style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: typography.fontWeight.bold, 
                color: colors.success.main,
              }}>
                {stats.present}
              </div>
            </div>
            <div style={{ 
              padding: spacing.md, 
              background: colors.danger.soft, 
              borderRadius: borderRadius.md,
            }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginBottom: spacing.xs,
              }}>
                Absent
              </div>
              <div style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: typography.fontWeight.bold, 
                color: colors.danger.main,
              }}>
                {stats.absent}
              </div>
            </div>
            <div style={{ 
              padding: spacing.md, 
              background: colors.warning.soft, 
              borderRadius: borderRadius.md,
            }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginBottom: spacing.xs,
              }}>
                Excused
              </div>
              <div style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: typography.fontWeight.bold, 
                color: colors.warning.main,
              }}>
                {stats.excused}
              </div>
            </div>
            <div style={{ 
              padding: spacing.md, 
              background: "rgba(255, 255, 255, 0.05)", 
              borderRadius: borderRadius.md,
            }}>
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginBottom: spacing.xs,
              }}>
                Not Marked
              </div>
              <div style={{ 
                fontSize: typography.fontSize['2xl'], 
                fontWeight: typography.fontWeight.bold, 
                color: colors.text.muted,
              }}>
                {stats.notMarked}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentAttendancePage;


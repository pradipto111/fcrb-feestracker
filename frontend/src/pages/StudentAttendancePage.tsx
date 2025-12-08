import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { KPICard } from "../components/ui/KPICard";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

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
    <motion.main
      className="rv-page rv-page--student-attendance"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      <section className="rv-section-surface">
        {/* Header */}
        <header className="rv-section-header">
          <div>
            <h1 className="rv-page-title">📅 My Attendance</h1>
            <p className="rv-page-subtitle">View your session attendance for the month</p>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <Card variant="default" padding="md" style={{ 
            marginBottom: spacing.md,
            background: colors.danger.soft,
            border: `1px solid ${colors.danger.main}40`,
          }}>
            <p style={{ margin: 0, color: colors.danger.main }}>Error: {error}</p>
          </Card>
        )}

        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: spacing.md, marginBottom: spacing.lg }}>
          <motion.div custom={0} variants={cardVariants} initial="initial" animate="animate">
            <KPICard
              title="Total Sessions"
              value={stats.total.toString()}
              variant="info"
            />
          </motion.div>
          <motion.div custom={1} variants={cardVariants} initial="initial" animate="animate">
            <KPICard
              title="Present"
              value={stats.present.toString()}
              variant="success"
            />
          </motion.div>
          <motion.div custom={2} variants={cardVariants} initial="initial" animate="animate">
            <KPICard
              title="Absent"
              value={stats.absent.toString()}
              variant="danger"
            />
          </motion.div>
          <motion.div custom={3} variants={cardVariants} initial="initial" animate="animate">
            <KPICard
              title="Attendance Rate"
              value={`${attendanceRate}%`}
              variant="primary"
            />
          </motion.div>
        </div>

        {/* Filters */}
        <div className="rv-filter-bar">
          <div className="rv-filter-field">
            <label>Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                background: "rgba(3, 9, 28, 0.9)",
                color: colors.text.primary,
                border: "1px solid var(--rv-border-subtle)",
                borderRadius: "var(--rv-radius-sm)",
                padding: "0.55rem 0.7rem",
                fontSize: "0.86rem",
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>
          <div className="rv-filter-field">
            <label>Year</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                background: "rgba(3, 9, 28, 0.9)",
                color: colors.text.primary,
                border: "1px solid var(--rv-border-subtle)",
                borderRadius: "var(--rv-radius-sm)",
                padding: "0.55rem 0.7rem",
                fontSize: "0.86rem",
              }}
            />
          </div>
        </div>

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
      </section>
    </motion.main>
  );
};

export default StudentAttendancePage;


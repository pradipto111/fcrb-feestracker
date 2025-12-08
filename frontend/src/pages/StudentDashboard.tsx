import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { KPICard } from "../components/ui/KPICard";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardData, attendance] = await Promise.all([
          api.getStudentDashboard(),
          api.getStudentAttendance({
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          })
        ]);
        setData(dashboardData);
        setAttendanceData(attendance);
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadData();
  }, []);

  return (
    <motion.main
      className="rv-page rv-page--student-dashboard"
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

        {/* Loading State */}
        {!data && !error && (
          <div className="rv-empty-state">
            <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--lg" style={{ marginBottom: spacing.md }} />
            <div className="rv-skeleton rv-skeleton-line rv-skeleton-line--md" />
            <p style={{ marginTop: spacing.lg, color: colors.text.muted }}>Loading dashboard data...</p>
          </div>
        )}

        {/* Content - Only render if data is loaded */}
        {data && !error && (() => {
          const { student, payments, summary } = data;
          return (
            <React.Fragment key="student-dashboard-content">
      {/* Header */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h1 style={{ 
          ...typography.h2,
          marginBottom: spacing.sm,
          color: colors.text.primary,
        }}>
          Welcome to FCRB, {student.fullName}!
        </h1>
        <p style={{ 
          color: colors.text.muted, 
          fontSize: typography.fontSize.base,
        }}>
          {student.center.name} - {student.programType}
        </p>
      </Card>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: spacing.lg, marginBottom: spacing.lg }}>
        <KPICard
          title="Monthly Fee"
          value={`₹${student.monthlyFeeAmount.toLocaleString()}`}
          variant="primary"
        />
        <KPICard
          title="Total Paid"
          value={`₹${summary.totalPaid.toLocaleString()}`}
          subtitle={`${summary.paymentCount} payments`}
          variant="success"
        />
        <KPICard
          title="Total Due"
          value={`₹${summary.totalDue.toLocaleString()}`}
          subtitle={`${summary.monthsSinceJoining} months`}
          variant="warning"
        />
        <KPICard
          title="Outstanding"
          value={`₹${Math.abs(summary.outstanding).toLocaleString()}`}
          subtitle={summary.outstanding > 0 ? "Due" : summary.outstanding < 0 ? "Advance" : "Paid"}
          variant={summary.outstanding > 0 ? "danger" : "success"}
        />
      </div>

      {/* Student Info */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2 style={{ 
          ...typography.h3,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}>
          Your Information
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              marginBottom: spacing.xs,
            }}>
              Email
            </div>
            <div style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}>
              {student.email || "-"}
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              marginBottom: spacing.xs,
            }}>
              Phone
            </div>
            <div style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}>
              {student.phoneNumber || "-"}
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              marginBottom: spacing.xs,
            }}>
              Date of Birth
            </div>
            <div style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}>
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "-"}
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              marginBottom: spacing.xs,
            }}>
              Joining Date
            </div>
            <div style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}>
              {student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : "-"}
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              marginBottom: spacing.xs,
            }}>
              Status
            </div>
            <div style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: typography.fontWeight.semibold,
            }}>
              <span style={{
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: borderRadius.full,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
                background: student.status === "ACTIVE" 
                  ? colors.success.soft 
                  : student.status === "TRIAL" 
                  ? colors.warning.soft 
                  : colors.text.muted + "40",
                color: student.status === "ACTIVE" 
                  ? colors.success.main 
                  : student.status === "TRIAL" 
                  ? colors.warning.main 
                  : colors.text.muted
              }}>
                {student.status}
              </span>
            </div>
          </div>
          <div>
            <div style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted, 
              marginBottom: spacing.xs,
            }}>
              Center
            </div>
            <div style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}>
              {student.center.name}
            </div>
            <div style={{ 
              fontSize: typography.fontSize.xs, 
              color: colors.text.muted,
            }}>
              {student.center.city}
            </div>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <h2 style={{ 
          ...typography.h3,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}>
          Payment History
        </h2>
        {summary.lastPaymentDate && (
          <p style={{ 
            color: colors.text.muted, 
            marginBottom: spacing.md,
            ...typography.body,
          }}>
            Last payment: {new Date(summary.lastPaymentDate).toLocaleDateString()}
          </p>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ 
                background: "rgba(255, 255, 255, 0.05)", 
                borderBottom: `2px solid rgba(255, 255, 255, 0.1)`,
              }}>
                <th style={{ 
                  padding: spacing.md, 
                  textAlign: "left", 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.secondary,
                }}>
                  Date
                </th>
                <th style={{ 
                  padding: spacing.md, 
                  textAlign: "right", 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.secondary,
                }}>
                  Amount
                </th>
                <th style={{ 
                  padding: spacing.md, 
                  textAlign: "left", 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.secondary,
                }}>
                  Mode
                </th>
                <th style={{ 
                  padding: spacing.md, 
                  textAlign: "left", 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.secondary,
                }}>
                  Reference
                </th>
                <th style={{ 
                  padding: spacing.md, 
                  textAlign: "left", 
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.secondary,
                }}>
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} style={{ 
                  borderBottom: `1px solid rgba(255, 255, 255, 0.05)`,
                }}>
                  <td style={{ 
                    padding: spacing.md,
                    color: colors.text.primary,
                  }}>
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </td>
                  <td style={{ 
                    padding: spacing.md, 
                    textAlign: "right", 
                    fontWeight: typography.fontWeight.semibold, 
                    color: colors.success.main,
                  }}>
                    ₹ {p.amount.toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: spacing.md,
                    color: colors.text.secondary,
                  }}>
                    {p.paymentMode}
                  </td>
                  <td style={{ 
                    padding: spacing.md, 
                    fontSize: typography.fontSize.sm, 
                    color: colors.text.muted,
                  }}>
                    {p.upiOrTxnReference || "-"}
                  </td>
                  <td style={{ 
                    padding: spacing.md, 
                    fontSize: typography.fontSize.sm, 
                    color: colors.text.muted,
                  }}>
                    {p.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div style={{ 
              padding: spacing['3xl'], 
              textAlign: "center", 
              color: colors.text.muted,
              ...typography.body,
            }}>
              No payments yet
            </div>
          )}
        </div>
      </Card>

      {/* Recent Attendance */}
      {attendanceData && attendanceData.sessions && attendanceData.sessions.length > 0 && (
        <Card variant="default" padding="lg">
          <h2 style={{ 
            ...typography.h3,
            marginBottom: spacing.md,
            color: colors.text.primary,
          }}>
            Recent Attendance
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {attendanceData.sessions.slice(0, 5).map((session: any) => {
              const sessionDate = new Date(session.sessionDate);
              const statusColor = session.attendanceStatus === "PRESENT" ? "#27ae60" :
                                 session.attendanceStatus === "ABSENT" ? "#e74c3c" :
                                 session.attendanceStatus === "EXCUSED" ? "#f39c12" : "#999";
              
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
                    <div>
                      <div style={{ 
                        fontSize: typography.fontSize.base, 
                        fontWeight: typography.fontWeight.bold, 
                        marginBottom: spacing.xs,
                        color: colors.text.primary,
                      }}>
                        {sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} - {session.startTime} to {session.endTime}
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        color: colors.text.muted,
                      }}>
                        {session.center.name}
                      </div>
                    </div>
                    <div style={{
                      padding: `${spacing.xs} ${spacing.md}`,
                      borderRadius: borderRadius.full,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold,
                      background: statusColor,
                      color: "white"
                    }}>
                      {session.attendanceStatus === "PRESENT" ? "✓ Present" :
                       session.attendanceStatus === "ABSENT" ? "✗ Absent" :
                       session.attendanceStatus === "EXCUSED" ? "~ Excused" : "Not Marked"}
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
          <div style={{ marginTop: spacing.md, textAlign: "center" }}>
            <Link
              to="/my-attendance"
              style={{
                color: colors.primary.light,
                textDecoration: "none",
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.sm,
              }}
            >
              View All Attendance →
          </Link>
        </div>
      </Card>
    )}
            </React.Fragment>
          );
        })()}
      </section>
    </motion.main>
  );
};

export default StudentDashboard;



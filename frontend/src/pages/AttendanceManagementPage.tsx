import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants, primaryButtonWhileHover, primaryButtonWhileTap } from "../utils/motion";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { academyAssets, adminAssets } from "../config/assets";
import { CalendarIcon, PlusIcon, ClipboardIcon, VoteIcon } from "../components/icons/IconSet";

const AttendanceManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [centers, setCenters] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showCreateMonthlySessions, setShowCreateMonthlySessions] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceModalSession, setAttendanceModalSession] = useState<any | null>(null);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentRemarks, setStudentRemarks] = useState<Record<number, string>>({});
  const [attendanceModalRemarks, setAttendanceModalRemarks] = useState<Record<number, string>>({});
  const [attendanceAnalytics, setAttendanceAnalytics] = useState<any>(null);
  const [showStudentBreakdown, setShowStudentBreakdown] = useState(false);

  // Form state for creating session
  const [sessionForm, setSessionForm] = useState({
    centerId: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    notes: ""
  });

  // Form state for creating monthly sessions
  const [monthlySessionsForm, setMonthlySessionsForm] = useState({
    centerId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    defaultStartTime: "09:00",
    defaultEndTime: "10:30",
    sessionDates: [] as Array<{ date: string; startTime: string; endTime: string; notes: string }>
  });

  useEffect(() => {
    loadCenters();
  }, []);

  useEffect(() => {
    if (selectedCenter) {
      loadSessions();
      loadStudents();
      loadAttendanceAnalytics();
    }
  }, [selectedCenter, selectedMonth, selectedYear]);

  const loadCenters = async () => {
    try {
      const centersData = await api.getCenters();
      setCenters(centersData);
      if (centersData.length > 0) {
        setSelectedCenter(centersData[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadSessions = async () => {
    if (!selectedCenter) return;
    try {
      setLoading(true);
      setError("");
      const sessionsData = await api.getSessions({
        centerId: selectedCenter,
        month: selectedMonth,
        year: selectedYear
      });
      setSessions(sessionsData);
      // Initialize remarks from existing attendance records
      const remarks: Record<string, string> = {};
      sessionsData.forEach((session: any) => {
        session.attendance?.forEach((att: any) => {
          const key = `${session.id}-${att.studentId}`;
          remarks[key] = att.notes || "";
        });
      });
      setStudentRemarks(remarks);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load sessions. Please check your connection and try again.";
      setError(errorMessage);
      console.error("Load sessions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedCenter) return;
    try {
      const studentsData = await api.getStudents();
      const centerStudents = studentsData.filter((s: any) => s.centerId === selectedCenter);
      setStudents(centerStudents);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAttendanceAnalytics = async () => {
    if (!selectedCenter) return;
    try {
      const analytics = await api.getAttendanceAnalytics({
        centreId: selectedCenter,
        month: selectedMonth,
        year: selectedYear
      });
      setAttendanceAnalytics(analytics);
    } catch (err: any) {
      console.error("Failed to load attendance analytics:", err);
      // Don't show error as this is optional data
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.centerId || !sessionForm.sessionDate || !sessionForm.startTime || !sessionForm.endTime) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await api.createSession({
        centerId: Number(sessionForm.centerId),
        sessionDate: sessionForm.sessionDate,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        notes: sessionForm.notes || undefined
      });
      setShowCreateSession(false);
      setSessionForm({ centerId: "", sessionDate: "", startTime: "", endTime: "", notes: "" });
      await loadSessions();
      await loadAttendanceAnalytics();
      setError("");
      
      // Open attendance modal for the newly created session
      if (result && result.id) {
        const fullSession = await api.getSession(result.id);
        setAttendanceModalSession(fullSession);
        // Initialize remarks from attendance records
        const remarks: Record<number, string> = {};
        if (fullSession.attendance) {
          fullSession.attendance.forEach((att: any) => {
            remarks[att.studentId] = att.notes || "";
          });
        }
        setAttendanceModalRemarks(remarks);
        setShowAttendanceModal(true);
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create session. Please check your connection and try again.";
      setError(errorMessage);
      console.error("Create session error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAttendanceModal = async (session: any) => {
    try {
      setLoading(true);
      // Fetch full session details with attendance
      const fullSession = await api.getSession(session.id);
      setAttendanceModalSession(fullSession);
      
      // Initialize remarks from existing attendance records
      const remarks: Record<number, string> = {};
      if (fullSession.attendance) {
        fullSession.attendance.forEach((att: any) => {
          remarks[att.studentId] = att.notes || "";
        });
      }
      setAttendanceModalRemarks(remarks);
      setShowAttendanceModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to load session details");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (sessionId: number, studentId: number, status: "PRESENT" | "ABSENT" | "EXCUSED", notes?: string) => {
    try {
      setLoading(true);
      await api.markAttendance(sessionId, { studentId, status, notes: notes || "" });
      await loadSessions();
      await loadAttendanceAnalytics();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkAttendance = async (sessionId: number, attendanceList: Array<{ studentId: number; status: "PRESENT" | "ABSENT" | "EXCUSED" }>) => {
    try {
      setLoading(true);
      await api.bulkMarkAttendance(sessionId, attendanceList);
      await loadSessions();
      setSelectedSession(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await api.deleteSession(sessionId);
      await loadSessions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddSessionDate = () => {
    setMonthlySessionsForm({
      ...monthlySessionsForm,
      sessionDates: [
        ...monthlySessionsForm.sessionDates,
        {
          date: "",
          startTime: monthlySessionsForm.defaultStartTime,
          endTime: monthlySessionsForm.defaultEndTime,
          notes: ""
        }
      ]
    });
  };

  const handleRemoveSessionDate = (index: number) => {
    setMonthlySessionsForm({
      ...monthlySessionsForm,
      sessionDates: monthlySessionsForm.sessionDates.filter((_, i) => i !== index)
    });
  };

  const handleUpdateSessionDate = (index: number, field: string, value: string) => {
    const updated = [...monthlySessionsForm.sessionDates];
    updated[index] = { ...updated[index], [field]: value };
    setMonthlySessionsForm({ ...monthlySessionsForm, sessionDates: updated });
  };

  const handleCreateMonthlySessions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monthlySessionsForm.centerId || monthlySessionsForm.sessionDates.length === 0) {
      setError("Please select a center and add at least one session date");
      return;
    }

    // Validate all sessions have required fields
    const invalidSessions = monthlySessionsForm.sessionDates.filter(
      s => !s.date || !s.startTime || !s.endTime
    );
    if (invalidSessions.length > 0) {
      setError("Please fill all required fields (date, start time, end time) for all sessions");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const sessions = monthlySessionsForm.sessionDates.map(s => ({
        sessionDate: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        notes: s.notes || undefined
      }));

      const result = await api.createBulkSessions({
        centerId: Number(monthlySessionsForm.centerId),
        sessions
      });

      setShowCreateMonthlySessions(false);
      setMonthlySessionsForm({
        centerId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        defaultStartTime: "09:00",
        defaultEndTime: "10:30",
        sessionDates: []
      });
      await loadSessions();
      setError("");
      
      // Open attendance modal for the first created session
      if (result.sessions && result.sessions.length > 0) {
        const firstSession = result.sessions[0];
        const fullSession = await api.getSession(firstSession.id);
        setAttendanceModalSession(fullSession);
        const remarks: Record<number, string> = {};
        if (fullSession.attendance) {
          fullSession.attendance.forEach((att: any) => {
            remarks[att.studentId] = att.notes || "";
          });
        }
        setAttendanceModalRemarks(remarks);
        setShowAttendanceModal(true);
      }
      
      alert(`Successfully created ${result.sessions?.length || sessions.length} sessions!`);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create sessions. Please check your connection and try again.";
      setError(errorMessage);
      console.error("Create monthly sessions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const addAllWeekdays = (dayOfWeek: number) => {
    // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const days = getDaysInMonth(monthlySessionsForm.month, monthlySessionsForm.year);
    const dates: string[] = [];
    
    for (let day = 1; day <= days; day++) {
      const date = new Date(monthlySessionsForm.year, monthlySessionsForm.month - 1, day);
      if (date.getDay() === dayOfWeek) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    const newSessions = dates.map(date => ({
      date,
      startTime: monthlySessionsForm.defaultStartTime,
      endTime: monthlySessionsForm.defaultEndTime,
      notes: ""
    }));

    setMonthlySessionsForm({
      ...monthlySessionsForm,
      sessionDates: [...monthlySessionsForm.sessionDates, ...newSessions]
    });
  };

  const getMonthName = (month: number) => {
    const date = new Date(selectedYear, month - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const {
    sectionVariants,
    headingVariants,
    getStaggeredCard,
  } = useHomepageAnimation();

  // Calculate KPIs - use analytics data for accuracy
  const totalSessions = attendanceAnalytics?.summary?.totalSessions || sessions.length;
  const sessionsThisMonth = sessions.length;
  const totalStudents = attendanceAnalytics?.summary?.totalStudents || students.length;
  const activeStudents = attendanceAnalytics?.summary?.activeStudents || students.filter((s: any) => s.status === "ACTIVE").length;
  const attendanceRate = attendanceAnalytics?.summary?.attendanceRate || 0;
  const presentRecords = attendanceAnalytics?.summary?.presentRecords || 0;
  const absentRecords = attendanceAnalytics?.summary?.absentRecords || 0;
  const excusedRecords = attendanceAnalytics?.summary?.excusedRecords || 0;

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ 
        position: 'relative',
        background: colors.surface.bg,
        minHeight: '100%',
      }}
    >
      {/* BANNER SECTION */}
      <motion.section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
        }}
        variants={sectionVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${academyAssets.trainingShot})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.2,
            filter: "blur(10px)",
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(4, 61, 208, 0.7) 0%, rgba(255, 169, 0, 0.5) 100%)`,
          }}
        />
        {/* Banner content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: spacing["2xl"],
            display: "flex",
            flexDirection: "column",
            gap: spacing.lg,
          }}
        >
          <motion.p
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.1em",
            }}
            variants={headingVariants}
          >
            RealVerse • Attendance Management
          </motion.p>
          <motion.h1
            style={{
              ...typography.h1,
              color: colors.text.onPrimary,
              margin: 0,
            }}
            variants={headingVariants}
          >
            Session Attendance
            <span style={{ display: "block", color: colors.accent.main, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal, marginTop: spacing.xs }}>
              Track and manage player attendance across all sessions
            </span>
          </motion.h1>
          
          {/* KPI Cards Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: spacing.md,
              marginTop: spacing.md,
            }}
          >
            {[
              { label: "Sessions This Month", value: sessionsThisMonth, subLabel: `${selectedMonth}/${selectedYear}` },
              { label: "Active Students", value: `${activeStudents}/${totalStudents}`, subLabel: "Enrolled" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, subLabel: "This period" },
              { label: "Present/Absent", value: `${presentRecords}/${absentRecords}`, subLabel: `${excusedRecords} excused` },
            ].map((kpi, index) => (
              <motion.div
                key={kpi.label}
                {...getStaggeredCard(index)}
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <p style={{ ...typography.caption, color: colors.text.onPrimary, opacity: 0.8, marginBottom: spacing.xs }}>
                  {kpi.label}
                </p>
                <p style={{ ...typography.h2, color: colors.text.onPrimary, margin: 0 }}>
                  {kpi.value}
                </p>
                {kpi.subLabel && (
                  <p style={{ ...typography.caption, color: colors.text.onPrimary, opacity: 0.6, marginTop: spacing.xs, margin: 0 }}>
                    {kpi.subLabel}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <PageHeader
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
            <CalendarIcon size={24} />
            Attendance
          </span>
        }
        subtitle="Manage sessions and track player attendance"
        actions={
          <>
            <Button variant="primary" onClick={() => setShowCreateSession(true)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <PlusIcon size={16} />
                Create Session
              </span>
            </Button>
            <Button variant="secondary" onClick={() => setShowCreateMonthlySessions(true)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <CalendarIcon size={16} />
                Create Monthly Sessions
              </span>
            </Button>
          </>
        }
      />

      {error && (
        <Card variant="default" padding="md" style={{ 
          marginBottom: spacing.md,
          background: colors.danger.soft,
          border: `1px solid ${colors.danger.main}40`,
        }}>
          <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
        </Card>
      )}

      {/* Filters */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16
      }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
            Center
          </label>
          <select
            value={selectedCenter || ""}
            onChange={(e) => setSelectedCenter(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "2px solid #e0e0e0",
              borderRadius: 6,
              fontSize: 13
            }}
          >
            {centers.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
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

      {/* Create Session Modal */}
      {showCreateSession && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <Card variant="elevated" padding="lg" style={{
            maxWidth: 500,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ 
              ...typography.h2,
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}>Create New Session</h2>
            <form onSubmit={handleCreateSession}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Center *
                </label>
                <select
                  value={sessionForm.centerId}
                  onChange={(e) => setSessionForm({ ...sessionForm, centerId: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                >
                  <option value="">Select Center</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>{center.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Notes
                </label>
                <textarea
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? "Creating..." : "Create Session"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowCreateSession(false);
                    setSessionForm({ centerId: "", sessionDate: "", startTime: "", endTime: "", notes: "" });
                    setError("");
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Create Monthly Sessions Modal */}
      {showCreateMonthlySessions && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <Card variant="elevated" padding="lg" style={{
            maxWidth: 800,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ 
              ...typography.h2,
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}>Create Monthly Sessions</h2>
            <form onSubmit={handleCreateMonthlySessions}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Center *
                  </label>
                  <select
                    value={monthlySessionsForm.centerId}
                    onChange={(e) => setMonthlySessionsForm({ ...monthlySessionsForm, centerId: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  >
                    <option value="">Select Center</option>
                    {centers.map(center => (
                      <option key={center.id} value={center.id}>{center.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Month *
                  </label>
                  <select
                    value={monthlySessionsForm.month}
                    onChange={(e) => setMonthlySessionsForm({ ...monthlySessionsForm, month: Number(e.target.value) })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Year *
                  </label>
                  <input
                    type="number"
                    value={monthlySessionsForm.year}
                    onChange={(e) => setMonthlySessionsForm({ ...monthlySessionsForm, year: Number(e.target.value) })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Default Start Time
                  </label>
                  <input
                    type="time"
                    value={monthlySessionsForm.defaultStartTime}
                    onChange={(e) => setMonthlySessionsForm({ ...monthlySessionsForm, defaultStartTime: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Default End Time
                  </label>
                  <input
                    type="time"
                    value={monthlySessionsForm.defaultEndTime}
                    onChange={(e) => setMonthlySessionsForm({ ...monthlySessionsForm, defaultEndTime: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16, padding: 16, background: "#f8f9fa", borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Quick Add:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => addAllWeekdays(1)}
                    style={{
                      padding: "8px 16px",
                      background: "#1E40AF",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Add All Mondays
                  </button>
                  <button
                    type="button"
                    onClick={() => addAllWeekdays(2)}
                    style={{
                      padding: "8px 16px",
                      background: "#1E40AF",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Add All Tuesdays
                  </button>
                  <button
                    type="button"
                    onClick={() => addAllWeekdays(3)}
                    style={{
                      padding: "8px 16px",
                      background: "#1E40AF",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Add All Wednesdays
                  </button>
                  <button
                    type="button"
                    onClick={() => addAllWeekdays(4)}
                    style={{
                      padding: "8px 16px",
                      background: "#1E40AF",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Add All Thursdays
                  </button>
                  <button
                    type="button"
                    onClick={() => addAllWeekdays(5)}
                    style={{
                      padding: "8px 16px",
                      background: "#1E40AF",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Add All Fridays
                  </button>
                  <button
                    type="button"
                    onClick={() => addAllWeekdays(6)}
                    style={{
                      padding: "8px 16px",
                      background: "#1E40AF",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Add All Saturdays
                  </button>
                  <button
                    type="button"
                    onClick={() => addAllWeekdays(0)}
                    style={{
                      padding: "8px 16px",
                      background: "#1E40AF",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    Add All Sundays
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label style={{ fontWeight: 600, fontSize: 16 }}>
                    Session Dates ({monthlySessionsForm.sessionDates.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSessionDate}
                    style={{
                      padding: "8px 16px",
                      background: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                      <PlusIcon size={14} />
                      Add Date
                    </span>
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 300, overflowY: "auto", padding: 8 }}>
                  {monthlySessionsForm.sessionDates.map((session, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 16,
                        border: "2px solid #e0e0e0",
                        borderRadius: 8,
                        background: "#f8f9fa"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#666" }}>
                          Session {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSessionDate(index)}
                          style={{
                            padding: "4px 8px",
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 11
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
                            Date *
                          </label>
                          <input
                            type="date"
                            value={session.date}
                            onChange={(e) => handleUpdateSessionDate(index, "date", e.target.value)}
                            required
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "2px solid #e0e0e0",
                              borderRadius: 6,
                              fontSize: 13
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
                            Start Time *
                          </label>
                          <input
                            type="time"
                            value={session.startTime}
                            onChange={(e) => handleUpdateSessionDate(index, "startTime", e.target.value)}
                            required
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "2px solid #e0e0e0",
                              borderRadius: 6,
                              fontSize: 13
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
                            End Time *
                          </label>
                          <input
                            type="time"
                            value={session.endTime}
                            onChange={(e) => handleUpdateSessionDate(index, "endTime", e.target.value)}
                            required
                            style={{
                              width: "100%",
                              padding: "8px",
                              border: "2px solid #e0e0e0",
                              borderRadius: 6,
                              fontSize: 13
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <label style={{ display: "block", marginBottom: 4, fontSize: 12, fontWeight: 600 }}>
                          Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={session.notes}
                          onChange={(e) => handleUpdateSessionDate(index, "notes", e.target.value)}
                          placeholder="Session notes..."
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "2px solid #e0e0e0",
                            borderRadius: 6,
                            fontSize: 13
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {monthlySessionsForm.sessionDates.length === 0 && (
                    <div style={{ textAlign: "center", padding: 24, color: "#999" }}>
                      No sessions added yet. Click "Add Date" to add sessions.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  disabled={loading || monthlySessionsForm.sessionDates.length === 0}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: loading || monthlySessionsForm.sessionDates.length === 0 ? "#ccc" : "#27ae60",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: loading || monthlySessionsForm.sessionDates.length === 0 ? "not-allowed" : "pointer",
                    fontWeight: 600
                  }}
                >
                  {loading ? "Creating..." : `Create ${monthlySessionsForm.sessionDates.length} Sessions`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateMonthlySessions(false);
                    setMonthlySessionsForm({
                      centerId: "",
                      month: new Date().getMonth() + 1,
                      year: new Date().getFullYear(),
                      defaultStartTime: "09:00",
                      defaultEndTime: "10:30",
                      sessionDates: []
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Student Attendance Breakdown */}
      {attendanceAnalytics && (
        <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <h2 style={{ 
              ...typography.h3,
              margin: 0,
              color: colors.text.primary,
            }}>
              Student Attendance Breakdown
            </h2>
            <Button
              variant="utility"
              size="sm"
              onClick={() => setShowStudentBreakdown(!showStudentBreakdown)}
            >
              {showStudentBreakdown ? "Hide Details" : "Show Details"}
            </Button>
          </div>

          {/* Programme-wise breakdown */}
          {attendanceAnalytics.programBreakdown && attendanceAnalytics.programBreakdown.length > 0 && (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
              gap: spacing.md,
              marginBottom: spacing.lg
            }}>
              {attendanceAnalytics.programBreakdown.map((program: any) => (
                <Card
                  key={program.program}
                  variant="default"
                  padding="md"
                  style={{
                    background: colors.primary.soft,
                    border: `1px solid ${colors.primary.outline}`,
                  }}
                >
                  <div style={{ 
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                  }}>
                    {program.program}
                  </div>
                  <div style={{ 
                    fontSize: typography.fontSize['2xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary.main,
                    marginBottom: spacing.xs,
                  }}>
                    {program.rate}%
                  </div>
                  <div style={{ 
                    fontSize: typography.fontSize.xs,
                    color: colors.text.muted,
                  }}>
                    {program.students} students • {program.present}/{program.totalRecords} present
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Detailed student list */}
          {showStudentBreakdown && attendanceAnalytics.allStudentAttendance && (
            <div style={{ 
              maxHeight: "600px", 
              overflowY: "auto",
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.lg,
              padding: spacing.md,
            }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                gap: spacing.md,
                padding: spacing.sm,
                background: colors.surface.hover,
                borderRadius: borderRadius.md,
                marginBottom: spacing.sm,
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.secondary,
              }}>
                <div>Student Name</div>
                <div>Programme</div>
                <div>Status</div>
                <div>Present</div>
                <div>Absent</div>
                <div>Excused</div>
                <div>Rate</div>
              </div>
              {attendanceAnalytics.allStudentAttendance.map((student: any) => {
                const rateColor = student.attendanceRate >= 85 ? colors.success.main :
                                  student.attendanceRate >= 70 ? colors.warning.main :
                                  colors.danger.main;
                
                return (
                  <div
                    key={student.studentId}
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                      gap: spacing.md,
                      padding: spacing.sm,
                      borderBottom: `1px solid ${colors.border.light}`,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.primary,
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.surface.hover}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ fontWeight: typography.fontWeight.semibold }}>{student.studentName}</div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.muted }}>{student.programType || "N/A"}</div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.muted }}>{student.status}</div>
                    <div style={{ color: colors.success.main, fontWeight: typography.fontWeight.semibold }}>{student.present}</div>
                    <div style={{ color: colors.danger.main, fontWeight: typography.fontWeight.semibold }}>{student.absent}</div>
                    <div style={{ color: colors.warning.main, fontWeight: typography.fontWeight.semibold }}>{student.excused}</div>
                    <div style={{ 
                      color: rateColor, 
                      fontWeight: typography.fontWeight.bold,
                      fontSize: typography.fontSize.base,
                    }}>
                      {student.attendanceRate}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sessions.map((session, index) => {
              const sessionDate = new Date(session.sessionDate);
              const attendanceMap = new Map(session.attendance.map((a: any) => [a.studentId, a]));
              
              return (
                <motion.div
                  key={session.id}
                  custom={index}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Card
                    variant={selectedSession?.id === session.id ? "elevated" : "default"}
                    padding="md"
                    style={{
                      border: selectedSession?.id === session.id 
                      ? `2px solid ${colors.primary.outline}` 
                      : `1px solid rgba(255, 255, 255, 0.1)`,
                    background: selectedSession?.id === session.id 
                      ? colors.primary.soft 
                      : colors.surface.card,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setSelectedSession(session)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.md }}>
                    <div>
                      <div style={{ 
                        fontSize: typography.fontSize.lg, 
                        fontWeight: typography.fontWeight.bold, 
                        marginBottom: spacing.xs,
                        color: colors.text.primary,
                      }}>
                        {sessionDate.toLocaleDateString()} - {session.startTime} to {session.endTime}
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
                          {session.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: spacing.sm }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenAttendanceModal(session)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                          <ClipboardIcon size={16} />
                          Mark Attendance
                        </span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/vote/${session.id}`)}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                          <VoteIcon size={16} />
                          Vote
                        </span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Attendance Marking Modal */}
      {showAttendanceModal && attendanceModalSession && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }}>
          <Card variant="elevated" padding="lg" style={{
            maxWidth: 900,
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.lg }}>
              <div>
                <h2 style={{ 
                  ...typography.h2,
                  marginBottom: spacing.sm,
                  color: colors.text.primary,
                }}>
                  Mark Attendance
                </h2>
                <div style={{ 
                  fontSize: typography.fontSize.base, 
                  color: colors.text.secondary, 
                  marginBottom: spacing.xs,
                }}>
                  {new Date(attendanceModalSession.sessionDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div style={{ 
                  fontSize: typography.fontSize.sm, 
                  color: colors.text.muted,
                }}>
                  {attendanceModalSession.startTime} - {attendanceModalSession.endTime} • {attendanceModalSession.center.name}
                </div>
                {attendanceModalSession.notes && (
                  <div style={{ 
                    fontSize: typography.fontSize.xs, 
                    color: colors.text.muted, 
                    marginTop: spacing.sm, 
                    fontStyle: "italic",
                  }}>
                    Session Notes: {attendanceModalSession.notes}
                  </div>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowAttendanceModal(false);
                  setAttendanceModalSession(null);
                  setAttendanceModalRemarks({});
                }}
              >
                ✕ Close
              </Button>
            </div>

            <Card variant="default" padding="md" style={{ 
              marginBottom: spacing.lg,
              background: colors.primary.soft,
              border: `1px solid ${colors.primary.outline}`,
            }}>
              <div style={{ 
                fontSize: typography.fontSize.sm,
                color: colors.primary.light,
              }}>
                <strong>Total Students:</strong> {students.length} • 
                <strong> Marked:</strong> {
                  attendanceModalSession.attendance?.filter((a: any) => a.status !== "ABSENT" || a.notes).length || 0
                } / {students.length}
              </div>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              {students.map(student => {
                const attendance = attendanceModalSession.attendance?.find((a: any) => a.studentId === student.id);
                const currentStatus = attendance?.status || "ABSENT";
                const currentRemark = attendanceModalRemarks[student.id] || attendance?.notes || "";
                
                const statusColor = currentStatus === "PRESENT" ? colors.success.main :
                                   currentStatus === "ABSENT" ? colors.danger.main :
                                   colors.warning.main;
                
                return (
                  <Card
                    key={student.id}
                    variant="default"
                    padding="lg"
                    style={{
                      border: `2px solid ${statusColor}40`,
                      background: `${statusColor}10`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.md }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: typography.fontWeight.bold, 
                          fontSize: typography.fontSize.lg, 
                          marginBottom: spacing.xs,
                          color: colors.text.primary,
                        }}>
                          {student.fullName}
                        </div>
                        <div style={{ 
                          fontSize: typography.fontSize.xs, 
                          color: colors.text.muted,
                        }}>
                          {student.programType || "No Programme"} • {student.status}
                        </div>
                        {attendance && (
                          <div style={{ 
                            fontSize: typography.fontSize.xs, 
                            color: statusColor,
                            fontWeight: typography.fontWeight.semibold,
                            marginTop: spacing.xs,
                          }}>
                            Current Status: {currentStatus}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                        <Button
                          variant={currentStatus === "PRESENT" ? "primary" : "utility"}
                          size="sm"
                          onClick={async () => {
                            const remark = attendanceModalRemarks[student.id] || "";
                            await handleMarkAttendance(attendanceModalSession.id, student.id, "PRESENT", remark);
                            await handleOpenAttendanceModal(attendanceModalSession);
                          }}
                          disabled={loading}
                          style={{
                            background: currentStatus === "PRESENT" ? colors.success.main : undefined,
                          }}
                        >
                          ✓ Present
                        </Button>
                        <Button
                          variant={currentStatus === "ABSENT" ? "danger" : "utility"}
                          size="sm"
                          onClick={async () => {
                            const remark = attendanceModalRemarks[student.id] || "";
                            await handleMarkAttendance(attendanceModalSession.id, student.id, "ABSENT", remark);
                            await handleOpenAttendanceModal(attendanceModalSession);
                          }}
                          disabled={loading}
                        >
                          ✗ Absent
                        </Button>
                        <Button
                          variant={currentStatus === "EXCUSED" ? "secondary" : "utility"}
                          size="sm"
                          onClick={async () => {
                            const remark = attendanceModalRemarks[student.id] || "";
                            await handleMarkAttendance(attendanceModalSession.id, student.id, "EXCUSED", remark);
                            await handleOpenAttendanceModal(attendanceModalSession);
                          }}
                          disabled={loading}
                          style={{
                            background: currentStatus === "EXCUSED" ? colors.warning.main : undefined,
                          }}
                        >
                          ~ Excused
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label style={{ 
                        display: "block", 
                        marginBottom: spacing.sm, 
                        fontSize: typography.fontSize.sm, 
                        fontWeight: typography.fontWeight.semibold, 
                        color: colors.text.secondary,
                      }}>
                        Review / Remarks
                      </label>
                      <textarea
                        value={currentRemark}
                        onChange={(e) => {
                          setAttendanceModalRemarks({ ...attendanceModalRemarks, [student.id]: e.target.value });
                        }}
                        onBlur={async () => {
                          if (currentStatus) {
                            await handleMarkAttendance(
                              attendanceModalSession.id, 
                              student.id, 
                              currentStatus as "PRESENT" | "ABSENT" | "EXCUSED", 
                              attendanceModalRemarks[student.id] || ""
                            );
                            await handleOpenAttendanceModal(attendanceModalSession);
                          }
                        }}
                        placeholder="Add review or remarks for this student (e.g., 'Excellent performance today', 'Needs improvement in passing', 'Late by 10 minutes')"
                        rows={3}
                        style={{
                          width: "100%",
                          padding: spacing.sm,
                          border: "2px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: borderRadius.lg,
                          fontSize: typography.fontSize.sm,
                          fontFamily: typography.fontFamily.primary,
                          resize: "vertical",
                          background: "rgba(255, 255, 255, 0.1)",
                          color: colors.text.primary,
                        }}
                      />
                      <div style={{ 
                        fontSize: typography.fontSize.xs, 
                        color: colors.text.muted, 
                        marginTop: spacing.xs,
                      }}>
                        This review will be visible to the student on their dashboard
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div style={{ 
              marginTop: spacing.lg, 
              paddingTop: spacing.lg, 
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`, 
              display: "flex", 
              gap: spacing.md,
            }}>
              <Button
                variant="primary"
                onClick={async () => {
                  // Save all remarks
                  for (const student of students) {
                    const remark = attendanceModalRemarks[student.id] || "";
                    const attendance = attendanceModalSession.attendance?.find((a: any) => a.studentId === student.id);
                    if (attendance?.status) {
                      await handleMarkAttendance(
                        attendanceModalSession.id,
                        student.id,
                        attendance.status as "PRESENT" | "ABSENT" | "EXCUSED",
                        remark
                      );
                    }
                  }
                  await handleOpenAttendanceModal(attendanceModalSession);
                }}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? "Saving..." : "💾 Save All Changes"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAttendanceModal(false);
                  setAttendanceModalSession(null);
                  setAttendanceModalRemarks({});
                  loadSessions();
                }}
                style={{ flex: 1 }}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </motion.main>
  );
};

export default AttendanceManagementPage;



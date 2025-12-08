import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
      const remarks: Record<number, string> = {};
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

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/photo3.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
            📅 Attendance Tracker
          </h1>
          <p style={{ color: "#666", margin: 0 }}>Manage sessions and track student attendance</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowCreateSession(true)}
            style={{
              padding: "12px 24px",
              background: "#1E40AF",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            ➕ Create Session
          </button>
          <button
            onClick={() => setShowCreateMonthlySessions(true)}
            style={{
              padding: "12px 24px",
              background: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14
            }}
          >
            📅 Create Monthly Sessions
          </button>
        </div>
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

      {/* Filters */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24,
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
      </div>

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
          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 12,
            maxWidth: 500,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Create New Session</h2>
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
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#1E40AF",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Create Session
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSession(false);
                    setSessionForm({ centerId: "", sessionDate: "", startTime: "", endTime: "", notes: "" });
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
          </div>
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
          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 12,
            maxWidth: 800,
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Create Monthly Sessions</h2>
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
                    ➕ Add Date
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
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          Sessions for {getMonthName(selectedMonth)} {selectedYear}
        </h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No sessions found for this month
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sessions.map(session => {
              const sessionDate = new Date(session.sessionDate);
              const attendanceMap = new Map(session.attendance.map((a: any) => [a.studentId, a]));
              
              return (
                <div
                  key={session.id}
                  style={{
                    border: "2px solid #e0e0e0",
                    borderRadius: 8,
                    padding: 16,
                    background: selectedSession?.id === session.id ? "#f0f7ff" : "white"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                        {sessionDate.toLocaleDateString()} - {session.startTime} to {session.endTime}
                      </div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        {session.center.name} • Coach: {session.coach.fullName}
                      </div>
                      {session.notes && (
                        <div style={{ fontSize: 13, color: "#666", marginTop: 4, fontStyle: "italic" }}>
                          {session.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleOpenAttendanceModal(session)}
                        style={{
                          padding: "8px 16px",
                          background: "#1E40AF",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        📋 Mark Attendance
                      </button>
                      <button
                        onClick={() => navigate(`/vote/${session.id}`)}
                        style={{
                          padding: "8px 16px",
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        🗳️ Vote
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        style={{
                          padding: "8px 16px",
                          background: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

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
          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 12,
            maxWidth: 900,
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                  Mark Attendance
                </h2>
                <div style={{ fontSize: 16, color: "#666", marginBottom: 4 }}>
                  {new Date(attendanceModalSession.sessionDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div style={{ fontSize: 14, color: "#999" }}>
                  {attendanceModalSession.startTime} - {attendanceModalSession.endTime} • {attendanceModalSession.center.name}
                </div>
                {attendanceModalSession.notes && (
                  <div style={{ fontSize: 13, color: "#666", marginTop: 8, fontStyle: "italic" }}>
                    Session Notes: {attendanceModalSession.notes}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setAttendanceModalSession(null);
                  setAttendanceModalRemarks({});
                }}
                style={{
                  padding: "8px 12px",
                  background: "#e0e0e0",
                  color: "#666",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ 
                padding: 12, 
                background: "#f0f7ff", 
                borderRadius: 8,
                fontSize: 14,
                color: "#1E40AF"
              }}>
                <strong>Total Students:</strong> {students.length} • 
                <strong> Marked:</strong> {
                  attendanceModalSession.attendance?.filter((a: any) => a.status !== "ABSENT" || a.notes).length || 0
                } / {students.length}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {students.map(student => {
                const attendance = attendanceModalSession.attendance?.find((a: any) => a.studentId === student.id);
                const currentStatus = attendance?.status || "ABSENT";
                const currentRemark = attendanceModalRemarks[student.id] || attendance?.notes || "";
                
                return (
                  <div
                    key={student.id}
                    style={{
                      padding: 20,
                      border: `2px solid ${
                        currentStatus === "PRESENT" ? "#27ae60" :
                        currentStatus === "ABSENT" ? "#e74c3c" :
                        currentStatus === "EXCUSED" ? "#f39c12" : "#e0e0e0"
                      }`,
                      borderRadius: 8,
                      background: "#f8f9fa"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                          {student.fullName}
                        </div>
                        <div style={{ fontSize: 13, color: "#666" }}>
                          {student.programType || "No Program"} • {student.status}
                        </div>
                        {attendance && (
                          <div style={{ 
                            fontSize: 12, 
                            color: currentStatus === "PRESENT" ? "#27ae60" :
                                   currentStatus === "ABSENT" ? "#e74c3c" : "#f39c12",
                            fontWeight: 600,
                            marginTop: 4
                          }}>
                            Current Status: {currentStatus}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={async () => {
                            const remark = attendanceModalRemarks[student.id] || "";
                            await handleMarkAttendance(attendanceModalSession.id, student.id, "PRESENT", remark);
                            await handleOpenAttendanceModal(attendanceModalSession);
                          }}
                          disabled={loading}
                          style={{
                            padding: "10px 16px",
                            background: currentStatus === "PRESENT" ? "#27ae60" : "#e0e0e0",
                            color: currentStatus === "PRESENT" ? "white" : "#666",
                            border: "none",
                            borderRadius: 6,
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            opacity: loading ? 0.6 : 1,
                            transition: "all 0.2s"
                          }}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={async () => {
                            const remark = attendanceModalRemarks[student.id] || "";
                            await handleMarkAttendance(attendanceModalSession.id, student.id, "ABSENT", remark);
                            await handleOpenAttendanceModal(attendanceModalSession);
                          }}
                          disabled={loading}
                          style={{
                            padding: "10px 16px",
                            background: currentStatus === "ABSENT" ? "#e74c3c" : "#e0e0e0",
                            color: currentStatus === "ABSENT" ? "white" : "#666",
                            border: "none",
                            borderRadius: 6,
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            opacity: loading ? 0.6 : 1,
                            transition: "all 0.2s"
                          }}
                        >
                          ✗ Absent
                        </button>
                        <button
                          onClick={async () => {
                            const remark = attendanceModalRemarks[student.id] || "";
                            await handleMarkAttendance(attendanceModalSession.id, student.id, "EXCUSED", remark);
                            await handleOpenAttendanceModal(attendanceModalSession);
                          }}
                          disabled={loading}
                          style={{
                            padding: "10px 16px",
                            background: currentStatus === "EXCUSED" ? "#f39c12" : "#e0e0e0",
                            color: currentStatus === "EXCUSED" ? "white" : "#666",
                            border: "none",
                            borderRadius: 6,
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            opacity: loading ? 0.6 : 1,
                            transition: "all 0.2s"
                          }}
                        >
                          ~ Excused
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: 600, color: "#333" }}>
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
                          padding: "12px",
                          border: "2px solid #e0e0e0",
                          borderRadius: 6,
                          fontSize: 14,
                          fontFamily: "inherit",
                          resize: "vertical"
                        }}
                      />
                      <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                        This review will be visible to the student on their dashboard
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "2px solid #e0e0e0", display: "flex", gap: 12 }}>
              <button
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
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#1E40AF",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: 15
                }}
              >
                {loading ? "Saving..." : "💾 Save All Changes"}
              </button>
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setAttendanceModalSession(null);
                  setAttendanceModalRemarks({});
                  loadSessions();
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#ccc",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 15
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagementPage;


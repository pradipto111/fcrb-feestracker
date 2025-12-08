import React, { useEffect, useState } from "react";
import { api } from "../api/client";

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
    <div style={{
      minHeight: "100vh",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/photo3.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
          📅 My Attendance
        </h1>
        <p style={{ color: "#666", margin: 0 }}>View your session attendance for the month</p>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Total Sessions</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF" }}>{stats.total}</div>
        </div>
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Present</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#27ae60" }}>{stats.present}</div>
        </div>
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Absent</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#e74c3c" }}>{stats.absent}</div>
        </div>
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Attendance Rate</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#1E40AF" }}>{attendanceRate}%</div>
        </div>
      </div>

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
          <div style={{ display: "grid", gap: 12 }}>
            {sessions.map(session => {
              const sessionDate = new Date(session.sessionDate);
              const statusStyle = getStatusColor(session.attendanceStatus);
              
              return (
                <div
                  key={session.id}
                  style={{
                    border: "2px solid #e0e0e0",
                    borderRadius: 8,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                          {sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 16, color: "#666" }}>
                          {session.startTime} - {session.endTime}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, color: "#666" }}>
                        {session.center.name} • Coach: {session.coach.fullName}
                      </div>
                      {session.notes && (
                        <div style={{ fontSize: 13, color: "#999", marginTop: 4, fontStyle: "italic" }}>
                          Session Notes: {session.notes}
                        </div>
                      )}
                    </div>
                    <div style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600,
                      ...statusStyle
                    }}>
                      {getStatusLabel(session.attendanceStatus)}
                    </div>
                  </div>
                  {session.attendanceNotes && (
                    <div style={{
                      padding: 12,
                      background: "#f8f9fa",
                      borderRadius: 6,
                      borderLeft: "4px solid #1E40AF"
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 4 }}>
                        Coach Remarks:
                      </div>
                      <div style={{ fontSize: 14, color: "#333" }}>
                        {session.attendanceNotes}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendance Summary */}
      {sessions.length > 0 && (
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginTop: 24
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Summary</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            <div style={{ padding: 16, background: "#e8f5e9", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Present</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#27ae60" }}>{stats.present}</div>
            </div>
            <div style={{ padding: 16, background: "#ffebee", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Absent</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#e74c3c" }}>{stats.absent}</div>
            </div>
            <div style={{ padding: 16, background: "#fff3e0", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Excused</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#f39c12" }}>{stats.excused}</div>
            </div>
            <div style={{ padding: 16, background: "#f5f5f5", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Not Marked</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#666" }}>{stats.notMarked}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;


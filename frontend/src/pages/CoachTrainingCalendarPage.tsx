import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageShell } from "../components/ui/PageShell";
import { PageHeader } from "../components/ui/PageHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { glass } from "../theme/glass";
import { CalendarIcon, PlusIcon, UsersIcon, CheckIcon, CloseIcon } from "../components/icons/IconSet";

interface Session {
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
  participants: Array<{
    id: number;
    student: { id: number; fullName: string; status: string };
  }>;
  attendance: Array<{
    id: number;
    studentId: number;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
    notes?: string;
    markedBy: number;
    markedAt: string;
  }>;
}

const CoachTrainingCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCenterId, selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, centersData] = await Promise.all([
        api.getSessions({
          centerId: selectedCenterId || undefined,
          month: selectedMonth,
          year: selectedYear,
        }),
        api.getCenters(),
      ]);

      setSessions(sessionsData || []);
      setCenters(centersData || []);

      // Set default center if not selected
      if (!selectedCenterId && centersData && centersData.length > 0) {
        setSelectedCenterId(centersData[0].id);
      }

      // Load students for the selected center
      if (selectedCenterId) {
        const studentsData = await api.getStudents(undefined, selectedCenterId.toString());
        setStudents(studentsData || []);
      }
    } catch (error: any) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (data: any) => {
    try {
      await api.createSession({
        centerId: selectedCenterId!,
        ...data,
      });
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to create session");
    }
  };

  const handleSessionClick = async (session: Session) => {
    // Load full session details with participants
    try {
      const fullSession = await api.getSession(session.id);
      setSelectedSession(fullSession);
      setShowSessionModal(true);
    } catch (error: any) {
      console.error("Failed to load session details:", error);
    }
  };

  const handleMarkAttendance = async (sessionId: number, studentId: number, status: "PRESENT" | "ABSENT" | "EXCUSED") => {
    try {
      await api.markAttendance(sessionId, { studentId, status });
      // Reload session details
      const updatedSession = await api.getSession(sessionId);
      setSelectedSession(updatedSession);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to mark attendance");
    }
  };

  const handleBulkMarkAttendance = async (sessionId: number, status: "PRESENT" | "ABSENT") => {
    if (!selectedSession) return;
    
    try {
      const attendanceList = selectedSession.participants.map(p => ({
        studentId: p.student.id,
        status,
      }));
      await api.bulkMarkAttendance(sessionId, attendanceList);
      const updatedSession = await api.getSession(sessionId);
      setSelectedSession(updatedSession);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to mark attendance");
    }
  };

  const handleAddParticipant = async (sessionId: number, studentId: number) => {
    try {
      await api.addSessionParticipant(sessionId, studentId);
      const updatedSession = await api.getSession(sessionId);
      setSelectedSession(updatedSession);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to add participant");
    }
  };

  const handleRemoveParticipant = async (sessionId: number, studentId: number) => {
    try {
      await api.removeSessionParticipant(sessionId, studentId);
      const updatedSession = await api.getSession(sessionId);
      setSelectedSession(updatedSession);
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to remove participant");
    }
  };

  // Calendar rendering logic
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
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
    const map = new Map<string, Session[]>();
    sessions.forEach(session => {
      const dateKey = new Date(session.sessionDate).toISOString().split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(session);
    });
    return map;
  }, [sessions]);

  const getProgrammeColor = (programmeId?: string) => {
    switch (programmeId) {
      case "EPP": return "rgba(0, 224, 255, 0.3)";
      case "SCP": return "rgba(255, 169, 0, 0.3)";
      case "WPP": return "rgba(255, 105, 180, 0.3)";
      case "FYDP": return "rgba(144, 238, 144, 0.3)";
      default: return "rgba(255, 255, 255, 0.1)";
    }
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
        title="Training Calendar"
        subtitle="Manage training sessions and attendance"
      />

      {/* Controls */}
      <Card variant="default" padding="lg" style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", gap: spacing.md, flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={selectedCenterId || ""}
            onChange={(e) => setSelectedCenterId(Number(e.target.value))}
            style={{
              padding: spacing.sm,
              borderRadius: borderRadius.button,
              border: `1px solid ${colors.border.default}`,
              background: glass.card.background,
              color: colors.text.primary,
            }}
          >
            {centers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: spacing.sm,
              borderRadius: borderRadius.button,
              border: `1px solid ${colors.border.default}`,
              background: glass.card.background,
              color: colors.text.primary,
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleDateString("en-US", { month: "long" })}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{
              padding: spacing.sm,
              borderRadius: borderRadius.button,
              border: `1px solid ${colors.border.default}`,
              background: glass.card.background,
              color: colors.text.primary,
              width: "100px",
            }}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: spacing.sm }}>
            <Button
              variant={viewMode === "month" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusIcon /> Create Session
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card variant="default" padding="lg">
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
                  border: `1px solid ${colors.border.default}`,
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
                    color: isToday ? colors.accent.primary : colors.text.primary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {day.getDate()}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
                  {daySessions.slice(0, 3).map(session => (
                    <div
                      key={session.id}
                      onClick={() => handleSessionClick(session)}
                      style={{
                        padding: spacing.xs,
                        borderRadius: borderRadius.sm,
                        background: getProgrammeColor(session.programmeId),
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={session.title}
                    >
                      {session.startTime} - {session.title}
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <div style={{ fontSize: "0.75rem", color: colors.text.secondary }}>
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Create Session Modal */}
      {showCreateModal && (
        <SessionCreateModal
          centerId={selectedCenterId!}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSession}
        />
      )}

      {/* Session Details Modal */}
      {showSessionModal && selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          students={students}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedSession(null);
          }}
          onMarkAttendance={handleMarkAttendance}
          onBulkMarkAttendance={handleBulkMarkAttendance}
          onAddParticipant={handleAddParticipant}
          onRemoveParticipant={handleRemoveParticipant}
        />
      )}
    </PageShell>
  );
};

// Session Create Modal Component
const SessionCreateModal: React.FC<{
  centerId: number;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ centerId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    programmeId: "",
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:30",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.sessionDate || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit({
      ...formData,
      programmeId: formData.programmeId || undefined,
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Card
        variant="elevated"
        padding="xl"
        style={{ maxWidth: "600px", width: "90%", maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ ...typography.h2, marginBottom: spacing.lg }}>Create Training Session</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
            <div>
              <label style={{ display: "block", marginBottom: spacing.xs, color: colors.text.primary }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: borderRadius.button,
                  border: `1px solid ${colors.border.default}`,
                  background: glass.card.background,
                  color: colors.text.primary,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: spacing.xs, color: colors.text.primary }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: borderRadius.button,
                  border: `1px solid ${colors.border.default}`,
                  background: glass.card.background,
                  color: colors.text.primary,
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: spacing.xs, color: colors.text.primary }}>
                Programme
              </label>
              <select
                value={formData.programmeId}
                onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: borderRadius.button,
                  border: `1px solid ${colors.border.default}`,
                  background: glass.card.background,
                  color: colors.text.primary,
                }}
              >
                <option value="">None</option>
                <option value="EPP">EPP</option>
                <option value="SCP">SCP</option>
                <option value="WPP">WPP</option>
                <option value="FYDP">FYDP</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
              <div>
                <label style={{ display: "block", marginBottom: spacing.xs, color: colors.text.primary }}>
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: spacing.sm,
                    borderRadius: borderRadius.button,
                    border: `1px solid ${colors.border.default}`,
                    background: glass.card.background,
                    color: colors.text.primary,
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.md }}>
              <div>
                <label style={{ display: "block", marginBottom: spacing.xs, color: colors.text.primary }}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: spacing.sm,
                    borderRadius: borderRadius.button,
                    border: `1px solid ${colors.border.default}`,
                    background: glass.card.background,
                    color: colors.text.primary,
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: spacing.xs, color: colors.text.primary }}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: spacing.sm,
                    borderRadius: borderRadius.button,
                    border: `1px solid ${colors.border.default}`,
                    background: glass.card.background,
                    color: colors.text.primary,
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: spacing.xs, color: colors.text.primary }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: borderRadius.button,
                  border: `1px solid ${colors.border.default}`,
                  background: glass.card.background,
                  color: colors.text.primary,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.lg, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Session
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Session Details Modal Component
const SessionDetailsModal: React.FC<{
  session: Session;
  students: any[];
  onClose: () => void;
  onMarkAttendance: (sessionId: number, studentId: number, status: "PRESENT" | "ABSENT" | "EXCUSED") => void;
  onBulkMarkAttendance: (sessionId: number, status: "PRESENT" | "ABSENT") => void;
  onAddParticipant: (sessionId: number, studentId: number) => void;
  onRemoveParticipant: (sessionId: number, studentId: number) => void;
}> = ({ session, students, onClose, onMarkAttendance, onBulkMarkAttendance, onAddParticipant, onRemoveParticipant }) => {
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const participantIds = new Set(session.participants.map(p => p.student.id));
  const availableStudents = students.filter(s => !participantIds.has(s.id) && (s.status === "ACTIVE" || s.status === "TRIAL"));

  const getAttendanceStatus = (studentId: number) => {
    const attendance = session.attendance.find(a => a.studentId === studentId);
    return attendance ? attendance.status : "PENDING";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <Card
        variant="elevated"
        padding="xl"
        style={{ maxWidth: "900px", width: "90%", maxHeight: "90vh", overflow: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.lg }}>
          <div>
            <h2 style={{ ...typography.h2, marginBottom: spacing.xs }}>{session.title}</h2>
            <p style={{ color: colors.text.secondary }}>
              {new Date(session.sessionDate).toLocaleDateString()} • {session.startTime} - {session.endTime}
            </p>
            {session.description && (
              <p style={{ color: colors.text.secondary, marginTop: spacing.xs }}>{session.description}</p>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            <CloseIcon />
          </Button>
        </div>

        {/* Participants Section */}
        <Card variant="outlined" padding="md" style={{ marginBottom: spacing.md }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <h3 style={{ ...typography.h3 }}>
              <UsersIcon /> Participants ({session.participants.length})
            </h3>
            {availableStudents.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setShowAddParticipant(!showAddParticipant)}>
                <PlusIcon /> Add Participant
              </Button>
            )}
          </div>

          {showAddParticipant && (
            <div style={{ marginBottom: spacing.md, padding: spacing.md, background: glass.inset.background, borderRadius: borderRadius.sm }}>
              <select
                value={selectedStudentId || ""}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  borderRadius: borderRadius.button,
                  border: `1px solid ${colors.border.default}`,
                  background: glass.card.background,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                }}
              >
                <option value="">Select student...</option>
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName}</option>
                ))}
              </select>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (selectedStudentId) {
                    onAddParticipant(session.id, selectedStudentId);
                    setSelectedStudentId(null);
                    setShowAddParticipant(false);
                  }
                }}
              >
                Add
              </Button>
            </div>
          )}

          {/* Bulk Actions */}
          <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.md }}>
            <Button variant="secondary" size="sm" onClick={() => onBulkMarkAttendance(session.id, "PRESENT")}>
              Mark All Present
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onBulkMarkAttendance(session.id, "ABSENT")}>
              Mark All Absent
            </Button>
          </div>

          {/* Participants List */}
          <div style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
            {session.participants.map(participant => {
              const status = getAttendanceStatus(participant.student.id);
              return (
                <div
                  key={participant.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: spacing.sm,
                    background: glass.inset.background,
                    borderRadius: borderRadius.sm,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: colors.text.primary }}>
                      {participant.student.fullName}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: colors.text.secondary }}>
                      Status: <span style={{ 
                        color: status === "PRESENT" ? "#27ae60" : status === "ABSENT" ? "#e74c3c" : status === "EXCUSED" ? "#f39c12" : colors.text.secondary 
                      }}>
                        {status}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: spacing.xs }}>
                    <Button
                      variant={status === "PRESENT" ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => onMarkAttendance(session.id, participant.student.id, "PRESENT")}
                    >
                      <CheckIcon />
                    </Button>
                    <Button
                      variant={status === "ABSENT" ? "danger" : "secondary"}
                      size="sm"
                      onClick={() => onMarkAttendance(session.id, participant.student.id, "ABSENT")}
                    >
                      <CloseIcon />
                    </Button>
                    <Button
                      variant={status === "EXCUSED" ? "utility" : "secondary"}
                      size="sm"
                      onClick={() => onMarkAttendance(session.id, participant.student.id, "EXCUSED")}
                    >
                      E
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onRemoveParticipant(session.id, participant.student.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default CoachTrainingCalendarPage;

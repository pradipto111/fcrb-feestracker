import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const VotingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [existingVotes, setExistingVotes] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
      checkVotingStatus();
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError("");
      
      // Load session
      const sessionData = await api.getSession(Number(sessionId));
      setSession(sessionData);

      // Load available students
      const studentsData = await api.getSessionStudents(Number(sessionId));
      setStudents(studentsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkVotingStatus = async () => {
    if (!sessionId) return;
    try {
      const status = await api.checkVoted(Number(sessionId));
      setHasVoted(status.hasVoted);
      if (status.hasVoted && status.votes) {
        setExistingVotes(status.votes.map((v: any) => v.votedForId));
      }
    } catch (err: any) {
      // Ignore errors
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    if (hasVoted) return; // Can't change votes after submitting

    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      if (selectedStudents.length >= 5) {
        setError("You can only select up to 5 students");
        return;
      }
      setSelectedStudents([...selectedStudents, studentId]);
    }
    setError("");
  };

  const handleSubmit = async () => {
    if (!sessionId) return;
    
    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    if (selectedStudents.length > 5) {
      setError("Maximum 5 students allowed");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await api.submitVotes({
        sessionId: Number(sessionId),
        votedForIds: selectedStudents
      });

      setSuccess(`Successfully voted for ${selectedStudents.length} student(s)!`);
      setHasVoted(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/attendance");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit votes");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div>Session not found</div>
      </div>
    );
  }

  const voteValue = user?.role === "STUDENT" ? 1 : 2;
  const voteLabel = user?.role === "STUDENT" ? "student vote (1 point each)" : "coach vote (2 points each)";

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
          🗳️ Vote for Hardworking Players
        </h1>
        <p style={{ color: "#666", margin: 0 }}>
          Select up to 5 students who showed exceptional effort in this session
        </p>
      </div>

      {/* Session Info */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Session Details
        </div>
        <div style={{ fontSize: 14, color: "#666" }}>
          Date: {new Date(session.sessionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <div style={{ fontSize: 14, color: "#666" }}>
          Time: {session.startTime} - {session.endTime}
        </div>
        {session.center && (
          <div style={{ fontSize: 14, color: "#666" }}>
            Center: {session.center.name}
          </div>
        )}
        <div style={{
          marginTop: 12,
          padding: "8px 12px",
          background: "#f0f7ff",
          borderRadius: 6,
          fontSize: 12,
          color: "#1E40AF"
        }}>
          Your {voteLabel}
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

      {success && (
        <div style={{
          padding: 12,
          background: "#dfd",
          color: "#3a3",
          borderRadius: 8,
          marginBottom: 16
        }}>
          {success}
        </div>
      )}

      {hasVoted ? (
        <div style={{
          background: "white",
          padding: 48,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            You've already voted for this session!
          </div>
          <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
            You voted for {existingVotes.length} student(s)
          </div>
          <button
            onClick={() => navigate("/attendance")}
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
            Back to Attendance
          </button>
        </div>
      ) : (
        <>
          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            marginBottom: 24
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                Select Students ({selectedStudents.length}/5)
              </div>
              <div style={{
                padding: "6px 12px",
                background: selectedStudents.length === 5 ? "#28a745" : "#ffc107",
                color: "white",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600
              }}>
                {selectedStudents.length === 5 ? "Maximum Selected" : `${5 - selectedStudents.length} remaining`}
              </div>
            </div>

            {students.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
                No students available for voting
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12
              }}>
                {students.map(student => {
                  const isSelected = selectedStudents.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudentSelection(student.id)}
                      style={{
                        padding: 16,
                        border: isSelected ? "2px solid #1E40AF" : "1px solid #e0e0e0",
                        borderRadius: 8,
                        background: isSelected ? "#f0f7ff" : "white",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        position: "relative"
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#1E40AF";
                          e.currentTarget.style.background = "#f8f9ff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = "#e0e0e0";
                          e.currentTarget.style.background = "white";
                        }
                      }}
                    >
                      <div style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: isSelected ? "#1E40AF" : "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14
                      }}>
                        {isSelected ? "✓" : ""}
                      </div>
                      <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "#1E40AF",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 24,
                        marginBottom: 12
                      }}>
                        {student.fullName.charAt(0)}
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {student.fullName}
                      </div>
                      {student.programType && (
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {student.programType}
                        </div>
                      )}
                      {isSelected && (
                        <div style={{
                          marginTop: 8,
                          padding: "4px 8px",
                          background: "#1E40AF",
                          color: "white",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          display: "inline-block"
                        }}>
                          +{voteValue} points
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={() => navigate("/attendance")}
              style={{
                padding: "12px 24px",
                background: "#ccc",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedStudents.length === 0}
              style={{
                padding: "12px 24px",
                background: (submitting || selectedStudents.length === 0) ? "#ccc" : "#1E40AF",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: (submitting || selectedStudents.length === 0) ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14
              }}
            >
              {submitting ? "Submitting..." : `Submit Votes (${selectedStudents.length})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VotingPage;








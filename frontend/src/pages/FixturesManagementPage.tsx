import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const FixturesManagementPage: React.FC = () => {
  const [centers, setCenters] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [showCreateFixture, setShowCreateFixture] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state for creating fixture
  const [fixtureForm, setFixtureForm] = useState({
    centerId: "",
    matchType: "Friendly",
    opponent: "",
    matchDate: "",
    matchTime: "",
    venue: "",
    notes: "",
    selectedPlayers: [] as number[],
    playerPositions: {} as Record<number, string>,
    playerRoles: {} as Record<number, string>,
    playerNotes: {} as Record<number, string>
  });

  useEffect(() => {
    loadCenters();
  }, []);

  useEffect(() => {
    if (selectedCenter) {
      loadFixtures();
      loadStudents();
    }
  }, [selectedCenter]);

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

  const loadFixtures = async () => {
    if (!selectedCenter) return;
    try {
      setLoading(true);
      setError("");
      const fixturesData = await api.getFixtures({
        centerId: selectedCenter,
        upcoming: true
      });
      // Also get completed fixtures
      const completedData = await api.getFixtures({
        centerId: selectedCenter,
        status: "COMPLETED"
      });
      setFixtures([...fixturesData, ...completedData.slice(0, 10)]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedCenter) return;
    try {
      const studentsData = await api.getStudents();
      const centerStudents = studentsData.filter((s: any) => s.centerId === selectedCenter && s.status === "ACTIVE");
      setStudents(centerStudents);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixtureForm.centerId || !fixtureForm.matchType || !fixtureForm.matchDate || !fixtureForm.matchTime) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await api.createFixture({
        centerId: Number(fixtureForm.centerId),
        matchType: fixtureForm.matchType,
        opponent: fixtureForm.opponent || undefined,
        matchDate: fixtureForm.matchDate,
        matchTime: fixtureForm.matchTime,
        venue: fixtureForm.venue || undefined,
        notes: fixtureForm.notes || undefined,
        playerIds: fixtureForm.selectedPlayers,
        positions: fixtureForm.selectedPlayers.map(id => fixtureForm.playerPositions[id] || ""),
        roles: fixtureForm.selectedPlayers.map(id => fixtureForm.playerRoles[id] || ""),
        playerNotes: fixtureForm.selectedPlayers.map(id => fixtureForm.playerNotes[id] || "")
      });
      setShowCreateFixture(false);
      setFixtureForm({
        centerId: "",
        matchType: "Friendly",
        opponent: "",
        matchDate: "",
        matchTime: "",
        venue: "",
        notes: "",
        selectedPlayers: [],
        playerPositions: {},
        playerRoles: {},
        playerNotes: {}
      });
      await loadFixtures();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to create fixture");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFixture = async (fixtureId: number) => {
    if (!confirm("Are you sure you want to delete this fixture?")) return;
    try {
      await api.deleteFixture(fixtureId);
      await loadFixtures();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePlayerSelection = (studentId: number) => {
    if (fixtureForm.selectedPlayers.includes(studentId)) {
      setFixtureForm({
        ...fixtureForm,
        selectedPlayers: fixtureForm.selectedPlayers.filter(id => id !== studentId),
        playerPositions: { ...fixtureForm.playerPositions, [studentId]: "" },
        playerRoles: { ...fixtureForm.playerRoles, [studentId]: "" },
        playerNotes: { ...fixtureForm.playerNotes, [studentId]: "" }
      });
    } else {
      setFixtureForm({
        ...fixtureForm,
        selectedPlayers: [...fixtureForm.selectedPlayers, studentId]
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING": return "#1E40AF";
      case "ONGOING": return "#f39c12";
      case "COMPLETED": return "#27ae60";
      case "CANCELLED": return "#e74c3c";
      case "POSTPONED": return "#95a5a6";
      default: return "#666";
    }
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
            ⚽ Fixtures
          </h1>
          <p style={{ color: "#666", margin: 0 }}>Manage match fixtures and player selections</p>
        </div>
        <button
          onClick={() => setShowCreateFixture(true)}
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
          ➕ Create Fixture
        </button>
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

      {/* Center Filter */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24
      }}>
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

      {/* Create Fixture Modal */}
      {showCreateFixture && (
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
            maxWidth: 900,
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Create New Fixture</h2>
            <form onSubmit={handleCreateFixture}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Center *
                  </label>
                  <select
                    value={fixtureForm.centerId}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, centerId: e.target.value })}
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
                    Match Type *
                  </label>
                  <select
                    value={fixtureForm.matchType}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, matchType: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  >
                    <option value="Friendly">Friendly</option>
                    <option value="League">League</option>
                    <option value="Tournament">Tournament</option>
                    <option value="Practice Match">Practice Match</option>
                    <option value="Cup">Cup</option>
                    <option value="Exhibition">Exhibition</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Opponent Team
                  </label>
                  <input
                    type="text"
                    value={fixtureForm.opponent}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, opponent: e.target.value })}
                    placeholder="Opponent team name"
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
                    Venue
                  </label>
                  <input
                    type="text"
                    value={fixtureForm.venue}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, venue: e.target.value })}
                    placeholder="Match venue/location"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 6
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Match Date *
                  </label>
                  <input
                    type="date"
                    value={fixtureForm.matchDate}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, matchDate: e.target.value })}
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
                    Match Time *
                  </label>
                  <input
                    type="time"
                    value={fixtureForm.matchTime}
                    onChange={(e) => setFixtureForm({ ...fixtureForm, matchTime: e.target.value })}
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
                  value={fixtureForm.notes}
                  onChange={(e) => setFixtureForm({ ...fixtureForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about the fixture"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                />
              </div>

              {/* Player Selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
                  Select Players ({fixtureForm.selectedPlayers.length} selected)
                </label>
                <div style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  border: "2px solid #e0e0e0",
                  borderRadius: 8,
                  padding: 12
                }}>
                  {students.map(student => {
                    const isSelected = fixtureForm.selectedPlayers.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        style={{
                          padding: 12,
                          marginBottom: 8,
                          border: isSelected ? "2px solid #1E40AF" : "1px solid #e0e0e0",
                          borderRadius: 6,
                          background: isSelected ? "#f0f7ff" : "white",
                          cursor: "pointer"
                        }}
                        onClick={() => togglePlayerSelection(student.id)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{student.fullName}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              {student.programType || "No Program"}
                            </div>
                          </div>
                          <div style={{
                            width: 20,
                            height: 20,
                            border: "2px solid #1E40AF",
                            borderRadius: 4,
                            background: isSelected ? "#1E40AF" : "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 12,
                            fontWeight: 700
                          }}>
                            {isSelected ? "✓" : ""}
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600 }}>Position</label>
                              <input
                                type="text"
                                value={fixtureForm.playerPositions[student.id] || ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setFixtureForm({
                                  ...fixtureForm,
                                  playerPositions: { ...fixtureForm.playerPositions, [student.id]: e.target.value }
                                })}
                                placeholder="e.g., Forward, Midfielder"
                                style={{
                                  width: "100%",
                                  padding: "6px",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: 4,
                                  fontSize: 12
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: 12, fontWeight: 600 }}>Role</label>
                              <select
                                value={fixtureForm.playerRoles[student.id] || ""}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setFixtureForm({
                                  ...fixtureForm,
                                  playerRoles: { ...fixtureForm.playerRoles, [student.id]: e.target.value }
                                })}
                                style={{
                                  width: "100%",
                                  padding: "6px",
                                  border: "1px solid #e0e0e0",
                                  borderRadius: 4,
                                  fontSize: 12
                                }}
                              >
                                <option value="">Select Role</option>
                                <option value="Starting XI">Starting XI</option>
                                <option value="Substitute">Substitute</option>
                                <option value="Reserve">Reserve</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                  Create Fixture
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFixture(false);
                    setFixtureForm({
                      centerId: "",
                      matchType: "Friendly",
                      opponent: "",
                      matchDate: "",
                      matchTime: "",
                      venue: "",
                      notes: "",
                      selectedPlayers: [],
                      playerPositions: {},
                      playerRoles: {},
                      playerNotes: {}
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

      {/* Fixtures List */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          Upcoming & Recent Fixtures
        </h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
        ) : fixtures.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No fixtures found
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {fixtures.map(fixture => {
              const matchDate = new Date(fixture.matchDate);
              const isUpcoming = new Date(fixture.matchDate) > new Date();
              
              return (
                <div
                  key={fixture.id}
                  style={{
                    border: "2px solid #e0e0e0",
                    borderRadius: 8,
                    padding: 20,
                    background: isUpcoming ? "#f0f7ff" : "white"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>
                          {fixture.matchType}
                        </div>
                        <div style={{
                          padding: "4px 12px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          background: getStatusColor(fixture.status) + "20",
                          color: getStatusColor(fixture.status)
                        }}>
                          {fixture.status}
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                        {matchDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {fixture.matchTime}
                      </div>
                      {fixture.opponent && (
                        <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                          vs {fixture.opponent}
                        </div>
                      )}
                      {fixture.venue && (
                        <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                          📍 {fixture.venue}
                        </div>
                      )}
                      {fixture.notes && (
                        <div style={{ fontSize: 13, color: "#666", marginTop: 8, fontStyle: "italic" }}>
                          {fixture.notes}
                        </div>
                      )}
                      <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                        Players: {fixture.players?.length || 0} selected
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFixture(fixture.id)}
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
                  
                  {fixture.players && fixture.players.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Selected Players:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {fixture.players.map((fp: any) => (
                          <div
                            key={fp.id}
                            style={{
                              padding: "8px 12px",
                              background: "#f8f9fa",
                              borderRadius: 6,
                              fontSize: 13
                            }}
                          >
                            {fp.student.fullName}
                            {fp.position && ` (${fp.position})`}
                            {fp.role && ` - ${fp.role}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FixturesManagementPage;





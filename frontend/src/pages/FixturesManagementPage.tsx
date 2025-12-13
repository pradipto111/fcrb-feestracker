import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";
import { DataTableCard } from "../components/ui/DataTableCard";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants, primaryButtonWhileHover, primaryButtonWhileTap } from "../utils/motion";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { matchAssets, galleryAssets, adminAssets } from "../config/assets";

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

  const {
    sectionVariants,
    headingVariants,
    getStaggeredCard,
  } = useHomepageAnimation();

  // Calculate KPIs - use fixtures safely
  const upcomingMatches = (fixtures || []).filter(f => f.status === "UPCOMING").length;
  const completedMatches = (fixtures || []).filter(f => f.status === "COMPLETED").length;
  const competitions = [...new Set((fixtures || []).map(f => f.matchType))].length;

  return (
    <motion.main
      className="rv-page rv-page--fixtures"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        background: colors.surface.bg,
        minHeight: '100%',
      }}
    >
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

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
            backgroundImage: `url(${matchAssets.lastMatchStripBg})`,
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
            RealVerse • Match Management
          </motion.p>
          <motion.h1
            style={{
              ...typography.h1,
              color: colors.text.onPrimary,
              margin: 0,
            }}
            variants={headingVariants}
          >
            Fixtures & Matches
            <span style={{ display: "block", color: colors.accent.main, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal, marginTop: spacing.xs }}>
              Schedule matches and manage player selections
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
              { label: "Upcoming Matches", value: upcomingMatches, subLabel: "Scheduled" },
              { label: "Completed Matches", value: completedMatches, subLabel: "Finished" },
              { label: "Competitions", value: competitions, subLabel: "Active" },
              { label: "Total Fixtures", value: fixtures.length, subLabel: "All statuses" },
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

      <Section
        title="⚽ Fixtures"
        description="Manage match fixtures and player selections"
        variant="elevated"
        style={{ marginBottom: spacing.xl }}
      >
        {error && (
          <Card variant="default" padding="md" style={{ 
            marginBottom: spacing.md,
            background: colors.danger.soft,
            border: `1px solid ${colors.danger.main}40`,
          }}>
            <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
          </Card>
        )}

        {/* Center Filter */}
        <div className="rv-filter-bar">
          <div className="rv-filter-field">
            <label>🏢 Center</label>
            <select
              value={selectedCenter || ""}
              onChange={(e) => setSelectedCenter(Number(e.target.value))}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              {centers.map(center => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>
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
          <Card variant="elevated" padding="xl" style={{
            maxWidth: 900,
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ 
              ...typography.h2,
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}>Create New Fixture</h2>
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
          </Card>
        </div>
      )}

      {/* Fixtures List */}
      <Card variant="default" padding="lg">
        <h2 style={{ 
          ...typography.h3,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}>
          Upcoming & Recent Fixtures
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
        ) : fixtures.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'],
            color: colors.text.muted,
            ...typography.body,
          }}>
            No fixtures found
          </div>
        ) : (
          <div className="rv-fixture-list">
            {fixtures.map((fixture, index) => {
              const matchDate = new Date(fixture.matchDate);
              const isUpcoming = new Date(fixture.matchDate) > new Date();
              
              return (
                <motion.div
                  key={fixture.id}
                  custom={index}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <div className="rv-fixture-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.md }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm }}>
                        <div style={{ 
                          fontSize: typography.fontSize.lg, 
                          fontWeight: typography.fontWeight.bold,
                          color: colors.text.primary,
                        }}>
                          {fixture.matchType}
                        </div>
                        <div style={{
                          padding: `${spacing.xs} ${spacing.md}`,
                          borderRadius: borderRadius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          background: getStatusColor(fixture.status) + "20",
                          color: getStatusColor(fixture.status)
                        }}>
                          {fixture.status}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.base, 
                        fontWeight: typography.fontWeight.semibold, 
                        marginBottom: spacing.xs,
                        color: colors.text.primary,
                      }}>
                        {matchDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {fixture.matchTime}
                      </div>
                      {fixture.opponent && (
                        <div style={{ 
                          fontSize: typography.fontSize.sm, 
                          color: colors.text.muted, 
                          marginBottom: spacing.xs,
                        }}>
                          vs {fixture.opponent}
                        </div>
                      )}
                      {fixture.venue && (
                        <div style={{ 
                          fontSize: typography.fontSize.sm, 
                          color: colors.text.muted, 
                          marginBottom: spacing.xs,
                        }}>
                          📍 {fixture.venue}
                        </div>
                      )}
                      {fixture.notes && (
                        <div style={{ 
                          fontSize: typography.fontSize.xs, 
                          color: colors.text.muted, 
                          marginTop: spacing.sm, 
                          fontStyle: "italic",
                        }}>
                          {fixture.notes}
                        </div>
                      )}
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        color: colors.text.muted, 
                        marginTop: spacing.sm,
                      }}>
                        Players: {fixture.players?.length || 0} selected
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteFixture(fixture.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  
                  {fixture.players && fixture.players.length > 0 && (
                    <div style={{ 
                      marginTop: spacing.md, 
                      paddingTop: spacing.md, 
                      borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
                    }}>
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        fontWeight: typography.fontWeight.semibold, 
                        marginBottom: spacing.sm,
                        color: colors.text.secondary,
                      }}>
                        Selected Players:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                        {fixture.players.map((fp: any) => (
                          <div
                            key={fp.id}
                            style={{
                              padding: `${spacing.sm} ${spacing.md}`,
                              background: "rgba(255, 255, 255, 0.1)",
                              borderRadius: borderRadius.lg,
                              fontSize: typography.fontSize.xs,
                              color: colors.text.secondary,
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
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
      </Section>
    </motion.main>
  );
};

export default FixturesManagementPage;






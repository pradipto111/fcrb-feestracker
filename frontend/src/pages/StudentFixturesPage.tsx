import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const StudentFixturesPage: React.FC = () => {
  const [myFixtures, setMyFixtures] = useState<any[]>([]);
  const [allFixtures, setAllFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMyFixtures, setShowMyFixtures] = useState(true);

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      setError("");
      const [myFixturesData, allFixturesData] = await Promise.all([
        api.getMyFixtures(),
        api.getFixtures({ upcoming: true })
      ]);
      setMyFixtures(myFixturesData);
      setAllFixtures(allFixturesData);
    } catch (err: any) {
      setError(err.message || "Failed to load fixtures");
    } finally {
      setLoading(false);
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

  const upcomingFixtures = myFixtures.filter(f => {
    const matchDate = new Date(f.matchDate);
    return matchDate > new Date() && f.status === "UPCOMING";
  });

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
          ⚽ Fixtures
        </h1>
        <p style={{ color: "#666", margin: 0 }}>View your upcoming matches and fixtures</p>
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

      {/* Tabs */}
      <div style={{
        background: "white",
        padding: 8,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24,
        display: "flex",
        gap: 8
      }}>
        <button
          onClick={() => setShowMyFixtures(true)}
          style={{
            flex: 1,
            padding: "12px",
            background: showMyFixtures ? "#1E40AF" : "#f0f0f0",
            color: showMyFixtures ? "white" : "#666",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14
          }}
        >
          My Fixtures ({upcomingFixtures.length})
        </button>
        <button
          onClick={() => setShowMyFixtures(false)}
          style={{
            flex: 1,
            padding: "12px",
            background: !showMyFixtures ? "#1E40AF" : "#f0f0f0",
            color: !showMyFixtures ? "white" : "#666",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14
          }}
        >
          All Fixtures
        </button>
      </div>

      {/* My Fixtures Section */}
      {showMyFixtures && (
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            My Upcoming Fixtures
          </h2>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
          ) : upcomingFixtures.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
              You don't have any upcoming fixtures
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {upcomingFixtures.map(fixture => {
                const matchDate = new Date(fixture.matchDate);
                // Get the current student's fixture player info
                const playerInfo = fixture.players?.find((p: any) => {
                  // We need to get the current student's ID - this will be handled by the API
                  return p;
                });
                
                return (
                  <div
                    key={fixture.id}
                    style={{
                      border: "3px solid #1E40AF",
                      borderRadius: 12,
                      padding: 24,
                      background: "linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)",
                      position: "relative"
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      padding: "6px 12px",
                      background: "#1E40AF",
                      color: "white",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      YOU ARE SELECTED
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
                        {fixture.matchType}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                        {matchDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 16, color: "#666", marginBottom: 8 }}>
                        ⏰ {fixture.matchTime}
                      </div>
                      {fixture.opponent && (
                        <div style={{ fontSize: 18, fontWeight: 600, color: "#1E40AF", marginBottom: 4 }}>
                          vs {fixture.opponent}
                        </div>
                      )}
                      {fixture.venue && (
                        <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                          📍 {fixture.venue}
                        </div>
                      )}
                    </div>

                    {fixture.players && fixture.players.length > 0 && (
                      <div style={{
                        padding: 12,
                        background: "white",
                        borderRadius: 8,
                        marginTop: 12
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Your Details:</div>
                        {fixture.players.map((fp: any) => (
                          <div key={fp.id} style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>
                            {fp.position && `Position: ${fp.position} • `}
                            {fp.role && `Role: ${fp.role}`}
                            {fp.notes && (
                              <div style={{ fontSize: 13, color: "#666", marginTop: 4, fontStyle: "italic" }}>
                                Notes: {fp.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {fixture.notes && (
                      <div style={{
                        padding: 12,
                        background: "#fff3cd",
                        borderRadius: 8,
                        marginTop: 12,
                        fontSize: 13,
                        color: "#856404"
                      }}>
                        <strong>Match Notes:</strong> {fixture.notes}
                      </div>
                    )}

                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid #1E40AF" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Squad ({fixture.players?.length || 0} players):</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {fixture.players?.map((fp: any) => (
                          <div
                            key={fp.id}
                            style={{
                              padding: "6px 12px",
                              background: "#1E40AF",
                              color: "white",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            {fp.student.fullName} (You)
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* All Fixtures Section */}
      {!showMyFixtures && (
        <div style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            All Upcoming Fixtures
          </h2>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
          ) : allFixtures.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
              No upcoming fixtures
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {allFixtures.map(fixture => {
                const matchDate = new Date(fixture.matchDate);
                const isSelected = myFixtures.some(f => f.id === fixture.id);
                
                return (
                  <div
                    key={fixture.id}
                    style={{
                      border: isSelected ? "3px solid #1E40AF" : "2px solid #e0e0e0",
                      borderRadius: 8,
                      padding: 20,
                      background: isSelected ? "#f0f7ff" : "white"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>
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
                          {isSelected && (
                            <div style={{
                              padding: "4px 12px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 600,
                              background: "#1E40AF",
                              color: "white"
                            }}>
                              YOU ARE SELECTED
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                          {matchDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {fixture.matchTime}
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
                    </div>
                    
                    {fixture.players && fixture.players.length > 0 && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Squad:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {fixture.players.map((fp: any) => (
                            <div
                              key={fp.id}
                              style={{
                                padding: "6px 12px",
                                background: "#f8f9fa",
                                borderRadius: 6,
                                fontSize: 12
                              }}
                            >
                              {fp.student.fullName}
                              {fp.position && ` (${fp.position})`}
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
      )}
    </div>
  );
};

export default StudentFixturesPage;


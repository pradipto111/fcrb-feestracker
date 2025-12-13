import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { matchAssets } from "../config/assets";

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

  const {
    sectionVariants,
    headingVariants,
    getStaggeredCard,
  } = useHomepageAnimation();

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: spacing.md }}>
      {/* Page Header */}
      <Section
        title="My Fixtures"
        description="View your upcoming matches and fixtures"
        variant="default"
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

      {/* Tabs */}
      <Card variant="default" padding="sm" style={{
        marginBottom: spacing.lg,
        display: "flex",
        gap: spacing.sm,
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
      </Card>

      {/* My Fixtures Section */}
      {showMyFixtures && (
        <Card variant="default" padding="lg">
          <h2 style={{ 
            ...typography.h3,
            marginBottom: spacing.md,
            color: colors.text.primary,
          }}>
            My Upcoming Fixtures
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
          ) : upcomingFixtures.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: spacing['3xl'], 
              color: colors.text.muted,
              ...typography.body,
            }}>
              You don't have any upcoming fixtures
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              {upcomingFixtures.map(fixture => {
                const matchDate = new Date(fixture.matchDate);
                
                return (
                  <Card
                    key={fixture.id}
                    variant="default"
                    padding="lg"
                    style={{
                      border: `2px solid ${colors.primary.main}`,
                      background: `linear-gradient(135deg, ${colors.primary.soft}20 0%, ${colors.primary.soft}10 100%)`,
                      position: "relative"
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      top: spacing.md,
                      right: spacing.md,
                      padding: `${spacing.xs} ${spacing.md}`,
                      background: colors.primary.main,
                      color: "white",
                      borderRadius: borderRadius.full,
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.semibold
                    }}>
                      YOU ARE SELECTED
                    </div>
                    
                    <div style={{ marginBottom: spacing.md }}>
                      <div style={{ 
                        fontSize: typography.fontSize['2xl'], 
                        fontWeight: typography.fontWeight.bold, 
                        marginBottom: spacing.sm, 
                        color: colors.primary.light,
                      }}>
                        {fixture.matchType}
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.lg, 
                        fontWeight: typography.fontWeight.semibold, 
                        marginBottom: spacing.xs,
                        color: colors.text.primary,
                      }}>
                        {matchDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div style={{ 
                        fontSize: typography.fontSize.base, 
                        color: colors.text.muted, 
                        marginBottom: spacing.sm,
                      }}>
                        ⏰ {fixture.matchTime}
                      </div>
                      {fixture.opponent && (
                        <div style={{ 
                          fontSize: typography.fontSize.lg, 
                          fontWeight: typography.fontWeight.semibold, 
                          color: colors.primary.light, 
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
                    </div>

                    {fixture.players && fixture.players.length > 0 && (
                      <Card variant="default" padding="md" style={{ marginTop: spacing.sm }}>
                        <div style={{ 
                          fontSize: typography.fontSize.sm, 
                          fontWeight: typography.fontWeight.semibold, 
                          marginBottom: spacing.sm,
                          color: colors.text.primary,
                        }}>
                          Your Details:
                        </div>
                        {fixture.players.map((fp: any) => (
                          <div key={fp.id} style={{ 
                            fontSize: typography.fontSize.xs, 
                            color: colors.text.muted, 
                            marginBottom: spacing.xs,
                          }}>
                            {fp.position && `Position: ${fp.position} • `}
                            {fp.role && `Role: ${fp.role}`}
                            {fp.notes && (
                              <div style={{ 
                                fontSize: typography.fontSize.xs, 
                                color: colors.text.muted, 
                                marginTop: spacing.xs, 
                                fontStyle: "italic",
                              }}>
                                Notes: {fp.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </Card>
                    )}

                    {fixture.notes && (
                      <div style={{
                        padding: spacing.md,
                        background: colors.warning.soft,
                        borderRadius: borderRadius.md,
                        marginTop: spacing.sm,
                        fontSize: typography.fontSize.xs,
                        color: colors.warning.main
                      }}>
                        <strong>Match Notes:</strong> {fixture.notes}
                      </div>
                    )}

                    <div style={{ 
                      marginTop: spacing.md, 
                      paddingTop: spacing.md, 
                      borderTop: `2px solid ${colors.primary.main}`,
                    }}>
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        fontWeight: typography.fontWeight.semibold, 
                        marginBottom: spacing.sm,
                        color: colors.text.primary,
                      }}>
                        Squad ({fixture.players?.length || 0} players):
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                        {fixture.players?.map((fp: any) => (
                          <div
                            key={fp.id}
                            style={{
                              padding: `${spacing.xs} ${spacing.md}`,
                              background: colors.primary.main,
                              color: "white",
                              borderRadius: borderRadius.md,
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold
                            }}
                          >
                            {fp.student.fullName} (You)
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* All Fixtures Section */}
      {!showMyFixtures && (
        <Card variant="default" padding="lg">
          <h2 style={{ 
            ...typography.h3,
            marginBottom: spacing.md,
            color: colors.text.primary,
          }}>
            All Upcoming Fixtures
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
          ) : allFixtures.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: spacing['3xl'], 
              color: colors.text.muted,
              ...typography.body,
            }}>
              No upcoming fixtures
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
              {allFixtures.map(fixture => {
                const matchDate = new Date(fixture.matchDate);
                const isSelected = myFixtures.some(f => f.id === fixture.id);
                
                return (
                  <Card
                    key={fixture.id}
                    variant="default"
                    padding="lg"
                    style={{
                      border: isSelected ? `2px solid ${colors.primary.main}` : `1px solid rgba(255, 255, 255, 0.1)`,
                      background: isSelected ? `${colors.primary.soft}20` : undefined
                    }}
                  >
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
                          {isSelected && (
                            <div style={{
                              padding: `${spacing.xs} ${spacing.md}`,
                              borderRadius: borderRadius.full,
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              background: colors.primary.main,
                              color: "white"
                            }}>
                              YOU ARE SELECTED
                            </div>
                          )}
                        </div>
                        <div style={{ 
                          fontSize: typography.fontSize.base, 
                          fontWeight: typography.fontWeight.semibold, 
                          marginBottom: spacing.xs,
                          color: colors.text.primary,
                        }}>
                          {matchDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {fixture.matchTime}
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
                          color: colors.text.primary,
                        }}>
                          Squad:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: spacing.sm }}>
                          {fixture.players.map((fp: any) => (
                            <div
                              key={fp.id}
                              style={{
                                padding: `${spacing.xs} ${spacing.md}`,
                                background: "rgba(255, 255, 255, 0.05)",
                                borderRadius: borderRadius.md,
                                fontSize: typography.fontSize.xs,
                                color: colors.text.secondary,
                              }}
                            >
                              {fp.student.fullName}
                              {fp.position && ` (${fp.position})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}
      </Section>
    </div>
  );
};

export default StudentFixturesPage;


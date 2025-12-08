import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [centers, setCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [period, setPeriod] = useState<"all" | "weekly" | "monthly">("all");
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [myStats, setMyStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCenters();
    if (user?.role === "STUDENT") {
      loadMyStats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCenter) {
      loadLeaderboard();
    }
  }, [selectedCenter, period]);

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

  const loadLeaderboard = async () => {
    if (!selectedCenter) return;
    try {
      setLoading(true);
      setError("");
      const data = await api.getLeaderboard(selectedCenter, period);
      setLeaderboard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMyStats = async () => {
    try {
      const stats = await api.getMyStats();
      setMyStats(stats);
      if (stats.center) {
        setSelectedCenter(stats.center.id);
      }
    } catch (err: any) {
      // Ignore errors for my stats
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    const icons: Record<string, string> = {
      FIRST_VOTE: "🎯",
      TOP_WEEKLY: "⭐",
      TOP_MONTHLY: "🏆",
      STREAK_5: "🔥",
      STREAK_10: "🔥🔥",
      STREAK_20: "🔥🔥🔥",
      CENTURY: "💯",
      FIVE_HUNDRED: "💎",
      THOUSAND: "👑",
      COACH_FAVORITE: "🎓",
      PEER_FAVORITE: "🤝",
      CONSISTENT: "📈"
    };
    return icons[badgeType] || "🏅";
  };

  const getBadgeName = (badgeType: string) => {
    const names: Record<string, string> = {
      FIRST_VOTE: "First Recognition",
      TOP_WEEKLY: "Weekly Champion",
      TOP_MONTHLY: "Monthly Champion",
      STREAK_5: "5-Day Streak",
      STREAK_10: "10-Day Streak",
      STREAK_20: "20-Day Streak",
      CENTURY: "Century Club",
      FIVE_HUNDRED: "Elite Performer",
      THOUSAND: "Legend",
      COACH_FAVORITE: "Coach's Choice",
      PEER_FAVORITE: "Peer Favorite",
      CONSISTENT: "Consistent Performer"
    };
    return names[badgeType] || badgeType;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getPointsForPeriod = (student: any) => {
    if (period === "weekly") return student.weeklyPoints;
    if (period === "monthly") return student.monthlyPoints;
    return student.totalPoints;
  };

  return (
    <div style={{
      minHeight: "100vh"
    }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: 800, 
          marginBottom: "8px",
          fontFamily: "'Poppins', sans-serif",
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em"
        }}>
          Most Hardworking Player
        </h1>
        <p style={{ 
          color: "#64748B", 
          margin: 0,
          fontSize: "1rem",
          fontWeight: 500
        }}>
          Center-wise leaderboard and achievements
        </p>
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

      {/* My Stats Card (for students) */}
      {myStats && user?.role === "STUDENT" && (
        <div style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
          padding: 32,
          borderRadius: "16px",
          color: "white",
          marginBottom: 32,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
        className="gamified-card"
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Stats</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{myStats.totalPoints}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Total Points</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{myStats.rank || "—"}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Current Rank</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{myStats.currentStreak}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Day Streak</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{myStats.badges?.length || 0}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Badges Earned</div>
            </div>
          </div>
          {myStats.badges && myStats.badges.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Your Badges:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {myStats.badges.map((badge: any) => (
                  <div
                    key={badge.id}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: 6,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <span>{getBadgeIcon(badge.badgeType)}</span>
                    <span>{getBadgeName(badge.badgeType)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        marginBottom: 32,
        border: "1px solid #E2E8F0",
        display: "grid",
        gridTemplateColumns: user?.role !== "STUDENT" ? "1fr 1fr" : "1fr",
        gap: 16
      }}>
        {user?.role !== "STUDENT" && (
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
        )}
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
            Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "2px solid #e0e0e0",
              borderRadius: 6,
              fontSize: 13
            }}
          >
            <option value="all">All Time</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
        </div>
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#64748B" }}>Loading...</div>
      ) : leaderboard ? (
        <div style={{
          background: "white",
          padding: 32,
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid #E2E8F0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ 
              fontSize: "1.75rem", 
              fontWeight: 700,
              fontFamily: "'Poppins', sans-serif",
              color: "#0F172A"
            }}>
              {leaderboard.center.name} Leaderboard
            </h2>
            <div style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              color: "white",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif"
            }}>
              {period === "weekly" ? "Weekly" : period === "monthly" ? "Monthly" : "All Time"}
            </div>
          </div>

          {leaderboard.leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
              No rankings yet. Start voting after sessions!
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {leaderboard.leaderboard.map((entry: any) => (
                <div
                  key={entry.student.id}
                  style={{
                    padding: 20,
                    border: entry.rank <= 3 ? "2px solid #10B981" : "1px solid #E2E8F0",
                    borderRadius: "12px",
                    background: entry.rank <= 3 
                      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)" 
                      : "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    transition: "all 0.2s ease",
                    boxShadow: entry.rank <= 3 ? "0 4px 12px rgba(16, 185, 129, 0.15)" : "0 2px 4px rgba(0,0,0,0.05)"
                  }}
                  className="gamified-card"
                >
                  <div style={{
                    width: 56,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    fontFamily: "'Poppins', sans-serif",
                    color: entry.rank === 1 ? "#F59E0B" : entry.rank === 2 ? "#94A3B8" : entry.rank === 3 ? "#CD7F32" : "#64748B",
                    background: entry.rank <= 3 
                      ? "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)"
                      : "rgba(241, 245, 249, 0.8)",
                    borderRadius: "12px",
                    boxShadow: entry.rank <= 3 ? "0 4px 8px rgba(0,0,0,0.1)" : "none"
                  }}>
                    {getRankIcon(entry.rank)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>
                        {entry.student.fullName}
                      </div>
                      {entry.badges && entry.badges.length > 0 && (
                        <div style={{ display: "flex", gap: 4 }}>
                          {entry.badges.slice(0, 3).map((badge: any) => (
                            <span key={badge.id} title={getBadgeName(badge.badgeType)}>
                              {getBadgeIcon(badge.badgeType)}
                            </span>
                          ))}
                          {entry.badges.length > 3 && (
                            <span style={{ fontSize: 12 }}>+{entry.badges.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {entry.student.programType || "No Program"} • {entry.sessionsVoted} sessions
                      {entry.currentStreak > 0 && ` • 🔥 ${entry.currentStreak} day streak`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ 
                      fontSize: "2rem", 
                      fontWeight: 800, 
                      fontFamily: "'Poppins', sans-serif",
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}>
                      {getPointsForPeriod(entry)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, marginTop: "4px" }}>
                      {period === "all" ? "Total" : period === "weekly" ? "Weekly" : "Monthly"} Points
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "6px", fontWeight: 500 }}>
                      {entry.studentVotes} student • {entry.coachVotes} coach votes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default LeaderboardPage;


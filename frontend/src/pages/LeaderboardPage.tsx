import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";
import { DataTableCard } from "../components/ui/DataTableCard";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";
import { pageVariants, cardVariants } from "../utils/motion";
import { FireIcon } from "../components/icons/IconSet";

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
    <motion.main
      className="rv-page rv-page--leaderboard"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      <Section
        title="🏆 Most Hardworking Player"
        description="Center-wise leaderboard and achievements"
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
        <div className="rv-filter-bar" style={{
          gridTemplateColumns: user?.role !== "STUDENT" ? "1fr 1fr" : "1fr",
        }}>
          {user?.role !== "STUDENT" && (
            <div className="rv-filter-field">
              <label>🏢 Center</label>
              <select
                value={selectedCenter || ""}
                onChange={(e) => setSelectedCenter(Number(e.target.value))}
              >
                {centers.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="rv-filter-field">
            <label>📅 Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
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
        <Card variant="default" padding="lg" style={{
          border: `1px solid rgba(255, 255, 255, 0.1)`,
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
            <div className="rv-leaderboard-list">
              {leaderboard.leaderboard.map((entry: any, index: number) => (
                <motion.div
                  key={entry.student.id}
                  custom={index}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                >
                  <div className="rv-leaderboard-card" style={{
                    border: entry.rank <= 3 ? "2px solid rgba(46, 213, 115, 0.7)" : "1px solid rgba(255, 255, 255, 0.1)",
                    background: entry.rank <= 3 
                      ? "radial-gradient(circle at 0% 0%, rgba(46, 213, 115, 0.15) 0%, #121c3a 45%, #0d172e 100%)" 
                      : undefined,
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                  }}>
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
                      {entry.currentStreak > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {' • '}
                          <FireIcon size={12} />
                          {` ${entry.currentStreak} day streak`}
                        </span>
                      )}
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
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      ) : null}
      </Section>
    </motion.main>
  );
};

export default LeaderboardPage;


import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { pageVariants, cardVariants, primaryButtonWhileHover, primaryButtonWhileTap } from "../utils/motion";
import "../styles/animations.css";

const DrillsPage: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultCategories = [
    "Dribbling",
    "Passing",
    "Shooting",
    "Defense",
    "Fitness",
    "Tactics",
    "Goalkeeping",
    "Set Pieces",
    "General"
  ];

  useEffect(() => {
    loadVideos();
    loadCategories();
  }, []);

  useEffect(() => {
    loadVideos();
  }, [selectedCategory, selectedPlatform]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPlatform) params.platform = selectedPlatform;
      const videosData = await api.getVideos(params);
      setVideos(videosData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await api.getVideoCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      setCategories(defaultCategories);
    }
  };

  const openVideo = (video: any) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const allCategories = [...new Set([...defaultCategories, ...categories])].sort();

  return (
    <motion.main
      className="rv-page rv-page--drills"
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

      <section className="rv-section-surface">
        {/* Header */}
        <header className="rv-section-header">
          <div>
            <h1 className="rv-page-title">🎥 Drills & Tutorials</h1>
            <p className="rv-page-subtitle">Watch training videos and tutorials to improve your skills</p>
          </div>
        </header>

      {error && (
        <Card variant="outlined" padding="md" style={{
          marginBottom: spacing.lg,
          background: colors.danger.soft,
          borderColor: colors.danger.main,
        }}>
          <div style={{ color: colors.danger.main, ...typography.body }}>
            {error}
          </div>
        </Card>
      )}

        {/* Filters */}
        <div className="rv-filter-bar">
          <div className="rv-filter-field">
            <label>📂 Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                fontFamily: typography.fontFamily.primary,
                background: colors.surface.bg,
                color: colors.text.primary,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary.main;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary.soft}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.light;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="">All Categories</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
            }}>
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: `2px solid ${colors.border.light}`,
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                fontFamily: typography.fontFamily.primary,
                background: colors.surface.bg,
                color: colors.text.primary,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.primary.main;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary.soft}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.border.light;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <option value="">All Platforms</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>
          </div>
        </div>

      {/* Videos Grid */}
      {loading ? (
        <Card variant="elevated" padding="xl">
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'],
            color: colors.text.secondary,
            ...typography.body,
          }}>
            Loading videos...
          </div>
        </Card>
      ) : videos.length === 0 ? (
        <Card variant="elevated" padding="xl">
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'],
            color: colors.text.muted,
            ...typography.body,
          }}>
            No videos found. Check back later for new content! 🎥
          </div>
        </Card>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: spacing.lg,
        }}>
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              custom={index}
              variants={cardVariants}
              initial="initial"
              animate="animate"
            >
              <div
                className="rv-session-card"
                onClick={() => openVideo(video)}
                style={{
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {video.thumbnailUrl ? (
                  <div style={{
                    width: "100%",
                    height: 200,
                    background: "#f0f0f0",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0,0,0,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24
                      }}>
                        ▶️
                      </div>
                    </div>
                    <Badge
                      variant={video.platform === "YOUTUBE" ? "danger" : "accent"}
                      size="sm"
                      style={{
                        position: "absolute",
                        top: spacing.sm,
                        right: spacing.sm,
                      }}
                    >
                      {video.platform}
                    </Badge>
                  </div>
                ) : (
                  <div style={{
                    width: "100%",
                    height: 200,
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    color: "white"
                  }}>
                    ▶️
                  </div>
                )}
                <div style={{ padding: spacing.lg }}>
                  <div style={{ 
                    ...typography.h5,
                    marginBottom: spacing.sm,
                    color: colors.text.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {video.title}
                  </div>
                  {video.description && (
                    <div style={{ 
                      ...typography.caption,
                      color: colors.text.secondary, 
                      marginBottom: spacing.md,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {video.description}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                    {video.category && (
                      <Badge variant="primary" size="sm">
                        {video.category}
                      </Badge>
                    )}
                    <Badge variant="neutral" size="sm">
                      by {video.creator.fullName}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

      {/* Video Modal */}
      {selectedVideo && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.95)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: spacing.lg,
          animation: "fadeIn 0.3s ease-out",
        }}
        onClick={closeVideo}
        >
          <Card
            variant="elevated"
            padding="xl"
            style={{
              maxWidth: 1000,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              background: colors.space.dark,
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              animation: "scaleIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              style={{
                position: "absolute",
                top: spacing.md,
                right: spacing.md,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: colors.danger.main,
                color: colors.text.onPrimary,
                border: "none",
                cursor: "pointer",
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                zIndex: 1001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                boxShadow: shadows.md,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
                e.currentTarget.style.boxShadow = shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                e.currentTarget.style.boxShadow = shadows.md;
              }}
            >
              ✕
            </button>
            <div>
              <h2 style={{ 
                ...typography.h2,
                marginBottom: spacing.md,
                color: colors.text.inverted,
              }}>
                {selectedVideo.title}
              </h2>
              {selectedVideo.description && (
                <p style={{ 
                  ...typography.body,
                  color: colors.text.muted, 
                  marginBottom: spacing.lg,
                }}>
                  {selectedVideo.description}
                </p>
              )}
              <div style={{
                position: "relative",
                width: "100%",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                height: 0,
                overflow: "hidden",
                borderRadius: borderRadius.xl,
                background: colors.space.deep,
                marginBottom: spacing.lg,
              }}>
                {selectedVideo.platform === "YOUTUBE" && selectedVideo.embedUrl ? (
                  <iframe
                    src={selectedVideo.embedUrl}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: borderRadius.xl,
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: colors.text.inverted,
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                  }}>
                    <div style={{ fontSize: 48, marginBottom: spacing.md }}>📱</div>
                    <div style={{ ...typography.h5, marginBottom: spacing.sm }}>Instagram Video</div>
                    <a
                      href={selectedVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: `${spacing.md} ${spacing.lg}`,
                        background: `linear-gradient(135deg, ${colors.accent.main} 0%, ${colors.accent.dark} 100%)`,
                        color: colors.text.onAccent,
                        borderRadius: borderRadius.lg,
                        textDecoration: "none",
                        fontWeight: typography.fontWeight.semibold,
                        fontFamily: typography.fontFamily.primary,
                        transition: "all 0.2s ease",
                        boxShadow: shadows.md,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = shadows.lg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = shadows.md;
                      }}
                    >
                      Open in Instagram
                    </a>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                {selectedVideo.category && (
                  <Badge variant="primary" size="md">
                    {selectedVideo.category}
                  </Badge>
                )}
                <Badge variant={selectedVideo.platform === "YOUTUBE" ? "danger" : "accent"} size="md">
                  {selectedVideo.platform}
                </Badge>
                <Badge variant="info" size="md">
                  by {selectedVideo.creator.fullName}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
      </section>
    </motion.main>
  );
};

export default DrillsPage;




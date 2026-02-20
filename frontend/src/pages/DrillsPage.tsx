import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PageHeader } from "../components/ui/PageHeader";
import { Section } from "../components/ui/Section";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { ArrowRightIcon } from "../components/icons/IconSet";
import { pageVariants, cardVariants, primaryButtonWhileHover, primaryButtonWhileTap } from "../utils/motion";
import { academyAssets, galleryAssets } from "../config/assets";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import "../styles/animations.css";

const DrillsPage: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [selectedMediaType, setSelectedMediaType] = useState<string>("");
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
  }, [selectedCategory, selectedPlatform, selectedMediaType]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedPlatform) params.platform = selectedPlatform;
      if (selectedMediaType) params.mediaType = selectedMediaType;
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
    <div style={{ width: "100%" }}>
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      {/* Banner Section */}
      <motion.section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
          minHeight: "250px",
          background: colors.surface.section,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${academyAssets.drillsWideShot})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            filter: "blur(8px)",
            zIndex: 0,
          }}
        />
        {/* Side decorative images */}
        <div
          style={{
            position: "absolute",
            left: "-8%",
            top: "15%",
            width: "200px",
            height: "200px",
            backgroundImage: `url(${galleryAssets.actionShots[0].thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25,
            filter: "blur(6px)",
            borderRadius: borderRadius.lg,
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-8%",
            bottom: "15%",
            width: "200px",
            height: "200px",
            backgroundImage: `url(${galleryAssets.actionShots[2].thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25,
            filter: "blur(6px)",
            borderRadius: borderRadius.lg,
            zIndex: 0,
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
            zIndex: 1,
          }}
        />
        {/* Banner content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: spacing["2xl"],
          }}
        >
          <h1 style={{ ...typography.h1, color: colors.text.onPrimary, marginBottom: spacing.sm }}>
            🎥 Drills & Tutorials
          </h1>
          <p style={{ ...typography.body, color: colors.text.onPrimary, opacity: 0.9, fontSize: typography.fontSize.lg }}>
            Watch training videos and tutorials to improve your skills
          </p>
        </div>
      </motion.section>

      <Section
        variant="elevated"
        style={{ marginBottom: spacing.xl }}
      >
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
          <div className="rv-filter-field">
            <label>🎬 Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
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
              <option value="">All Platforms</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>
          </div>
          <div className="rv-filter-field">
            <label>📎 Media Type</label>
            <select
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value)}
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
              <option value="">All Types</option>
              <option value="LINK">Links</option>
              <option value="IMAGE">Images</option>
              <option value="PDF">PDFs</option>
              <option value="DOCUMENT">Documents</option>
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
                {video.mediaType === "IMAGE" && video.fileUrl ? (
                  // Image display - show image directly
                  <div style={{
                    width: "100%",
                    height: 200,
                    background: "#f0f0f0",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                    <img
                      src={video.fileUrl}
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
                    <Badge
                      variant="success"
                      size="sm"
                      style={{
                        position: "absolute",
                        top: spacing.sm,
                        right: spacing.sm,
                      }}
                    >
                      IMAGE
                    </Badge>
                  </div>
                ) : (video.mediaType === "PDF" || video.mediaType === "DOCUMENT") ? (
                  // PDF/Document display - show icon
                  <div style={{
                    width: "100%",
                    height: 200,
                    background: `linear-gradient(135deg, ${colors.info.main} 0%, ${colors.info.dark} 100%)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.md,
                    color: "white"
                  }}>
                    <div style={{ fontSize: 64 }}>📄</div>
                    <div style={{ 
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      textAlign: "center",
                      padding: `0 ${spacing.md}`
                    }}>
                      {video.fileName || `${video.mediaType} Document`}
                    </div>
                    <Badge
                      variant={video.mediaType === "PDF" ? "info" : "warning"}
                      size="sm"
                    >
                      {video.mediaType}
                    </Badge>
                  </div>
                ) : video.thumbnailUrl ? (
                  // Link-based content (YouTube/Instagram)
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
                    {video.mediaType && video.mediaType !== "LINK" && (
                      <Badge 
                        variant={
                          video.mediaType === "IMAGE" ? "success" :
                          video.mediaType === "PDF" ? "info" :
                          "warning"
                        } 
                        size="sm"
                      >
                        {video.mediaType}
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
              background: colors.surface.section,
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
              {selectedVideo.mediaType === "IMAGE" && selectedVideo.fileUrl ? (
                // Image viewer
                <div style={{
                  width: "100%",
                  marginBottom: spacing.lg,
                  borderRadius: borderRadius.xl,
                  overflow: "hidden",
                }}>
                  <img
                    src={selectedVideo.fileUrl}
                    alt={selectedVideo.title}
                    style={{
                      width: "100%",
                      maxHeight: "70vh",
                      objectFit: "contain",
                      borderRadius: borderRadius.xl,
                    }}
                  />
                </div>
              ) : selectedVideo.mediaType === "PDF" && selectedVideo.fileUrl ? (
                // PDF viewer
                <div style={{
                  width: "100%",
                  height: "600px",
                  marginBottom: spacing.lg,
                  borderRadius: borderRadius.xl,
                  overflow: "hidden",
                  background: colors.surface.bg,
                }}>
                  <iframe
                    src={selectedVideo.fileUrl}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                      borderRadius: borderRadius.xl,
                    }}
                    title={selectedVideo.title}
                  />
                  <div style={{
                    marginTop: spacing.md,
                    display: "flex",
                    justifyContent: "center",
                    gap: spacing.md,
                  }}>
                    <a
                      href={selectedVideo.fileUrl}
                      download={selectedVideo.fileName || "document.pdf"}
                      style={{
                        padding: `${spacing.md} ${spacing.lg}`,
                        background: colors.primary.main,
                        color: colors.text.onPrimary,
                        borderRadius: borderRadius.lg,
                        textDecoration: "none",
                        fontWeight: typography.fontWeight.semibold,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: spacing.xs,
                      }}
                    >
                      <span>Download PDF</span>
                      <ArrowRightIcon size={14} color={colors.text.onPrimary} />
                    </a>
                  </div>
                </div>
              ) : selectedVideo.mediaType === "DOCUMENT" && selectedVideo.fileUrl ? (
                // Document viewer/download
                <div style={{
                  width: "100%",
                  padding: spacing["2xl"],
                  marginBottom: spacing.lg,
                  borderRadius: borderRadius.xl,
                  background: `linear-gradient(135deg, ${colors.info.main} 0%, ${colors.info.dark} 100%)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: spacing.lg,
                  color: "white",
                  minHeight: "400px",
                }}>
                  <div style={{ fontSize: 96 }}>📄</div>
                  <div style={{ textAlign: "center" }}>
                    <h3 style={{ ...typography.h4, marginBottom: spacing.sm }}>
                      {selectedVideo.fileName || "Document"}
                    </h3>
                    {selectedVideo.fileSize && (
                      <p style={{ ...typography.body, opacity: 0.9 }}>
                        {(selectedVideo.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <a
                    href={selectedVideo.fileUrl}
                    download={selectedVideo.fileName || "document"}
                    style={{
                      padding: `${spacing.md} ${spacing.lg}`,
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      borderRadius: borderRadius.lg,
                      textDecoration: "none",
                      fontWeight: typography.fontWeight.semibold,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: spacing.xs,
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    <span>Download Document</span>
                    <ArrowRightIcon size={14} color="white" />
                  </a>
                </div>
              ) : (
                // Link-based content (YouTube/Instagram)
                <div style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "56.25%", // 16:9 aspect ratio
                  height: 0,
                  overflow: "hidden",
                  borderRadius: borderRadius.xl,
                  background: colors.surface.bg,
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
                          display: "inline-flex",
                          alignItems: "center",
                          gap: spacing.xs,
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
                        <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Open in Instagram</span>
                        <ArrowRightIcon size={14} color={colors.text.onAccent} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                      </a>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap" }}>
                {selectedVideo.category && (
                  <Badge variant="primary" size="md">
                    {selectedVideo.category}
                  </Badge>
                )}
                {selectedVideo.mediaType && (
                  <Badge 
                    variant={
                      selectedVideo.mediaType === "LINK"
                        ? (selectedVideo.platform === "YOUTUBE" ? "danger" : "accent")
                        : selectedVideo.mediaType === "IMAGE"
                        ? "success"
                        : selectedVideo.mediaType === "PDF"
                        ? "info"
                        : "warning"
                    } 
                    size="md"
                  >
                    {selectedVideo.mediaType === "LINK" ? selectedVideo.platform : selectedVideo.mediaType}
                  </Badge>
                )}
                <Badge variant="info" size="md">
                  by {selectedVideo.creator.fullName}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
      </Section>
    </div>
  );
};

export default DrillsPage;

import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { colors, typography, spacing, borderRadius } from "../theme/design-tokens";

const DrillsManagementPage: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [showCreateVideo, setShowCreateVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [videoForm, setVideoForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    platform: "YOUTUBE" as "YOUTUBE" | "INSTAGRAM",
    category: "",
    thumbnailUrl: ""
  });

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
      // If categories endpoint fails, use default categories
      setCategories(defaultCategories);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title || !videoForm.videoUrl) {
      setError("Title and video URL are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.createVideo({
        title: videoForm.title,
        description: videoForm.description || undefined,
        videoUrl: videoForm.videoUrl,
        platform: videoForm.platform,
        category: videoForm.category || undefined,
        thumbnailUrl: videoForm.thumbnailUrl || undefined
      });
      setShowCreateVideo(false);
      setVideoForm({
        title: "",
        description: "",
        videoUrl: "",
        platform: "YOUTUBE",
        category: "",
        thumbnailUrl: ""
      });
      await loadVideos();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to create video");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      setLoading(true);
      setError("");
      await api.updateVideo(editingVideo.id, {
        title: videoForm.title,
        description: videoForm.description || undefined,
        videoUrl: videoForm.videoUrl,
        platform: videoForm.platform,
        category: videoForm.category || undefined,
        thumbnailUrl: videoForm.thumbnailUrl || undefined
      });
      setEditingVideo(null);
      setVideoForm({
        title: "",
        description: "",
        videoUrl: "",
        platform: "YOUTUBE",
        category: "",
        thumbnailUrl: ""
      });
      await loadVideos();
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to update video");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await api.deleteVideo(videoId);
      await loadVideos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (video: any) => {
    setEditingVideo(video);
    setVideoForm({
      title: video.title,
      description: video.description || "",
      videoUrl: video.videoUrl,
      platform: video.platform,
      category: video.category || "",
      thumbnailUrl: video.thumbnailUrl || ""
    });
    setShowCreateVideo(true);
  };

  const cancelEdit = () => {
    setEditingVideo(null);
    setShowCreateVideo(false);
    setVideoForm({
      title: "",
      description: "",
      videoUrl: "",
      platform: "YOUTUBE",
      category: "",
      thumbnailUrl: ""
    });
  };

  const allCategories = [...new Set([...defaultCategories, ...categories])].sort();

  return (
    <div>
      <PageHeader
        title="🎥 Drills & Tutorials"
        subtitle="Manage training videos and tutorials"
        actions={
          <Button variant="primary" onClick={() => {
            setEditingVideo(null);
            setVideoForm({
              title: "",
              description: "",
              videoUrl: "",
              platform: "YOUTUBE",
              category: "",
              thumbnailUrl: ""
            });
            setShowCreateVideo(true);
          }}>
            ➕ Add Video
          </Button>
        }
      />

      {error && (
        <Card variant="default" padding="md" style={{ 
          marginBottom: spacing.md,
          background: colors.danger.soft,
          border: `1px solid ${colors.danger.main}40`,
        }}>
          <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
        </Card>
      )}

      {/* Filters */}
      <Card variant="default" padding="lg" style={{
        marginBottom: spacing.lg,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: spacing.md,
      }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "2px solid #e0e0e0",
              borderRadius: 6,
              fontSize: 13
            }}
          >
            <option value="">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13 }}>
            Platform
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "2px solid #e0e0e0",
              borderRadius: 6,
              fontSize: 13
            }}
          >
            <option value="">All Platforms</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="INSTAGRAM">Instagram</option>
          </select>
        </div>
      </Card>

      {/* Create/Edit Video Modal */}
      {showCreateVideo && (
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
            maxWidth: 600,
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ 
              ...typography.h2,
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}>
              {editingVideo ? "Edit Video" : "Add New Video"}
            </h2>
            <form onSubmit={editingVideo ? handleUpdateVideo : handleCreateVideo}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  required
                  placeholder="Video title"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Video URL * (YouTube or Instagram)
                </label>
                <input
                  type="url"
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Platform
                </label>
                <select
                  value={videoForm.platform}
                  onChange={(e) => setVideoForm({ ...videoForm, platform: e.target.value as "YOUTUBE" | "INSTAGRAM" })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                >
                  <option value="YOUTUBE">YouTube</option>
                  <option value="INSTAGRAM">Instagram</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Category
                </label>
                <select
                  value={videoForm.category}
                  onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                >
                  <option value="">Select Category</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  rows={3}
                  placeholder="Video description"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Thumbnail URL (optional - auto-generated for YouTube)
                </label>
                <input
                  type="url"
                  value={videoForm.thumbnailUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                  placeholder="Custom thumbnail URL"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 6
                  }}
                />
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
                  {editingVideo ? "Update Video" : "Create Video"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
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

      {/* Videos List */}
      <Card variant="default" padding="lg">
        <h2 style={{ 
          ...typography.h3,
          marginBottom: spacing.md,
          color: colors.text.primary,
        }}>
          Videos ({videos.length})
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
        ) : videos.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'],
            color: colors.text.muted,
            ...typography.body,
          }}>
            No videos found. Add your first video to get started!
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: spacing.lg,
          }}>
            {videos.map(video => (
              <Card
                key={video.id}
                variant="default"
                padding="none"
                style={{
                  overflow: "hidden",
                }}
              >
                {video.thumbnailUrl && (
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
                      top: 8,
                      right: 8,
                      padding: "4px 8px",
                      background: video.platform === "YOUTUBE" ? "#FF0000" : "#E4405F",
                      color: "white",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600
                    }}>
                      {video.platform}
                    </div>
                  </div>
                )}
                <div style={{ padding: spacing.md }}>
                  <div style={{ 
                    fontSize: typography.fontSize.base, 
                    fontWeight: typography.fontWeight.bold, 
                    marginBottom: spacing.sm,
                    color: colors.text.primary,
                  }}>
                    {video.title}
                  </div>
                  {video.description && (
                    <div style={{ 
                      fontSize: typography.fontSize.xs, 
                      color: colors.text.muted, 
                      marginBottom: spacing.sm,
                    }}>
                      {video.description.length > 100
                        ? `${video.description.substring(0, 100)}...`
                        : video.description}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.md, flexWrap: "wrap" }}>
                    {video.category && (
                      <span style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: colors.primary.soft,
                        color: colors.primary.light,
                        borderRadius: borderRadius.sm,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                      }}>
                        {video.category}
                      </span>
                    )}
                    <span style={{
                      padding: `${spacing.xs} ${spacing.sm}`,
                      background: "rgba(255, 255, 255, 0.1)",
                      color: colors.text.muted,
                      borderRadius: borderRadius.sm,
                      fontSize: typography.fontSize.xs,
                    }}>
                      by {video.creator.fullName}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: spacing.sm }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => startEdit(video)}
                      style={{ flex: 1 }}
                    >
                      ✏️ Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteVideo(video.id)}
                      style={{ flex: 1 }}
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DrillsManagementPage;





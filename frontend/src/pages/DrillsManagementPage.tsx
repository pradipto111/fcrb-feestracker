import React, { useEffect, useState } from "react";
import { api } from "../api/client";

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
            🎥 Drills & Tutorials
          </h1>
          <p style={{ color: "#666", margin: 0 }}>Manage training videos and tutorials</p>
        </div>
        <button
          onClick={() => {
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
          }}
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
          ➕ Add Video
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

      {/* Filters */}
      <div style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
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
      </div>

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
          <div style={{
            background: "white",
            padding: 32,
            borderRadius: 12,
            maxWidth: 600,
            width: "95%",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
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
          </div>
        </div>
      )}

      {/* Videos List */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          Videos ({videos.length})
        </h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
        ) : videos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No videos found. Add your first video to get started!
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20
          }}>
            {videos.map(video => (
              <div
                key={video.id}
                style={{
                  border: "2px solid #e0e0e0",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
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
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                    {video.title}
                  </div>
                  {video.description && (
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
                      {video.description.length > 100
                        ? `${video.description.substring(0, 100)}...`
                        : video.description}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {video.category && (
                      <span style={{
                        padding: "4px 8px",
                        background: "#f0f7ff",
                        color: "#1E40AF",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600
                      }}>
                        {video.category}
                      </span>
                    )}
                    <span style={{
                      padding: "4px 8px",
                      background: "#f5f5f5",
                      color: "#666",
                      borderRadius: 4,
                      fontSize: 11
                    }}>
                      by {video.creator.fullName}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEdit(video)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: "#1E40AF",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillsManagementPage;




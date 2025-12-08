import React, { useEffect, useState } from "react";
import { api } from "../api/client";

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
    <div style={{
      minHeight: "100vh",
      backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)), url(/photo3.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
          🎥 Drills & Tutorials
        </h1>
        <p style={{ color: "#666", margin: 0 }}>Watch training videos and tutorials to improve your skills</p>
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

      {/* Videos Grid */}
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
        ) : videos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
            No videos found. Check back later for new content!
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20
          }}>
            {videos.map(video => (
              <div
                key={video.id}
                onClick={() => openVideo(video)}
                style={{
                  border: "2px solid #e0e0e0",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
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
                ) : (
                  <div style={{
                    width: "100%",
                    height: 200,
                    background: "linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    color: "white"
                  }}>
                    ▶️
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                    {video.title}
                  </div>
                  {video.description && (
                    <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
                      {video.description.length > 100
                        ? `${video.description.substring(0, 100)}...`
                        : video.description}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}
        onClick={closeVideo}
        >
          <div style={{
            background: "white",
            borderRadius: 12,
            maxWidth: 900,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative"
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#e74c3c",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: 20,
                fontWeight: 700,
                zIndex: 1001,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
            <div style={{ padding: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
                {selectedVideo.title}
              </h2>
              {selectedVideo.description && (
                <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
                  {selectedVideo.description}
                </p>
              )}
              <div style={{
                position: "relative",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                height: 0,
                overflow: "hidden",
                borderRadius: 8,
                marginBottom: 16,
                background: "#000"
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
                      border: "none"
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
                    color: "white"
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
                    <div style={{ fontSize: 16, marginBottom: 8 }}>Instagram Video</div>
                    <a
                      href={selectedVideo.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "12px 24px",
                        background: "#E4405F",
                        color: "white",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontWeight: 600
                      }}
                    >
                      Open in Instagram
                    </a>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {selectedVideo.category && (
                  <span style={{
                    padding: "6px 12px",
                    background: "#f0f7ff",
                    color: "#1E40AF",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    {selectedVideo.category}
                  </span>
                )}
                <span style={{
                  padding: "6px 12px",
                  background: "#f5f5f5",
                  color: "#666",
                  borderRadius: 6,
                  fontSize: 12
                }}>
                  by {selectedVideo.creator.fullName}
                </span>
                <span style={{
                  padding: "6px 12px",
                  background: selectedVideo.platform === "YOUTUBE" ? "#FF0000" : "#E4405F",
                  color: "white",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  {selectedVideo.platform}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillsPage;




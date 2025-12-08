import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const PostCreationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    mediaType: "IMAGE" as "IMAGE" | "VIDEO" | "LINK",
    mediaUrl: "",
    centerId: ""
  });

  useEffect(() => {
    if (user?.role !== "STUDENT") {
      loadCenters();
    }
  }, [user]);

  const loadCenters = async () => {
    try {
      const centersData = await api.getCenters();
      setCenters(centersData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll use a data URL or require the user to upload to a service
    // In production, you'd upload to S3, Cloudinary, etc.
    const reader = new FileReader();
    reader.onloadend = () => {
      setPostForm({ ...postForm, mediaUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.mediaUrl) {
      setError("Media URL or file is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      await api.createPost({
        title: postForm.title || undefined,
        description: postForm.description || undefined,
        mediaType: postForm.mediaType,
        mediaUrl: postForm.mediaUrl,
        centerId: postForm.centerId ? Number(postForm.centerId) : undefined
      });

      setSuccess(user?.role === "STUDENT" 
        ? "Post submitted! It will be visible after approval." 
        : "Post created successfully!");
      
      // Reset form
      setPostForm({
        title: "",
        description: "",
        mediaType: "IMAGE",
        mediaUrl: "",
        centerId: ""
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/feed");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

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
          📸 Create Post
        </h1>
        <p style={{ color: "#666", margin: 0 }}>
          {user?.role === "STUDENT" 
            ? "Share photos from sessions (requires approval)" 
            : "Share photos, videos, or links from sessions"}
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

      {success && (
        <div style={{
          padding: 12,
          background: "#dfd",
          color: "#3a3",
          borderRadius: 8,
          marginBottom: 16
        }}>
          {success}
        </div>
      )}

      <div style={{
        background: "white",
        padding: 32,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        maxWidth: 700,
        margin: "0 auto"
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Media Type *
            </label>
            <select
              value={postForm.mediaType}
              onChange={(e) => setPostForm({ ...postForm, mediaType: e.target.value as any, mediaUrl: "" })}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 14
              }}
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="LINK">Link (YouTube/Instagram)</option>
            </select>
          </div>

          {postForm.mediaType === "IMAGE" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Image URL or Upload
              </label>
              <input
                type="url"
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 6,
                  fontSize: 14,
                  marginBottom: 8
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                Or upload an image (will be converted to base64):
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
              {postForm.mediaUrl && postForm.mediaUrl.startsWith("data:image") && (
                <img
                  src={postForm.mediaUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    marginTop: 12,
                    borderRadius: 8,
                    objectFit: "contain"
                  }}
                />
              )}
            </div>
          )}

          {postForm.mediaType === "VIDEO" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Video URL
              </label>
              <input
                type="url"
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                placeholder="https://example.com/video.mp4"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Note: For best results, use a direct video URL or upload to a video hosting service
              </div>
            </div>
          )}

          {postForm.mediaType === "LINK" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Link URL (YouTube or Instagram)
              </label>
              <input
                type="url"
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Title (optional)
            </label>
            <input
              type="text"
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              placeholder="Post title"
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Description (optional)
            </label>
            <textarea
              value={postForm.description}
              onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
              placeholder="Describe your post..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #e0e0e0",
                borderRadius: 6,
                fontSize: 14,
                resize: "vertical"
              }}
            />
          </div>

          {user?.role !== "STUDENT" && centers.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                Center (optional)
              </label>
              <select
                value={postForm.centerId}
                onChange={(e) => setPostForm({ ...postForm, centerId: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid #e0e0e0",
                  borderRadius: 6,
                  fontSize: 14
                }}
              >
                <option value="">Select Center (optional)</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>
          )}

          {user?.role === "STUDENT" && (
            <div style={{
              padding: 12,
              background: "#fff3cd",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
              color: "#856404"
            }}>
              ⚠️ Your post will be submitted for approval. It will be visible to others only after a coach or admin approves it.
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="submit"
              disabled={loading || !postForm.mediaUrl}
              style={{
                flex: 1,
                padding: "12px",
                background: (loading || !postForm.mediaUrl) ? "#ccc" : "#1E40AF",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: (loading || !postForm.mediaUrl) ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14
              }}
            >
              {loading ? "Creating..." : user?.role === "STUDENT" ? "Submit for Approval" : "Create Post"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/feed")}
              style={{
                flex: 1,
                padding: "12px",
                background: "#ccc",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreationPage;



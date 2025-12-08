import React, { useEffect, useState } from "react";
import { api } from "../api/client";

const PostApprovalPage: React.FC = () => {
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const loadPendingPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const posts = await api.getPendingPosts();
      setPendingPosts(posts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (postId: number, status: "APPROVED" | "REJECTED") => {
    try {
      await api.approvePost(postId, status);
      await loadPendingPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderMedia = (post: any) => {
    if (post.mediaType === "IMAGE") {
      return (
        <img
          src={post.mediaUrl}
          alt={post.title || "Post image"}
          style={{
            width: "100%",
            maxHeight: 400,
            objectFit: "contain",
            background: "#f0f0f0"
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      );
    } else if (post.mediaType === "VIDEO") {
      return (
        <video
          src={post.mediaUrl}
          controls
          style={{
            width: "100%",
            maxHeight: 400
          }}
        />
      );
    } else if (post.mediaType === "LINK") {
      return (
        <div style={{
          padding: 20,
          background: "#f0f7ff",
          borderRadius: 8,
          textAlign: "center"
        }}>
          <a
            href={post.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#1E40AF",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            🔗 {post.mediaUrl}
          </a>
        </div>
      );
    }
    return null;
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
          ✅ Post Approval
        </h1>
        <p style={{ color: "#666", margin: 0 }}>Review and approve student posts</p>
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

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
      ) : pendingPosts.length === 0 ? (
        <div style={{
          background: "white",
          padding: 48,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
          color: "#999"
        }}>
          No pending posts. All clear! ✅
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {pendingPosts.map(post => (
            <div
              key={post.id}
              style={{
                background: "white",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                overflow: "hidden"
              }}
            >
              <div style={{ padding: 20, borderBottom: "2px solid #ffc107" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#ffc107",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 16
                      }}>
                        {post.creator?.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>
                          {post.creator?.fullName || "Unknown Student"}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {post.creator?.email} • {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    {post.title && (
                      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                        {post.title}
                      </div>
                    )}
                    {post.description && (
                      <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                        {post.description}
                      </div>
                    )}
                    {post.center && (
                      <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                        Center: {post.center.name}
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: "6px 12px",
                    background: "#ffc107",
                    color: "#000",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    PENDING
                  </div>
                </div>
              </div>

              {post.mediaUrl && (
                <div style={{ background: "#000" }}>
                  {renderMedia(post)}
                </div>
              )}

              <div style={{ padding: 20, display: "flex", gap: 12 }}>
                <button
                  onClick={() => handleApproval(post.id, "APPROVED")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to reject this post?")) {
                      handleApproval(post.id, "REJECTED");
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14
                  }}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostApprovalPage;



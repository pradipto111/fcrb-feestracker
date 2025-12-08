import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const postsData = await api.getPosts();
      setPosts(postsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (postId: number) => {
    const content = commentText[postId]?.trim();
    if (!content) return;

    try {
      const newComment = await api.createComment({ postId, content });
      setCommentText({ ...commentText, [postId]: "" });
      await loadPosts(); // Reload to get updated comments
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editCommentText.trim()) return;

    try {
      await api.updateComment(commentId, editCommentText);
      setEditingComment(null);
      setEditCommentText("");
      await loadPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.deleteComment(commentId);
      await loadPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.deletePost(postId);
      await loadPosts();
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
            maxHeight: 500,
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
            maxHeight: 500
          }}
        />
      );
    } else if (post.mediaType === "LINK") {
      if (post.embedUrl) {
        return (
          <div style={{
            position: "relative",
            paddingBottom: "56.25%", // 16:9
            height: 0,
            overflow: "hidden"
          }}>
            <iframe
              src={post.embedUrl}
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
          </div>
        );
      } else {
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
              🔗 Open Link: {post.mediaUrl}
            </a>
          </div>
        );
      }
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, color: "#1E40AF" }}>
            📸 Feed
          </h1>
          <p style={{ color: "#666", margin: 0 }}>View posts, photos, and videos from sessions</p>
        </div>
        <button
          onClick={() => navigate("/feed/create")}
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
          ➕ Create Post
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

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}>Loading...</div>
      ) : posts.length === 0 ? (
        <div style={{
          background: "white",
          padding: 48,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center",
          color: "#999"
        }}>
          No posts yet. Be the first to share something!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {posts.map(post => (
            <div
              key={post.id}
              style={{
                background: "white",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                overflow: "hidden"
              }}
            >
              {/* Post Header */}
              <div style={{ padding: 16, borderBottom: "1px solid #e0e0e0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#1E40AF",
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
                          {post.creator?.fullName || "Unknown"}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {post.center && ` • ${post.center.name}`}
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
                  </div>
                  {(user?.role === "ADMIN" || (post.createdByRole === user?.role && post.createdById === user?.id)) && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{
                        padding: "6px 12px",
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
                  )}
                </div>
              </div>

              {/* Media */}
              {post.mediaUrl && (
                <div style={{ background: "#000" }}>
                  {renderMedia(post)}
                </div>
              )}

              {/* Comments Section */}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  Comments ({post.comments?.length || 0})
                </div>

                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    {post.comments.map((comment: any) => (
                      <div key={comment.id} style={{
                        padding: 12,
                        background: "#f8f9fa",
                        borderRadius: 8
                      }}>
                        {editingComment === comment.id ? (
                          <div>
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              style={{
                                width: "100%",
                                padding: 8,
                                border: "2px solid #1E40AF",
                                borderRadius: 6,
                                fontSize: 14,
                                marginBottom: 8
                              }}
                              rows={2}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => handleUpdateComment(comment.id)}
                                style={{
                                  padding: "6px 12px",
                                  background: "#1E40AF",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  fontSize: 12
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditCommentText("");
                                }}
                                style={{
                                  padding: "6px 12px",
                                  background: "#ccc",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 6,
                                  cursor: "pointer",
                                  fontSize: 12
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                  {comment.creator?.fullName || "Unknown"}
                                </div>
                                <div style={{ fontSize: 12, color: "#666" }}>
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              {(user?.role === "ADMIN" || (comment.createdByRole === user?.role && comment.createdById === user?.id)) && (
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={() => {
                                      setEditingComment(comment.id);
                                      setEditCommentText(comment.content);
                                    }}
                                    style={{
                                      padding: "4px 8px",
                                      background: "#1E40AF",
                                      color: "white",
                                      border: "none",
                                      borderRadius: 4,
                                      cursor: "pointer",
                                      fontSize: 11
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    style={{
                                      padding: "4px 8px",
                                      background: "#e74c3c",
                                      color: "white",
                                      border: "none",
                                      borderRadius: 4,
                                      cursor: "pointer",
                                      fontSize: 11
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: 14, color: "#333" }}>
                              {comment.content}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div>
                  <textarea
                    value={commentText[post.id] || ""}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                    placeholder="Write a comment..."
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "2px solid #e0e0e0",
                      borderRadius: 6,
                      fontSize: 14,
                      marginBottom: 8,
                      resize: "vertical"
                    }}
                    rows={2}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentText[post.id]?.trim()}
                    style={{
                      padding: "8px 16px",
                      background: commentText[post.id]?.trim() ? "#1E40AF" : "#ccc",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: commentText[post.id]?.trim() ? "pointer" : "not-allowed",
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;


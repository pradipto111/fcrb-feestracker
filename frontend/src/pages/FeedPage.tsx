import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { galleryAssets, getGalleryImage } from "../config/assets";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { CameraIcon, PlusIcon, LinkIcon } from "../components/icons/IconSet";
import "../styles/animations.css";

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
            padding: spacing.lg,
            background: "rgba(4, 61, 208, 0.1)",
            borderRadius: borderRadius.lg,
            textAlign: "center",
            border: "1px solid rgba(4, 61, 208, 0.2)",
          }}>
            <a
              href={post.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.primary.light,
                textDecoration: "none",
                fontWeight: typography.fontWeight.semibold,
                ...typography.body,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                <LinkIcon size={14} />
                Open Link: {post.mediaUrl}
              </span>
            </a>
          </div>
        );
      }
    }
    return null;
  };

  const {
    sectionVariants,
    headingVariants,
    getStaggeredCard,
  } = useHomepageAnimation();

  return (
    <div style={{ width: "100%" }}>
      {/* Banner Section */}
      <motion.section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
          minHeight: "250px",
        }}
        variants={sectionVariants}
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* Background image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${galleryAssets.actionShots[1].medium})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            filter: "blur(8px)",
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.md,
          }}
        >
          <div>
            <motion.p
              style={{
                ...typography.overline,
                color: colors.accent.main,
                letterSpacing: "0.1em",
                marginBottom: spacing.sm,
              }}
              variants={headingVariants}
            >
              RealVerse • Social Feed
            </motion.p>
            <motion.h1
              style={{
                ...typography.h1,
                color: colors.text.onPrimary,
                marginBottom: spacing.sm,
              }}
              variants={headingVariants}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                <CameraIcon size={32} color={colors.text.onPrimary} />
                Feed
              </span>
            </motion.h1>
            <motion.p
              style={{
                ...typography.body,
                color: colors.text.onPrimary,
                opacity: 0.9,
                fontSize: typography.fontSize.lg,
              }}
              variants={headingVariants}
            >
              View posts, photos, and videos from sessions
            </motion.p>
          </div>
          <motion.div variants={headingVariants}>
            <Button variant="primary" size="lg" onClick={() => navigate("/feed/create")} style={{ background: colors.accent.main, color: colors.text.onAccent }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                <PlusIcon size={16} color={colors.text.onAccent} />
                <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Create Post</span>
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <PageHeader
        tone="dark"
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
            <CameraIcon size={24} color={colors.text.primary} />
            Feed
          </span>
        }
        subtitle="View posts, photos, and videos from sessions"
        actions={
          <Button variant="primary" size="lg" onClick={() => navigate("/feed/create")} style={{ display: "none", background: colors.accent.main, color: colors.text.onAccent }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
              <PlusIcon size={16} color={colors.text.onAccent} />
              <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Create Post</span>
            </span>
          </Button>
        }
      />

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

      {loading ? (
        <Card variant="glass" padding="xl">
          <div style={{ 
            textAlign: "center", 
            padding: spacing['3xl'],
            color: colors.text.inverted,
            ...typography.body,
          }}>
            Loading...
          </div>
        </Card>
      ) : posts.length === 0 ? (
        <Card variant="glass" padding="xl">
          <div style={{
            textAlign: "center",
            padding: spacing['3xl'],
            color: colors.text.muted,
            ...typography.body,
          }}>
            No posts yet. Be the first to share something! 🎉
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
          {posts.map((post, index) => (
            <Card
              key={post.id}
              variant="glass"
              padding="none"
              style={{
                overflow: "hidden",
                animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Post Header */}
              <div style={{ 
                padding: spacing.lg, 
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.accent.main} 100%)`,
                        color: colors.text.onPrimary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: typography.fontWeight.bold,
                        fontSize: typography.fontSize.lg,
                        boxShadow: shadows.md,
                      }}>
                        {post.creator?.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div style={{ 
                          ...typography.h5,
                          color: colors.text.inverted,
                          marginBottom: spacing.xs,
                        }}>
                          {post.creator?.fullName || "Unknown"}
                        </div>
                        <div style={{ 
                          ...typography.caption,
                          color: colors.text.muted,
                        }}>
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
                      <div style={{ 
                        ...typography.h4,
                        color: colors.text.inverted,
                        marginBottom: spacing.sm,
                      }}>
                        {post.title}
                      </div>
                    )}
                    {post.description && (
                      <div style={{ 
                        ...typography.body,
                        color: colors.text.muted,
                        marginTop: spacing.sm,
                      }}>
                        {post.description}
                      </div>
                    )}
                  </div>
                  {(user?.role === "ADMIN" || (post.createdByRole === user?.role && post.createdById === user?.id)) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      🗑️ Delete
                    </Button>
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
              <div style={{ padding: spacing.lg }}>
                <div style={{ 
                  ...typography.h5,
                  color: colors.text.inverted,
                  marginBottom: spacing.md,
                }}>
                  Comments ({post.comments?.length || 0})
                </div>

                {/* Comments List */}
                {post.comments && post.comments.length > 0 && (
                  <div style={{ marginBottom: spacing.lg, display: "flex", flexDirection: "column", gap: spacing.md }}>
                    {post.comments.map((comment: any) => (
                      <div key={comment.id} style={{
                        padding: spacing.md,
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: borderRadius.lg,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}>
                        {editingComment === comment.id ? (
                          <div>
                            <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              style={{
                                width: "100%",
                                padding: spacing.sm,
                                border: `2px solid ${colors.primary.main}`,
                                borderRadius: borderRadius.lg,
                                fontSize: typography.fontSize.sm,
                                marginBottom: spacing.sm,
                                background: "rgba(255, 255, 255, 0.1)",
                                color: colors.text.inverted,
                                fontFamily: typography.fontFamily.primary,
                              }}
                              rows={2}
                            />
                            <div style={{ display: "flex", gap: spacing.sm }}>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleUpdateComment(comment.id)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditCommentText("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.xs }}>
                              <div>
                                <div style={{ 
                                  ...typography.body,
                                  fontWeight: typography.fontWeight.semibold,
                                  color: colors.text.inverted,
                                  marginBottom: spacing.xs,
                                }}>
                                  {comment.creator?.fullName || "Unknown"}
                                </div>
                                <div style={{ 
                                  ...typography.caption,
                                  color: colors.text.muted,
                                }}>
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              {(user?.role === "ADMIN" || (comment.createdByRole === user?.role && comment.createdById === user?.id)) && (
                                <div style={{ display: "flex", gap: spacing.sm }}>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => {
                                      setEditingComment(comment.id);
                                      setEditCommentText(comment.content);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div style={{ 
                              ...typography.body,
                              color: colors.text.inverted,
                              marginTop: spacing.sm,
                            }}>
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
                      padding: spacing.md,
                      border: `2px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.lg,
                      fontSize: typography.fontSize.sm,
                      marginBottom: spacing.sm,
                      resize: "vertical",
                      background: "rgba(255, 255, 255, 0.1)",
                      color: colors.text.inverted,
                      fontFamily: typography.fontFamily.primary,
                    }}
                    rows={2}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentText[post.id]?.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedPage;


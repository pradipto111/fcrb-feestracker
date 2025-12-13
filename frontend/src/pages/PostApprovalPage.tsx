import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageHeader } from "../components/ui/PageHeader";
import { Badge } from "../components/ui/Badge";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { useHomepageAnimation } from "../hooks/useHomepageAnimation";
import { galleryAssets } from "../config/assets";

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
            background: colors.surface.soft
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
          padding: spacing.lg,
          background: colors.primary.soft,
          borderRadius: borderRadius.lg,
          textAlign: "center",
          border: `1px solid ${colors.primary.outline}`,
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
            🔗 {post.mediaUrl}
          </a>
        </div>
      );
    }
    return null;
  };

  const {
    sectionVariants,
    headingVariants,
    getStaggeredCard,
  } = useHomepageAnimation();

  return (
    <div>
      {/* Banner Section */}
      <motion.section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
          minHeight: "200px",
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
            backgroundImage: `url(${galleryAssets.actionShots[0].medium})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            filter: "blur(10px)",
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
          }}
        />
        {/* Banner content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: spacing["2xl"],
          }}
        >
          <motion.p
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.1em",
              marginBottom: spacing.sm,
            }}
            variants={headingVariants}
          >
            RealVerse • Content Moderation
          </motion.p>
          <motion.h1
            style={{
              ...typography.h1,
              color: colors.text.onPrimary,
              margin: 0,
            }}
            variants={headingVariants}
          >
            Post Approval
            <span style={{ display: "block", color: colors.accent.main, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal, marginTop: spacing.xs }}>
              Review and approve student posts
            </span>
          </motion.h1>
        </div>
      </motion.section>

      <PageHeader
        title="✅ Post Approval"
        subtitle="Review and approve student posts"
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

      {loading ? (
        <Card variant="default" padding="xl">
          <p style={{ textAlign: "center", color: colors.text.muted, ...typography.body }}>
            Loading...
          </p>
        </Card>
      ) : pendingPosts.length === 0 ? (
        <Card variant="default" padding="xl" style={{ textAlign: "center" }}>
          <p style={{ color: colors.text.muted, ...typography.body }}>
            No pending posts. All clear! ✅
          </p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: spacing.lg }}>
          {pendingPosts.map(post => (
            <Card
              key={post.id}
              variant="default"
              padding="none"
              style={{ overflow: "hidden" }}
            >
              <div style={{ 
                padding: spacing.lg, 
                borderBottom: `2px solid ${colors.warning.main}`,
                background: `linear-gradient(135deg, ${colors.warning.soft} 0%, transparent 100%)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: spacing.md }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.warning.main} 0%, ${colors.warning.dark} 100%)`,
                        color: colors.text.onAccent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: typography.fontWeight.bold,
                        fontSize: typography.fontSize.base,
                        boxShadow: shadows.sm,
                      }}>
                        {post.creator?.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: typography.fontWeight.semibold, 
                          fontSize: typography.fontSize.base,
                          color: colors.text.primary,
                        }}>
                          {post.creator?.fullName || "Unknown Student"}
                        </div>
                        <div style={{ 
                          fontSize: typography.fontSize.xs, 
                          color: colors.text.muted,
                          marginTop: spacing.xs,
                        }}>
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
                      <div style={{ 
                        fontSize: typography.fontSize.lg, 
                        fontWeight: typography.fontWeight.bold, 
                        marginBottom: spacing.xs,
                        color: colors.text.primary,
                      }}>
                        {post.title}
                      </div>
                    )}
                    {post.description && (
                      <div style={{ 
                        fontSize: typography.fontSize.sm, 
                        color: colors.text.secondary, 
                        marginTop: spacing.sm,
                        lineHeight: 1.6,
                      }}>
                        {post.description}
                      </div>
                    )}
                    {post.center && (
                      <div style={{ 
                        fontSize: typography.fontSize.xs, 
                        color: colors.text.muted, 
                        marginTop: spacing.xs,
                      }}>
                        Center: {post.center.name}
                      </div>
                    )}
                  </div>
                  <Badge variant="warning">PENDING</Badge>
                </div>
              </div>

              {post.mediaUrl && (
                <div style={{ background: "#000" }}>
                  {renderMedia(post)}
                </div>
              )}

              <div style={{ 
                padding: spacing.lg, 
                display: "flex", 
                gap: spacing.md,
                background: "rgba(255, 255, 255, 0.02)",
              }}>
                <Button
                  variant="primary"
                  onClick={() => handleApproval(post.id, "APPROVED")}
                  style={{ flex: 1 }}
                >
                  ✅ Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    if (confirm("Are you sure you want to reject this post?")) {
                      handleApproval(post.id, "REJECTED");
                    }
                  }}
                  style={{ flex: 1 }}
                >
                  ❌ Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostApprovalPage;




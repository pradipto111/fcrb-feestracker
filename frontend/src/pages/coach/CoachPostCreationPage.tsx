import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageHeader } from "../../components/ui/PageHeader";
import { Input } from "../../components/ui/Input";
import { colors, typography, spacing, borderRadius } from "../../theme/design-tokens";

const CoachPostCreationPage: React.FC = () => {
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
    loadCenters();
  }, []);

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

      setSuccess("Post created successfully! It's immediately visible to all users (master access).");
      
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
        navigate("/realverse/feed");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="📸 Create Post"
        subtitle="Share photos, videos, or links (master access - no approval needed)"
      />

      {/* Action buttons */}
      <div style={{ display: "flex", gap: spacing.md, marginBottom: spacing.lg }}>
        <Button
          variant="secondary"
          onClick={() => navigate("/realverse/coach/feed/approve")}
        >
          ✅ Review Pending Posts ({/* Count would go here if available */})
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/realverse/feed")}
        >
          📱 View Feed
        </Button>
      </div>

      {error && (
        <Card variant="default" padding="md" style={{ 
          marginBottom: spacing.md,
          background: colors.danger.soft,
          border: `1px solid ${colors.danger.main}40`,
        }}>
          <p style={{ margin: 0, color: colors.danger.main }}>{error}</p>
        </Card>
      )}

      {success && (
        <Card variant="default" padding="md" style={{ 
          marginBottom: spacing.md,
          background: colors.success.soft,
          border: `1px solid ${colors.success.main}40`,
        }}>
          <p style={{ margin: 0, color: colors.success.main }}>{success}</p>
        </Card>
      )}

      <Card variant="default" padding="xl" style={{
        maxWidth: 700,
        margin: "0 auto"
      }}>
        <Card variant="default" padding="md" style={{
          marginBottom: spacing.lg,
          background: colors.success.soft,
          border: `1px solid ${colors.success.main}40`,
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: typography.fontSize.sm,
            color: colors.success.dark,
            display: "flex",
            alignItems: "center",
            gap: spacing.xs,
          }}>
            <span>✨</span>
            <span>As a coach, your posts are immediately approved and visible to all users (master access).</span>
          </p>
        </Card>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: spacing.lg }}>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              Media Type *
            </label>
            <select
              value={postForm.mediaType}
              onChange={(e) => setPostForm({ ...postForm, mediaType: e.target.value as any, mediaUrl: "" })}
              required
              style={{
                width: "100%",
                padding: `${spacing.sm} ${spacing.md}`,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="LINK">Link (YouTube/Instagram)</option>
            </select>
          </div>

          {postForm.mediaType === "IMAGE" && (
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Image URL or Upload
              </label>
              <Input
                type="url"
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                style={{ marginBottom: spacing.sm }}
              />
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginBottom: spacing.sm,
              }}>
                Or upload an image (will be converted to base64):
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{
                  width: "100%",
                  padding: spacing.sm,
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.sm,
                  background: "rgba(255, 255, 255, 0.1)",
                  color: colors.text.primary,
                  fontFamily: typography.fontFamily.primary,
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
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Video URL
              </label>
              <Input
                type="url"
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                placeholder="https://example.com/video.mp4"
                required
              />
              <div style={{ 
                fontSize: typography.fontSize.xs, 
                color: colors.text.muted, 
                marginTop: spacing.xs,
              }}>
                Note: For best results, use a direct video URL or upload to a video hosting service
              </div>
            </div>
          )}

          {postForm.mediaType === "LINK" && (
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Link URL (YouTube or Instagram)
              </label>
              <Input
                type="url"
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                required
              />
            </div>
          )}

          <div style={{ marginBottom: spacing.lg }}>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              Title (optional)
            </label>
            <Input
              type="text"
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
              placeholder="Post title"
            />
          </div>

          <div style={{ marginBottom: spacing.lg }}>
            <label style={{ 
              display: "block", 
              marginBottom: spacing.sm, 
              ...typography.caption,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.secondary,
            }}>
              Description (optional)
            </label>
            <textarea
              value={postForm.description}
              onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
              placeholder="Describe your post..."
              rows={4}
              style={{
                width: "100%",
                padding: spacing.sm,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.sm,
                resize: "vertical",
                background: "rgba(255, 255, 255, 0.1)",
                color: colors.text.primary,
                fontFamily: typography.fontFamily.primary,
              }}
            />
          </div>

          {centers.length > 0 && (
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ 
                display: "block", 
                marginBottom: spacing.sm, 
                ...typography.caption,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.secondary,
              }}>
                Center (optional)
              </label>
              <select
                value={postForm.centerId}
                onChange={(e) => setPostForm({ ...postForm, centerId: e.target.value })}
                style={{
                  width: "100%",
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: borderRadius.lg,
                  fontSize: typography.fontSize.sm,
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: colors.text.primary,
                  fontFamily: typography.fontFamily.primary,
                }}
              >
                <option value="">Select Center (optional)</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>{center.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: spacing.md }}>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !postForm.mediaUrl}
              style={{ flex: 1 }}
            >
              {loading ? "Creating..." : "Create Post"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/realverse/feed")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CoachPostCreationPage;

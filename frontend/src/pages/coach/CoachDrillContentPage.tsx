import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Section } from "../../components/ui/Section";
import { useAuth } from "../../context/AuthContext";
import { colors, typography, spacing, borderRadius, shadows } from "../../theme/design-tokens";
import { pageVariants, cardVariants } from "../../utils/motion";
import { PlusIcon, EditIcon, TrashIcon, LinkIcon, VideoIcon } from "../../components/icons/IconSet";
import { DataTableCard } from "../../components/ui/DataTableCard";

const CoachDrillContentPage: React.FC = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaType: "LINK" as "LINK" | "IMAGE" | "PDF" | "DOCUMENT",
    videoUrl: "",
    platform: "YOUTUBE" as "YOUTUBE" | "INSTAGRAM",
    category: "",
    file: null as File | null,
    filePreview: null as string | null, // Base64 preview for images
  });

  const categories = [
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
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError("");
      const videosData = await api.getVideos();
      // Filter to show only videos created by current coach
      const myVideos = videosData.filter((v: any) => v.creator?.id === user?.id);
      setVideos(myVideos);
    } catch (err: any) {
      setError(err.message || "Failed to load drill content");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = formData.mediaType === "IMAGE" ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for images, 50MB for PDFs/documents
    if (file.size > maxSize) {
      setError(`File size exceeds limit (${formData.mediaType === "IMAGE" ? "10MB" : "50MB"})`);
      return;
    }

    // Validate file type
    if (formData.mediaType === "IMAGE") {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }
    } else if (formData.mediaType === "PDF") {
      if (file.type !== "application/pdf") {
        setError("Please upload a valid PDF file");
        return;
      }
    } else if (formData.mediaType === "DOCUMENT") {
      const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid document file (PDF, DOC, or DOCX)");
        return;
      }
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        file,
        filePreview: reader.result as string,
      });
      setError("");
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.title) {
      setError("Title is required");
      return;
    }

    // Validate based on media type
    if (formData.mediaType === "LINK") {
      if (!formData.videoUrl) {
        setError("Link/URL is required for link type content");
        return;
      }
      // Validate URL
      try {
        new URL(formData.videoUrl);
      } catch {
        setError("Please enter a valid URL");
        return;
      }
    } else {
      if (!formData.file || !formData.filePreview) {
        setError(`Please upload a ${formData.mediaType.toLowerCase()} file`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const videoData: any = {
        title: formData.title,
        description: formData.description || undefined,
        mediaType: formData.mediaType,
        category: formData.category || undefined,
      };

      if (formData.mediaType === "LINK") {
        videoData.videoUrl = formData.videoUrl;
        videoData.platform = formData.platform;
      } else {
        videoData.fileData = formData.filePreview;
        videoData.fileName = formData.file.name;
        videoData.mimeType = formData.file.type;
        videoData.fileSize = formData.file.size;
      }

      await api.createVideo(videoData);
      
      setSuccess("Drill content added successfully!");
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        mediaType: "LINK",
        videoUrl: "",
        platform: "YOUTUBE",
        category: "",
        file: null,
        filePreview: null,
      });
      await loadVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to add drill content");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (video: any) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      mediaType: video.mediaType || "LINK",
      videoUrl: video.videoUrl || "",
      platform: video.platform || "YOUTUBE",
      category: video.category || "",
      file: null,
      filePreview: video.fileUrl || null, // Use existing fileUrl as preview
    });
    setShowCreateModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    
    setError("");
    
    if (!formData.title) {
      setError("Title is required");
      return;
    }

    // Validate based on media type
    if (formData.mediaType === "LINK") {
      if (!formData.videoUrl) {
        setError("Link/URL is required for link type content");
        return;
      }
      try {
        new URL(formData.videoUrl);
      } catch {
        setError("Please enter a valid URL");
        return;
      }
    } else {
      // For file uploads, require new file if filePreview is not set (existing file)
      if (!formData.filePreview) {
        setError(`Please upload a ${formData.mediaType.toLowerCase()} file`);
        return;
      }
    }

    try {
      setLoading(true);
      
      const videoData: any = {
        title: formData.title,
        description: formData.description || undefined,
        mediaType: formData.mediaType,
        category: formData.category || undefined,
      };

      if (formData.mediaType === "LINK") {
        videoData.videoUrl = formData.videoUrl;
        videoData.platform = formData.platform;
      } else {
        // Only send fileData if a new file was uploaded
        if (formData.file) {
          videoData.fileData = formData.filePreview;
          videoData.fileName = formData.file.name;
          videoData.mimeType = formData.file.type;
          videoData.fileSize = formData.file.size;
        } else if (formData.filePreview) {
          // Keep existing file
          videoData.fileData = formData.filePreview;
        }
      }

      await api.updateVideo(editingVideo.id, videoData);
      
      setSuccess("Drill content updated successfully!");
      setShowCreateModal(false);
      setEditingVideo(null);
      setFormData({
        title: "",
        description: "",
        mediaType: "LINK",
        videoUrl: "",
        platform: "YOUTUBE",
        category: "",
        file: null,
        filePreview: null,
      });
      await loadVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update drill content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: number) => {
    if (!confirm("Are you sure you want to delete this drill content? Students will no longer be able to see it.")) {
      return;
    }

    try {
      setLoading(true);
      await api.deleteVideo(videoId);
      setSuccess("Drill content deleted successfully!");
      await loadVideos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to delete drill content");
    } finally {
      setLoading(false);
    }
  };

  const detectPlatform = (url: string): "YOUTUBE" | "INSTAGRAM" => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "YOUTUBE";
    } else if (url.includes("instagram.com")) {
      return "INSTAGRAM";
    }
    return "YOUTUBE";
  };

  const handleUrlChange = (url: string) => {
    setFormData({
      ...formData,
      videoUrl: url,
      platform: detectPlatform(url),
    });
  };

  return (
    <motion.main
      className="rv-page rv-page--coach-drill-content"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        background: colors.surface.bg,
        minHeight: '100%',
      }}
    >
      {/* Floating Stars Background */}
      <div className="rv-page-stars" aria-hidden="true">
        <span className="rv-star" />
        <span className="rv-star rv-star--delay1" />
        <span className="rv-star rv-star--delay2" />
        <span className="rv-star rv-star--delay3" />
        <span className="rv-star rv-star--delay4" />
      </div>

      {/* BANNER SECTION */}
      <motion.section
        style={{
          position: "relative",
          overflow: "hidden",
          marginBottom: spacing["2xl"],
          borderRadius: borderRadius.xl,
        }}
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
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
        <div
          style={{
            position: "relative",
            zIndex: 1,
            padding: spacing["2xl"],
            display: "flex",
            flexDirection: "column",
            gap: spacing.lg,
          }}
        >
          <motion.p
            style={{
              ...typography.overline,
              color: colors.accent.main,
              letterSpacing: "0.1em",
            }}
            variants={cardVariants}
          >
            RealVerse • Drill Content Management
          </motion.p>
          <motion.h1
            style={{
              ...typography.h1,
              color: colors.text.onPrimary,
              margin: 0,
            }}
            variants={cardVariants}
          >
            Manage Drill Content
            <span style={{ display: "block", color: colors.accent.main, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.normal, marginTop: spacing.xs }}>
              Add links and media that students can access on the Drills & Tutorials page
            </span>
          </motion.h1>
        </div>
      </motion.section>

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

      <Section
        title="My Drill Content"
        description="Content you've added that students can view on /realverse/drills"
        variant="default"
        style={{ marginBottom: spacing.xl }}
      >
        <DataTableCard
          title="Drill Links & Media"
          description={`${videos.length} item${videos.length !== 1 ? 's' : ''} shared with students`}
          actions={
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingVideo(null);
                  setFormData({
                    title: "",
                    description: "",
                    mediaType: "LINK",
                    videoUrl: "",
                    platform: "YOUTUBE",
                    category: "",
                    file: null,
                    filePreview: null,
                  });
                  setShowCreateModal(true);
                  setError("");
                }}
              >
                <PlusIcon size={14} style={{ marginRight: spacing.xs }} /> Add New Content
              </Button>
          }
          isEmpty={videos.length === 0 && !loading}
          emptyState={
            <div style={{ 
              padding: spacing['2xl'], 
              textAlign: "center", 
              color: colors.text.muted,
            }}>
              <p style={{ ...typography.body, marginBottom: spacing.sm }}>
                No drill content yet. Add links and media to share with students!
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setFormData({
                    title: "",
                    description: "",
                    mediaType: "LINK",
                    videoUrl: "",
                    platform: "YOUTUBE",
                    category: "",
                    file: null,
                    filePreview: null,
                  });
                  setShowCreateModal(true);
                  setError("");
                }}
              >
                <PlusIcon size={14} style={{ marginRight: spacing.xs }} /> Add First Content
              </Button>
            </div>
          }
        >
          {loading && videos.length === 0 ? (
            <div style={{ padding: spacing.xl, textAlign: "center", color: colors.text.muted }}>
              Loading...
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: spacing.lg,
            }}>
              {videos.map((video) => (
                <Card
                  key={video.id}
                  variant="default"
                  padding="md"
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = shadows.lg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = shadows.md;
                  }}
                >
                  <div style={{ marginBottom: spacing.md }}>
                    <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: spacing.xs }}>
                      <h3 style={{ 
                        ...typography.h5,
                        margin: 0,
                        color: colors.text.primary,
                        flex: 1,
                      }}>
                        {video.title}
                      </h3>
                      <div style={{ display: "flex", gap: spacing.xs }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(video)}
                        >
                          <EditIcon size={14} />
                        </Button>
                        <Button
                          variant="utility"
                          size="sm"
                          onClick={() => handleDelete(video.id)}
                          style={{
                            background: colors.danger.soft,
                            color: colors.danger.main,
                            border: `1px solid ${colors.danger.main}40`
                          }}
                        >
                          <TrashIcon size={14} />
                        </Button>
                      </div>
                    </div>
                    {video.description && (
                      <p style={{ 
                        ...typography.body,
                        color: colors.text.muted,
                        fontSize: typography.fontSize.sm,
                        marginBottom: spacing.sm,
                      }}>
                        {video.description}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: spacing.sm, flexWrap: "wrap", marginBottom: spacing.sm }}>
                      {video.category && (
                        <span style={{
                          padding: `${spacing.xs} ${spacing.sm}`,
                          background: colors.primary.soft,
                          color: colors.primary.main,
                          borderRadius: borderRadius.sm,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                        }}>
                          {video.category}
                        </span>
                      )}
                      <span style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        background: video.mediaType === "LINK" 
                          ? (video.platform === "YOUTUBE" ? colors.danger.soft : colors.accent.soft)
                          : video.mediaType === "IMAGE"
                          ? colors.success.soft
                          : video.mediaType === "PDF"
                          ? colors.info.soft
                          : colors.warning.soft,
                        color: video.mediaType === "LINK"
                          ? (video.platform === "YOUTUBE" ? colors.danger.main : colors.accent.main)
                          : video.mediaType === "IMAGE"
                          ? colors.success.main
                          : video.mediaType === "PDF"
                          ? colors.info.main
                          : colors.warning.main,
                        borderRadius: borderRadius.sm,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                      }}>
                        {video.mediaType === "LINK" ? video.platform : video.mediaType}
                      </span>
                    </div>
                    {video.mediaType === "LINK" && video.videoUrl && (
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: spacing.xs,
                          color: colors.primary.light,
                          textDecoration: "none",
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon size={14} />
                        View Link
                      </a>
                    )}
                    {video.mediaType === "IMAGE" && video.fileUrl && (
                      <div style={{ marginTop: spacing.sm }}>
                        <img
                          src={video.fileUrl}
                          alt={video.title}
                          style={{
                            width: "100%",
                            maxHeight: "200px",
                            objectFit: "cover",
                            borderRadius: borderRadius.md,
                          }}
                        />
                      </div>
                    )}
                    {(video.mediaType === "PDF" || video.mediaType === "DOCUMENT") && video.fileUrl && (
                      <div style={{ 
                        marginTop: spacing.sm,
                        padding: spacing.md,
                        background: colors.surface.soft,
                        borderRadius: borderRadius.md,
                        display: "flex",
                        alignItems: "center",
                        gap: spacing.sm,
                      }}>
                        <span style={{ fontSize: 24 }}>📄</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            margin: 0, 
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.text.primary,
                          }}>
                            {video.fileName || `${video.mediaType} File`}
                          </p>
                          {video.fileSize && (
                            <p style={{ 
                              margin: 0, 
                              fontSize: typography.fontSize.xs,
                              color: colors.text.muted,
                            }}>
                              {(video.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DataTableCard>
      </Section>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            padding: spacing.xl,
            overflowY: "auto",
          }}
          onClick={() => {
            setShowCreateModal(false);
            setEditingVideo(null);
            setError("");
          }}
        >
          <Card 
            variant="elevated" 
            padding="lg" 
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
              <h2 style={{ 
                ...typography.h2,
                margin: 0,
                color: colors.text.primary,
              }}>
                {editingVideo ? "Edit Drill Content" : "Add Drill Content"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingVideo(null);
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: colors.text.muted,
                  fontSize: typography.fontSize.xl,
                  cursor: "pointer",
                  padding: spacing.xs,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
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

            <form onSubmit={editingVideo ? handleUpdate : handleCreate} style={{ display: "grid", gap: spacing.md }}>
              <div>
                <label style={{ display: "block", marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                  Title *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Dribbling Drills for Beginners"
                  style={{ width: "100%" }}
                />
              </div>

              {/* Media Type Selector */}
              <div>
                <label style={{ display: "block", marginBottom: spacing.sm, fontWeight: 600, color: colors.text.primary }}>
                  Content Type *
                </label>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
                  gap: spacing.sm 
                }}>
                  {[
                    { value: "LINK", label: "Link", icon: "🔗", desc: "YouTube/Instagram" },
                    { value: "IMAGE", label: "Image", icon: "🖼️", desc: "Upload image" },
                    { value: "PDF", label: "PDF", icon: "📄", desc: "Upload PDF" },
                    { value: "DOCUMENT", label: "Document", icon: "📝", desc: "Upload doc" },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          mediaType: type.value as any,
                          videoUrl: "",
                          file: null,
                          filePreview: null,
                        });
                        setError("");
                      }}
                      style={{
                        padding: spacing.md,
                        border: `2px solid ${formData.mediaType === type.value ? colors.primary.main : "rgba(255, 255, 255, 0.2)"}`,
                        borderRadius: borderRadius.md,
                        background: formData.mediaType === type.value 
                          ? colors.primary.soft 
                          : colors.surface.soft,
                        color: colors.text.primary,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: spacing.xs,
                      }}
                      onMouseEnter={(e) => {
                        if (formData.mediaType !== type.value) {
                          e.currentTarget.style.borderColor = colors.primary.main + "60";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.mediaType !== type.value) {
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                        }
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{type.icon}</span>
                      <span style={{ fontWeight: typography.fontWeight.semibold }}>{type.label}</span>
                      <span style={{ fontSize: typography.fontSize.xs, color: colors.text.muted }}>
                        {type.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Input (for LINK media type) */}
              {formData.mediaType === "LINK" && (
                <div>
                  <label style={{ display: "block", marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                    Link/URL *
                  </label>
                  <Input
                    required
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..."
                    style={{ width: "100%" }}
                  />
                  <p style={{ 
                    marginTop: spacing.xs,
                    fontSize: typography.fontSize.xs,
                    color: colors.text.muted,
                  }}>
                    Platform will be auto-detected: {formData.platform}
                  </p>
                </div>
              )}

              {/* File Upload (for IMAGE, PDF, DOCUMENT media types) */}
              {formData.mediaType !== "LINK" && (
                <div>
                  <label style={{ display: "block", marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                    Upload {formData.mediaType === "IMAGE" ? "Image" : formData.mediaType === "PDF" ? "PDF" : "Document"} *
                  </label>
                  <input
                    type="file"
                    accept={
                      formData.mediaType === "IMAGE" 
                        ? "image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        : formData.mediaType === "PDF"
                        ? "application/pdf"
                        : ".pdf,.doc,.docx"
                    }
                    onChange={handleFileUpload}
                    style={{
                      width: "100%",
                      padding: spacing.md,
                      border: `1px solid rgba(255, 255, 255, 0.2)`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      background: colors.surface.soft,
                      color: colors.text.primary,
                      fontFamily: typography.fontFamily.primary,
                      cursor: "pointer",
                    }}
                  />
                  {formData.file && (
                    <div style={{ marginTop: spacing.sm }}>
                      <p style={{ 
                        fontSize: typography.fontSize.sm,
                        color: colors.text.muted,
                        marginBottom: spacing.xs,
                      }}>
                        Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                      {formData.mediaType === "IMAGE" && formData.filePreview && (
                        <img
                          src={formData.filePreview}
                          alt="Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            borderRadius: borderRadius.md,
                            marginTop: spacing.xs,
                          }}
                        />
                      )}
                    </div>
                  )}
                  {formData.filePreview && !formData.file && editingVideo && (
                    <div style={{ marginTop: spacing.sm }}>
                      <p style={{ 
                        fontSize: typography.fontSize.sm,
                        color: colors.text.muted,
                        marginBottom: spacing.xs,
                      }}>
                        Current file: {editingVideo.fileName || "Uploaded file"}
                      </p>
                      {formData.mediaType === "IMAGE" && (
                        <img
                          src={formData.filePreview}
                          alt="Current"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            borderRadius: borderRadius.md,
                            marginTop: spacing.xs,
                          }}
                        />
                      )}
                    </div>
                  )}
                  <p style={{ 
                    marginTop: spacing.xs,
                    fontSize: typography.fontSize.xs,
                    color: colors.text.muted,
                  }}>
                    Max size: {formData.mediaType === "IMAGE" ? "10MB" : "50MB"}
                  </p>
                </div>
              )}

              <div>
                <label style={{ display: "block", marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the drill or tutorial..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: spacing.md,
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    background: colors.surface.soft,
                    color: colors.text.primary,
                    fontFamily: typography.fontFamily.primary,
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: spacing.xs, fontWeight: 600, color: colors.text.primary }}>
                  Category (Optional)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: "100%",
                    padding: spacing.md,
                    border: `1px solid rgba(255, 255, 255, 0.2)`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.base,
                    cursor: "pointer",
                    background: colors.surface.card,
                    color: colors.text.primary,
                    fontFamily: typography.fontFamily.primary,
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: spacing.md, marginTop: spacing.md }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? "Saving..." : editingVideo ? "Update Content" : "Add Content"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingVideo(null);
                    setFormData({
                      title: "",
                      description: "",
                      mediaType: "LINK",
                      videoUrl: "",
                      platform: "YOUTUBE",
                      category: "",
                      file: null,
                      filePreview: null,
                    });
                    setError("");
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </motion.main>
  );
};

export default CoachDrillContentPage;

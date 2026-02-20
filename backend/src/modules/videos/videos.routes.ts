import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

// Helper function to extract video ID and generate embed URL
function getVideoEmbedUrl(url: string, platform: "YOUTUBE" | "INSTAGRAM" | "UPLOADED"): string | null {
  if (platform === "UPLOADED") return null;
  if (platform === "YOUTUBE") {
    // Handle various YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  } else if (platform === "INSTAGRAM") {
    // Instagram Reels/Posts - we'll use the URL as-is for now
    // Instagram doesn't have a simple embed like YouTube
    return url;
  }
  return null;
}

// Helper function to get thumbnail URL
function getThumbnailUrl(url: string, platform: "YOUTUBE" | "INSTAGRAM" | "UPLOADED"): string | null {
  if (platform === "UPLOADED") return null;
  if (platform === "YOUTUBE") {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  // Instagram thumbnails are harder to get without API
  return null;
}

// Helper function to detect platform from URL
function detectPlatform(url: string): "YOUTUBE" | "INSTAGRAM" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "YOUTUBE";
  } else if (url.includes("instagram.com")) {
    return "INSTAGRAM";
  }
  return "YOUTUBE"; // Default to YouTube
}

// Get all videos (accessible by all authenticated users)
router.get("/", authRequired, async (req, res) => {
  const { category, platform, mediaType } = req.query;

  const where: any = {};
  if (category) {
    where.category = category;
  }
  if (platform) {
    where.platform = platform;
  }
  if (mediaType) {
    where.mediaType = mediaType;
  }

  const videos = await prisma.video.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Add embed URLs and thumbnails (only for LINK media type)
  const videosWithEmbed = videos.map(video => {
    const result: any = { ...video };
    
    // Only add embed/thumbnail for link-based videos
    if (video.mediaType === "LINK" && video.videoUrl) {
      result.embedUrl = getVideoEmbedUrl(video.videoUrl, video.platform);
      result.thumbnailUrl = video.thumbnailUrl || getThumbnailUrl(video.videoUrl, video.platform);
    } else if (video.mediaType === "IMAGE" && video.fileUrl) {
      // For images, use fileUrl as thumbnail
      result.thumbnailUrl = video.fileUrl;
    }
    
    return result;
  });

  res.json(videosWithEmbed);
});

// Get a specific video
router.get("/:id", authRequired, async (req, res) => {
  const videoId = Number(req.params.id);

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  const embedUrl = video.videoUrl
    ? getVideoEmbedUrl(video.videoUrl, video.platform)
    : null;
  const thumbnailUrl = video.videoUrl
    ? (video.thumbnailUrl || getThumbnailUrl(video.videoUrl, video.platform))
    : (video.thumbnailUrl || null);

  res.json({
    ...video,
    embedUrl,
    thumbnailUrl
  });
});

// Create a video (Admin or Coach only)
router.post("/", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const { id } = req.user!;
  const { 
    title, 
    description, 
    videoUrl, 
    platform, 
    category, 
    thumbnailUrl,
    mediaType = "LINK",
    fileData,
    fileName,
    mimeType,
    fileSize
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  // Validate based on media type
  if (mediaType === "LINK") {
    if (!videoUrl) {
      return res.status(400).json({ message: "Video URL is required for link type content" });
    }
  } else if (["IMAGE", "PDF", "DOCUMENT"].includes(mediaType)) {
    if (!fileData) {
      return res.status(400).json({ message: "File data is required for uploaded content" });
    }
  }

  let videoData: any = {
    title,
    description: description || null,
    category: category || null,
    mediaType,
    createdById: id
  };

  if (mediaType === "LINK") {
    // Handle link-based content (YouTube/Instagram)
    const detectedPlatform = platform || detectPlatform(videoUrl);
    const autoThumbnail = thumbnailUrl || getThumbnailUrl(videoUrl, detectedPlatform);
    
    videoData.videoUrl = videoUrl;
    videoData.platform = detectedPlatform;
    videoData.thumbnailUrl = autoThumbnail;
  } else {
    // Handle uploaded files (images, PDFs, documents)
    // Store base64 data URL directly in fileUrl (like PostCreationPage does)
    videoData.fileUrl = fileData; // Base64 data URL
    videoData.fileName = fileName || null;
    videoData.mimeType = mimeType || null;
    videoData.fileSize = fileSize || null;
    videoData.platform = "UPLOADED";
    
    // For images, use fileUrl as thumbnail
    if (mediaType === "IMAGE") {
      videoData.thumbnailUrl = fileData;
    }
  }

  const video = await prisma.video.create({
    data: videoData,
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  const result: any = { ...video };
  
  // Add embed URL only for link-based videos
  if (video.mediaType === "LINK" && video.videoUrl) {
    result.embedUrl = getVideoEmbedUrl(video.videoUrl, video.platform);
    result.thumbnailUrl = video.thumbnailUrl || getThumbnailUrl(video.videoUrl, video.platform);
  } else if (video.mediaType === "IMAGE" && video.fileUrl) {
    result.thumbnailUrl = video.fileUrl;
  }

  res.status(201).json(result);
});

// Update a video (Admin or the creator Coach)
router.put("/:id", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const { role, id } = req.user!;
  const videoId = Number(req.params.id);
  const { 
    title, 
    description, 
    videoUrl, 
    platform, 
    category, 
    thumbnailUrl,
    mediaType,
    fileData,
    fileName,
    mimeType,
    fileSize
  } = req.body;

  const existingVideo = await prisma.video.findUnique({
    where: { id: videoId }
  });

  if (!existingVideo) {
    return res.status(404).json({ message: "Video not found" });
  }

  // Only admin or the creator can update
  if (role === "COACH" && existingVideo.createdById !== id) {
    return res.status(403).json({ message: "You can only update your own videos" });
  }

  const updateData: any = {};
  
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description || null;
  if (category !== undefined) updateData.category = category || null;
  
  // Handle media type changes
  const finalMediaType = mediaType || existingVideo.mediaType;
  updateData.mediaType = finalMediaType;

  if (finalMediaType === "LINK") {
    // Update link-based content
    if (videoUrl !== undefined) {
      const detectedPlatform = platform || (videoUrl ? detectPlatform(videoUrl) : existingVideo.platform);
      const autoThumbnail = thumbnailUrl || (videoUrl ? getThumbnailUrl(videoUrl, detectedPlatform) : existingVideo.thumbnailUrl);
      
      updateData.videoUrl = videoUrl;
      updateData.platform = detectedPlatform;
      updateData.thumbnailUrl = autoThumbnail;
      
      // Clear file fields when switching to link
      updateData.fileUrl = null;
      updateData.fileName = null;
      updateData.mimeType = null;
      updateData.fileSize = null;
    } else if (platform !== undefined) {
      updateData.platform = platform;
    }
    if (thumbnailUrl !== undefined) {
      updateData.thumbnailUrl = thumbnailUrl;
    }
  } else {
    // Update uploaded file content
    if (fileData !== undefined) {
      updateData.fileUrl = fileData;
      updateData.fileName = fileName || null;
      updateData.mimeType = mimeType || null;
      updateData.fileSize = fileSize || null;
      updateData.platform = "UPLOADED";
      
      // Clear link fields when switching to file
      if (mediaType && mediaType !== "LINK") {
        updateData.videoUrl = null;
      }
      
      // For images, use fileUrl as thumbnail
      if (finalMediaType === "IMAGE") {
        updateData.thumbnailUrl = fileData;
      }
    }
  }

  const video = await prisma.video.update({
    where: { id: videoId },
    data: updateData,
    include: {
      creator: {
        select: {
          id: true,
          fullName: true,
          email: true
        }
      }
    }
  });

  const result: any = { ...video };
  
  // Add embed URL only for link-based videos
  if (video.mediaType === "LINK" && video.videoUrl) {
    result.embedUrl = getVideoEmbedUrl(video.videoUrl, video.platform);
    result.thumbnailUrl = video.thumbnailUrl || getThumbnailUrl(video.videoUrl, video.platform);
  } else if (video.mediaType === "IMAGE" && video.fileUrl) {
    result.thumbnailUrl = video.fileUrl;
  }

  res.json(result);
});

// Delete a video (Admin or the creator Coach)
router.delete("/:id", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const { role, id } = req.user!;
  const videoId = Number(req.params.id);

  const existingVideo = await prisma.video.findUnique({
    where: { id: videoId }
  });

  if (!existingVideo) {
    return res.status(404).json({ message: "Video not found" });
  }

  // Only admin or the creator can delete
  if (role === "COACH" && existingVideo.createdById !== id) {
    return res.status(403).json({ message: "You can only delete your own videos" });
  }

  await prisma.video.delete({
    where: { id: videoId }
  });

  res.json({ message: "Video deleted successfully" });
});

// Get available categories
router.get("/categories/list", authRequired, async (req, res) => {
  const categories = await prisma.video.findMany({
    select: {
      category: true
    },
    distinct: ["category"],
    where: {
      category: {
        not: null
      }
    }
  });

  const categoryList = categories
    .map(c => c.category)
    .filter((c): c is string => c !== null)
    .sort();

  res.json(categoryList);
});

export default router;









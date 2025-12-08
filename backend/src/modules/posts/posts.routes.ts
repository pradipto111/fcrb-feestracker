import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Helper function to detect platform from URL
function detectPlatform(url: string): "YOUTUBE" | "INSTAGRAM" | "INTERNAL" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "YOUTUBE";
  } else if (url.includes("instagram.com")) {
    return "INSTAGRAM";
  }
  return "INTERNAL";
}

// Helper function to get video embed URL
function getVideoEmbedUrl(url: string, platform: string): string | null {
  if (platform === "YOUTUBE") {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return null;
}

// Get all approved posts (all users can see)
router.get("/", authRequired, async (req, res) => {
  const { centerId } = req.query;

  const where: any = {
    approvalStatus: "APPROVED"
  };

  if (centerId) {
    where.centerId = Number(centerId);
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      center: {
        select: {
          id: true,
          name: true
        }
      },
      comments: {
        include: {
          post: false
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Add creator information and embed URLs
  const postsWithCreators = await Promise.all(posts.map(async (post) => {
    let creator: any = null;
    
    if (post.createdByRole === "ADMIN" || post.createdByRole === "COACH") {
      const coach = await prisma.coach.findUnique({
        where: { id: post.createdById },
        select: { id: true, fullName: true, email: true, role: true }
      });
      creator = coach;
    } else if (post.createdByRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: post.createdById },
        select: { id: true, fullName: true, email: true }
      });
      creator = student;
    }

    // Add creator info to comments
    const commentsWithCreators = await Promise.all(post.comments.map(async (comment) => {
      let commentCreator: any = null;
      
      if (comment.createdByRole === "ADMIN" || comment.createdByRole === "COACH") {
        const coach = await prisma.coach.findUnique({
          where: { id: comment.createdById },
          select: { id: true, fullName: true, email: true, role: true }
        });
        commentCreator = coach;
      } else if (comment.createdByRole === "STUDENT") {
        const student = await prisma.student.findUnique({
          where: { id: comment.createdById },
          select: { id: true, fullName: true, email: true }
        });
        commentCreator = student;
      }

      return {
        ...comment,
        creator: commentCreator
      };
    }));

    return {
      ...post,
      creator,
      embedUrl: post.mediaType === "LINK" && post.platform ? getVideoEmbedUrl(post.mediaUrl, post.platform) : null,
      comments: commentsWithCreators
    };
  }));

  res.json(postsWithCreators);
});

// Get pending posts (for admin/coach approval)
router.get("/pending", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      approvalStatus: "PENDING"
    },
    include: {
      center: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const postsWithCreators = await Promise.all(posts.map(async (post) => {
    let creator: any = null;
    
    if (post.createdByRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: post.createdById },
        select: { id: true, fullName: true, email: true }
      });
      creator = student;
    }

    return {
      ...post,
      creator
    };
  }));

  res.json(postsWithCreators);
});

// Get a specific post
router.get("/:id", authRequired, async (req, res) => {
  const postId = Number(req.params.id);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      center: {
        select: {
          id: true,
          name: true
        }
      },
      comments: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Only show approved posts to non-admin/coach users
  const { role } = req.user!;
  if (post.approvalStatus !== "APPROVED" && role !== "ADMIN" && role !== "COACH") {
    return res.status(403).json({ message: "Post not available" });
  }

  let creator: any = null;
  if (post.createdByRole === "ADMIN" || post.createdByRole === "COACH") {
    const coach = await prisma.coach.findUnique({
      where: { id: post.createdById },
      select: { id: true, fullName: true, email: true, role: true }
    });
    creator = coach;
  } else if (post.createdByRole === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id: post.createdById },
      select: { id: true, fullName: true, email: true }
    });
    creator = student;
  }

  const commentsWithCreators = await Promise.all(post.comments.map(async (comment) => {
    let commentCreator: any = null;
    
    if (comment.createdByRole === "ADMIN" || comment.createdByRole === "COACH") {
      const coach = await prisma.coach.findUnique({
        where: { id: comment.createdById },
        select: { id: true, fullName: true, email: true, role: true }
      });
      commentCreator = coach;
    } else if (comment.createdByRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: comment.createdById },
        select: { id: true, fullName: true, email: true }
      });
      commentCreator = student;
    }

    return {
      ...comment,
      creator: commentCreator
    };
  }));

  res.json({
    ...post,
    creator,
    embedUrl: post.mediaType === "LINK" && post.platform ? getVideoEmbedUrl(post.mediaUrl, post.platform) : null,
    comments: commentsWithCreators
  });
});

// Create a post
router.post("/", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { title, description, mediaType, mediaUrl, centerId } = req.body;

  if (!mediaUrl) {
    return res.status(400).json({ message: "Media URL is required" });
  }

  // Determine approval status
  let approvalStatus: "PENDING" | "APPROVED" = "APPROVED";
  if (role === "STUDENT") {
    approvalStatus = "PENDING"; // Students need approval
  }

  // Detect platform for links
  let platform: "YOUTUBE" | "INSTAGRAM" | "INTERNAL" | null = null;
  if (mediaType === "LINK") {
    platform = detectPlatform(mediaUrl);
  }

  const post = await prisma.post.create({
    data: {
      title: title || null,
      description: description || null,
      mediaType: mediaType || "IMAGE",
      mediaUrl,
      platform: platform || null,
      centerId: centerId ? Number(centerId) : null,
      createdByRole: role,
      createdById: id,
      approvalStatus
    },
    include: {
      center: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  // Get creator info
  let creator: any = null;
  if (role === "ADMIN" || role === "COACH") {
    const coach = await prisma.coach.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true, role: true }
    });
    creator = coach;
  } else if (role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true }
    });
    creator = student;
  }

  res.status(201).json({
    ...post,
    creator,
    embedUrl: post.mediaType === "LINK" && post.platform ? getVideoEmbedUrl(post.mediaUrl, post.platform) : null,
    comments: []
  });
});

// Approve or reject a post (Admin/Coach only)
router.put("/:id/approve", authRequired, requireRole("ADMIN", "COACH"), async (req, res) => {
  const { id: approverId } = req.user!;
  const postId = Number(req.params.id);
  const { status } = req.body; // "APPROVED" or "REJECTED"

  if (status !== "APPROVED" && status !== "REJECTED") {
    return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      approvalStatus: status,
      approvedById: approverId,
      approvedAt: new Date()
    },
    include: {
      center: {
        select: {
          id: true,
          name: true
        }
      },
      comments: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  // Get creator info
  let creator: any = null;
  if (updatedPost.createdByRole === "ADMIN" || updatedPost.createdByRole === "COACH") {
    const coach = await prisma.coach.findUnique({
      where: { id: updatedPost.createdById },
      select: { id: true, fullName: true, email: true, role: true }
    });
    creator = coach;
  } else if (updatedPost.createdByRole === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id: updatedPost.createdById },
      select: { id: true, fullName: true, email: true }
    });
    creator = student;
  }

  res.json({
    ...updatedPost,
    creator,
    embedUrl: updatedPost.mediaType === "LINK" && updatedPost.platform ? getVideoEmbedUrl(updatedPost.mediaUrl, updatedPost.platform) : null,
    comments: []
  });
});

// Update a post (only by creator or admin)
router.put("/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const postId = Number(req.params.id);
  const { title, description, mediaType, mediaUrl, centerId } = req.body;

  const existingPost = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!existingPost) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Only creator or admin can update
  if (role !== "ADMIN" && (existingPost.createdByRole !== role || existingPost.createdById !== id)) {
    return res.status(403).json({ message: "You can only update your own posts" });
  }

  // Detect platform for links
  let platform: "YOUTUBE" | "INSTAGRAM" | "INTERNAL" | null = existingPost.platform;
  if (mediaUrl && mediaType === "LINK") {
    platform = detectPlatform(mediaUrl);
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title: title !== undefined ? title : undefined,
      description: description !== undefined ? description : undefined,
      mediaType: mediaType || undefined,
      mediaUrl: mediaUrl || undefined,
      platform: platform || undefined,
      centerId: centerId !== undefined ? (centerId ? Number(centerId) : null) : undefined
    },
    include: {
      center: {
        select: {
          id: true,
          name: true
        }
      },
      comments: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  // Get creator info
  let creator: any = null;
  if (updatedPost.createdByRole === "ADMIN" || updatedPost.createdByRole === "COACH") {
    const coach = await prisma.coach.findUnique({
      where: { id: updatedPost.createdById },
      select: { id: true, fullName: true, email: true, role: true }
    });
    creator = coach;
  } else if (updatedPost.createdByRole === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { id: updatedPost.createdById },
      select: { id: true, fullName: true, email: true }
    });
    creator = student;
  }

  const commentsWithCreators = await Promise.all(updatedPost.comments.map(async (comment) => {
    let commentCreator: any = null;
    
    if (comment.createdByRole === "ADMIN" || comment.createdByRole === "COACH") {
      const coach = await prisma.coach.findUnique({
        where: { id: comment.createdById },
        select: { id: true, fullName: true, email: true, role: true }
      });
      commentCreator = coach;
    } else if (comment.createdByRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: comment.createdById },
        select: { id: true, fullName: true, email: true }
      });
      commentCreator = student;
    }

    return {
      ...comment,
      creator: commentCreator
    };
  }));

  res.json({
    ...updatedPost,
    creator,
    embedUrl: updatedPost.mediaType === "LINK" && updatedPost.platform ? getVideoEmbedUrl(updatedPost.mediaUrl, updatedPost.platform) : null,
    comments: commentsWithCreators
  });
});

// Delete a post (only by creator or admin)
router.delete("/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const postId = Number(req.params.id);

  const existingPost = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!existingPost) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Only creator or admin can delete
  if (role !== "ADMIN" && (existingPost.createdByRole !== role || existingPost.createdById !== id)) {
    return res.status(403).json({ message: "You can only delete your own posts" });
  }

  await prisma.post.delete({
    where: { id: postId }
  });

  res.json({ message: "Post deleted successfully" });
});

export default router;



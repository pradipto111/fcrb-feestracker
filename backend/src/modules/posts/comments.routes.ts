import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, toPrismaRole } from "../../auth/auth.middleware";

const router = Router();

// Get comments for a post
router.get("/post/:postId", authRequired, async (req, res) => {
  const postId = Number(req.params.postId);

  // Verify post exists and is approved (or user is admin/coach)
  const { role } = req.user!;
  const post = await prisma.post.findUnique({
    where: { id: postId }
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.approvalStatus !== "APPROVED" && role !== "ADMIN" && role !== "COACH") {
    return res.status(403).json({ message: "Post not available" });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: {
      createdAt: "asc"
    }
  });

  // Add creator information
  const commentsWithCreators = await Promise.all(comments.map(async (comment: any) => {
    let creator: any = null;
    
    if (comment.createdByRole === "ADMIN" || comment.createdByRole === "COACH") {
      const coach = await prisma.coach.findUnique({
        where: { id: comment.createdById },
        select: { id: true, fullName: true, email: true, role: true }
      });
      creator = coach;
    } else if (comment.createdByRole === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { id: comment.createdById },
        select: { id: true, fullName: true, email: true }
      });
      creator = student;
    }

    return {
      ...comment,
      creator
    };
  }));

  res.json(commentsWithCreators);
});

// Create a comment
router.post("/", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { postId, content } = req.body;

  if (!postId || !content) {
    return res.status(400).json({ message: "Post ID and content are required" });
  }

  // Verify post exists and is approved
  const post = await prisma.post.findUnique({
    where: { id: Number(postId) }
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.approvalStatus !== "APPROVED" && role !== "ADMIN" && role !== "COACH") {
    return res.status(403).json({ message: "Cannot comment on this post" });
  }

  const comment = await prisma.comment.create({
    data: {
      postId: Number(postId),
      content,
      createdByRole: toPrismaRole(role),
      createdById: id
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
    ...comment,
    creator
  });
});

// Update a comment (only by creator)
router.put("/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const commentId = Number(req.params.id);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!existingComment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  // Only creator can update
  if (existingComment.createdByRole !== role || existingComment.createdById !== id) {
    return res.status(403).json({ message: "You can only update your own comments" });
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { content }
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

  res.json({
    ...comment,
    creator
  });
});

// Delete a comment (only by creator or admin)
router.delete("/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const commentId = Number(req.params.id);

  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId }
  });

  if (!existingComment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  // Only creator or admin can delete
  if (role !== "ADMIN" && (existingComment.createdByRole !== role || existingComment.createdById !== id)) {
    return res.status(403).json({ message: "You can only delete your own comments" });
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  res.json({ message: "Comment deleted successfully" });
});

export default router;





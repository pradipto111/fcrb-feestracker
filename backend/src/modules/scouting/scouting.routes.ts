/**
 * Scouting Board & Player Comparison API Routes
 * 
 * Endpoints for scouting board management and player comparison
 * Internal only (COACH/ADMIN)
 */

import { Router } from "express";
import { authRequired, requireRole, toPrismaRole } from "../../auth/auth.middleware";
import {
  comparePlayers,
  getScoutingBoards,
  createScoutingBoard,
  getScoutingBoard,
  updateScoutingBoard,
  deleteScoutingBoard,
  addPlayerToBoard,
  removePlayerFromBoard,
  getBoardPlayers,
  createScoutingDecision,
  getScoutingDecisions,
  getPlayersForScouting,
} from "./scouting.service";

const router = Router();

// All routes require authentication and COACH/ADMIN role
router.use(authRequired);
router.use(requireRole("COACH", "ADMIN"));

/**
 * POST /scouting/compare
 * Compare players with contextual filters
 */
router.post("/compare", async (req, res) => {
  try {
    const { playerIds, position, ageGroup, level, snapshotType, snapshotDate, averageSnapshots } = req.body;
    
    if (!playerIds || !Array.isArray(playerIds) || playerIds.length < 2) {
      return res.status(400).json({ message: "At least 2 player IDs required" });
    }
    
    if (playerIds.length > 5) {
      return res.status(400).json({ message: "Maximum 5 players can be compared" });
    }
    
    if (!position) {
      return res.status(400).json({ message: "Position is required for comparison" });
    }

    const comparison = await comparePlayers({
      playerIds,
      position,
      ageGroup,
      level,
      snapshotType: snapshotType || "latest",
      snapshotDate,
      averageSnapshots,
    });

    res.json(comparison);
  } catch (error: any) {
    console.error("Comparison error:", error);
    res.status(400).json({ message: error.message || "Failed to compare players" });
  }
});

/**
 * GET /scouting/players
 * Get players for scouting board with filters
 */
router.get("/players", async (req, res) => {
  try {
    const { role, id } = req.user!;
    const {
      centerId,
      position,
      ageGroup,
      level,
      readinessMin,
      readinessMax,
      trendDirection,
      injuryRisk,
      coachConfidence,
      lastUpdatedDays,
      sortBy,
      sortOrder,
      limit = 50,
      offset = 0,
    } = req.query;

    const players = await getPlayersForScouting({
      coachId: role === "COACH" ? id : undefined,
      centerId: centerId ? Number(centerId) : undefined,
      position: position as string,
      ageGroup: ageGroup as string,
      level: level as string,
      readinessMin: readinessMin ? Number(readinessMin) : undefined,
      readinessMax: readinessMax ? Number(readinessMax) : undefined,
      trendDirection: trendDirection as "improving" | "plateau" | "declining" | undefined,
      injuryRisk: injuryRisk === "true",
      coachConfidence: coachConfidence ? Number(coachConfidence) : undefined,
      lastUpdatedDays: lastUpdatedDays ? Number(lastUpdatedDays) : undefined,
      sortBy: (sortBy as string) || "readiness",
      sortOrder: (sortOrder as "asc" | "desc") || "desc",
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json(players);
  } catch (error: any) {
    console.error("Get players error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch players" });
  }
});

/**
 * GET /scouting/boards
 * List all scouting boards (filtered by coach's centers if COACH)
 */
router.get("/boards", async (req, res) => {
  try {
    const { role, id } = req.user!;
    const boards = await getScoutingBoards(role === "COACH" ? id : undefined);
    res.json({ boards });
  } catch (error: any) {
    console.error("Get boards error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch boards" });
  }
});

/**
 * POST /scouting/boards
 * Create a new scouting board
 */
router.post("/boards", async (req, res) => {
  try {
    const { id: userId, role } = req.user!;
    const { name, description, type, centerId } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    if (type === "CENTRE_VIEW" && !centerId) {
      return res.status(400).json({ message: "centerId is required for CENTRE_VIEW boards" });
    }

    const board = await createScoutingBoard({
      name,
      description,
      type,
      centerId: centerId ? Number(centerId) : undefined,
      createdByUserId: userId,
      createdByRole: toPrismaRole(role),
    });

    res.status(201).json(board);
  } catch (error: any) {
    console.error("Create board error:", error);
    res.status(400).json({ message: error.message || "Failed to create board" });
  }
});

/**
 * GET /scouting/boards/:boardId
 * Get a specific scouting board with players
 */
router.get("/boards/:boardId", async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    const board = await getScoutingBoard(boardId);
    res.json(board);
  } catch (error: any) {
    console.error("Get board error:", error);
    res.status(404).json({ message: error.message || "Board not found" });
  }
});

/**
 * PUT /scouting/boards/:boardId
 * Update a scouting board
 */
router.put("/boards/:boardId", async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    const { name, description } = req.body;
    const board = await updateScoutingBoard(boardId, { name, description });
    res.json(board);
  } catch (error: any) {
    console.error("Update board error:", error);
    res.status(400).json({ message: error.message || "Failed to update board" });
  }
});

/**
 * DELETE /scouting/boards/:boardId
 * Delete a scouting board
 */
router.delete("/boards/:boardId", async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    await deleteScoutingBoard(boardId);
    res.json({ message: "Board deleted successfully" });
  } catch (error: any) {
    console.error("Delete board error:", error);
    res.status(400).json({ message: error.message || "Failed to delete board" });
  }
});

/**
 * POST /scouting/boards/:boardId/players
 * Add a player to a scouting board
 */
router.post("/boards/:boardId/players", async (req, res) => {
  try {
    const { id: userId, role } = req.user!;
    const boardId = Number(req.params.boardId);
    const { studentId, notes } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const boardPlayer = await addPlayerToBoard({
      boardId,
      studentId: Number(studentId),
      addedByUserId: userId,
      addedByRole: toPrismaRole(role),
      notes,
    });

    res.status(201).json(boardPlayer);
  } catch (error: any) {
    console.error("Add player error:", error);
    res.status(400).json({ message: error.message || "Failed to add player" });
  }
});

/**
 * DELETE /scouting/boards/:boardId/players/:studentId
 * Remove a player from a scouting board
 */
router.delete("/boards/:boardId/players/:studentId", async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    const studentId = Number(req.params.studentId);
    await removePlayerFromBoard(boardId, studentId);
    res.json({ message: "Player removed from board" });
  } catch (error: any) {
    console.error("Remove player error:", error);
    res.status(400).json({ message: error.message || "Failed to remove player" });
  }
});

/**
 * GET /scouting/boards/:boardId/players
 * Get all players on a scouting board
 */
router.get("/boards/:boardId/players", async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    const players = await getBoardPlayers(boardId);
    res.json({ players });
  } catch (error: any) {
    console.error("Get board players error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch players" });
  }
});

/**
 * POST /scouting/boards/:boardId/decisions
 * Create a scouting decision for a player
 */
router.post("/boards/:boardId/decisions", async (req, res) => {
  try {
    const { id: userId, role } = req.user!;
    const boardId = Number(req.params.boardId);
    const { studentId, decisionState, notes } = req.body;

    if (!studentId || !decisionState) {
      return res.status(400).json({ message: "studentId and decisionState are required" });
    }

    const decision = await createScoutingDecision({
      boardId,
      studentId: Number(studentId),
      decisionState,
      notes,
      decidedByUserId: userId,
      decidedByRole: toPrismaRole(role),
    });

    res.status(201).json(decision);
  } catch (error: any) {
    console.error("Create decision error:", error);
    res.status(400).json({ message: error.message || "Failed to create decision" });
  }
});

/**
 * GET /scouting/boards/:boardId/decisions
 * Get all decisions for a scouting board
 */
router.get("/boards/:boardId/decisions", async (req, res) => {
  try {
    const boardId = Number(req.params.boardId);
    const decisions = await getScoutingDecisions(boardId);
    res.json({ decisions });
  } catch (error: any) {
    console.error("Get decisions error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch decisions" });
  }
});

export default router;


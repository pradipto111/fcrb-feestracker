/**
 * Player Metrics API Routes
 * 
 * Endpoints for creating and querying player metric snapshots
 */

import { Router } from "express";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import {
  createPlayerMetricSnapshot,
  getLatestPlayerSnapshot,
  getPlayerMetricTimeline,
  getPlayerSnapshots,
  getPositionalSuitabilityLatest,
  getPlayerAuditLog,
  getPlayerCoachNotes,
  canPlayerViewMetric,
  CreateSnapshotPayload,
} from "./metrics.service";
import { Role, MetricSourceContext, PlayerPosition } from "@prisma/client";
// import calibrationRoutes from "./calibration.routes"; // TODO: Fix TypeScript errors before enabling

const router = Router();

// Mount calibration routes
// router.use("/calibration", calibrationRoutes); // TODO: Fix TypeScript errors before enabling

/**
 * POST /player-metrics/snapshots
 * Create a new player metric snapshot (COACH/ADMIN only)
 */
router.post("/snapshots", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const { id: userId, role } = req.user!;
    
    // Transform frontend payload to backend format
    // Frontend sends valueNumber, backend expects value
    const transformValues = (values: any[]) => {
      return (values || [])
        .filter(v => v && v.metricKey && (v.valueNumber !== undefined && v.valueNumber !== null && !isNaN(v.valueNumber)))
        .map(v => ({
          metricKey: v.metricKey,
          value: v.valueNumber, // Transform valueNumber to value
          confidence: v.confidence,
          comment: v.comment,
        }));
    };

    const transformTraits = (traits: any[]) => {
      return (traits || [])
        .filter(t => t && t.traitKey && (t.score !== undefined && t.score !== null && !isNaN(t.score)))
        .map(t => ({
          traitKey: t.traitKey,
          value: t.score, // Transform score to value
          comment: t.comment,
        }));
    };

    const payload: CreateSnapshotPayload = {
      studentId: req.body.studentId,
      createdByUserId: userId,
      createdByRole: role as Role,
      sourceContext: req.body.sourceContext as MetricSourceContext,
      seasonId: req.body.seasonId,
      notes: req.body.notes,
      values: transformValues(req.body.values || []),
      positional: (req.body.positional || []).filter((p: any) => p && p.position && p.suitability !== undefined && p.suitability !== null && !isNaN(p.suitability)),
      traits: transformTraits(req.body.traits || []),
    };

    const snapshot = await createPlayerMetricSnapshot(payload);
    res.status(201).json(snapshot);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/snapshots/my
 * Get student's own snapshots (STUDENT only)
 */
router.get("/snapshots/my", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { id: studentId } = req.user!;
    const { limit = 10, offset = 0, sourceContext } = req.query;

    const snapshots = await getPlayerSnapshots(studentId, {
      limit: Number(limit),
      offset: Number(offset),
      sourceContext: sourceContext as MetricSourceContext | undefined,
    });

    res.json({ snapshots });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/snapshots/:studentId
 * Get snapshots for a specific student (COACH/ADMIN only)
 */
router.get("/snapshots/:studentId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const { limit = 10, offset = 0, sourceContext } = req.query;

    const snapshots = await getPlayerSnapshots(studentId, {
      limit: Number(limit),
      offset: Number(offset),
      sourceContext: sourceContext as MetricSourceContext | undefined,
    });

    res.json({ snapshots });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/snapshots/my/latest
 * Get student's latest snapshot (STUDENT only)
 * Filters out coach-only metrics for students
 */
router.get("/snapshots/my/latest", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { id: studentId } = req.user!;
    const snapshot = await getLatestPlayerSnapshot(studentId);

    if (!snapshot) {
      return res.json({ snapshot: null });
    }

    // Filter out coach-only metrics for students
    const filteredSnapshot = {
      ...snapshot,
      values: snapshot.values.filter(val => !val.metricDefinition.isCoachOnly),
      traits: snapshot.traits.filter(trait => !trait.metricDefinition.isCoachOnly),
    };

    // Log for debugging (remove in production if needed)
    console.log(`[Metrics API] Returning snapshot ${snapshot.id} for student ${studentId} with ${filteredSnapshot.values.length} visible metrics`);

    // Return 200 with null if no snapshot exists (not an error)
    res.json({ snapshot: filteredSnapshot });
  } catch (error: any) {
    console.error(`[Metrics API] Error fetching snapshot for student:`, error);
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/timeline/my/:metricKey
 * Get timeline for a specific metric (STUDENT only)
 */
router.get("/timeline/my/:metricKey", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { id: studentId } = req.user!;
    const { metricKey } = req.params;
    const { limit = 50 } = req.query;

    // Check if student can view this metric
    const canView = await canPlayerViewMetric(studentId, metricKey, Role.STUDENT);
    if (!canView) {
      return res.status(403).json({ message: "This metric is not visible to players" });
    }

    const timeline = await getPlayerMetricTimeline(studentId, metricKey, Number(limit));
    res.json({ timeline });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/positional/my
 * Get student's positional suitability (STUDENT only)
 */
router.get("/positional/my", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { id: studentId } = req.user!;
    const snapshot = await getLatestPlayerSnapshot(studentId);

    if (!snapshot) {
      return res.json({ positional: [] });
    }

    // Return positional data from latest snapshot
    res.json({ positional: snapshot.positional || [] });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/definitions
 * Get all metric definitions (public for authenticated users)
 */
router.get("/definitions", authRequired, async (req, res) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const definitions = await prisma.playerMetricDefinition.findMany({
      where: { isActive: true },
      orderBy: [
        { category: "asc" },
        { displayOrder: "asc" },
      ],
    });

    res.json({ definitions });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/notes/my
 * Get student's coach notes (STUDENT only - only visible ones)
 */
router.get("/notes/my", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { id: studentId } = req.user!;
    const { limit = 20 } = req.query;

    const notes = await getPlayerCoachNotes(studentId, {
      includeHidden: false, // Students can only see visible notes
      limit: Number(limit),
    });

    res.json({ notes });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/snapshots/:studentId/latest
 * Get latest snapshot for a specific student (COACH/ADMIN only)
 */
router.get("/snapshots/:studentId/latest", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const snapshot = await getLatestPlayerSnapshot(studentId);

    // Return 200 with null if no snapshot exists (not an error)
    res.json({ snapshot: snapshot || null });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /player-metrics/positional/:studentId
 * Get positional suitability for a specific student (COACH/ADMIN only)
 */
router.get("/positional/:studentId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const positional = await getPositionalSuitabilityLatest(studentId);

    // Return 200 with empty array if no positional data exists (not an error)
    res.json({ positional: positional || [] });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;


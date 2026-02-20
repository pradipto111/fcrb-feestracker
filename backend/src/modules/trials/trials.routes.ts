/**
 * Trial Management API Routes
 * 
 * Endpoints for trial events, trialists, reports, templates, and comparisons
 * Internal only (COACH/ADMIN)
 */

import { Router } from "express";
import { authRequired, requireRole, toPrismaRole } from "../../auth/auth.middleware";
import {
  createTrialEvent,
  getTrialEvents,
  getTrialEvent,
  updateTrialEvent,
  addStaffToEvent,
  removeStaffFromEvent,
  createTrialist,
  getTrialists,
  getTrialist,
  updateTrialist,
  addTrialistToEvent,
  removeTrialistFromEvent,
  createTemplate,
  getTemplates,
  getTemplate,
  updateTemplate,
  createTrialReport,
  getTrialReports,
  getTrialReport,
  updateTrialReport,
  compareTrialists,
  createShortlist,
  addTrialistToShortlist,
  removeTrialistFromShortlist,
  createDecision,
} from "./trials.service";
import { TrialEventStatus, TrialObservationType, TrialRecommendedAction, TrialPositionScope } from "@prisma/client";

const router = Router();

// All routes require authentication and COACH/ADMIN role
router.use(authRequired);
router.use(requireRole("COACH", "ADMIN"));

// ============================================
// TRIAL EVENTS
// ============================================

/**
 * GET /trials/events
 * List trial events
 */
router.get("/events", async (req, res) => {
  try {
    const { role, id } = req.user!;
    const { centerId, status, coachId } = req.query;

    const events = await getTrialEvents({
      centerId: centerId ? Number(centerId) : undefined,
      status: status as TrialEventStatus | undefined,
      coachId: role === "COACH" ? id : (coachId ? Number(coachId) : undefined),
    });

    res.json({ events });
  } catch (error: any) {
    console.error("Get events error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch events" });
  }
});

/**
 * POST /trials/events
 * Create a new trial event
 */
router.post("/events", async (req, res) => {
  try {
    const { id: userId, role } = req.user!;
    const {
      title,
      centerId,
      startDateTime,
      endDateTime,
      ageGroups,
      positionsNeeded,
      format,
      notes,
      staffIds,
    } = req.body;

    if (!title || !centerId || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: "Title, centerId, startDateTime, and endDateTime are required" });
    }

    const event = await createTrialEvent({
      title,
      centerId: Number(centerId),
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      ageGroups: ageGroups || [],
      positionsNeeded: positionsNeeded || [],
      format,
      notes,
      staffIds: staffIds ? staffIds.map(Number) : undefined,
      createdByUserId: userId,
      createdByRole: toPrismaRole(role),
    });

    res.status(201).json(event);
  } catch (error: any) {
    console.error("Create event error:", error);
    res.status(400).json({ message: error.message || "Failed to create event" });
  }
});

/**
 * GET /trials/events/:eventId
 * Get a specific trial event
 */
router.get("/events/:eventId", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const event = await getTrialEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error: any) {
    console.error("Get event error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch event" });
  }
});

/**
 * PUT /trials/events/:eventId
 * Update a trial event
 */
router.put("/events/:eventId", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const {
      title,
      startDateTime,
      endDateTime,
      ageGroups,
      positionsNeeded,
      format,
      status,
      notes,
    } = req.body;

    const event = await updateTrialEvent(eventId, {
      title,
      startDateTime: startDateTime ? new Date(startDateTime) : undefined,
      endDateTime: endDateTime ? new Date(endDateTime) : undefined,
      ageGroups,
      positionsNeeded,
      format,
      status: status as TrialEventStatus | undefined,
      notes,
    });

    res.json(event);
  } catch (error: any) {
    console.error("Update event error:", error);
    res.status(400).json({ message: error.message || "Failed to update event" });
  }
});

/**
 * POST /trials/events/:eventId/staff
 * Add staff to event
 */
router.post("/events/:eventId/staff", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { coachId, role } = req.body;

    if (!coachId) {
      return res.status(400).json({ message: "coachId is required" });
    }

    const staff = await addStaffToEvent(eventId, Number(coachId), role);
    res.status(201).json(staff);
  } catch (error: any) {
    console.error("Add staff error:", error);
    res.status(400).json({ message: error.message || "Failed to add staff" });
  }
});

/**
 * DELETE /trials/events/:eventId/staff/:coachId
 * Remove staff from event
 */
router.delete("/events/:eventId/staff/:coachId", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const coachId = Number(req.params.coachId);
    await removeStaffFromEvent(eventId, coachId);
    res.json({ message: "Staff removed" });
  } catch (error: any) {
    console.error("Remove staff error:", error);
    res.status(400).json({ message: error.message || "Failed to remove staff" });
  }
});

// ============================================
// TRIALISTS
// ============================================

/**
 * GET /trials/trialists
 * List trialists
 */
router.get("/trialists", async (req, res) => {
  try {
    const { search, primaryPosition, ageGroup } = req.query;
    const trialists = await getTrialists({
      search: search as string,
      primaryPosition: primaryPosition as string,
      ageGroup: ageGroup as string,
    });
    res.json({ trialists });
  } catch (error: any) {
    console.error("Get trialists error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch trialists" });
  }
});

/**
 * POST /trials/trialists
 * Create a new trialist
 */
router.post("/trialists", async (req, res) => {
  try {
    const trialist = await createTrialist({
      fullName: req.body.fullName,
      phone: req.body.phone,
      guardianPhone: req.body.guardianPhone,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
      preferredFoot: req.body.preferredFoot,
      primaryPosition: req.body.primaryPosition,
      secondaryPositions: req.body.secondaryPositions || [],
      currentClub: req.body.currentClub,
      location: req.body.location,
      height: req.body.height ? Number(req.body.height) : undefined,
      weight: req.body.weight ? Number(req.body.weight) : undefined,
      injuryNotes: req.body.injuryNotes,
      consentAccepted: req.body.consentAccepted || false,
    });

    res.status(201).json(trialist);
  } catch (error: any) {
    console.error("Create trialist error:", error);
    res.status(400).json({ message: error.message || "Failed to create trialist" });
  }
});

/**
 * GET /trials/trialists/:trialistId
 * Get a specific trialist
 */
router.get("/trialists/:trialistId", async (req, res) => {
  try {
    const trialistId = Number(req.params.trialistId);
    const trialist = await getTrialist(trialistId);
    if (!trialist) {
      return res.status(404).json({ message: "Trialist not found" });
    }
    res.json(trialist);
  } catch (error: any) {
    console.error("Get trialist error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch trialist" });
  }
});

/**
 * PUT /trials/trialists/:trialistId
 * Update a trialist
 */
router.put("/trialists/:trialistId", async (req, res) => {
  try {
    const trialistId = Number(req.params.trialistId);
    const trialist = await updateTrialist(trialistId, {
      fullName: req.body.fullName,
      phone: req.body.phone,
      guardianPhone: req.body.guardianPhone,
      email: req.body.email,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
      preferredFoot: req.body.preferredFoot,
      primaryPosition: req.body.primaryPosition,
      secondaryPositions: req.body.secondaryPositions,
      currentClub: req.body.currentClub,
      location: req.body.location,
      height: req.body.height ? Number(req.body.height) : undefined,
      weight: req.body.weight ? Number(req.body.weight) : undefined,
      injuryNotes: req.body.injuryNotes,
      consentAccepted: req.body.consentAccepted,
    });

    res.json(trialist);
  } catch (error: any) {
    console.error("Update trialist error:", error);
    res.status(400).json({ message: error.message || "Failed to update trialist" });
  }
});

/**
 * POST /trials/events/:eventId/trialists
 * Add trialist to event
 */
router.post("/events/:eventId/trialists", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const { trialistId, notes } = req.body;

    if (!trialistId) {
      return res.status(400).json({ message: "trialistId is required" });
    }

    const link = await addTrialistToEvent(eventId, Number(trialistId), notes);
    res.status(201).json(link);
  } catch (error: any) {
    console.error("Add trialist error:", error);
    res.status(400).json({ message: error.message || "Failed to add trialist" });
  }
});

/**
 * DELETE /trials/events/:eventId/trialists/:trialistId
 * Remove trialist from event
 */
router.delete("/events/:eventId/trialists/:trialistId", async (req, res) => {
  try {
    const eventId = Number(req.params.eventId);
    const trialistId = Number(req.params.trialistId);
    await removeTrialistFromEvent(eventId, trialistId);
    res.json({ message: "Trialist removed" });
  } catch (error: any) {
    console.error("Remove trialist error:", error);
    res.status(400).json({ message: error.message || "Failed to remove trialist" });
  }
});

// ============================================
// TEMPLATES
// ============================================

/**
 * GET /trials/templates
 * List templates
 */
router.get("/templates", async (req, res) => {
  try {
    const { positionScope, position, ageGroup } = req.query;
    const templates = await getTemplates({
      positionScope: positionScope as TrialPositionScope | undefined,
      position: position as string,
      ageGroup: ageGroup as string,
    });
    res.json({ templates });
  } catch (error: any) {
    console.error("Get templates error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch templates" });
  }
});

/**
 * POST /trials/templates
 * Create a new template
 */
router.post("/templates", async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const {
      name,
      positionScope,
      specificPositions,
      ageScope,
      description,
      isDefault,
      items,
    } = req.body;

    if (!name || !positionScope || !items || items.length === 0) {
      return res.status(400).json({ message: "Name, positionScope, and items are required" });
    }

    const template = await createTemplate({
      name,
      positionScope: positionScope as TrialPositionScope,
      specificPositions,
      ageScope,
      description,
      isDefault,
      createdByCoachId: userId,
      items,
    });

    res.status(201).json(template);
  } catch (error: any) {
    console.error("Create template error:", error);
    res.status(400).json({ message: error.message || "Failed to create template" });
  }
});

/**
 * GET /trials/templates/:templateId
 * Get a specific template
 */
router.get("/templates/:templateId", async (req, res) => {
  try {
    const templateId = Number(req.params.templateId);
    const template = await getTemplate(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error: any) {
    console.error("Get template error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch template" });
  }
});

/**
 * PUT /trials/templates/:templateId
 * Update a template (Admin/Head Coach only - can be configured)
 */
router.put("/templates/:templateId", async (req, res) => {
  try {
    const templateId = Number(req.params.templateId);
    const {
      name,
      positionScope,
      specificPositions,
      ageScope,
      description,
      isDefault,
      items,
    } = req.body;

    const template = await updateTemplate(templateId, {
      name,
      positionScope: positionScope as TrialPositionScope | undefined,
      specificPositions,
      ageScope,
      description,
      isDefault,
      items,
    });

    res.json(template);
  } catch (error: any) {
    console.error("Update template error:", error);
    res.status(400).json({ message: error.message || "Failed to update template" });
  }
});

// ============================================
// TRIAL REPORTS
// ============================================

/**
 * GET /trials/reports
 * List trial reports
 */
router.get("/reports", async (req, res) => {
  try {
    const {
      trialEventId,
      trialistId,
      coachId,
      position,
      ageGroup,
      recommendedAction,
    } = req.query;

    const reports = await getTrialReports({
      trialEventId: trialEventId ? Number(trialEventId) : undefined,
      trialistId: trialistId ? Number(trialistId) : undefined,
      coachId: coachId ? Number(coachId) : undefined,
      position: position as string,
      ageGroup: ageGroup as string,
      recommendedAction: recommendedAction as TrialRecommendedAction | undefined,
    });

    res.json({ reports });
  } catch (error: any) {
    console.error("Get reports error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch reports" });
  }
});

/**
 * POST /trials/reports
 * Create a new trial report
 */
router.post("/reports", async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const {
      trialEventId,
      trialistId,
      templateId,
      observedPosition,
      ageGroup,
      observationType,
      confidence,
      minutesObserved,
      weatherNotes,
      pitchNotes,
      strengths,
      risks,
      coachSummary,
      recommendedAction,
      decisionNotes,
      metricValues,
      positionalSuitability,
    } = req.body;

    if (!trialEventId || !trialistId || !templateId || !observedPosition || !ageGroup || !observationType || !recommendedAction) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!metricValues || metricValues.length === 0) {
      return res.status(400).json({ message: "At least one metric value is required" });
    }

    // Validate strengths/risks max 3
    if (strengths && strengths.length > 3) {
      return res.status(400).json({ message: "Maximum 3 strengths allowed" });
    }
    if (risks && risks.length > 3) {
      return res.status(400).json({ message: "Maximum 3 risks allowed" });
    }

    // Require summary for SELECT_NOW or NOT_SELECTED
    if ((recommendedAction === "SELECT_NOW" || recommendedAction === "NOT_SELECTED") && !coachSummary) {
      return res.status(400).json({ message: "Coach summary is required for SELECT_NOW or NOT_SELECTED" });
    }

    const report = await createTrialReport({
      trialEventId: Number(trialEventId),
      trialistId: Number(trialistId),
      templateId: Number(templateId),
      createdByCoachId: userId,
      observedPosition,
      ageGroup,
      observationType: observationType as TrialObservationType,
      confidence: confidence ? Number(confidence) : undefined,
      minutesObserved: minutesObserved ? Number(minutesObserved) : undefined,
      weatherNotes,
      pitchNotes,
      strengths: strengths || [],
      risks: risks || [],
      coachSummary,
      recommendedAction: recommendedAction as TrialRecommendedAction,
      decisionNotes,
      metricValues: metricValues.map((mv: any) => ({
        templateItemId: Number(mv.templateItemId),
        value: Number(mv.value),
        comment: mv.comment,
        confidence: mv.confidence ? Number(mv.confidence) : undefined,
      })),
      positionalSuitability,
    });

    res.status(201).json(report);
  } catch (error: any) {
    console.error("Create report error:", error);
    res.status(400).json({ message: error.message || "Failed to create report" });
  }
});

/**
 * GET /trials/reports/:reportId
 * Get a specific trial report
 */
router.get("/reports/:reportId", async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const report = await getTrialReport(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (error: any) {
    console.error("Get report error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch report" });
  }
});

/**
 * PUT /trials/reports/:reportId
 * Update a trial report (creates revision history)
 */
router.put("/reports/:reportId", async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const reportId = Number(req.params.reportId);
    const {
      observedPosition,
      ageGroup,
      observationType,
      confidence,
      minutesObserved,
      weatherNotes,
      pitchNotes,
      strengths,
      risks,
      coachSummary,
      recommendedAction,
      decisionNotes,
      metricValues,
      positionalSuitability,
    } = req.body;

    // Validate strengths/risks max 3
    if (strengths && strengths.length > 3) {
      return res.status(400).json({ message: "Maximum 3 strengths allowed" });
    }
    if (risks && risks.length > 3) {
      return res.status(400).json({ message: "Maximum 3 risks allowed" });
    }

    const report = await updateTrialReport(
      reportId,
      {
        observedPosition,
        ageGroup,
        observationType: observationType as TrialObservationType | undefined,
        confidence: confidence ? Number(confidence) : undefined,
        minutesObserved: minutesObserved ? Number(minutesObserved) : undefined,
        weatherNotes,
        pitchNotes,
        strengths,
        risks,
        coachSummary,
        recommendedAction: recommendedAction as TrialRecommendedAction | undefined,
        decisionNotes,
        metricValues: metricValues ? metricValues.map((mv: any) => ({
          templateItemId: Number(mv.templateItemId),
          value: Number(mv.value),
          comment: mv.comment,
          confidence: mv.confidence ? Number(mv.confidence) : undefined,
        })) : undefined,
        positionalSuitability,
      },
      userId
    );

    res.json(report);
  } catch (error: any) {
    console.error("Update report error:", error);
    res.status(400).json({ message: error.message || "Failed to update report" });
  }
});

// ============================================
// COMPARISON & SHORTLISTS
// ============================================

/**
 * POST /trials/compare
 * Compare trialists
 */
router.post("/compare", async (req, res) => {
  try {
    const { trialistIds, trialEventId, position, ageGroup } = req.body;

    if (!trialistIds || !Array.isArray(trialistIds) || trialistIds.length < 2) {
      return res.status(400).json({ message: "At least 2 trialist IDs required" });
    }

    if (!position || !ageGroup) {
      return res.status(400).json({ message: "Position and ageGroup are required" });
    }

    const reports = await compareTrialists({
      trialistIds: trialistIds.map(Number),
      trialEventId: trialEventId ? Number(trialEventId) : undefined,
      position,
      ageGroup,
    });

    res.json({ reports });
  } catch (error: any) {
    console.error("Compare error:", error);
    res.status(400).json({ message: error.message || "Failed to compare trialists" });
  }
});

/**
 * POST /trials/shortlists
 * Create a shortlist
 */
router.post("/shortlists", async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const { trialEventId, name, description } = req.body;

    if (!trialEventId || !name) {
      return res.status(400).json({ message: "trialEventId and name are required" });
    }

    const shortlist = await createShortlist({
      trialEventId: Number(trialEventId),
      name,
      description,
      createdByCoachId: userId,
    });

    res.status(201).json(shortlist);
  } catch (error: any) {
    console.error("Create shortlist error:", error);
    res.status(400).json({ message: error.message || "Failed to create shortlist" });
  }
});

/**
 * POST /trials/shortlists/:shortlistId/trialists
 * Add trialist to shortlist
 */
router.post("/shortlists/:shortlistId/trialists", async (req, res) => {
  try {
    const shortlistId = Number(req.params.shortlistId);
    const { trialistId, notes } = req.body;

    if (!trialistId) {
      return res.status(400).json({ message: "trialistId is required" });
    }

    const item = await addTrialistToShortlist(shortlistId, Number(trialistId), notes);
    res.status(201).json(item);
  } catch (error: any) {
    console.error("Add to shortlist error:", error);
    res.status(400).json({ message: error.message || "Failed to add to shortlist" });
  }
});

/**
 * DELETE /trials/shortlists/:shortlistId/trialists/:trialistId
 * Remove trialist from shortlist
 */
router.delete("/shortlists/:shortlistId/trialists/:trialistId", async (req, res) => {
  try {
    const shortlistId = Number(req.params.shortlistId);
    const trialistId = Number(req.params.trialistId);
    await removeTrialistFromShortlist(shortlistId, trialistId);
    res.json({ message: "Trialist removed from shortlist" });
  } catch (error: any) {
    console.error("Remove from shortlist error:", error);
    res.status(400).json({ message: error.message || "Failed to remove from shortlist" });
  }
});

/**
 * POST /trials/decisions
 * Create a decision log entry
 */
router.post("/decisions", async (req, res) => {
  try {
    const { id: userId } = req.user!;
    const { trialEventId, trialistId, decision, notes } = req.body;

    if (!trialEventId || !trialistId || !decision) {
      return res.status(400).json({ message: "trialEventId, trialistId, and decision are required" });
    }

    const decisionLog = await createDecision({
      trialEventId: Number(trialEventId),
      trialistId: Number(trialistId),
      decision: decision as TrialRecommendedAction,
      notes,
      decidedByCoachId: userId,
    });

    res.status(201).json(decisionLog);
  } catch (error: any) {
    console.error("Create decision error:", error);
    res.status(400).json({ message: error.message || "Failed to create decision" });
  }
});

export default router;


/**
 * Parent Development Reports API Routes
 * 
 * Endpoints for generating and managing parent-facing development reports
 */

import { Router } from "express";
import { authRequired, requireRole, toPrismaRole } from "../../auth/auth.middleware";
import {
  createParentReport,
  publishReport,
  getStudentReports,
  getReport,
  updateReport,
  deleteReport,
  generateReportContent,
} from "./parent-reports.service";

const router = Router();

/**
 * POST /parent-reports/generate
 * Generate report content from a snapshot (COACH/ADMIN only)
 */
router.post("/generate", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const { studentId, snapshotId, reportingPeriodStart, reportingPeriodEnd, coachNote } = req.body;

    if (!studentId || !snapshotId) {
      return res.status(400).json({ message: "studentId and snapshotId are required" });
    }

    const content = await generateReportContent({
      studentId: Number(studentId),
      snapshotId: Number(snapshotId),
      reportingPeriodStart: reportingPeriodStart ? new Date(reportingPeriodStart) : undefined,
      reportingPeriodEnd: reportingPeriodEnd ? new Date(reportingPeriodEnd) : undefined,
      coachNote,
    });

    res.json({ content });
  } catch (error: any) {
    console.error("Generate report error:", error);
    res.status(400).json({ message: error.message || "Failed to generate report" });
  }
});

/**
 * POST /parent-reports
 * Create a new parent development report (COACH/ADMIN only)
 */
router.post("/", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const { studentId, snapshotId, reportingPeriodStart, reportingPeriodEnd, coachNote } = req.body;

    if (!studentId || !snapshotId) {
      return res.status(400).json({ message: "studentId and snapshotId are required" });
    }

    const report = await createParentReport({
      studentId: Number(studentId),
      snapshotId: Number(snapshotId),
      reportingPeriodStart: reportingPeriodStart ? new Date(reportingPeriodStart) : undefined,
      reportingPeriodEnd: reportingPeriodEnd ? new Date(reportingPeriodEnd) : undefined,
      coachNote,
    });

    res.status(201).json(report);
  } catch (error: any) {
    console.error("Create report error:", error);
    res.status(400).json({ message: error.message || "Failed to create report" });
  }
});

/**
 * GET /parent-reports/my
 * Get student's own reports (STUDENT only)
 */
router.get("/my", authRequired, requireRole("STUDENT"), async (req, res) => {
  try {
    const { id: studentId } = req.user!;
    const reports = await getStudentReports(studentId, false); // Only published reports
    res.json({ reports });
  } catch (error: any) {
    console.error("Get my reports error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch reports" });
  }
});

/**
 * GET /parent-reports/student/:studentId
 * Get reports for a specific student (COACH/ADMIN only, or student viewing own)
 */
router.get("/student/:studentId", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    const studentId = Number(req.params.studentId);
    const includeDrafts = req.query.includeDrafts === 'true';

    // Students can only see their own published reports
    if (role === "STUDENT" && id !== studentId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Coaches/Admins can see drafts
    const reports = await getStudentReports(
      studentId,
      (role === "COACH" || role === "ADMIN") && includeDrafts
    );

    res.json({ reports });
  } catch (error: any) {
    console.error("Get student reports error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch reports" });
  }
});

/**
 * GET /parent-reports/:reportId
 * Get a specific report
 */
router.get("/:reportId", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    const reportId = Number(req.params.reportId);
    const report = await getReport(reportId);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Students can only see published reports for themselves
    if (role === "STUDENT") {
      if (report.studentId !== id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (!report.visibleToParent) {
        return res.status(403).json({ message: "Report not published" });
      }
    }

    res.json(report);
  } catch (error: any) {
    console.error("Get report error:", error);
    res.status(400).json({ message: error.message || "Failed to fetch report" });
  }
});

/**
 * PUT /parent-reports/:reportId
 * Update a report (COACH/ADMIN only)
 */
router.put("/:reportId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const { reportingPeriodStart, reportingPeriodEnd, coachNote } = req.body;

    const report = await updateReport(reportId, {
      reportingPeriodStart: reportingPeriodStart ? new Date(reportingPeriodStart) : undefined,
      reportingPeriodEnd: reportingPeriodEnd ? new Date(reportingPeriodEnd) : undefined,
      coachNote,
    });

    res.json(report);
  } catch (error: any) {
    console.error("Update report error:", error);
    res.status(400).json({ message: error.message || "Failed to update report" });
  }
});

/**
 * POST /parent-reports/:reportId/publish
 * Publish a report (make it visible to parent/player) (COACH/ADMIN only)
 */
router.post("/:reportId/publish", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const { id: userId, role } = req.user!;
    const reportId = Number(req.params.reportId);
    const { visibleToParent = true } = req.body;

    const report = await publishReport({
      reportId,
      publishedByUserId: userId,
      publishedByRole: toPrismaRole(role),
      visibleToParent,
    });

    res.json(report);
  } catch (error: any) {
    console.error("Publish report error:", error);
    res.status(400).json({ message: error.message || "Failed to publish report" });
  }
});

/**
 * DELETE /parent-reports/:reportId
 * Delete a report (COACH/ADMIN only)
 */
router.delete("/:reportId", authRequired, requireRole("COACH", "ADMIN"), async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    await deleteReport(reportId);
    res.json({ message: "Report deleted successfully" });
  } catch (error: any) {
    console.error("Delete report error:", error);
    res.status(400).json({ message: error.message || "Failed to delete report" });
  }
});

export default router;


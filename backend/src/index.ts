import express from "express";
import cors from "cors";
import compression from "compression";
import { PORT } from "./config";
import authRoutes from "./auth/auth.routes";
import centersRoutes from "./modules/centers/centers.routes";
import coachesRoutes from "./modules/coaches/coaches.routes";
import studentsRoutes from "./modules/students/students.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import studentDashboardRoutes from "./modules/students/student-dashboard.routes";
import systemRoutes from "./modules/system/system.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import fixturesRoutes from "./modules/fixtures/fixtures.routes";
import eventsRoutes from "./modules/events/events.routes";
import videosRoutes from "./modules/videos/videos.routes";
import postsRoutes from "./modules/posts/posts.routes";
import commentsRoutes from "./modules/posts/comments.routes";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.routes";
import leadsRoutes from "./modules/leads/leads.routes";
import adminRoutes from "./modules/admin/admin.routes";
import crmAuthRoutes from "./modules/crm/crm-auth.routes";
import crmUsersRoutes from "./modules/crm/crm-users.routes";
import crmLeadsRoutes from "./modules/crm/crm-leads.routes";
import crmActivitiesRoutes from "./modules/crm/crm-activities.routes";
import crmTasksRoutes from "./modules/crm/crm-tasks.routes";
import crmImportRoutes from "./modules/crm/crm-import.routes";
import crmSettingsRoutes from "./modules/crm/crm-settings.routes";
import crmAnalyticsRoutes from "./modules/crm/crm-analytics.routes";
import timelineRoutes from "./modules/students/timeline.routes";
import feedbackRoutes from "./modules/students/feedback.routes";
import wellnessRoutes from "./modules/students/wellness.routes";
import matchSelectionRoutes from "./modules/students/match-selection.routes";
import progressRoadmapRoutes from "./modules/students/progress-roadmap.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import playerMetricsRoutes from "./modules/player-metrics/metrics.routes";
import scoutingRoutes from "./modules/scouting/scouting.routes";
import parentReportsRoutes from "./modules/parent-reports/parent-reports.routes";
import seasonPlanningRoutes from "./modules/season-planning/season-planning.routes";
import trialsRoutes from "./modules/trials/trials.routes";
import fanRoutes from "./modules/fan/fan.routes";
import legacyRoutes from "./modules/legacy/legacy.routes";
import footerRoutes from "./modules/footer/footer.routes";
import activityRoutes from "./modules/activity/activity.routes";

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('[ERROR] Unhandled Promise Rejection:', reason);
  // Don't exit - log and continue
});

process.on('uncaughtException', (error: Error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  // Don't exit - log and continue
});

const app = express();
const DEFAULT_CORS_ORIGINS = [
  "https://www.realbengaluru.com",
  "https://realbengaluru.com",
  "https://fcrb-frontend.onrender.com",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
];

const normalizeOrigin = (origin: string) => origin.trim().replace(/\/+$/, "").toLowerCase();
const envCorsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(
  [...DEFAULT_CORS_ORIGINS, ...envCorsOrigins].map(normalizeOrigin)
);

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  (req as any).requestId = requestId;
  
  console.log(`[${requestId}] ${req.method} ${req.path} - Started`);
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Add request timeout middleware to prevent hanging requests
app.use((req, res, next) => {
  const isLoginRequest = req.path === "/auth/login";
  // Set timeout for all requests to 25 seconds (less than client timeout of 30s)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error(`[${(req as any).requestId}] Request timeout after 25s: ${req.method} ${req.path}`);
      if (isLoginRequest) {
        res.status(503).json({
          message: "Login is temporarily unavailable because the database is slow or unreachable. Please try again in a moment.",
        });
      } else {
        res.status(504).json({ message: "Request timeout. The server is taking too long to respond." });
      }
    }
  }, 25000);
  
  // Clear timeout when response is sent
  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
});

// CORS configuration for production and development.
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (curl/postman/server-to-server) with no Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "GET" && req.path === "/fixtures/public") {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  } else if (req.path.startsWith("/auth")) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
});

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "fees-tracker-backend" });
});

app.use("/auth", authRoutes);
app.use("/centers", centersRoutes);
app.use("/coaches", coachesRoutes);
app.use("/students", studentsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/student", studentDashboardRoutes);
app.use("/system", systemRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/fixtures", fixturesRoutes);
app.use("/events", eventsRoutes);
app.use("/videos", videosRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/leads", leadsRoutes);
app.use("/admin", adminRoutes);
// CRM (Sales/BD)
app.use("/crm/auth", crmAuthRoutes);
app.use("/crm/users", crmUsersRoutes);
app.use("/crm/leads", crmLeadsRoutes);
app.use("/crm", crmActivitiesRoutes);
app.use("/crm", crmTasksRoutes);
app.use("/crm", crmImportRoutes);
app.use("/crm/settings", crmSettingsRoutes);
app.use("/crm", crmAnalyticsRoutes);
// Fan Club (RealVerse Fan) — separate mount points for spec compatibility
app.use("/fan", fanRoutes);
app.use("/api/fan", fanRoutes);
app.use("/timeline", timelineRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/wellness", wellnessRoutes);
app.use("/match-selection", matchSelectionRoutes);
app.use("/progress-roadmap", progressRoadmapRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/player-metrics", playerMetricsRoutes);
app.use("/scouting", scoutingRoutes);
app.use("/parent-reports", parentReportsRoutes);
app.use("/trials", trialsRoutes);
app.use("/season-planning", seasonPlanningRoutes);
app.use("/legacy", legacyRoutes);
app.use("/footer", footerRoutes);
app.use("/activity", activityRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
  console.log(`✅ Backend also accessible on http://0.0.0.0:${PORT}`);
}).on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change the PORT in .env`);
  } else {
    console.error(`❌ Failed to start server:`, err);
  }
  process.exit(1);
});

// Migration applied: 20251211053654_add_center_shortname

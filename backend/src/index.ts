import express from "express";
import cors from "cors";
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
import shopRoutes from "./modules/shop/shop.routes";
import adminRoutes from "./modules/admin/admin.routes";
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
import fanAdminRoutes from "./modules/fan/fan-admin.routes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();

// CORS configuration for production
app.use(cors({
  origin: true, // Allow all origins in development/production
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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
app.use("/shop", shopRoutes);
app.use("/admin", adminRoutes);
// Fan Club (RealVerse Fan) — separate mount points for spec compatibility
app.use("/fan", fanRoutes);
app.use("/api/fan", fanRoutes);
app.use("/api/admin/fans", fanAdminRoutes);
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// Seed products on startup (only if products table is empty)
async function initializeShop() {
  try {
    // Check if product table exists and has data
    if (!prisma.product) {
      console.warn("⚠️  Product model not available. Please run: npx prisma generate");
      return;
    }
    
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      const { seedProducts } = await import("./modules/shop/seed-products");
      await seedProducts();
    } else {
      console.log(`✅ Shop initialized with ${productCount} products`);
    }
  } catch (error: any) {
    // Silently handle table not existing - it's optional
    if (error.code === 'P2021' || error.message?.includes('does not exist')) {
      console.warn("⚠️  Product table not found. Run: npx prisma db push");
    } else if (error.code === 'P2010') {
      console.warn("⚠️  Database query failed. Ensure migrations are applied.");
    } else {
      console.error("Failed to initialize shop:", error.message || error);
    }
  }
}

// Seed demo calendar events in development (idempotent)
async function initializeDemoCalendar() {
  try {
    if (process.env.NODE_ENV !== "development") return;
    // If prisma client doesn't have the model yet (missing generate/migrate), skip gracefully.
    if (!(prisma as any).clubEvent) return;
    const count = await (prisma as any).clubEvent.count();
    if (count > 0) return;

    // Find any admin/coach to attribute demo data to.
    const coach = await prisma.coach.findFirst({ where: { role: { in: ["ADMIN", "COACH"] } } });
    if (!coach) return;

    const { seedDemoClubEvents } = await import("./modules/events/seed-demo-events");
    await seedDemoClubEvents({ createdByUserId: coach.id });
    console.log("✅ Seeded demo calendar events (development)");
  } catch (error: any) {
    // Optional feature; never crash server startup.
    console.warn("⚠️  Demo calendar seed skipped:", error?.message || error);
  }
}

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
  console.log(`✅ Backend also accessible on http://0.0.0.0:${PORT}`);
  await initializeShop();
  await initializeDemoCalendar();
}).on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change the PORT in .env`);
  } else {
    console.error(`❌ Failed to start server:`, err);
  }
  process.exit(1);
});

// Migration applied: 20251211053654_add_center_shortname

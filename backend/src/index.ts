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
import videosRoutes from "./modules/videos/videos.routes";
import postsRoutes from "./modules/posts/posts.routes";
import commentsRoutes from "./modules/posts/comments.routes";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.routes";

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
app.use("/videos", videosRoutes);
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/leaderboard", leaderboardRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
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


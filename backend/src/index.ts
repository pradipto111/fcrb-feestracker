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

const app = express();

app.use(cors());
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

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});


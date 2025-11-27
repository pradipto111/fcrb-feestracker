import { Router } from "express";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { getSystemDate, setSystemDate, resetSystemDate, isSystemDateSet } from "../../utils/system-date";

const router = Router();

// Get current system date
router.get("/date", authRequired, (req, res) => {
  res.json({
    systemDate: getSystemDate().toISOString(),
    isCustomDate: isSystemDateSet(),
    actualDate: new Date().toISOString()
  });
});

// Set system date (admin only)
router.post("/date", authRequired, requireRole("ADMIN"), (req, res) => {
  const { date } = req.body;
  
  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  setSystemDate(parsedDate);
  res.json({
    message: "System date updated",
    systemDate: parsedDate.toISOString()
  });
});

// Reset system date to actual current date (admin only)
router.delete("/date", authRequired, requireRole("ADMIN"), (req, res) => {
  resetSystemDate();
  res.json({
    message: "System date reset to actual date",
    systemDate: getSystemDate().toISOString()
  });
});

export default router;


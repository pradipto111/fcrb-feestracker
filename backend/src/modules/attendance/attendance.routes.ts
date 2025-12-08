import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// Helper function to get coach's center IDs
async function getCoachCenterIds(coachId: number): Promise<number[]> {
  const coachCenters = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return coachCenters.map(cc => cc.centerId);
}

// Create a session (Admin or Coach)
router.post("/sessions", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { centerId, sessionDate, startTime, endTime, notes } = req.body;

  if (!centerId || !sessionDate || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Coaches can only create sessions for their assigned centers
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(Number(centerId))) {
      return res.status(403).json({ message: "You don't have access to this center" });
    }
  }

  // Get all active students for this center
  const students = await prisma.student.findMany({
    where: {
      centerId: Number(centerId),
      status: { in: ["ACTIVE", "TRIAL"] }
    }
  });

  // Create session and auto-create attendance records for all students
  const session = await prisma.session.create({
    data: {
      centerId: Number(centerId),
      coachId: id,
      sessionDate: new Date(sessionDate),
      startTime,
      endTime,
      notes: notes || null,
      attendance: {
        create: students.map(student => ({
          studentId: student.id,
          status: "ABSENT", // Default to absent, can be updated later
          notes: null
        }))
      }
    },
    include: {
      center: true,
      coach: true,
      attendance: {
        include: {
          student: true
        }
      }
    }
  });

  res.status(201).json(session);
});

// Create multiple sessions at once (for monthly planning)
router.post("/sessions/bulk", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { centerId, sessions } = req.body; // sessions is an array of { sessionDate, startTime, endTime, notes? }

  if (!centerId || !Array.isArray(sessions) || sessions.length === 0) {
    return res.status(400).json({ message: "Missing required fields: centerId and sessions array" });
  }

  // Coaches can only create sessions for their assigned centers
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(Number(centerId))) {
      return res.status(403).json({ message: "You don't have access to this center" });
    }
  }

  // Get all active students for this center
  const students = await prisma.student.findMany({
    where: {
      centerId: Number(centerId),
      status: { in: ["ACTIVE", "TRIAL"] }
    }
  });

  // Create all sessions with attendance records
  const createdSessions = await Promise.all(
    sessions.map(async ({ sessionDate, startTime, endTime, notes }: any) => {
      if (!sessionDate || !startTime || !endTime) {
        throw new Error("Each session must have sessionDate, startTime, and endTime");
      }

      return await prisma.session.create({
        data: {
          centerId: Number(centerId),
          coachId: id,
          sessionDate: new Date(sessionDate),
          startTime,
          endTime,
          notes: notes || null,
          attendance: {
            create: students.map(student => ({
              studentId: student.id,
              status: "ABSENT", // Default to absent
              notes: null
            }))
          }
        },
        include: {
          center: true,
          coach: true,
          attendance: {
            include: {
              student: true
            }
          }
        }
      });
    })
  );

  res.status(201).json({
    message: `Successfully created ${createdSessions.length} sessions`,
    sessions: createdSessions
  });
});

// Get sessions for a center (filtered by month)
router.get("/sessions", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { centerId, month, year } = req.query;

  let centerIds: number[] = [];

  if (role === "ADMIN") {
    // Admin can see all centers
    if (centerId) {
      centerIds = [Number(centerId)];
    } else {
      const allCenters = await prisma.center.findMany({ select: { id: true } });
      centerIds = allCenters.map(c => c.id);
    }
  } else if (role === "COACH") {
    // Coach can only see their assigned centers
    centerIds = await getCoachCenterIds(id);
    if (centerId && !centerIds.includes(Number(centerId))) {
      return res.status(403).json({ message: "You don't have access to this center" });
    }
    if (centerId) {
      centerIds = [Number(centerId)];
    }
  } else {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Build date filter
  const where: any = { centerId: { in: centerIds } };
  
  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    // Get last day of the month
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    where.sessionDate = {
      gte: startDate,
      lte: endDate
    };
  }

  const sessions = await prisma.session.findMany({
    where,
    include: {
      center: true,
      coach: true,
      attendance: {
        include: {
          student: true
        }
      }
    },
    orderBy: {
      sessionDate: "asc"
    }
  });

  res.json(sessions);
});

// Get a specific session
router.get("/sessions/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.id);

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      center: true,
      coach: true,
      attendance: {
        include: {
          student: true
        }
      }
    }
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Check access
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(session.centerId)) {
      return res.status(403).json({ message: "You don't have access to this session" });
    }
  }

  res.json(session);
});

// Update a session
router.put("/sessions/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.id);
  const { sessionDate, startTime, endTime, notes } = req.body;

  const existingSession = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!existingSession) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Check access - only the coach who created it or admin can update
  if (role === "COACH" && existingSession.coachId !== id) {
    return res.status(403).json({ message: "You can only update your own sessions" });
  }

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: {
      sessionDate: sessionDate ? new Date(sessionDate) : undefined,
      startTime,
      endTime,
      notes
    },
    include: {
      center: true,
      coach: true
    }
  });

  res.json(session);
});

// Delete a session
router.delete("/sessions/:id", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.id);

  const existingSession = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!existingSession) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Check access - only the coach who created it or admin can delete
  if (role === "COACH" && existingSession.coachId !== id) {
    return res.status(403).json({ message: "You can only delete your own sessions" });
  }

  await prisma.session.delete({
    where: { id: sessionId }
  });

  res.json({ message: "Session deleted" });
});

// Mark attendance for a session
router.post("/sessions/:sessionId/attendance", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.sessionId);
  const { studentId, status, notes } = req.body;

  if (!studentId || !status) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { center: true }
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Check access
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(session.centerId)) {
      return res.status(403).json({ message: "You don't have access to this session" });
    }
  }

  // Verify student belongs to the center
  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) }
  });

  if (!student || student.centerId !== session.centerId) {
    return res.status(400).json({ message: "Student does not belong to this center" });
  }

  // Upsert attendance
  const attendance = await prisma.attendance.upsert({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId: Number(studentId)
      }
    },
    update: {
      status,
      notes: notes || null
    },
    create: {
      sessionId,
      studentId: Number(studentId),
      status,
      notes: notes || null
    },
    include: {
      student: true,
      session: {
        include: {
          center: true
        }
      }
    }
  });

  res.json(attendance);
});

// Bulk mark attendance for a session
router.post("/sessions/:sessionId/attendance/bulk", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.sessionId);
  const { attendanceList } = req.body; // Array of { studentId, status, notes? }

  if (!Array.isArray(attendanceList)) {
    return res.status(400).json({ message: "attendanceList must be an array" });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { center: true }
  });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // Check access
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(session.centerId)) {
      return res.status(403).json({ message: "You don't have access to this session" });
    }
  }

  // Process all attendance records
  const results = await Promise.all(
    attendanceList.map(async ({ studentId, status, notes }: any) => {
      const student = await prisma.student.findUnique({
        where: { id: Number(studentId) }
      });

      if (!student || student.centerId !== session.centerId) {
        return { studentId, error: "Student does not belong to this center" };
      }

      try {
        const attendance = await prisma.attendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: Number(studentId)
            }
          },
          update: {
            status,
            notes: notes || null
          },
          create: {
            sessionId,
            studentId: Number(studentId),
            status,
            notes: notes || null
          },
          include: {
            student: true
          }
        });
        return attendance;
      } catch (error) {
        return { studentId, error: "Failed to update attendance" };
      }
    })
  );

  res.json({ results });
});

// Get student's attendance (for students)
router.get("/student/attendance", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;
  const { month, year } = req.query;

  const student = await prisma.student.findUnique({
    where: { id }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Build date filter
  const where: any = {
    session: {
      centerId: student.centerId
    },
    studentId: id
  };

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    where.session = {
      ...where.session,
      sessionDate: {
        gte: startDate,
        lte: endDate
      }
    };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      session: {
        include: {
          center: true,
          coach: true
        }
      }
    },
    orderBy: {
      session: {
        sessionDate: "asc"
      }
    }
  });

  // Also get all sessions for the month (even if attendance not marked)
  const sessionWhere: any = {
    centerId: student.centerId
  };

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    sessionWhere.sessionDate = {
      gte: startDate,
      lte: endDate
    };
  }

  const allSessions = await prisma.session.findMany({
    where: sessionWhere,
    include: {
      center: true,
      coach: true,
      attendance: {
        where: { studentId: id }
      }
    },
    orderBy: {
      sessionDate: "asc"
    }
  });

  // Combine sessions with attendance status
  const sessionsWithAttendance = allSessions.map(session => {
    const attendanceRecord = session.attendance[0];
    return {
      ...session,
      attendanceStatus: attendanceRecord ? attendanceRecord.status : "NOT_MARKED",
      attendanceNotes: attendanceRecord?.notes || null,
      attendanceId: attendanceRecord?.id || null
    };
  });

  res.json({
    sessions: sessionsWithAttendance,
    attendanceRecords: attendance
  });
});

export default router;


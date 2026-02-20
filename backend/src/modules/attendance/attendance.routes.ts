import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

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
  const { centerId, title, description, programmeId, sessionDate, startTime, endTime, notes } = req.body;

  if (!centerId || !title || !sessionDate || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required fields: centerId, title, sessionDate, startTime, endTime" });
  }

  // Coaches can only create sessions for their assigned centers
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (!coachCenterIds.includes(Number(centerId))) {
      return res.status(403).json({ message: "You don't have access to this center" });
    }
  }

  // Check for overlapping sessions for the same coach
  const sessionDateObj = new Date(sessionDate);
  const overlappingSession = await prisma.session.findFirst({
    where: {
      coachId: id,
      sessionDate: sessionDateObj,
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } }
          ]
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } }
          ]
        },
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } }
          ]
        }
      ]
    }
  });

  if (overlappingSession) {
    return res.status(400).json({ message: "You already have a session scheduled at this time" });
  }

  // Get all active students for this center
  const students = await prisma.student.findMany({
    where: {
      centerId: Number(centerId),
      status: { in: ["ACTIVE", "TRIAL"] }
    }
  });

  // Create session with auto-populated participants (NO attendance records)
  const session = await prisma.session.create({
    data: {
      centerId: Number(centerId),
      coachId: id,
      title,
      description: description || null,
      programmeId: programmeId || null,
      sessionDate: sessionDateObj,
      startTime,
      endTime,
      notes: notes || null,
      participants: {
        create: students.map(student => ({
          studentId: student.id
        }))
      }
    },
    include: {
      center: true,
      coach: true,
      participants: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true
            }
          }
        }
      }
    }
  });

  res.status(201).json(session);
});

// Create multiple sessions at once (for monthly planning)
router.post("/sessions/bulk", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { centerId, sessions } = req.body; // sessions is an array of { title, description?, programmeId?, sessionDate, startTime, endTime, notes? }

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

  // Create all sessions with participants (NO attendance records)
  const createdSessions = await Promise.all(
    sessions.map(async ({ title, description, programmeId, sessionDate, startTime, endTime, notes }: any) => {
      if (!title || !sessionDate || !startTime || !endTime) {
        throw new Error("Each session must have title, sessionDate, startTime, and endTime");
      }

      return await prisma.session.create({
        data: {
          centerId: Number(centerId),
          coachId: id,
          title,
          description: description || null,
          programmeId: programmeId || null,
          sessionDate: new Date(sessionDate),
          startTime,
          endTime,
          notes: notes || null,
          participants: {
            create: students.map(student => ({
              studentId: student.id
            }))
          }
        },
        include: {
          center: true,
          coach: true,
          participants: {
            include: {
              student: {
                select: {
                  id: true,
                  fullName: true,
                  status: true
                }
              }
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
      participants: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true
            }
          }
        }
      },
      attendance: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true
            }
          },
          markedByCoach: {
            select: {
              id: true,
              fullName: true
            }
          }
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
      participants: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true
            }
          }
        }
      },
      attendance: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true
            }
          },
          markedByCoach: {
            select: {
              id: true,
              fullName: true
            }
          }
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
  const { title, description, programmeId, sessionDate, startTime, endTime, notes } = req.body;

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

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (programmeId !== undefined) updateData.programmeId = programmeId;
  if (sessionDate !== undefined) updateData.sessionDate = new Date(sessionDate);
  if (startTime !== undefined) updateData.startTime = startTime;
  if (endTime !== undefined) updateData.endTime = endTime;
  if (notes !== undefined) updateData.notes = notes;

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: updateData,
    include: {
      center: true,
      coach: true,
      participants: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true
            }
          }
        }
      }
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
    return res.status(400).json({ message: "Missing required fields: studentId and status" });
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { 
      center: true,
      participants: {
        where: { studentId: Number(studentId) }
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

  // Verify student is a participant
  if (session.participants.length === 0) {
    return res.status(400).json({ message: "Student is not a participant in this session" });
  }

  // Verify student belongs to the center
  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) }
  });

  if (!student || student.centerId !== session.centerId) {
    return res.status(400).json({ message: "Student does not belong to this center" });
  }

  // Check if attendance can be marked (on session day or up to 7 days after)
  const sessionDate = new Date(session.sessionDate);
  sessionDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    return res.status(400).json({ message: "Cannot mark attendance for future sessions" });
  }
  
  if (daysDiff > 7) {
    return res.status(400).json({ message: "Attendance can only be marked within 7 days of the session" });
  }

  // Upsert attendance with markedBy and markedAt tracking
  const attendance = await prisma.attendance.upsert({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId: Number(studentId)
      }
    },
    update: {
      status,
      notes: notes || null,
      markedBy: id,
      markedAt: new Date()
    },
    create: {
      sessionId,
      studentId: Number(studentId),
      status,
      notes: notes || null,
      markedBy: id,
      markedAt: new Date()
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          status: true
        }
      },
      markedByCoach: {
        select: {
          id: true,
          fullName: true
        }
      },
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

      // Verify student is a participant
      const participant = await prisma.sessionParticipant.findUnique({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: Number(studentId)
          }
        }
      });

      if (!participant) {
        return { studentId, error: "Student is not a participant in this session" };
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
            notes: notes || null,
            markedBy: id,
            markedAt: new Date()
          },
          create: {
            sessionId,
            studentId: Number(studentId),
            status,
            notes: notes || null,
            markedBy: id,
            markedAt: new Date()
          },
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                status: true
              }
            },
            markedByCoach: {
              select: {
                id: true,
                fullName: true
              }
            }
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

// Get student's attendance (for students) - Only sessions where student is a participant
router.get("/student/attendance", authRequired, requireRole("STUDENT"), async (req, res) => {
  const { id } = req.user!;
  const { month, year } = req.query;

  const student = await prisma.student.findUnique({
    where: { id }
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Build date filter for sessions where student is a participant
  const sessionWhere: any = {
    participants: {
      some: {
        studentId: id
      }
    }
  };

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    sessionWhere.sessionDate = {
      gte: startDate,
      lte: endDate
    };
  }

  const sessions = await prisma.session.findMany({
    where: sessionWhere,
    include: {
      center: true,
      coach: true,
      attendance: {
        where: { studentId: id },
        include: {
          markedByCoach: {
            select: {
              id: true,
              fullName: true
            }
          }
        }
      }
    },
    orderBy: {
      sessionDate: "asc"
    }
  });

  // Combine sessions with attendance status
  const sessionsWithAttendance = sessions.map((session: any) => {
    const attendanceRecord = session.attendance[0];
    return {
      ...session,
      attendanceStatus: attendanceRecord ? attendanceRecord.status : "PENDING",
      attendanceNotes: attendanceRecord?.notes || null,
      attendanceId: attendanceRecord?.id || null,
      markedBy: attendanceRecord?.markedByCoach || null,
      markedAt: attendanceRecord?.markedAt || null
    };
  });

  res.json({
    sessions: sessionsWithAttendance,
    attendanceRecords: sessions.flatMap(s => s.attendance)
  });
});

// Get session participants
router.get("/sessions/:sessionId/participants", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.sessionId);

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

  const participants = await prisma.sessionParticipant.findMany({
    where: { sessionId },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          programType: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  res.json(participants);
});

// Add participant to session
router.post("/sessions/:sessionId/participants", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.sessionId);
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Missing required field: studentId" });
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

  // Verify student belongs to the same center
  const student = await prisma.student.findUnique({
    where: { id: Number(studentId) }
  });

  if (!student || student.centerId !== session.centerId) {
    return res.status(400).json({ message: "Student does not belong to this center" });
  }

  // Check if already a participant
  const existing = await prisma.sessionParticipant.findUnique({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId: Number(studentId)
      }
    }
  });

  if (existing) {
    return res.status(400).json({ message: "Student is already a participant" });
  }

  const participant = await prisma.sessionParticipant.create({
    data: {
      sessionId,
      studentId: Number(studentId)
    },
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          programType: true
        }
      }
    }
  });

  res.status(201).json(participant);
});

// Remove participant from session
router.delete("/sessions/:sessionId/participants/:studentId", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const sessionId = Number(req.params.sessionId);
  const studentId = Number(req.params.studentId);

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

  // Delete attendance record if exists
  await prisma.attendance.deleteMany({
    where: {
      sessionId,
      studentId
    }
  });

  // Delete participant
  await prisma.sessionParticipant.delete({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId
      }
    }
  });

  res.json({ message: "Participant removed successfully" });
});

// Get attendance analytics for a centre
router.get("/analytics", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { centreId, month, year } = req.query;

  // Build filters
  let centerFilter: any = {};
  
  if (role === "COACH") {
    const coachCenterIds = await getCoachCenterIds(id);
    if (centreId) {
      if (!coachCenterIds.includes(Number(centreId))) {
        return res.status(403).json({ message: "You don't have access to this center" });
      }
      centerFilter = { id: Number(centreId) };
    } else {
      centerFilter = { id: { in: coachCenterIds } };
    }
  } else if (centreId) {
    centerFilter = { id: Number(centreId) };
  }

  // Build date filter
  const sessionWhere: any = centerFilter.id ? { centerId: centerFilter.id } : {};
  
  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
    sessionWhere.sessionDate = {
      gte: startDate,
      lte: endDate
    };
  }

  try {
    // Get all sessions with attendance
    const sessions = await prisma.session.findMany({
      where: sessionWhere,
      include: {
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                programType: true,
                status: true
              }
            }
          }
        },
        center: true
      }
    });

    // Get all students for the center(s)
    const students = await prisma.student.findMany({
      where: centerFilter.id 
        ? { centerId: centerFilter.id }
        : centerFilter.id?.in 
          ? { centerId: { in: centerFilter.id.in } }
          : {}
    });

    // Calculate overall metrics
    const totalSessions = sessions.length;
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === "ACTIVE").length;
    
    // Calculate attendance metrics
    const allAttendanceRecords = sessions.flatMap(s => s.attendance);
    const totalAttendanceRecords = allAttendanceRecords.length;
    const presentRecords = allAttendanceRecords.filter(a => a.status === "PRESENT").length;
    const absentRecords = allAttendanceRecords.filter(a => a.status === "ABSENT").length;
    const excusedRecords = allAttendanceRecords.filter(a => a.status === "EXCUSED").length;
    
    const attendanceRate = totalAttendanceRecords > 0 
      ? Math.round((presentRecords / totalAttendanceRecords) * 100) 
      : 0;

    // Calculate per-student attendance
    const studentAttendance = students.map(student => {
      const studentRecords = allAttendanceRecords.filter(a => a.studentId === student.id);
      const studentPresent = studentRecords.filter(a => a.status === "PRESENT").length;
      const studentAbsent = studentRecords.filter(a => a.status === "ABSENT").length;
      const studentExcused = studentRecords.filter(a => a.status === "EXCUSED").length;
      const studentTotal = studentRecords.length;
      const studentRate = studentTotal > 0 
        ? Math.round((studentPresent / studentTotal) * 100) 
        : 0;

      return {
        studentId: student.id,
        studentName: student.fullName,
        programType: student.programType,
        status: student.status,
        totalSessions: studentTotal,
        present: studentPresent,
        absent: studentAbsent,
        excused: studentExcused,
        attendanceRate: studentRate
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);

    // Calculate attendance trends (by week or month)
    const attendanceByDate: Record<string, { date: string; present: number; absent: number; excused: number; total: number; rate: number }> = {};
    
    sessions.forEach(session => {
      const dateKey = new Date(session.sessionDate).toISOString().split('T')[0];
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = {
          date: dateKey,
          present: 0,
          absent: 0,
          excused: 0,
          total: 0,
          rate: 0
        };
      }
      
      session.attendance.forEach(att => {
        attendanceByDate[dateKey].total += 1;
        if (att.status === "PRESENT") attendanceByDate[dateKey].present += 1;
        if (att.status === "ABSENT") attendanceByDate[dateKey].absent += 1;
        if (att.status === "EXCUSED") attendanceByDate[dateKey].excused += 1;
      });
    });

    // Calculate rate for each date
    Object.values(attendanceByDate).forEach(day => {
      day.rate = day.total > 0 ? Math.round((day.present / day.total) * 100) : 0;
    });

    const attendanceTrend = Object.values(attendanceByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Program-wise breakdown
    const programBreakdown: Record<string, { 
      program: string; 
      students: number; 
      totalRecords: number; 
      present: number; 
      absent: number; 
      excused: number; 
      rate: number;
    }> = {};

    students.forEach(student => {
      const program = student.programType || "No Program";
      if (!programBreakdown[program]) {
        programBreakdown[program] = {
          program,
          students: 0,
          totalRecords: 0,
          present: 0,
          absent: 0,
          excused: 0,
          rate: 0
        };
      }
      programBreakdown[program].students += 1;
    });

    allAttendanceRecords.forEach(record => {
      const program = record.student.programType || "No Program";
      if (programBreakdown[program]) {
        programBreakdown[program].totalRecords += 1;
        if (record.status === "PRESENT") programBreakdown[program].present += 1;
        if (record.status === "ABSENT") programBreakdown[program].absent += 1;
        if (record.status === "EXCUSED") programBreakdown[program].excused += 1;
      }
    });

    Object.values(programBreakdown).forEach(prog => {
      prog.rate = prog.totalRecords > 0 
        ? Math.round((prog.present / prog.totalRecords) * 100) 
        : 0;
    });

    res.json({
      summary: {
        totalSessions,
        totalStudents,
        activeStudents,
        totalAttendanceRecords,
        presentRecords,
        absentRecords,
        excusedRecords,
        attendanceRate
      },
      studentAttendance: studentAttendance.slice(0, 20), // Top 20 students
      allStudentAttendance: studentAttendance, // All students for detailed view
      attendanceTrend,
      programBreakdown: Object.values(programBreakdown)
    });
  } catch (error: any) {
    console.error("Error fetching attendance analytics:", error);
    res.status(500).json({ message: error.message || "Failed to fetch attendance analytics" });
  }
});

export default router;


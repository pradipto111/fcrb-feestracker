import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired } from "../../auth/auth.middleware";
import bcrypt from "bcryptjs";
import { getSystemDate } from "../../utils/system-date";

const prisma = new PrismaClient();
const router = Router();

/**
 * Helper to get coach's center IDs
 */
async function getCoachCenterIds(coachId: number) {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return links.map((l) => l.centerId);
}

// Admin: list all students with filters
router.get("/", authRequired, async (req, res) => {
  const { role, id } = req.user!;
  const { q, centerId, includePayments } = req.query as { q?: string; centerId?: string; includePayments?: string };

  const where: any = {};
  if (q) {
    where.fullName = { contains: q, mode: "insensitive" };
  }
  if (centerId) {
    where.centerId = Number(centerId);
  }

  // If coach, limit to their centers
  if (role === "COACH") {
    const centerIds = await getCoachCenterIds(id);
    where.centerId = { in: centerIds };
  }

  const students = await prisma.student.findMany({
    where,
    orderBy: { fullName: "asc" }
  });

  // If includePayments is true, add payment summaries
  if (includePayments === "true") {
    const studentIds = students.map(s => s.id);
    const allPayments = await prisma.payment.findMany({
      where: { studentId: { in: studentIds } }
    });

    // Group payments by student
    const paymentsByStudent: { [key: number]: number } = {};
    allPayments.forEach(p => {
      paymentsByStudent[p.studentId] = (paymentsByStudent[p.studentId] || 0) + p.amount;
    });

    // Add payment summaries to students
    const now = getSystemDate();
    const studentsWithPayments = students.map(student => {
      const totalPaid = paymentsByStudent[student.id] || 0;
      
      // Calculate outstanding
      let outstanding = 0;
      if (student.joiningDate) {
        const joining = new Date(student.joiningDate);
        const endDate = (student as any).churnedDate ? new Date((student as any).churnedDate) : now;
        const monthsElapsed = Math.max(
          1,
          (endDate.getFullYear() - joining.getFullYear()) * 12 + 
          (endDate.getMonth() - joining.getMonth()) + 1
        );
        const paymentFrequency = student.paymentFrequency || 1;
        const cyclesCompleted = Math.floor(monthsElapsed / paymentFrequency);
        const expectedAmount = cyclesCompleted * (student.monthlyFeeAmount * paymentFrequency);
        outstanding = Math.max(0, expectedAmount - totalPaid);
      }

      return {
        ...student,
        totalPaid,
        outstanding
      };
    });

    return res.json(studentsWithPayments);
  }

  res.json(students);
});

// Admin: create student
router.post("/", authRequired, async (req, res) => {
  const { role } = req.user!;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const { password, ...data } = req.body;
  
  // Convert empty email to null to avoid unique constraint issues
  if (data.email === "" || data.email === undefined) {
    data.email = null;
  }
  
  // Hash password if provided, otherwise use default "Name"123
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  } else if (data.fullName) {
    // Set default password as "Name"123 if no password provided
    const defaultPassword = `${data.fullName}123`;
    data.passwordHash = await bcrypt.hash(defaultPassword, 10);
  }
  
  try {
    const student = await prisma.student.create({ data });
    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "A student with this email already exists" });
    }
    throw error;
  }
});

// Admin: update student
router.put("/:id", authRequired, async (req, res) => {
  const { role } = req.user!;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const studentId = Number(req.params.id);
  const { password, ...data } = req.body;
  
  // Convert empty email to null to avoid unique constraint issues
  if (data.email === "" || data.email === undefined) {
    data.email = null;
  }
  
  // Hash password if provided
  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  
  try {
    // Handle churnedDate conversion
    if (data.churnedDate !== undefined) {
      if (data.churnedDate === null || data.churnedDate === "") {
        data.churnedDate = null;
      } else if (typeof data.churnedDate === 'string') {
        data.churnedDate = new Date(data.churnedDate);
      }
    }
    
    const student = await prisma.student.update({
      where: { id: studentId },
      data
    });
    res.json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "A student with this email already exists" });
    }
    throw error;
  }
});

// Admin: delete student and all related data
router.delete("/:id", authRequired, async (req, res) => {
  const { role } = req.user!;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }
  const studentId = Number(req.params.id);
  
  try {
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete all related data in the correct order (respecting foreign key constraints)
    // Delete in reverse order of dependencies
    
    // Delete club event players
    await (prisma as any).clubEventPlayer?.deleteMany({
      where: { studentId }
    }).catch(() => {}); // Ignore if model doesn't exist

    // Delete weekly loads
    await (prisma as any).playerWeeklyLoad?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete parent reports
    await (prisma as any).parentDevelopmentReport?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete scouting decisions
    await (prisma as any).scoutingDecisionLog?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete scouting board players
    await (prisma as any).scoutingBoardPlayer?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete coach notes
    await (prisma as any).playerCoachNote?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete metric audit logs
    await (prisma as any).playerMetricAuditLog?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete metric snapshots
    await (prisma as any).playerMetricSnapshot?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete progress roadmap
    await (prisma as any).progressRoadmap?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete wellness checks
    await (prisma as any).wellnessCheck?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete monthly feedbacks
    await (prisma as any).monthlyFeedback?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete timeline events
    await (prisma as any).timelineEvent?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete student stats
    await (prisma as any).studentStats?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete fixture players
    await (prisma as any).fixturePlayer?.deleteMany({
      where: { studentId }
    }).catch(() => {});

    // Delete attendance records
    await prisma.attendance.deleteMany({
      where: { studentId }
    });

    // Delete payments
    await prisma.payment.deleteMany({
      where: { studentId }
    });

    // Finally, delete the student
    await prisma.student.delete({
      where: { id: studentId }
    });

    res.json({ message: "Student and all related data deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: error.message || "Failed to delete student" });
  }
});

// Get single student (coach scoped)
router.get("/:id", authRequired, async (req, res) => {
  const { id: userId, role } = req.user!;
  const studentId = Number(req.params.id);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { center: true }
  });

  if (!student) return res.status(404).json({ message: "Not found" });

  if (role === "COACH") {
    const centerIds = await getCoachCenterIds(userId);
    if (!centerIds.includes(student.centerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  // Wallet-based payment system
  const payments = await prisma.payment.findMany({
    where: { studentId: student.id },
    orderBy: { paymentDate: "desc" }
  });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // Calculate fees accrued so far
  let feesAccrued = 0;
  if (student.joiningDate) {
    const now = getSystemDate();
    const joining = new Date(student.joiningDate);
    const paymentFrequency = student.paymentFrequency || 1;
    const feePerCycle = student.monthlyFeeAmount * paymentFrequency;
    
    // If student is churned, only calculate fees up to churn date
    const endDate = student.churnedDate ? new Date(student.churnedDate) : now;
    
    // Calculate months since joining up to churn date (or current date)
    // Fee is due at the START of each cycle, not at the end
    const monthsElapsed = Math.max(
      1, // At least 1 month (the joining month itself incurs fees)
      (endDate.getFullYear() - joining.getFullYear()) * 12 + 
      (endDate.getMonth() - joining.getMonth()) + 1 // +1 to include the churn month
    );
    
    // Calculate payment cycles that have passed up to churn date
    const cyclesAccrued = Math.ceil(monthsElapsed / paymentFrequency);
    
    // Fees accrued for all cycles up to churn date (or current date)
    feesAccrued = cyclesAccrued * feePerCycle;
  }
  
  // Wallet balance = total paid - fees accrued
  const walletBalance = totalPaid - feesAccrued;
  const outstanding = walletBalance < 0 ? Math.abs(walletBalance) : 0;
  const creditBalance = walletBalance > 0 ? walletBalance : 0;

  res.json({ 
    student, 
    payments, 
    totalPaid, 
    outstanding,
    walletBalance,
    creditBalance,
    feesAccrued
  });
});

/**
 * Helper function to generate email from name
 */
function generateEmail(fullName: string, existingEmails: Set<string>): string {
  // Convert name to email-friendly format
  const nameParts = fullName.toLowerCase().trim().split(/\s+/);
  let baseEmail = nameParts.join('.');
  
  // Remove special characters
  baseEmail = baseEmail.replace(/[^a-z0-9.]/g, '');
  
  // If email already exists, add a number
  let email = `${baseEmail}@realverse.com`;
  let counter = 1;
  while (existingEmails.has(email)) {
    email = `${baseEmail}${counter}@realverse.com`;
    counter++;
  }
  
  existingEmails.add(email);
  return email;
}

/**
 * Helper function to generate a dummy password
 */
function generatePassword(): string {
  // Generate a simple password: Student@123 + random 3 digits
  const random = Math.floor(100 + Math.random() * 900);
  return `Student@${random}`;
}

/**
 * Map center name to program type
 */
function mapCenterToProgramType(centerName: string): string {
  const normalized = centerName.toLowerCase().trim();
  if (normalized.includes('depot18')) return 'SCP';
  if (normalized.includes('trilok')) return 'EPP';
  if (normalized.includes('blitzz')) return 'FYDP';
  return 'SCP'; // Default
}

/**
 * Map subscription status to student status
 */
function mapStatus(status: string): "ACTIVE" | "INACTIVE" | "TRIAL" {
  const normalized = status.toLowerCase().trim();
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'churned') return 'INACTIVE';
  if (normalized === 'paused') return 'INACTIVE';
  return 'ACTIVE';
}

// Admin: bulk import students with payments
router.post("/bulk-import", authRequired, async (req, res) => {
  const { role } = req.user!;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { students: studentsData } = req.body as {
    students: Array<{
      name: string;
      phone?: string;
      centerName: string;
      subscriptionStatus?: string;
      monthlyFee?: number;
      startDate?: string;
      payments?: Array<{
        month: string; // "April", "May", etc.
        year: number; // 2025, 2026, etc.
        amount: number;
      }>;
      comments?: string;
    }>;
  };

  if (!Array.isArray(studentsData) || studentsData.length === 0) {
    return res.status(400).json({ message: "Students array is required" });
  }

  try {
    // Get all centers to map names to IDs
    const centers = await prisma.center.findMany();
    const centerMap = new Map<string, number>();
    centers.forEach(c => {
      const name = c.name.toLowerCase().trim();
      centerMap.set(name, c.id);
      if (c.shortName) {
        centerMap.set(c.shortName.toLowerCase().trim(), c.id);
      }
    });

    // Track existing emails to avoid duplicates
    const existingEmails = new Set<string>();
    const existingStudents = await prisma.student.findMany({
      where: { email: { not: null } },
      select: { email: true }
    });
    existingStudents.forEach(s => {
      if (s.email) existingEmails.add(s.email);
    });

    const results = [];
    const errors = [];

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      
      try {
        // Find center ID
        const centerName = studentData.centerName.toLowerCase().trim();
        let centerId: number | undefined;
        
        // Try to find center by name or shortName
        for (const [key, id] of centerMap.entries()) {
          if (centerName.includes(key) || key.includes(centerName)) {
            centerId = id;
            break;
          }
        }

        // If not found, try to match by common patterns
        if (!centerId) {
          if (centerName.includes('depot') || centerName.includes('18')) {
            const depot = centers.find(c => c.name.toLowerCase().includes('depot') || c.shortName?.toLowerCase().includes('depot'));
            centerId = depot?.id;
          } else if (centerName.includes('trilok') || centerName.includes('3lok')) {
            const trilok = centers.find(c => c.name.toLowerCase().includes('trilok') || c.name.toLowerCase().includes('3lok') || c.shortName?.toLowerCase().includes('3lok'));
            centerId = trilok?.id;
          } else if (centerName.includes('blitzz')) {
            const blitzz = centers.find(c => c.name.toLowerCase().includes('blitzz'));
            centerId = blitzz?.id;
          }
        }

        if (!centerId) {
          errors.push({
            index: i,
            name: studentData.name,
            error: `Center not found: ${studentData.centerName}`
          });
          continue;
        }

        // Generate email and password
        const email = generateEmail(studentData.name, existingEmails);
        // Use default password format: "Name"123
        const password = `${studentData.name}123`;
        const passwordHash = await bcrypt.hash(password, 10);

        // Map program type
        const programType = mapCenterToProgramType(studentData.centerName);
        
        // Parse start date
        let joiningDate: Date | undefined;
        if (studentData.startDate) {
          // Try to parse date in various formats
          const dateStr = studentData.startDate;
          // Handle DD/MM/YYYY or MM/DD/YYYY
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Assume DD/MM/YYYY
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parseInt(parts[2]);
            joiningDate = new Date(year, month, day);
          } else {
            joiningDate = new Date(dateStr);
          }
        }

        // Create student
        const student = await prisma.student.create({
          data: {
            fullName: studentData.name.trim(),
            phoneNumber: studentData.phone || null,
            email,
            passwordHash,
            centerId,
            joiningDate: joiningDate || getSystemDate(),
            programType,
            monthlyFeeAmount: studentData.monthlyFee ? Math.round(studentData.monthlyFee) : 0,
            paymentFrequency: 1,
            status: mapStatus(studentData.subscriptionStatus || 'ACTIVE')
          }
        });

        // Create payments
        const paymentResults = [];
        if (studentData.payments && Array.isArray(studentData.payments)) {
          for (const paymentData of studentData.payments) {
            if (!paymentData.amount || paymentData.amount <= 0) continue;

            // Map month name to month number
            const monthMap: Record<string, number> = {
              'january': 0, 'february': 1, 'march': 2, 'april': 3,
              'may': 4, 'june': 5, 'july': 6, 'august': 7,
              'september': 8, 'october': 9, 'november': 10, 'december': 11
            };
            
            const monthName = paymentData.month.toLowerCase().trim();
            const month = monthMap[monthName];
            
            if (month === undefined) {
              console.warn(`Invalid month: ${paymentData.month}`);
              continue;
            }

            const paymentDate = new Date(paymentData.year, month, 1); // First day of the month

            try {
              const payment = await prisma.payment.create({
                data: {
                  studentId: student.id,
                  centerId: student.centerId,
                  amount: Math.round(paymentData.amount),
                  paymentDate,
                  paymentMode: 'cash', // Default, can be updated later
                  notes: studentData.comments || null
                }
              });
              paymentResults.push(payment);
            } catch (paymentError: any) {
              console.error(`Error creating payment for ${studentData.name}:`, paymentError);
            }
          }
        }

        results.push({
          student: {
            id: student.id,
            name: student.fullName,
            email,
            password, // Return plain password for admin to see
            centerId: student.centerId,
            programType: student.programType
          },
          paymentsCreated: paymentResults.length
        });

      } catch (error: any) {
        errors.push({
          index: i,
          name: studentData.name,
          error: error.message || 'Unknown error'
        });
        console.error(`Error importing student ${studentData.name}:`, error);
      }
    }

    res.json({
      success: true,
      imported: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error: any) {
    console.error("Bulk import error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to import students",
      error: error.toString()
    });
  }
});

/**
 * POST /students/bulk-update-payments
 * Admin: Bulk update student payments from spreadsheet data
 * This endpoint allows updating payments, status, and churned dates for multiple students
 */
router.post("/bulk-update-payments", authRequired, async (req, res) => {
  const { role } = req.user!;
  if (role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { students: studentsData } = req.body as {
    students: Array<{
      name: string;
      phone?: string;
      subscriptionStatus: "Active" | "Paused" | "Churned";
      monthlyFee?: number;
      startDate?: string; // DD/MM/YYYY format
      payments: Array<{
        month: string; // "April", "May", etc.
        year: number; // 2025 or 2026
        amount: number;
      }>;
      comments?: string;
    }>;
  };

  if (!Array.isArray(studentsData) || studentsData.length === 0) {
    return res.status(400).json({ message: "Students array is required" });
  }

  const results: Array<{
    studentName: string;
    success: boolean;
    reason?: string;
    paymentsCreated?: number;
    paymentsDeleted?: number;
  }> = [];

  // Helper function to find student
  const findStudent = async (name: string, phone?: string) => {
    const nameTrimmed = name.trim();
    if (phone && phone.trim()) {
      const byPhone = await prisma.student.findFirst({
        where: {
          fullName: { equals: nameTrimmed, mode: 'insensitive' },
          phoneNumber: phone.trim()
        }
      });
      if (byPhone) return byPhone;
    }
    return await prisma.student.findFirst({
      where: {
        fullName: { equals: nameTrimmed, mode: 'insensitive' }
      }
    });
  };

  // Helper to get month number (0-indexed)
  const getMonthNumber = (monthName: string): number => {
    const months: { [key: string]: number } = {
      'january': 0, 'february': 1, 'march': 2,
      'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8,
      'october': 9, 'november': 10, 'december': 11,
    };
    return months[monthName.toLowerCase()] ?? -1;
  };

  // Helper to parse date
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Helper to map status
  const mapStatus = (status: string): "ACTIVE" | "INACTIVE" | "TRIAL" => {
    const normalized = status.toLowerCase().trim();
    if (normalized === 'active') return 'ACTIVE';
    if (normalized === 'churned' || normalized === 'paused') return 'INACTIVE';
    return 'ACTIVE';
  };

  for (const studentData of studentsData) {
    try {
      const student = await findStudent(studentData.name, studentData.phone);
      
      if (!student) {
        results.push({
          studentName: studentData.name,
          success: false,
          reason: "Student not found"
        });
        continue;
      }

      // Delete all existing payments
      const deleted = await prisma.payment.deleteMany({
        where: { studentId: student.id }
      });

      // Create new payments
      const paymentPromises: Promise<any>[] = [];
      let lastPayment: { month: number; year: number } | null = null;

      for (const payment of studentData.payments) {
        const monthNum = getMonthNumber(payment.month);
        if (monthNum === -1) continue;

        const paymentDate = new Date(payment.year, monthNum, 1);
        paymentDate.setHours(0, 0, 0, 0);

        if (!lastPayment || payment.year > lastPayment.year || 
            (payment.year === lastPayment.year && monthNum > lastPayment.month)) {
          lastPayment = { month: monthNum, year: payment.year };
        }

        paymentPromises.push(
          prisma.payment.create({
            data: {
              studentId: student.id,
              centerId: student.centerId,
              amount: Math.round(payment.amount),
              paymentDate,
              paymentMode: 'CASH',
              notes: studentData.comments || null
            }
          })
        );
      }

      await Promise.all(paymentPromises);

      // Update student status and churned date
      const newStatus = mapStatus(studentData.subscriptionStatus);
      const updateData: any = {
        status: newStatus
      };

      // Handle churned/paused students
      if ((studentData.subscriptionStatus === 'Churned' || studentData.subscriptionStatus === 'Paused') && lastPayment) {
        const churnDate = new Date(lastPayment.year, lastPayment.month + 1, 1);
        churnDate.setHours(0, 0, 0, 0);
        updateData.churnedDate = churnDate;
      } else {
        updateData.churnedDate = null;
      }

      // Update joining date
      if (studentData.startDate) {
        const joiningDate = parseDate(studentData.startDate);
        if (joiningDate) {
          updateData.joiningDate = joiningDate;
        }
      }

      // Update monthly fee
      if (studentData.monthlyFee) {
        updateData.monthlyFeeAmount = Math.round(studentData.monthlyFee);
      }

      await prisma.student.update({
        where: { id: student.id },
        data: updateData
      });

      results.push({
        studentName: studentData.name,
        success: true,
        paymentsDeleted: deleted.count,
        paymentsCreated: paymentPromises.length
      });

    } catch (error: any) {
      results.push({
        studentName: studentData.name,
        success: false,
        reason: error.message
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  res.json({
    message: `Updated ${successCount} students, ${failedCount} failed`,
    results,
    summary: {
      total: studentsData.length,
      success: successCount,
      failed: failedCount
    }
  });
});

export default router;


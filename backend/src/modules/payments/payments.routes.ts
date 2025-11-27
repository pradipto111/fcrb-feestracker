import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired } from "../../auth/auth.middleware";
import { getSystemDate } from "../../utils/system-date";

const prisma = new PrismaClient();
const router = Router();

async function getCoachCenterIds(coachId: number) {
  const links = await prisma.coachCenter.findMany({
    where: { coachId },
    select: { centerId: true }
  });
  return links.map((l) => l.centerId);
}

/**
 * POST /payments
 * body: { studentId, amount, paymentDate?, paymentMode, upiOrTxnReference?, notes? }
 * centerId inferred from student
 */
router.post("/", authRequired, async (req, res) => {
  const { id: userId, role } = req.user!;
  const { studentId, amount, paymentDate, paymentMode, upiOrTxnReference, notes } =
    req.body as {
      studentId: number;
      amount: number;
      paymentDate?: string;
      paymentMode: string;
      upiOrTxnReference?: string;
      notes?: string;
    };

  const student = await prisma.student.findUnique({
    where: { id: studentId }
  });
  if (!student) return res.status(404).json({ message: "Student not found" });

  if (role === "COACH") {
    const centerIds = await getCoachCenterIds(userId);
    if (!centerIds.includes(student.centerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const payment = await prisma.payment.create({
    data: {
      studentId,
      centerId: student.centerId,
      amount,
      paymentDate: paymentDate ? new Date(paymentDate) : getSystemDate(),
      paymentMode,
      upiOrTxnReference,
      notes
    }
  });

  res.status(201).json(payment);
});

export default router;



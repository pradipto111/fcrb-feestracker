/**
 * Deletes all students and all data that references them.
 * Order: Payment, Attendance, FixturePlayer (RESTRICT FKs), then Student (CASCADE handles the rest).
 *
 * Run from backend: npx ts-node scripts/delete-all-students.ts
 * Or: npm run script:delete-all-students (if script is added to package.json)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const studentCount = await prisma.student.count();
  console.log(`Found ${studentCount} students. Deleting all student-related data...`);

  // Tables with ON DELETE RESTRICT - must be deleted before Student
  const deletedPayments = await prisma.payment.deleteMany({});
  console.log(`  Deleted ${deletedPayments.count} payment(s).`);

  const deletedAttendance = await prisma.attendance.deleteMany({});
  console.log(`  Deleted ${deletedAttendance.count} attendance record(s).`);

  const deletedFixturePlayers = await prisma.fixturePlayer.deleteMany({});
  console.log(`  Deleted ${deletedFixturePlayers.count} fixture player(s).`);

  // Student delete will CASCADE to: StudentStats, TimelineEvent, MonthlyFeedback,
  // WellnessCheck, ProgressRoadmap, PlayerMetricSnapshot, PlayerMetricAuditLog,
  // PlayerCoachNote, ScoutingBoardPlayer, ScoutingDecisionLog, ParentDevelopmentReport,
  // PlayerWeeklyLoad, ClubEventPlayer (and Badge via StudentStats)
  const deletedStudents = await prisma.student.deleteMany({});
  console.log(`  Deleted ${deletedStudents.count} student(s).`);

  console.log("\nDone. All student data has been removed from the database.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

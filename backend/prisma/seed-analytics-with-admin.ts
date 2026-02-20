import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Clearing database and seeding with analytics mock data...");

  // Preserve admin credentials
  const existingAdmin = await prisma.coach.findUnique({
    where: { email: "admin@fcrb.com" },
  });

  let adminPasswordHash = "";
  if (existingAdmin) {
    adminPasswordHash = existingAdmin.passwordHash;
    console.log("✅ Found existing admin, preserving credentials");
  } else {
    adminPasswordHash = await bcrypt.hash("20fc24rb!", 10);
    console.log("✅ Creating new admin with default password");
  }

  // Clear all data (in correct order to respect foreign keys)
  console.log("🗑️  Clearing existing data...");
  
  await prisma.wellnessCheck.deleteMany();
  await prisma.monthlyFeedback.deleteMany();
  await prisma.progressRoadmap.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.fixturePlayer.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.session.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.studentStats.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.coachCenter.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.center.deleteMany();

  console.log("✅ Database cleared");

  // Recreate admin
  const admin = await prisma.coach.create({
    data: {
      fullName: "Admin User",
      email: "admin@fcrb.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user");

  // Create Centres
  const centre3lok = await prisma.center.create({
    data: {
      name: "3lok Football Fitness Hub",
      shortName: "3LOK",
      city: "Bengaluru",
      locality: "Seegehalli",
      isActive: true,
      displayOrder: 1,
    },
  });

  const centreDepot18 = await prisma.center.create({
    data: {
      name: "Depot18 - Sports",
      shortName: "DEPOT18",
      city: "Bengaluru",
      locality: "Jayamahal",
      isActive: true,
      displayOrder: 2,
    },
  });

  const centreBlitzz = await prisma.center.create({
    data: {
      name: "Blitzz Sports Arena",
      shortName: "BLITZZ",
      city: "Bengaluru",
      locality: "Whitefield",
      isActive: true,
      displayOrder: 3,
    },
  });

  const centreTronic = await prisma.center.create({
    data: {
      name: "Tronic City Turf",
      shortName: "TRONIC",
      city: "Bengaluru",
      locality: "Electronic City",
      isActive: true,
      displayOrder: 4,
    },
  });

  console.log("✅ Created 4 centres");

  // Create Coaches
  const coach1Password = await bcrypt.hash("coach123", 10);
  const coach1 = await prisma.coach.create({
    data: {
      fullName: "Nitesh Sharma",
      email: "nitesh.sharma@fcrb.com",
      passwordHash: coach1Password,
      role: "COACH",
      centers: {
        create: [
          { centerId: centre3lok.id },
          { centerId: centreDepot18.id },
        ],
      },
    },
  });

  const coach2Password = await bcrypt.hash("coach123", 10);
  const coach2 = await prisma.coach.create({
    data: {
      fullName: "Dhruv Katyal",
      email: "dhruv.katyal@fcrb.com",
      passwordHash: coach2Password,
      role: "COACH",
      centers: {
        create: [
          { centerId: centreBlitzz.id },
          { centerId: centreTronic.id },
        ],
      },
    },
  });

  console.log("✅ Created 2 coaches");

  // Create Students
  const studentPassword = await bcrypt.hash("student123", 10);

  const student1 = await prisma.student.create({
    data: {
      fullName: "Arjun Rao",
      dateOfBirth: new Date("2008-03-15"),
      email: "arjun.rao@student.fcrb.com",
      passwordHash: studentPassword,
      centerId: centre3lok.id,
      joiningDate: new Date("2023-07-01"),
      programType: "SCP",
      monthlyFeeAmount: 5000,
      status: "ACTIVE",
    },
  });

  const student2 = await prisma.student.create({
    data: {
      fullName: "Karan Mehta",
      dateOfBirth: new Date("2005-11-02"),
      email: "karan.mehta@student.fcrb.com",
      passwordHash: studentPassword,
      centerId: centreDepot18.id,
      joiningDate: new Date("2022-09-01"),
      programType: "U21",
      monthlyFeeAmount: 6000,
      status: "ACTIVE",
    },
  });

  const student3 = await prisma.student.create({
    data: {
      fullName: "Rahul Sharma",
      dateOfBirth: new Date("2003-01-10"),
      email: "rahul.sharma@student.fcrb.com",
      passwordHash: studentPassword,
      centerId: centreBlitzz.id,
      joiningDate: new Date("2021-06-15"),
      programType: "Senior",
      monthlyFeeAmount: 7000,
      status: "ACTIVE",
    },
  });

  const student4 = await prisma.student.create({
    data: {
      fullName: "Ishaan Verma",
      dateOfBirth: new Date("2000-04-22"),
      email: "ishaan.verma@student.fcrb.com",
      passwordHash: studentPassword,
      centerId: centreTronic.id,
      joiningDate: new Date("2020-01-01"),
      programType: "Senior",
      monthlyFeeAmount: 8000,
      status: "ACTIVE",
    },
  });

  const student5 = await prisma.student.create({
    data: {
      fullName: "Rohit Nair",
      dateOfBirth: new Date("2007-09-09"),
      email: "rohit.nair@student.fcrb.com",
      passwordHash: studentPassword,
      centerId: centre3lok.id,
      joiningDate: new Date("2024-01-10"),
      programType: "SCP",
      monthlyFeeAmount: 5000,
      status: "ACTIVE",
    },
  });

  console.log("✅ Created 5 students");

  // Create Sessions
  const session1 = await prisma.session.create({
    data: {
      centerId: centre3lok.id,
      coachId: coach1.id,
      sessionDate: new Date("2025-11-01"),
      startTime: "09:00",
      endTime: "10:30",
    },
  });

  const session2 = await prisma.session.create({
    data: {
      centerId: centre3lok.id,
      coachId: coach1.id,
      sessionDate: new Date("2025-11-03"),
      startTime: "09:00",
      endTime: "10:30",
    },
  });

  const session3 = await prisma.session.create({
    data: {
      centerId: centreDepot18.id,
      coachId: coach1.id,
      sessionDate: new Date("2025-11-05"),
      startTime: "16:00",
      endTime: "17:30",
    },
  });

  const session4 = await prisma.session.create({
    data: {
      centerId: centreBlitzz.id,
      coachId: coach2.id,
      sessionDate: new Date("2025-11-07"),
      startTime: "17:00",
      endTime: "18:30",
    },
  });

  const session5 = await prisma.session.create({
    data: {
      centerId: centreTronic.id,
      coachId: coach2.id,
      sessionDate: new Date("2025-11-09"),
      startTime: "18:00",
      endTime: "19:30",
    },
  });

  const session6 = await prisma.session.create({
    data: {
      centerId: centre3lok.id,
      coachId: coach1.id,
      sessionDate: new Date("2025-11-11"),
      startTime: "09:00",
      endTime: "10:30",
    },
  });

  console.log("✅ Created 6 sessions");

  // Create Attendance Records
  await prisma.attendance.createMany({
    data: [
      {
        sessionId: session1.id,
        studentId: student1.id,
        status: "PRESENT",
      },
      {
        sessionId: session2.id,
        studentId: student1.id,
        status: "PRESENT",
      },
      {
        sessionId: session6.id,
        studentId: student1.id,
        status: "PRESENT",
      },
      {
        sessionId: session1.id,
        studentId: student5.id,
        status: "ABSENT",
      },
      {
        sessionId: session2.id,
        studentId: student5.id,
        status: "PRESENT",
      },
      {
        sessionId: session6.id,
        studentId: student5.id,
        status: "PRESENT",
      },
      {
        sessionId: session3.id,
        studentId: student2.id,
        status: "PRESENT",
      },
      {
        sessionId: session4.id,
        studentId: student3.id,
        status: "ABSENT",
      },
      {
        sessionId: session5.id,
        studentId: student4.id,
        status: "PRESENT",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created attendance records");

  // Create Fixtures/Matches
  const fixture1 = await prisma.fixture.create({
    data: {
      centerId: centre3lok.id,
      coachId: coach1.id,
      matchType: "U17 Youth League – Matchday 1",
      opponent: "FC United",
      matchDate: new Date("2025-11-15"),
      matchTime: "14:00",
      venue: "3lok Football Fitness Hub",
      status: "UPCOMING",
    },
  });

  const fixture2 = await prisma.fixture.create({
    data: {
      centerId: centre3lok.id,
      coachId: coach1.id,
      matchType: "U17 Youth League – Matchday 2",
      opponent: "Bengaluru FC Youth",
      matchDate: new Date("2025-11-22"),
      matchTime: "14:00",
      venue: "3lok Football Fitness Hub",
      status: "UPCOMING",
    },
  });

  const fixture3 = await prisma.fixture.create({
    data: {
      centerId: centreBlitzz.id,
      coachId: coach2.id,
      matchType: "Senior – D Division Opener",
      opponent: "KSFA D Division Team A",
      matchDate: new Date("2025-11-18"),
      matchTime: "16:00",
      venue: "Blitzz Sports Arena",
      status: "UPCOMING",
    },
  });

  const fixture4 = await prisma.fixture.create({
    data: {
      centerId: centreTronic.id,
      coachId: coach2.id,
      matchType: "Super Division Fixture 1",
      opponent: "Super Division Champions",
      matchDate: new Date("2025-11-25"),
      matchTime: "18:00",
      venue: "Tronic City Turf",
      status: "UPCOMING",
    },
  });

  console.log("✅ Created 4 fixtures");

  // Create Match Selections
  await prisma.fixturePlayer.createMany({
    data: [
      {
        fixtureId: fixture1.id,
        studentId: student1.id,
        selectionStatus: "SELECTED",
        selectionReason: "SQUAD_ROTATION",
      },
      {
        fixtureId: fixture2.id,
        studentId: student1.id,
        selectionStatus: "SELECTED",
        selectionReason: "TACTICAL_FIT",
      },
      {
        fixtureId: fixture1.id,
        studentId: student5.id,
        selectionStatus: "NOT_SELECTED",
        selectionReason: "TACTICAL_FIT",
      },
      {
        fixtureId: fixture2.id,
        studentId: student5.id,
        selectionStatus: "SELECTED",
        selectionReason: "SQUAD_ROTATION",
      },
      {
        fixtureId: fixture3.id,
        studentId: student3.id,
        selectionStatus: "NOT_SELECTED",
        selectionReason: "ATTENDANCE_REQUIREMENT",
      },
      {
        fixtureId: fixture4.id,
        studentId: student4.id,
        selectionStatus: "SELECTED",
        selectionReason: "TACTICAL_FIT",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created match selections");

  // Create Wellness Checks
  await prisma.wellnessCheck.createMany({
    data: [
      {
        studentId: student1.id,
        sessionId: session1.id,
        checkDate: new Date("2025-11-01"),
        exertionLevel: 4,
        energyLevel: "HIGH",
        comment: "Felt sharp",
      },
      {
        studentId: student1.id,
        sessionId: session2.id,
        checkDate: new Date("2025-11-03"),
        exertionLevel: 4,
        energyLevel: "MEDIUM",
      },
      {
        studentId: student1.id,
        sessionId: session6.id,
        checkDate: new Date("2025-11-11"),
        exertionLevel: 5,
        energyLevel: "MEDIUM",
        comment: "Tough session",
      },
      {
        studentId: student5.id,
        sessionId: session2.id,
        checkDate: new Date("2025-11-03"),
        exertionLevel: 3,
        energyLevel: "LOW",
        comment: "Tired after school",
      },
      {
        studentId: student5.id,
        sessionId: session6.id,
        checkDate: new Date("2025-11-11"),
        exertionLevel: 3,
        energyLevel: "MEDIUM",
      },
      {
        studentId: student2.id,
        sessionId: session3.id,
        checkDate: new Date("2025-11-05"),
        exertionLevel: 4,
        energyLevel: "LOW",
        comment: "Exams + training",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created wellness checks");

  // Create Monthly Feedback
  await prisma.monthlyFeedback.createMany({
    data: [
      {
        studentId: student1.id,
        coachId: coach1.id,
        month: 10,
        year: 2025,
        strengths: [
          "Excellent training intensity",
          "Quick understanding of tactical instructions",
        ],
        areasToImprove: ["Work on weak foot passing under pressure"],
        focusGoal: "Maintain 85%+ attendance and improve off-the-ball movement.",
        overallNote: "On track for higher-level exposure next phase.",
        isPublished: true,
        publishedById: admin.id,
        publishedAt: new Date("2025-10-30"),
      },
      {
        studentId: student5.id,
        coachId: coach1.id,
        month: 10,
        year: 2025,
        strengths: ["Good energy when present in training"],
        areasToImprove: ["Attendance has to be more consistent."],
        focusGoal: "Reach at least 80% session attendance over the next month.",
        overallNote: "Potential is there, needs stable commitment.",
        isPublished: true,
        publishedById: admin.id,
        publishedAt: new Date("2025-10-28"),
      },
      {
        studentId: student3.id,
        coachId: coach2.id,
        month: 10,
        year: 2025,
        strengths: ["Strong physical profile."],
        areasToImprove: ["Discipline and punctuality must improve."],
        focusGoal: "Avoid missing sessions and maintain time discipline.",
        overallNote: "Selection will depend on discipline in upcoming weeks.",
        isPublished: true,
        publishedById: admin.id,
        publishedAt: new Date("2025-10-25"),
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created monthly feedback");

  // Create Progress Roadmaps
  await prisma.progressRoadmap.createMany({
    data: [
      {
        studentId: student1.id,
        currentLevel: "Youth Leagues",
        nextPotentialLevel: "Karnataka D Division",
        attendanceRequirement: "85% attendance for 3 months",
        physicalBenchmark: "Pass fitness test",
        tacticalRequirement: "Demonstrate positional understanding",
        coachRecommendation: false,
        updatedByRole: "COACH",
        updatedById: coach1.id,
      },
      {
        studentId: student2.id,
        currentLevel: "Karnataka D Division",
        nextPotentialLevel: "Karnataka C Division",
        attendanceRequirement: "80% attendance for 6 months",
        coachRecommendation: true,
        updatedByRole: "COACH",
        updatedById: coach1.id,
      },
      {
        studentId: student3.id,
        currentLevel: "Karnataka D Division",
        nextPotentialLevel: "Karnataka C Division",
        attendanceRequirement: "85% attendance for 3 months",
        coachRecommendation: false,
        updatedByRole: "COACH",
        updatedById: coach2.id,
      },
      {
        studentId: student4.id,
        currentLevel: "Super Division Team",
        nextPotentialLevel: null,
        attendanceRequirement: "Maintain 90% attendance",
        coachRecommendation: true,
        updatedByRole: "COACH",
        updatedById: coach2.id,
      },
      {
        studentId: student5.id,
        currentLevel: "Youth Leagues",
        nextPotentialLevel: "Karnataka D Division",
        attendanceRequirement: "80% attendance for 3 months",
        coachRecommendation: false,
        updatedByRole: "COACH",
        updatedById: coach1.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Created progress roadmaps");

  console.log("\n🎉 Analytics mock data seeding completed successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("   👨‍💼 Admin: admin@fcrb.com / 20fc24rb! (or existing password)");
  console.log("   👨‍🏫 Coach 1: nitesh.sharma@fcrb.com / coach123");
  console.log("   👨‍🏫 Coach 2: dhruv.katyal@fcrb.com / coach123");
  console.log("   👨‍🎓 Students: [name]@student.fcrb.com / student123");
  console.log("\n📊 Created:");
  console.log("   • 4 Centres (3lok, Depot18, Blitzz, Tronic)");
  console.log("   • 2 Coaches");
  console.log("   • 5 Students");
  console.log("   • 6 Training Sessions");
  console.log("   • Attendance Records");
  console.log("   • 4 Fixtures/Matches");
  console.log("   • Match Selections");
  console.log("   • Wellness Checks");
  console.log("   • Monthly Feedback");
  console.log("   • Progress Roadmaps");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding analytics data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


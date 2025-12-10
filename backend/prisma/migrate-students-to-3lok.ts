import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Migration script: Move all existing students to 3LOK centre
 * 
 * This script:
 * 1. Finds the 3LOK centre
 * 2. Updates all students to point to 3LOK
 * 3. Ensures no student is left without a valid centreId
 */
async function main() {
  console.log("🔄 Starting student migration to 3LOK centre...");

  // Find 3LOK centre
  const threeLokCentre = await prisma.center.findUnique({
    where: { shortName: "3LOK" },
  });

  if (!threeLokCentre) {
    console.error("❌ Error: 3LOK centre not found. Please run seed-centres.ts first.");
    process.exit(1);
  }

  console.log(`✅ Found 3LOK centre: ${threeLokCentre.name} (ID: ${threeLokCentre.id})`);

  // Get all students
  const allStudents = await prisma.student.findMany({
    select: {
      id: true,
      fullName: true,
      centerId: true,
    },
  });

  console.log(`📊 Found ${allStudents.length} students`);

  // Get all valid centre IDs
  const validCentres = await prisma.center.findMany({
    select: { id: true },
  });
  const validCentreIds = new Set(validCentres.map((c) => c.id));

  // Find students that need migration
  const studentsToMigrate = allStudents.filter(
    (student) => !validCentreIds.has(student.centerId)
  );

  console.log(`🔄 Migrating ${studentsToMigrate.length} students to 3LOK...`);

  if (studentsToMigrate.length > 0) {
    // Update all students with invalid centreId to 3LOK
    const result = await prisma.student.updateMany({
      where: {
        centerId: {
          notIn: validCentreIds.size > 0 ? Array.from(validCentreIds) : [],
        },
      },
      data: {
        centerId: threeLokCentre.id,
      },
    });

    console.log(`✅ Updated ${result.count} students to 3LOK centre`);
  } else {
    console.log("ℹ️  No students need migration - all already have valid centres");
  }

  // Safety check: Ensure ALL students have valid centreId
  const studentsWithoutValidCentre = await prisma.student.findMany({
    where: {
      centerId: {
        notIn: validCentreIds.size > 0 ? Array.from(validCentreIds) : [],
      },
    },
  });

  if (studentsWithoutValidCentre.length > 0) {
    console.warn(
      `⚠️  Warning: ${studentsWithoutValidCentre.length} students still have invalid centreId`
    );
    // Force update remaining students
    await prisma.student.updateMany({
      where: {
        centerId: {
          notIn: validCentreIds.size > 0 ? Array.from(validCentreIds) : [],
        },
      },
      data: {
        centerId: threeLokCentre.id,
      },
    });
    console.log("✅ Force-updated remaining students to 3LOK");
  }

  // Final verification
  const finalCheck = await prisma.student.findMany({
    where: {
      centerId: threeLokCentre.id,
    },
  });

  console.log(`✅ Migration complete! ${finalCheck.length} students now linked to 3LOK`);
}

main()
  .catch((e) => {
    console.error("❌ Error during migration:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


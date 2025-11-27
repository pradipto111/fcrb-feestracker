import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with clean slate (Admin + Coach only)...");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.coach.create({
    data: {
      fullName: "Admin User",
      email: "admin@feestrack.com",
      passwordHash: adminPassword,
      role: "ADMIN"
    }
  });

  console.log("✅ Created admin user");

  // Create Coach (will have access to centers as they are created)
  const coachPassword = await bcrypt.hash("coach123", 10);
  await prisma.coach.create({
    data: {
      fullName: "Coach User",
      email: "coach@feestrack.com",
      passwordHash: coachPassword,
      role: "COACH"
    }
  });

  console.log("✅ Created coach user");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Login credentials:");
  console.log("   👨‍💼 Admin: admin@feestrack.com / admin123");
  console.log("   👨‍🏫 Coach: coach@feestrack.com / coach123");
  console.log("\n📊 Database is now clean - no centers, students, or payments.");
  console.log("   Use the admin portal to create centers and students.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });







import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database (production-safe)...");

  // Check if admin exists, create if not
  const existingAdmin = await prisma.coach.findUnique({
    where: { email: "admin@feestrack.com" },
  });

  if (!existingAdmin) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    await prisma.coach.create({
      data: {
        fullName: "Admin User",
        email: "admin@feestrack.com",
        passwordHash: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("✅ Created admin user");
  } else {
    console.log("ℹ️ Admin user already exists");
  }

  // Check if coach exists, create if not
  const existingCoach = await prisma.coach.findUnique({
    where: { email: "coach@feestrack.com" },
  });

  if (!existingCoach) {
    const coachPassword = await bcrypt.hash("coach123", 10);
    await prisma.coach.create({
      data: {
        fullName: "Coach User",
        email: "coach@feestrack.com",
        passwordHash: coachPassword,
        role: "COACH",
      },
    });
    console.log("✅ Created coach user");
  } else {
    console.log("ℹ️ Coach user already exists");
  }

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Login credentials:");
  console.log("   👨‍💼 Admin: admin@feestrack.com / admin123");
  console.log("   👨‍🏫 Coach: coach@feestrack.com / coach123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });




/**
 * Updates the admin user in the database to the new credentials:
 *   email: admin@fcrb.com
 *   password: 20fc24rb!
 *
 * Run from backend: npx ts-node scripts/update-admin-credentials.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const NEW_EMAIL = "admin@fcrb.com";
const NEW_PASSWORD = "20fc24rb!";

async function main() {
  const admin = await prisma.coach.findFirst({
    where: { role: "ADMIN" },
  });

  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

  if (admin) {
    await prisma.coach.update({
      where: { id: admin.id },
      data: { email: NEW_EMAIL, passwordHash },
    });
    console.log("✅ Admin credentials updated.");
  } else {
    await prisma.coach.create({
      data: {
        fullName: "Admin User",
        email: NEW_EMAIL,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created with new credentials.");
  }

  console.log("\n📝 Login with:");
  console.log("   Email:    " + NEW_EMAIL);
  console.log("   Password: " + NEW_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

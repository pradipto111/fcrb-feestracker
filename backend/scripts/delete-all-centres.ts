/**
 * Deletes all centre data. Tables with RESTRICT FK to Center must be cleared first.
 * Vote has RESTRICT; CentreMonthlyMetrics has CASCADE (deleted when Center is deleted).
 *
 * Run from backend: npx ts-node scripts/delete-all-centres.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const centerCount = await prisma.center.count();
  console.log(`Found ${centerCount} centre(s). Deleting all centre data...\n`);

  // Vote has centerId REFERENCES Center ON DELETE RESTRICT
  const deletedVotes = await prisma.vote.deleteMany({});
  console.log(`  Deleted ${deletedVotes.count} vote(s).`);

  // CentreMonthlyMetrics will CASCADE when Center is deleted; optional to delete first
  try {
    const deletedMetrics = await (prisma as any).centreMonthlyMetrics?.deleteMany?.({});
    if (deletedMetrics?.count !== undefined) {
      console.log(`  Deleted ${deletedMetrics.count} centre monthly metric(s).`);
    }
  } catch {
    // Model may not exist or already empty
  }

  const deletedCentres = await prisma.center.deleteMany({});
  console.log(`  Deleted ${deletedCentres.count} centre(s).`);

  console.log("\nDone. All centre data has been removed.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

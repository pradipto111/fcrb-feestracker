import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Ensures all coaches have access to all centers
 * Call this after creating a new center or coach
 */
export async function syncCoachCenters() {
  const coaches = await prisma.coach.findMany({
    where: { role: "COACH" }
  });
  
  const centers = await prisma.center.findMany();
  
  for (const coach of coaches) {
    for (const center of centers) {
      // Check if assignment exists
      const existing = await prisma.coachCenter.findFirst({
        where: {
          coachId: coach.id,
          centerId: center.id
        }
      });
      
      // Create if doesn't exist
      if (!existing) {
        await prisma.coachCenter.create({
          data: {
            coachId: coach.id,
            centerId: center.id
          }
        });
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  syncCoachCenters()
    .then(() => {
      console.log("✅ All coaches synced with all centers");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Error:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}



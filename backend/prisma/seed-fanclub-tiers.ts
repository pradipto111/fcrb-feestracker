import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FANCLUB_TIERS = [
  {
    name: "Rookie Fan",
    monthlyPriceINR: 9,
    yearlyPriceINR: 99,
    sortOrder: 1,
    isActive: true,
    benefitsJson: [
      "Access to sponsor rewards (basic tier)",
      "Matchday special offers",
      "Fan Club digital badge"
    ],
    featureFlags: {
      offers: true,
      games: true,
      matchday: true
    }
  },
  {
    name: "Matchday Regular",
    monthlyPriceINR: 25,
    yearlyPriceINR: 299,
    sortOrder: 2,
    isActive: true,
    benefitsJson: [
      "Access to sponsor rewards (basic tier)",
      "Matchday special offers",
      "Fan Club digital badge",
      "All Rookie benefits",
      "Higher-value partner rewards",
      "Priority access to events & friendlies"
    ],
    featureFlags: {
      offers: true,
      games: true,
      matchday: true
    }
  },
  {
    name: "Inner Circle",
    monthlyPriceINR: 60,
    yearlyPriceINR: 699,
    sortOrder: 3,
    isActive: true,
    benefitsJson: [
      "Access to sponsor rewards (basic tier)",
      "Matchday special offers",
      "Fan Club digital badge",
      "All Rookie benefits",
      "Higher-value partner rewards",
      "Priority access to events & friendlies",
      "All benefits unlocked",
      "Maximum sponsor discounts",
      "Priority seating & invites (future)"
    ],
    featureFlags: {
      offers: true,
      games: true,
      matchday: true,
      content: true
    }
  }
];

async function seedFanClubTiers() {
  console.log('🎯 Seeding Fan Club tiers...');

  for (const tierData of FANCLUB_TIERS) {
    const existing = await (prisma as any).fanTier?.findFirst({
      where: { name: tierData.name }
    });

    if (existing) {
      console.log(`✓ Tier "${tierData.name}" already exists, updating...`);
      await (prisma as any).fanTier?.update({
        where: { id: existing.id },
        data: tierData
      });
    } else {
      console.log(`✓ Creating tier "${tierData.name}"...`);
      await (prisma as any).fanTier?.create({
        data: tierData
      });
    }
  }

  console.log('✅ Fan Club tiers seeded successfully!');
}

seedFanClubTiers()
  .catch((e) => {
    console.error('❌ Error seeding tiers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding centres...");

  // Centre 1: 3lok Football Fitness Hub
  const centre1 = await prisma.center.upsert({
    where: { shortName: "3LOK" },
    update: {},
    create: {
      name: "3lok Football Fitness Hub",
      shortName: "3LOK",
      locality: "Seegehalli",
      addressLine: "3lok Football Fitness Hub, Seegehalli, Whitefield, Bengaluru, Karnataka 560067",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560067",
      latitude: 12.9716, // Seegehalli, Whitefield coordinates
      longitude: 77.7496,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=3lok+Football+Fitness+Hub,+Seegehalli,+Whitefield,+Bengaluru,+Karnataka+560067",
      isActive: true,
      displayOrder: 1,
      // Legacy fields
      location: "Seegehalli",
      address: "3lok Football Fitness Hub, Seegehalli, Whitefield, Bengaluru, Karnataka 560067",
    },
  });

  // Centre 2: Depot18 - Sports
  const centre2 = await prisma.center.upsert({
    where: { shortName: "DEPOT18" },
    update: {},
    create: {
      name: "Depot18 - Sports",
      shortName: "DEPOT18",
      locality: "Jayamahal",
      addressLine: "Depot18 - Sports, Chamundi Hotel Compound, Jayamahal Main Rd, opposite Jayamahal Palace, Jayamahal, Bengaluru, Karnataka 560006",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560006",
      latitude: 12.9988, // Jayamahal coordinates
      longitude: 77.5946,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Depot18+Sports,+Chamundi+Hotel+Compound,+Jayamahal+Main+Rd,+opposite+Jayamahal+Palace,+Bengaluru+560006",
      isActive: true,
      displayOrder: 2,
      // Legacy fields
      location: "Jayamahal",
      address: "Depot18 - Sports, Chamundi Hotel Compound, Jayamahal Main Rd, opposite Jayamahal Palace, Jayamahal, Bengaluru, Karnataka 560006",
    },
  });

  // Centre 3: Blitzz Sports Arena
  const centre3 = await prisma.center.upsert({
    where: { shortName: "BLITZZ" },
    update: {},
    create: {
      name: "Blitzz Sports Arena",
      shortName: "BLITZZ",
      locality: "Haralur / Reliable Silver Oak",
      addressLine: "Blitzz Sports Arena, Reliable Silver Oak, 33, Main Road, next to Orchids School Road, Eastwood Twp, Reliaable Lifestyle Layout, Haralur, Bengaluru, Karnataka 560102",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560102",
      latitude: 12.8900, // Haralur coordinates
      longitude: 77.6500,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Blitzz+Sports+Arena,+Reliable+Silver+Oak,+Haralur,+Bengaluru+560102",
      isActive: true,
      displayOrder: 3,
      // Legacy fields
      location: "Haralur",
      address: "Blitzz Sports Arena, Reliable Silver Oak, 33, Main Road, next to Orchids School Road, Eastwood Twp, Reliaable Lifestyle Layout, Haralur, Bengaluru, Karnataka 560102",
    },
  });

  // Centre 4: Tronic City Turf
  const centre4 = await prisma.center.upsert({
    where: { shortName: "TRONICCITY" },
    update: {},
    create: {
      name: "Tronic City Turf",
      shortName: "TRONICCITY",
      locality: "Parappana Agrahara",
      addressLine: "Tronic City Turf, Sai Sree Layout, Parappana Agrahara, Bengaluru, Karnataka 560100",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560100",
      latitude: 12.8500, // Parappana Agrahara coordinates
      longitude: 77.7000,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Tronic+City+Turf,+Sai+Sree+Layout,+Parappana+Agrahara,+Bengaluru+560100",
      isActive: true,
      displayOrder: 4,
      // Legacy fields
      location: "Parappana Agrahara",
      address: "Tronic City Turf, Sai Sree Layout, Parappana Agrahara, Bengaluru, Karnataka 560100",
    },
  });

  console.log("✅ Seeded 4 centres:");
  console.log(`   - ${centre1.name} (${centre1.shortName})`);
  console.log(`   - ${centre2.name} (${centre2.shortName})`);
  console.log(`   - ${centre3.name} (${centre3.shortName})`);
  console.log(`   - ${centre4.name} (${centre4.shortName})`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding centres:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


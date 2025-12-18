/**
 * QA Test Data Seed Script
 * Creates realistic test data with edge cases for comprehensive testing
 * 
 * Usage:
 *   npm run seed:qa -- --students=20 --centres=4 --sessions=40
 */

import { PrismaClient, StudentStatus, FixtureStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface SeedOptions {
  students?: number;
  centres?: number;
  sessions?: number;
  attendance?: number;
  drills?: number;
  products?: number;
  orders?: number;
  invoices?: number;
  clearExisting?: boolean;
}

const DEFAULT_OPTIONS: Required<SeedOptions> = {
  students: 10,
  centres: 4,
  sessions: 20,
  attendance: 50,
  drills: 10,
  products: 5,
  orders: 3,
  invoices: 2,
  clearExisting: false,
};

// Edge case data templates
const EDGE_CASE_NAMES = [
  'A Very Long Name That Exceeds Normal Expectations And Tests UI Layout Properly',
  'John Smith',
  'John Smith Jr.',
  'John A. Smith',
  'J. Smith',
  'José María García-López',
  'O\'Connor-Smith',
  'Test User 123',
];

const CENTRES = [
  { name: '3lok Football Fitness Hub', locality: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'Depot18', locality: 'Jayamahal', lat: 12.9884, lng: 77.5946 },
  { name: 'Blitzz', locality: 'Haralur', lat: 12.8912, lng: 77.6415 },
  { name: 'Tronic City Turf', locality: 'Parappana Agrahara', lat: 12.8443, lng: 77.6604 },
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seedCentres(options: Required<SeedOptions>) {
  console.log('🌍 Seeding centres...');
  
  for (const centre of CENTRES.slice(0, options.centres)) {
    await prisma.center.upsert({
      where: { shortName: centre.name.toUpperCase().replace(/\s+/g, '') },
      update: {},
      create: {
        name: centre.name,
        shortName: centre.name.toUpperCase().replace(/\s+/g, ''),
        locality: centre.locality,
        city: 'Bangalore',
        state: 'Karnataka',
        latitude: centre.lat,
        longitude: centre.lng,
        googleMapsUrl: `https://maps.google.com/?q=${centre.lat},${centre.lng}`,
        isActive: true,
        displayOrder: CENTRES.indexOf(centre),
      },
    });
  }
  
  console.log(`✅ Created/updated ${options.centres} centres`);
}

async function seedCoaches(options: Required<SeedOptions>) {
  console.log('👨‍🏫 Seeding coaches...');
  
  const passwordHash = await hashPassword('test123');
  
  // Create test coaches
  const coach = await prisma.coach.upsert({
    where: { email: 'coach@test.com' },
    update: {},
    create: {
      fullName: 'Test Coach',
      email: 'coach@test.com',
      passwordHash,
      role: 'COACH',
    },
  });

  // Assign coach to all centres
  const centres = await prisma.center.findMany();
  for (const centre of centres) {
    await prisma.coachCenter.upsert({
      where: {
        coachId_centerId: {
          coachId: coach.id,
          centerId: centre.id,
        },
      },
      update: {},
      create: {
        coachId: coach.id,
        centerId: centre.id,
      },
    });
  }
  
  console.log('✅ Created test coach');
}

async function seedAdmin(options: Required<SeedOptions>) {
  console.log('👑 Seeding admin...');
  
  const passwordHash = await hashPassword('test123');
  
  await prisma.coach.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      fullName: 'Test Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'ADMIN',
    },
  });
  
  console.log('✅ Created test admin');
}

async function seedStudents(options: Required<SeedOptions>) {
  console.log(`👥 Seeding ${options.students} students...`);
  
  const centres = await prisma.center.findMany();
  const passwordHash = await hashPassword('test123');
  
  const students = [];
  
  for (let i = 0; i < options.students; i++) {
    const centre = centres[i % centres.length];
    const isEdgeCase = i < Math.floor(options.students * 0.2); // 20% edge cases
    
    let fullName: string;
    let email: string | null;
    let phoneNumber: string | null;
    let parentName: string | null;
    
    if (isEdgeCase) {
      // Edge case: long name, missing fields, etc.
      if (i === 0) {
        fullName = EDGE_CASE_NAMES[0]; // Very long name
        email = null; // Missing email
        phoneNumber = null;
        parentName = null;
      } else if (i === 1) {
        fullName = EDGE_CASE_NAMES[1]; // Duplicate-like name
        email = `student${i}@test.com`;
        phoneNumber = `987654321${i}`;
        parentName = 'Parent Name';
      } else {
        fullName = EDGE_CASE_NAMES[i % EDGE_CASE_NAMES.length];
        email = `student${i}@test.com`;
        phoneNumber = i % 2 === 0 ? null : `987654321${i}`;
        parentName = i % 3 === 0 ? null : `Parent ${i}`;
      }
    } else {
      fullName = `Test Student ${i + 1}`;
      email = `student${i}@test.com`;
      phoneNumber = `987654321${i}`;
      parentName = `Parent ${i}`;
    }
    
    const baseData = {
      fullName,
      email,
      passwordHash: i === 0 ? null : passwordHash, // First student has no password (edge case)
      phoneNumber,
      parentName,
      parentPhoneNumber: phoneNumber ? `987654321${i}` : null,
      centerId: centre.id,
      programType: i % 2 === 0 ? 'ACADEMY' : 'TRIAL',
      monthlyFeeAmount: 2000 + (i * 100),
      paymentFrequency: i % 4 === 0 ? 1 : i % 4 === 1 ? 3 : i % 4 === 2 ? 6 : 12,
      status: i === options.students - 1 ? StudentStatus.INACTIVE : StudentStatus.ACTIVE,
      joiningDate: new Date(2024, 0, 1 + i),
      dateOfBirth: new Date(2010 + (i % 10), i % 12, (i % 28) + 1),
    };

    // Idempotency: if email is present, upsert; if not, reuse an existing matching record.
    const student = email
      ? await prisma.student.upsert({
          where: { email },
          update: { ...baseData },
          create: { ...baseData },
        })
      : (await prisma.student.findFirst({
          where: {
            email: null,
            fullName,
            centerId: centre.id,
          },
        })) ||
        (await prisma.student.create({ data: baseData }));
    
    students.push(student);
  }
  
  console.log(`✅ Created ${options.students} students (${Math.floor(options.students * 0.2)} edge cases)`);
  return students;
}

async function seedSessions(options: Required<SeedOptions>, students: any[]) {
  console.log(`📅 Seeding ${options.sessions} sessions...`);
  
  const centres = await prisma.center.findMany();
  const coach = await prisma.coach.findFirst({ where: { role: 'COACH' } });
  if (!coach) {
    throw new Error('No coach found. Run seedCoaches first.');
  }
  
  const sessions = [];
  
  for (let i = 0; i < options.sessions; i++) {
    const centre = centres[i % centres.length];
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - (options.sessions - i));
    
    const session = await prisma.session.create({
      data: {
        centerId: centre.id,
        coachId: coach.id,
        sessionDate,
        startTime: '18:00',
        endTime: '19:30',
        notes: i % 5 === 0 ? `Session ${i} with special notes` : null,
      },
    });
    
    sessions.push(session);
  }
  
  console.log(`✅ Created ${options.sessions} sessions`);
  return sessions;
}

async function seedAttendance(options: Required<SeedOptions>, students: any[], sessions: any[]) {
  console.log(`✅ Seeding attendance records...`);
  
  let count = 0;
  
  for (const session of sessions.slice(0, Math.min(options.attendance, sessions.length))) {
    for (let i = 0; i < Math.min(students.length, 10); i++) {
      const student = students[i];
      // AttendanceStatus enum only has: PRESENT, ABSENT, EXCUSED
      const status = i % 3 === 0 ? 'PRESENT' : i % 3 === 1 ? 'ABSENT' : 'EXCUSED';
      
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          sessionId: session.id,
          status,
          notes: status === 'ABSENT' ? 'Test absence note' : null,
        },
      });
      
      count++;
    }
  }
  
  console.log(`✅ Created ${count} attendance records`);
}

async function seedPayments(options: Required<SeedOptions>, students: any[]) {
  console.log(`💰 Seeding payments...`);
  
  const centres = await prisma.center.findMany();
  let count = 0;
  
  for (const student of students) {
    const centre = centres.find(c => c.id === student.centerId) || centres[0];
    
    for (let i = 0; i < options.invoices; i++) {
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() - (options.invoices - i));
      
      const amount = student.monthlyFeeAmount;
      const isPaid = i === 0; // First invoice is paid
      
      await prisma.payment.create({
        data: {
          studentId: student.id,
          centerId: centre.id,
          amount,
          paymentDate: isPaid ? paymentDate : new Date(), // Payment model requires paymentDate
          paymentMode: isPaid ? (i % 2 === 0 ? 'CASH' : 'UPI') : 'CASH', // paymentMode is required
          notes: isPaid ? null : 'Test pending payment',
        },
      });
      
      count++;
    }
  }
  
  console.log(`✅ Created ${count} payment records`);
}

async function seedDrills(options: Required<SeedOptions>) {
  console.log(`🎥 Seeding ${options.drills} drills...`);
  
  const coach = await prisma.coach.findFirst({ where: { role: 'COACH' } });
  if (!coach) {
    throw new Error('No coach found. Run seedCoaches first.');
  }
  
  const categories = ['TECHNICAL', 'TACTICAL', 'PHYSICAL'];
  
  for (let i = 0; i < options.drills; i++) {
    await prisma.video.create({
      data: {
        title: `Test Drill ${i + 1}`,
        description: i === 0 
          ? 'A'.repeat(500) // Long description edge case
          : `Description for drill ${i + 1}`,
        category: categories[i % categories.length],
        videoUrl: `https://youtube.com/watch?v=test${i}`,
        platform: 'YOUTUBE',
        thumbnailUrl: i % 2 === 0 ? `https://example.com/thumb${i}.jpg` : null, // Some without thumbnails
        createdById: coach.id, // Required field
      },
    });
  }
  
  console.log(`✅ Created ${options.drills} drills`);
}

async function seedProducts(options: Required<SeedOptions>) {
  console.log(`🛍️ Seeding ${options.products} products...`);
  
  for (let i = 0; i < options.products; i++) {
    const slug = `test-product-${i + 1}`;
    await prisma.product.upsert({
      where: { slug },
      update: {
        name: `Test Product ${i + 1}`,
        description: `Description for product ${i + 1}`,
        price: (500 + (i * 100)) * 100, // Price in paise
        stock: i % 2 === 0 ? 10 : 0, // Some out of stock
        isActive: true,
        images: i === 0 ? [] : [`https://example.com/product${i}.jpg`], // First product has no images
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['test', 'qa'],
        category: i % 2 === 0 ? 'Jersey' : 'Accessories',
      },
      create: {
        name: `Test Product ${i + 1}`,
        slug,
        description: `Description for product ${i + 1}`,
        price: (500 + (i * 100)) * 100, // Price in paise
        stock: i % 2 === 0 ? 10 : 0, // Some out of stock
        isActive: true,
        images: i === 0 ? [] : [`https://example.com/product${i}.jpg`], // First product has no images
        sizes: ['S', 'M', 'L', 'XL'],
        tags: ['test', 'qa'],
        category: i % 2 === 0 ? 'Jersey' : 'Accessories',
      },
    });
  }
  
  console.log(`✅ Created ${options.products} products`);
}

async function seedFixtures() {
  console.log('⚽ Seeding a completed match result (for landing page)...');
  const centre = await prisma.center.findFirst();
  const coach = await prisma.coach.findFirst();
  if (!centre || !coach) {
    console.log('⚠️ Skipping fixture seed: missing center/coach');
    return;
  }

  // Create a realistic "last match" (COMPLETED) with a score the public site can display.
  const matchDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // ~6 days ago
  matchDate.setHours(0, 0, 0, 0);

  const existing = await prisma.fixture.findFirst({
    where: {
      centerId: centre.id,
      opponent: "Bangalore Rangers",
      status: FixtureStatus.COMPLETED,
      matchDate,
    },
  });
  if (existing) {
    console.log('ℹ️ Fixture already exists, skipping');
    return;
  }

  await prisma.fixture.create({
    data: {
      centerId: centre.id,
      coachId: coach.id,
      matchType: "League",
      opponent: "Bangalore Rangers",
      matchDate,
      matchTime: "18:00",
      venue: "3Lok Football Fitness Hub",
      status: FixtureStatus.COMPLETED,
      notes: "Score: 3-1 • Great performance and high intensity throughout.",
    }
  });

  console.log('✅ Seeded: FC Real Bengaluru 3-1 Bangalore Rangers');
}

async function seedFanClubDemo() {
  // Fan Club models may not exist in older Prisma clients; use any for seed resilience.
  const p = prisma as any;
  if (!p.fanTier || !p.fanUser || !p.fanProfile) {
    console.warn("⚠️ Fan Club models not available on Prisma client. Run prisma generate and re-run seed to include Fan Club demo data.");
    return;
  }

  console.log("🟦 Seeding Fan Club demo data...");

  // Tiers
  const tierSeed = [
    { name: "Bronze", monthlyPriceINR: 49, yearlyPriceINR: 399, benefitsJson: [{ title: "Fan badge", note: "Entry identity" }], featureFlags: { games: true, matchday: true, offers: true }, sortOrder: 1, isActive: true },
    { name: "Silver", monthlyPriceINR: 79, yearlyPriceINR: 699, benefitsJson: [{ title: "Stronger sponsor unlocks", note: "Higher discounts" }], featureFlags: { games: true, matchday: true, offers: true }, sortOrder: 2, isActive: true },
    { name: "Gold", monthlyPriceINR: 129, yearlyPriceINR: 1299, benefitsJson: [{ title: "Win bonus drops", note: "Match outcomes influence perks" }], featureFlags: { games: true, matchday: true, offers: true, behindTheScenes: true }, sortOrder: 3, isActive: true },
    { name: "Elite", monthlyPriceINR: 199, yearlyPriceINR: 1999, benefitsJson: [{ title: "Inner Circle access", note: "Recognition + priority (future)" }], featureFlags: { games: true, matchday: true, offers: true, behindTheScenes: true }, sortOrder: 4, isActive: true },
  ];

  const tiers: any[] = [];
  for (const t of tierSeed) {
    const existing = await p.fanTier.findFirst({ where: { name: t.name } });
    if (existing) {
      const updated = await p.fanTier.update({ where: { id: existing.id }, data: { ...t } });
      tiers.push(updated);
    } else {
      const created = await p.fanTier.create({ data: { ...t } });
      tiers.push(created);
    }
  }

  // Sponsors
  const sponsorSeed = [
    { name: "Notch", logoAssetKey: "notch", brandPrimary: "#7C3AED", brandSecondary: "#22D3EE", description: "Performance Partner" },
    { name: "Sparsh Hospital", logoAssetKey: "sparsh", brandPrimary: "#10B981", brandSecondary: "#60A5FA", description: "Medical Partner" },
    { name: "Decathlon", logoAssetKey: "decathlon", brandPrimary: "#2563EB", brandSecondary: "#0EA5E9", description: "Equipment Partner" },
    { name: "Aces", logoAssetKey: "aces", brandPrimary: "#F59E0B", brandSecondary: "#EF4444", description: "Training & Performance Partner" },
    { name: "Hyve", logoAssetKey: "hyve", brandPrimary: "#22C55E", brandSecondary: "#A3E635", description: "Lifestyle & Community Partner" },
    { name: "Fresko", logoAssetKey: "fresko", brandPrimary: "#FB7185", brandSecondary: "#F97316", description: "Nutrition Partner" },
  ];

  const sponsors = [];
  for (const s of sponsorSeed) {
    const existing = await p.fanSponsor.findFirst({ where: { name: s.name } });
    const sponsor = existing
      ? await p.fanSponsor.update({ where: { id: existing.id }, data: { ...s, isActive: true } })
      : await p.fanSponsor.create({ data: { ...s, isActive: true } });
    sponsors.push(sponsor);
  }

  // Reward campaigns (3 per sponsor)
  for (const s of sponsors) {
    const base = [
      { title: "Win Bonus", type: "DYNAMIC_ROLLING", copy: "Extra perks if FCRB wins this week", rulesJson: { tag: "WIN_BONUS" } },
      { title: "Matchday Special", type: "DYNAMIC_ROLLING", copy: "Matchday-only reward window", rulesJson: { tag: "MATCHDAY_SPECIAL" } },
      { title: "Training Boost", type: "STATIC", copy: "Training-week offer for members", rulesJson: { tag: "TRAINING_BOOST" } },
    ];
    for (const c of base) {
      await p.rewardCampaign.create({
        data: {
          sponsorId: s.id,
          title: `${s.name} — ${c.title}`,
          type: c.type,
          copy: c.copy,
          rulesJson: c.rulesJson,
          validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          tierEligibility: [tiers[0].id, tiers[1].id, tiers[2].id, tiers[3].id],
          isActive: true,
          priority: c.title === "Matchday Special" ? 2 : c.title === "Win Bonus" ? 3 : 1,
        },
      });
    }
  }

  // Coupon pools (2 per sponsor: one single-use pool, one multi-use pool)
  for (const s of sponsors) {
    // Single-use
    const single = await p.couponPool.create({
      data: {
        sponsorId: s.id,
        name: `${s.name} — Single-use pool`,
        codeType: "SINGLE_USE",
        discountType: "PERCENT",
        discountValue: 10,
        conditionsText: "Min spend applies • Valid in select locations • Demo data",
        tierEligibility: [tiers[0].id, tiers[1].id, tiers[2].id, tiers[3].id],
        maxRedemptions: 100,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        codes: {
          create: Array.from({ length: 12 }).map((_, i) => ({ code: `${s.logoAssetKey.toUpperCase()}-ONE-${String(i + 1).padStart(3, "0")}` })),
        },
      },
    });

    // Multi-use
    await p.couponPool.create({
      data: {
        sponsorId: s.id,
        name: `${s.name} — Multi-use code`,
        codeType: "MULTI_USE",
        multiUseCode: `${s.logoAssetKey.toUpperCase()}-MULTI-REALVERSE`,
        discountType: "FLAT",
        discountValue: 200,
        conditionsText: "One use per fan • Demo data",
        tierEligibility: [tiers[1].id, tiers[2].id, tiers[3].id],
        maxRedemptions: 500,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    // Keep lint quiet about unused var for single
    void single;
  }

  // Quests
  const questSeed = [
    { title: "Matchday Check-in", description: "Open the Matchday module this week", pointsReward: 25, badgeReward: "MATCHDAY", unlockRule: "matchday", isActive: true },
    { title: "Sponsor Explorer", description: "Browse sponsor benefits and offers", pointsReward: 15, badgeReward: "PERKS", unlockRule: "offers", isActive: true },
    { title: "Weekly Trivia", description: "Answer this week’s club trivia", pointsReward: 30, badgeReward: "QUIZ", unlockRule: "quiz", isActive: true },
    { title: "Streak Starter", description: "Return 3 days in a row", pointsReward: 40, badgeReward: "STREAK", unlockRule: "streak", isActive: true },
    { title: "From Supporter to Squad", description: "Register interest in a coaching program", pointsReward: 20, badgeReward: "PATHWAY", unlockRule: "programs", isActive: true },
  ];
  for (const q of questSeed) {
    await p.fanQuest.create({ data: { ...q, tierEligibility: [tiers[0].id, tiers[1].id, tiers[2].id, tiers[3].id] } });
  }

  // Fans (10 across tiers)
  const fanPasswordHash = await hashPassword("fan123");
  const cities = ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Tumakuru"];
  const centers = ["THREELOK", "DEPOT18", "BLITZZ", "TRONIC"];
  const createdFans: any[] = [];

  for (let i = 1; i <= 10; i++) {
    const email = `fan${i}@test.com`;
    const tier = tiers[(i - 1) % tiers.length];
    const existingUser = await p.fanUser.findFirst({ where: { email } });
    let user: any;
    if (existingUser) {
      user = await p.fanUser.update({ where: { id: existingUser.id }, data: { status: "ACTIVE" }, include: { profile: true } });
      // ensure profile exists
      const existingProfile = await p.fanProfile.findFirst({ where: { userId: user.id } });
      if (existingProfile) {
        await p.fanProfile.update({
          where: { id: existingProfile.id },
          data: {
            fullName: `Fan Member ${i}`,
            phone: `90000000${String(i).padStart(2, "0")}`,
            city: cities[(i - 1) % cities.length],
            centerPreference: centers[(i - 1) % centers.length],
            tierId: tier.id,
            points: 100 + i * 7,
            badges: i % 2 === 0 ? ["EARLY_BACKER"] : ["CLUB_FAMILY"],
            streakDays: i % 5,
          },
        });
      } else {
        await p.fanProfile.create({
          data: {
            userId: user.id,
            fullName: `Fan Member ${i}`,
            phone: `90000000${String(i).padStart(2, "0")}`,
            city: cities[(i - 1) % cities.length],
            centerPreference: centers[(i - 1) % centers.length],
            tierId: tier.id,
            points: 100 + i * 7,
            badges: i % 2 === 0 ? ["EARLY_BACKER"] : ["CLUB_FAMILY"],
            streakDays: i % 5,
          },
        });
      }
      user = await p.fanUser.findFirst({ where: { id: user.id }, include: { profile: true } });
    } else {
      user = await p.fanUser.create({
        data: {
          email,
          passwordHash: fanPasswordHash,
          role: "FAN",
          status: "ACTIVE",
          profile: {
            create: {
              fullName: `Fan Member ${i}`,
              phone: `90000000${String(i).padStart(2, "0")}`,
              city: cities[(i - 1) % cities.length],
              centerPreference: centers[(i - 1) % centers.length],
              tierId: tier.id,
              points: 100 + i * 7,
              badges: i % 2 === 0 ? ["EARLY_BACKER"] : ["CLUB_FAMILY"],
              streakDays: i % 5,
            },
          },
        },
        include: { profile: true },
      });
    }
    createdFans.push(user);
  }

  // Redemptions (10 records)
  const pools = await p.couponPool.findMany({ where: { isActive: true }, take: 20 });
  for (let i = 0; i < 10; i++) {
    const fanProfile = createdFans[i].profile;
    const pool = pools[i % pools.length];
    if (!fanProfile || !pool) continue;
    try {
      let codeUsed = pool.multiUseCode || "";
      if (pool.codeType === "SINGLE_USE") {
        const code = await p.couponCode.findFirst({ where: { couponPoolId: pool.id, isUsed: false } });
        if (!code) continue;
        codeUsed = code.code;
        await p.couponCode.update({ where: { id: code.id }, data: { isUsed: true, usedAt: new Date() } });
      }
      await p.couponRedemption.create({
        data: {
          fanId: fanProfile.id,
          couponPoolId: pool.id,
          codeUsed,
          status: "REDEEMED",
        },
      });
    } catch {
      // ignore duplicates
    }
  }

  // Game sessions (2 games)
  for (let i = 0; i < 10; i++) {
    const fanProfile = createdFans[i].profile;
    if (!fanProfile) continue;
    await p.fanGameSession.create({ data: { fanId: fanProfile.id, gameType: "QUIZ", input: { q: "club" }, result: { score: 7 }, pointsEarned: 15 } });
    await p.fanGameSession.create({ data: { fanId: fanProfile.id, gameType: "PREDICT_SCORE", input: { predicted: "2-1" }, result: { actual: "3-1" }, pointsEarned: 10 } });
  }

  // Conversion leads (10 spread across programs)
  const programs = ["EPP", "SCP", "WPP", "FYDP"];
  for (let i = 0; i < 10; i++) {
    const fanProfile = createdFans[i].profile;
    if (!fanProfile) continue;
    await p.fanConversionLead.create({
      data: {
        fanId: fanProfile.id,
        programInterest: programs[i % programs.length],
        status: i % 4 === 0 ? "CONTACTED" : "NEW",
        notes: "Demo lead",
      },
    });
  }

  console.log("✅ Seeded Fan Club demo data (fans, tiers, sponsors, rewards, coupons, quests, redemptions, leads)");
}

async function main() {
  console.log('🚀 Starting QA seed...');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: Required<SeedOptions> = { ...DEFAULT_OPTIONS };
  
  for (const arg of args) {
    const [key, value] = arg.replace('--', '').split('=');
    if (key && value) {
      (options as any)[key] = parseInt(value, 10) || (value === 'true');
    }
  }
  
  console.log('Options:', options);
  
  try {
    // Seed in order
    await seedCentres(options);
    await seedCoaches(options);
    await seedAdmin(options);
    const students = await seedStudents(options);
    const sessions = await seedSessions(options, students);
    await seedAttendance(options, students, sessions);
    await seedPayments(options, students);
    await seedDrills(options);
    await seedProducts(options);
    await seedFixtures();
    await seedFanClubDemo();
    
    // Create test student account
    const testStudent = await prisma.student.upsert({
      where: { email: 'student@test.com' },
      update: {},
      create: {
        fullName: 'Test Student',
        email: 'student@test.com',
        passwordHash: await hashPassword('test123'),
        phoneNumber: '9876543210',
        parentName: 'Test Parent',
        parentPhoneNumber: '9876543211',
        centerId: (await prisma.center.findFirst())!.id,
        programType: 'ACADEMY',
        monthlyFeeAmount: 2000,
        paymentFrequency: 1,
        status: 'ACTIVE',
        joiningDate: new Date(),
      },
    });
    
    console.log('✅ Created test student account');
    console.log('\n📊 Seed Summary:');
    console.log(`   - Centres: ${options.centres}`);
    console.log(`   - Students: ${options.students} (+ 1 test student)`);
    console.log(`   - Sessions: ${options.sessions}`);
    console.log(`   - Attendance records: ~${options.attendance}`);
    console.log(`   - Payment records: ${options.students * options.invoices}`);
    console.log(`   - Drills: ${options.drills}`);
    console.log(`   - Products: ${options.products}`);
    console.log('\n✅ QA seed completed successfully!');
    console.log('\nTest credentials:');
    console.log('  Student: student@test.com / test123');
    console.log('  Coach: coach@test.com / test123');
    console.log('  Admin: admin@test.com / test123');
    console.log('  Fan Club: fan1@test.com / fan123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();


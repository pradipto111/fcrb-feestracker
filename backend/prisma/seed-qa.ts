/**
 * QA Test Data Seed Script
 * Creates realistic test data with edge cases for comprehensive testing
 * 
 * Usage:
 *   npm run seed:qa -- --students=20 --centres=4 --sessions=40
 */

import { PrismaClient } from '@prisma/client';
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
    
    const student = await prisma.student.create({
      data: {
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
        status: i === options.students - 1 ? 'INACTIVE' : 'ACTIVE',
        joiningDate: new Date(2024, 0, 1 + i),
        dateOfBirth: new Date(2010 + (i % 10), i % 12, (i % 28) + 1),
      },
    });
    
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
    await prisma.product.create({
      data: {
        name: `Test Product ${i + 1}`,
        slug: `test-product-${i + 1}`,
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
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();


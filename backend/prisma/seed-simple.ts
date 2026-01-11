import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with 2 academies and 5 students...");

  // Create 2 Academies
  const academy1 = await prisma.center.create({
    data: {
      name: "Elite Football Academy Mumbai",
      location: "Andheri West",
      city: "Mumbai",
      address: "Plot 45, Veera Desai Road, Andheri West, Mumbai - 400053"
    }
  });

  const academy2 = await prisma.center.create({
    data: {
      name: "Champions Sports Academy Pune",
      location: "Kothrud",
      city: "Pune",
      address: "Lane 7, Kothrud, Near MIT College, Pune - 411038"
    }
  });

  console.log("✅ Created 2 academies");

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

  console.log("✅ Created admin user (admin@feestrack.com / admin123)");

  // Create 1 Coach with access to ALL centers
  const coachPassword = await bcrypt.hash("coach123", 10);
  await prisma.coach.create({
    data: {
      fullName: "Rajesh Kumar",
      email: "coach@feestrack.com",
      passwordHash: coachPassword,
      role: "COACH",
      centers: {
        create: [
          { centerId: academy1.id },
          { centerId: academy2.id }
        ]
      }
    }
  });

  console.log("✅ Created 1 coach with access to ALL centers (password: coach123)");

  // Student password
  const studentPassword = await bcrypt.hash("student123", 10);

  // Create 3 Students for Academy 1 (Mumbai)
  const student1 = await prisma.student.create({
    data: {
      fullName: "Arjun Mehta",
      dateOfBirth: new Date("2010-05-15"),
      phoneNumber: "9876543210",
      parentName: "Suresh Mehta",
      parentPhoneNumber: "9876543211",
      email: "arjun.mehta@student.com",
      passwordHash: studentPassword,
      centerId: academy1.id,
      joiningDate: new Date("2024-01-15"),
      programType: "FYDP",
      monthlyFeeAmount: 5000,
      paymentFrequency: 1, // Monthly
      status: "ACTIVE"
    }
  });

  const student2 = await prisma.student.create({
    data: {
      fullName: "Priya Desai",
      dateOfBirth: new Date("2011-08-22"),
      phoneNumber: "9876543212",
      parentName: "Anil Desai",
      parentPhoneNumber: "9876543213",
      email: "priya.desai@student.com",
      passwordHash: studentPassword,
      centerId: academy1.id,
      joiningDate: new Date("2024-02-01"),
      programType: "FYDP",
      monthlyFeeAmount: 5000,
      paymentFrequency: 3, // Quarterly
      status: "ACTIVE"
    }
  });

  const student3 = await prisma.student.create({
    data: {
      fullName: "Rohan Singh",
      dateOfBirth: new Date("2009-03-10"),
      phoneNumber: "9876543214",
      parentName: "Vikram Singh",
      parentPhoneNumber: "9876543215",
      email: "rohan.singh@student.com",
      passwordHash: studentPassword,
      centerId: academy1.id,
      joiningDate: new Date("2024-01-20"),
      programType: "SCP",
      monthlyFeeAmount: 6000,
      paymentFrequency: 1, // Monthly
      status: "ACTIVE"
    }
  });

  // Create 2 Students for Academy 2 (Pune)
  const student4 = await prisma.student.create({
    data: {
      fullName: "Ananya Kapoor",
      dateOfBirth: new Date("2010-09-12"),
      phoneNumber: "9876543216",
      parentName: "Rajiv Kapoor",
      parentPhoneNumber: "9876543217",
      email: "ananya.kapoor@student.com",
      passwordHash: studentPassword,
      centerId: academy2.id,
      joiningDate: new Date("2024-03-01"),
      programType: "FYDP",
      monthlyFeeAmount: 4500,
      paymentFrequency: 6, // Half-yearly
      status: "ACTIVE"
    }
  });

  const student5 = await prisma.student.create({
    data: {
      fullName: "Vivaan Malhotra",
      dateOfBirth: new Date("2009-04-25"),
      phoneNumber: "9876543218",
      parentName: "Sanjay Malhotra",
      parentPhoneNumber: "9876543219",
      email: "vivaan.malhotra@student.com",
      passwordHash: studentPassword,
      centerId: academy2.id,
      joiningDate: new Date("2024-02-20"),
      programType: "SCP",
      monthlyFeeAmount: 5500,
      paymentFrequency: 12, // Yearly
      status: "ACTIVE"
    }
  });

  console.log("✅ Created 5 students (3 in Mumbai, 2 in Pune)");

  // Create payment history for realistic data
  const payments = [];
  
  // Arjun - Monthly payments (Jan-Nov 2024) - 11 payments
  for (let month = 0; month < 11; month++) {
    payments.push({
      studentId: student1.id,
      centerId: academy1.id,
      amount: 5000,
      paymentDate: new Date(2024, month, 20),
      paymentMode: month % 3 === 0 ? "Cash" : month % 3 === 1 ? "Bank Transfer" : "UPI",
      upiOrTxnReference: month % 3 === 2 ? `upi@okaxis-${month}` : month % 3 === 1 ? `TXN${1000 + month}` : null
    });
  }

  // Priya - Quarterly payments (Feb, May, Aug, Nov) - 4 payments
  [1, 4, 7, 10].forEach((month, idx) => {
    payments.push({
      studentId: student2.id,
      centerId: academy1.id,
      amount: 15000, // 3 months
      paymentDate: new Date(2024, month, 5),
      paymentMode: "Bank Transfer",
      upiOrTxnReference: `TXN${2000 + idx}`
    });
  });

  // Rohan - Monthly payments (Jan-Oct) - 10 payments
  for (let month = 0; month < 10; month++) {
    payments.push({
      studentId: student3.id,
      centerId: academy1.id,
      amount: 6000,
      paymentDate: new Date(2024, month, 25),
      paymentMode: month % 2 === 0 ? "UPI" : "Cash",
      upiOrTxnReference: month % 2 === 0 ? `upi@paytm-${month}` : null
    });
  }

  // Ananya - Half-yearly payments (March, September) - 2 payments
  [2, 8].forEach((month, idx) => {
    payments.push({
      studentId: student4.id,
      centerId: academy2.id,
      amount: 27000, // 6 months
      paymentDate: new Date(2024, month, 10),
      paymentMode: "Bank Transfer",
      upiOrTxnReference: `TXN${3000 + idx}`,
      notes: "Half-yearly payment"
    });
  });

  // Vivaan - Yearly payment (February) - 1 payment
  payments.push({
    studentId: student5.id,
    centerId: academy2.id,
    amount: 66000, // 12 months
    paymentDate: new Date(2024, 1, 25),
    paymentMode: "Bank Transfer",
    upiOrTxnReference: "TXN4000",
    notes: "Annual payment"
  });

  await prisma.payment.createMany({ data: payments });

  console.log(`✅ Created ${payments.length} payment records`);

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Login credentials:");
  console.log("   👨‍💼 Admin: admin@feestrack.com / admin123");
  console.log("   👨‍🏫 Coach (All Centers): coach@feestrack.com / coach123");
  console.log("\n   🎓 Student Examples:");
  console.log("   Arjun Mehta: arjun.mehta@student.com / student123");
  console.log("   (All students use password: student123)");
  console.log("\n📊 Summary:");
  console.log("   - 2 Academies (Mumbai, Pune)");
  console.log("   - 5 Students (3 in Mumbai, 2 in Pune)");
  console.log(`   - ${payments.length} Payment records`);
  console.log("   - Various payment frequencies (Monthly, Quarterly, Half-yearly, Yearly)");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


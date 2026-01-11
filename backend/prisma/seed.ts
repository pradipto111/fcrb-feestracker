import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Centers
  const center1 = await prisma.center.create({
    data: {
      name: "Downtown Sports Academy",
      location: "Downtown",
      city: "Mumbai",
      address: "123 Main Street, Downtown, Mumbai"
    }
  });

  const center2 = await prisma.center.create({
    data: {
      name: "Westside Football Club",
      location: "Westside",
      city: "Mumbai",
      address: "456 West Avenue, Mumbai"
    }
  });

  const center3 = await prisma.center.create({
    data: {
      name: "Eastend Training Center",
      location: "Eastend",
      city: "Pune",
      address: "789 East Road, Pune"
    }
  });

  console.log("✅ Created 3 centers");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.coach.create({
    data: {
      fullName: "Admin User",
      email: "admin@feestrack.com",
      passwordHash: adminPassword,
      role: "ADMIN"
    }
  });

  console.log("✅ Created admin user (admin@feestrack.com / admin123)");

  // Create Coaches
  const coach1Password = await bcrypt.hash("coach123", 10);
  const coach1 = await prisma.coach.create({
    data: {
      fullName: "Rajesh Kumar",
      email: "rajesh@feestrack.com",
      passwordHash: coach1Password,
      role: "COACH",
      centers: {
        create: [{ centerId: center1.id }]
      }
    }
  });

  const coach2Password = await bcrypt.hash("coach123", 10);
  const coach2 = await prisma.coach.create({
    data: {
      fullName: "Priya Sharma",
      email: "priya@feestrack.com",
      passwordHash: coach2Password,
      role: "COACH",
      centers: {
        create: [{ centerId: center2.id }]
      }
    }
  });

  const coach3Password = await bcrypt.hash("coach123", 10);
  const coach3 = await prisma.coach.create({
    data: {
      fullName: "Amit Patel",
      email: "amit@feestrack.com",
      passwordHash: coach3Password,
      role: "COACH",
      centers: {
        create: [{ centerId: center3.id }]
      }
    }
  });

  console.log("✅ Created 3 coaches (password: coach123)");

  // Student password (all students use: student123)
  const studentPassword = await bcrypt.hash("student123", 10);

  // Create Students for Center 1 (Downtown)
  const students1 = await Promise.all([
    prisma.student.create({
      data: {
        fullName: "Arjun Mehta",
        dateOfBirth: new Date("2010-05-15"),
        phoneNumber: "9876543210",
        parentName: "Suresh Mehta",
        parentPhoneNumber: "9876543211",
        email: "arjun.mehta@student.com",
        passwordHash: studentPassword,
        centerId: center1.id,
        joiningDate: new Date("2024-01-15"),
        programType: "FYDP",
        monthlyFeeAmount: 3000,
        status: "ACTIVE"
      }
    }),
    prisma.student.create({
      data: {
        fullName: "Sneha Reddy",
        dateOfBirth: new Date("2011-08-22"),
        phoneNumber: "9876543212",
        parentName: "Ramesh Reddy",
        parentPhoneNumber: "9876543213",
        email: "sneha.reddy@student.com",
        passwordHash: studentPassword,
        centerId: center1.id,
        joiningDate: new Date("2024-02-01"),
        programType: "FYDP",
        monthlyFeeAmount: 3000,
        status: "ACTIVE"
      }
    }),
    prisma.student.create({
      data: {
        fullName: "Rohan Singh",
        dateOfBirth: new Date("2009-03-10"),
        phoneNumber: "9876543214",
        parentName: "Vikram Singh",
        parentPhoneNumber: "9876543215",
        email: "rohan.singh@student.com",
        passwordHash: studentPassword,
        centerId: center1.id,
        joiningDate: new Date("2024-01-20"),
        programType: "SCP",
        monthlyFeeAmount: 3500,
        status: "ACTIVE"
      }
    })
  ]);

  // Create Students for Center 2 (Westside)
  const students2 = await Promise.all([
    prisma.student.create({
      data: {
        fullName: "Kavya Desai",
        dateOfBirth: new Date("2010-11-05"),
        phoneNumber: "9876543216",
        parentName: "Anil Desai",
        parentPhoneNumber: "9876543217",
        email: "kavya.desai@student.com",
        passwordHash: studentPassword,
        centerId: center2.id,
        joiningDate: new Date("2024-03-01"),
        programType: "FYDP",
        monthlyFeeAmount: 3000,
        status: "ACTIVE"
      }
    }),
    prisma.student.create({
      data: {
        fullName: "Aditya Joshi",
        dateOfBirth: new Date("2009-07-18"),
        phoneNumber: "9876543218",
        parentName: "Prakash Joshi",
        parentPhoneNumber: "9876543219",
        email: "aditya.joshi@student.com",
        passwordHash: studentPassword,
        centerId: center2.id,
        joiningDate: new Date("2024-02-15"),
        programType: "SCP",
        monthlyFeeAmount: 3500,
        status: "ACTIVE"
      }
    }),
    prisma.student.create({
      data: {
        fullName: "Ishaan Verma",
        dateOfBirth: new Date("2012-01-30"),
        phoneNumber: "9876543220",
        parentName: "Deepak Verma",
        parentPhoneNumber: "9876543221",
        email: "ishaan.verma@student.com",
        passwordHash: studentPassword,
        centerId: center2.id,
        joiningDate: new Date("2024-11-01"),
        programType: "FYDP",
        monthlyFeeAmount: 3000,
        status: "TRIAL"
      }
    })
  ]);

  // Create Students for Center 3 (Eastend)
  const students3 = await Promise.all([
    prisma.student.create({
      data: {
        fullName: "Ananya Kapoor",
        dateOfBirth: new Date("2010-09-12"),
        phoneNumber: "9876543222",
        parentName: "Rajiv Kapoor",
        parentPhoneNumber: "9876543223",
        email: "ananya.kapoor@student.com",
        passwordHash: studentPassword,
        centerId: center3.id,
        joiningDate: new Date("2024-01-10"),
        programType: "FYDP",
        monthlyFeeAmount: 2800,
        status: "ACTIVE"
      }
    }),
    prisma.student.create({
      data: {
        fullName: "Vivaan Malhotra",
        dateOfBirth: new Date("2009-04-25"),
        phoneNumber: "9876543224",
        parentName: "Sanjay Malhotra",
        parentPhoneNumber: "9876543225",
        email: "vivaan.malhotra@student.com",
        passwordHash: studentPassword,
        centerId: center3.id,
        joiningDate: new Date("2024-02-20"),
        programType: "SCP",
        monthlyFeeAmount: 3200,
        status: "ACTIVE"
      }
    })
  ]);

  console.log("✅ Created 8 students with login credentials (password: student123)");

  // Create extensive payment history
  await prisma.payment.createMany({
    data: [
      // Arjun Mehta - 10 months of payments (Jan-Oct 2024)
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-01-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-jan"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-02-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-feb"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-03-20"),
        paymentMode: "Cash",
        notes: "Paid in cash"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-04-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-apr"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-05-20"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN789012"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-06-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-jun"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-07-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-jul"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-08-20"),
        paymentMode: "Cash"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-09-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-sep"
      },
      {
        studentId: students1[0].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-10-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-oct"
      },
      // Sneha Reddy - 8 months (Feb-Sep)
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-02-05"),
        paymentMode: "Cash",
        notes: "Paid in cash"
      },
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-03-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-123"
      },
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-04-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-456"
      },
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-05-05"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN456789"
      },
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-06-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-789"
      },
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-07-05"),
        paymentMode: "Cash"
      },
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-08-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-aug"
      },
      {
        studentId: students1[1].id,
        centerId: center1.id,
        amount: 3000,
        paymentDate: new Date("2024-09-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-sep"
      },
      // Rohan Singh - 9 months
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-01-25"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN789012"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-02-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-feb"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-03-25"),
        paymentMode: "Cash"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-04-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-apr"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-05-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-may"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-06-25"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN654321"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-07-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-jul"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-08-25"),
        paymentMode: "Cash"
      },
      {
        studentId: students1[2].id,
        centerId: center1.id,
        amount: 3500,
        paymentDate: new Date("2024-09-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-sep"
      },
      // Kavya Desai - 8 months
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-03-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-mar"
      },
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-04-05"),
        paymentMode: "Cash"
      },
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-05-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-may"
      },
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-06-05"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN111222"
      },
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-07-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-jul"
      },
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-08-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-aug"
      },
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-09-05"),
        paymentMode: "Cash"
      },
      {
        studentId: students2[0].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-10-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-oct"
      },
      // Aditya Joshi - 9 months
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-02-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-feb"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-03-20"),
        paymentMode: "Cash"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-04-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-apr"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-05-20"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN333444"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-06-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-jun"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-07-20"),
        paymentMode: "Cash"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-08-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-aug"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-09-20"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-sep"
      },
      {
        studentId: students2[1].id,
        centerId: center2.id,
        amount: 3500,
        paymentDate: new Date("2024-10-20"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN555666"
      },
      // Ishaan Verma - 1 payment (trial student)
      {
        studentId: students2[2].id,
        centerId: center2.id,
        amount: 3000,
        paymentDate: new Date("2024-11-05"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-trial"
      },
      // Ananya Kapoor - 10 months
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-01-15"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-jan"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-02-15"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-feb"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-03-15"),
        paymentMode: "Cash"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-04-15"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-apr"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-05-15"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN777888"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-06-15"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-jun"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-07-15"),
        paymentMode: "Cash"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-08-15"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-aug"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-09-15"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-sep"
      },
      {
        studentId: students3[0].id,
        centerId: center3.id,
        amount: 2800,
        paymentDate: new Date("2024-10-15"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN999000"
      },
      // Vivaan Malhotra - 9 months
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-02-25"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN890123"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-03-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-mar"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-04-25"),
        paymentMode: "Cash"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-05-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@gpay-may"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-06-25"),
        paymentMode: "Bank Transfer",
        upiOrTxnReference: "TXN112233"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-07-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@phonepe-jul"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-08-25"),
        paymentMode: "Cash"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-09-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@okaxis-sep"
      },
      {
        studentId: students3[1].id,
        centerId: center3.id,
        amount: 3200,
        paymentDate: new Date("2024-10-25"),
        paymentMode: "UPI",
        upiOrTxnReference: "upi@paytm-oct"
      }
    ]
  });

  console.log("✅ Created 70+ payment records with realistic history");

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Login credentials:");
  console.log("   Admin: admin@feestrack.com / admin123");
  console.log("   Coach 1 (Downtown): rajesh@feestrack.com / coach123");
  console.log("   Coach 2 (Westside): priya@feestrack.com / coach123");
  console.log("   Coach 3 (Eastend): amit@feestrack.com / coach123");
  console.log("\n   🎓 Student Login (Example):");
  console.log("   Arjun Mehta: arjun.mehta@student.com / student123");
  console.log("   (All students use password: student123)");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

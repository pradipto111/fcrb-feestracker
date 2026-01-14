import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkChurnedStudents() {
  try {
    const churnedStudents = await prisma.student.findMany({
      where: {
        status: 'INACTIVE',
        churnedDate: { not: null }
      },
      select: {
        id: true,
        fullName: true,
        churnedDate: true,
        status: true,
        monthlyFeeAmount: true
      },
      orderBy: {
        churnedDate: 'desc'
      }
    });

    console.log(`\n📊 Found ${churnedStudents.length} churned students:\n`);
    churnedStudents.forEach(s => {
      console.log(`  - ${s.fullName}: Churned on ${s.churnedDate?.toISOString().split('T')[0]}`);
    });

    // Also check students with INACTIVE status but no churnedDate
    const inactiveWithoutChurn = await prisma.student.findMany({
      where: {
        status: 'INACTIVE',
        churnedDate: null
      },
      select: {
        id: true,
        fullName: true,
        status: true
      }
    });

    if (inactiveWithoutChurn.length > 0) {
      console.log(`\n⚠️  Found ${inactiveWithoutChurn.length} INACTIVE students without churnedDate:\n`);
      inactiveWithoutChurn.forEach(s => {
        console.log(`  - ${s.fullName}`);
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkChurnedStudents();

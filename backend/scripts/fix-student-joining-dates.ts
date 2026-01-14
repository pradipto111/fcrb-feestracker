import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStudentJoiningDates() {
  try {
    console.log('🔄 Fixing student joining dates based on first payment...\n');

    // Get all students
    const students = await prisma.student.findMany({
      include: {
        payments: {
          orderBy: {
            paymentDate: 'asc'
          }
        }
      }
    });

    let updated = 0;
    let skipped = 0;

    for (const student of students) {
      // If student already has a joining date, check if it needs updating
      const hasJoiningDate = student.joiningDate !== null;
      
      // Get first payment
      const firstPayment = student.payments[0];
      
      if (!firstPayment) {
        console.log(`⏭️  ${student.fullName}: No payments found, skipping`);
        skipped++;
        continue;
      }

      // Get the first day of the month of the first payment
      const firstPaymentDate = new Date(firstPayment.paymentDate);
      const year = firstPaymentDate.getFullYear();
      const month = firstPaymentDate.getMonth(); // 0-11 (0 = January, 11 = December)
      const joiningDate = new Date(year, month, 1);
      
      // Normalize to avoid timezone issues
      joiningDate.setHours(0, 0, 0, 0);

      // Update if:
      // 1. No joining date exists, OR
      // 2. Existing joining date is after the first payment date
      const shouldUpdate = !hasJoiningDate || 
        (hasJoiningDate && new Date(student.joiningDate!) > firstPaymentDate);

      if (shouldUpdate) {
        await prisma.student.update({
          where: { id: student.id },
          data: {
            joiningDate: joiningDate
          }
        });

        const oldDate = hasJoiningDate ? new Date(student.joiningDate!).toISOString().split('T')[0] : 'None';
        console.log(`✅ ${student.fullName}: Updated joining date from ${oldDate} to ${joiningDate.toISOString().split('T')[0]} (based on first payment: ${firstPaymentDate.toISOString().split('T')[0]})`);
        updated++;
      } else {
        console.log(`⏭️  ${student.fullName}: Joining date already correct (${new Date(student.joiningDate!).toISOString().split('T')[0]})`);
        skipped++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📝 Total students processed: ${students.length}`);

  } catch (error: any) {
    console.error('❌ Error fixing joining dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixStudentJoiningDates()
  .then(() => {
    console.log('\n✅ Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPaymentDates() {
  try {
    console.log('🔄 Fixing payment dates to be on the 1st of each month...\n');

    // Get all payments
    const payments = await prisma.payment.findMany({
      orderBy: {
        paymentDate: 'asc'
      }
    });

    let updated = 0;
    let skipped = 0;

    for (const payment of payments) {
      const paymentDate = new Date(payment.paymentDate);
      // Ensure we're working with the correct month (getMonth() is 0-indexed)
      const year = paymentDate.getFullYear();
      const month = paymentDate.getMonth(); // 0-11 (0 = January, 11 = December)
      const firstOfMonth = new Date(year, month, 1);
      
      // Normalize to avoid timezone issues
      firstOfMonth.setHours(0, 0, 0, 0);
      
      // Check if payment is already on the 1st
      if (paymentDate.getDate() === 1 && 
          paymentDate.getMonth() === firstOfMonth.getMonth() &&
          paymentDate.getFullYear() === firstOfMonth.getFullYear()) {
        skipped++;
        continue;
      }

      // Update payment date to first of the month
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentDate: firstOfMonth
        }
      });

      const student = await prisma.student.findUnique({
        where: { id: payment.studentId },
        select: { fullName: true }
      });

      console.log(`✅ ${student?.fullName || `Student ${payment.studentId}`}: Updated payment date from ${paymentDate.toISOString().split('T')[0]} to ${firstOfMonth.toISOString().split('T')[0]} (Amount: ₹${payment.amount})`);
      updated++;
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated: ${updated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📝 Total payments processed: ${payments.length}`);

  } catch (error: any) {
    console.error('❌ Error fixing payment dates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixPaymentDates()
  .then(() => {
    console.log('\n✅ Fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  });

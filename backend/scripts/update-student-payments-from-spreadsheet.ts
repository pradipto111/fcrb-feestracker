import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface StudentPaymentData {
  name: string;
  phone?: string;
  presentCenter: string;
  subscriptionStatus: 'Active' | 'Paused' | 'Churned';
  monthlyFee?: number;
  payments: {
    [month: string]: number | null; // April, May, June, etc. -> amount or null
  };
  startDate?: string; // DD/MM/YYYY format
  comments?: string;
}

// Map center names to program types
function mapCenterToProgramType(centerName: string): string {
  const normalized = centerName.toLowerCase().trim();
  if (normalized.includes('depot18')) return 'SCP';
  if (normalized.includes('trilok')) return 'EPP';
  if (normalized.includes('blitzz')) return 'FYDP';
  return 'EPP'; // default
}

// Map subscription status to StudentStatus
function mapStatus(status: string): 'ACTIVE' | 'INACTIVE' | 'TRIAL' {
  const normalized = status.toLowerCase().trim();
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'churned' || normalized === 'paused') return 'INACTIVE';
  return 'ACTIVE';
}

// Parse date from DD/MM/YYYY format
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Get month number from month name
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'april': 3, // 0-indexed: April = 3
    'may': 4,
    'june': 5,
    'july': 6,
    'august': 7,
    'september': 8,
    'october': 9,
    'november': 10,
    'december': 11,
    'january': 0,
    'february': 1,
    'march': 2,
  };
  return months[monthName.toLowerCase()] ?? -1;
}

// Get year for a month (April-Dec = 2025, Jan-Mar = 2026)
function getYearForMonth(monthName: string): number {
  const monthNum = getMonthNumber(monthName);
  if (monthNum >= 0 && monthNum <= 2) return 2026; // Jan, Feb, Mar
  return 2025; // Apr through Dec
}

// Find student by name and phone
async function findStudent(name: string, phone?: string) {
  const normalizedName = name.trim().toLowerCase();
  
  // Try to find by name and phone first
  if (phone && phone.trim()) {
    const byPhone = await prisma.student.findFirst({
      where: {
        fullName: { equals: name, mode: 'insensitive' },
        phoneNumber: phone.trim()
      }
    });
    if (byPhone) return byPhone;
  }
  
  // Try by name only
  const byName = await prisma.student.findFirst({
    where: {
      fullName: { equals: name, mode: 'insensitive' }
    }
  });
  
  return byName;
}

async function updateStudentPayments(studentData: StudentPaymentData) {
  try {
    // Find the student
    const student = await findStudent(studentData.name, studentData.phone);
    
    if (!student) {
      console.log(`⚠️  Student not found: ${studentData.name} (${studentData.phone || 'no phone'})`);
      return { success: false, reason: 'Student not found' };
    }

    console.log(`\n📝 Processing: ${student.fullName} (ID: ${student.id})`);

    // Delete all existing payments for this student
    const deletedCount = await prisma.payment.deleteMany({
      where: { studentId: student.id }
    });
    console.log(`   🗑️  Deleted ${deletedCount.count} existing payments`);

    // Create new payments based on spreadsheet data
    const paymentPromises: Promise<any>[] = [];
    let lastPaymentMonth: { month: string; year: number } | null = null;

    for (const [monthName, amount] of Object.entries(studentData.payments)) {
      if (amount !== null && amount > 0) {
        const year = getYearForMonth(monthName);
        const monthNum = getMonthNumber(monthName);
        
        if (monthNum === -1) {
          console.log(`   ⚠️  Invalid month name: ${monthName}`);
          continue;
        }

        const paymentDate = new Date(year, monthNum, 1);
        paymentDate.setHours(0, 0, 0, 0);

        // Track last payment month for churned students
        if (!lastPaymentMonth || 
            year > lastPaymentMonth.year || 
            (year === lastPaymentMonth.year && monthNum > getMonthNumber(lastPaymentMonth.month))) {
          lastPaymentMonth = { month: monthName, year };
        }

        paymentPromises.push(
          prisma.payment.create({
            data: {
              studentId: student.id,
              centerId: student.centerId,
              amount: Math.round(amount),
              paymentDate: paymentDate,
              paymentMode: 'CASH', // Default, can be updated manually
              notes: studentData.comments || null
            }
          })
        );
      }
    }

    await Promise.all(paymentPromises);
    console.log(`   ✅ Created ${paymentPromises.length} new payments`);

    // Update student status
    const newStatus = mapStatus(studentData.subscriptionStatus);
    const updateData: any = {
      status: newStatus
    };

    // Handle churned students
    if (studentData.subscriptionStatus === 'Churned' && lastPaymentMonth) {
      const churnYear = lastPaymentMonth.year;
      const churnMonthNum = getMonthNumber(lastPaymentMonth.month);
      // Churn date is the 1st of the month AFTER the last payment
      const churnDate = new Date(churnYear, churnMonthNum + 1, 1);
      churnDate.setHours(0, 0, 0, 0);
      updateData.churnedDate = churnDate;
      console.log(`   🔴 Marked as CHURNED - Last payment: ${lastPaymentMonth.month} ${lastPaymentMonth.year}, Churn date: ${churnDate.toISOString().split('T')[0]}`);
    } else if (studentData.subscriptionStatus === 'Paused') {
      // For paused students, also set churnedDate to stop fee tracking
      if (lastPaymentMonth) {
        const pauseYear = lastPaymentMonth.year;
        const pauseMonthNum = getMonthNumber(lastPaymentMonth.month);
        const pauseDate = new Date(pauseYear, pauseMonthNum + 1, 1);
        pauseDate.setHours(0, 0, 0, 0);
        updateData.churnedDate = pauseDate;
        console.log(`   ⏸️  Marked as PAUSED - Last payment: ${lastPaymentMonth.month} ${lastPaymentMonth.year}`);
      }
    } else {
      // Active students - clear churnedDate if it exists
      updateData.churnedDate = null;
    }

    // Update joining date if provided
    if (studentData.startDate) {
      const joiningDate = parseDate(studentData.startDate);
      if (joiningDate) {
        updateData.joiningDate = joiningDate;
        console.log(`   📅 Updated joining date: ${studentData.startDate} -> ${joiningDate.toISOString().split('T')[0]}`);
      }
    }

    // Update monthly fee if provided
    if (studentData.monthlyFee) {
      updateData.monthlyFeeAmount = Math.round(studentData.monthlyFee);
    }

    // Update student record
    await prisma.student.update({
      where: { id: student.id },
      data: updateData
    });

    console.log(`   ✅ Updated student status: ${newStatus}`);
    return { success: true, studentId: student.id };

  } catch (error: any) {
    console.error(`   ❌ Error processing ${studentData.name}:`, error.message);
    return { success: false, reason: error.message };
  }
}

// Main function to process all students
async function processAllStudents(studentsData: StudentPaymentData[]) {
  console.log(`\n🚀 Starting payment update for ${studentsData.length} students...\n`);

  const results = {
    success: 0,
    failed: 0,
    notFound: 0
  };

  for (const studentData of studentsData) {
    const result = await updateStudentPayments(studentData);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      if (result.reason === 'Student not found') {
        results.notFound++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully updated: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Not found: ${results.notFound}`);
  console.log(`   📝 Total processed: ${studentsData.length}\n`);
}

// Example data structure - This should be populated with actual data from the spreadsheet
// The user will need to provide this data in JSON format
const exampleStudentData: StudentPaymentData[] = [
  // Example entry - replace with actual data from spreadsheet
  // {
  //   name: "Anthony",
  //   phone: "8296777374",
  //   presentCenter: "Depot18",
  //   subscriptionStatus: "Churned",
  //   monthlyFee: 5000,
  //   payments: {
  //     "July": 5000,
  //     "August": 5000,
  //     "September": 5000
  //   },
  //   startDate: "05/07/2025",
  //   comments: ""
  // }
];

// If running directly, expect JSON input
if (require.main === module) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('📋 Student Payment Update Script');
  console.log('================================\n');
  console.log('Please provide the student data in JSON format.');
  console.log('The data should be an array of student objects with the following structure:');
  console.log(JSON.stringify(exampleStudentData, null, 2));
  console.log('\nPaste the JSON data below (end with Ctrl+D or empty line):\n');

  let input = '';
  rl.on('line', (line) => {
    if (line.trim() === '') {
      rl.close();
    } else {
      input += line + '\n';
    }
  });

  rl.on('close', async () => {
    try {
      const studentsData: StudentPaymentData[] = JSON.parse(input);
      await processAllStudents(studentsData);
    } catch (error: any) {
      console.error('❌ Error parsing JSON:', error.message);
      console.error('\nPlease ensure the JSON is valid and follows the expected structure.');
    } finally {
      await prisma.$disconnect();
      process.exit(0);
    }
  });
}

export { updateStudentPayments, processAllStudents, StudentPaymentData };

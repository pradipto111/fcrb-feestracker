import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StudentPaymentData {
  name: string;
  phone?: string;
  presentCenter: string;
  subscriptionStatus: 'Active' | 'Paused' | 'Churned';
  monthlyFee?: number;
  payments: Map<string, number>; // month -> amount
  startDate?: string;
  comments?: string;
}

// Map center names to program types
function mapCenterToProgramType(centerName: string): string {
  const normalized = centerName.toLowerCase().trim();
  if (normalized.includes('depot18')) return 'SCP';
  if (normalized.includes('trilok')) return 'EPP';
  if (normalized.includes('blitzz')) return 'FYDP';
  return 'EPP';
}

// Map subscription status
function mapStatus(status: string): 'ACTIVE' | 'INACTIVE' | 'TRIAL' {
  const normalized = status.toLowerCase().trim();
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'churned' || normalized === 'paused') return 'INACTIVE';
  return 'ACTIVE';
}

// Parse date from DD/MM/YYYY
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Get month number (0-indexed)
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'january': 0, 'february': 1, 'march': 2,
    'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8,
    'october': 9, 'november': 10, 'december': 11,
  };
  return months[monthName.toLowerCase()] ?? -1;
}

// Get year for month
function getYearForMonth(monthName: string): number {
  const monthNum = getMonthNumber(monthName);
  if (monthNum >= 0 && monthNum <= 2) return 2026; // Jan, Feb, Mar
  return 2025; // Apr through Dec
}

// Parse amount (handles ₹, commas, etc.)
function parseAmount(amountStr: string): number | null {
  if (!amountStr || amountStr.trim() === '') return null;
  const cleaned = amountStr.replace(/[₹,\s]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? null : amount;
}

// Find student
async function findStudent(name: string, phone?: string) {
  const nameTrimmed = name.trim();
  
  if (phone && phone.trim()) {
    const byPhone = await prisma.student.findFirst({
      where: {
        fullName: { equals: nameTrimmed, mode: 'insensitive' },
        phoneNumber: phone.trim()
      }
    });
    if (byPhone) return byPhone;
  }
  
  const byName = await prisma.student.findFirst({
    where: {
      fullName: { equals: nameTrimmed, mode: 'insensitive' }
    }
  });
  
  return byName;
}

// Parse CSV with flexible structure
function parseCSV(csvPath: string): StudentPaymentData[] {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least header and one data row');
  }

  // Parse header
  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
  
  const nameIdx = headers.findIndex(h => h.includes('name') && !h.includes('phone'));
  const phoneIdx = headers.findIndex(h => h.includes('phone'));
  const centerIdx = headers.findIndex(h => (h.includes('center') || h.includes('centre')) && !h.includes('present'));
  const presentCenterIdx = headers.findIndex(h => h.includes('present') && (h.includes('center') || h.includes('centre')));
  const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('subscription'));
  const monthlyIdx = headers.findIndex(h => h.includes('monthly') && !h.includes('fee'));
  const startDateIdx = headers.findIndex(h => (h.includes('start') || h.includes('joining')) && h.includes('date'));
  const commentsIdx = headers.findIndex(h => h.includes('comment'));

  // Find month columns
  const monthColumns: Array<{ month: string; year: number; index: number }> = [];
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                      'july', 'august', 'september', 'october', 'november', 'december'];
  
  headers.forEach((header, idx) => {
    const headerLower = header.toLowerCase().trim();
    for (const monthName of monthNames) {
      if (headerLower === monthName || headerLower.includes(monthName)) {
        let year = 2025;
        if (['january', 'february', 'march'].includes(monthName)) {
          year = 2026;
        }
        // Check if year is in header
        const yearMatch = header.match(/(20\d{2})/);
        if (yearMatch) {
          year = parseInt(yearMatch[1]);
        }
        monthColumns.push({ month: monthName, year, index: idx });
        break;
      }
    }
  });

  // Parse data rows
  const students: StudentPaymentData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i];
    
    // Handle quoted fields with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length < headers.length) {
      // Try simple split if parsing failed
      const simpleValues = line.split(',');
      if (simpleValues.length >= headers.length) {
        values.length = 0;
        values.push(...simpleValues.map(v => v.trim()));
      }
    }

    const name = nameIdx >= 0 && values[nameIdx] ? values[nameIdx].replace(/"/g, '') : '';
    if (!name || name === '') continue;

    const phone = phoneIdx >= 0 ? values[phoneIdx]?.replace(/"/g, '') : undefined;
    const center = (presentCenterIdx >= 0 ? values[presentCenterIdx] : 
                   centerIdx >= 0 ? values[centerIdx] : '')?.replace(/"/g, '') || '';
    const status = statusIdx >= 0 ? values[statusIdx]?.replace(/"/g, '') : 'Active';
    const monthlyFee = monthlyIdx >= 0 ? parseAmount(values[monthlyIdx]?.replace(/"/g, '')) : undefined;
    const startDate = startDateIdx >= 0 ? values[startDateIdx]?.replace(/"/g, '') : undefined;
    const comments = commentsIdx >= 0 ? values[commentsIdx]?.replace(/"/g, '') : undefined;

    const payments = new Map<string, number>();
    monthColumns.forEach(({ month, index }) => {
      if (index < values.length) {
        const amount = parseAmount(values[index]?.replace(/"/g, ''));
        if (amount !== null && amount > 0) {
          payments.set(month, amount);
        }
      }
    });

    students.push({
      name,
      phone,
      presentCenter: center,
      subscriptionStatus: (status === 'Churned' ? 'Churned' : 
                           status === 'Paused' ? 'Paused' : 'Active') as 'Active' | 'Paused' | 'Churned',
      monthlyFee: monthlyFee || undefined,
      payments,
      startDate,
      comments
    });
  }

  return students;
}

async function updateStudentPayments(studentData: StudentPaymentData) {
  try {
    const student = await findStudent(studentData.name, studentData.phone);
    
    if (!student) {
      console.log(`⚠️  Not found: ${studentData.name} (${studentData.phone || 'no phone'})`);
      return { success: false, reason: 'not_found' };
    }

    console.log(`\n📝 ${student.fullName} (ID: ${student.id})`);

    // Delete existing payments
    const deleted = await prisma.payment.deleteMany({
      where: { studentId: student.id }
    });
    console.log(`   🗑️  Deleted ${deleted.count} payments`);

    // Create new payments
    const paymentPromises: Promise<any>[] = [];
    let lastPayment: { month: string; year: number } | null = null;

    const paymentEntries = Array.from(studentData.payments.entries());
    for (const [monthName, amount] of paymentEntries) {
      const year = getYearForMonth(monthName);
      const monthNum = getMonthNumber(monthName);
      
      if (monthNum === -1) continue;

      const paymentDate = new Date(year, monthNum, 1);
      paymentDate.setHours(0, 0, 0, 0);

      if (!lastPayment || year > lastPayment.year || 
          (year === lastPayment.year && monthNum > getMonthNumber(lastPayment.month))) {
        lastPayment = { month: monthName, year };
      }

      paymentPromises.push(
        prisma.payment.create({
          data: {
            studentId: student.id,
            centerId: student.centerId,
            amount: Math.round(amount),
            paymentDate,
            paymentMode: 'CASH',
            notes: studentData.comments || null
          }
        })
      );
    }

    await Promise.all(paymentPromises);
    console.log(`   ✅ Created ${paymentPromises.length} payments`);

    // Update student
    const newStatus = mapStatus(studentData.subscriptionStatus);
    const updateData: any = { status: newStatus };

    // Handle churned/paused
    if ((studentData.subscriptionStatus === 'Churned' || studentData.subscriptionStatus === 'Paused') && lastPayment) {
      const churnYear = lastPayment.year;
      const churnMonthNum = getMonthNumber(lastPayment.month);
      const churnDate = new Date(churnYear, churnMonthNum + 1, 1);
      churnDate.setHours(0, 0, 0, 0);
      updateData.churnedDate = churnDate;
      console.log(`   🔴 ${studentData.subscriptionStatus.toUpperCase()} - Last payment: ${lastPayment.month} ${lastPayment.year}`);
    } else {
      updateData.churnedDate = null;
    }

    // Update joining date
    if (studentData.startDate) {
      const joiningDate = parseDate(studentData.startDate);
      if (joiningDate) {
        updateData.joiningDate = joiningDate;
        console.log(`   📅 Joining: ${studentData.startDate}`);
      }
    }

    // Update monthly fee
    if (studentData.monthlyFee) {
      updateData.monthlyFeeAmount = Math.round(studentData.monthlyFee);
    }

    await prisma.student.update({
      where: { id: student.id },
      data: updateData
    });

    console.log(`   ✅ Status: ${newStatus}`);
    return { success: true };

  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

async function main() {
  const csvPath = path.join(__dirname, '../', 'student-payments-update.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    console.error('\nPlease export your spreadsheet as CSV and save it as:');
    console.error(`   ${csvPath}`);
    console.error('\nThe CSV should have columns: Name, Phone, Present Center, Subscription Status, Monthly,');
    console.error('April, May, June, July, August, September, October, November, December, January, February, March,');
    console.error('Amount Collected, Expected Yearly Fees, Start Date, COMMENTS');
    process.exit(1);
  }

  console.log('📋 Reading CSV file...\n');
  const studentsData = parseCSV(csvPath);
  console.log(`Found ${studentsData.length} students in CSV\n`);

  const results = { success: 0, failed: 0, notFound: 0 };

  for (const studentData of studentsData) {
    const result = await updateStudentPayments(studentData);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      if (result.reason === 'not_found') {
        results.notFound++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Not found: ${results.notFound}`);
  console.log(`   📝 Total: ${studentsData.length}\n`);
}

main()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    prisma.$disconnect();
    process.exit(1);
  });

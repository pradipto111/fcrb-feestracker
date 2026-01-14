import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface StudentData {
  name: string;
  phone?: string;
  centerName: string;
  subscriptionStatus?: string;
  monthlyFee?: number;
  startDate?: string;
  payments: Array<{
    month: string;
    year: number;
    amount: number;
  }>;
  comments?: string;
}

function parseCSV(csvContent: string): StudentData[] {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row");
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const nameIdx = headers.findIndex(h => h.includes('name'));
  const phoneIdx = headers.findIndex(h => h.includes('phone'));
  const centerIdx = headers.findIndex(h => h.includes('center') || h.includes('centre'));
  const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('subscription'));
  const monthlyIdx = headers.findIndex(h => h.includes('monthly'));
  const startDateIdx = headers.findIndex(h => h.includes('start') || h.includes('joining'));
  const commentsIdx = headers.findIndex(h => h.includes('comment'));

  // Find payment columns
  const paymentColumns: Array<{ month: string; year: number; index: number }> = [];
  const monthMap: Record<string, number> = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
  };

  headers.forEach((header, idx) => {
    const headerLower = header.toLowerCase().trim();
    for (const [monthName, monthNum] of Object.entries(monthMap)) {
      if (headerLower.includes(monthName)) {
        let year = 2025;
        if (monthNum >= 1 && monthNum <= 3) {
          year = 2026; // Jan, Feb, Mar are 2026
        }
        // Override if year is explicitly in header
        const yearMatch = header.match(/(20\d{2})/);
        if (yearMatch) {
          year = parseInt(yearMatch[1]);
        }
        paymentColumns.push({ month: monthName, year, index: idx });
        break;
      }
    }
  });

  const students: StudentData[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Handle multi-line rows (some rows have line breaks in comments)
    let line = lines[i];
    let nextLineIdx = i + 1;
    
    const commaCount = (line.match(/,/g) || []).length;
    const quoteCount = (line.match(/"/g) || []).length;
    const isIncompleteQuote = quoteCount % 2 !== 0;
    
    while (nextLineIdx < lines.length && (commaCount < headers.length - 1 || isIncompleteQuote)) {
      line += '\n' + lines[nextLineIdx];
      nextLineIdx++;
      i = nextLineIdx - 1;
      const newCommaCount = (line.match(/,/g) || []).length;
      const newQuoteCount = (line.match(/"/g) || []).length;
      if (newCommaCount >= headers.length - 1 && newQuoteCount % 2 === 0) break;
    }

    // Parse CSV values (handle quoted values)
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
    values.push(current.trim()); // Add last value

    // Ensure we have enough values
    while (values.length < headers.length) {
      values.push('');
    }

    const name = values[nameIdx]?.trim() || '';
    if (!name) continue; // Skip rows without names

    const phone = values[phoneIdx]?.trim() || '';
    const centerName = values[centerIdx]?.trim() || '';
    const subscriptionStatus = values[statusIdx]?.trim() || 'ACTIVE';
    const monthlyStr = values[monthlyIdx]?.trim() || '0';
    const startDate = values[startDateIdx]?.trim() || '';
    const comments = values[commentsIdx]?.trim() || '';

    // Parse monthly fee (remove ₹ and commas)
    const monthlyFee = parseFloat(monthlyStr.replace(/[₹,\s]/g, '')) || 0;

    // Parse payments
    const payments: Array<{ month: string; year: number; amount: number }> = [];
    for (const { month, year, index } of paymentColumns) {
      const paymentStr = values[index]?.trim() || '';
      if (paymentStr) {
        const amount = parseFloat(paymentStr.replace(/[₹,\s]/g, '')) || 0;
        if (amount > 0) {
          payments.push({ month, year, amount });
        }
      }
    }

    students.push({
      name,
      phone: phone || undefined,
      centerName,
      subscriptionStatus,
      monthlyFee,
      startDate,
      payments,
      comments: comments || undefined
    });
  }

  return students;
}

function mapCenterToProgramType(centerName: string): string {
  const name = centerName.toLowerCase().trim();
  if (name.includes('depot') || name.includes('18')) {
    return 'SCP';
  } else if (name.includes('trilok') || name.includes('3lok')) {
    return 'EPP';
  } else if (name.includes('blitzz')) {
    return 'FYDP';
  }
  return 'EPP'; // Default
}

function mapStatus(status: string): 'ACTIVE' | 'INACTIVE' | 'TRIAL' {
  const normalized = status.toLowerCase().trim();
  if (normalized === 'churned') return 'INACTIVE';
  if (normalized === 'paused') return 'INACTIVE';
  if (normalized === 'active') return 'ACTIVE';
  return 'ACTIVE';
}

function generateEmail(name: string, existingEmails: Set<string>): string {
  const base = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.');
  let email = `${base}@realverse.com`;
  let counter = 1;
  while (existingEmails.has(email)) {
    email = `${base}${counter}@realverse.com`;
    counter++;
  }
  return email;
}

function generatePassword(): string {
  const random = Math.floor(Math.random() * 10000);
  return `Student@${random}`;
}

async function reconcileStudentData() {
  try {
    console.log('🔄 Starting data reconciliation...\n');

    // Read CSV file
    const csvPath = path.join(__dirname, '../', 'FCRB Data and Finance Mastersheet - All players list.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const studentsData = parseCSV(csvContent);

    console.log(`📊 Found ${studentsData.length} students in CSV\n`);

    // Get all centers
    const centers = await prisma.center.findMany();
    const centerMap = new Map<string, number>();
    centers.forEach(c => {
      const name = c.name.toLowerCase().trim();
      centerMap.set(name, c.id);
      if (c.shortName) {
        centerMap.set(c.shortName.toLowerCase().trim(), c.id);
      }
    });

    // Get all existing students
    const existingStudents = await prisma.student.findMany({
      select: { id: true, fullName: true, email: true }
    });
    const nameToStudentMap = new Map<string, typeof existingStudents[0]>();
    existingStudents.forEach(s => {
      nameToStudentMap.set(s.fullName.toLowerCase().trim(), s);
    });

    const existingEmails = new Set<string>();
    existingStudents.forEach(s => {
      if (s.email) existingEmails.add(s.email);
    });

    const results: any[] = [];
    const errors: any[] = [];

    console.log('🔄 Reconciling student data...\n');

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      const studentNameKey = studentData.name.toLowerCase().trim();
      
      try {
        // Find center ID
        const centerName = studentData.centerName.toLowerCase().trim();
        let centerId: number | undefined;
        
        for (const [key, id] of centerMap.entries()) {
          if (centerName.includes(key) || key.includes(centerName)) {
            centerId = id;
            break;
          }
        }

        if (!centerId) {
          if (centerName.includes('depot') || centerName.includes('18')) {
            const depot = centers.find(c => c.name.toLowerCase().includes('depot') || c.shortName?.toLowerCase().includes('depot'));
            centerId = depot?.id;
          } else if (centerName.includes('trilok') || centerName.includes('3lok')) {
            const trilok = centers.find(c => c.name.toLowerCase().includes('trilok') || c.name.toLowerCase().includes('3lok') || c.shortName?.toLowerCase().includes('3lok'));
            centerId = trilok?.id;
          } else if (centerName.includes('blitzz')) {
            const blitzz = centers.find(c => c.name.toLowerCase().includes('blitzz'));
            centerId = blitzz?.id;
          }
        }

        if (!centerId) {
          errors.push({
            index: i,
            name: studentData.name,
            error: `Center not found: ${studentData.centerName}`
          });
          console.log(`❌ ${studentData.name}: Center not found: ${studentData.centerName}`);
          continue;
        }

        // Find or create student
        let student = nameToStudentMap.get(studentNameKey);
        let isNewStudent = false;

        if (!student) {
          // Create new student
          const email = generateEmail(studentData.name, existingEmails);
          const password = generatePassword();
          const passwordHash = await bcrypt.hash(password, 10);
          const programType = mapCenterToProgramType(studentData.centerName);
          
          // Parse start date
          let joiningDate: Date | undefined;
          if (studentData.startDate) {
            const dateStr = studentData.startDate;
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1;
              const year = parseInt(parts[2]);
              joiningDate = new Date(year, month, day);
              joiningDate.setHours(0, 0, 0, 0);
            }
          }
          
          // If no start date, use first day of the month of the first payment
          if (!joiningDate && studentData.payments && studentData.payments.length > 0) {
            const earliestPayment = studentData.payments.reduce((earliest, payment) => {
              const monthMap: Record<string, number> = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
              };
              const month = monthMap[payment.month.toLowerCase().trim()];
              const paymentDate = new Date(payment.year, month, 1);
              if (!earliest || paymentDate < earliest) {
                return paymentDate;
              }
              return earliest;
            }, null as Date | null);
            
            if (earliestPayment) {
              joiningDate = new Date(earliestPayment.getFullYear(), earliestPayment.getMonth(), 1);
              joiningDate.setHours(0, 0, 0, 0);
            }
          }

          const status = mapStatus(studentData.subscriptionStatus || 'ACTIVE');
          
          // Determine churnedDate if status is INACTIVE and there are payments
          let churnedDate: Date | null = null;
          if (status === 'INACTIVE' && studentData.subscriptionStatus?.toLowerCase().includes('churned')) {
            // Use the last payment date as churn date, or current date if no payments
            if (studentData.payments && studentData.payments.length > 0) {
              const monthMap: Record<string, number> = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
              };
              const lastPayment = studentData.payments.reduce((latest, payment) => {
                const month = monthMap[payment.month.toLowerCase().trim()];
                const paymentDate = new Date(payment.year, month, 1);
                if (!latest || paymentDate > latest) {
                  return paymentDate;
                }
                return latest;
              }, null as Date | null);
              
              if (lastPayment) {
                // Set churn date to the 1st of the month after the last payment
                const lastPaymentYear = lastPayment.getFullYear();
                const lastPaymentMonth = lastPayment.getMonth(); // 0-indexed (0-11)
                // Calculate next month (handle year rollover)
                let nextMonth = lastPaymentMonth + 1;
                let nextYear = lastPaymentYear;
                if (nextMonth > 11) {
                  nextMonth = 0;
                  nextYear += 1;
                }
                churnedDate = new Date(nextYear, nextMonth, 1);
                churnedDate.setHours(0, 0, 0, 0);
              }
            }
          }

          student = await prisma.student.create({
            data: {
              fullName: studentData.name.trim(),
              phoneNumber: studentData.phone || null,
              email,
              passwordHash,
              centerId,
              joiningDate: joiningDate || new Date(),
              programType,
              monthlyFeeAmount: Math.round(studentData.monthlyFee || 0),
              paymentFrequency: 1,
              status,
              churnedDate
            }
          });
          
          existingEmails.add(email);
          nameToStudentMap.set(studentNameKey, student);
          isNewStudent = true;
          console.log(`✅ Created new student: ${studentData.name}`);
        } else {
          // Update existing student
          const programType = mapCenterToProgramType(studentData.centerName);
          
          // Parse start date
          let joiningDate: Date | undefined;
          if (studentData.startDate) {
            const dateStr = studentData.startDate;
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1;
              const year = parseInt(parts[2]);
              joiningDate = new Date(year, month, day);
              joiningDate.setHours(0, 0, 0, 0);
            }
          }
          
          // If no start date, use first day of the month of the first payment
          if (!joiningDate && studentData.payments && studentData.payments.length > 0) {
            const earliestPayment = studentData.payments.reduce((earliest, payment) => {
              const monthMap: Record<string, number> = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
              };
              const month = monthMap[payment.month.toLowerCase().trim()];
              const paymentDate = new Date(payment.year, month, 1);
              if (!earliest || paymentDate < earliest) {
                return paymentDate;
              }
              return earliest;
            }, null as Date | null);
            
            if (earliestPayment) {
              joiningDate = new Date(earliestPayment.getFullYear(), earliestPayment.getMonth(), 1);
              joiningDate.setHours(0, 0, 0, 0);
            }
          }

          const status = mapStatus(studentData.subscriptionStatus || 'ACTIVE');
          
          // Determine churnedDate if status is INACTIVE and churned
          let churnedDate: Date | null = null;
          if (status === 'INACTIVE' && studentData.subscriptionStatus?.toLowerCase().includes('churned')) {
            // Use the last payment date as churn date
            if (studentData.payments && studentData.payments.length > 0) {
              const monthMap: Record<string, number> = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
              };
              const lastPayment = studentData.payments.reduce((latest, payment) => {
                const month = monthMap[payment.month.toLowerCase().trim()];
                const paymentDate = new Date(payment.year, month, 1);
                if (!latest || paymentDate > latest) {
                  return paymentDate;
                }
                return latest;
              }, null as Date | null);
              
              if (lastPayment) {
                // Set churn date to the 1st of the month after the last payment
                const lastPaymentYear = lastPayment.getFullYear();
                const lastPaymentMonth = lastPayment.getMonth(); // 0-indexed (0-11)
                // Calculate next month (handle year rollover)
                let nextMonth = lastPaymentMonth + 1;
                let nextYear = lastPaymentYear;
                if (nextMonth > 11) {
                  nextMonth = 0;
                  nextYear += 1;
                }
                churnedDate = new Date(nextYear, nextMonth, 1);
                churnedDate.setHours(0, 0, 0, 0);
              }
            }
          } else {
            // If not churned, clear churnedDate
            churnedDate = null;
          }

          await prisma.student.update({
            where: { id: student.id },
            data: {
              fullName: studentData.name.trim(),
              phoneNumber: studentData.phone || null,
              centerId,
              joiningDate: joiningDate || undefined,
              programType,
              monthlyFeeAmount: Math.round(studentData.monthlyFee || 0),
              status,
              churnedDate
            }
          });
          
          console.log(`🔄 Updated student: ${studentData.name}`);
        }

        // Delete all existing payments for this student
        const deletedCount = await prisma.payment.deleteMany({
          where: { studentId: student.id }
        });
        
        if (deletedCount.count > 0) {
          console.log(`  🗑️  Deleted ${deletedCount.count} existing payment(s)`);
        }

        // Create new payments from CSV data
        const paymentResults = [];
        if (studentData.payments && studentData.payments.length > 0) {
          for (const paymentData of studentData.payments) {
            const monthMap: Record<string, number> = {
              'january': 0, 'february': 1, 'march': 2, 'april': 3,
              'may': 4, 'june': 5, 'july': 6, 'august': 7,
              'september': 8, 'october': 9, 'november': 10, 'december': 11
            };
            
            const monthName = paymentData.month.toLowerCase().trim();
            const month = monthMap[monthName];
            
            if (month === undefined) {
              console.warn(`  ⚠️  Invalid month: ${paymentData.month} for ${studentData.name}`);
              continue;
            }

            const paymentDate = new Date(paymentData.year, month, 1);
            paymentDate.setHours(0, 0, 0, 0);

            try {
              const payment = await prisma.payment.create({
                data: {
                  studentId: student.id,
                  centerId,
                  amount: Math.round(paymentData.amount),
                  paymentDate,
                  paymentMode: 'CASH', // Default, can be updated manually
                  notes: studentData.comments || null
                }
              });
              paymentResults.push(payment);
            } catch (error: any) {
              console.error(`  ❌ Error creating payment for ${studentData.name} (${paymentData.month} ${paymentData.year}):`, error.message);
            }
          }
        }

        results.push({
          student: {
            id: student.id,
            name: studentData.name,
            isNew: isNewStudent
          },
          paymentsCreated: paymentResults.length,
          paymentsDeleted: deletedCount.count
        });

        console.log(`  ✅ Created ${paymentResults.length} payment(s)\n`);

      } catch (error: any) {
        errors.push({
          index: i,
          name: studentData.name,
          error: error.message
        });
        console.error(`❌ Error processing ${studentData.name}:`, error.message);
      }
    }

    console.log('\n📊 Reconciliation Summary:');
    console.log(`✅ Processed: ${results.length} students`);
    console.log(`❌ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => {
        console.log(`  - ${err.name}: ${err.error}`);
      });
    }

    // Write results to file
    const timestamp = new Date().toISOString().split('T')[0];
    const resultsPath = path.join(__dirname, '../', `reconciliation-results-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify({ results, errors }, null, 2));
    console.log(`\n📝 Results saved to: ${resultsPath}`);

  } catch (error: any) {
    console.error('❌ Error during reconciliation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reconciliation
reconcileStudentData()
  .then(() => {
    console.log('\n✅ Reconciliation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Reconciliation failed:', error);
    process.exit(1);
  });

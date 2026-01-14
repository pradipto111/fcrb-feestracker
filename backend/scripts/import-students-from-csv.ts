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
    
    // If the line doesn't have enough commas, it might be split across lines
    // Also check if line ends with incomplete quote (multi-line quoted field)
    const commaCount = (line.match(/,/g) || []).length;
    const quoteCount = (line.match(/"/g) || []).length;
    const isIncompleteQuote = quoteCount % 2 !== 0; // Odd number of quotes means unclosed
    
    while (nextLineIdx < lines.length && (commaCount < headers.length - 1 || isIncompleteQuote)) {
      line += '\n' + lines[nextLineIdx];
      nextLineIdx++;
      i = nextLineIdx - 1;
      // Recalculate after adding line
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

    if (values.length < headers.length) {
      // Pad with empty strings
      while (values.length < headers.length) {
        values.push('');
      }
    }

    const name = nameIdx >= 0 ? values[nameIdx].trim() : '';
    if (!name || name === '') continue;

    const phone = phoneIdx >= 0 && values[phoneIdx] ? values[phoneIdx] : undefined;
    const centerName = centerIdx >= 0 ? values[centerIdx] : '';
    const subscriptionStatus = statusIdx >= 0 && values[statusIdx] ? values[statusIdx] : undefined;
    const monthlyFeeStr = monthlyIdx >= 0 ? values[monthlyIdx] : '';
    const monthlyFee = monthlyFeeStr ? parseFloat(monthlyFeeStr.replace(/[₹,]/g, '')) || undefined : undefined;
    const startDate = startDateIdx >= 0 && values[startDateIdx] ? values[startDateIdx] : undefined;
    const comments = commentsIdx >= 0 && values[commentsIdx] ? values[commentsIdx] : undefined;

    // Parse payments
    const payments: Array<{ month: string; year: number; amount: number }> = [];
    paymentColumns.forEach(({ month, year, index }) => {
      if (index < values.length) {
        const value = values[index];
        if (value && value.trim() !== '' && value.trim() !== '₹') {
          const amount = parseFloat(value.replace(/[₹,]/g, ''));
          if (!isNaN(amount) && amount > 0) {
            payments.push({ month, year, amount });
          }
        }
      }
    });

    students.push({
      name: name.trim(),
      phone,
      centerName: centerName.trim(),
      subscriptionStatus,
      monthlyFee,
      startDate,
      payments,
      comments
    });
  }

  return students;
}

function generateEmail(fullName: string, existingEmails: Set<string>): string {
  const nameParts = fullName.toLowerCase().trim().split(/\s+/);
  let baseEmail = nameParts.join('.');
  baseEmail = baseEmail.replace(/[^a-z0-9.]/g, '');
  
  let email = `${baseEmail}@realverse.com`;
  let counter = 1;
  while (existingEmails.has(email)) {
    email = `${baseEmail}${counter}@realverse.com`;
    counter++;
  }
  
  existingEmails.add(email);
  return email;
}

function generatePassword(): string {
  const random = Math.floor(100 + Math.random() * 900);
  return `Student@${random}`;
}

function mapCenterToProgramType(centerName: string): string {
  const normalized = centerName.toLowerCase().trim();
  if (normalized.includes('depot18')) return 'SCP';
  if (normalized.includes('trilok')) return 'EPP';
  if (normalized.includes('blitzz')) return 'FYDP';
  return 'SCP';
}

function mapStatus(status: string): "ACTIVE" | "INACTIVE" | "TRIAL" {
  const normalized = status.toLowerCase().trim();
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'churned') return 'INACTIVE';
  if (normalized === 'paused') return 'INACTIVE';
  return 'ACTIVE';
}

async function importStudents() {
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, '../', 'FCRB Data and Finance Mastersheet - All players list.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('📄 Parsing CSV file...');
    const studentsData = parseCSV(csvContent);
    console.log(`✅ Parsed ${studentsData.length} students from CSV`);

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

    // Track existing emails and names to avoid duplicates
    const existingEmails = new Set<string>();
    const existingNames = new Set<string>();
    const existingStudents = await prisma.student.findMany({
      select: { email: true, fullName: true }
    });
    existingStudents.forEach(s => {
      if (s.email) existingEmails.add(s.email);
      existingNames.add(s.fullName.toLowerCase().trim());
    });

    const results: any[] = [];
    const errors: any[] = [];

    console.log('\n🔄 Importing students...\n');

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      
      // Skip if student already exists (by name)
      if (existingNames.has(studentData.name.toLowerCase().trim())) {
        console.log(`⏭️  Skipping ${studentData.name} - already exists`);
        continue;
      }
      
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

        // Generate email and password
        const email = generateEmail(studentData.name, existingEmails);
        const password = generatePassword();
        const passwordHash = await bcrypt.hash(password, 10);

        // Map program type
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
          } else {
            joiningDate = new Date(dateStr);
          }
        } else {
          // If no start date, use first day of the month of the first payment
          if (studentData.payments && studentData.payments.length > 0) {
            // Find earliest payment
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
              // Set to first day of that month
              joiningDate = new Date(earliestPayment.getFullYear(), earliestPayment.getMonth(), 1);
            }
          }
        }

        // Create student
        const student = await prisma.student.create({
          data: {
            fullName: studentData.name.trim(),
            phoneNumber: studentData.phone || null,
            email,
            passwordHash,
            centerId,
            joiningDate: joiningDate || new Date(),
            programType,
            monthlyFeeAmount: studentData.monthlyFee ? Math.round(studentData.monthlyFee) : 0,
            paymentFrequency: 1,
            status: mapStatus(studentData.subscriptionStatus || 'ACTIVE')
          }
        });

        // Create payments
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
              console.warn(`Invalid month: ${paymentData.month} for ${studentData.name}`);
              continue;
            }

            const paymentDate = new Date(paymentData.year, month, 1);

            try {
              const payment = await prisma.payment.create({
                data: {
                  studentId: student.id,
                  centerId: student.centerId,
                  amount: Math.round(paymentData.amount),
                  paymentDate,
                  paymentMode: 'cash',
                  notes: studentData.comments || null
                }
              });
              paymentResults.push(payment);
            } catch (paymentError: any) {
              console.error(`Error creating payment for ${studentData.name}:`, paymentError.message);
            }
          }
        }

        results.push({
          student: {
            id: student.id,
            name: student.fullName,
            email,
            password,
            centerId: student.centerId,
            programType: student.programType
          },
          paymentsCreated: paymentResults.length
        });

        console.log(`✅ ${studentData.name} - Email: ${email}, Password: ${password}, Payments: ${paymentResults.length}`);

      } catch (error: any) {
        errors.push({
          index: i,
          name: studentData.name,
          error: error.message || 'Unknown error'
        });
        console.error(`❌ ${studentData.name}: ${error.message}`);
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`✅ Successfully imported: ${results.length}`);
    console.log(`❌ Failed: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => {
        console.log(`  - ${err.name}: ${err.error}`);
      });
    }

    // Save credentials to file
    const credentialsCSV = [
      ['Name', 'Email', 'Password', 'Center ID', 'Program Type', 'Payments Created'].join(','),
      ...results.map((r: any) => [
        r.student.name,
        r.student.email,
        r.student.password,
        r.student.centerId,
        r.student.programType,
        r.paymentsCreated
      ].join(','))
    ].join('\n');

    const credentialsPath = path.join(__dirname, '../../', `student-credentials-${new Date().toISOString().split('T')[0]}.csv`);
    fs.writeFileSync(credentialsPath, credentialsCSV);
    console.log(`\n💾 Credentials saved to: ${credentialsPath}`);

    return { results, errors, imported: results.length, failed: errors.length };

  } catch (error: any) {
    console.error('❌ Import error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importStudents()
  .then(() => {
    console.log('\n✅ Import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });

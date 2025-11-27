#!/bin/bash

# Complete reset and update script

echo "🔄 Resetting and Updating Football Academy Fees Tracker"
echo "========================================================"
echo ""

cd "$(dirname "$0")/backend"

echo "📦 Step 1: Resetting database..."
psql -d postgres -c "DROP DATABASE IF EXISTS fees_tracker;" 2>/dev/null
psql -d postgres -c "CREATE DATABASE fees_tracker;"
echo "✅ Database reset complete"
echo ""

echo "🗄️  Step 2: Running migrations..."
npx prisma migrate dev --name add_payment_frequency
echo "✅ Migrations complete"
echo ""

echo "🔧 Step 3: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "🌱 Step 4: Seeding database with new data..."
npm run prisma:seed
echo ""

echo "🎉 Update Complete!"
echo "==================="
echo ""
echo "📊 System Summary:"
echo "   - 2 Academies (Mumbai, Pune)"
echo "   - 5 Students (3 Mumbai, 2 Pune)"
echo "   - 28 Payment records"
echo "   - Payment frequencies: Monthly, Quarterly, Half-yearly, Yearly"
echo ""
echo "🔐 Login Credentials:"
echo ""
echo "👨‍💼 Admin (Full Access):"
echo "   Email: admin@feestrack.com"
echo "   Password: admin123"
echo ""
echo "👨‍🏫 Coaches:"
echo "   Mumbai: rajesh@feestrack.com / coach123"
echo "   Pune: priya@feestrack.com / coach123"
echo ""
echo "🎓 Students (Example):"
echo "   Arjun: arjun.mehta@student.com / student123"
echo "   (All students use password: student123)"
echo ""
echo "📄 See CREDENTIALS.md for complete list!"
echo ""
echo "🚀 Ready! Start the servers:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""


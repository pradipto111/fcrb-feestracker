#!/bin/bash

echo "🔄 Applying All Updates..."
echo "=========================="
echo ""

cd "$(dirname "$0")/backend"

echo "📦 Step 1: Resetting database..."
psql -d postgres -c "DROP DATABASE IF EXISTS fees_tracker;" 2>/dev/null
psql -d postgres -c "CREATE DATABASE fees_tracker;"
echo "✅ Database reset"
echo ""

echo "🗄️  Step 2: Running migrations..."
npx prisma migrate deploy
echo "✅ Migrations applied"
echo ""

echo "🔧 Step 3: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "🌱 Step 4: Seeding database..."
npm run prisma:seed
echo ""

echo "🔄 Step 5: Restarting servers..."
cd ..
lsof -ti:4000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

cd backend
npm run dev > /tmp/backend.log 2>&1 &
echo "✅ Backend started"

cd ../frontend
npm run dev > /tmp/frontend.log 2>&1 &
echo "✅ Frontend started"

cd ..
sleep 3

echo ""
echo "🎉 All Updates Applied!"
echo "======================="
echo ""
echo "✨ What's New:"
echo "   ✅ 1 coach with access to ALL centers"
echo "   ✅ Email & password fields for student creation"
echo "   ✅ Edit student functionality"
echo "   ✅ Center name column in student lists"
echo "   ✅ Filters by center, status, program"
echo "   ✅ Search by all fields"
echo "   ✅ Clickable center details with stats"
echo ""
echo "🔐 Login Credentials:"
echo "   Admin: admin@feestrack.com / admin123"
echo "   Coach (All Centers): coach@feestrack.com / coach123"
echo "   Student: arjun.mehta@student.com / student123"
echo ""
echo "🚀 Open: http://localhost:5173"
echo ""



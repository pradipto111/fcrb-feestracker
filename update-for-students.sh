#!/bin/bash

# Script to update database with student login feature

echo "🔄 Updating database for student login feature..."
echo "================================================"
echo ""

cd "$(dirname "$0")/backend"

# Drop and recreate database
echo "📦 Resetting database..."
psql -d postgres -c "DROP DATABASE IF EXISTS fees_tracker;" 2>/dev/null
psql -d postgres -c "CREATE DATABASE fees_tracker;"

echo ""
echo "🗄️  Running migrations..."
npx prisma migrate dev --name add_student_auth

echo ""
echo "🌱 Seeding database with updated data..."
npm run prisma:seed

echo ""
echo "✅ Database updated successfully!"
echo ""
echo "🎓 Student login credentials:"
echo "   Email: arjun.mehta@student.com"
echo "   Password: student123"
echo ""
echo "   (All students use password: student123)"
echo ""



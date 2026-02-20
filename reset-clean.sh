#!/bin/bash

echo "🧹 Resetting database to clean slate (Admin + Coach only)..."
echo ""

cd backend

echo "📦 Dropping and recreating database..."
npx prisma migrate reset --force --skip-seed

echo ""
echo "🌱 Seeding with clean data..."
npm run prisma:seed

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📝 Login Credentials:"
echo "   👨‍💼 Admin: admin@fcrb.com / 20fc24rb!"
echo "   👨‍🏫 Coach: coach@feestrack.com / coach123"
echo ""
echo "💡 Use the admin portal to create centers and students."
echo ""







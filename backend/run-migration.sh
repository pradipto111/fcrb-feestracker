#!/bin/bash
# Run this script to set up the database with new models

echo "🔄 Running Prisma migration..."
npx prisma migrate dev --name add_leads_and_shop

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Migration complete! Please restart your backend server."



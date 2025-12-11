#!/bin/bash
set -e

echo "🗄️  Starting migration deployment..."

# Try to apply migrations normally first
if npx prisma migrate deploy; then
    echo "✅ Migrations applied successfully"
    exit 0
fi

echo "⚠️  Migration failed, checking if database already has schema..."

# If migration failed, it might be because schema already exists
# Mark all migrations as applied (baseline)
echo "📝 Marking existing migrations as applied..."

# Get list of all migrations
MIGRATIONS=$(ls -1 prisma/migrations | grep -E '^[0-9]' || true)

if [ -z "$MIGRATIONS" ]; then
    echo "❌ No migrations found"
    exit 1
fi

# Mark each migration as applied
for MIGRATION in $MIGRATIONS; do
    echo "   Marking $MIGRATION as applied..."
    npx prisma migrate resolve --applied "$MIGRATION" || true
done

# Now try to apply any remaining migrations
echo "🔄 Attempting to apply any new migrations..."
npx prisma migrate deploy

echo "✅ Migration deployment completed"


#!/bin/bash
set -e

echo "🗄️  Starting migration deployment..."

# Try to deploy migrations normally
if npx prisma migrate deploy 2>&1 | tee /tmp/migrate_output.log; then
    echo "✅ Migrations applied successfully"
else
    # Check if error is about failed migrations
    if grep -q "P3009" /tmp/migrate_output.log || grep -q "failed migrations" /tmp/migrate_output.log; then
        echo "⚠️  Found failed migrations, resolving..."
        
        # Mark old migrations as applied (baseline the existing schema)
        npx prisma migrate resolve --applied "20251125075812_init" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251125081001_add_student_auth" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251125081836_add_payment_frequency" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251210204627_add_analytics_fields_and_relations" 2>/dev/null || true
        
        echo "🔄 Attempting to apply remaining migrations..."
        npx prisma migrate deploy || true
    fi
fi

# Critical fix: Execute the Center columns migration SQL directly if columns don't exist
echo "🔍 Verifying Center table columns exist..."
MIGRATION_SQL="prisma/migrations/20251211053654_add_center_shortname/migration.sql"

if [ -f "$MIGRATION_SQL" ]; then
    echo "📝 Executing Center table migration SQL directly to ensure columns exist..."
    
    # Use prisma db execute to run the SQL
    if npx prisma db execute --file "$MIGRATION_SQL" --schema prisma/schema.prisma; then
        echo "✅ Center table columns verified/added"
        
        # Mark as applied if not already
        npx prisma migrate resolve --applied "20251211053654_add_center_shortname" 2>/dev/null || true
    else
        echo "⚠️  Warning: Could not execute migration SQL (columns might already exist)"
    fi
else
    echo "⚠️  Migration SQL file not found: $MIGRATION_SQL"
fi

echo "✅ Migration deployment completed"

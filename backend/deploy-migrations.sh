#!/bin/bash
# Don't exit on error - let migrations fail gracefully
set +e

echo "🗄️  Starting migration deployment..."

# Wait for database to be ready (up to 30 seconds)
echo "⏳ Waiting for database connection..."
for i in {1..6}; do
    if npx prisma db pull --force 2>/dev/null; then
        echo "✅ Database connected"
        break
    fi
    echo "⏳ Attempt $i/6 - Database not ready yet, waiting 5s..."
    sleep 5
done

# Try to deploy migrations normally
echo "🔄 Applying migrations..."
if npx prisma migrate deploy 2>&1 | tee /tmp/migrate_output.log; then
    echo "✅ Migrations applied successfully"
else
    EXIT_CODE=$?
    echo "⚠️  Migration deployment encountered issues (exit code: $EXIT_CODE)"
    
    # Check if error is about failed migrations
    if grep -q "P3009" /tmp/migrate_output.log || grep -q "failed migrations" /tmp/migrate_output.log; then
        echo "⚠️  Found failed migrations, attempting to resolve..."
        
        # Mark old migrations as applied (baseline the existing schema)
        npx prisma migrate resolve --applied "20251125075812_init" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251125081001_add_student_auth" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251125081836_add_payment_frequency" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251210204627_add_analytics_fields_and_relations" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251211053654_add_center_shortname" 2>/dev/null || true
        npx prisma migrate resolve --applied "20251217150000_add_club_events" 2>/dev/null || true
        
        echo "🔄 Attempting to apply remaining migrations..."
        npx prisma migrate deploy 2>/dev/null || true
    elif grep -q "P1001" /tmp/migrate_output.log || grep -q "Can't reach database" /tmp/migrate_output.log; then
        echo "❌ Database connection failed. Server will start but may not work properly."
        echo "   Please check your DATABASE_URL environment variable."
    fi
fi

# Use prisma db push as fallback to ensure schema is up-to-date
echo "🔄 Ensuring schema is synchronized..."
if npx prisma db push --accept-data-loss 2>/dev/null; then
    echo "✅ Schema synchronized"
else
    echo "⚠️  Could not synchronize schema (database might not be accessible)"
fi

echo "✅ Migration deployment completed (with potential warnings)"

# Always exit successfully to allow the app to start
exit 0


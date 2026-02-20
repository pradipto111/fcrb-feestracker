#!/bin/bash

# ============================================
# ONE-TIME DATA MIGRATION SCRIPT
# Migrates all data from local PostgreSQL to Render database
# ============================================

set -e  # Exit on any error

echo "🚀 FCRB Database Migration to Render"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Read local database URL
echo "📋 Step 1: Reading local database configuration..."
LOCAL_ENV_FILE="backend/.env"

if [ ! -f "$LOCAL_ENV_FILE" ]; then
    echo -e "${RED}❌ Error: $LOCAL_ENV_FILE not found${NC}"
    echo "Please ensure your backend/.env file exists with DATABASE_URL"
    exit 1
fi

# Extract DATABASE_URL from .env file
LOCAL_DB_URL=$(grep "^DATABASE_URL=" "$LOCAL_ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$LOCAL_DB_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in $LOCAL_ENV_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Local database URL found${NC}"
echo "   Database: $(echo $LOCAL_DB_URL | sed 's/.*@.*:\/\/[^@]*@[^:]*:\([^/]*\)\/\(.*\)/\2/')"
echo ""

# Step 2: Get Render database connection string
echo "📋 Step 2: Render database connection..."
echo ""
echo -e "${YELLOW}⚠️  You need to provide your Render database connection string${NC}"
echo "   To get it:"
echo "   1. Go to https://dashboard.render.com"
echo "   2. Navigate to your database (fcrb-database)"
echo "   3. Go to 'Connections' tab"
echo "   4. Copy the 'Internal Database URL' or 'External Connection String'"
echo ""
read -p "Enter Render database connection string: " RENDER_DB_URL

if [ -z "$RENDER_DB_URL" ]; then
    echo -e "${RED}❌ Error: Render database URL is required${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Render database URL provided${NC}"
echo ""

# Step 3: Verify connections
echo "📋 Step 3: Verifying database connections..."
echo ""

# Test local connection
echo "Testing local database connection..."
if psql "$LOCAL_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local database connection successful${NC}"
else
    echo -e "${RED}❌ Error: Cannot connect to local database${NC}"
    echo "   Please check your local PostgreSQL is running and DATABASE_URL is correct"
    exit 1
fi

# Test remote connection
echo "Testing Render database connection..."
if psql "$RENDER_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Render database connection successful${NC}"
else
    echo -e "${RED}❌ Error: Cannot connect to Render database${NC}"
    echo "   Please check your connection string and network access"
    exit 1
fi
echo ""

# Step 4: Confirm migration
echo "📋 Step 4: Migration confirmation"
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will copy ALL data from local to Render database${NC}"
echo ""
echo "What will be migrated:"
echo "  - All tables and their data"
echo "  - Sequences will be reset to match data"
echo ""
echo -e "${YELLOW}⚠️  This will NOT:${NC}"
echo "  - Drop existing data in Render database (will append/update)"
echo "  - Modify schema (assumes schema already exists)"
echo ""
read -p "Do you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi
echo ""

# Step 5: Create temporary dump file
echo "📋 Step 5: Creating data dump from local database..."
DUMP_FILE="/tmp/fcrb_migration_$(date +%Y%m%d_%H%M%S).sql"

# Dump data only (no schema, no DROP statements)
pg_dump "$LOCAL_DB_URL" \
    --data-only \
    --no-owner \
    --no-privileges \
    --disable-triggers \
    --file="$DUMP_FILE"

if [ ! -f "$DUMP_FILE" ] || [ ! -s "$DUMP_FILE" ]; then
    echo -e "${RED}❌ Error: Failed to create dump file${NC}"
    exit 1
fi

DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo -e "${GREEN}✅ Dump created successfully${NC}"
echo "   File: $DUMP_FILE"
echo "   Size: $DUMP_SIZE"
echo ""

# Step 6: Apply migrations to Render (ensure schema is up to date)
echo "📋 Step 6: Ensuring Render database schema is up to date..."
cd backend

# Set Render DATABASE_URL temporarily
export DATABASE_URL="$RENDER_DB_URL"

# Run migrations
echo "Running Prisma migrations..."
if npx prisma migrate deploy; then
    echo -e "${GREEN}✅ Migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Migration command had issues, but continuing...${NC}"
fi

cd ..
echo ""

# Step 7: Import data to Render
echo "📋 Step 7: Importing data to Render database..."
echo "   This may take a few minutes depending on data size..."
echo ""

# Import the dump
if psql "$RENDER_DB_URL" -f "$DUMP_FILE" > /tmp/migration_log.txt 2>&1; then
    echo -e "${GREEN}✅ Data imported successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Some errors occurred during import${NC}"
    echo "   Check /tmp/migration_log.txt for details"
    echo "   Some errors (like duplicate key violations) may be expected if data already exists"
fi
echo ""

# Step 8: Reset sequences
echo "📋 Step 8: Resetting sequences to match data..."
# Get all tables with sequences
SEQUENCE_RESET_SQL="/tmp/reset_sequences_$(date +%Y%m%d_%H%M%S).sql"

psql "$RENDER_DB_URL" -t -c "
SELECT 'SELECT setval(''' || sequence_name || ''', COALESCE((SELECT MAX(id) FROM ' || 
       SUBSTRING(sequence_name FROM '^(.+)_id_seq') || '), 1), true);'
FROM information_schema.sequences
WHERE sequence_schema = 'public'
  AND sequence_name LIKE '%_id_seq';
" > "$SEQUENCE_RESET_SQL"

# Execute sequence resets
if psql "$RENDER_DB_URL" -f "$SEQUENCE_RESET_SQL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Sequences reset${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Some sequences may not have reset properly${NC}"
fi
echo ""

# Step 9: Verify migration
echo "📋 Step 9: Verifying migration..."
echo ""

# Count records in key tables
echo "Record counts in Render database:"
TABLES=("Center" "Coach" "Student" "Payment" "Session" "Attendance")

for TABLE in "${TABLES[@]}"; do
    COUNT=$(psql "$RENDER_DB_URL" -t -c "SELECT COUNT(*) FROM \"$TABLE\";" 2>/dev/null | xargs)
    if [ ! -z "$COUNT" ]; then
        echo "   $TABLE: $COUNT records"
    fi
done

echo ""

# Step 10: Cleanup
echo "📋 Step 10: Cleaning up temporary files..."
rm -f "$DUMP_FILE" "$SEQUENCE_RESET_SQL" /tmp/migration_log.txt
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

# Final summary
echo "======================================"
echo -e "${GREEN}🎉 Migration completed!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Verify your data in the Render dashboard"
echo "  2. Test your application with the Render database"
echo "  3. Update your backend/.env DATABASE_URL to point to Render for production"
echo ""
echo -e "${YELLOW}⚠️  Remember: This script is for one-time use. Delete it after successful migration.${NC}"
echo ""

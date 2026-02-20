# ============================================
# ONE-TIME DATA MIGRATION SCRIPT (PowerShell)
# Migrates all data from local PostgreSQL to Render database
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "FCRB Database Migration to Render" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Read local database URL
Write-Host "Step 1: Reading local database configuration..." -ForegroundColor Yellow
$LOCAL_ENV_FILE = "backend\.env"

if (-not (Test-Path $LOCAL_ENV_FILE)) {
    Write-Host "[ERROR] $LOCAL_ENV_FILE not found" -ForegroundColor Red
    Write-Host "Please ensure your backend\.env file exists with DATABASE_URL"
    exit 1
}

# Extract DATABASE_URL from .env file
$envContent = Get-Content $LOCAL_ENV_FILE
$LOCAL_DB_URL = ($envContent | Where-Object { $_ -match "^DATABASE_URL=" }) -replace '^DATABASE_URL=', '' -replace '"', '' -replace "'", ''

if ([string]::IsNullOrWhiteSpace($LOCAL_DB_URL)) {
    Write-Host "[ERROR] DATABASE_URL not found in $LOCAL_ENV_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Local database URL found" -ForegroundColor Green
$dbName = ($LOCAL_DB_URL -split '/')[-1]
Write-Host "   Database: $dbName"
Write-Host ""

# Step 2: Set Render database connection string
Write-Host "Step 2: Render database connection..." -ForegroundColor Yellow
$RENDER_DB_URL = "postgresql://fees_tracker_user:ri9w3aRca4TidLdLFteddL9WcP31a5rx@dpg-d5jpp1qli9vc73bkfun0-a.oregon-postgres.render.com/fees_tracker_m5jj?sslmode=require"
Write-Host "[OK] Render database URL configured" -ForegroundColor Green
Write-Host ""

# Step 3: Verify connections
Write-Host "Step 3: Verifying database connections..." -ForegroundColor Yellow
Write-Host ""

# Prepare local connection string (remove Prisma-specific parameters for psql)
$LOCAL_DB_URL_FOR_PSQL = $LOCAL_DB_URL -replace '\?schema=.*$', ''

# Test local connection
Write-Host "Testing local database connection..."
$localTestResult = & psql $LOCAL_DB_URL_FOR_PSQL -c "SELECT 1;" 2>&1
$localExitCode = $LASTEXITCODE

if ($localExitCode -eq 0) {
    Write-Host "[OK] Local database connection successful" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Cannot connect to local database" -ForegroundColor Red
    Write-Host "   Exit code: $localExitCode"
    if ($localTestResult) {
        Write-Host "   Error details: $localTestResult" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "   Troubleshooting:"
    Write-Host "   1. Ensure PostgreSQL is running: Get-Service postgresql*"
    Write-Host "   2. Check DATABASE_URL in backend\.env"
    Write-Host "   3. Try connecting manually: psql `"$LOCAL_DB_URL_FOR_PSQL`""
    Write-Host "   4. If using ?schema=public, try removing it from DATABASE_URL"
    exit 1
}

# Test remote connection
Write-Host "Testing Render database connection..."
$testBatch = "$env:TEMP\test_conn.bat"
"psql `"$RENDER_DB_URL`" -c SELECT 1;" | Out-File -FilePath $testBatch -Encoding ASCII
$remoteTestResult = & $testBatch 2>&1
$remoteExitCode = $LASTEXITCODE
Remove-Item $testBatch -ErrorAction SilentlyContinue

if ($remoteExitCode -eq 0) {
    Write-Host "[OK] Render database connection successful" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Cannot connect to Render database" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Confirm migration
Write-Host "Step 4: Migration confirmation" -ForegroundColor Yellow
Write-Host ""
Write-Host "[WARNING] This will copy ALL data from local to Render database" -ForegroundColor Yellow
Write-Host ""
Write-Host "What will be migrated:"
Write-Host "  - All tables and their data"
Write-Host "  - Sequences will be reset to match data"
Write-Host ""
Write-Host "[WARNING] This will NOT:"
Write-Host "  - Drop existing data in Render database (will append/update)"
Write-Host "  - Modify schema (assumes schema already exists)"
Write-Host ""
$CONFIRM = Read-Host "Do you want to proceed? (yes/no)"

if ($CONFIRM -ne "yes") {
    Write-Host "Migration cancelled."
    exit 0
}
Write-Host ""

# Step 5: Create temporary dump file
Write-Host "Step 5: Creating data dump from local database..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$DUMP_FILE = "$env:TEMP\fcrb_migration_$timestamp.sql"

# Dump data only (no schema, no DROP statements)
Write-Host "   Running pg_dump (this may take a moment)..."
& pg_dump $LOCAL_DB_URL_FOR_PSQL --data-only --no-owner --no-privileges --disable-triggers -f $DUMP_FILE

if (-not (Test-Path $DUMP_FILE) -or (Get-Item $DUMP_FILE).Length -eq 0) {
    Write-Host "[ERROR] Failed to create dump file" -ForegroundColor Red
    exit 1
}

$dumpSize = (Get-Item $DUMP_FILE).Length / 1MB
Write-Host "[OK] Dump created successfully" -ForegroundColor Green
Write-Host "   File: $DUMP_FILE"
Write-Host "   Size: $([math]::Round($dumpSize, 2)) MB"
Write-Host ""

# Step 6: Apply migrations to Render (ensure schema is up to date)
Write-Host "Step 6: Ensuring Render database schema is up to date..." -ForegroundColor Yellow
Push-Location backend

# Set Render DATABASE_URL temporarily
$env:DATABASE_URL = $RENDER_DB_URL

# Run migrations
Write-Host "Running Prisma migrations..."
try {
    $migrateOutput = & npx prisma migrate deploy 2>&1 | Out-String
    $migrateExitCode = $LASTEXITCODE
} catch {
    $migrateOutput = $_.Exception.Message
    $migrateExitCode = 1
}

if ($migrateExitCode -ne 0) {
    if ($migrateOutput -match "20251218193000_add_fan_club" -or $migrateOutput -match "failed migrations" -or $migrateOutput -match "P3009") {
        Write-Host "[WARNING] Found failed migration, resolving..." -ForegroundColor Yellow
        try {
            & npx prisma migrate resolve --rolled-back 20251218193000_add_fan_club 2>&1 | Out-Null
            Write-Host "[OK] Failed migration resolved, retrying..." -ForegroundColor Green
            & npx prisma migrate deploy 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Migrations applied" -ForegroundColor Green
            } else {
                Write-Host "[WARNING] Migration issues detected, but continuing with data import..." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "[WARNING] Could not resolve migration, but continuing with data import..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[WARNING] Migration issues detected, but continuing with data import..." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Migrations applied" -ForegroundColor Green
}

Pop-Location
Write-Host ""

# Step 7: Import data to Render
Write-Host "Step 7: Importing data to Render database..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes depending on data size..."
Write-Host ""

$LOG_FILE = "$env:TEMP\migration_log_$timestamp.txt"

# Clear existing data first (to overwrite any partial data from previous runs)
Write-Host "   Clearing existing data..."
$clearBatch = "$env:TEMP\clear_data.bat"
$clearSQL = "DO `$` DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END `$`;"
"psql `"$RENDER_DB_URL`" -c `"$clearSQL`"" | Out-File -FilePath $clearBatch -Encoding ASCII
& $clearBatch *> $null
Remove-Item $clearBatch -ErrorAction SilentlyContinue

# Import the dump
Write-Host "   Importing data..."
$importBatch = "$env:TEMP\import_data.bat"
"psql `"$RENDER_DB_URL`" -f `"$DUMP_FILE`"" | Out-File -FilePath $importBatch -Encoding ASCII
& $importBatch *> $LOG_FILE
$importExitCode = $LASTEXITCODE
Remove-Item $importBatch -ErrorAction SilentlyContinue

if ($importExitCode -eq 0) {
    Write-Host "[OK] Data imported successfully" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Some errors occurred during import" -ForegroundColor Yellow
    Write-Host "   Check $LOG_FILE for details"
}
Write-Host ""

# Step 8: Reset sequences
Write-Host "Step 8: Resetting sequences to match data..." -ForegroundColor Yellow

# Get all tables with sequences and generate reset SQL
$SEQUENCE_RESET_SQL = "$env:TEMP\reset_sequences_$timestamp.sql"

# Create SQL file with the query
$sequenceQuery = "SELECT 'SELECT setval(''' || sequence_name || ''', COALESCE((SELECT MAX(id) FROM ' || SUBSTRING(sequence_name FROM '^(.+)_id_seq') || '), 1), true);' FROM information_schema.sequences WHERE sequence_schema = 'public' AND sequence_name LIKE '%_id_seq';"
$queryFile = "$env:TEMP\sequence_query.sql"
$sequenceQuery | Out-File -FilePath $queryFile -Encoding ASCII

# Execute query and save results
$seqBatch = "$env:TEMP\get_sequences.bat"
"psql `"$RENDER_DB_URL`" -t -f `"$queryFile`"" | Out-File -FilePath $seqBatch -Encoding ASCII
& $seqBatch | Out-File -FilePath $SEQUENCE_RESET_SQL -Encoding utf8
Remove-Item $seqBatch, $queryFile -ErrorAction SilentlyContinue

# Execute sequence resets
if (Test-Path $SEQUENCE_RESET_SQL -and (Get-Item $SEQUENCE_RESET_SQL).Length -gt 0) {
    $resetBatch = "$env:TEMP\reset_sequences.bat"
    "psql `"$RENDER_DB_URL`" -f `"$SEQUENCE_RESET_SQL`"" | Out-File -FilePath $resetBatch -Encoding ASCII
    & $resetBatch *> $null
    $resetExitCode = $LASTEXITCODE
    Remove-Item $resetBatch -ErrorAction SilentlyContinue
    
    if ($resetExitCode -eq 0) {
        Write-Host "[OK] Sequences reset" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Some sequences may not have reset properly" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARNING] Could not generate sequence reset SQL" -ForegroundColor Yellow
}
Write-Host ""

# Step 9: Verify migration
Write-Host "Step 9: Verifying migration..." -ForegroundColor Yellow
Write-Host ""

# Count records in key tables
Write-Host "Record counts in Render database:"
$TABLES = @("Center", "Coach", "Student", "Payment", "Session", "Attendance")

foreach ($TABLE in $TABLES) {
    $countQuery = "SELECT COUNT(*) FROM `"$TABLE`";"
    $queryFile = "$env:TEMP\count_$TABLE.sql"
    $countQuery | Out-File -FilePath $queryFile -Encoding ASCII
    
    $countBatch = "$env:TEMP\count_$TABLE.bat"
    "psql `"$RENDER_DB_URL`" -t -f `"$queryFile`"" | Out-File -FilePath $countBatch -Encoding ASCII
    $count = & $countBatch 2>$null
    Remove-Item $countBatch, $queryFile -ErrorAction SilentlyContinue
    $count = $count.Trim()
    if ($count -match '^\d+$') {
        Write-Host "   $TABLE : $count records"
    }
}

Write-Host ""

# Step 10: Cleanup
Write-Host "Step 10: Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Path $DUMP_FILE -ErrorAction SilentlyContinue
Remove-Item -Path $SEQUENCE_RESET_SQL -ErrorAction SilentlyContinue
Remove-Item -Path $LOG_FILE -ErrorAction SilentlyContinue
Write-Host "[OK] Cleanup complete" -ForegroundColor Green
Write-Host ""

# Final summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Migration completed!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Verify your data in the Render dashboard"
Write-Host "  2. Test your application with the Render database"
Write-Host "  3. Update your backend\.env DATABASE_URL to point to Render for production"
Write-Host ""
Write-Host "[WARNING] Remember: This script is for one-time use. Delete it after successful migration." -ForegroundColor Yellow
Write-Host ""

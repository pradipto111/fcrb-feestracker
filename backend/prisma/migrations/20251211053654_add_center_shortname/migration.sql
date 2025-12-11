-- AlterTable Center - Add all missing columns
-- Note: Using quoted table names for case-sensitive matching

-- Add shortName column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'shortName'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "shortName" TEXT;
    END IF;
END $$;

-- Add addressLine column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'addressLine'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "addressLine" TEXT;
    END IF;
END $$;

-- Add locality column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'locality'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "locality" TEXT;
    END IF;
END $$;

-- Add state column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'state'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "state" TEXT;
    END IF;
END $$;

-- Add postalCode column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'postalCode'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "postalCode" TEXT;
    END IF;
END $$;

-- Add latitude column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'latitude'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "latitude" DOUBLE PRECISION;
    END IF;
END $$;

-- Add longitude column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'longitude'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "longitude" DOUBLE PRECISION;
    END IF;
END $$;

-- Add googleMapsUrl column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'googleMapsUrl'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "googleMapsUrl" TEXT;
    END IF;
END $$;

-- Add isActive column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Add displayOrder column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'Center' 
        AND column_name = 'displayOrder'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "displayOrder" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- CreateIndex for shortName unique (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname = 'Center_shortName_key'
    ) THEN
        CREATE UNIQUE INDEX "Center_shortName_key" ON "Center"("shortName");
    END IF;
END $$;

-- CreateIndex for shortName (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname = 'Center_shortName_idx'
    ) THEN
        CREATE INDEX "Center_shortName_idx" ON "Center"("shortName");
    END IF;
END $$;

-- CreateIndex for isActive (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname = 'Center_isActive_idx'
    ) THEN
        CREATE INDEX "Center_isActive_idx" ON "Center"("isActive");
    END IF;
END $$;

-- CreateIndex for displayOrder (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname = 'Center_displayOrder_idx'
    ) THEN
        CREATE INDEX "Center_displayOrder_idx" ON "Center"("displayOrder");
    END IF;
END $$;

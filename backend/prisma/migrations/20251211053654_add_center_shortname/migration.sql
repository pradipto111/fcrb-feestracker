-- AlterTable
-- Add shortName column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Center' 
        AND column_name = 'shortName'
    ) THEN
        ALTER TABLE "Center" ADD COLUMN "shortName" TEXT;
    END IF;
END $$;

-- CreateIndex (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'Center_shortName_key'
    ) THEN
        CREATE UNIQUE INDEX "Center_shortName_key" ON "Center"("shortName");
    END IF;
END $$;

-- CreateIndex (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'Center_shortName_idx'
    ) THEN
        CREATE INDEX "Center_shortName_idx" ON "Center"("shortName");
    END IF;
END $$;

-- Add DrillMediaType enum
CREATE TYPE "DrillMediaType" AS ENUM ('LINK', 'IMAGE', 'PDF', 'DOCUMENT', 'VIDEO');

-- Add UPLOADED to VideoPlatform enum
DO $$ BEGIN
    ALTER TYPE "VideoPlatform" ADD VALUE IF NOT EXISTS 'UPLOADED';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable - Add new fields to Video model
ALTER TABLE "Video" ADD COLUMN "mediaType" "DrillMediaType" NOT NULL DEFAULT 'LINK';
ALTER TABLE "Video" ADD COLUMN "fileUrl" TEXT;
ALTER TABLE "Video" ADD COLUMN "fileSize" INTEGER;
ALTER TABLE "Video" ADD COLUMN "fileName" TEXT;
ALTER TABLE "Video" ADD COLUMN "mimeType" TEXT;

-- Make videoUrl nullable (for uploaded files)
ALTER TABLE "Video" ALTER COLUMN "videoUrl" DROP NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Video_mediaType_idx" ON "Video"("mediaType");

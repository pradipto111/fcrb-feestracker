-- CRM: add MANUAL source type and backing table for imported/manual leads

-- AlterEnum (idempotent)
DO $$ BEGIN
    ALTER TYPE "CrmLeadSourceType" ADD VALUE IF NOT EXISTS 'MANUAL';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "CrmManualLeadSource" (
  "id" SERIAL NOT NULL,
  "primaryName" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "preferredCentre" TEXT,
  "programmeInterest" TEXT,
  "raw" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmManualLeadSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CrmManualLeadSource_createdAt_idx" ON "CrmManualLeadSource"("createdAt");
CREATE INDEX IF NOT EXISTS "CrmManualLeadSource_email_idx" ON "CrmManualLeadSource"("email");
CREATE INDEX IF NOT EXISTS "CrmManualLeadSource_phone_idx" ON "CrmManualLeadSource"("phone");


-- CRM (Sales/BD) + System Activity
-- Adds separate CRM users, normalized CRM leads, activities/tasks, import tracking,
-- and a unified SystemActivityLog for admin visibility.

-- CreateEnum (idempotent)
DO $$ BEGIN
    CREATE TYPE "CrmUserRole" AS ENUM ('AGENT', 'MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrmUserStatus" AS ENUM ('ACTIVE', 'DISABLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrmLeadSourceType" AS ENUM ('WEBSITE', 'LEGACY', 'CHECKOUT', 'FAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrmLeadStage" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrmLeadStatus" AS ENUM ('OPEN', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrmActivityType" AS ENUM (
      'NOTE',
      'CALL',
      'EMAIL',
      'WHATSAPP',
      'MEETING',
      'STAGE_CHANGED',
      'STATUS_CHANGED',
      'OWNER_CHANGED',
      'IMPORTED',
      'MERGED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrmTaskStatus" AS ENUM ('OPEN', 'DONE', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CrmImportStatus" AS ENUM ('DRAFT', 'VALIDATED', 'COMMITTED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SystemActorType" AS ENUM ('ADMIN', 'COACH', 'STUDENT', 'FAN', 'CRM', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: CrmUser
CREATE TABLE IF NOT EXISTS "CrmUser" (
  "id" SERIAL NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "CrmUserRole" NOT NULL DEFAULT 'AGENT',
  "status" "CrmUserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CrmUser_email_key" ON "CrmUser"("email");
CREATE INDEX IF NOT EXISTS "CrmUser_role_idx" ON "CrmUser"("role");
CREATE INDEX IF NOT EXISTS "CrmUser_status_idx" ON "CrmUser"("status");

-- CreateTable: CrmLead
CREATE TABLE IF NOT EXISTS "CrmLead" (
  "id" TEXT NOT NULL,
  "sourceType" "CrmLeadSourceType" NOT NULL,
  "sourceId" INTEGER NOT NULL,
  "primaryName" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "city" TEXT,
  "preferredCentre" TEXT,
  "programmeInterest" TEXT,
  "stage" "CrmLeadStage" NOT NULL DEFAULT 'NEW',
  "status" "CrmLeadStatus" NOT NULL DEFAULT 'OPEN',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "score" INTEGER,
  "ownerId" INTEGER,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "customFields" JSONB,
  "convertedStudentId" INTEGER,
  "convertedFanId" INTEGER,
  "convertedOrderId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex / constraints
CREATE UNIQUE INDEX IF NOT EXISTS "CrmLead_sourceType_sourceId_key" ON "CrmLead"("sourceType", "sourceId");
CREATE INDEX IF NOT EXISTS "CrmLead_sourceType_idx" ON "CrmLead"("sourceType");
CREATE INDEX IF NOT EXISTS "CrmLead_stage_idx" ON "CrmLead"("stage");
CREATE INDEX IF NOT EXISTS "CrmLead_status_idx" ON "CrmLead"("status");
CREATE INDEX IF NOT EXISTS "CrmLead_ownerId_idx" ON "CrmLead"("ownerId");
CREATE INDEX IF NOT EXISTS "CrmLead_createdAt_idx" ON "CrmLead"("createdAt");

-- AddForeignKey
ALTER TABLE "CrmLead"
  ADD CONSTRAINT "CrmLead_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "CrmUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CrmActivity
CREATE TABLE IF NOT EXISTS "CrmActivity" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "type" "CrmActivityType" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "title" TEXT,
  "body" TEXT,
  "metadata" JSONB,
  "createdByCrmUserId" INTEGER,
  CONSTRAINT "CrmActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CrmActivity_leadId_idx" ON "CrmActivity"("leadId");
CREATE INDEX IF NOT EXISTS "CrmActivity_type_idx" ON "CrmActivity"("type");
CREATE INDEX IF NOT EXISTS "CrmActivity_occurredAt_idx" ON "CrmActivity"("occurredAt");
CREATE INDEX IF NOT EXISTS "CrmActivity_createdByCrmUserId_idx" ON "CrmActivity"("createdByCrmUserId");

ALTER TABLE "CrmActivity"
  ADD CONSTRAINT "CrmActivity_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmActivity"
  ADD CONSTRAINT "CrmActivity_createdByCrmUserId_fkey"
  FOREIGN KEY ("createdByCrmUserId") REFERENCES "CrmUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CrmTask
CREATE TABLE IF NOT EXISTS "CrmTask" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueAt" TIMESTAMP(3),
  "status" "CrmTaskStatus" NOT NULL DEFAULT 'OPEN',
  "assignedToCrmUserId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CrmTask_leadId_idx" ON "CrmTask"("leadId");
CREATE INDEX IF NOT EXISTS "CrmTask_status_idx" ON "CrmTask"("status");
CREATE INDEX IF NOT EXISTS "CrmTask_dueAt_idx" ON "CrmTask"("dueAt");
CREATE INDEX IF NOT EXISTS "CrmTask_assignedToCrmUserId_idx" ON "CrmTask"("assignedToCrmUserId");

ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "CrmLead"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CrmTask"
  ADD CONSTRAINT "CrmTask_assignedToCrmUserId_fkey"
  FOREIGN KEY ("assignedToCrmUserId") REFERENCES "CrmUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CrmImportJob
CREATE TABLE IF NOT EXISTS "CrmImportJob" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "filename" TEXT,
  "status" "CrmImportStatus" NOT NULL DEFAULT 'DRAFT',
  "mapping" JSONB,
  "summary" JSONB,
  "createdByCrmUserId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CrmImportJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CrmImportJob_status_idx" ON "CrmImportJob"("status");
CREATE INDEX IF NOT EXISTS "CrmImportJob_createdAt_idx" ON "CrmImportJob"("createdAt");
CREATE INDEX IF NOT EXISTS "CrmImportJob_createdByCrmUserId_idx" ON "CrmImportJob"("createdByCrmUserId");

ALTER TABLE "CrmImportJob"
  ADD CONSTRAINT "CrmImportJob_createdByCrmUserId_fkey"
  FOREIGN KEY ("createdByCrmUserId") REFERENCES "CrmUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: CrmImportRow
CREATE TABLE IF NOT EXISTS "CrmImportRow" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "rowNumber" INTEGER NOT NULL,
  "raw" JSONB NOT NULL,
  "normalized" JSONB,
  "isValid" BOOLEAN NOT NULL DEFAULT false,
  "error" TEXT,
  "dedupeKey" TEXT,
  "resolvedLeadId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CrmImportRow_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CrmImportRow_jobId_idx" ON "CrmImportRow"("jobId");
CREATE INDEX IF NOT EXISTS "CrmImportRow_isValid_idx" ON "CrmImportRow"("isValid");
CREATE INDEX IF NOT EXISTS "CrmImportRow_dedupeKey_idx" ON "CrmImportRow"("dedupeKey");
CREATE INDEX IF NOT EXISTS "CrmImportRow_rowNumber_idx" ON "CrmImportRow"("rowNumber");

ALTER TABLE "CrmImportRow"
  ADD CONSTRAINT "CrmImportRow_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "CrmImportJob"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: SystemActivityLog
CREATE TABLE IF NOT EXISTS "SystemActivityLog" (
  "id" TEXT NOT NULL,
  "actorType" "SystemActorType" NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SystemActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SystemActivityLog_actorType_idx" ON "SystemActivityLog"("actorType");
CREATE INDEX IF NOT EXISTS "SystemActivityLog_entityType_idx" ON "SystemActivityLog"("entityType");
CREATE INDEX IF NOT EXISTS "SystemActivityLog_createdAt_idx" ON "SystemActivityLog"("createdAt");


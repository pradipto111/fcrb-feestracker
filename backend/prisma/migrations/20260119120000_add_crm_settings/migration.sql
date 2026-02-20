-- Add CRM settings singleton
CREATE TABLE IF NOT EXISTS "CrmSettings" (
    "id" SERIAL NOT NULL,
    "stages" JSONB NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "slaHoursByStage" JSONB,
    "assignmentRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CrmSettings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CrmSettings_updatedAt_idx" ON "CrmSettings"("updatedAt");

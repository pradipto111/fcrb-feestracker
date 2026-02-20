-- AlterEnum: Add new CrmLeadStage enum values only.
-- PostgreSQL requires new enum values to be committed before use, so data migration is in the next migration.
ALTER TYPE "CrmLeadStage" ADD VALUE IF NOT EXISTS 'FOLLOW_UP';
ALTER TYPE "CrmLeadStage" ADD VALUE IF NOT EXISTS 'WILL_JOIN';
ALTER TYPE "CrmLeadStage" ADD VALUE IF NOT EXISTS 'JOINED';
ALTER TYPE "CrmLeadStage" ADD VALUE IF NOT EXISTS 'UNINTERESTED_NO_RESPONSE';

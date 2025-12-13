-- CreateEnum
CREATE TYPE "MetricCategory" AS ENUM ('TECHNICAL', 'PHYSICAL', 'MENTAL', 'ATTITUDE', 'GOALKEEPING');

-- CreateEnum
CREATE TYPE "PlayerPosition" AS ENUM ('GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'W', 'ST');

-- CreateEnum
CREATE TYPE "MetricSourceContext" AS ENUM ('TRAINING_BLOCK', 'MATCH_BLOCK', 'TRIAL', 'MONTHLY_REVIEW', 'QUARTERLY_ASSESSMENT', 'SEASON_START', 'SEASON_END', 'CUSTOM');

-- CreateTable
CREATE TABLE "PlayerMetricDefinition" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "category" "MetricCategory" NOT NULL,
    "description" TEXT,
    "minValue" INTEGER NOT NULL DEFAULT 0,
    "maxValue" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCoachOnly" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerMetricDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMetricSnapshot" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "createdByRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceContext" "MetricSourceContext" NOT NULL,
    "seasonId" TEXT,
    "notes" TEXT,

    CONSTRAINT "PlayerMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMetricValue" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "metricDefinitionId" INTEGER NOT NULL,
    "valueNumber" INTEGER NOT NULL,
    "confidence" INTEGER,
    "comment" TEXT,

    CONSTRAINT "PlayerMetricValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPositionalSuitability" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "position" "PlayerPosition" NOT NULL,
    "suitability" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "PlayerPositionalSuitability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerTraitSnapshot" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "metricDefinitionId" INTEGER NOT NULL,
    "valueNumber" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "PlayerTraitSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMetricAuditLog" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "previousSnapshotId" INTEGER,
    "changedByUserId" INTEGER NOT NULL,
    "changedByRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diffJson" JSONB NOT NULL,
    "summary" TEXT,

    CONSTRAINT "PlayerMetricAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerCoachNote" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "authorUserId" INTEGER NOT NULL,
    "authorRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "relatedSnapshotId" INTEGER,
    "isVisibleToPlayer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlayerCoachNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerReadinessIndex" (
    "id" SERIAL NOT NULL,
    "snapshotId" INTEGER NOT NULL,
    "overall" INTEGER NOT NULL,
    "technical" INTEGER NOT NULL,
    "physical" INTEGER NOT NULL,
    "mental" INTEGER NOT NULL,
    "attitude" INTEGER NOT NULL,
    "tacticalFit" INTEGER NOT NULL,
    "explanationJson" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerReadinessIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMetricDefinition_key_key" ON "PlayerMetricDefinition"("key");

-- CreateIndex
CREATE INDEX "PlayerMetricDefinition_key_idx" ON "PlayerMetricDefinition"("key");

-- CreateIndex
CREATE INDEX "PlayerMetricDefinition_category_idx" ON "PlayerMetricDefinition"("category");

-- CreateIndex
CREATE INDEX "PlayerMetricDefinition_isActive_idx" ON "PlayerMetricDefinition"("isActive");

-- CreateIndex
CREATE INDEX "PlayerMetricDefinition_displayOrder_idx" ON "PlayerMetricDefinition"("displayOrder");

-- CreateIndex
CREATE INDEX "PlayerMetricSnapshot_studentId_createdAt_idx" ON "PlayerMetricSnapshot"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerMetricSnapshot_createdByUserId_idx" ON "PlayerMetricSnapshot"("createdByUserId");

-- CreateIndex
CREATE INDEX "PlayerMetricSnapshot_sourceContext_idx" ON "PlayerMetricSnapshot"("sourceContext");

-- CreateIndex
CREATE INDEX "PlayerMetricSnapshot_createdAt_idx" ON "PlayerMetricSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "PlayerMetricValue_snapshotId_idx" ON "PlayerMetricValue"("snapshotId");

-- CreateIndex
CREATE INDEX "PlayerMetricValue_metricDefinitionId_idx" ON "PlayerMetricValue"("metricDefinitionId");

-- CreateIndex
CREATE INDEX "PlayerMetricValue_valueNumber_idx" ON "PlayerMetricValue"("valueNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMetricValue_snapshotId_metricDefinitionId_key" ON "PlayerMetricValue"("snapshotId", "metricDefinitionId");

-- CreateIndex
CREATE INDEX "PlayerPositionalSuitability_snapshotId_idx" ON "PlayerPositionalSuitability"("snapshotId");

-- CreateIndex
CREATE INDEX "PlayerPositionalSuitability_position_idx" ON "PlayerPositionalSuitability"("position");

-- CreateIndex
CREATE INDEX "PlayerPositionalSuitability_suitability_idx" ON "PlayerPositionalSuitability"("suitability");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerPositionalSuitability_snapshotId_position_key" ON "PlayerPositionalSuitability"("snapshotId", "position");

-- CreateIndex
CREATE INDEX "PlayerTraitSnapshot_snapshotId_idx" ON "PlayerTraitSnapshot"("snapshotId");

-- CreateIndex
CREATE INDEX "PlayerTraitSnapshot_metricDefinitionId_idx" ON "PlayerTraitSnapshot"("metricDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerTraitSnapshot_snapshotId_metricDefinitionId_key" ON "PlayerTraitSnapshot"("snapshotId", "metricDefinitionId");

-- CreateIndex
CREATE INDEX "PlayerMetricAuditLog_studentId_createdAt_idx" ON "PlayerMetricAuditLog"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerMetricAuditLog_snapshotId_idx" ON "PlayerMetricAuditLog"("snapshotId");

-- CreateIndex
CREATE INDEX "PlayerMetricAuditLog_changedByUserId_idx" ON "PlayerMetricAuditLog"("changedByUserId");

-- CreateIndex
CREATE INDEX "PlayerMetricAuditLog_createdAt_idx" ON "PlayerMetricAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "PlayerCoachNote_studentId_createdAt_idx" ON "PlayerCoachNote"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerCoachNote_authorUserId_idx" ON "PlayerCoachNote"("authorUserId");

-- CreateIndex
CREATE INDEX "PlayerCoachNote_relatedSnapshotId_idx" ON "PlayerCoachNote"("relatedSnapshotId");

-- CreateIndex
CREATE INDEX "PlayerCoachNote_tags_idx" ON "PlayerCoachNote"("tags");

-- CreateIndex
CREATE INDEX "PlayerCoachNote_isVisibleToPlayer_idx" ON "PlayerCoachNote"("isVisibleToPlayer");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerReadinessIndex_snapshotId_key" ON "PlayerReadinessIndex"("snapshotId");

-- CreateIndex
CREATE INDEX "PlayerReadinessIndex_snapshotId_idx" ON "PlayerReadinessIndex"("snapshotId");

-- CreateIndex
CREATE INDEX "PlayerReadinessIndex_overall_idx" ON "PlayerReadinessIndex"("overall");

-- AddForeignKey
ALTER TABLE "PlayerMetricSnapshot" ADD CONSTRAINT "PlayerMetricSnapshot_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMetricSnapshot" ADD CONSTRAINT "PlayerMetricSnapshot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMetricValue" ADD CONSTRAINT "PlayerMetricValue_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerMetricSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMetricValue" ADD CONSTRAINT "PlayerMetricValue_metricDefinitionId_fkey" FOREIGN KEY ("metricDefinitionId") REFERENCES "PlayerMetricDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPositionalSuitability" ADD CONSTRAINT "PlayerPositionalSuitability_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerMetricSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTraitSnapshot" ADD CONSTRAINT "PlayerTraitSnapshot_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerMetricSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerTraitSnapshot" ADD CONSTRAINT "PlayerTraitSnapshot_metricDefinitionId_fkey" FOREIGN KEY ("metricDefinitionId") REFERENCES "PlayerMetricDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMetricAuditLog" ADD CONSTRAINT "PlayerMetricAuditLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMetricAuditLog" ADD CONSTRAINT "PlayerMetricAuditLog_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerMetricSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMetricAuditLog" ADD CONSTRAINT "PlayerMetricAuditLog_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCoachNote" ADD CONSTRAINT "PlayerCoachNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCoachNote" ADD CONSTRAINT "PlayerCoachNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerCoachNote" ADD CONSTRAINT "PlayerCoachNote_relatedSnapshotId_fkey" FOREIGN KEY ("relatedSnapshotId") REFERENCES "PlayerMetricSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerReadinessIndex" ADD CONSTRAINT "PlayerReadinessIndex_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "PlayerMetricSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

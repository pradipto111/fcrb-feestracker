-- Coach Calibration System Schema Extensions
-- This migration adds tables for coach scoring profiles and calibration stats

-- Coach Scoring Profile - Cached computed stats per coach
CREATE TABLE IF NOT EXISTS "CoachScoringProfile" (
    "id" SERIAL NOT NULL,
    "coachId" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSnapshots" INTEGER NOT NULL DEFAULT 0,
    "averageOverallScore" DOUBLE PRECISION,
    "averageTechnicalScore" DOUBLE PRECISION,
    "averagePhysicalScore" DOUBLE PRECISION,
    "averageMentalScore" DOUBLE PRECISION,
    "averageAttitudeScore" DOUBLE PRECISION,
    "standardDeviation" DOUBLE PRECISION,
    "percentAbove70" DOUBLE PRECISION,
    "percentBelow40" DOUBLE PRECISION,
    "averageConfidence" DOUBLE PRECISION,
    "largeJumpFrequency" DOUBLE PRECISION, -- % of snapshots with >12 point jumps
    "scoreDistribution" JSONB, -- Histogram data: { "0-20": count, "21-40": count, ... }
    "lastSnapshotDate" TIMESTAMP(3),
    CONSTRAINT "CoachScoringProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CoachScoringProfile_coachId_key" ON "CoachScoringProfile"("coachId");
CREATE INDEX IF NOT EXISTS "CoachScoringProfile_coachId_idx" ON "CoachScoringProfile"("coachId");

-- Coach Metric Stats - Per-metric statistics per coach
CREATE TABLE IF NOT EXISTS "CoachMetricStats" (
    "id" SERIAL NOT NULL,
    "coachId" INTEGER NOT NULL,
    "metricKey" TEXT NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "standardDeviation" DOUBLE PRECISION,
    "minScore" INTEGER,
    "maxScore" INTEGER,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachMetricStats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CoachMetricStats_coachId_metricKey_key" ON "CoachMetricStats"("coachId", "metricKey");
CREATE INDEX IF NOT EXISTS "CoachMetricStats_coachId_idx" ON "CoachMetricStats"("coachId");
CREATE INDEX IF NOT EXISTS "CoachMetricStats_metricKey_idx" ON "CoachMetricStats"("metricKey");

-- Contextual Averages - Pre-computed averages for quick reference
CREATE TABLE IF NOT EXISTS "MetricContextualAverage" (
    "id" SERIAL NOT NULL,
    "metricKey" TEXT NOT NULL,
    "centerId" INTEGER,
    "position" "PlayerPosition",
    "ageGroup" TEXT, -- e.g., "U15", "U17"
    "averageScore" DOUBLE PRECISION NOT NULL,
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seasonId" TEXT,
    CONSTRAINT "MetricContextualAverage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MetricContextualAverage_metricKey_idx" ON "MetricContextualAverage"("metricKey");
CREATE INDEX IF NOT EXISTS "MetricContextualAverage_centerId_idx" ON "MetricContextualAverage"("centerId");
CREATE INDEX IF NOT EXISTS "MetricContextualAverage_position_idx" ON "MetricContextualAverage"("position");
CREATE INDEX IF NOT EXISTS "MetricContextualAverage_ageGroup_idx" ON "MetricContextualAverage"("ageGroup");
CREATE INDEX IF NOT EXISTS "MetricContextualAverage_seasonId_idx" ON "MetricContextualAverage"("seasonId");



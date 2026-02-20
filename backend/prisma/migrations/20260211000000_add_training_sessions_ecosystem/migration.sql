-- CreateTable
CREATE TABLE "SessionParticipant" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionParticipant_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "title" TEXT NOT NULL DEFAULT '',
    ADD COLUMN     "description" TEXT,
    ADD COLUMN     "programmeId" TEXT;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "markedBy" INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN     "markedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "SessionParticipant_sessionId_idx" ON "SessionParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "SessionParticipant_studentId_idx" ON "SessionParticipant"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionParticipant_sessionId_studentId_key" ON "SessionParticipant"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "Session_programmeId_idx" ON "Session"("programmeId");

-- CreateIndex
CREATE INDEX "Attendance_markedBy_idx" ON "Attendance"("markedBy");

-- CreateIndex
CREATE INDEX "Attendance_markedAt_idx" ON "Attendance"("markedAt");

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionParticipant" ADD CONSTRAINT "SessionParticipant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill existing data
-- 1. Set default titles for existing sessions
UPDATE "Session" SET "title" = 'Training Session - ' || TO_CHAR("sessionDate", 'YYYY-MM-DD') WHERE "title" = '';

-- 2. Create SessionParticipant records for all students who have attendance records
INSERT INTO "SessionParticipant" ("sessionId", "studentId", "createdAt")
SELECT DISTINCT "sessionId", "studentId", "createdAt"
FROM "Attendance"
ON CONFLICT ("sessionId", "studentId") DO NOTHING;

-- 3. Backfill markedBy and markedAt for existing attendance records
UPDATE "Attendance" 
SET "markedBy" = (
    SELECT "coachId" 
    FROM "Session" 
    WHERE "Session"."id" = "Attendance"."sessionId"
),
"markedAt" = "Attendance"."createdAt"
WHERE "markedBy" = 1;

-- 4. Make title NOT NULL after backfilling (if needed, but we already set defaults)
-- The column is already NOT NULL with a default, so this is handled

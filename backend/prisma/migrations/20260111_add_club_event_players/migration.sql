-- Add player selection support to ClubEvent
-- CreateTable
CREATE TABLE "ClubEventPlayer" (
  "id" SERIAL NOT NULL,
  "eventId" TEXT NOT NULL,
  "studentId" INTEGER NOT NULL,
  "position" TEXT,
  "role" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClubEventPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubEventPlayer_eventId_studentId_key" ON "ClubEventPlayer"("eventId", "studentId");

-- CreateIndex
CREATE INDEX "ClubEventPlayer_eventId_idx" ON "ClubEventPlayer"("eventId");

-- CreateIndex
CREATE INDEX "ClubEventPlayer_studentId_idx" ON "ClubEventPlayer"("studentId");

-- AddForeignKey
ALTER TABLE "ClubEventPlayer" ADD CONSTRAINT "ClubEventPlayer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ClubEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubEventPlayer" ADD CONSTRAINT "ClubEventPlayer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;


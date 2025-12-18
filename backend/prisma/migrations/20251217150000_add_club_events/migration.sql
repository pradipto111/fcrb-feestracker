-- CreateEnum
CREATE TYPE "ClubEventType" AS ENUM ('MATCH', 'TRAINING', 'TRIAL', 'SEMINAR', 'MEETING', 'OTHER');

-- CreateEnum
CREATE TYPE "ClubEventStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'POSTPONED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "HomeAway" AS ENUM ('HOME', 'AWAY');

-- CreateTable
CREATE TABLE "ClubEvent" (
  "id" TEXT NOT NULL,
  "type" "ClubEventType" NOT NULL,
  "title" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "venueName" TEXT,
  "venueAddress" TEXT,
  "googleMapsUrl" TEXT,
  "competition" TEXT,
  "opponent" TEXT,
  "homeAway" "HomeAway",
  "teamId" INTEGER,
  "centerId" INTEGER,
  "status" "ClubEventStatus" NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,
  "createdByUserId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ClubEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubEvent_startAt_idx" ON "ClubEvent"("startAt");

-- CreateIndex
CREATE INDEX "ClubEvent_type_idx" ON "ClubEvent"("type");

-- CreateIndex
CREATE INDEX "ClubEvent_status_idx" ON "ClubEvent"("status");

-- CreateIndex
CREATE INDEX "ClubEvent_centerId_idx" ON "ClubEvent"("centerId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubEvent_title_startAt_key" ON "ClubEvent"("title", "startAt");

-- AddForeignKey
ALTER TABLE "ClubEvent" ADD CONSTRAINT "ClubEvent_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubEvent" ADD CONSTRAINT "ClubEvent_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



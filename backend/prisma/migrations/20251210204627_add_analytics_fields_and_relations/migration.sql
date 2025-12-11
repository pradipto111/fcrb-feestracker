/*
  Warnings:

  - A unique constraint covering the columns `[shortName]` on the table `Center` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'EXCUSED');

-- CreateEnum
CREATE TYPE "MatchSelectionStatus" AS ENUM ('SELECTED', 'NOT_SELECTED', 'INJURED_UNAVAILABLE', 'RESERVE');

-- CreateEnum
CREATE TYPE "MatchSelectionReason" AS ENUM ('PERFORMANCE_BASED', 'TACTICAL_FIT', 'ATTENDANCE_REQUIREMENT', 'PHYSICAL_READINESS', 'SQUAD_ROTATION', 'INJURY_RECOVERY', 'OTHER');

-- CreateEnum
CREATE TYPE "FixtureStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'POSTPONED');

-- CreateEnum
CREATE TYPE "VideoPlatform" AS ENUM ('YOUTUBE', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "PostMediaType" AS ENUM ('IMAGE', 'VIDEO', 'LINK');

-- CreateEnum
CREATE TYPE "PostPlatform" AS ENUM ('YOUTUBE', 'INSTAGRAM', 'INTERNAL');

-- CreateEnum
CREATE TYPE "PostApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('FIRST_VOTE', 'TOP_WEEKLY', 'TOP_MONTHLY', 'STREAK_5', 'STREAK_10', 'STREAK_20', 'CENTURY', 'FIVE_HUNDRED', 'THOUSAND', 'COACH_FAVORITE', 'PEER_FAVORITE', 'CONSISTENT');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('JOINED_ACADEMY', 'ATTENDANCE_MILESTONE', 'LEAGUE_PARTICIPATION', 'MATCH_APPEARANCE', 'PERFORMANCE_EVALUATION', 'PROMOTION', 'COACH_FEEDBACK', 'BADGE_EARNED', 'PAYMENT_MILESTONE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Center" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "googleMapsUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "shortName" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "centerId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fixture" (
    "id" SERIAL NOT NULL,
    "centerId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "matchType" TEXT NOT NULL,
    "opponent" TEXT,
    "matchDate" TIMESTAMP(3) NOT NULL,
    "matchTime" TEXT NOT NULL,
    "venue" TEXT,
    "notes" TEXT,
    "status" "FixtureStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixturePlayer" (
    "id" SERIAL NOT NULL,
    "fixtureId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "position" TEXT,
    "role" TEXT,
    "selectionStatus" "MatchSelectionStatus" NOT NULL DEFAULT 'NOT_SELECTED',
    "selectionReason" "MatchSelectionReason",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixturePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "platform" "VideoPlatform" NOT NULL DEFAULT 'YOUTUBE',
    "category" TEXT,
    "thumbnailUrl" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "mediaType" "PostMediaType" NOT NULL DEFAULT 'IMAGE',
    "mediaUrl" TEXT NOT NULL,
    "platform" "PostPlatform",
    "centerId" INTEGER,
    "createdByRole" "Role" NOT NULL,
    "createdById" INTEGER NOT NULL,
    "approvalStatus" "PostApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdByRole" "Role" NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "voterRole" "Role" NOT NULL,
    "voterId" INTEGER NOT NULL,
    "votedForId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "centerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentStats" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "centerId" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "studentVotes" INTEGER NOT NULL DEFAULT 0,
    "coachVotes" INTEGER NOT NULL DEFAULT 0,
    "sessionsVoted" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "weeklyPoints" INTEGER NOT NULL DEFAULT 0,
    "monthlyPoints" INTEGER NOT NULL DEFAULT 0,
    "lastVotedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" SERIAL NOT NULL,
    "studentStatsId" INTEGER NOT NULL,
    "badgeType" "BadgeType" NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteLead" (
    "id" SERIAL NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'website_join',
    "playerName" TEXT NOT NULL,
    "playerDob" TIMESTAMP(3),
    "ageBracket" TEXT,
    "guardianName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredCentre" TEXT NOT NULL,
    "programmeInterest" TEXT NOT NULL,
    "playingPosition" TEXT,
    "currentLevel" TEXT NOT NULL,
    "heardFrom" TEXT NOT NULL,
    "notes" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedTo" INTEGER,
    "internalNotes" TEXT,
    "convertedPlayerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "sizes" TEXT[],
    "variants" JSONB,
    "stock" INTEGER,
    "category" TEXT,
    "tags" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "shippingFee" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "shippingAddress" JSONB NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentProvider" TEXT,
    "paymentReference" TEXT,
    "paymentData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "variant" TEXT,
    "size" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "eventType" "TimelineEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdByRole" "Role",
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyFeedback" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "coachId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "strengths" TEXT[],
    "areasToImprove" TEXT[],
    "focusGoal" TEXT NOT NULL,
    "overallNote" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedById" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessCheck" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "sessionId" INTEGER,
    "checkDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exertionLevel" INTEGER NOT NULL,
    "muscleSoreness" INTEGER,
    "energyLevel" "EnergyLevel" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressRoadmap" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "nextPotentialLevel" TEXT,
    "attendanceRequirement" TEXT,
    "physicalBenchmark" TEXT,
    "tacticalRequirement" TEXT,
    "coachRecommendation" BOOLEAN NOT NULL DEFAULT false,
    "isEligible" BOOLEAN NOT NULL DEFAULT false,
    "eligibilityNotes" TEXT,
    "updatedByRole" "Role" NOT NULL,
    "updatedById" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CentreMonthlyMetrics" (
    "id" SERIAL NOT NULL,
    "centreId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalPlayers" INTEGER,
    "activePlayers" INTEGER,
    "churnedPlayers" INTEGER,
    "residential" INTEGER,
    "nonResidential" INTEGER,
    "totalRevenue" INTEGER,
    "additionalRevenue" INTEGER,
    "netRentalCharges" INTEGER,
    "coachingCosts" INTEGER,
    "otherExpenses" INTEGER,
    "netProfit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CentreMonthlyMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_centerId_idx" ON "Session"("centerId");

-- CreateIndex
CREATE INDEX "Session_coachId_idx" ON "Session"("coachId");

-- CreateIndex
CREATE INDEX "Session_sessionDate_idx" ON "Session"("sessionDate");

-- CreateIndex
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");

-- CreateIndex
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_sessionId_studentId_key" ON "Attendance"("sessionId", "studentId");

-- CreateIndex
CREATE INDEX "Fixture_centerId_idx" ON "Fixture"("centerId");

-- CreateIndex
CREATE INDEX "Fixture_coachId_idx" ON "Fixture"("coachId");

-- CreateIndex
CREATE INDEX "Fixture_matchDate_idx" ON "Fixture"("matchDate");

-- CreateIndex
CREATE INDEX "FixturePlayer_fixtureId_idx" ON "FixturePlayer"("fixtureId");

-- CreateIndex
CREATE INDEX "FixturePlayer_studentId_idx" ON "FixturePlayer"("studentId");

-- CreateIndex
CREATE INDEX "FixturePlayer_selectionStatus_idx" ON "FixturePlayer"("selectionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "FixturePlayer_fixtureId_studentId_key" ON "FixturePlayer"("fixtureId", "studentId");

-- CreateIndex
CREATE INDEX "Video_createdById_idx" ON "Video"("createdById");

-- CreateIndex
CREATE INDEX "Video_category_idx" ON "Video"("category");

-- CreateIndex
CREATE INDEX "Video_platform_idx" ON "Video"("platform");

-- CreateIndex
CREATE INDEX "Post_createdById_createdByRole_idx" ON "Post"("createdById", "createdByRole");

-- CreateIndex
CREATE INDEX "Post_centerId_idx" ON "Post"("centerId");

-- CreateIndex
CREATE INDEX "Post_approvalStatus_idx" ON "Post"("approvalStatus");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_createdById_createdByRole_idx" ON "Comment"("createdById", "createdByRole");

-- CreateIndex
CREATE INDEX "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE INDEX "Vote_sessionId_idx" ON "Vote"("sessionId");

-- CreateIndex
CREATE INDEX "Vote_votedForId_idx" ON "Vote"("votedForId");

-- CreateIndex
CREATE INDEX "Vote_centerId_idx" ON "Vote"("centerId");

-- CreateIndex
CREATE INDEX "Vote_createdAt_idx" ON "Vote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_sessionId_voterId_voterRole_votedForId_key" ON "Vote"("sessionId", "voterId", "voterRole", "votedForId");

-- CreateIndex
CREATE INDEX "StudentStats_centerId_totalPoints_idx" ON "StudentStats"("centerId", "totalPoints");

-- CreateIndex
CREATE INDEX "StudentStats_centerId_weeklyPoints_idx" ON "StudentStats"("centerId", "weeklyPoints");

-- CreateIndex
CREATE INDEX "StudentStats_centerId_monthlyPoints_idx" ON "StudentStats"("centerId", "monthlyPoints");

-- CreateIndex
CREATE UNIQUE INDEX "StudentStats_studentId_centerId_key" ON "StudentStats"("studentId", "centerId");

-- CreateIndex
CREATE INDEX "Badge_studentStatsId_idx" ON "Badge"("studentStatsId");

-- CreateIndex
CREATE INDEX "Badge_badgeType_idx" ON "Badge"("badgeType");

-- CreateIndex
CREATE INDEX "WebsiteLead_status_idx" ON "WebsiteLead"("status");

-- CreateIndex
CREATE INDEX "WebsiteLead_preferredCentre_idx" ON "WebsiteLead"("preferredCentre");

-- CreateIndex
CREATE INDEX "WebsiteLead_programmeInterest_idx" ON "WebsiteLead"("programmeInterest");

-- CreateIndex
CREATE INDEX "WebsiteLead_createdAt_idx" ON "WebsiteLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_displayOrder_idx" ON "Product"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_email_idx" ON "Order"("email");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "TimelineEvent_studentId_idx" ON "TimelineEvent"("studentId");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventDate_idx" ON "TimelineEvent"("eventDate");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventType_idx" ON "TimelineEvent"("eventType");

-- CreateIndex
CREATE INDEX "MonthlyFeedback_studentId_idx" ON "MonthlyFeedback"("studentId");

-- CreateIndex
CREATE INDEX "MonthlyFeedback_coachId_idx" ON "MonthlyFeedback"("coachId");

-- CreateIndex
CREATE INDEX "MonthlyFeedback_year_month_idx" ON "MonthlyFeedback"("year", "month");

-- CreateIndex
CREATE INDEX "MonthlyFeedback_isPublished_idx" ON "MonthlyFeedback"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyFeedback_studentId_month_year_key" ON "MonthlyFeedback"("studentId", "month", "year");

-- CreateIndex
CREATE INDEX "WellnessCheck_studentId_idx" ON "WellnessCheck"("studentId");

-- CreateIndex
CREATE INDEX "WellnessCheck_checkDate_idx" ON "WellnessCheck"("checkDate");

-- CreateIndex
CREATE INDEX "WellnessCheck_sessionId_idx" ON "WellnessCheck"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "WellnessCheck_studentId_checkDate_key" ON "WellnessCheck"("studentId", "checkDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressRoadmap_studentId_key" ON "ProgressRoadmap"("studentId");

-- CreateIndex
CREATE INDEX "ProgressRoadmap_studentId_idx" ON "ProgressRoadmap"("studentId");

-- CreateIndex
CREATE INDEX "ProgressRoadmap_isEligible_idx" ON "ProgressRoadmap"("isEligible");

-- CreateIndex
CREATE INDEX "CentreMonthlyMetrics_centreId_idx" ON "CentreMonthlyMetrics"("centreId");

-- CreateIndex
CREATE INDEX "CentreMonthlyMetrics_year_month_idx" ON "CentreMonthlyMetrics"("year", "month");

-- CreateIndex
CREATE INDEX "CentreMonthlyMetrics_centreId_year_month_idx" ON "CentreMonthlyMetrics"("centreId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "CentreMonthlyMetrics_centreId_year_month_key" ON "CentreMonthlyMetrics"("centreId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "Center_shortName_key" ON "Center"("shortName");

-- CreateIndex
CREATE INDEX "Center_shortName_idx" ON "Center"("shortName");

-- CreateIndex
CREATE INDEX "Center_isActive_idx" ON "Center"("isActive");

-- CreateIndex
CREATE INDEX "Center_displayOrder_idx" ON "Center"("displayOrder");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixturePlayer" ADD CONSTRAINT "FixturePlayer_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixturePlayer" ADD CONSTRAINT "FixturePlayer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentStats" ADD CONSTRAINT "StudentStats_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentStats" ADD CONSTRAINT "StudentStats_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_studentStatsId_fkey" FOREIGN KEY ("studentStatsId") REFERENCES "StudentStats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyFeedback" ADD CONSTRAINT "MonthlyFeedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyFeedback" ADD CONSTRAINT "MonthlyFeedback_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyFeedback" ADD CONSTRAINT "MonthlyFeedback_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessCheck" ADD CONSTRAINT "WellnessCheck_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessCheck" ADD CONSTRAINT "WellnessCheck_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRoadmap" ADD CONSTRAINT "ProgressRoadmap_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressRoadmap" ADD CONSTRAINT "ProgressRoadmap_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CentreMonthlyMetrics" ADD CONSTRAINT "CentreMonthlyMetrics_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

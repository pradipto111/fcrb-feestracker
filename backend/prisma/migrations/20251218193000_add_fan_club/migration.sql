-- Fan Club (RealVerse Fan) schema
-- This migration is designed for fresh DBs created from prior migrations.

-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FAN';

-- CreateEnum
CREATE TYPE "FanAccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FanCenterPreference" AS ENUM ('THREELOK', 'DEPOT18', 'BLITZZ', 'TRONIC');

-- CreateEnum
CREATE TYPE "RewardCampaignType" AS ENUM ('STATIC', 'DYNAMIC_ROLLING');

-- CreateEnum
CREATE TYPE "CouponCodeType" AS ENUM ('SINGLE_USE', 'MULTI_USE');

-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('PERCENT', 'FLAT', 'FREEBIE');

-- CreateEnum
CREATE TYPE "CouponRedemptionStatus" AS ENUM ('REDEEMED', 'REVOKED');

-- CreateEnum
CREATE TYPE "FanGameType" AS ENUM ('QUIZ', 'PREDICT_SCORE', 'SPIN', 'COLLECT', 'STREAK');

-- CreateEnum
CREATE TYPE "FanConversionLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'DROPPED');

-- CreateEnum
CREATE TYPE "FanProgramInterest" AS ENUM ('EPP', 'SCP', 'WPP', 'FYDP');

-- CreateTable
CREATE TABLE "FanUser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FAN',
    "status" "FanAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanTier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "monthlyPriceINR" INTEGER NOT NULL,
    "yearlyPriceINR" INTEGER NOT NULL,
    "benefitsJson" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "featureFlags" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "centerPreference" "FanCenterPreference",
    "tierId" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanSponsor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logoAssetKey" TEXT NOT NULL,
    "brandPrimary" TEXT NOT NULL,
    "brandSecondary" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanSponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardCampaign" (
    "id" SERIAL NOT NULL,
    "sponsorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" "RewardCampaignType" NOT NULL DEFAULT 'STATIC',
    "copy" TEXT NOT NULL,
    "rulesJson" JSONB,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "tierEligibility" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponPool" (
    "id" SERIAL NOT NULL,
    "sponsorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "codeType" "CouponCodeType" NOT NULL,
    "multiUseCode" TEXT,
    "discountType" "CouponDiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "conditionsText" TEXT NOT NULL,
    "tierEligibility" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "maxRedemptions" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponCode" (
    "id" SERIAL NOT NULL,
    "couponPoolId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponRedemption" (
    "id" SERIAL NOT NULL,
    "fanId" INTEGER NOT NULL,
    "couponPoolId" INTEGER NOT NULL,
    "codeUsed" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CouponRedemptionStatus" NOT NULL DEFAULT 'REDEEMED',

    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanQuest" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsReward" INTEGER NOT NULL DEFAULT 0,
    "badgeReward" TEXT,
    "unlockRule" TEXT,
    "tierEligibility" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanGameSession" (
    "id" SERIAL NOT NULL,
    "fanId" INTEGER NOT NULL,
    "gameType" "FanGameType" NOT NULL,
    "input" JSONB,
    "result" JSONB,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanConversionLead" (
    "id" SERIAL NOT NULL,
    "fanId" INTEGER NOT NULL,
    "programInterest" "FanProgramInterest" NOT NULL,
    "status" "FanConversionLeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FanConversionLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "actorAdminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FanUser_email_key" ON "FanUser"("email");
CREATE INDEX "FanUser_role_idx" ON "FanUser"("role");
CREATE INDEX "FanUser_status_idx" ON "FanUser"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FanTier_name_key" ON "FanTier"("name");
CREATE INDEX "FanTier_isActive_idx" ON "FanTier"("isActive");
CREATE INDEX "FanTier_sortOrder_idx" ON "FanTier"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FanProfile_userId_key" ON "FanProfile"("userId");
CREATE INDEX "FanProfile_tierId_idx" ON "FanProfile"("tierId");
CREATE INDEX "FanProfile_joinedAt_idx" ON "FanProfile"("joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FanSponsor_name_key" ON "FanSponsor"("name");
CREATE INDEX "FanSponsor_isActive_idx" ON "FanSponsor"("isActive");

-- CreateIndex
CREATE INDEX "RewardCampaign_sponsorId_idx" ON "RewardCampaign"("sponsorId");
CREATE INDEX "RewardCampaign_isActive_idx" ON "RewardCampaign"("isActive");
CREATE INDEX "RewardCampaign_priority_idx" ON "RewardCampaign"("priority");

-- CreateIndex
CREATE INDEX "CouponPool_sponsorId_idx" ON "CouponPool"("sponsorId");
CREATE INDEX "CouponPool_isActive_idx" ON "CouponPool"("isActive");
CREATE INDEX "CouponPool_expiresAt_idx" ON "CouponPool"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CouponCode_couponPoolId_code_key" ON "CouponCode"("couponPoolId", "code");
CREATE INDEX "CouponCode_couponPoolId_idx" ON "CouponCode"("couponPoolId");
CREATE INDEX "CouponCode_isUsed_idx" ON "CouponCode"("isUsed");

-- CreateIndex
CREATE INDEX "CouponRedemption_fanId_idx" ON "CouponRedemption"("fanId");
CREATE INDEX "CouponRedemption_couponPoolId_idx" ON "CouponRedemption"("couponPoolId");
CREATE INDEX "CouponRedemption_redeemedAt_idx" ON "CouponRedemption"("redeemedAt");
CREATE UNIQUE INDEX "CouponRedemption_fanId_couponPoolId_key" ON "CouponRedemption"("fanId", "couponPoolId");

-- CreateIndex
CREATE INDEX "FanQuest_isActive_idx" ON "FanQuest"("isActive");

-- CreateIndex
CREATE INDEX "FanGameSession_fanId_idx" ON "FanGameSession"("fanId");
CREATE INDEX "FanGameSession_gameType_idx" ON "FanGameSession"("gameType");
CREATE INDEX "FanGameSession_createdAt_idx" ON "FanGameSession"("createdAt");

-- CreateIndex
CREATE INDEX "FanConversionLead_fanId_idx" ON "FanConversionLead"("fanId");
CREATE INDEX "FanConversionLead_programInterest_idx" ON "FanConversionLead"("programInterest");
CREATE INDEX "FanConversionLead_status_idx" ON "FanConversionLead"("status");
CREATE INDEX "FanConversionLead_createdAt_idx" ON "FanConversionLead"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorAdminId_idx" ON "AuditLog"("actorAdminId");
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "FanProfile" ADD CONSTRAINT "FanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "FanUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FanProfile" ADD CONSTRAINT "FanProfile_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "FanTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RewardCampaign" ADD CONSTRAINT "RewardCampaign_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "FanSponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponPool" ADD CONSTRAINT "CouponPool_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "FanSponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponCode" ADD CONSTRAINT "CouponCode_couponPoolId_fkey" FOREIGN KEY ("couponPoolId") REFERENCES "CouponPool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponPoolId_fkey" FOREIGN KEY ("couponPoolId") REFERENCES "CouponPool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FanGameSession" ADD CONSTRAINT "FanGameSession_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FanConversionLead" ADD CONSTRAINT "FanConversionLead_fanId_fkey" FOREIGN KEY ("fanId") REFERENCES "FanProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;



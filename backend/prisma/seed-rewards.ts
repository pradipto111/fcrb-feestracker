import { PrismaClient } from '@prisma/client';
import { 
  CouponCodeType, 
  CouponDiscountType, 
  RewardCampaignType 
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION
// ============================================

interface RewardConfig {
  campaignsPerSponsor: number;
  couponPoolsPerSponsor: number;
  singleUseCodes: number;
  includeFreebies: boolean;
}

const DEFAULT_CONFIG: RewardConfig = {
  campaignsPerSponsor: 5,
  couponPoolsPerSponsor: 8,
  singleUseCodes: 50,
  includeFreebies: true,
};

// ============================================
// SPONSOR DEFINITIONS (Based on frontend)
// ============================================

const SPONSORS = [
  {
    name: "Notch",
    logoAssetKey: "notch",
    brandPrimary: "#7C3AED",
    brandSecondary: "#22D3EE",
    description: "Performance Partner - Premium sports gear and training essentials"
  },
  {
    name: "Sparsh Hospital",
    logoAssetKey: "sparsh",
    brandPrimary: "#10B981",
    brandSecondary: "#60A5FA",
    description: "Medical Partner - Complete healthcare and sports medicine"
  },
  {
    name: "Decathlon",
    logoAssetKey: "decathlon",
    brandPrimary: "#2563EB",
    brandSecondary: "#0EA5E9",
    description: "Equipment Partner - Affordable sports gear for all"
  },
  {
    name: "Aces",
    logoAssetKey: "aces",
    brandPrimary: "#F59E0B",
    brandSecondary: "#EF4444",
    description: "Training & Performance Partner - Elite athletic performance"
  },
  {
    name: "Hyve",
    logoAssetKey: "hyve",
    brandPrimary: "#22C55E",
    brandSecondary: "#A3E635",
    description: "Lifestyle & Community Partner - Active lifestyle experiences"
  },
  {
    name: "Fresko",
    logoAssetKey: "fresko",
    brandPrimary: "#FB7185",
    brandSecondary: "#F97316",
    description: "Nutrition Partner - Fresh and healthy meal solutions"
  },
];

// ============================================
// REWARD CAMPAIGN TEMPLATES
// ============================================

const CAMPAIGN_TEMPLATES = {
  notch: [
    {
      title: "Match Winner Bonus",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Exclusive gear discount unlocks when FCRB wins",
      rulesJson: { trigger: "WIN_BONUS", multiplier: 1.5 },
      priority: 3
    },
    {
      title: "Training Week Special",
      type: "STATIC" as RewardCampaignType,
      copy: "Premium training essentials at member prices",
      rulesJson: { tag: "TRAINING_BOOST" },
      priority: 1
    },
    {
      title: "Weekend Warrior Pack",
      type: "STATIC" as RewardCampaignType,
      copy: "Complete gear bundles for weekend athletes",
      rulesJson: { tag: "WEEKEND_SPECIAL" },
      priority: 2
    },
    {
      title: "Goal Celebration Drop",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Limited perks drop after every FCRB goal",
      rulesJson: { trigger: "GOAL_SCORED", limit: 100 },
      priority: 3
    },
    {
      title: "Season Opener Kickoff",
      type: "STATIC" as RewardCampaignType,
      copy: "New season, new gear - exclusive launch discounts",
      rulesJson: { tag: "SEASON_SPECIAL" },
      priority: 2
    },
  ],
  sparsh: [
    {
      title: "Recovery Week Program",
      type: "STATIC" as RewardCampaignType,
      copy: "Comprehensive sports injury assessment and recovery",
      rulesJson: { tag: "RECOVERY_PROGRAM" },
      priority: 1
    },
    {
      title: "Pre-Season Health Check",
      type: "STATIC" as RewardCampaignType,
      copy: "Complete medical screening for athletes",
      rulesJson: { tag: "HEALTH_SCREENING" },
      priority: 2
    },
    {
      title: "Injury Prevention Package",
      type: "STATIC" as RewardCampaignType,
      copy: "Physiotherapy sessions and injury prevention consultation",
      rulesJson: { tag: "INJURY_PREVENTION" },
      priority: 1
    },
    {
      title: "Matchday Physio Support",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Free consultation during matchday emergencies",
      rulesJson: { trigger: "MATCHDAY", availability: "LIMITED" },
      priority: 3
    },
    {
      title: "Nutrition & Wellness Consult",
      type: "STATIC" as RewardCampaignType,
      copy: "Sports nutrition and lifestyle health planning",
      rulesJson: { tag: "WELLNESS_PACKAGE" },
      priority: 2
    },
  ],
  decathlon: [
    {
      title: "Fan Club Gear Up",
      type: "STATIC" as RewardCampaignType,
      copy: "Essential football gear at exclusive member prices",
      rulesJson: { tag: "FAN_CLUB_SPECIAL" },
      priority: 1
    },
    {
      title: "Matchday Kit Deal",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Special discount on match days for supporters",
      rulesJson: { trigger: "MATCHDAY_SPECIAL" },
      priority: 2
    },
    {
      title: "Boot Camp Collection",
      type: "STATIC" as RewardCampaignType,
      copy: "Premium football boots with extended warranty",
      rulesJson: { tag: "BOOT_SPECIAL" },
      priority: 2
    },
    {
      title: "Training Essentials Bundle",
      type: "STATIC" as RewardCampaignType,
      copy: "Complete training kit package at bundle price",
      rulesJson: { tag: "TRAINING_BUNDLE" },
      priority: 1
    },
    {
      title: "Win Streak Rewards",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Discounts increase with each consecutive FCRB win",
      rulesJson: { trigger: "WIN_STREAK", scaling: true },
      priority: 3
    },
  ],
  aces: [
    {
      title: "Elite Performance Pack",
      type: "STATIC" as RewardCampaignType,
      copy: "Advanced training programs and performance analytics",
      rulesJson: { tag: "PERFORMANCE_PACK" },
      priority: 2
    },
    {
      title: "Match Prep Session",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Pre-match training session access on game weeks",
      rulesJson: { trigger: "MATCHDAY_PREP" },
      priority: 3
    },
    {
      title: "Skills Development Course",
      type: "STATIC" as RewardCampaignType,
      copy: "Monthly skills clinic with certified coaches",
      rulesJson: { tag: "SKILLS_CLINIC" },
      priority: 1
    },
    {
      title: "Tournament Entry Pass",
      type: "STATIC" as RewardCampaignType,
      copy: "Complimentary entry to fan tournaments",
      rulesJson: { tag: "TOURNAMENT_PASS" },
      priority: 2
    },
    {
      title: "Victory Celebration Access",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Special training session after major wins",
      rulesJson: { trigger: "BIG_WIN", threshold: 3 },
      priority: 3
    },
  ],
  hyve: [
    {
      title: "Community Experience Pass",
      type: "STATIC" as RewardCampaignType,
      copy: "Access to exclusive club social events",
      rulesJson: { tag: "COMMUNITY_PASS" },
      priority: 1
    },
    {
      title: "Lifestyle Upgrade Package",
      type: "STATIC" as RewardCampaignType,
      copy: "Premium membership to lifestyle facilities",
      rulesJson: { tag: "LIFESTYLE_UPGRADE" },
      priority: 2
    },
    {
      title: "Matchday Hospitality",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Enhanced matchday experience with hospitality perks",
      rulesJson: { trigger: "MATCHDAY_HOSPITALITY" },
      priority: 3
    },
    {
      title: "Fan Meetup Credits",
      type: "STATIC" as RewardCampaignType,
      copy: "Credits for official fan club meetups and events",
      rulesJson: { tag: "MEETUP_CREDITS" },
      priority: 1
    },
    {
      title: "Season Milestone Rewards",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Unlocks at key season milestones and achievements",
      rulesJson: { trigger: "SEASON_MILESTONE" },
      priority: 2
    },
  ],
  fresko: [
    {
      title: "Matchday Meal Deal",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Special meals on match days for fans",
      rulesJson: { trigger: "MATCHDAY_MEAL" },
      priority: 2
    },
    {
      title: "Nutrition Plan Starter",
      type: "STATIC" as RewardCampaignType,
      copy: "Customized meal plans for active lifestyles",
      rulesJson: { tag: "NUTRITION_PLAN" },
      priority: 1
    },
    {
      title: "Post-Match Celebration Bowl",
      type: "DYNAMIC_ROLLING" as RewardCampaignType,
      copy: "Complimentary meal after FCRB victories",
      rulesJson: { trigger: "POST_MATCH_WIN" },
      priority: 3
    },
    {
      title: "Healthy Habits Subscription",
      type: "STATIC" as RewardCampaignType,
      copy: "Monthly meal subscription with fan club discount",
      rulesJson: { tag: "SUBSCRIPTION_DEAL" },
      priority: 1
    },
    {
      title: "Training Day Fuel Pack",
      type: "STATIC" as RewardCampaignType,
      copy: "Pre and post-workout meal combos",
      rulesJson: { tag: "TRAINING_FUEL" },
      priority: 2
    },
  ],
};

// ============================================
// COUPON POOL TEMPLATES
// ============================================

interface CouponTemplate {
  name: string;
  codeType: CouponCodeType;
  discountType: CouponDiscountType;
  discountValue: number;
  conditionsText: string;
  tierEligibility: string[]; // Tier names
  maxRedemptions?: number;
  validityDays: number;
}

const COUPON_TEMPLATES: Record<string, CouponTemplate[]> = {
  notch: [
    {
      name: "Premium Gear Discount",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 20,
      conditionsText: "Valid on purchases above ₹3,999 • Excludes sale items",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 100,
      validityDays: 45
    },
    {
      name: "Training Essentials Flat Off",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 500,
      conditionsText: "Min spend ₹2,499 • One use per member",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 300,
      validityDays: 30
    },
    {
      name: "Free Shipping All Orders",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "No minimum order • Valid on notch.com",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 500,
      validityDays: 60
    },
    {
      name: "VIP Gear Bundle",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 30,
      conditionsText: "Valid on premium collections • Min spend ₹7,999",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 50,
      validityDays: 30
    },
    {
      name: "Apparel Refresh Deal",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 300,
      conditionsText: "Min spend ₹1,999 • Valid on training wear",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 200,
      validityDays: 45
    },
    {
      name: "Birthday Month Special",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 25,
      conditionsText: "Valid during your birthday month • One-time use",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 150,
      validityDays: 90
    },
    {
      name: "Accessories Bundle Bonus",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 200,
      conditionsText: "Buy 3 accessories, get ₹200 off",
      tierEligibility: ["Matchday Regular", "Rookie Fan"],
      maxRedemptions: 250,
      validityDays: 30
    },
    {
      name: "Free Water Bottle with Purchase",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Min spend ₹1,499 • While stocks last",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 400,
      validityDays: 45
    },
  ],
  sparsh: [
    {
      name: "Free Basic Health Screening",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Appointment required • Valid Mon-Fri 9am-5pm",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 200,
      validityDays: 60
    },
    {
      name: "Physiotherapy Package Discount",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 30,
      conditionsText: "Valid on packages of 5+ sessions • Sports physio only",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 80,
      validityDays: 90
    },
    {
      name: "Diagnostics Flat Discount",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 750,
      conditionsText: "Min bill ₹2,000 • Valid on pathology tests",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 100,
      validityDays: 60
    },
    {
      name: "Sports Medicine Consultation",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 40,
      conditionsText: "Valid for first consultation • Sports medicine specialists",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 60,
      validityDays: 45
    },
    {
      name: "Wellness Package Deal",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 1000,
      conditionsText: "Comprehensive wellness check • Min package ₹5,000",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 50,
      validityDays: 90
    },
    {
      name: "Emergency Consultation Waiver",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Sports injury emergencies • Subject to availability",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 150,
      validityDays: 120
    },
    {
      name: "Nutrition Counseling Session",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 50,
      conditionsText: "First session with certified nutritionist",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 100,
      validityDays: 60
    },
    {
      name: "Recovery Treatment Combo",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 500,
      conditionsText: "Ice bath + massage therapy • Athlete recovery only",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 120,
      validityDays: 45
    },
  ],
  decathlon: [
    {
      name: "Football Gear Discount",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 15,
      conditionsText: "Valid on all football equipment • No minimum purchase",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 400,
      validityDays: 30
    },
    {
      name: "Boots Special Offer",
      codeType: "SINGLE_USE",
      discountType: "FLAT",
      discountValue: 1000,
      conditionsText: "Min purchase ₹5,999 • Premium boots only",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 100,
      validityDays: 45
    },
    {
      name: "Free Training Ball",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "With purchase above ₹2,999 • While stocks last",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 200,
      validityDays: 30
    },
    {
      name: "Complete Kit Bundle",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 25,
      conditionsText: "Buy jersey, shorts, socks together • All sizes",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 150,
      validityDays: 60
    },
    {
      name: "Accessories Combo Deal",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 300,
      conditionsText: "Min 3 accessories • Shinguards, socks, bags, etc",
      tierEligibility: ["Matchday Regular", "Rookie Fan"],
      maxRedemptions: 250,
      validityDays: 45
    },
    {
      name: "Store Credit Bonus",
      codeType: "SINGLE_USE",
      discountType: "FLAT",
      discountValue: 500,
      conditionsText: "Min spend ₹4,999 • Valid next purchase within 30 days",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 80,
      validityDays: 30
    },
    {
      name: "Training Equipment Package",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 20,
      conditionsText: "Cones, markers, training aids • No maximum discount",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 180,
      validityDays: 60
    },
    {
      name: "Free Dri-FIT Jersey",
      codeType: "SINGLE_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "With purchase above ₹6,999 • FCRB edition",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 60,
      validityDays: 45
    },
  ],
  aces: [
    {
      name: "Training Session Pass",
      codeType: "SINGLE_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "One free training session • Book in advance",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 100,
      validityDays: 60
    },
    {
      name: "Performance Package Discount",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 35,
      conditionsText: "Valid on monthly performance programs",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 50,
      validityDays: 90
    },
    {
      name: "Skills Clinic Registration",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 800,
      conditionsText: "Monthly skills development clinics • All ages",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 120,
      validityDays: 45
    },
    {
      name: "Tournament Entry Waiver",
      codeType: "SINGLE_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Free entry to quarterly fan tournaments",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 200,
      validityDays: 120
    },
    {
      name: "Video Analysis Session",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 50,
      conditionsText: "Professional video analysis of your game",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 40,
      validityDays: 60
    },
    {
      name: "Group Training Discount",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 600,
      conditionsText: "Book 4+ group sessions • Min 3 participants",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 80,
      validityDays: 60
    },
    {
      name: "Fitness Assessment Package",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 40,
      conditionsText: "Complete fitness assessment and report",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 90,
      validityDays: 45
    },
    {
      name: "Free Guest Pass",
      codeType: "SINGLE_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Bring a friend to any training session",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 150,
      validityDays: 90
    },
  ],
  hyve: [
    {
      name: "Community Event Access",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Free entry to monthly fan meetups • RSVP required",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 300,
      validityDays: 90
    },
    {
      name: "Lifestyle Membership Upgrade",
      codeType: "SINGLE_USE",
      discountType: "PERCENT",
      discountValue: 40,
      conditionsText: "Upgrade to premium membership • Annual plans",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 60,
      validityDays: 60
    },
    {
      name: "Matchday Hospitality Package",
      codeType: "SINGLE_USE",
      discountType: "FLAT",
      discountValue: 1200,
      conditionsText: "Enhanced matchday experience • Subject to availability",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 40,
      validityDays: 45
    },
    {
      name: "Social Experience Credits",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 500,
      conditionsText: "Valid on social events and experiences",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 150,
      validityDays: 60
    },
    {
      name: "VIP Lounge Pass",
      codeType: "SINGLE_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "One-time access to VIP lounge • Valid matchdays",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 50,
      validityDays: 90
    },
    {
      name: "Season Ticket Discount",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 25,
      conditionsText: "Valid on full season passes • Early bird only",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 80,
      validityDays: 120
    },
    {
      name: "Exclusive Merchandise Preview",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 400,
      conditionsText: "Early access + discount on new merch launches",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 120,
      validityDays: 45
    },
    {
      name: "Free Parking Pass",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Complimentary parking on matchdays • Limited slots",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 100,
      validityDays: 120
    },
  ],
  fresko: [
    {
      name: "Matchday Meal Combo",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 25,
      conditionsText: "Valid on match days only • No minimum order",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 300,
      validityDays: 45
    },
    {
      name: "Weekly Meal Plan Discount",
      codeType: "SINGLE_USE",
      discountType: "FLAT",
      discountValue: 600,
      conditionsText: "Subscribe to weekly meal plan • Athletes edition",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 100,
      validityDays: 60
    },
    {
      name: "Free Protein Bowl",
      codeType: "MULTI_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "One free protein bowl after FCRB wins",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 200,
      validityDays: 30
    },
    {
      name: "Nutrition Subscription Deal",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 30,
      conditionsText: "Valid on monthly subscriptions • Auto-renew eligible",
      tierEligibility: ["Inner Circle"],
      maxRedemptions: 80,
      validityDays: 90
    },
    {
      name: "Post-Training Meal Voucher",
      codeType: "SINGLE_USE",
      discountType: "FLAT",
      discountValue: 250,
      conditionsText: "Valid 2 hours after training • Show session proof",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 180,
      validityDays: 45
    },
    {
      name: "Bulk Order Discount",
      codeType: "MULTI_USE",
      discountType: "PERCENT",
      discountValue: 20,
      conditionsText: "Order 5+ meals • Group orders encouraged",
      tierEligibility: ["Matchday Regular", "Rookie Fan"],
      maxRedemptions: 150,
      validityDays: 60
    },
    {
      name: "Birthday Month Special",
      codeType: "SINGLE_USE",
      discountType: "FREEBIE",
      discountValue: 0,
      conditionsText: "Free signature bowl during your birthday month",
      tierEligibility: ["Inner Circle", "Matchday Regular", "Rookie Fan"],
      maxRedemptions: 120,
      validityDays: 120
    },
    {
      name: "Healthy Habits Loyalty",
      codeType: "MULTI_USE",
      discountType: "FLAT",
      discountValue: 350,
      conditionsText: "Order 10 times, get ₹350 off 11th order",
      tierEligibility: ["Inner Circle", "Matchday Regular"],
      maxRedemptions: 100,
      validityDays: 90
    },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateCouponCode(sponsorKey: string, poolIndex: number, codeIndex: number): string {
  const prefix = sponsorKey.toUpperCase().substring(0, 5);
  const poolCode = String.fromCharCode(65 + (poolIndex % 26)); // A-Z
  const uniqueCode = String(codeIndex + 1).padStart(4, '0');
  return `${prefix}${poolCode}${uniqueCode}`;
}

function generateMultiUseCode(sponsorKey: string, poolName: string): string {
  const prefix = sponsorKey.toUpperCase();
  const suffix = poolName
    .toUpperCase()
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 4);
  return `${prefix}-${suffix}-FCRB`;
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedSponsors() {
  console.log('📢 Seeding sponsors...');
  
  const sponsors = [];
  for (const sponsorData of SPONSORS) {
    const existing = await prisma.fanSponsor.findFirst({
      where: { name: sponsorData.name }
    });
    
    if (existing) {
      console.log(`  ✓ Updating sponsor: ${sponsorData.name}`);
      const updated = await prisma.fanSponsor.update({
        where: { id: existing.id },
        data: {
          ...sponsorData,
          isActive: true,
          updatedAt: new Date()
        }
      });
      sponsors.push(updated);
    } else {
      console.log(`  ✓ Creating sponsor: ${sponsorData.name}`);
      const created = await prisma.fanSponsor.create({
        data: {
          ...sponsorData,
          isActive: true
        }
      });
      sponsors.push(created);
    }
  }
  
  console.log(`✅ Seeded ${sponsors.length} sponsors`);
  return sponsors;
}

async function seedRewardCampaigns(sponsors: any[], config: RewardConfig) {
  console.log('🎁 Seeding reward campaigns...');
  
  const tiers = await prisma.fanTier.findMany({ where: { isActive: true } });
  if (tiers.length === 0) {
    console.warn('⚠️ No fan tiers found. Please run seed-fanclub-tiers.ts first.');
    return;
  }
  
  const tierIds = tiers.map(t => t.id);
  let totalCampaigns = 0;
  
  for (const sponsor of sponsors) {
    const templates = CAMPAIGN_TEMPLATES[sponsor.logoAssetKey as keyof typeof CAMPAIGN_TEMPLATES];
    if (!templates) continue;
    
    const campaignsToCreate = templates.slice(0, config.campaignsPerSponsor);
    
    for (const template of campaignsToCreate) {
      // Check if campaign already exists
      const existing = await prisma.rewardCampaign.findFirst({
        where: {
          sponsorId: sponsor.id,
          title: `${sponsor.name} — ${template.title}`
        }
      });
      
      if (existing) {
        await prisma.rewardCampaign.update({
          where: { id: existing.id },
          data: {
            type: template.type,
            copy: template.copy,
            rulesJson: template.rulesJson,
            validFrom: new Date(),
            validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            tierEligibility: tierIds,
            isActive: true,
            priority: template.priority,
            updatedAt: new Date()
          }
        });
      } else {
        await prisma.rewardCampaign.create({
          data: {
            sponsorId: sponsor.id,
            title: `${sponsor.name} — ${template.title}`,
            type: template.type,
            copy: template.copy,
            rulesJson: template.rulesJson,
            validFrom: new Date(),
            validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            tierEligibility: tierIds,
            isActive: true,
            priority: template.priority
          }
        });
      }
      
      totalCampaigns++;
    }
    
    console.log(`  ✓ ${sponsor.name}: ${campaignsToCreate.length} campaigns`);
  }
  
  console.log(`✅ Seeded ${totalCampaigns} reward campaigns`);
}

async function seedCouponPools(sponsors: any[], config: RewardConfig) {
  console.log('🎫 Seeding coupon pools...');
  
  const tiers = await prisma.fanTier.findMany({ where: { isActive: true } });
  if (tiers.length === 0) {
    console.warn('⚠️ No fan tiers found. Please run seed-fanclub-tiers.ts first.');
    return;
  }
  
  // Create tier name to ID mapping
  const tierMap = new Map(tiers.map(t => [t.name, t.id]));
  let totalPools = 0;
  let totalCodes = 0;
  
  for (const sponsor of sponsors) {
    const templates = COUPON_TEMPLATES[sponsor.logoAssetKey as keyof typeof COUPON_TEMPLATES];
    if (!templates) continue;
    
    let poolsToCreate = templates.slice(0, config.couponPoolsPerSponsor);
    
    // Filter out freebie coupons if not included in config
    if (!config.includeFreebies) {
      poolsToCreate = poolsToCreate.filter(t => t.discountType !== 'FREEBIE');
    }
    
    for (let i = 0; i < poolsToCreate.length; i++) {
      const template = poolsToCreate[i];
      
      // Map tier names to IDs
      const eligibleTierIds = template.tierEligibility
        .map(tierName => tierMap.get(tierName))
        .filter((id): id is number => id !== undefined);
      
      if (eligibleTierIds.length === 0) {
        console.warn(`  ⚠️ No matching tiers for ${template.name}, skipping`);
        continue;
      }
      
      const expiresAt = new Date(Date.now() + template.validityDays * 24 * 60 * 60 * 1000);
      
      // Check if pool already exists
      const existing = await prisma.couponPool.findFirst({
        where: {
          sponsorId: sponsor.id,
          name: `${sponsor.name} — ${template.name}`
        }
      });
      
      if (template.codeType === 'SINGLE_USE') {
        // Single-use pool with multiple unique codes
        if (existing) {
          await prisma.couponPool.update({
            where: { id: existing.id },
            data: {
              codeType: template.codeType,
              discountType: template.discountType,
              discountValue: template.discountValue,
              conditionsText: template.conditionsText,
              tierEligibility: eligibleTierIds,
              maxRedemptions: template.maxRedemptions,
              expiresAt,
              isActive: true,
              updatedAt: new Date()
            }
          });
        } else {
          const codes = Array.from({ length: config.singleUseCodes }, (_, idx) => ({
            code: generateCouponCode(sponsor.logoAssetKey, i, idx)
          }));
          
          await prisma.couponPool.create({
            data: {
              sponsorId: sponsor.id,
              name: `${sponsor.name} — ${template.name}`,
              codeType: template.codeType,
              discountType: template.discountType,
              discountValue: template.discountValue,
              conditionsText: template.conditionsText,
              tierEligibility: eligibleTierIds,
              maxRedemptions: template.maxRedemptions,
              expiresAt,
              isActive: true,
              codes: {
                create: codes
              }
            }
          });
          
          totalCodes += codes.length;
        }
      } else {
        // Multi-use pool with single code
        const multiUseCode = generateMultiUseCode(sponsor.logoAssetKey, template.name);
        
        if (existing) {
          await prisma.couponPool.update({
            where: { id: existing.id },
            data: {
              codeType: template.codeType,
              multiUseCode,
              discountType: template.discountType,
              discountValue: template.discountValue,
              conditionsText: template.conditionsText,
              tierEligibility: eligibleTierIds,
              maxRedemptions: template.maxRedemptions,
              expiresAt,
              isActive: true,
              updatedAt: new Date()
            }
          });
        } else {
          await prisma.couponPool.create({
            data: {
              sponsorId: sponsor.id,
              name: `${sponsor.name} — ${template.name}`,
              codeType: template.codeType,
              multiUseCode,
              discountType: template.discountType,
              discountValue: template.discountValue,
              conditionsText: template.conditionsText,
              tierEligibility: eligibleTierIds,
              maxRedemptions: template.maxRedemptions,
              expiresAt,
              isActive: true
            }
          });
        }
      }
      
      totalPools++;
    }
    
    console.log(`  ✓ ${sponsor.name}: ${poolsToCreate.length} coupon pools`);
  }
  
  console.log(`✅ Seeded ${totalPools} coupon pools with ${totalCodes} unique codes`);
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  console.log('🚀 Starting rewards seed...\n');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const config: RewardConfig = { ...DEFAULT_CONFIG };
  
  for (const arg of args) {
    const [key, value] = arg.replace('--', '').split('=');
    if (key && value) {
      if (key === 'includeFreebies') {
        config[key] = value === 'true';
      } else if (key in config) {
        (config as any)[key] = parseInt(value, 10) || config[key as keyof RewardConfig];
      }
    }
  }
  
  console.log('Configuration:', config);
  console.log('');
  
  try {
    // Step 1: Seed sponsors
    const sponsors = await seedSponsors();
    
    // Step 2: Seed reward campaigns
    await seedRewardCampaigns(sponsors, config);
    
    // Step 3: Seed coupon pools
    await seedCouponPools(sponsors, config);
    
    console.log('\n✅ Rewards seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${sponsors.length} sponsors`);
    console.log(`   - Up to ${config.campaignsPerSponsor} campaigns per sponsor`);
    console.log(`   - Up to ${config.couponPoolsPerSponsor} coupon pools per sponsor`);
    console.log(`   - ${config.singleUseCodes} codes per single-use pool`);
    console.log(`   - Freebies ${config.includeFreebies ? 'included' : 'excluded'}`);
  } catch (error) {
    console.error('❌ Error seeding rewards:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// RUN
// ============================================

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });


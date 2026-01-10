export type IncentiveTag = "WIN_BONUS" | "MATCHDAY_SPECIAL" | "TRAINING_BOOST";

export type SponsorBenefit = {
  id: string;
  name: string;
  roleLabel: string;
  themeLabel: string;
  logoSrc: string;
  websiteUrl: string; // Sponsor website URL
  accent: string;
  accent2: string;
  glow: string;
  rewards: string[]; // exact copy lines
  incentiveTag: IncentiveTag;
  incentiveCopy: string; // exact copy line (primary)
  secondaryIncentiveCopy?: string; // optional secondary line (no extra tag shown)
};

export type FanClubTier = {
  id: "rookie" | "regular" | "inner";
  name: string;
  priceLabel: string;
  priceValue: number;
  highlight?: boolean;
  ctaLabel: string;
  benefits: string[];
};

export const SPONSOR_BENEFITS: SponsorBenefit[] = [
  {
    id: "notch",
    name: "Notch",
    roleLabel: "Performance Partner",
    themeLabel: "Mindset • Focus • Recovery",
    logoSrc: "/assets/notch.png",
    websiteUrl: "https://notchmerch.com",
    accent: "#7C3AED",
    accent2: "#22D3EE",
    glow: "rgba(124,58,237,0.35)",
    rewards: [
      "Flat 10% off on sports recovery & performance tools",
      "Exclusive Fan Club starter discount on Notch products",
      "Bonus gift on performance kits (members only)",
    ],
    incentiveTag: "WIN_BONUS",
    incentiveCopy: "Extra 10% off if FCRB wins this week",
    secondaryIncentiveCopy: "Back-to-academy performance offer",
  },
  {
    id: "sparsh",
    name: "Sparsh Hospital",
    roleLabel: "Medical Partner",
    themeLabel: "Health • Care • Safety",
    logoSrc: "/assets/sparsh hospital.jpeg",
    websiteUrl: "https://www.sparshhospital.com",
    accent: "#E4002B", // Sparsh Hospital red
    accent2: "#0A3D91", // Sparsh Hospital blue
    glow: "rgba(228,0,43,0.35)",
    rewards: [
      "Free basic sports injury consultation",
      "Discounted health screening for players & parents",
      "Priority appointment access for Fan Club members",
    ],
    incentiveTag: "MATCHDAY_SPECIAL",
    incentiveCopy: "Free consultation on home matchdays",
    secondaryIncentiveCopy: "Pre-season health check offers",
  },
  {
    id: "decathlon",
    name: "Decathlon",
    roleLabel: "Equipment Partner",
    themeLabel: "Gear • Access • Everyday Sport",
    logoSrc: "/assets/decathlon.png",
    websiteUrl: "https://www.decathlon.in",
    accent: "#2563EB", // Decathlon blue
    accent2: "#0EA5E9",
    glow: "rgba(37,99,235,0.35)",
    rewards: [
      "₹500 off on sports gear (minimum spend applicable)",
      "Early access to football equipment drops",
      "Members-only bundle offers",
    ],
    incentiveTag: "WIN_BONUS",
    incentiveCopy: "Extra 10% off after a match win",
    secondaryIncentiveCopy: "Back-to-academy season discount",
  },
  {
    id: "aces",
    name: "Aces",
    roleLabel: "Training & Performance Partner",
    themeLabel: "Skill • Development • Competitive Edge",
    logoSrc: "/assets/aces.png",
    websiteUrl: "https://acespl.in",
    accent: "#2563EB", // Aces blue
    accent2: "#2A996B", // Aces green
    glow: "rgba(37,99,235,0.35)",
    rewards: [
      "Discount on private training sessions",
      "Access to curated performance workshops",
      "Exclusive invites to training clinics",
    ],
    incentiveTag: "TRAINING_BOOST",
    incentiveCopy: "Pre-season training perks",
    secondaryIncentiveCopy: "Free workshop access on winning streaks",
  },
  {
    id: "hyve",
    name: "Hyve",
    roleLabel: "Lifestyle & Community Partner",
    themeLabel: "Community • Lifestyle • Events",
    logoSrc: "/assets/hyvesports_logo.jpeg",
    websiteUrl: "https://hyvesports.com",
    accent: "#FFD700", // Hyve yellow
    accent2: "#000000", // Hyve black
    glow: "rgba(255,215,0,0.35)",
    rewards: [
      "Special pricing on community events",
      "Priority access to networking & club meet-ups",
      "Lifestyle partner discounts",
    ],
    incentiveTag: "MATCHDAY_SPECIAL",
    incentiveCopy: "Fan meet-up offers on matchdays",
  },
  {
    id: "beyondburg",
    name: "BeyondBurg",
    roleLabel: "Lifestyle & Dining Partner",
    themeLabel: "Food • Community • Matchday Experience",
    logoSrc: "/assets/beyonndburg.jpeg",
    websiteUrl: "https://beyondburginc.com",
    accent: "#FFFFFF", // BeyondBurg white
    accent2: "#000000", // BeyondBurg black
    glow: "rgba(255,255,255,0.25)",
    rewards: [
      "Matchday meal discounts for Fan Club members",
      "Exclusive dining offers on home matchdays",
      "Priority seating for club events",
    ],
    incentiveTag: "MATCHDAY_SPECIAL",
    incentiveCopy: "Matchday dining specials",
    secondaryIncentiveCopy: "Post-match celebration offers",
  },
];

export const FAN_CLUB_TIERS: FanClubTier[] = [
  {
    id: "rookie",
    name: "Rookie Fan",
    priceLabel: "₹99 / Year",
    priceValue: 99,
    ctaLabel: "Join for ₹99/year",
    benefits: [
      "Access to sponsor rewards (basic tier)",
      "Matchday special offers",
      "Fan Club digital badge",
    ],
  },
  {
    id: "regular",
    name: "Matchday Regular",
    priceLabel: "₹299 / Year",
    priceValue: 299,
    highlight: true,
    ctaLabel: "Most Popular — ₹299/year",
    benefits: [
      "Access to sponsor rewards (basic tier)",
      "Matchday special offers",
      "Fan Club digital badge",
      "All Rookie benefits",
      "Higher-value partner rewards",
      "Priority access to events & friendlies",
    ],
  },
  {
    id: "inner",
    name: "Inner Circle",
    priceLabel: "₹699 / Year",
    priceValue: 699,
    ctaLabel: "Elite Access — ₹699/year",
    benefits: [
      "Access to sponsor rewards (basic tier)",
      "Matchday special offers",
      "Fan Club digital badge",
      "All Rookie benefits",
      "Higher-value partner rewards",
      "Priority access to events & friendlies",
      "All benefits unlocked",
      "Maximum sponsor discounts",
      "Priority seating & invites (future)",
    ],
  },
];

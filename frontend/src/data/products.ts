import { shopAssets } from "../config/assets";

export type ProductCategory =
  | "MATCHDAY_KITS"
  | "TRAINING_WEAR"
  | "LIFESTYLE"
  | "ACCESSORIES"
  | "FAN_EXCLUSIVES"
  | "LIMITED_DROPS";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image: string;
  tags?: string[];
  available: boolean;
  fanTierRequired?: string;
}

const fallbackImage =
  shopAssets.jerseys?.[0] ||
  shopAssets.trainingTees?.[0] ||
  shopAssets.accessories?.[0] ||
  "";

export const products: Product[] = [
  {
    id: "matchday-home-24-25",
    name: "2024/25 Home Jersey",
    price: 249900,
    category: "MATCHDAY_KITS",
    image: shopAssets.jerseys?.[0] || fallbackImage,
    tags: ["New", "Season 24/25", "Matchday"],
    available: true,
  },
  {
    id: "matchday-away-24-25",
    name: "2024/25 Away Jersey",
    price: 239900,
    category: "MATCHDAY_KITS",
    image: shopAssets.jerseys?.[1] || fallbackImage,
    tags: ["New", "Matchday"],
    available: true,
  },
  {
    id: "matchday-short-24-25",
    name: "Home Match Shorts",
    price: 149900,
    category: "MATCHDAY_KITS",
    image: shopAssets.shorts?.[0] || fallbackImage,
    tags: ["Matchday"],
    available: true,
  },
  {
    id: "training-tee-navy",
    name: "Performance Training Tee – Navy",
    price: 129900,
    category: "TRAINING_WEAR",
    image: shopAssets.trainingTees?.[0] || fallbackImage,
    tags: ["Training", "Staff Favourite"],
    available: true,
  },
  {
    id: "training-jacket-allweather",
    name: "All-Weather Sideline Jacket",
    price: 299900,
    category: "TRAINING_WEAR",
    image: shopAssets.trainingTees?.[1] || fallbackImage,
    tags: ["Coach Issue", "Limited"],
    available: true,
  },
  {
    id: "lifestyle-hoodie-midnight",
    name: "Midnight Blue Hoodie",
    price: 189900,
    category: "LIFESTYLE",
    image: shopAssets.lifestyle?.[0] || fallbackImage,
    tags: ["Everyday Blue Army Wear"],
    available: true,
  },
  {
    id: "lifestyle-cap-classic",
    name: "Classic Crest Cap",
    price: 79900,
    category: "LIFESTYLE",
    image: shopAssets.caps?.[0] || fallbackImage,
    tags: ["Streetwear"],
    available: true,
  },
  {
    id: "accessory-duffle-travel",
    name: "Matchday Travel Duffle",
    price: 159900,
    category: "ACCESSORIES",
    image: shopAssets.bags?.[0] || fallbackImage,
    tags: ["Matchday", "Away Days"],
    available: true,
  },
  {
    id: "accessory-bottle-hydrate",
    name: "Hydrate Like The Squad Bottle",
    price: 59900,
    category: "ACCESSORIES",
    image: shopAssets.accessories?.[0] || fallbackImage,
    tags: ["Training"],
    available: true,
  },
  {
    id: "fanexclusive-scarf-inner-circle",
    name: "Inner Circle Matchday Scarf",
    price: 129900,
    category: "FAN_EXCLUSIVES",
    image: shopAssets.scarves?.[0] || fallbackImage,
    tags: ["Fan Only", "Inner Circle"],
    available: true,
    fanTierRequired: "INNER_CIRCLE",
  },
  {
    id: "fanexclusive-badge-tier",
    name: "Fan Club Tier Crest Set",
    price: 49900,
    category: "FAN_EXCLUSIVES",
    image: shopAssets.badges?.[0] || fallbackImage,
    tags: ["Fan Only"],
    available: true,
    fanTierRequired: "MATCHDAY_REGULAR",
  },
  {
    id: "drop-02-limited-kit",
    name: "Limited Drop #02 – Night Floodlights Kit",
    price: 329900,
    category: "LIMITED_DROPS",
    image: shopAssets.specialDrops?.[0] || fallbackImage,
    tags: ["Limited", "Drop"],
    available: true,
  },
  {
    id: "drop-02-prelaunch-tee",
    name: "Drop #02 Pre-Launch Tee",
    price: 99900,
    category: "LIMITED_DROPS",
    image: shopAssets.specialDrops?.[1] || fallbackImage,
    tags: ["Drop", "Coming Soon"],
    available: false,
  },
];

export const productsByCategory: Record<ProductCategory, Product[]> = {
  MATCHDAY_KITS: products.filter((p) => p.category === "MATCHDAY_KITS"),
  TRAINING_WEAR: products.filter((p) => p.category === "TRAINING_WEAR"),
  LIFESTYLE: products.filter((p) => p.category === "LIFESTYLE"),
  ACCESSORIES: products.filter((p) => p.category === "ACCESSORIES"),
  FAN_EXCLUSIVES: products.filter((p) => p.category === "FAN_EXCLUSIVES"),
  LIMITED_DROPS: products.filter((p) => p.category === "LIMITED_DROPS"),
};


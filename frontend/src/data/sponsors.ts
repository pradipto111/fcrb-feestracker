export type SponsorTheme = {
  id: string;
  name: string;
  logoSrc: string; // public path
  accent: string;
  accent2: string;
  glow: string;
  tagline: string;
};

export type SponsorOffer = {
  id: string;
  title: string;
  code: string;
  condition: string;
  memberOnlyLabel?: string;
};

export const SPONSORS: SponsorTheme[] = [
  {
    id: "notch",
    name: "Notch",
    logoSrc: "/sponsors/notch.svg",
    accent: "#7C3AED",
    accent2: "#22D3EE",
    glow: "rgba(124,58,237,0.35)",
    tagline: "Perks that sharpen your edge—members-only.",
  },
  {
    id: "sparsh",
    name: "Sparsh Hospital",
    logoSrc: "/sponsors/sparsh.svg",
    accent: "#10B981",
    accent2: "#60A5FA",
    glow: "rgba(16,185,129,0.35)",
    tagline: "Wellness perks, reserved for the Fan Club.",
  },
  {
    id: "decathlon",
    name: "Decathlon",
    logoSrc: "/sponsors/decathlon.svg",
    accent: "#2563EB",
    accent2: "#0EA5E9",
    glow: "rgba(37,99,235,0.35)",
    tagline: "Gear up with member-only codes.",
  },
  {
    id: "aces",
    name: "Aces",
    logoSrc: "/sponsors/aces.svg",
    accent: "#F59E0B",
    accent2: "#EF4444",
    glow: "rgba(245,158,11,0.35)",
    tagline: "Limited perks that drop through the season.",
  },
  {
    id: "hyve",
    name: "Hyve",
    logoSrc: "/sponsors/hyve.svg",
    accent: "#22C55E",
    accent2: "#A3E635",
    glow: "rgba(34,197,94,0.35)",
    tagline: "Unlock rewards as the club grows.",
  },
  {
    id: "fresko",
    name: "Fresko",
    logoSrc: "/sponsors/fresko.svg",
    accent: "#FB7185",
    accent2: "#F97316",
    glow: "rgba(251,113,133,0.35)",
    tagline: "Tasteful gifts—members-only access.",
  },
];

export const DUMMY_OFFERS: Record<string, SponsorOffer[]> = {
  notch: [
    { id: "notch-1", title: "₹500 off on training essentials", code: "FCRB500", condition: "Min spend ₹2,999 • Valid till 31 Jan", memberOnlyLabel: "Members-only" },
    { id: "notch-2", title: "15% off on lifestyle gear", code: "NOTCH15", condition: "Valid on select items • Valid till 28 Feb", memberOnlyLabel: "Available after joining Fan Club" },
    { id: "notch-3", title: "Free delivery on your next order", code: "REALSHIP", condition: "One-time use • Valid till 15 Mar", memberOnlyLabel: "Members-only" },
  ],
  sparsh: [
    { id: "sparsh-1", title: "Free health check-up (basic)", code: "SPARSHFC", condition: "Appointment required • Valid till 31 Mar", memberOnlyLabel: "Members-only" },
    { id: "sparsh-2", title: "₹750 off on physiotherapy sessions", code: "RECOVER750", condition: "Min 2 sessions • Valid till 30 Apr", memberOnlyLabel: "Available after joining Fan Club" },
    { id: "sparsh-3", title: "10% off on diagnostics", code: "SPARSH10", condition: "Valid weekdays • Valid till 30 Apr", memberOnlyLabel: "Members-only" },
  ],
  decathlon: [
    { id: "dec-1", title: "₹300 off on sports gear", code: "DECA300", condition: "Min spend ₹1,999 • Valid till 31 Jan", memberOnlyLabel: "Members-only" },
    { id: "dec-2", title: "20% off on football accessories", code: "BALL20", condition: "Valid on select items • Valid till 28 Feb", memberOnlyLabel: "Available after joining Fan Club" },
    { id: "dec-3", title: "₹1,000 off on boots", code: "BOOT1K", condition: "Min spend ₹6,999 • Valid till 31 Mar", memberOnlyLabel: "Members-only" },
  ],
  aces: [
    { id: "aces-1", title: "₹250 off on matchday treats", code: "ACES250", condition: "Valid in-store • Valid till 31 Jan", memberOnlyLabel: "Members-only" },
    { id: "aces-2", title: "Buy 1 Get 1 (select items)", code: "ACESB1G1", condition: "Limited quantities • Valid till 15 Feb", memberOnlyLabel: "Available after joining Fan Club" },
    { id: "aces-3", title: "10% off on your next visit", code: "ACES10", condition: "One-time use • Valid till 31 Mar", memberOnlyLabel: "Members-only" },
  ],
  hyve: [
    { id: "hyve-1", title: "₹400 off on club experiences", code: "HYVE400", condition: "Min spend ₹2,499 • Valid till 28 Feb", memberOnlyLabel: "Members-only" },
    { id: "hyve-2", title: "Free upgrade on select plans", code: "UPGRADE", condition: "Limited availability • Valid till 31 Mar", memberOnlyLabel: "Available after joining Fan Club" },
    { id: "hyve-3", title: "15% off member bundle", code: "HYVEBUNDLE", condition: "Valid till 30 Apr", memberOnlyLabel: "Members-only" },
  ],
  fresko: [
    { id: "fre-1", title: "₹200 off on food bowls", code: "FRESKO200", condition: "Min spend ₹1,199 • Valid till 31 Jan", memberOnlyLabel: "Members-only" },
    { id: "fre-2", title: "Free add-on with every bowl", code: "EXTRA", condition: "Limited stock • Valid till 28 Feb", memberOnlyLabel: "Available after joining Fan Club" },
    { id: "fre-3", title: "10% off on subscription", code: "FRESKO10", condition: "Valid 3 months • Valid till 31 Mar", memberOnlyLabel: "Members-only" },
  ],
};



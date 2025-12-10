// FC Real Bengaluru - Club Data & Placeholders
// This file contains placeholder data for the landing page

export interface Team {
  id: string;
  name: string;
  description: string;
  tagline: string;
  ageGroup?: string;
}

export interface Fixture {
  id: string;
  date: string;
  time: string;
  opponent: string;
  competition: string;
  venue: string;
  score?: string;
  status: 'upcoming' | 'completed';
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  imageUrl?: string;
  category: string;
}

// TrainingCenter interface removed - now using Centre model from API

export const clubInfo = {
  name: "FC Real Bengaluru",
  tagline: "Building Bengaluru's Next Generation of Footballers",
  description: "FC Real Bengaluru is a professional football club dedicated to developing young talent and competing at the highest levels of Indian football. Our academy provides a comprehensive pathway from grassroots to professional football.",
  philosophy: "We believe in developing not just skilled footballers, but well-rounded individuals who embody discipline, teamwork, and excellence both on and off the pitch.",
  founded: 2020,
  stats: {
    playersTrained: 500,
    centers: 3,
    teams: 8,
    yearsActive: 4,
  },
  contact: {
    email: "info@fcrealbengaluru.com",
    phone: "+91 98765 43210",
    address: "Bengaluru, Karnataka, India",
  },
  social: {
    instagram: "https://instagram.com/fcrealbengaluru",
    youtube: "https://youtube.com/@fcrealbengaluru",
    facebook: "https://facebook.com/fcrealbengaluru",
  },
};

export const teams: Team[] = [
  {
    id: "senior-men",
    name: "Senior Men's Team",
    description: "Our flagship team competing in the Super Division and other top-tier competitions.",
    tagline: "Super Division Squad",
  },
  {
    id: "women",
    name: "Women's Team",
    description: "Empowering women's football with professional training and competitive opportunities.",
    tagline: "Elite Women's Football",
  },
  {
    id: "u21",
    name: "U21 Development Squad",
    description: "Bridging the gap between youth and senior football with intensive development programs.",
    tagline: "Pathway to Professional",
    ageGroup: "U21",
  },
  {
    id: "u19",
    name: "U19 Youth Team",
    description: "Elite youth development focusing on technical mastery and tactical understanding.",
    tagline: "Elite Youth Development",
    ageGroup: "U19",
  },
  {
    id: "u17",
    name: "U17 Academy Team",
    description: "Advanced training for promising young talents with structured development pathways.",
    tagline: "Advanced Academy Program",
    ageGroup: "U17",
  },
  {
    id: "u15",
    name: "U15 Development Team",
    description: "Building technical foundations and competitive experience for young players.",
    tagline: "Foundation Building",
    ageGroup: "U15",
  },
  {
    id: "u13",
    name: "U13 Grassroots",
    description: "Introduction to structured football training with emphasis on fun and fundamentals.",
    tagline: "Grassroots Introduction",
    ageGroup: "U13",
  },
  {
    id: "grassroots",
    name: "Grassroots Programs",
    description: "Open programs for all ages focusing on basic skills, fitness, and love for the game.",
    tagline: "Open to All",
  },
];

// trainingCenters removed - now fetched dynamically from API via OurCentresSection component

export const mockFixtures: Fixture[] = [
  {
    id: "1",
    date: "2024-12-15",
    time: "18:00",
    opponent: "Bengaluru FC Reserves",
    competition: "Super Division",
    venue: "Home Stadium",
    status: "upcoming",
  },
  {
    id: "2",
    date: "2024-12-22",
    time: "16:00",
    opponent: "Mumbai City FC Academy",
    competition: "Youth League",
    venue: "Away",
    status: "upcoming",
  },
  {
    id: "3",
    date: "2024-12-08",
    time: "17:30",
    opponent: "Kerala Blasters Academy",
    competition: "Academy Cup",
    venue: "Home Stadium",
    score: "3-1",
    status: "completed",
  },
  {
    id: "4",
    date: "2024-12-01",
    time: "15:00",
    opponent: "Chennaiyin FC Academy",
    competition: "Youth League",
    venue: "Away",
    score: "2-2",
    status: "completed",
  },
];

export const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "U19 Team Wins Academy Championship",
    summary: "Our U19 squad secured a thrilling victory in the regional academy championship, showcasing exceptional teamwork and skill.",
    date: "2024-12-10",
    imageUrl: "/photo1.png",
    category: "Achievements",
  },
  {
    id: "2",
    title: "New Training Center Opens",
    summary: "We're excited to announce the opening of our new state-of-the-art training facility, expanding our capacity to develop young talent.",
    date: "2024-12-05",
    imageUrl: "/photo2.png",
    category: "News",
  },
  {
    id: "3",
    title: "Academy Trials Now Open",
    summary: "Registration is now open for our upcoming academy trials. Join us and take the first step towards your football journey.",
    date: "2024-11-28",
    imageUrl: "/photo3.png",
    category: "Academy",
  },
  {
    id: "4",
    title: "Senior Team Prepares for Super Division",
    summary: "Our senior squad is gearing up for the upcoming Super Division season with intensive pre-season training.",
    date: "2024-11-20",
    imageUrl: "/photo1.png",
    category: "Team News",
  },
];

export const academyFeatures = [
  {
    icon: "⚽",
    title: "Sessions Per Week",
    description: "Structured training sessions multiple times per week",
  },
  {
    icon: "💪",
    title: "Strength & Conditioning",
    description: "Dedicated fitness programs for athletic development",
  },
  {
    icon: "🏆",
    title: "Match Exposure",
    description: "Regular competitive matches and tournaments",
  },
  {
    icon: "📊",
    title: "Performance Tracking",
    description: "Data-driven insights into player development",
  },
];



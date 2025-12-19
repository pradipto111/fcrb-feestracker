import type { Player, Staff } from "../types/teams";
import { homepageAssets } from "../lib/assets/homepageAssets";

const DEFAULT1 = homepageAssets.teams.team1;
const DEFAULT2 = homepageAssets.teams.team2;
const DEFAULT3 = homepageAssets.teams.team3;

export const seniorTeamPlayers: Player[] = [
  { name: "Arjun Rao", number: "1", position: "GK", age: 24, nationality: "India", image: DEFAULT1, team: "Senior Men", appearances: 18, goals: 0 },
  { name: "Rahul Menon", number: "2", position: "RB", age: 23, nationality: "India", image: DEFAULT2, team: "Senior Men", appearances: 20, goals: 1 },
  { name: "Kabir Shetty", number: "4", position: "CB", age: 25, nationality: "India", image: DEFAULT1, team: "Senior Men", appearances: 22, goals: 2 },
  { name: "Imran Khan", number: "5", position: "CB", age: 26, nationality: "India", image: DEFAULT2, team: "Senior Men", appearances: 21, goals: 1 },
  { name: "Vikram Singh", number: "3", position: "LB", age: 22, nationality: "India", image: DEFAULT1, team: "Senior Men", appearances: 19, goals: 0 },
  { name: "Joel D'Souza", number: "6", position: "CM", age: 24, nationality: "India", image: DEFAULT2, team: "Senior Men", appearances: 20, goals: 3 },
  { name: "Aditya Nair", number: "8", position: "CM", age: 23, nationality: "India", image: DEFAULT1, team: "Senior Men", appearances: 18, goals: 2 },
  { name: "Luis Fernandes", number: "10", position: "AM", age: 25, nationality: "India", image: DEFAULT2, team: "Senior Men", appearances: 21, goals: 7 },
  { name: "Sahil Ahmed", number: "7", position: "RW", age: 22, nationality: "India", image: DEFAULT1, team: "Senior Men", appearances: 20, goals: 5 },
  { name: "Karthik Reddy", number: "11", position: "LW", age: 23, nationality: "India", image: DEFAULT2, team: "Senior Men", appearances: 19, goals: 4 },
  { name: "Rohan Kulkarni", number: "9", position: "ST", age: 24, nationality: "India", image: DEFAULT1, team: "Senior Men", appearances: 22, goals: 9 },
  { name: "Daniel Mathew", number: "14", position: "ST", age: 21, nationality: "India", image: DEFAULT2, team: "Senior Men", appearances: 16, goals: 6 },
];

export const womensTeamPlayers: Player[] = [
  { name: "Ananya Iyer", number: "1", position: "GK", team: "Women", age: 22, nationality: "India", image: DEFAULT3, appearances: 14, goals: 0 },
  { name: "Meera Rao", number: "2", position: "RB", team: "Women", age: 21, nationality: "India", image: DEFAULT2, appearances: 15, goals: 1 },
  { name: "Sara Fernandes", number: "4", position: "CB", team: "Women", age: 23, nationality: "India", image: DEFAULT1, appearances: 16, goals: 1 },
  { name: "Nisha Ahmed", number: "5", position: "CB", team: "Women", age: 24, nationality: "India", image: DEFAULT2, appearances: 15, goals: 0 },
  { name: "Prarthana Shetty", number: "3", position: "LB", team: "Women", age: 20, nationality: "India", image: DEFAULT1, appearances: 14, goals: 1 },
  { name: "Divya Nair", number: "6", position: "CM", team: "Women", age: 22, nationality: "India", image: DEFAULT2, appearances: 15, goals: 2 },
  { name: "Alisha Khan", number: "8", position: "CM", team: "Women", age: 21, nationality: "India", image: DEFAULT1, appearances: 14, goals: 3 },
  { name: "Riya Menon", number: "10", position: "AM", team: "Women", age: 23, nationality: "India", image: DEFAULT2, appearances: 16, goals: 6 },
  { name: "Sneha Patil", number: "7", position: "RW", team: "Women", age: 20, nationality: "India", image: DEFAULT1, appearances: 15, goals: 4 },
  { name: "Tanvi Kulkarni", number: "11", position: "LW", team: "Women", age: 21, nationality: "India", image: DEFAULT2, appearances: 15, goals: 5 },
  { name: "Zoya Shaikh", number: "9", position: "ST", team: "Women", age: 22, nationality: "India", image: DEFAULT1, appearances: 16, goals: 8 },
];

export const developmentSquads: { id: string; name: string; description: string; players: Player[] }[] = [
  {
    id: "dev-squad",
    name: "Development Squad",
    description: "Bridging the gap between academy and first team with KSFA C & D Division exposure.",
    players: [
      { name: "Armaan Gupta", number: "20", position: "GK", team: "Development Squad" },
      { name: "Yash Verma", number: "22", position: "CB", team: "Development Squad" },
      { name: "Rudra Mohan", number: "24", position: "CM", team: "Development Squad" },
      { name: "Harsh Jain", number: "28", position: "AM", team: "Development Squad" },
      { name: "Irfan Ali", number: "27", position: "ST", team: "Development Squad" },
    ],
  },
  {
    id: "reserve-squad",
    name: "Reserve Squad",
    description: "Match-ready pool supporting the senior squad across tournaments and league fixtures.",
    players: [
      { name: "Kunal Rao", number: "31", position: "GK", team: "Reserve Squad" },
      { name: "Sanjay Sharma", number: "32", position: "CB", team: "Reserve Squad" },
      { name: "Ritwik Das", number: "33", position: "FB", team: "Reserve Squad" },
      { name: "Ayaan Farooq", number: "34", position: "CM", team: "Reserve Squad" },
      { name: "Dev Mehta", number: "36", position: "ST", team: "Reserve Squad" },
    ],
  },
  {
    id: "emerging-talent",
    name: "Emerging Talent Squad",
    description: "High-potential youngsters being prepared for academy and development squads.",
    players: [
      { name: "Neel Raj", number: "40", position: "CM", team: "Emerging Talent Squad" },
      { name: "Vihan Nair", number: "41", position: "WG", team: "Emerging Talent Squad" },
      { name: "Rohit Paul", number: "42", position: "FB", team: "Emerging Talent Squad" },
      { name: "Keshav Bhat", number: "43", position: "ST", team: "Emerging Talent Squad" },
    ],
  },
];

export const academySquads: { id: string; name: string; ageGroup: string; description: string; players: Player[] }[] = [
  {
    id: "u13",
    name: "U13 Grassroots",
    ageGroup: "U13",
    description: "First touch of structured football — fun, fundamentals, and love for the game.",
    players: [
      { name: "Aarav", number: "3", position: "CB", team: "U13" },
      { name: "Ishan", number: "7", position: "WG", team: "U13" },
      { name: "Rudra", number: "9", position: "ST", team: "U13" },
    ],
  },
  {
    id: "u15",
    name: "U15 Development Team",
    ageGroup: "U15",
    description: "Technical foundations and coordinated team play with KSFA youth league exposure.",
    players: [
      { name: "Vihaan", number: "4", position: "CB", team: "U15" },
      { name: "Krish", number: "6", position: "CM", team: "U15" },
      { name: "Atharv", number: "10", position: "AM", team: "U15" },
      { name: "Devansh", number: "11", position: "WG", team: "U15" },
    ],
  },
  {
    id: "u17",
    name: "U17 Academy Team",
    ageGroup: "U17",
    description: "Advanced tactical roles, physical preparation, and regular competitive fixtures.",
    players: [
      { name: "Samar", number: "5", position: "CB", team: "U17" },
      { name: "Kabir", number: "8", position: "CM", team: "U17" },
      { name: "Hrithik", number: "7", position: "WG", team: "U17" },
      { name: "Rohan", number: "9", position: "ST", team: "U17" },
    ],
  },
  {
    id: "u19",
    name: "U19 Youth Team",
    ageGroup: "U19",
    description: "Elite youth development bridging academy football and senior pathways.",
    players: [
      { name: "Ansh", number: "4", position: "CB", team: "U19" },
      { name: "Siddharth", number: "6", position: "DM", team: "U19" },
      { name: "Manav", number: "8", position: "CM", team: "U19" },
      { name: "Aryan", number: "10", position: "AM", team: "U19" },
      { name: "Jay", number: "11", position: "ST", team: "U19" },
    ],
  },
  {
    id: "u21",
    name: "U21 Development Squad",
    ageGroup: "U21",
    description: "Bridge from youth to senior football with KSFA C & D Division competition.",
    players: [
      { name: "Nirav", number: "4", position: "CB", team: "U21" },
      { name: "Rishi", number: "6", position: "CM", team: "U21" },
      { name: "Athul", number: "7", position: "WG", team: "U21" },
      { name: "Varun", number: "9", position: "ST", team: "U21" },
    ],
  },
];

export const staffMembers: Staff[] = [
  { name: "Nitesh Sharma", role: "Head Coach — First Team", team: "Senior Men", bio: "Leads the KSFA Super Division squad and senior tactical model." },
  { name: "Rahul Desai", role: "Assistant Coach — First Team", team: "Senior Men", bio: "Supports session design, analysis, and matchday decisions." },
  { name: "Arvind Kumar", role: "Goalkeeping Coach", team: "Senior Men", bio: "Develops goalkeepers across senior and development squads." },
  { name: "Shruti Menon", role: "Team Analyst", team: "Senior Men", bio: "Breaks down matches, training clips, and opposition tendencies." },
  { name: "Dr. Karan Rao", role: "Physio & Sports Scientist", team: "Senior Men", bio: "Leads injury prevention, rehab, and load management." },
  { name: "Priya Nair", role: "Head Coach — Women", team: "Women", bio: "Oversees the KSFA Women’s B Division squad." },
  { name: "Anjali Shetty", role: "Assistant Coach — Women", team: "Women", bio: "Supports technical development and positional training." },
  { name: "Sanjay Reddy", role: "Academy Director", team: "Academy", bio: "Manages overall pathway from U13 to U21 squads." },
  { name: "Varsha Kulkarni", role: "U13-U15 Lead Coach", team: "Academy", bio: "Introduces club playing identity at grassroots level." },
  { name: "Imran Hussain", role: "U17-U19 Lead Coach", team: "Academy", bio: "Prepares players for development and senior squads." },
];



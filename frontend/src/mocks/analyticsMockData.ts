// analyticsMockData.ts

// CENTRES
export const mockCentres = [
  {
    id: "centre-3lok",
    name: "3lok Football Fitness Hub",
    shortName: "3LOK",
    city: "Bengaluru",
  },
  {
    id: "centre-depot18",
    name: "Depot18 - Sports",
    shortName: "DEPOT18",
    city: "Bengaluru",
  },
  {
    id: "centre-blitzz",
    name: "Blitzz Sports Arena",
    shortName: "BLITZZ",
    city: "Bengaluru",
  },
  {
    id: "centre-tronic",
    name: "Tronic City Turf",
    shortName: "TRONIC",
    city: "Bengaluru",
  },
];

// SQUADS / AGE GROUPS
export const mockSquads = [
  {
    id: "squad-u17",
    name: "U17 Boys",
    levelKey: "YOUTH" as const,
  },
  {
    id: "squad-u21",
    name: "U21 Boys",
    levelKey: "YOUTH" as const,
  },
  {
    id: "squad-senior-d",
    name: "Senior – D Division",
    levelKey: "D_DIV" as const,
  },
  {
    id: "squad-senior-super",
    name: "Senior – Super Division",
    levelKey: "SUPER_DIV" as const,
  },
];

// PATHWAY LEVELS
export const mockPathwayLevels = [
  {
    id: "lvl-youth",
    key: "YOUTH" as const,
    name: "Youth Leagues",
    order: 1,
    description: "Grassroots & youth league structure",
    criteria: {
      minAttendanceRate: 75,
      minTenureMonths: 3,
    },
  },
  {
    id: "lvl-d-div",
    key: "D_DIV" as const,
    name: "Karnataka D Division",
    order: 2,
    description: "Entry-level state competition",
    criteria: {
      minAttendanceRate: 80,
      minTenureMonths: 6,
      coachRecommendationRequired: true,
    },
  },
  {
    id: "lvl-c-div",
    key: "C_DIV" as const,
    name: "Karnataka C Division",
    order: 3,
    description: "Progression tier after D Division",
    criteria: {
      minAttendanceRate: 85,
      minMatches: 5,
      coachRecommendationRequired: true,
    },
  },
  {
    id: "lvl-b-div",
    key: "B_DIV" as const,
    name: "Karnataka B Division",
    order: 4,
    description: "Higher competition tier",
    criteria: {
      minAttendanceRate: 90,
      minMatches: 10,
      coachRecommendationRequired: true,
    },
  },
  {
    id: "lvl-super",
    key: "SUPER_DIV" as const,
    name: "Super Division Team",
    order: 5,
    description: "Top competitive tier at the club",
    criteria: {
      minAttendanceRate: 90,
      minMatches: 15,
      coachRecommendationRequired: true,
    },
  },
];

// PLAYERS – mix of strong/moderate/weak engagement
export const mockPlayers = [
  {
    id: "player-1",
    fullName: "Arjun Rao",
    dateOfBirth: new Date("2008-03-15"),
    centreId: "centre-3lok",
    squadId: "squad-u17",
    joinedAt: new Date("2023-07-01"),
    exitedAt: null,
    status: "ACTIVE" as const,
    pathwayLevelId: "lvl-youth",
  },
  {
    id: "player-2",
    fullName: "Karan Mehta",
    dateOfBirth: new Date("2005-11-02"),
    centreId: "centre-depot18",
    squadId: "squad-u21",
    joinedAt: new Date("2022-09-01"),
    exitedAt: null,
    status: "ACTIVE" as const,
    pathwayLevelId: "lvl-d-div",
  },
  {
    id: "player-3",
    fullName: "Rahul Sharma",
    dateOfBirth: new Date("2003-01-10"),
    centreId: "centre-blitzz",
    squadId: "squad-senior-d",
    joinedAt: new Date("2021-06-15"),
    exitedAt: null,
    status: "ACTIVE" as const,
    pathwayLevelId: "lvl-d-div",
  },
  {
    id: "player-4",
    fullName: "Ishaan Verma",
    dateOfBirth: new Date("2000-04-22"),
    centreId: "centre-tronic",
    squadId: "squad-senior-super",
    joinedAt: new Date("2020-01-01"),
    exitedAt: null,
    status: "ACTIVE" as const,
    pathwayLevelId: "lvl-super",
  },
  {
    id: "player-5",
    fullName: "Rohit Nair",
    dateOfBirth: new Date("2007-09-09"),
    centreId: "centre-3lok",
    squadId: "squad-u17",
    joinedAt: new Date("2024-01-10"),
    exitedAt: null,
    status: "ACTIVE" as const,
    pathwayLevelId: "lvl-youth",
  },
];

// COACHES (minimal for analytics)
export const mockCoaches = [
  {
    id: "coach-1",
    fullName: "Nitesh Sharma",
    centres: ["centre-3lok", "centre-depot18"],
  },
  {
    id: "coach-2",
    fullName: "Dhruv Katyal",
    centres: ["centre-blitzz", "centre-tronic"],
  },
];

// SESSIONS – spread across dates, centres, squads
export const mockSessions = [
  {
    id: "sess-1",
    date: new Date("2025-11-01"),
    centreId: "centre-3lok",
    squadId: "squad-u17",
    coachId: "coach-1",
    type: "TRAINING" as const,
  },
  {
    id: "sess-2",
    date: new Date("2025-11-03"),
    centreId: "centre-3lok",
    squadId: "squad-u17",
    coachId: "coach-1",
    type: "TRAINING" as const,
  },
  {
    id: "sess-3",
    date: new Date("2025-11-05"),
    centreId: "centre-depot18",
    squadId: "squad-u21",
    coachId: "coach-1",
    type: "TRAINING" as const,
  },
  {
    id: "sess-4",
    date: new Date("2025-11-07"),
    centreId: "centre-blitzz",
    squadId: "squad-senior-d",
    coachId: "coach-2",
    type: "TRAINING" as const,
  },
  {
    id: "sess-5",
    date: new Date("2025-11-09"),
    centreId: "centre-tronic",
    squadId: "squad-senior-super",
    coachId: "coach-2",
    type: "TRAINING" as const,
  },
  {
    id: "sess-6",
    date: new Date("2025-11-11"),
    centreId: "centre-3lok",
    squadId: "squad-u17",
    coachId: "coach-1",
    type: "TRAINING" as const,
  },
];

// ATTENDANCE – deliberately varied to test categories
export const mockAttendanceRecords = [
  // Arjun (player-1) – HIGH attendance (present in almost all U17 sessions)
  { id: "att-1", sessionId: "sess-1", playerId: "player-1", status: "PRESENT" as const, createdAt: new Date("2025-11-01") },
  { id: "att-2", sessionId: "sess-2", playerId: "player-1", status: "PRESENT" as const, createdAt: new Date("2025-11-03") },
  { id: "att-3", sessionId: "sess-6", playerId: "player-1", status: "PRESENT" as const, createdAt: new Date("2025-11-11") },

  // Rohit (player-5) – MODERATE attendance (misses some)
  { id: "att-4", sessionId: "sess-1", playerId: "player-5", status: "ABSENT" as const, createdAt: new Date("2025-11-01") },
  { id: "att-5", sessionId: "sess-2", playerId: "player-5", status: "PRESENT" as const, createdAt: new Date("2025-11-03") },
  { id: "att-6", sessionId: "sess-6", playerId: "player-5", status: "PRESENT" as const, createdAt: new Date("2025-11-11") },

  // Karan (player-2) – MOD/LOW attendance
  { id: "att-7", sessionId: "sess-3", playerId: "player-2", status: "PRESENT" as const, createdAt: new Date("2025-11-05") },
  // Misses other u21 sessions -> lower rate

  // Rahul (player-3) – LOW attendance
  { id: "att-8", sessionId: "sess-4", playerId: "player-3", status: "ABSENT" as const, createdAt: new Date("2025-11-07") },

  // Ishaan (player-4) – some presence at senior sessions
  { id: "att-9", sessionId: "sess-5", playerId: "player-4", status: "PRESENT" as const, createdAt: new Date("2025-11-09") },
];

// MATCHES
export const mockMatches = [
  {
    id: "match-1",
    date: new Date("2025-11-15"),
    competitionName: "U17 Youth League – Matchday 1",
    squadId: "squad-u17",
    centreId: "centre-3lok",
  },
  {
    id: "match-2",
    date: new Date("2025-11-22"),
    competitionName: "U17 Youth League – Matchday 2",
    squadId: "squad-u17",
    centreId: "centre-3lok",
  },
  {
    id: "match-3",
    date: new Date("2025-11-18"),
    competitionName: "Senior – D Division Opener",
    squadId: "squad-senior-d",
    centreId: "centre-blitzz",
  },
  {
    id: "match-4",
    date: new Date("2025-11-25"),
    competitionName: "Super Division Fixture 1",
    squadId: "squad-senior-super",
    centreId: "centre-tronic",
  },
];

// MATCH SELECTIONS – to test exposure logic
export const mockMatchSelections = [
  // U17 – Arjun mostly selected
  {
    id: "sel-1",
    matchId: "match-1",
    playerId: "player-1",
    status: "SELECTED" as const,
    reasonCategory: "SQUAD_ROTATION" as const,
  },
  {
    id: "sel-2",
    matchId: "match-2",
    playerId: "player-1",
    status: "SELECTED" as const,
    reasonCategory: "TACTICAL" as const,
  },
  // U17 – Rohit selected once, not selected once
  {
    id: "sel-3",
    matchId: "match-1",
    playerId: "player-5",
    status: "NOT_SELECTED" as const,
    reasonCategory: "TACTICAL" as const,
  },
  {
    id: "sel-4",
    matchId: "match-2",
    playerId: "player-5",
    status: "SELECTED" as const,
    reasonCategory: "SQUAD_ROTATION" as const,
  },
  // Senior D – Rahul not selected
  {
    id: "sel-5",
    matchId: "match-3",
    playerId: "player-3",
    status: "NOT_SELECTED" as const,
    reasonCategory: "DISCIPLINE" as const,
  },
  // Super Division – Ishaan selected
  {
    id: "sel-6",
    matchId: "match-4",
    playerId: "player-4",
    status: "SELECTED" as const,
    reasonCategory: "TACTICAL" as const,
  },
];

// WELLNESS ENTRIES – patterns for load charts
export const mockWellnessEntries = [
  // Arjun – high exertion but high energy (good load)
  {
    id: "well-1",
    playerId: "player-1",
    date: new Date("2025-11-01"),
    sessionId: "sess-1",
    exertion: 4,
    energy: "HIGH" as const,
    note: "Felt sharp",
  },
  {
    id: "well-2",
    playerId: "player-1",
    date: new Date("2025-11-03"),
    sessionId: "sess-2",
    exertion: 4,
    energy: "MEDIUM" as const,
    note: "",
  },
  {
    id: "well-3",
    playerId: "player-1",
    date: new Date("2025-11-11"),
    sessionId: "sess-6",
    exertion: 5,
    energy: "MEDIUM" as const,
    note: "Tough session",
  },

  // Rohit – moderate exertion, fluctuating energy
  {
    id: "well-4",
    playerId: "player-5",
    date: new Date("2025-11-03"),
    sessionId: "sess-2",
    exertion: 3,
    energy: "LOW" as const,
    note: "Tired after school",
  },
  {
    id: "well-5",
    playerId: "player-5",
    date: new Date("2025-11-11"),
    sessionId: "sess-6",
    exertion: 3,
    energy: "MEDIUM" as const,
    note: "",
  },

  // Karan – single entry
  {
    id: "well-6",
    playerId: "player-2",
    date: new Date("2025-11-05"),
    sessionId: "sess-3",
    exertion: 4,
    energy: "LOW" as const,
    note: "Exams + training",
  },
];

// MONTHLY FEEDBACK – to drive feedback UI & analytics
export const mockPlayerFeedback = [
  {
    id: "fb-1",
    playerId: "player-1",
    coachId: "coach-1",
    month: 10,
    year: 2025,
    strengths: [
      "Excellent training intensity",
      "Quick understanding of tactical instructions",
    ],
    improvements: [
      "Work on weak foot passing under pressure",
    ],
    focusGoal: "Maintain 85%+ attendance and improve off-the-ball movement.",
    overallNote: "On track for higher-level exposure next phase.",
    status: "PUBLISHED" as const,
    createdAt: new Date("2025-10-30"),
    updatedAt: new Date("2025-10-30"),
  },
  {
    id: "fb-2",
    playerId: "player-5",
    coachId: "coach-1",
    month: 10,
    year: 2025,
    strengths: [
      "Good energy when present in training",
    ],
    improvements: [
      "Attendance has to be more consistent.",
    ],
    focusGoal: "Reach at least 80% session attendance over the next month.",
    overallNote: "Potential is there, needs stable commitment.",
    status: "PUBLISHED" as const,
    createdAt: new Date("2025-10-28"),
    updatedAt: new Date("2025-10-28"),
  },
  {
    id: "fb-3",
    playerId: "player-3",
    coachId: "coach-2",
    month: 10,
    year: 2025,
    strengths: [
      "Strong physical profile.",
    ],
    improvements: [
      "Discipline and punctuality must improve.",
    ],
    focusGoal: "Avoid missing sessions and maintain time discipline.",
    overallNote: "Selection will depend on discipline in upcoming weeks.",
    status: "PUBLISHED" as const,
    createdAt: new Date("2025-10-25"),
    updatedAt: new Date("2025-10-25"),
  },
];


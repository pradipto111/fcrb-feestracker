import { PrismaClient, ClubEventType, ClubEventStatus } from "@prisma/client";

const prisma = new PrismaClient();

type DemoEventInput = {
  type: ClubEventType;
  title: string;
  startAt: Date;
  endAt?: Date | null;
  allDay?: boolean;
  venueName?: string | null;
  venueAddress?: string | null;
  googleMapsUrl?: string | null;
  competition?: string | null;
  opponent?: string | null;
  homeAway?: "HOME" | "AWAY" | null;
  centerId?: number | null;
  status?: ClubEventStatus;
  notes?: string | null;
};

function atLocal(hour: number, minute: number, base: Date) {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export async function seedDemoClubEvents(opts: { createdByUserId: number }) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  // Generate events for current month and next month - many more events
  const currentMonthDays = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(y, m, i + 1);
    if (day.getMonth() === m) return day;
    return null;
  }).filter(Boolean) as Date[];

  const nextMonthDays = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(y, m + 1, i + 1);
    if (day.getMonth() === m + 1) return day;
    return null;
  }).filter(Boolean) as Date[];

  const allDays = [...currentMonthDays, ...nextMonthDays];

  const demo: DemoEventInput[] = [
    // Current Month - Matches
    {
      type: ClubEventType.MATCH,
      title: "FC Real Bengaluru vs Bangalore Rangers",
      startAt: atLocal(18, 0, allDays[2]),
      venueName: "3Lok Football Fitness Hub",
      competition: "League",
      opponent: "Bangalore Rangers",
      homeAway: "HOME",
      status: ClubEventStatus.COMPLETED,
      notes: "Score: 3-1",
    },
    {
      type: ClubEventType.MATCH,
      title: "FC Real Bengaluru vs City United",
      startAt: atLocal(16, 0, allDays[8]),
      venueName: "City Stadium",
      competition: "League",
      opponent: "City United",
      homeAway: "AWAY",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.MATCH,
      title: "FC Real Bengaluru vs Southside FC",
      startAt: atLocal(19, 0, allDays[15]),
      venueName: "3Lok Football Fitness Hub",
      competition: "League",
      opponent: "Southside FC",
      homeAway: "HOME",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.MATCH,
      title: "FC Real Bengaluru vs United FC",
      startAt: atLocal(17, 30, allDays[22]),
      venueName: "United Ground",
      competition: "League",
      opponent: "United FC",
      homeAway: "AWAY",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.MATCH,
      title: "FC Real Bengaluru vs Warriors FC",
      startAt: atLocal(18, 0, allDays[28]),
      venueName: "3Lok Football Fitness Hub",
      competition: "League",
      opponent: "Warriors FC",
      homeAway: "HOME",
      status: ClubEventStatus.SCHEDULED,
    },
    // Next Month - Matches
    {
      type: ClubEventType.MATCH,
      title: "FC Real Bengaluru vs Dynamos FC",
      startAt: atLocal(16, 0, allDays[35]),
      venueName: "Dynamos Arena",
      competition: "League",
      opponent: "Dynamos FC",
      homeAway: "AWAY",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.MATCH,
      title: "FC Real Bengaluru vs Eagles FC",
      startAt: atLocal(19, 0, allDays[42]),
      venueName: "3Lok Football Fitness Hub",
      competition: "League",
      opponent: "Eagles FC",
      homeAway: "HOME",
      status: ClubEventStatus.SCHEDULED,
    },
    // Training Sessions - Current Month
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — Speed & Decision Making",
      startAt: atLocal(7, 0, allDays[0]),
      endAt: atLocal(9, 0, allDays[0]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "U19 Training — Transition Play",
      startAt: atLocal(17, 30, allDays[3]),
      endAt: atLocal(19, 0, allDays[3]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "Recovery Session — Mobility & Prehab",
      startAt: atLocal(8, 0, allDays[5]),
      endAt: atLocal(9, 0, allDays[5]),
      venueName: "Depot 18",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — Tactical Analysis",
      startAt: atLocal(7, 0, allDays[7]),
      endAt: atLocal(9, 0, allDays[7]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "U17 Training — Set Pieces",
      startAt: atLocal(17, 0, allDays[10]),
      endAt: atLocal(18, 30, allDays[10]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — Finishing",
      startAt: atLocal(7, 0, allDays[12]),
      endAt: atLocal(9, 0, allDays[12]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "U19 Training — Defensive Shape",
      startAt: atLocal(17, 30, allDays[14]),
      endAt: atLocal(19, 0, allDays[14]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — Match Prep",
      startAt: atLocal(7, 0, allDays[17]),
      endAt: atLocal(9, 0, allDays[17]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "U17 Training — Possession Play",
      startAt: atLocal(17, 0, allDays[19]),
      endAt: atLocal(18, 30, allDays[19]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — High Intensity",
      startAt: atLocal(7, 0, allDays[21]),
      endAt: atLocal(9, 0, allDays[21]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "U19 Training — Counter Attack",
      startAt: atLocal(17, 30, allDays[24]),
      endAt: atLocal(19, 0, allDays[24]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — Technical Skills",
      startAt: atLocal(7, 0, allDays[26]),
      endAt: atLocal(9, 0, allDays[26]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    // Next Month - Training
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — Strength & Conditioning",
      startAt: atLocal(7, 0, allDays[30]),
      endAt: atLocal(9, 0, allDays[30]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "U19 Training — Pressing Triggers",
      startAt: atLocal(17, 30, allDays[33]),
      endAt: atLocal(19, 0, allDays[33]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "First Team Training — Game Model",
      startAt: atLocal(7, 0, allDays[36]),
      endAt: atLocal(9, 0, allDays[36]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.TRAINING,
      title: "U17 Training — Attacking Patterns",
      startAt: atLocal(17, 0, allDays[38]),
      endAt: atLocal(18, 30, allDays[38]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.CONFIRMED,
    },
    // Trials
    {
      type: ClubEventType.TRIAL,
      title: "Open Trials — U13/U15",
      startAt: atLocal(9, 30, allDays[4]),
      endAt: atLocal(12, 0, allDays[4]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.SCHEDULED,
      notes: "Bring boots + shin guards. Registration required.",
    },
    {
      type: ClubEventType.TRIAL,
      title: "Open Trials — U17/U19",
      startAt: atLocal(9, 30, allDays[18]),
      endAt: atLocal(12, 0, allDays[18]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.SCHEDULED,
      notes: "Bring boots + shin guards. Registration required.",
    },
    {
      type: ClubEventType.TRIAL,
      title: "Open Trials — U13/U15",
      startAt: atLocal(9, 30, allDays[32]),
      endAt: atLocal(12, 0, allDays[32]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.SCHEDULED,
      notes: "Bring boots + shin guards. Registration required.",
    },
    // Seminars & Meetings
    {
      type: ClubEventType.SEMINAR,
      title: "Parents Seminar — Pathway & Expectations",
      startAt: atLocal(19, 0, allDays[6]),
      endAt: atLocal(20, 0, allDays[6]),
      venueName: "Online",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.MEETING,
      title: "Coach Meeting — Weekly Planning",
      startAt: atLocal(12, 30, allDays[9]),
      endAt: atLocal(13, 30, allDays[9]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.SEMINAR,
      title: "Nutrition Workshop — Performance Fueling",
      startAt: atLocal(19, 0, allDays[13]),
      endAt: atLocal(20, 30, allDays[13]),
      venueName: "Clubhouse",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.MEETING,
      title: "Coach Meeting — Match Analysis",
      startAt: atLocal(12, 30, allDays[16]),
      endAt: atLocal(13, 30, allDays[16]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    {
      type: ClubEventType.SEMINAR,
      title: "Sports Psychology Session",
      startAt: atLocal(19, 0, allDays[20]),
      endAt: atLocal(20, 0, allDays[20]),
      venueName: "Online",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.MEETING,
      title: "Coach Meeting — Season Review",
      startAt: atLocal(12, 30, allDays[23]),
      endAt: atLocal(13, 30, allDays[23]),
      venueName: "Depot 18",
      status: ClubEventStatus.CONFIRMED,
    },
    // Other Events
    {
      type: ClubEventType.OTHER,
      title: "Community Meetup — Fan Club",
      startAt: atLocal(18, 30, allDays[11]),
      endAt: atLocal(20, 0, allDays[11]),
      venueName: "Clubhouse",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.OTHER,
      title: "Youth Development Workshop",
      startAt: atLocal(10, 0, allDays[25]),
      endAt: atLocal(12, 0, allDays[25]),
      venueName: "3Lok Football Fitness Hub",
      status: ClubEventStatus.SCHEDULED,
    },
    {
      type: ClubEventType.OTHER,
      title: "Community Meetup — Fan Club",
      startAt: atLocal(18, 30, allDays[37]),
      endAt: atLocal(20, 0, allDays[37]),
      venueName: "Clubhouse",
      status: ClubEventStatus.SCHEDULED,
    },
  ];

  const created = [];
  for (const e of demo) {
    const upserted = await prisma.clubEvent.upsert({
      where: { title_startAt: { title: e.title, startAt: e.startAt } },
      update: {
        type: e.type,
        endAt: e.endAt ?? undefined,
        allDay: e.allDay ?? undefined,
        venueName: e.venueName ?? undefined,
        venueAddress: e.venueAddress ?? undefined,
        googleMapsUrl: e.googleMapsUrl ?? undefined,
        competition: e.competition ?? undefined,
        opponent: e.opponent ?? undefined,
        homeAway: (e.homeAway as any) ?? undefined,
        centerId: e.centerId ?? undefined,
        status: e.status ?? undefined,
        notes: e.notes ?? undefined,
      },
      create: {
        type: e.type,
        title: e.title,
        startAt: e.startAt,
        endAt: e.endAt ?? null,
        allDay: e.allDay ?? false,
        venueName: e.venueName ?? null,
        venueAddress: e.venueAddress ?? null,
        googleMapsUrl: e.googleMapsUrl ?? null,
        competition: e.competition ?? null,
        opponent: e.opponent ?? null,
        homeAway: (e.homeAway as any) ?? null,
        teamId: null,
        centerId: e.centerId ?? null,
        status: e.status ?? ClubEventStatus.SCHEDULED,
        notes: e.notes ?? null,
        createdByUserId: opts.createdByUserId,
      },
    });
    created.push(upserted);
  }

  return { count: created.length };
}




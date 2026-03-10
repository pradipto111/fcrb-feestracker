export interface PublicFixture {
  id: number;
  opponent: string;
  matchDate: string;
  matchTime: string;
  venue: string;
  status: "UPCOMING" | "COMPLETED" | string;
  center: string;
  score: string | null;
}

interface FixturesPayload {
  upcoming: PublicFixture[];
  results: PublicFixture[];
}

const fallback: FixturesPayload = { upcoming: [], results: [] };

export async function getPublicFixtures(): Promise<FixturesPayload> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return fallback;

  try {
    const res = await fetch(`${apiBase}/fixtures/public`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as FixturesPayload;
  } catch {
    return fallback;
  }
}

export function formatDate(date: string) {
  const parsed = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

import type { Metadata } from "next";
import { formatDate, getPublicFixtures } from "@/lib/fixtures";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Fixtures",
  description: "Upcoming fixtures and recent results for FC Real Bengaluru.",
  alternates: { canonical: "/fixtures" },
};

export default async function FixturesPage() {
  const data = await getPublicFixtures();

  return (
    <div className="page-wrap shell section-stack">
      <section className="section">
        <p className="eyebrow">Fixtures</p>
        <h1>Upcoming Matches and Results</h1>
      </section>

      <section className="section">
        <h2>Upcoming</h2>
        <div className="fixture-grid">
          {data.upcoming.length ? (
            data.upcoming.map((fixture) => (
              <article key={fixture.id} className="fixture-card">
                <p className="fixture-meta">{formatDate(fixture.matchDate)}</p>
                <h3>FC Real Bengaluru vs {fixture.opponent}</h3>
                <p>{fixture.venue}</p>
                <p>{fixture.matchTime}</p>
              </article>
            ))
          ) : (
            <p>No upcoming fixtures available right now.</p>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Recent Results</h2>
        <div className="fixture-grid">
          {data.results.length ? (
            data.results.map((fixture) => (
              <article key={fixture.id} className="fixture-card">
                <p className="fixture-meta">{formatDate(fixture.matchDate)}</p>
                <h3>FC Real Bengaluru vs {fixture.opponent}</h3>
                <p>{fixture.venue}</p>
                <p>{fixture.score ? `Score: ${fixture.score}` : "Score pending"}</p>
              </article>
            ))
          ) : (
            <p>No recent results available right now.</p>
          )}
        </div>
      </section>
    </div>
  );
}

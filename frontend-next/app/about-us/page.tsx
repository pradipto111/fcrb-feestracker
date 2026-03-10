import type { Metadata } from "next";
import { aboutContent } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About Us",
  description: "Club history, mission, vision and Blue Army supporter ecosystem.",
  alternates: { canonical: "/about-us" },
};

export default function AboutUsPage() {
  return (
    <div className="page-wrap shell section-stack">
      <section className="section">
        <p className="eyebrow">About FC Real Bengaluru</p>
        <h1>Club Story</h1>
        <p>{aboutContent.intro}</p>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <h2>Mission</h2>
          <p>{aboutContent.mission}</p>
        </article>
        <article className="info-card">
          <h2>Vision</h2>
          <p>{aboutContent.vision}</p>
        </article>
      </section>

      <section className="section">
        <h2>Leadership Focus</h2>
        <ul className="highlight-list">
          {aboutContent.leadershipPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Blue Army</h2>
        <p>{aboutContent.blueArmy}</p>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { academyContent } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Academy",
  description: "Youth, junior, professional and women performance pathways.",
  alternates: { canonical: "/academy" },
};

export default function AcademyPage() {
  return (
    <div className="page-wrap shell section-stack">
      <section className="section">
        <p className="eyebrow">Academy Pathways</p>
        <h1>Train. Compete. Progress.</h1>
        <p>{academyContent.intro}</p>
      </section>

      <section className="info-grid">
        {academyContent.programs.map((program) => (
          <article key={program.name} className="info-card">
            <h2>{program.name}</h2>
            <p>{program.description}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <h2>Training Facilities</h2>
        <Image
          src={academyContent.facilitiesImage}
          alt="FC Real Bengaluru academy training"
          width={1024}
          height={683}
          sizes="(max-width: 768px) 100vw, 900px"
          loading="lazy"
        />
      </section>
    </div>
  );
}

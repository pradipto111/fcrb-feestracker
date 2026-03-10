import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact FC Real Bengaluru for academy and club information.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="page-wrap shell section-stack">
      <section className="section">
        <p className="eyebrow">Contact</p>
        <h1>Get in touch</h1>
        <p>
          For academy admissions, trials, and partnership opportunities, contact the club team.
        </p>
      </section>
      <section className="info-grid">
        <article className="info-card">
          <h2>Email</h2>
          <p>hello@realbengaluru.com</p>
        </article>
        <article className="info-card">
          <h2>City</h2>
          <p>Bengaluru, Karnataka, India</p>
        </article>
      </section>
    </div>
  );
}

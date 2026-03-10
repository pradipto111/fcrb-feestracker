import Image from "next/image";
import Link from "next/link";
import { VideoFacade } from "@/components/VideoFacade";
import { homepageContent, mediaUrls } from "@/lib/site-data";

export default function HomePage() {
  return (
    <div className="page-wrap">
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">FC Real Bengaluru</p>
          <h1>{homepageContent.hero.title}</h1>
          <p>{homepageContent.hero.subtitle}</p>
          <div className="button-row">
            <Link href="/academy" className="button-primary">
              Explore Academy
            </Link>
            <Link href="/fixtures" className="button-secondary">
              Match Fixtures
            </Link>
          </div>
        </div>
        <Image
          src={homepageContent.hero.image}
          alt="FC Real Bengaluru team"
          width={1600}
          height={1067}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px"
          priority
        />
      </section>

      <section className="shell section">
        <h2>Club Highlights</h2>
        <ul className="highlight-list">
          {homepageContent.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="shell section gallery-grid">
        {homepageContent.gallery.map((url) => (
          <Image
            key={url}
            src={url}
            alt="FC Real Bengaluru training and match visuals"
            width={1024}
            height={683}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ))}
      </section>

      <section className="shell section cta-card">
        <div>
          <h2>{homepageContent.cta.title}</h2>
          <p>{homepageContent.cta.description}</p>
          <Link href="/contact" className="button-primary">
            Contact Club
          </Link>
        </div>
        <Image
          src={homepageContent.cta.image}
          alt="FC Real Bengaluru call to action visual"
          width={768}
          height={582}
          sizes="(max-width: 768px) 100vw, 420px"
          loading="lazy"
        />
      </section>

      <section className="shell section">
        <h2>Matchday Video</h2>
        <VideoFacade
          title="FC Real Bengaluru Highlights"
          youtubeUrl={mediaUrls.youtubeMatchday}
          thumbnailUrl={mediaUrls.youtubeThumb}
        />
      </section>
    </div>
  );
}

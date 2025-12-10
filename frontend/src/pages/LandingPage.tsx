import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import OurCentresSection from "../components/OurCentresSection";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  clubInfo,
  teams,
  mockFixtures,
  mockNews,
  academyFeatures,
  Fixture,
  NewsItem,
} from "../data/club";

const LandingPage: React.FC = () => {
  const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
  const [recentResults, setRecentResults] = useState<Fixture[]>([]);

  const heroCopyOptions = [
    {
      headline: "Bengaluru’s next wave of footballers starts here.",
      subhead:
        "A professional club and academy built to take local talent from first touch to fierce competition.",
    },
    {
      headline: "Train in Bengaluru. Compete everywhere.",
      subhead:
        "FC Real Bengaluru gives every committed player a clear pathway from academy sessions to senior football.",
    },
    {
      headline: "Serious football. Clear pathways. Real Bengaluru.",
      subhead:
        "Structured training, honest feedback, and competitive minutes for players who want to grow the right way.",
    },
  ];

  useEffect(() => {
    // Separate fixtures into upcoming and completed
    const upcoming = mockFixtures.filter((f) => f.status === "upcoming");
    const completed = mockFixtures.filter((f) => f.status === "completed");
    setUpcomingFixtures(upcoming);
    setRecentResults(completed);
  }, []);

  // Handle scroll to section when navigating from other pages
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #050B20 0%, #0A1633 30%, #101C3A 60%, #050B20 100%)`,
        color: colors.text.primary,
      }}
    >
      <PublicHeader />

      {/* Hero Section */}
      <section
        id="hero"
        style={{
          position: "relative",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "80px",
          overflow: "hidden",
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url(/photo1.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
            filter: "brightness(0.4) contrast(1.2)",
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, rgba(4, 61, 208, 0.4) 0%, rgba(255, 169, 0, 0.3) 100%)`,
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1200px",
            width: "100%",
            padding: spacing.xl,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              ...typography.display,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: spacing.lg,
              color: colors.text.primary,
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              lineHeight: 1.2,
            }}
          >
            {heroCopyOptions[0].headline}
          </h1>
          <p
            style={{
              ...typography.h4,
              fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
              marginBottom: spacing["2xl"],
              color: colors.text.secondary,
              maxWidth: "800px",
              margin: `0 auto ${spacing["2xl"]}`,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            {heroCopyOptions[0].subhead}
          </p>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: spacing.lg,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/realverse/join" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="lg">
                Join RealVerse Academy
              </Button>
            </Link>
            <a href="#academy" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="lg">
                Explore Academy
              </Button>
            </a>
          </div>

          {/* Brochure CTA Section */}
          <div
            style={{
              marginTop: spacing["3xl"],
              padding: spacing["2xl"],
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: borderRadius.xl,
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              maxWidth: "800px",
              margin: `${spacing["3xl"]} auto 0`,
            }}
          >
            <h3
              style={{
                ...typography.h3,
                textAlign: "center",
                marginBottom: spacing.md,
                color: colors.text.primary,
              }}
            >
              Get to Know FC Real Bengaluru
            </h3>
            <p
              style={{
                ...typography.body,
                textAlign: "center",
                color: colors.text.secondary,
                marginBottom: spacing.lg,
                fontSize: typography.fontSize.base,
              }}
            >
              Our philosophy, methods, pathway, and people — all in one place.
            </p>
            <div
              style={{
                display: "flex",
                gap: spacing.md,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link to="/brochure" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="md">
                  View Club Brochure
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Strip */}
          <div
            style={{
              display: "flex",
              gap: spacing["2xl"],
              justifyContent: "center",
              marginTop: spacing["3xl"],
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Years Active", value: clubInfo.stats.yearsActive },
              { label: "Players Trained", value: clubInfo.stats.playersTrained },
              { label: "Training Centers", value: clubInfo.stats.centers },
              { label: "Teams", value: clubInfo.stats.teams },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  padding: spacing.lg,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: borderRadius.xl,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  minWidth: "150px",
                }}
              >
                <div
                  style={{
                    ...typography.h2,
                    fontSize: typography.fontSize["3xl"],
                    color: colors.accent.main,
                    marginBottom: spacing.xs,
                  }}
                >
                  {stat.value}+
                </div>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.text.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Club */}
      <section
        id="club"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: spacing["2xl"],
            alignItems: "center",
          }}
        >
          {/* Text Content */}
          <div>
            <h2
              style={{
                ...typography.h1,
                marginBottom: spacing.lg,
                color: colors.text.primary,
              }}
            >
              About FC Real Bengaluru
            </h2>
            <p
              style={{
                ...typography.body,
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                marginBottom: spacing.lg,
                lineHeight: 1.7,
              }}
            >
              FC Real Bengaluru is a professionally run club and academy built around clear, long-term player
              development. We combine daily training standards with honest feedback so every player—and parent—knows
              the path ahead.
            </p>
            <p
              style={{
                ...typography.body,
                color: colors.text.muted,
                marginBottom: spacing.xl,
                lineHeight: 1.7,
              }}
            >
              Our squads train under qualified coaches, compete across age groups, and progress through a defined
              pathway into senior football. The focus is steady growth: technical detail, tactical awareness,
              physical readiness, and the mentality to compete.
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: spacing.md,
              }}
            >
              {[
                "Structured club + academy model with squads from grassroots to senior levels",
                "Qualified coaching staff, session plans, and seasonal periodisation",
                "Regular league and tournament exposure across Bengaluru and beyond",
                "Transparent pathways into senior football with clear expectations for players and parents",
              ].map((point, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: spacing.md,
                    color: colors.text.secondary,
                  }}
                >
                  <span
                    style={{
                      color: colors.accent.main,
                      fontSize: typography.fontSize.xl,
                      marginTop: "2px",
                    }}
                  >
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image */}
          <div
            style={{
              position: "relative",
              borderRadius: borderRadius["2xl"],
              overflow: "hidden",
              boxShadow: shadows["2xl"],
            }}
          >
            <img
              src="/photo2.png"
              alt="FC Real Bengaluru Team"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: `linear-gradient(to top, rgba(5, 11, 32, 0.9) 0%, transparent 100%)`,
                padding: spacing.xl,
              }}
            >
              <div
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                }}
              >
                Building Champions Since {clubInfo.founded}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teams & Pathways */}
      <section
        id="teams"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing.xl,
              color: colors.text.primary,
            }}
          >
            Teams & Pathways
          </h2>
          <p
            style={{
              ...typography.body,
              textAlign: "center",
              color: colors.text.muted,
              marginBottom: spacing["2xl"],
              maxWidth: "700px",
              margin: `0 auto ${spacing["2xl"]}`,
            }}
          >
            From grassroots programs to senior competition, we offer structured pathways for players
            at every level.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: spacing.xl,
            }}
          >
            {teams.map((team) => (
              <Card key={team.id} variant="elevated" padding="lg">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: spacing.md,
                    height: "100%",
                  }}
                >
                  {team.ageGroup && (
                    <div
                      style={{
                        ...typography.overline,
                        color: colors.accent.main,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {team.ageGroup}
                    </div>
                  )}
                  <h3
                    style={{
                      ...typography.h3,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                    }}
                  >
                    {team.name}
                  </h3>
                  <div
                    style={{
                      ...typography.caption,
                      color: colors.accent.main,
                      marginBottom: spacing.sm,
                      fontWeight: typography.fontWeight.semibold,
                    }}
                  >
                    {team.tagline}
                  </div>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      flex: 1,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {team.description}
                  </p>
                  <a
                    href="#academy"
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      color: colors.primary.light,
                      textDecoration: "none",
                      fontWeight: typography.fontWeight.semibold,
                      marginTop: spacing.md,
                      display: "inline-block",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.primary.main;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.primary.light;
                    }}
                  >
                    Learn more →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academy & Training */}
      <section
        id="academy"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            ...typography.h1,
            textAlign: "center",
            marginBottom: spacing.xl,
            color: colors.text.primary,
          }}
        >
          Academy & Training
        </h2>
        <p
          style={{
            ...typography.body,
            textAlign: "center",
            color: colors.text.muted,
            marginBottom: spacing["2xl"],
            maxWidth: "700px",
            margin: `0 auto ${spacing["2xl"]}`,
          }}
        >
          Our academy is designed for steady, long-term growth. Sessions build from fundamentals to match realism,
          keeping players challenged without skipping steps.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: spacing.xl,
            marginBottom: spacing["2xl"],
          }}
        >
          {[
            {
              title: "Grassroots & Foundation Training",
              desc: "1–3 sessions per week focused on ball mastery, coordination, and enjoying the game the right way.",
            },
            {
              title: "Development & Performance Pathway",
              desc: "Position-specific detail, tactical habits, and physical prep that ready players for competitive squads.",
            },
            {
              title: "Competitive Exposure & Match Play",
              desc: "Planned friendlies, leagues, and tournaments so players test their training in real match scenarios.",
            },
          ].map((block, idx) => (
            <Card key={idx} variant="outlined" padding="lg">
              <h4
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                  marginBottom: spacing.sm,
                }}
              >
                {block.title}
              </h4>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.6,
                }}
              >
                {block.desc}
              </p>
            </Card>
          ))}
        </div>

        {/* Our Centres Section - Replaced old Training Centers */}
        <OurCentresSection />

        {/* Academy Features */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: spacing.lg,
          }}
        >
          {academyFeatures.map((feature, idx) => (
            <Card key={idx} variant="outlined" padding="lg">
              <div
                style={{
                  fontSize: typography.fontSize["4xl"],
                  marginBottom: spacing.md,
                }}
              >
                {feature.icon}
              </div>
              <h4
                style={{
                  ...typography.h4,
                  color: colors.text.primary,
                  marginBottom: spacing.xs,
                }}
              >
                {feature.title}
              </h4>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  fontSize: typography.fontSize.sm,
                }}
              >
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: spacing["2xl"] }}>
          <a href="#contact" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="lg">
              Explore Academy Programmes
            </Button>
          </a>
        </div>
      </section>

      {/* RealVerse Feature Highlight */}
      <section
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: spacing["2xl"],
              alignItems: "center",
            }}
          >
            {/* Content */}
            <div>
              <h2
                style={{
                  ...typography.h1,
                  marginBottom: spacing.lg,
                  color: colors.text.primary,
                }}
              >
                RealVerse: Your Digital Home at FC Real Bengaluru
              </h2>
              <p
                style={{
                  ...typography.body,
                  fontSize: typography.fontSize.lg,
                  color: colors.text.secondary,
                  marginBottom: spacing.lg,
                  lineHeight: 1.7,
                }}
              >
                RealVerse keeps players, parents, and coaches aligned. It is the single source of truth for schedules,
                attendance, communication, and progress—so development stays organised and transparent.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: `0 0 ${spacing.xl} 0`,
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                }}
              >
                {[
                  "Attendance tracking and accountability for every session",
                  "Session schedules, fixtures, and timely updates in one place",
                  "Clear fees and payments with no surprises",
                  "Central record of player milestones and communication",
                ].map((feature, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      color: colors.text.secondary,
                    }}
                  >
                    <span
                      style={{
                        color: colors.primary.light,
                        fontSize: typography.fontSize.xl,
                        marginTop: "2px",
                      }}
                    >
                      →
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/realverse" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="lg">
                  Join RealVerse
                </Button>
              </Link>
            </div>

            {/* Visual */}
            <Card variant="elevated" padding="none">
              <div
                style={{
                  padding: spacing.xl,
                  background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
                  borderRadius: borderRadius.xl,
                  minHeight: "400px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: spacing.lg,
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize["6xl"],
                    marginBottom: spacing.md,
                  }}
                >
                  📊
                </div>
                <div
                  style={{
                    ...typography.h3,
                    color: colors.text.primary,
                    textAlign: "center",
                  }}
                >
                  RealVerse Dashboard
                </div>
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    textAlign: "center",
                    maxWidth: "300px",
                  }}
                >
                  Your complete football management platform
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Fixtures & Results */}
      <section
        id="fixtures"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            ...typography.h1,
            textAlign: "center",
            marginBottom: spacing.xl,
            color: colors.text.primary,
          }}
        >
          Fixtures & Results
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: spacing["2xl"],
          }}
        >
          {/* Upcoming Fixtures */}
          <div>
            <h3
              style={{
                ...typography.h3,
                color: colors.text.primary,
                marginBottom: spacing.lg,
              }}
            >
              Upcoming Fixtures
            </h3>
            {upcomingFixtures.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {upcomingFixtures.map((fixture) => (
                  <Card key={fixture.id} variant="elevated" padding="md">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: spacing.md,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            ...typography.overline,
                            color: colors.accent.main,
                            marginBottom: spacing.xs,
                          }}
                        >
                          {formatDate(fixture.date)} • {fixture.time}
                        </div>
                        <div
                          style={{
                            ...typography.h4,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                          }}
                        >
                          vs {fixture.opponent}
                        </div>
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                          }}
                        >
                          {fixture.competition} • {fixture.venue}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="outlined" padding="lg">
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    textAlign: "center",
                  }}
                >
                  No upcoming fixtures scheduled
                </div>
              </Card>
            )}
          </div>

          {/* Recent Results */}
          <div>
            <h3
              style={{
                ...typography.h3,
                color: colors.text.primary,
                marginBottom: spacing.lg,
              }}
            >
              Recent Results
            </h3>
            {recentResults.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: spacing.md }}>
                {recentResults.map((result) => (
                  <Card key={result.id} variant="elevated" padding="md">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: spacing.md,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            ...typography.overline,
                            color: colors.text.muted,
                            marginBottom: spacing.xs,
                          }}
                        >
                          {formatDate(result.date)}
                        </div>
                        <div
                          style={{
                            ...typography.h4,
                            color: colors.text.primary,
                            marginBottom: spacing.xs,
                          }}
                        >
                          vs {result.opponent}
                        </div>
                        <div
                          style={{
                            ...typography.caption,
                            color: colors.text.muted,
                          }}
                        >
                          {result.competition} • {result.venue}
                        </div>
                      </div>
                      {result.score && (
                        <div
                          style={{
                            ...typography.h3,
                            color: colors.accent.main,
                            fontWeight: typography.fontWeight.bold,
                          }}
                        >
                          {result.score}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card variant="outlined" padding="lg">
                <div
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    textAlign: "center",
                  }}
                >
                  No recent results available
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* News / Stories */}
      <section
        id="news"
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing.xl,
              color: colors.text.primary,
            }}
          >
            Latest News & Updates
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: spacing.xl,
            }}
          >
            {mockNews.map((news) => (
              <Card key={news.id} variant="elevated" padding="none">
                {news.imageUrl && (
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      overflow: "hidden",
                      borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`,
                    }}
                  >
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div style={{ padding: spacing.lg }}>
                  <div
                    style={{
                      ...typography.overline,
                      color: colors.accent.main,
                      marginBottom: spacing.xs,
                    }}
                  >
                    {news.category} • {formatDate(news.date)}
                  </div>
                  <h3
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {news.title}
                  </h3>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.sm,
                      marginBottom: spacing.md,
                    }}
                  >
                    {news.summary}
                  </p>
                  <a
                    href="#"
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      color: colors.primary.light,
                      textDecoration: "none",
                      fontWeight: typography.fontWeight.semibold,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.primary.main;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.primary.light;
                    }}
                  >
                    Read more →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section
        style={{
          padding: `${spacing["4xl"]} ${spacing.xl}`,
          background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              ...typography.h1,
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}
          >
            Ready to start your journey with FC Real Bengaluru?
          </h2>
          <p
            style={{
              ...typography.body,
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              marginBottom: spacing["2xl"],
            }}
          >
            Join our academy, connect with RealVerse, and become part of Bengaluru's football
            future.
          </p>
          <div
            style={{
              display: "flex",
              gap: spacing.lg,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/realverse/join" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="lg">
                Join RealVerse Academy
              </Button>
            </Link>
            <a href="#academy" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="lg">
                Explore Academy
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        style={{
          padding: `${spacing["2xl"]} ${spacing.xl}`,
          background: `linear-gradient(135deg, #050B20 0%, #0A1633 100%)`,
          borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: spacing["2xl"],
              marginBottom: spacing["2xl"],
            }}
          >
            {/* Club Info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
                <img
                  src="/fcrb-logo.png"
                  alt="FC Real Bengaluru"
                  className="logo-transparent-dark"
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "contain",
                  }}
                />
                <div>
                  <div
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                    }}
                  >
                    FC Real Bengaluru
                  </div>
                </div>
              </div>
              <p
                style={{
                  ...typography.body,
                  color: colors.text.muted,
                  fontSize: typography.fontSize.sm,
                  lineHeight: 1.7,
                }}
              >
                {clubInfo.contact.address}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4
                style={{
                  ...typography.h5,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Quick Links
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.sm,
                }}
              >
                {[
                  { label: "Fixtures & Results", href: "/#fixtures" },
                  { label: "Academy", href: "/#academy" },
                  { label: "RealVerse", href: "/realverse" },
                  { label: "Contact", href: "/#contact" },
                ].map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    style={{
                      ...typography.body,
                      fontSize: typography.fontSize.sm,
                      color: colors.text.muted,
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.text.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = colors.text.muted;
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4
                style={{
                  ...typography.h5,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Contact
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.sm,
                }}
              >
                <div
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.muted,
                  }}
                >
                  {clubInfo.contact.email}
                </div>
                <div
                  style={{
                    ...typography.body,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.muted,
                  }}
                >
                  {clubInfo.contact.phone}
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4
                style={{
                  ...typography.h5,
                  color: colors.text.primary,
                  marginBottom: spacing.md,
                }}
              >
                Follow Us
              </h4>
              <div
                style={{
                  display: "flex",
                  gap: spacing.md,
                }}
              >
                {[
                  { name: "Instagram", href: clubInfo.social.instagram, icon: "📷" },
                  { name: "YouTube", href: clubInfo.social.youtube, icon: "▶️" },
                  { name: "Facebook", href: clubInfo.social.facebook, icon: "👥" },
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: borderRadius.md,
                      textDecoration: "none",
                      fontSize: typography.fontSize.lg,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div
            style={{
              paddingTop: spacing.xl,
              borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
              textAlign: "center",
            }}
          >
            <p
              style={{
                ...typography.caption,
                color: colors.text.muted,
                fontSize: typography.fontSize.xs,
              }}
            >
              © {new Date().getFullYear()} FC Real Bengaluru. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


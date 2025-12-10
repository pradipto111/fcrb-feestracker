import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PublicHeader from "../components/PublicHeader";
import OurCentresSection from "../components/OurCentresSection";
import { colors, typography, spacing, borderRadius, shadows } from "../theme/design-tokens";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { motion } from "framer-motion";

const BrochurePage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
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

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: `${spacing["4xl"]} ${isMobile ? spacing.md : spacing.xl}`,
          paddingTop: isMobile ? "100px" : "120px",
          paddingBottom: isMobile ? spacing["3xl"] : spacing["4xl"],
        }}
      >
        {/* 1. HERO / COVER SECTION */}
        <motion.section
          {...fadeInUp}
          style={{
            position: "relative",
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing["4xl"],
            borderRadius: borderRadius["2xl"],
            overflow: "hidden",
          }}
        >
          {/* Video Background */}
          <video
            src="/fcrb-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />
          
          {/* Dark Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(5, 11, 32, 0.75)",
              zIndex: 1,
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
              zIndex: 2,
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 3,
              textAlign: "center",
              padding: spacing["2xl"],
              maxWidth: "800px",
            }}
          >
            <img
              src="/fcrb-logo.png"
              alt="FC Real Bengaluru"
              className="logo-transparent-dark"
              style={{
                width: isMobile ? 80 : 120,
                height: isMobile ? 80 : 120,
                objectFit: "contain",
                marginBottom: spacing.xl,
              }}
            />
            <h1
              style={{
                ...typography.display,
                fontSize: isMobile ? "clamp(2rem, 6vw, 3rem)" : "clamp(3rem, 6vw, 4rem)",
                marginBottom: spacing.lg,
                color: colors.text.primary,
                textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
              }}
            >
              FC Real Bengaluru
            </h1>
            <p
              style={{
                ...typography.h3,
                fontSize: isMobile ? typography.fontSize.lg : typography.fontSize.xl,
                color: colors.text.secondary,
                marginBottom: spacing["2xl"],
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
              }}
            >
              A Structured Football Ecosystem Built on Merit and Transparency
            </p>
            <div
              style={{
                display: "flex",
                gap: spacing.md,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link to="/realverse/join" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="lg">
                  Join the Academy
                </Button>
              </Link>
              <Link to="/realverse/join" style={{ textDecoration: "none" }}>
                <Button variant="secondary" size="lg">
                  Book a Call / Know More
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* 2. WHO WE ARE - CARD-BASED */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: spacing["2xl"],
              alignItems: "center",
              marginBottom: spacing["2xl"],
            }}
          >
            {/* Image */}
            <div
              style={{
                borderRadius: borderRadius.xl,
                overflow: "hidden",
                boxShadow: shadows["2xl"],
              }}
            >
              <img
                src="/photo1.png"
                alt="FC Real Bengaluru Team"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>

            {/* Content Cards */}
            <div
              style={{
                display: "grid",
                gap: spacing.lg,
              }}
            >
              <h2
                style={{
                  ...typography.h1,
                  marginBottom: spacing.lg,
                  color: colors.text.primary,
                }}
              >
                Who We Are
              </h2>
              {[
                {
                  title: "Multi-Centre Bengaluru-Based Club",
                  desc: "Operating across 4 strategic locations with consistent standards",
                },
                {
                  title: "Active League Participation",
                  desc: "Competing in youth & KSFA leagues across Karnataka",
                },
                {
                  title: "Long-Term Development Model",
                  desc: "Structured pathways from grassroots to senior competition",
                },
                {
                  title: "Performance-Driven Environment",
                  desc: "Merit-based advancement with transparent expectations",
                },
              ].map((card, idx) => (
                <Card key={idx} variant="elevated" padding="md">
                  <h3
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.xs,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.secondary,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {card.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 3. COACHING PHILOSOPHY - VISUAL GRID */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
            padding: spacing["2xl"],
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: borderRadius.xl,
          }}
        >
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing["2xl"],
              color: colors.text.primary,
            }}
          >
            Coaching Philosophy
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: spacing.lg,
            }}
          >
            {[
              {
                icon: "🎯",
                title: "Understanding the Game",
                desc: "Tactical awareness and decision-making under pressure",
              },
              {
                icon: "📈",
                title: "Long-Term Growth",
                desc: "Development over short-term wins",
              },
              {
                icon: "💬",
                title: "Accountability & Feedback",
                desc: "Honest communication and clear expectations",
              },
              {
                icon: "🏆",
                title: "Competitive Excellence",
                desc: "Building winners through process and discipline",
              },
            ].map((item, idx) => (
              <Card key={idx} variant="outlined" padding="lg">
                <div
                  style={{
                    fontSize: typography.fontSize["4xl"],
                    marginBottom: spacing.md,
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    ...typography.h4,
                    color: colors.text.primary,
                    marginBottom: spacing.sm,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* 4. HOW WE TRAIN - PROCESS FLOW */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
          }}
        >
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing["2xl"],
              color: colors.text.primary,
            }}
          >
            How We Train
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: spacing.lg,
              alignItems: isMobile ? "stretch" : "flex-start",
              position: "relative",
            }}
          >
            {[
              {
                step: "1",
                title: "Technical Foundation",
                desc: "Ball mastery, passing, receiving, dribbling",
              },
              {
                step: "2",
                title: "Tactical Understanding",
                desc: "Position-specific work and match scenarios",
              },
              {
                step: "3",
                title: "Physical Conditioning",
                desc: "Age-appropriate strength, speed, agility",
              },
              {
                step: "4",
                title: "Match Exposure",
                desc: "Regular competitive matches and tournaments",
              },
              {
                step: "5",
                title: "Review & Feedback",
                desc: "Data-driven insights and improvement plans",
              },
            ].map((item, idx, array) => (
              <React.Fragment key={idx}>
                <Card
                  variant="elevated"
                  padding="lg"
                  style={{
                    flex: 1,
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: `0 auto ${spacing.md}`,
                      color: colors.text.onPrimary,
                      fontWeight: typography.fontWeight.bold,
                      fontSize: typography.fontSize.lg,
                    }}
                  >
                    {item.step}
                  </div>
                  <h3
                    style={{
                      ...typography.h4,
                      color: colors.text.primary,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      ...typography.body,
                      color: colors.text.muted,
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {item.desc}
                  </p>
                </Card>
                {!isMobile && idx < array.length - 1 && (
                  <div
                    style={{
                      flex: 0,
                      padding: spacing.md,
                      display: "flex",
                      alignItems: "center",
                      color: colors.primary.main,
                      fontSize: typography.fontSize.xl,
                    }}
                  >
                    →
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.section>

        {/* CTA Section 1 */}
        <motion.section
          {...fadeInUp}
          style={{
            textAlign: "center",
            marginBottom: spacing["4xl"],
            padding: spacing["2xl"],
            background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
            borderRadius: borderRadius.xl,
          }}
        >
          <h3
            style={{
              ...typography.h2,
              marginBottom: spacing.md,
              color: colors.text.primary,
            }}
          >
            Ready to Start Training?
          </h3>
          <Link to="/realverse/join" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="lg">
              Join RealVerse Academy
            </Button>
          </Link>
        </motion.section>

        {/* 5. DATA, FEEDBACK & MODERN PRACTICES */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: spacing["2xl"],
              alignItems: "center",
            }}
          >
            {/* Image */}
            <div
              style={{
                borderRadius: borderRadius.xl,
                overflow: "hidden",
                boxShadow: shadows["2xl"],
              }}
            >
              <img
                src="/photo2.png"
                alt="Training Session"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>

            {/* Highlight Boxes */}
            <div>
              <h2
                style={{
                  ...typography.h1,
                  marginBottom: spacing.lg,
                  color: colors.text.primary,
                }}
              >
                Data, Feedback & Modern Practices
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                }}
              >
                {[
                  {
                    title: "Data-Backed Tracking",
                    desc: "Attendance & load monitoring for accountability",
                  },
                  {
                    title: "Performance Reviews",
                    desc: "Structured assessments and progress tracking",
                  },
                  {
                    title: "Transparent Communication",
                    desc: "RealVerse platform keeps everyone aligned",
                  },
                  {
                    title: "Clear Progress Visibility",
                    desc: "Players & parents see development trajectory",
                  },
                ].map((box, idx) => (
                  <Card key={idx} variant="glass" padding="md">
                    <h4
                      style={{
                        ...typography.h5,
                        color: colors.text.primary,
                        marginBottom: spacing.xs,
                      }}
                    >
                      {box.title}
                    </h4>
                    <p
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {box.desc}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 6. OUR COACHES */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
            padding: spacing["2xl"],
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: borderRadius.xl,
          }}
        >
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}
          >
            Our Coaches
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
            Qualified professionals committed to systematic player development. Our coaching system
            ensures consistency across all centres.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: spacing.lg,
            }}
          >
            {[
              {
                role: "Head Coach",
                level: "AFC Licensed",
                philosophy: "Long-term development through structured progression",
              },
              {
                role: "Development Coach",
                level: "KSFA Certified",
                philosophy: "Building technical foundations and tactical awareness",
              },
              {
                role: "Grassroots Coach",
                level: "Youth Specialist",
                philosophy: "Creating positive environments for young players",
              },
            ].map((coach, idx) => (
              <Card key={idx} variant="elevated" padding="lg">
                <h3
                  style={{
                    ...typography.h4,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {coach.role}
                </h3>
                <div
                  style={{
                    ...typography.caption,
                    color: colors.accent.main,
                    marginBottom: spacing.md,
                    fontWeight: typography.fontWeight.semibold,
                  }}
                >
                  {coach.level}
                </div>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {coach.philosophy}
                </p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* 7. MERIT-BASED PATHWAY - VISUAL PATHWAY */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
          }}
        >
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}
          >
            Merit-Based Pathway
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
            Advancement based on consistency, discipline, and performance. No fixed guarantees.
          </p>
          
          {/* Vertical Pathway */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacing.md,
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {[
              {
                level: "Super Division Team",
                desc: "Top-tier competitive football",
                color: colors.accent.main,
              },
              {
                level: "Karnataka B Division",
                desc: "Advanced competitive level",
                color: colors.primary.light,
              },
              {
                level: "Karnataka C Division",
                desc: "Intermediate competitive play",
                color: colors.primary.main,
              },
              {
                level: "Karnataka D Division",
                desc: "Entry-level competitive exposure",
                color: colors.info.main,
              },
              {
                level: "Youth Leagues",
                desc: "Foundation and development",
                color: colors.success.main,
              },
            ].map((item, idx, array) => (
              <React.Fragment key={idx}>
                <Card
                  variant="elevated"
                  padding="lg"
                  style={{
                    borderLeft: `4px solid ${item.color}`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          ...typography.h4,
                          color: colors.text.primary,
                          marginBottom: spacing.xs,
                        }}
                      >
                        {item.level}
                      </h3>
                      <p
                        style={{
                          ...typography.body,
                          color: colors.text.muted,
                          fontSize: typography.fontSize.sm,
                        }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: colors.text.onPrimary,
                        fontWeight: typography.fontWeight.bold,
                        flexShrink: 0,
                      }}
                    >
                      {array.length - idx}
                    </div>
                  </div>
                </Card>
                {idx < array.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      height: spacing.md,
                      background: `linear-gradient(to bottom, ${item.color}, ${array[idx + 1].color})`,
                      margin: `0 auto`,
                      borderRadius: borderRadius.sm,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.section>

        {/* CTA Section 2 */}
        <motion.section
          {...fadeInUp}
          style={{
            textAlign: "center",
            marginBottom: spacing["4xl"],
            padding: spacing["2xl"],
            background: `linear-gradient(135deg, ${colors.primary.main}20 0%, ${colors.accent.main}20 100%)`,
            borderRadius: borderRadius.xl,
          }}
        >
          <h3
            style={{
              ...typography.h2,
              marginBottom: spacing.md,
              color: colors.text.primary,
            }}
          >
            Ready to Begin Your Journey?
          </h3>
          <Link to="/realverse/join" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="lg">
              Apply for Trials
            </Button>
          </Link>
        </motion.section>

        {/* 8. MATCH EXPOSURE & OFF-SEASON */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: spacing["2xl"],
              alignItems: "center",
            }}
          >
            {/* Image */}
            <div
              style={{
                borderRadius: borderRadius.xl,
                overflow: "hidden",
                boxShadow: shadows["2xl"],
              }}
            >
              <img
                src="/photo3.png"
                alt="Match Play"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            </div>

            {/* Content */}
            <div>
              <h2
                style={{
                  ...typography.h1,
                  marginBottom: spacing.lg,
                  color: colors.text.primary,
                }}
              >
                Match Exposure & Off-Season Work
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: spacing.md,
                }}
              >
                {[
                  { label: "League Matches", color: colors.primary.main },
                  { label: "Friendly Fixtures", color: colors.info.main },
                  { label: "Off-Season Conditioning", color: colors.success.main },
                  { label: "Exposure Planning", color: colors.accent.main },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: spacing.md,
                      padding: spacing.md,
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: borderRadius.md,
                    }}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        ...typography.body,
                        color: colors.text.secondary,
                        fontSize: typography.fontSize.base,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 9. VALUES BEYOND FOOTBALL */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
            padding: spacing["2xl"],
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: borderRadius.xl,
          }}
        >
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing["2xl"],
              color: colors.text.primary,
            }}
          >
            Values Beyond Football
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: spacing.lg,
            }}
          >
            {[
              { value: "Discipline", impact: "Regular attendance and commitment" },
              { value: "Responsibility", impact: "Ownership of development" },
              { value: "Leadership", impact: "Leading by example" },
              { value: "Team Coordination", impact: "Collective success mindset" },
              { value: "Time Management", impact: "Balancing football and life" },
            ].map((item, idx) => (
              <Card key={idx} variant="outlined" padding="md">
                <h4
                  style={{
                    ...typography.h5,
                    color: colors.text.primary,
                    marginBottom: spacing.xs,
                  }}
                >
                  {item.value}
                </h4>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {item.impact}
                </p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* 10. SEMINARS, NETWORKING & TECH */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
          }}
        >
          <h2
            style={{
              ...typography.h1,
              textAlign: "center",
              marginBottom: spacing["2xl"],
              color: colors.text.primary,
            }}
          >
            Seminars, Networking & Tech
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: spacing.lg,
            }}
          >
            {[
              {
                title: "Player & Parent Seminars",
                desc: "Nutrition, injury prevention, academic balance",
              },
              {
                title: "Career Discussions",
                desc: "Pathways beyond football and education",
              },
              {
                title: "Networking Events",
                desc: "Connecting with football community",
              },
              {
                title: "Tech-Enabled Operations",
                desc: "RealVerse platform for transparency",
              },
            ].map((item, idx) => (
              <Card key={idx} variant="elevated" padding="lg">
                <h3
                  style={{
                    ...typography.h4,
                    color: colors.text.primary,
                    marginBottom: spacing.sm,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    ...typography.body,
                    color: colors.text.muted,
                    fontSize: typography.fontSize.sm,
                  }}
                >
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* 11. OUR CENTRES SNAPSHOT */}
        <motion.section
          {...fadeInUp}
          style={{
            marginBottom: spacing["4xl"],
          }}
        >
          <OurCentresSection />
        </motion.section>

        {/* 12. FINAL CTA - HIGH-CONVERSION CLOSE */}
        <motion.section
          {...fadeInUp}
          style={{
            textAlign: "center",
            padding: spacing["4xl"],
            marginTop: spacing["4xl"],
            background: `linear-gradient(135deg, ${colors.primary.main}30 0%, ${colors.accent.main}30 100%)`,
            borderRadius: borderRadius["2xl"],
            border: `2px solid ${colors.primary.main}40`,
          }}
        >
          <h2
            style={{
              ...typography.display,
              fontSize: isMobile ? "clamp(2rem, 6vw, 2.5rem)" : "clamp(2.5rem, 5vw, 3.5rem)",
              marginBottom: spacing.lg,
              color: colors.text.primary,
            }}
          >
            Ready to Enter a Serious Football Environment?
          </h2>
          <p
            style={{
              ...typography.body,
              fontSize: typography.fontSize.lg,
              color: colors.text.secondary,
              marginBottom: spacing["2xl"],
              maxWidth: "700px",
              margin: `0 auto ${spacing["2xl"]}`,
            }}
          >
            Join FC Real Bengaluru and become part of a professional academy committed to your
            long-term development.
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
                Join RealVerse
              </Button>
            </Link>
            <Link to="/realverse/join" style={{ textDecoration: "none" }}>
              <Button variant="secondary" size="lg">
                Apply for Trials
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>

    </div>
  );
};

export default BrochurePage;

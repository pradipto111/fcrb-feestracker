import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PublicHeader from "../components/PublicHeader";
import { SectionBackground } from "../components/shared/SectionBackground";
import { heroAssets } from "../config/assets";
import { colors, spacing, typography, borderRadius, shadows } from "../theme/design-tokens";
import { heroCTAPillStyles } from "../theme/hero-design-patterns";
import { Button } from "../components/ui/Button";
import { ArrowRightIcon, TrophyIcon, CalendarIcon, DumbbellIcon, ChartBarIcon } from "../components/icons/IconSet";
import { PlayerCard } from "../components/teams/PlayerCard";
import { StaffCard } from "../components/teams/StaffCard";
import { seniorTeamPlayers, womensTeamPlayers, developmentSquads, academySquads, staffMembers } from "../data/teams";
import type { Player } from "../types/teams";

const sectionIds = ["senior", "women", "development", "academy", "staff"] as const;
type SectionId = (typeof sectionIds)[number];

const MOBILE_BREAKPOINT = 768;

const TeamsPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
  const [activeSection, setActiveSection] = useState<SectionId>("senior");

  const seniorRef = useRef<HTMLDivElement | null>(null);
  const womenRef = useRef<HTMLDivElement | null>(null);
  const devRef = useRef<HTMLDivElement | null>(null);
  const academyRef = useRef<HTMLDivElement | null>(null);
  const staffRef = useRef<HTMLDivElement | null>(null);
  const subnavRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections: [SectionId, React.RefObject<HTMLDivElement>][] = [
        ["senior", seniorRef],
        ["women", womenRef],
        ["development", devRef],
        ["academy", academyRef],
        ["staff", staffRef],
      ];

      const offset = (subnavRef.current?.offsetHeight || 0) + 140;
      let current: SectionId = "senior";

      for (const [id, ref] of sections) {
        const el = ref.current;
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - offset <= 0) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: SectionId) => {
    const map: Record<SectionId, React.RefObject<HTMLDivElement>> = {
      senior: seniorRef,
      women: womenRef,
      development: devRef,
      academy: academyRef,
      staff: staffRef,
    };
    const target = map[id].current;
    if (!target) return;
    const lenis = (window as any).lenis;
    const offset = -((subnavRef.current?.offsetHeight || 0) + 120);
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.0 });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 18, filter: "blur(6px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  };

  const renderPlayerGrid = (players: Player[]) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))",
        gap: spacing.lg,
      }}
    >
      {players.map((p) => (
        <PlayerCard key={`${p.team}-${p.number ?? ""}-${p.name}`} player={p} />
      ))}
    </div>
  );

  return (
    <div
      data-realverse-page
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        background: colors.club.background,
        position: "relative",
      }}
    >
      <PublicHeader />

      {/* Background */}
      <SectionBackground
        variant="hero"
        type="image"
        src={heroAssets.teamBackground1024}
        overlayIntensity="strong"
        style={{ position: "absolute", inset: 0 }}
      />

      <main
        style={{
          position: "relative",
          zIndex: 2,
          padding: isMobile ? `${spacing.xl} ${spacing.lg}` : `${spacing["3xl"]} ${spacing.xl}`,
          paddingTop: isMobile ? "120px" : "140px",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* HERO */}
        <section style={{ minHeight: isMobile ? "auto" : "80vh", display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: spacing["3xl"] }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: "780px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: `${spacing.xs} ${spacing.md}`,
                background: "rgba(0, 224, 255, 0.1)",
                border: `1px solid ${colors.accent.main}40`,
                borderRadius: borderRadius.full,
                marginBottom: spacing.lg,
                backdropFilter: "blur(10px)",
              }}
            >
              <span style={{ ...typography.overline, letterSpacing: "0.18em", color: colors.accent.main }}>CLUB SQUADS</span>
            </div>
            <h1
              style={{
                ...typography.h1,
                fontSize: `clamp(2.6rem, 6vw, 4.8rem)`,
                color: colors.text.primary,
                marginBottom: spacing.md,
                lineHeight: 1.05,
              }}
            >
              The Teams of FC Real Bengaluru
            </h1>
            <p
              style={{
                ...typography.body,
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                maxWidth: "70ch",
                lineHeight: 1.8,
                marginBottom: spacing["2xl"],
              }}
            >
              From grassroots to elite competition — this is the RealVerse pathway. Senior squads, women’s football, development teams, and academy age groups all aligned to one
              identity.
            </p>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: spacing.md, flexWrap: "wrap" }}>
              <Button variant="primary" size="md" onClick={() => scrollToSection("senior")} style={{ borderRadius: 999, width: isMobile ? "100%" : undefined, minHeight: 44 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>View First Team</span>
                  <ArrowRightIcon size={18} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                </span>
              </Button>
              <Button variant="secondary" size="md" onClick={() => scrollToSection("academy")} style={{ borderRadius: 999, width: isMobile ? "100%" : undefined, minHeight: 44 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm }}>
                  <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Explore Academy Pathway</span>
                  <ArrowRightIcon size={18} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                </span>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Sticky Sub-Nav */}
        <div
          ref={subnavRef}
          style={{
            position: "sticky",
            top: isMobile ? 72 : 80,
            zIndex: 5,
            marginBottom: spacing["2xl"],
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: borderRadius.full,
            background: "rgba(2, 12, 27, 0.92)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: shadows.card,
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: spacing.sm,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {[
              { id: "senior", label: "Senior Team" },
              { id: "women", label: "Women’s Team" },
              { id: "development", label: "Development Teams" },
              { id: "academy", label: "Academy U13–U21" },
              { id: "staff", label: "Staff" },
            ].map((tab) => {
              const selected = activeSection === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  onClick={() => scrollToSection(tab.id as SectionId)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...heroCTAPillStyles.base,
                    padding: "8px 14px",
                    boxShadow: "none",
                    border: selected ? `2px solid ${colors.accent.main}` : "1px solid rgba(255,255,255,0.14)",
                    background: selected ? "rgba(245,179,0,0.08)" : "rgba(255,255,255,0.03)",
                    color: selected ? colors.text.primary : colors.text.secondary,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* SENIOR TEAM */}
        <motion.section {...fadeInUp} ref={seniorRef} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>FIRST TEAM</div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>First Team — KSFA Super Division</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              Our flagship squad representing FC Real Bengaluru in the KSFA Super Division and other top-tier competitions.
            </p>
          </div>
          {renderPlayerGrid(seniorTeamPlayers)}
        </motion.section>

        {/* WOMEN'S TEAM */}
        <motion.section {...fadeInUp} ref={womenRef} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>WOMEN’S FOOTBALL</div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>Women’s Team — KSFA Women’s B Division</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              Empowering women’s football in Bengaluru with professional coaching, match exposure, and a clear performance pathway.
            </p>
          </div>
          {renderPlayerGrid(womensTeamPlayers)}
        </motion.section>

        {/* DEVELOPMENT TEAMS */}
        <motion.section {...fadeInUp} ref={devRef} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>DEVELOPMENT PATHWAY</div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>Development Teams — Pathway to Competitive Football</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              Squads that bridge academy football and the first team, competing in KSFA C & D Division and local tournaments.
            </p>
          </div>

          <div style={{ display: "grid", gap: spacing["2xl"] }}>
            {developmentSquads.map((squad) => (
              <div key={squad.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: spacing.md, marginBottom: spacing.md, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>{squad.name}</h3>
                    <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.xs }}>{squad.description}</p>
                  </div>
                </div>
                {renderPlayerGrid(squad.players)}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ACADEMY TEAMS */}
        <motion.section {...fadeInUp} ref={academyRef} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>ACADEMY SQUADS</div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>Academy Squads — Building the Next Generation</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              From U13 to U21, each age group is part of a single pathway. Training, match exposure, and RealVerse data come together to build future first‑team players.
            </p>
          </div>

          {/* Vertical timeline */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              gap: spacing.md,
              marginBottom: spacing["2xl"],
            }}
          >
            {academySquads.map((group, idx) => (
              <React.Fragment key={group.id}>
                <div
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: borderRadius.full,
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(0,0,0,0.35)",
                    boxShadow: shadows.sm,
                    ...typography.caption,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: colors.text.primary,
                  }}
                >
                  {group.ageGroup}
                </div>
                {idx < academySquads.length - 1 && (
                  <div
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      height: isMobile ? 24 : 2,
                      width: isMobile ? 2 : "auto",
                      background:
                        "linear-gradient(90deg, rgba(0,224,255,0.4) 0%, rgba(245,179,0,0.4) 100%)",
                      opacity: 0.7,
                      alignSelf: isMobile ? "stretch" : "center",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: "grid", gap: spacing["2xl"] }}>
            {academySquads.map((group) => (
              <div key={group.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: spacing.md,
                    marginBottom: spacing.md,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h3 style={{ ...typography.h3, color: colors.text.primary, margin: 0 }}>{group.name}</h3>
                    <p style={{ ...typography.body, color: colors.text.secondary, marginTop: spacing.xs }}>{group.description}</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => undefined}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      ...heroCTAPillStyles.base,
                      ...heroCTAPillStyles.gold,
                      padding: "10px 14px",
                      boxShadow: "none",
                    }}
                  >
                    View Full Squad
                  </motion.button>
                </div>
                {renderPlayerGrid(group.players)}
              </div>
            ))}
          </div>
        </motion.section>

        {/* PATHWAY OVERLAY */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["3xl"] }}>
          <div
            style={{
              borderRadius: borderRadius.card,
              background: colors.surface.card,
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: shadows.card,
              padding: spacing.cardPadding,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 0% 0%, rgba(0,224,255,0.18) 0%, transparent 55%), radial-gradient(circle at 100% 100%, rgba(245,179,0,0.16) 0%, transparent 55%)",
                opacity: 0.95,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: spacing.xl, alignItems: "center" }}>
              <div>
                <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>
                  REALVERSE PATHWAY
                </div>
                <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.md }}>
                  From Academy to Super Division — The RealVerse Pathway
                </h2>
                <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "60ch", marginBottom: spacing.lg }}>
                  Training philosophy, player development engine, and data‑driven coaching all come together to move players from U13 squads to the KSFA Super Division first team.
                </p>
                <Button variant="primary" size="md" style={{ borderRadius: 999 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: spacing.sm }}>
                    <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>Join our Academy</span>
                    <ArrowRightIcon size={18} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} />
                  </span>
                </Button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr",
                  gap: spacing.md,
                }}
              >
                {[
                  { label: "Training Philosophy", icon: <DumbbellIcon size={22} color={colors.accent.main} /> },
                  { label: "Player Development Engine", icon: <ChartBarIcon size={22} color={colors.primary.main} /> },
                  { label: "Data‑Driven Coaching", icon: <CalendarIcon size={22} color={colors.accent.main} /> },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderRadius: borderRadius.lg,
                      background: "rgba(0,0,0,0.35)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      padding: spacing.lg,
                      display: "flex",
                      gap: spacing.md,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: borderRadius.card,
                        background: "rgba(255,255,255,0.04)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div style={{ ...typography.body, color: colors.text.primary, fontWeight: typography.fontWeight.semibold }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* STAFF */}
        <motion.section {...fadeInUp} ref={staffRef} style={{ marginBottom: spacing["3xl"] }}>
          <div style={{ marginBottom: spacing.lg }}>
            <div style={{ ...typography.overline, color: colors.accent.main, letterSpacing: "0.15em", marginBottom: spacing.xs }}>COACHES & TECHNICAL STAFF</div>
            <h2 style={{ ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm }}>Coaches & Technical Staff</h2>
            <p style={{ ...typography.body, color: colors.text.secondary, maxWidth: "70ch" }}>
              The people behind the pathway — first team coaches, women’s staff, and academy leaders who keep RealVerse moving.\n            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
              gap: spacing.lg,
            }}
          >
            {staffMembers.map((s) => (
              <StaffCard key={`${s.team}-${s.name}`} staff={s} />
            ))}
          </div>
        </motion.section>

        {/* MATCHDAY LINKAGE */}
        <motion.section {...fadeInUp} style={{ marginBottom: spacing["2xl"], textAlign: "center" }}>
          <Button
            variant="secondary"
            size="md"
            style={{ borderRadius: 999 }}
            onClick={() => {
              window.location.href = "/#matches";
            }}
          >
            See Fixtures & Results <TrophyIcon size={18} style={{ marginLeft: spacing.sm }} />
          </Button>
        </motion.section>
      </main>
    </div>
  );
};

export default TeamsPage;



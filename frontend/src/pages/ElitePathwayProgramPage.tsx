import React from "react";
import ProgramPageTemplate from "../components/ProgramPageTemplate";
import { galleryAssets } from "../config/assets";
import { colors } from "../theme/design-tokens";

const ElitePathwayProgramPage: React.FC = () => {
  return (
    <ProgramPageTemplate
      program={{
        name: "Elite Pathway Program",
        acronym: "EPP",
        positioning: "For players targeting top-tier football in India and abroad.",
        who: "Invitation / merit-based. Performance + data + coach review determine eligibility. This program is for players who demonstrate exceptional ability, commitment, and potential for professional football.",
        training: {
          intensity: "Highest training intensity with smallest group sizes. Individual attention and personalized development plans.",
          matchExposure: "Super Division focused competition. Regular matches against top-tier opposition.",
          philosophy: "Competitive excellence through structured development. Every session is designed to push players to their limits while maintaining long-term sustainability.",
        },
        data: {
          description: "Coaches do NOT rely on gut feel alone. Every player is tracked comprehensively. Trends matter more than single performances. AI assists with simulations, load patterns, and progress forecasting. Decisions are transparent and reviewable.",
          aiFeatures: [
            "AI-assisted performance simulation",
            "Load pattern analysis & optimization",
            "Progress forecasting & trend analysis",
            "Individual development plan tracking",
            "Transparent decision-making processes",
          ],
        },
        progression: {
          description: "Merit-based hierarchy with clear progression pathways. Internal promotions based on consistent performance, data trends, and coach assessment. Movement across programs is seamless with no sudden tactical or playstyle shock.",
          points: [
            "Merit-based promotion to higher levels",
            "Internal movement based on performance + data",
            "No sudden tactical/playstyle changes",
            "Clear progression milestones",
            "Regular assessment & feedback cycles",
          ],
        },
        realverse: {
          features: [
            "Performance dashboards with detailed analytics",
            "Training clips & assignments",
            "Coach feedback & development notes",
            "Community access & player network",
            "Communication hub for parents & players",
          ],
        },
        backgroundImage: galleryAssets.actionShots[0]?.medium,
        accentColor: colors.accent.main,
      }}
    />
  );
};

export default ElitePathwayProgramPage;


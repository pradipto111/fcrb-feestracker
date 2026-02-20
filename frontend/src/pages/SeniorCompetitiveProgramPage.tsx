import React from "react";
import ProgramPageTemplate from "../components/ProgramPageTemplate";
import { galleryAssets } from "../config/assets";
import { colors } from "../theme/design-tokens";

const SeniorCompetitiveProgramPage: React.FC = () => {
  return (
    <ProgramPageTemplate
      program={{
        name: "Senior Competitive Programme",
        acronym: "SCP",
        positioning: "The competitive bridge between youth and elite football.",
        who: "Open application. Merit-based progression. This program welcomes players who are ready for competitive football and demonstrate commitment to structured development.",
        training: {
          intensity: "Structured but scalable intensity. Training adapts to player development needs while maintaining competitive standards.",
          matchExposure: "KSFA C & D Division exposure. Regular match minutes with competitive opposition.",
          philosophy: "Competitive development through regular match exposure. Players learn to perform under pressure while building technical and tactical foundations.",
        },
        data: {
          description: "Primary internal feeder to EPP. Data tracking is comprehensive, focusing on development trends and competitive readiness. AI assists with load management and progression planning. All decisions are data-backed and transparent.",
          aiFeatures: [
            "Performance tracking & trend analysis",
            "Load management & recovery optimization",
            "Progression planning & readiness assessment",
            "Competitive performance analytics",
            "Transparent selection processes",
          ],
        },
        progression: {
          description: "Primary pathway to Elite Pathway Programme. Internal promotions based on consistent performance, competitive readiness, and data trends. Movement is merit-based with clear progression criteria.",
          points: [
            "Primary internal feeder to EPP",
            "Merit-based promotion opportunities",
            "Regular assessment & feedback",
            "Clear progression criteria",
            "Seamless transition pathways",
          ],
        },
        realverse: {
          features: [
            "Performance dashboards",
            "Training clips & assignments",
            "Coach feedback & development notes",
            "Match performance analytics",
            "Community access & communication hub",
          ],
        },
        backgroundImage: galleryAssets.actionShots[1]?.medium,
        accentColor: colors.primary.main,
      }}
    />
  );
};

export default SeniorCompetitiveProgramPage;


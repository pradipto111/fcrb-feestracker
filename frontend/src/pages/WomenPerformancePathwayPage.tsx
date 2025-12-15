import React from "react";
import ProgramPageTemplate from "../components/ProgramPageTemplate";
import { galleryAssets } from "../config/assets";
import { colors } from "../theme/design-tokens";

const WomenPerformancePathwayPage: React.FC = () => {
  return (
    <ProgramPageTemplate
      program={{
        name: "Women's Performance Pathway",
        acronym: "WPP",
        positioning: "A unified pathway for women footballers aiming professional levels.",
        who: "All age groups welcome. This program is designed for women footballers at any stage of their development journey, from youth to senior levels.",
        training: {
          intensity: "Year-round matches with structured training. Intensity scales with player development and competitive readiness.",
          matchExposure: "Women's B Division exposure. Regular competitive matches throughout the year.",
          philosophy: "Professional pathway development for women footballers. Same competitive standards and development rigor as men's programs.",
        },
        data: {
          description: "Same data & analytics rigor as men's programs. Every player is tracked comprehensively. AI assists with performance analysis, load management, and career pathway planning. Decisions are transparent and data-backed.",
          aiFeatures: [
            "Comprehensive performance tracking",
            "Load management & recovery optimization",
            "Career pathway planning & forecasting",
            "Performance trend analysis",
            "Transparent selection & progression processes",
          ],
        },
        progression: {
          description: "Long-term career pathway with clear progression milestones. Internal movement based on performance, data trends, and competitive readiness. Pathway designed for sustainable long-term development.",
          points: [
            "Long-term career pathway",
            "Merit-based progression",
            "Clear development milestones",
            "Regular assessment & feedback",
            "Sustainable development approach",
          ],
        },
        realverse: {
          features: [
            "Performance dashboards",
            "Training clips & assignments",
            "Coach feedback & development notes",
            "Career pathway tracking",
            "Community access & communication hub",
          ],
        },
        backgroundImage: galleryAssets.actionShots[2]?.medium,
        accentColor: colors.accent.main,
      }}
    />
  );
};

export default WomenPerformancePathwayPage;


import React from "react";
import ProgramPageTemplate from "../components/ProgramPageTemplate";
import { galleryAssets } from "../config/assets";
import { colors } from "../theme/design-tokens";

const FoundationYouthProgramPage: React.FC = () => {
  return (
    <ProgramPageTemplate
      program={{
        name: "Foundation & Youth Development Program",
        acronym: "FYDP",
        positioning: "Building intelligent footballers before building competitors.",
        who: "U9, U11, U13. Gender-neutral. This program welcomes young players at the foundation stage, focusing on technical and tactical development before competitive pressure.",
        training: {
          intensity: "Development-focused intensity. Training emphasizes learning, experimentation, and foundation building over competitive pressure.",
          matchExposure: "Tactical foundations aligned with senior teams. Friendly matches and small-sided games focused on learning.",
          philosophy: "Foundation before competition. Players learn the club's tactical identity and playing style from the start, ensuring no playstyle shock on promotion.",
        },
        data: {
          description: "Data-assisted development even at youth level. Players are tracked from the beginning, building comprehensive development profiles. AI assists with development planning and identifies potential early. All processes are transparent and educational.",
          aiFeatures: [
            "Early development tracking",
            "Development planning & forecasting",
            "Talent identification support",
            "Learning progress analytics",
            "Transparent development processes",
          ],
        },
        progression: {
          description: "Foundation before competition. Players develop technical and tactical foundations aligned with senior teams. No playstyle shock on promotion. Clear progression pathways to competitive programs.",
          points: [
            "Foundation aligned with senior teams",
            "No playstyle shock on promotion",
            "Clear progression to competitive programs",
            "Merit-based advancement",
            "Sustainable development approach",
          ],
        },
        realverse: {
          features: [
            "Development dashboards",
            "Training clips & learning resources",
            "Coach feedback & development notes",
            "Progress tracking & milestones",
            "Parent communication hub",
          ],
        },
        backgroundImage: galleryAssets.actionShots[3]?.medium,
        accentColor: colors.primary.main,
      }}
    />
  );
};

export default FoundationYouthProgramPage;


import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import RoleLayout, { IconDashboard, IconPlayers, IconSessions, IconFeedback, IconMatches, IconWellness } from "./shared/RoleLayout";

const CoachLayout: React.FC = () => {
  const { user } = useAuth();
  const [coachData, setCoachData] = useState<any>(null);

  useEffect(() => {
    const loadCoachData = async () => {
      try {
        // Try to get coach profile - adjust API call as needed
        const data = await api.getDashboardSummary().catch(() => null);
        setCoachData(data);
      } catch (err) {
        // Silently fail
      }
    };
    loadCoachData();
  }, []);

  const navItems = [
    {
      path: "/realverse/coach",
      label: "Dashboard",
      icon: "dashboard",
      description: "Overview & quick stats",
    },
    {
      path: "/realverse/students",
      label: "Players",
      icon: "players",
      description: "Manage your players",
    },
    {
      path: "/realverse/attendance",
      label: "Sessions",
      icon: "sessions",
      description: "Training sessions & attendance",
    },
    {
      path: "/realverse/coach/schedule",
      label: "Schedule",
      icon: "sessions",
      description: "Calendar & events",
    },
    {
      path: "/realverse/coach/feedback",
      label: "Feedback",
      icon: "feedback",
      description: "Player feedback & insights",
    },
    {
      path: "/realverse/fixtures",
      label: "Matches",
      icon: "matches",
      description: "Fixtures & team selection",
    },
    {
      path: "/realverse/coach/wellness",
      label: "Wellness Overview",
      icon: "wellness",
      description: "Player training load & recovery",
    },
    {
      path: "/realverse/coach/analytics",
      label: "Analytics",
      icon: "dashboard",
      description: "Squad performance metrics",
    },
    {
      path: "/realverse/coach/fan-club-analytics",
      label: "Fan Club Analytics",
      icon: "dashboard",
      description: "Fan Club & partner KPIs",
    },
    {
      path: "/realverse/scouting/board",
      label: "Scouting Board",
      icon: "players",
      description: "Player comparison & shortlists",
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return <IconDashboard />;
      case "players":
        return <IconPlayers />;
      case "sessions":
        return <IconSessions />;
      case "feedback":
        return <IconFeedback />;
      case "matches":
        return <IconMatches />;
      case "wellness":
        return <IconWellness />;
      default:
        return null;
    }
  };

  const getProfileInfo = (data: any) => {
    return {
      name: user?.fullName || "Coach",
      subtitle: "Training & Development",
    };
  };

  return (
    <RoleLayout
      role="COACH"
      navItems={navItems}
      getIcon={getIcon}
      profileData={user}
      getProfileInfo={getProfileInfo}
    />
  );
};

export default CoachLayout;


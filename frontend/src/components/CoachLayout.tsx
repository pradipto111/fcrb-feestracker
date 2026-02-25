import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { DISABLE_HEAVY_ANALYTICS } from "../config/featureFlags";
import RoleLayout, { IconDashboard, IconMatches, IconPlayers, IconSessions, IconFeed } from "./shared/RoleLayout";

const CoachLayout: React.FC = () => {
  const { user } = useAuth();
  const [coachData, setCoachData] = useState<any>(null);

  useEffect(() => {
    if (DISABLE_HEAVY_ANALYTICS) {
      setCoachData(null);
      return;
    }
    const loadCoachData = async () => {
      try {
        const data = await api.getDashboardSummary().catch((err: any) => {
          if (err?.message && !err.message.includes("Cannot reach the backend")) {
            console.error("Failed to load coach data:", err);
          }
          return null;
        });
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
      path: "/realverse/coach/training-calendar",
      label: "Training Calendar",
      icon: "matches",
      description: "Manage training sessions & attendance",
    },
    {
      path: "/realverse/coach/schedule",
      label: "Schedule",
      icon: "matches",
      description: "Matches, training & events",
    },
    {
      path: "/realverse/coach/students",
      label: "Players",
      icon: "players",
      description: "View players & update payment status",
    },
    {
      path: "/realverse/coach/drill-content",
      label: "Drill Content",
      icon: "sessions",
      description: "Add links & media for students",
    },
    {
      path: "/realverse/coach/feed/approve",
      label: "Post Approval",
      icon: "feed",
      description: "Approve/decline student posts",
    },
    {
      path: "/realverse/coach/feed/create",
      label: "Create Post",
      icon: "feed",
      description: "Create posts (master access)",
    },
    // {
    //   path: "/realverse/scouting/board",
    //   label: "Scouting Board",
    //   icon: "players",
    //   description: "Player comparison & shortlists",
    // },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return <IconDashboard />;
      case "matches":
        return <IconMatches />;
      case "players":
        return <IconPlayers />;
      case "sessions":
        return <IconSessions />;
      case "feed":
        return <IconFeed />;
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


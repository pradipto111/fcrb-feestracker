import React from "react";
import { useAuth } from "../context/AuthContext";
import RoleLayout, {
  IconDashboard,
  IconCentres,
  IconStaff,
  IconPlayers,
  IconMatches,
  IconSessions,
  IconShop,
  IconSettings,
} from "./shared/RoleLayout";

const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    // Operations Section
    // {
    //   path: "/realverse/admin/activity",
    //   label: "Activity",
    //   icon: "sessions",
    //   description: "System-wide audit feed",
    //   section: "Operations",
    // },
    // Fan Club Section (Coming Soon)
    {
      path: "/realverse/admin/fans",
      label: "Fan Club",
      icon: "dashboard",
      description: "Accounts, tiers & rewards · Coming Soon",
      section: "Fan Club",
    },
    {
      path: "/realverse/admin/fans/content",
      label: "Content & Analytics",
      icon: "matches",
      description: "Matchday content & analytics · Coming Soon",
      section: "Fan Club",
    },
    {
      path: "/realverse/admin/fans/settings",
      label: "Fan Club Settings",
      icon: "settings",
      description: "Feature toggles · Coming Soon",
      section: "Fan Club",
    },
    {
      path: "/realverse/admin/centres",
      label: "Centres",
      icon: "centres",
      description: "Manage training centres",
      section: "Operations",
    },
    {
      path: "/realverse/admin/staff",
      label: "Staff",
      icon: "staff",
      description: "Coaches & administrators",
      section: "Operations",
    },
    {
      path: "/realverse/admin/students",
      label: "Players",
      icon: "players",
      description: "All players & students",
      section: "Operations",
    },
    {
      path: "/realverse/admin/payment-logs",
      label: "Payment Logs",
      icon: "settings",
      description: "Track all payment & revenue updates",
      section: "Operations",
    },
    // {
    //   path: "/realverse/admin/students/bulk-import",
    //   label: "Bulk Import",
    //   icon: "players",
    //   description: "Import students from spreadsheet",
    //   section: "Operations",
    // },
    // Football Ops Section
    {
      path: "/realverse/admin/schedule",
      label: "Schedule",
      icon: "matches",
      description: "Unified calendar: matches, training & events",
      section: "Football Ops",
    },
    {
      path: "/realverse/admin/attendance",
      label: "Sessions",
      icon: "sessions",
      description: "Training sessions management",
      section: "Football Ops",
    },
    // System Section
    {
      path: "/realverse/admin/merch",
      label: "Merch / Shop",
      icon: "shop",
      description: "Merchandise management",
      section: "System",
    },
    {
      path: "/realverse/admin/leads",
      label: "Leads",
      icon: "players",
      description: "Website leads & checkout attempts",
      section: "System",
    },
    {
      path: "/realverse/admin/settings",
      label: "Settings",
      icon: "settings",
      description: "System configuration & footer management",
      section: "System",
    },
    // {
    //   path: "/realverse/admin/batch-review",
    //   label: "Batch Review",
    //   icon: "sessions",
    //   description: "Review multiple players",
    //   section: "Football Ops",
    // },
    // {
    //   path: "/realverse/scouting/board",
    //   label: "Scouting Board",
    //   icon: "players",
    //   description: "Player comparison & shortlists",
    //   section: "Football Ops",
    // },
    // {
    //   path: "/realverse/trials/events",
    //   label: "Trial Events",
    //   icon: "matches",
    //   description: "External scouting & trial management",
    //   section: "Football Ops",
    // },
    // {
    //   path: "/realverse/trials/templates",
    //   label: "Trial Templates",
    //   icon: "settings",
    //   description: "Manage evaluation metric templates",
    //   section: "Football Ops",
    // },
    // {
    //   path: "/realverse/admin/calibration",
    //   label: "Calibration",
    //   icon: "analytics",
    //   description: "Coach scoring consistency & calibration",
    //   section: "Football Ops",
    // },
    // {
    //   path: "/realverse/admin/season-planning",
    //   label: "Season Planning",
    //   icon: "sessions",
    //   description: "Training load planning & prediction",
    //   section: "Football Ops",
    // },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return <IconDashboard />;
      case "centres":
        return <IconCentres />;
      case "staff":
        return <IconStaff />;
      case "players":
        return <IconPlayers />;
      case "matches":
        return <IconMatches />;
      case "sessions":
        return <IconSessions />;
      case "shop":
        return <IconShop />;
      case "settings":
        return <IconSettings />;
      default:
        return null;
    }
  };

  const getProfileInfo = (data: any) => {
    return {
      name: user?.fullName || "Administrator",
      subtitle: "System Management",
    };
  };

  return (
    <RoleLayout
      role="ADMIN"
      navItems={navItems}
      getIcon={getIcon}
      profileData={user}
      getProfileInfo={getProfileInfo}
    />
  );
};

export default AdminLayout;


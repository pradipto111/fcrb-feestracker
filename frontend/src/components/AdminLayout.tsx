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
  IconPayments,
  IconSettings,
} from "./shared/RoleLayout";

const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    // Operations Section
    {
      path: "/realverse/admin",
      label: "Dashboard",
      icon: "dashboard",
      description: "System overview",
      section: "Operations",
    },
    {
      path: "/realverse/admin/analytics",
      label: "Analytics",
      icon: "dashboard",
      description: "Performance metrics & insights",
      section: "Operations",
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
      path: "/realverse/students",
      label: "Players",
      icon: "players",
      description: "All players & students",
      section: "Operations",
    },
    // Football Ops Section
    {
      path: "/realverse/fixtures",
      label: "Matches",
      icon: "matches",
      description: "Fixtures & competitions",
      section: "Football Ops",
    },
    {
      path: "/realverse/attendance",
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
      path: "/realverse/admin/payments",
      label: "Payments",
      icon: "payments",
      description: "Payment tracking & reports",
      section: "System",
    },
    {
      path: "/realverse/admin/settings",
      label: "Settings",
      icon: "settings",
      description: "System configuration",
      section: "System",
    },
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
      case "payments":
        return <IconPayments />;
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


import React from "react";
import RoleLayout, { IconDashboard, IconPlayers } from "./shared/RoleLayout";

const CrmLayout: React.FC = () => {
  const navItems = [
    {
      path: "/realverse/crm",
      label: "Pipeline",
      icon: "dashboard",
      description: "Unified lead pipeline",
      section: "CRM",
    },
    {
      path: "/realverse/crm/import",
      label: "Import",
      icon: "players",
      description: "Upload CSV/XLSX leads",
      section: "CRM",
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return <IconDashboard />;
      case "players":
        return <IconPlayers />;
      default:
        return <IconDashboard />;
    }
  };

  return <RoleLayout role="CRM" navItems={navItems} getIcon={getIcon} />;
};

export default CrmLayout;


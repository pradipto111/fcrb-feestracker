import React from "react";
import AppShell from "./AppShell";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AppShell>{children}</AppShell>;
};

export default Layout;

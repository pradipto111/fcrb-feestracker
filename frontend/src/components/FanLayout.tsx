import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import RoleLayout, {
  IconDashboard,
  IconMatches,
  IconPlayers,
  IconSessions,
  IconShop,
} from "./shared/RoleLayout";
import { TrophyIcon, StarIcon, CalendarIcon, ChartBarIcon } from "./icons/IconSet";
import { FanOnboardingModal } from "./fan/FanOnboardingModal";

const FanLayout: React.FC = () => {
  const { user } = useAuth();
  const [fanMe, setFanMe] = useState<any>(null);
  const [onboardingSaving, setOnboardingSaving] = useState(false);

  useEffect(() => {
    api.getFanMe()
      .then(setFanMe)
      .catch(() => setFanMe(null));
  }, []);

  const flags = (fanMe?.tier?.featureFlags || fanMe?.profile?.tier?.featureFlags || {}) as Record<string, any>;
  const needsOnboarding = !!fanMe && (fanMe?.onboarding === null || fanMe?.onboarding === undefined);

  const submitOnboarding = async (payload: { persona?: string; favoritePlayer?: string; locality?: string; goals?: string[] }) => {
    if (onboardingSaving) return;
    setOnboardingSaving(true);
    try {
      const res = await api.submitFanOnboarding(payload);
      // Prefer server-returned profile, fallback to refetch.
      if (res?.profile) setFanMe(res.profile);
      else setFanMe(await api.getFanMe());
    } finally {
      setOnboardingSaving(false);
    }
  };

  const navItems = [
    { path: "/realverse/fan", label: "Fan Club HQ", icon: "dashboard", description: "Your Fan Club home" },
    { path: "/realverse/fan/schedule", label: "Schedule", icon: "matchday", description: "Matches, training & events" },
    ...(flags.offers === false ? [] : [{ path: "/realverse/fan/benefits", label: "Sponsors", icon: "benefits", description: "Offers, rewards, perks" }]),
    ...(flags.games === false ? [] : [{ path: "/realverse/fan/games", label: "Games & Quests", icon: "games", description: "Play, earn points" }]),
    ...(flags.matchday === false ? [] : [{ path: "/realverse/fan/matchday", label: "Matchday", icon: "matchday", description: "Weekly unlocks & moments" }]),
    { path: "/realverse/fan/profile", label: "My Profile", icon: "profile", description: "Tier, badges, history" },
    ...(flags.programs === false ? [] : [{ path: "/realverse/fan/programs", label: "Train With Us", icon: "programs", description: "From supporter to squad" }]),
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "dashboard":
        return <IconDashboard />;
      case "benefits":
        return <TrophyIcon size={18} />;
      case "games":
        return <StarIcon size={18} />;
      case "matchday":
        return <CalendarIcon size={18} />;
      case "profile":
        return <IconPlayers />;
      case "programs":
        return <ChartBarIcon size={18} />;
      default:
        return <IconSessions />;
    }
  };

  const getProfileInfo = () => {
    const tierName = fanMe?.tier?.name || "Fan Club";
    return {
      name: user?.fullName || fanMe?.fullName || "Fan Club Member",
      subtitle: `${tierName} • RealVerse`,
    };
  };

  return (
    <>
      <RoleLayout role="FAN" navItems={navItems} getIcon={getIcon} profileData={fanMe} getProfileInfo={getProfileInfo} />

      <FanOnboardingModal
        isOpen={needsOnboarding}
        fanName={user?.fullName || fanMe?.fullName || fanMe?.profile?.fullName}
        onSubmit={submitOnboarding}
      />
    </>
  );
};

export default FanLayout;




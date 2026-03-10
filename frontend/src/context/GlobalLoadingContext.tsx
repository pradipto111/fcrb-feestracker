import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import FCRBLoader from "../components/FCRBLoader";
import { subscribeGlobalLoading } from "./globalLoadingBus";

type LoadingChannel = "route" | "auth" | "suspense";

type GlobalLoadingContextValue = {
  isLoading: boolean;
  networkCount: number;
  message: string;
  setChannelLoading: (channel: LoadingChannel, active: boolean, message?: string) => void;
};

const DEFAULT_MESSAGE = "THE PRIDE OF BENGALURU";

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);

export const GlobalLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkCount, setNetworkCount] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [suspenseLoading, setSuspenseLoading] = useState(false);
  const [channelMessage, setChannelMessage] = useState(DEFAULT_MESSAGE);

  useEffect(() => {
    return subscribeGlobalLoading((snapshot) => setNetworkCount(snapshot.networkCount));
  }, []);

  const setChannelLoading = useCallback((channel: LoadingChannel, active: boolean, message?: string) => {
    if (channel === "route") {
      setRouteLoading(active);
    } else if (channel === "auth") {
      setAuthLoading(active);
    } else {
      setSuspenseLoading(active);
    }

    if (active && message) {
      setChannelMessage(message);
    }
  }, []);

  const isLoading = routeLoading || authLoading || suspenseLoading || networkCount > 0;
  useEffect(() => {
    if (!isLoading) {
      setChannelMessage(DEFAULT_MESSAGE);
    }
  }, [isLoading]);

  const message = networkCount > 0 && channelMessage === DEFAULT_MESSAGE ? "MATCH INTEL LOADING" : channelMessage;

  const value = useMemo<GlobalLoadingContextValue>(
    () => ({
      isLoading,
      networkCount,
      message,
      setChannelLoading,
    }),
    [isLoading, networkCount, message, setChannelLoading]
  );

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      <FCRBLoader isLoading={isLoading} message={message} />
    </GlobalLoadingContext.Provider>
  );
};

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error("useGlobalLoading must be used inside GlobalLoadingProvider");
  }
  return context;
}

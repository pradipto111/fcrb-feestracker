"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FCRBLoader } from "./FCRBLoader";

type GlobalLoaderContextValue = {
  pendingCount: number;
  message?: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
};

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(null);

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const startLoading = useCallback((nextMessage?: string) => {
    setPendingCount((count) => count + 1);
    if (nextMessage) setMessage(nextMessage);
  }, []);

  const stopLoading = useCallback(() => {
    setPendingCount((count) => Math.max(0, count - 1));
  }, []);

  const value = useMemo<GlobalLoaderContextValue>(
    () => ({ pendingCount, message, startLoading, stopLoading }),
    [pendingCount, message, startLoading, stopLoading]
  );

  return (
    <GlobalLoaderContext.Provider value={value}>
      {children}
      <FCRBLoader isLoading={pendingCount > 0} message={message} />
    </GlobalLoaderContext.Provider>
  );
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext);
  if (!context) {
    throw new Error("useGlobalLoader must be used within GlobalLoaderProvider");
  }
  return context;
}

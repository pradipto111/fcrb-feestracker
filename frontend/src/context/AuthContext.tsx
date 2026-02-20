import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken } from "../api/client";

type User = {
  id: number;
  fullName: string;
  role: "ADMIN" | "COACH" | "STUDENT" | "FAN" | "CRM";
  crmRole?: "AGENT";
};

type AuthContextType = {
  user: User | null;
  isReady: boolean;
  login: (email: string, password: string, role?: User["role"]) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Validates a JWT token by checking if it's expired
 * @param token - JWT token string
 * @returns true if token is valid and not expired, false otherwise
 */
function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    
    // Convert exp (seconds) to milliseconds and check if expired
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      // If user data is corrupted, clear it
      console.warn("Failed to parse user from localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [isReady, setIsReady] = useState(false);

  const login = async (email: string, password: string, role?: User["role"]) => {
    const res = await api.login(email, password, role);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("user", JSON.stringify(res.user));
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  // Validate and restore token on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        if (isTokenValid(storedToken)) {
          // Token is valid - restore it
          setToken(storedToken);
          setIsReady(true);
        } else {
          // Token expired or invalid - clear auth state
          logout();
          setIsReady(true);
        }
      } else {
        // No token stored - auth is ready (user will need to login)
        setIsReady(true);
      }
    } catch (error) {
      // If anything goes wrong during initialization, clear auth and mark as ready
      console.error("Error during auth initialization:", error);
      logout();
      setIsReady(true);
    }
  }, [logout]);

  // Listen for auth clearing events (from API client on 401) and storage changes
  useEffect(() => {
    const handleAuthCleared = () => {
      // API client cleared auth (e.g., on 401) - sync state
      logout();
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Cross-tab synchronization: if token or user is removed, sync state
      if (e.key === "token" && !e.newValue) {
        logout();
      } else if (e.key === "user" && !e.newValue) {
        setUser(null);
      } else if (e.key === "token" && e.newValue) {
        // Token was added/updated in another tab - validate and update
        if (isTokenValid(e.newValue)) {
          setToken(e.newValue);
        } else {
          logout();
        }
      }
    };

    // Listen for custom event from API client (same-tab)
    window.addEventListener("auth:cleared", handleAuthCleared);
    // Listen for storage events (cross-tab)
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("auth:cleared", handleAuthCleared);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


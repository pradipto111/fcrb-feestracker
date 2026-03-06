import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import { DashboardSummary } from "../types/analytics";
import { DISABLE_HEAVY_ANALYTICS } from "../config/featureFlags";

const ADMIN_SUMMARY_CACHE_TTL_MS = 60000;
const ADMIN_SUMMARY_CACHE_VERSION = 1;
const ADMIN_SUMMARY_CACHE_PREFIX = "rv-admin-summary";

type AdminSummaryCacheEntry = {
  data: DashboardSummary;
  cachedAt: number;
  ttlMs: number;
  cacheVersion: number;
};

interface UseAdminAnalyticsOptions {
  centerId?: string;
  includeInactive?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  fetchOnMount?: boolean;
}

interface UseAdminAnalyticsReturn {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

/** Module-level cache for admin summary (keyed by centerId + includeInactive) for instant load on navigate back */
let lastAdminSummary: { params: string; data: DashboardSummary; at: number } | null = null;

function adminSummaryCacheKey(centerId?: string, includeInactive?: boolean): string {
  return `${centerId ?? ""}:${includeInactive ?? true}`;
}

function getAdminSummarySessionKey(cacheKey: string): string {
  return `${ADMIN_SUMMARY_CACHE_PREFIX}:${cacheKey}`;
}

function readAdminSummarySessionCache(
  key: string
): { data: DashboardSummary; cachedAt: number } | null {
  try {
    const raw = sessionStorage.getItem(getAdminSummarySessionKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSummaryCacheEntry;
    if (
      parsed.cacheVersion !== ADMIN_SUMMARY_CACHE_VERSION ||
      !parsed.data ||
      typeof parsed.cachedAt !== "number"
    ) {
      return null;
    }
    const age = Date.now() - parsed.cachedAt;
    if (age > parsed.ttlMs) {
      return null;
    }
    return { data: parsed.data, cachedAt: parsed.cachedAt };
  } catch {
    return null;
  }
}

function writeAdminSummarySessionCache(key: string, data: DashboardSummary): void {
  try {
    const payload: AdminSummaryCacheEntry = {
      data,
      cachedAt: Date.now(),
      ttlMs: ADMIN_SUMMARY_CACHE_TTL_MS,
      cacheVersion: ADMIN_SUMMARY_CACHE_VERSION,
    };
    sessionStorage.setItem(getAdminSummarySessionKey(key), JSON.stringify(payload));
  } catch {
    // ignore storage quota/access errors
  }
}

/**
 * Centralized hook for fetching admin dashboard analytics
 * Provides single source of truth for analytics data across all admin pages
 */
export function useAdminAnalytics(
  options: UseAdminAnalyticsOptions = {}
): UseAdminAnalyticsReturn {
  const {
    centerId,
    includeInactive = true, // Default to true for admin (shows all students)
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds default
    fetchOnMount = false,
  } = options;

  const cacheKey = adminSummaryCacheKey(centerId, includeInactive);
  const inMemoryCached =
    !DISABLE_HEAVY_ANALYTICS &&
    lastAdminSummary &&
    lastAdminSummary.params === cacheKey &&
    Date.now() - lastAdminSummary.at < ADMIN_SUMMARY_CACHE_TTL_MS
      ? { data: lastAdminSummary.data, cachedAt: lastAdminSummary.at }
      : null;
  const sessionCached =
    !DISABLE_HEAVY_ANALYTICS && !inMemoryCached
      ? readAdminSummarySessionCache(cacheKey)
      : null;
  const initialCached = inMemoryCached ?? sessionCached;

  const [summary, setSummary] = useState<DashboardSummary | null>(() => initialCached?.data ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(() => initialCached?.cachedAt ?? null);
  const summaryRef = useRef<DashboardSummary | null>(null);
  
  // Update ref when summary changes
  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  const fetchSummary = useCallback(async () => {
    if (DISABLE_HEAVY_ANALYTICS) {
      setSummary(null);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setError(null);
      if (!summaryRef.current) setLoading(true);

      const params: {
        centerId?: string;
        includeInactive?: boolean;
      } = {};
      if (centerId) params.centerId = centerId;
      if (includeInactive !== undefined) params.includeInactive = includeInactive;

      const data = await api.getDashboardSummary(params);

      if (data) {
        setSummary(data);
        const now = Date.now();
        setLastUpdated(now);
        lastAdminSummary = { params: cacheKey, data, at: now };
        writeAdminSummarySessionCache(cacheKey, data);
      } else {
        // Set default values if no data returned
        setSummary({
          totalCollected: 0,
          studentCount: 0,
          activeStudentCount: 0,
          approxOutstanding: 0,
        });
      }
    } catch (err: any) {
      // Only set error if it's not an intentional cancellation
      if (err.name !== "AbortError" && err.message && !err.message.includes("cancelled")) {
        console.error("Failed to load admin analytics:", err);
        setError(err.message || "Failed to load analytics data");
        
        // Set default values on error so UI can still render
        if (!summaryRef.current) {
          setSummary({
            totalCollected: 0,
            studentCount: 0,
            activeStudentCount: 0,
            approxOutstanding: 0,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [centerId, includeInactive, cacheKey]);

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      if (mounted) {
        await fetchSummary();
      }
    };

    // If heavy analytics disabled, no-op
    if (DISABLE_HEAVY_ANALYTICS) {
      setLoading(false);
      setSummary(null);
      setLastUpdated(null);
      return;
    }
    const cached = readAdminSummarySessionCache(cacheKey);
    if (cached) {
      setSummary(cached.data);
      setLastUpdated(cached.cachedAt);
    }

    // Initial load is opt-in to avoid login-time CPU spikes.
    if (fetchOnMount) {
      load();
    }

    // Auto-refresh if enabled
    if (autoRefresh && mounted) {
      const scheduleRefresh = () => {
        if (mounted) {
          refreshTimeout = setTimeout(async () => {
            if (mounted) {
              await fetchSummary();
              scheduleRefresh();
            }
          }, refreshInterval);
        }
      };
      scheduleRefresh();
    }

    return () => {
      mounted = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [fetchSummary, autoRefresh, refreshInterval, fetchOnMount, cacheKey]);

  const refresh = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}

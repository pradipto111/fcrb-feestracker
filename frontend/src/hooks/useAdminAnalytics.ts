import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api/client";
import { DashboardSummary } from "../types/analytics";

const ADMIN_SUMMARY_CACHE_TTL_MS = 60000; // 1 min stale-while-revalidate

interface UseAdminAnalyticsOptions {
  centerId?: string;
  includeInactive?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAdminAnalyticsReturn {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Module-level cache for admin summary (keyed by centerId + includeInactive) for instant load on navigate back */
let lastAdminSummary: { params: string; data: DashboardSummary; at: number } | null = null;

function adminSummaryCacheKey(centerId?: string, includeInactive?: boolean): string {
  return `${centerId ?? ""}:${includeInactive ?? true}`;
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
  } = options;

  const cacheKey = adminSummaryCacheKey(centerId, includeInactive);
  const cached = lastAdminSummary && lastAdminSummary.params === cacheKey && (Date.now() - lastAdminSummary.at) < ADMIN_SUMMARY_CACHE_TTL_MS;

  const [summary, setSummary] = useState<DashboardSummary | null>(() => (cached ? lastAdminSummary!.data : null));
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const summaryRef = useRef<DashboardSummary | null>(null);
  
  // Update ref when summary changes
  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  const fetchSummary = useCallback(async () => {
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
        lastAdminSummary = { params: cacheKey, data, at: Date.now() };
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
    let refreshTimeout: NodeJS.Timeout;

    const load = async () => {
      if (mounted) {
        await fetchSummary();
      }
    };

    // If we had fresh cache, show it and revalidate in background without blocking UI
    if (cached && lastAdminSummary) {
      setSummary(lastAdminSummary.data);
      setLoading(false);
    }
    // Initial load (or revalidate)
    load();

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
  }, [fetchSummary, autoRefresh, refreshInterval]);

  const refresh = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
}

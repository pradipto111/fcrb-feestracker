import { Request, Response, NextFunction, type RequestHandler } from "express";

type CacheEntry = { body: unknown; expiresAt: number };

const store = new Map<string, CacheEntry>();

/** Build a stable query string from req.query (sorted keys). */
function normalizedQuery(query: Record<string, unknown>): string {
  const keys = Object.keys(query).sort();
  if (keys.length === 0) return "";
  return keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(query[k] ?? ""))}`).join("&");
}

/** Build cache key: method:path:userId:role:query (userId/role omitted when no user). */
export function buildCacheKey(req: Request, pathPrefix: string): string {
  const method = req.method.toUpperCase();
  const path = (pathPrefix + (req.path === "/" ? "" : req.path)).replace(/\/$/, "") || "/";
  const query = normalizedQuery((req.query as Record<string, unknown>) || {});
  const user = (req as any).user;
  if (user && typeof user.id === "number" && user.role) {
    return `${method}:${path}:${user.id}:${user.role}:${query}`;
  }
  return `${method}:${path}::${query}`;
}

export function get(key: string): unknown | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.body;
}

export function set(key: string, body: unknown, ttlMs: number): void {
  store.set(key, {
    body,
    expiresAt: Date.now() + ttlMs,
  });
}

/** Handler that may return Response (e.g. return res.json()) — we ignore return value. */
type CachedHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void | Response | undefined>;

/**
 * Wraps an async GET handler to cache its JSON response.
 * Key is built from pathPrefix + req.path, req.user (id, role), and req.query.
 * On hit: sends cached body and does not call the handler.
 * On miss: runs the handler and intercepts res.json(body) to cache the body.
 */
export function withCache(ttlMs: number, pathPrefix: string) {
  return (handler: CachedHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (req.method !== "GET") {
        void handler(req, res, next);
        return;
      }
      const key = buildCacheKey(req, pathPrefix);
      const cached = get(key);
      if (cached !== null) {
        res.json(cached);
        return;
      }
      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        set(key, body, ttlMs);
        return originalJson(body);
      };
      void handler(req, res, next);
    };
  };
}

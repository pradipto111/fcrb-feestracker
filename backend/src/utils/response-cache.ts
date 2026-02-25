import { Request, Response, NextFunction } from "express";

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

type RequestHandler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

/**
 * Wraps an async GET handler to cache its JSON response.
 * Key is built from pathPrefix + req.path, req.user (id, role), and req.query.
 * On hit: sends cached body and does not call the handler.
 * On miss: runs the handler and intercepts res.json(body) to cache the body.
 */
export function withCache(ttlMs: number, pathPrefix: string) {
  return (handler: RequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== "GET") {
        return handler(req, res, next);
      }
      const key = buildCacheKey(req, pathPrefix);
      const cached = get(key);
      if (cached !== null) {
        return res.json(cached);
      }
      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        set(key, body, ttlMs);
        return originalJson(body);
      };
      return handler(req, res, next);
    };
  };
}

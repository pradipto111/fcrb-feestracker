import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface JwtPayload {
  id: number;
  role: "ADMIN" | "COACH" | "STUDENT" | "FAN";
}

export function authRequired(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

type AppRole = JwtPayload["role"];

// Supports both call styles:
// - requireRole("ADMIN", "COACH")
// - requireRole(["ADMIN", "COACH"])
export function requireRole(...rolesOrList: (AppRole | AppRole[])[]) {
  const roles = rolesOrList.flat() as AppRole[];
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as AppRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}


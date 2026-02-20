import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "ADMIN" | "COACH" | "STUDENT" | "FAN" | "CRM";
        crmRole?: "AGENT";
      };
    }
  }
}


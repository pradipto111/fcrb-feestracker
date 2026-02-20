import prisma from "../db/prisma";

export type SystemActivityInput = {
  actorType: "ADMIN" | "COACH" | "STUDENT" | "FAN" | "CRM" | "SYSTEM";
  actorId?: string | number | null;
  action: string;
  entityType: string;
  entityId: string | number;
  before?: any;
  after?: any;
  metadata?: any;
};

export async function logSystemActivity(input: SystemActivityInput) {
  try {
    if (!(prisma as any).systemActivityLog) return;
    await (prisma as any).systemActivityLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId !== undefined && input.actorId !== null ? String(input.actorId) : null,
        action: input.action,
        entityType: input.entityType,
        entityId: String(input.entityId),
        before: input.before !== undefined ? input.before : null,
        after: input.after !== undefined ? input.after : null,
        metadata: input.metadata !== undefined ? input.metadata : null,
      },
    });
  } catch (error) {
    // Never break primary flows due to logging
    console.warn("SystemActivityLog write skipped:", (error as any)?.message || error);
  }
}


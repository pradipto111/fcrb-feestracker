import prisma from "../../db/prisma";

export function mapLeadStatusToCrm(input: { status?: string | null }) {
  const raw = (input.status || "NEW").toUpperCase();
  // Map old statuses to new stages
  if (raw === "CONVERTED" || raw === "WON" || raw === "JOINED") return { stage: "JOINED", status: "CLOSED" };
  if (raw === "LOST" || raw === "DROPPED" || raw === "UNINTERESTED_NO_RESPONSE" || raw === "UNINTERESTED" || raw === "NO_RESPONSE") return { stage: "UNINTERESTED_NO_RESPONSE", status: "CLOSED" };
  if (raw === "QUALIFIED" || raw === "FOLLOW_UP" || raw === "FOLLOWUP") return { stage: "FOLLOW_UP", status: "OPEN" };
  if (raw === "PROPOSAL" || raw === "WILL_JOIN" || raw === "WILLJOIN") return { stage: "WILL_JOIN", status: "OPEN" };
  if (raw === "CONTACTED") return { stage: "CONTACTED", status: "OPEN" };
  if (raw === "CONTACT_REQUESTED") return { stage: "NEW", status: "OPEN" };
  return { stage: "NEW", status: "OPEN" };
}

export async function upsertCrmLead(params: {
  sourceType: "WEBSITE" | "LEGACY" | "CHECKOUT" | "FAN";
  sourceId: number;
  primaryName: string;
  phone?: string | null;
  email?: string | null;
  preferredCentre?: string | null;
  programmeInterest?: string | null;
  statusHint?: string | null;
  convertedStudentId?: number | null;
  convertedFanId?: number | null;
  convertedOrderId?: number | null;
}) {
  try {
    if (!(prisma as any).crmLead) return null;

    const mapped = mapLeadStatusToCrm({ status: params.statusHint || "NEW" });

    const dataBase: any = {
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      primaryName: params.primaryName,
      phone: params.phone || null,
      email: params.email || null,
      preferredCentre: params.preferredCentre || null,
      programmeInterest: params.programmeInterest || null,
      stage: mapped.stage,
      status: mapped.status,
      convertedStudentId: params.convertedStudentId || null,
      convertedFanId: params.convertedFanId || null,
      convertedOrderId: params.convertedOrderId || null,
      updatedAt: new Date(),
    };

    const row = await (prisma as any).crmLead.upsert({
      where: {
        sourceType_sourceId: {
          sourceType: params.sourceType,
          sourceId: params.sourceId,
        },
      },
      create: dataBase,
      update: dataBase,
    });

    return row;
  } catch (error) {
    console.warn("CRM sync skipped:", (error as any)?.message || error);
    return null;
  }
}


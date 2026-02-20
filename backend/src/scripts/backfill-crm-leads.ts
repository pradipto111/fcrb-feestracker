import prisma from "../db/prisma";
import { upsertCrmLead } from "../modules/crm/crm-sync";

async function main() {
  if (!(prisma as any).crmLead) {
    throw new Error("CRM models not available in Prisma client. Run prisma migrate + prisma generate first.");
  }

  const counts: Record<string, number> = { WEBSITE: 0, LEGACY: 0, CHECKOUT: 0, FAN: 0 };

  // Website leads
  const website = (await (prisma as any).websiteLead?.findMany({})) as any[];
  for (const l of website || []) {
    await upsertCrmLead({
      sourceType: "WEBSITE",
      sourceId: l.id,
      primaryName: l.playerName,
      phone: l.phone,
      email: l.email,
      preferredCentre: l.preferredCentre,
      programmeInterest: l.programmeInterest,
      statusHint: l.status,
      convertedStudentId: l.convertedPlayerId || null,
    });
    counts.WEBSITE += 1;
  }

  // Legacy leads
  const legacy = (await (prisma as any).legacyLead?.findMany({})) as any[];
  for (const l of legacy || []) {
    await upsertCrmLead({
      sourceType: "LEGACY",
      sourceId: l.id,
      primaryName: l.name,
      phone: l.phone,
      email: null,
      preferredCentre: null,
      programmeInterest: null,
      statusHint: l.status,
    });
    counts.LEGACY += 1;
  }

  // Checkout leads
  const checkout = (await prisma.checkoutLead.findMany({})) as any[];
  for (const l of checkout || []) {
    await upsertCrmLead({
      sourceType: "CHECKOUT",
      sourceId: l.id,
      primaryName: l.customerName || "Guest",
      phone: l.phone,
      email: l.email,
      preferredCentre: null,
      programmeInterest: null,
      statusHint: l.status,
      convertedOrderId: l.convertedOrderId || null,
    });
    counts.CHECKOUT += 1;
  }

  // Fan conversion leads
  const fan = (await (prisma as any).fanConversionLead?.findMany({
    include: { fan: { select: { fullName: true, phone: true } } },
  })) as any[];
  for (const l of fan || []) {
    await upsertCrmLead({
      sourceType: "FAN",
      sourceId: l.id,
      primaryName: l.fan?.fullName || `Fan#${l.fanId}`,
      phone: l.fan?.phone || null,
      email: null,
      preferredCentre: null,
      programmeInterest: l.programInterest || null,
      statusHint: l.status,
      convertedFanId: l.fanId || null,
    });
    counts.FAN += 1;
  }

  console.log("✅ Backfill completed:", counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Backfill failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });


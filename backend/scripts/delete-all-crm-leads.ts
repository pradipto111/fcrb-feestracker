/**
 * Deletes all CRM leads and related dummy data (activities, tasks, manual sources, import jobs).
 * CrmLead delete cascades to CrmActivity and CrmTask.
 *
 * Run from backend: npx ts-node scripts/delete-all-crm-leads.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const leadCount = await prisma.crmLead.count();
  console.log(`Found ${leadCount} CRM lead(s). Deleting all CRM lead data...\n`);

  // CrmActivity and CrmTask are deleted by DB cascade when we delete CrmLead
  const deletedLeads = await prisma.crmLead.deleteMany({});
  console.log(`  Deleted ${deletedLeads.count} CRM lead(s) (activities & tasks cascaded).`);

  const deletedManual = await prisma.crmManualLeadSource.deleteMany({});
  console.log(`  Deleted ${deletedManual.count} manual lead source(s).`);

  const deletedRows = await prisma.crmImportRow.deleteMany({});
  const deletedJobs = await prisma.crmImportJob.deleteMany({});
  console.log(`  Deleted ${deletedRows.count} import row(s) and ${deletedJobs.count} import job(s).`);

  console.log("\nDone. All CRM leads and related dummy data have been removed.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

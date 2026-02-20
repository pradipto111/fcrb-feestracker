/**
 * Deletes all CRM users and all Coach (admin/coach) login accounts, plus any data
 * that references them (so we can satisfy FK constraints).
 *
 * Run from backend: npx ts-node scripts/delete-crm-and-coach-logins.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const coachCount = await prisma.coach.count();
  const crmUserCount = await prisma.crmUser.count();
  console.log(`Found ${coachCount} coach(es) and ${crmUserCount} CRM user(s). Removing all...\n`);

  // ---- CRM: CrmUser has onDelete SetNull on CrmLead, CrmActivity, CrmTask, CrmImportJob ----
  const deletedCrm = await prisma.crmUser.deleteMany({});
  console.log(`  Deleted ${deletedCrm.count} CRM user(s).`);

  // ---- Coach: delete all data that references Coach (RESTRICT FKs), then Coach ----
  const r1 = await prisma.vote.deleteMany({});
  console.log(`  Deleted ${r1.count} vote(s).`);
  const r2 = await prisma.trainingSessionLoad.deleteMany({});
  console.log(`  Deleted ${r2.count} training session load(s).`);
  const r3 = await prisma.session.deleteMany({});
  console.log(`  Deleted ${r3.count} session(s).`);
  const r4 = await prisma.fixture.deleteMany({});
  console.log(`  Deleted ${r4.count} fixture(s).`);
  const r5 = await prisma.coachCenter.deleteMany({});
  console.log(`  Deleted ${r5.count} coach-center link(s).`);
  const r6 = await prisma.video.deleteMany({});
  console.log(`  Deleted ${r6.count} video(s).`);
  const r7 = await prisma.monthlyFeedback.deleteMany({});
  console.log(`  Deleted ${r7.count} monthly feedback(s).`);
  const r8 = await prisma.scoutingBoardPlayer.deleteMany({});
  const r9 = await prisma.scoutingDecisionLog.deleteMany({});
  const r10 = await prisma.scoutingBoard.deleteMany({});
  console.log(`  Deleted scouting: ${r8.count} board player(s), ${r9.count} decision(s), ${r10.count} board(s).`);
  const r11 = await prisma.developmentBlock.deleteMany({});
  const r12 = await prisma.seasonPhase.deleteMany({});
  const r13 = await prisma.seasonPlan.deleteMany({});
  console.log(`  Deleted season planning: ${r11.count} block(s), ${r12.count} phase(s), ${r13.count} plan(s).`);
  const r14 = await prisma.trialReportValue.deleteMany({});
  const r15 = await prisma.trialReportPositional.deleteMany({});
  const r16 = await prisma.trialReportRevision.deleteMany({});
  const r17 = await prisma.trialReport.deleteMany({});
  console.log(`  Deleted trial reports: ${r14.count} value(s), ${r15.count} positional(s), ${r16.count} revision(s), ${r17.count} report(s).`);
  const r18 = await prisma.trialShortlistItem.deleteMany({});
  const r19 = await prisma.trialShortlist.deleteMany({});
  const r20 = await prisma.trialEventTrialist.deleteMany({});
  const r21 = await prisma.trialEventStaff.deleteMany({});
  const r22 = await prisma.trialDecisionLog.deleteMany({});
  const r23 = await prisma.trialEvent.deleteMany({});
  console.log(`  Deleted trial events: ${r18.count} shortlist item(s), ${r19.count} shortlist(s), ${r20.count} event trialist(s), ${r21.count} staff, ${r22.count} decision(s), ${r23.count} event(s).`);
  const r24 = await prisma.trialMetricTemplateItem.deleteMany({});
  const r25 = await prisma.trialMetricTemplate.deleteMany({});
  console.log(`  Deleted trial templates: ${r24.count} item(s), ${r25.count} template(s).`);
  const r26 = await prisma.clubEvent.deleteMany({});
  console.log(`  Deleted ${r26.count} club event(s).`);

  // Optional: calibration tables (may not exist in schema)
  try {
    await (prisma as any).$executeRawUnsafe(
      'DELETE FROM "CoachScoringProfile"'
    );
    await (prisma as any).$executeRawUnsafe(
      'DELETE FROM "CoachMetricStats"'
    );
    console.log(`  Deleted coach calibration data (if any).`);
  } catch {
    // Tables may not exist
  }

  const deletedCoaches = await prisma.coach.deleteMany({});
  console.log(`  Deleted ${deletedCoaches.count} coach(es).`);

  console.log("\nDone. All CRM and coach login details have been removed.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

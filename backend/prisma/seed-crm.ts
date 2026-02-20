import { PrismaClient, CrmUserRole, CrmUserStatus, CrmLeadSourceType, CrmLeadStage, CrmLeadStatus, CrmActivityType, CrmTaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Sample data arrays
const indianNames = [
  "Rahul Sharma", "Priya Patel", "Arjun Reddy", "Ananya Singh", "Vikram Kumar",
  "Sneha Menon", "Karthik Iyer", "Divya Nair", "Rohan Desai", "Meera Joshi",
  "Aditya Shah", "Kavya Rao", "Siddharth Malhotra", "Riya Gupta", "Varun Agarwal",
  "Ayesha Khan", "Neil Kapoor", "Pooja Verma", "Samarth Jain", "Neha Tiwari",
  "Raj Mehta", "Shreya Bansal", "Aman Chopra", "Tanvi Saxena", "Rishabh Dutta",
  "Isha Chawla", "Harsh Mittal", "Sanjana Kulkarni", "Kunal Bhatia", "Anjali Reddy"
];

const cities = ["Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad"];
const centers = ["3LOK", "Depot 18", "Koramangala", "Whitefield", "Indiranagar", "HSR Layout"];
const programs = ["Under-8", "Under-10", "Under-12", "Under-14", "Under-16", "Under-18", "Senior Team", "Fan Club"];

const activityBodies = [
  "Initial contact made via phone call. Lead showed interest in enrollment.",
  "Follow-up email sent with program details and pricing information.",
  "WhatsApp conversation - answered questions about training schedule.",
  "Met in person at center for facility tour. Very positive interaction.",
  "Proposal sent via email with customized program details.",
  "Lead requested more information about scholarship opportunities.",
  "Discussed payment plans and installment options.",
  "Lead mentioned considering other academies. Need to highlight our unique selling points.",
  "Parent consultation call - discussed child's development goals.",
  "Sent brochure and registration link via WhatsApp."
];

const taskTitles = [
  "Follow up with program details",
  "Schedule center visit",
  "Send pricing information",
  "Answer questions about training schedule",
  "Check on enrollment decision",
  "Provide scholarship information",
  "Arrange trial session",
  "Send registration form",
  "Discuss payment plans",
  "Finalize enrollment"
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPhone(): string {
  return `+91${randomInt(7000000000, 9999999999)}`;
}

function randomEmail(name: string): string {
  const parts = name.toLowerCase().split(" ");
  return `${parts[0]}${randomInt(1, 999)}@example.com`;
}

async function main() {
  console.log("🌱 Seeding CRM database with test data...\n");

  // Step 1: Create CRM Users (Agents)
  console.log("Creating CRM users...");
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const crmUsers = [];
  
  // Create 4 Agents
  const agentNames = ["Priya Sharma", "Arjun Patel", "Ananya Reddy", "Vikram Singh"];
  for (const agentName of agentNames) {
    const agent = await prisma.crmUser.create({
      data: {
        fullName: agentName,
        email: `${agentName.split(" ")[0].toLowerCase()}@fcrb.com`,
        passwordHash,
        role: CrmUserRole.AGENT,
        status: CrmUserStatus.ACTIVE,
      },
    });
    crmUsers.push(agent);
    console.log(`✅ Created Agent: ${agent.fullName} (${agent.email})`);
  }

  // Step 2: Create Manual Lead Sources (for CSV imports)
  console.log("\nCreating manual lead sources...");
  const manualSources = [];
  for (let i = 0; i < 20; i++) {
    const name = randomElement(indianNames);
    const source = await prisma.crmManualLeadSource.create({
      data: {
        primaryName: name,
        phone: randomPhone(),
        email: randomEmail(name),
        preferredCentre: randomElement(centers),
        programmeInterest: randomElement(programs),
      },
    });
    manualSources.push(source);
  }
  console.log(`✅ Created ${manualSources.length} manual lead sources`);

  // Step 3: Create Diverse CRM Leads
  console.log("\nCreating CRM leads...");
  const leads = [];
  const sourceTypes: CrmLeadSourceType[] = ["WEBSITE", "LEGACY", "CHECKOUT", "FAN", "MANUAL"];
  const stages: CrmLeadStage[] = ["NEW", "CONTACTED", "FOLLOW_UP", "WILL_JOIN", "JOINED", "UNINTERESTED_NO_RESPONSE"];
  
  // Create 50 leads with diverse attributes
  for (let i = 0; i < 50; i++) {
    const name = randomElement(indianNames);
    const sourceType = randomElement(sourceTypes);
    let sourceId = i + 1;
    
    // Use manual source IDs for MANUAL type
    if (sourceType === "MANUAL" && i < manualSources.length) {
      sourceId = manualSources[i].id;
    }
    
    const stage = randomElement(stages);
    const status = stage === "JOINED" || stage === "UNINTERESTED_NO_RESPONSE" ? CrmLeadStatus.CLOSED : CrmLeadStatus.OPEN;
    const priority = randomInt(0, 3);
    const score = randomInt(50, 100);
    
    // Assign some leads to agents (about 70%)
    const ownerId = Math.random() > 0.3 ? randomElement(crmUsers).id : null;
    
    // Add some tags
    const tags: string[] = [];
    if (Math.random() > 0.6) tags.push("High Priority");
    if (Math.random() > 0.7) tags.push("Follow-up Needed");
    if (Math.random() > 0.8) tags.push("Scholarship Interest");
    if (priority === 3) tags.push("VIP");
    
    const lead = await prisma.crmLead.create({
      data: {
        sourceType,
        sourceId,
        primaryName: name,
        phone: randomPhone(),
        email: randomEmail(name),
        city: randomElement(cities),
        preferredCentre: randomElement(centers),
        programmeInterest: randomElement(programs),
        stage,
        status,
        priority,
        score,
        ownerId,
        tags,
      },
    });
    leads.push(lead);
  }
  console.log(`✅ Created ${leads.length} CRM leads`);

  // Step 4: Create Activities on Leads
  console.log("\nCreating activities...");
  const activityTypes: CrmActivityType[] = ["NOTE", "CALL", "EMAIL", "WHATSAPP", "MEETING"];
  let activityCount = 0;
  
  // Add 2-5 activities to each lead
  for (const lead of leads) {
    const numActivities = randomInt(2, 5);
    const leadActivities = [];
    
    for (let i = 0; i < numActivities; i++) {
      const activityType = randomElement(activityTypes);
      const createdBy = Math.random() > 0.3 ? randomElement(crmUsers) : null;
      
      // Create activity with timestamp in the past
      const daysAgo = randomInt(0, 30);
      const occurredAt = new Date();
      occurredAt.setDate(occurredAt.getDate() - daysAgo);
      occurredAt.setHours(randomInt(9, 18), randomInt(0, 59), 0, 0);
      
      const activity = await prisma.crmActivity.create({
        data: {
          leadId: lead.id,
          type: activityType,
          occurredAt,
          title: `${activityType} - ${lead.primaryName}`,
          body: randomElement(activityBodies),
          createdByCrmUserId: createdBy?.id || null,
        },
      });
      leadActivities.push(activity);
      activityCount++;
    }
  }
  console.log(`✅ Created ${activityCount} activities`);

  // Step 5: Create Tasks
  console.log("\nCreating tasks...");
  let taskCount = 0;
  
  // Add 1-3 tasks to about 60% of leads
  for (const lead of leads) {
    if (Math.random() > 0.4) {
      const numTasks = randomInt(1, 3);
      
      for (let i = 0; i < numTasks; i++) {
        const assignedTo = Math.random() > 0.4 ? randomElement(crmUsers) : null;
        const daysFromNow = randomInt(1, 14);
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + daysFromNow);
        dueAt.setHours(randomInt(9, 18), 0, 0, 0);
        
        // Some tasks are already done
        const status = Math.random() > 0.6 ? CrmTaskStatus.DONE : CrmTaskStatus.OPEN;
        const completedAt = status === CrmTaskStatus.DONE ? new Date(dueAt.getTime() - randomInt(1, 5) * 24 * 60 * 60 * 1000) : null;
        
        const task = await prisma.crmTask.create({
          data: {
            leadId: lead.id,
            title: randomElement(taskTitles),
            description: `Follow up with ${lead.primaryName} regarding ${lead.programmeInterest} program.`,
            dueAt: status === CrmTaskStatus.OPEN ? dueAt : completedAt,
            status,
            assignedToCrmUserId: assignedTo?.id || null,
          },
        });
        taskCount++;
      }
    }
  }
  console.log(`✅ Created ${taskCount} tasks`);

  // Summary
  console.log("\n📊 CRM Seed Summary:");
  console.log(`   • CRM Users: ${crmUsers.length} Agents`);
  console.log(`   • Manual Lead Sources: ${manualSources.length}`);
  console.log(`   • CRM Leads: ${leads.length}`);
  console.log(`   • Activities: ${activityCount}`);
  console.log(`   • Tasks: ${taskCount}`);
  
  // Distribution stats
  const stageCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};
  for (const lead of leads) {
    stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1;
    sourceCounts[lead.sourceType] = (sourceCounts[lead.sourceType] || 0) + 1;
  }
  
  console.log("\n📈 Lead Distribution:");
  console.log("   By Stage:");
  Object.entries(stageCounts).forEach(([stage, count]) => {
    console.log(`     ${stage}: ${count}`);
  });
  console.log("   By Source:");
  Object.entries(sourceCounts).forEach(([source, count]) => {
    console.log(`     ${source}: ${count}`);
  });
  
  console.log("\n✅ CRM seeding completed!");
  console.log("\n📝 Login Credentials:");
  console.log("   Agent 1: priya@fcrb.com / password123");
  console.log("   Agent 2: arjun@fcrb.com / password123");
  console.log("   Agent 3: ananya@fcrb.com / password123");
  console.log("   Agent 4: vikram@fcrb.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

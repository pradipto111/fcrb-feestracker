import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import { upsertCrmLead } from "../crm/crm-sync";

const router = Router();

// Create legacy lead (public endpoint)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      age,
      heightCmInput,
      weightKgInput,
      heightCmBucket,
      weightKgBucket,
      matchedPlayerId,
      matchedPlayerName,
      matchedPlayerPosition,
      matchedPlayerArchetype,
      matchedPlayerLegacy,
      consent,
    } = req.body;

    // Validate required fields
    if (!name || !phone || !age || !heightCmInput || !weightKgInput || !consent) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate ranges
    if (age < 6 || age > 60) {
      return res.status(400).json({ message: "Age must be between 6 and 60" });
    }
    if (heightCmInput < 140 || heightCmInput > 220) {
      return res.status(400).json({ message: "Height must be between 140 and 220 cm" });
    }
    if (weightKgInput < 35 || weightKgInput > 140) {
      return res.status(400).json({ message: "Weight must be between 35 and 140 kg" });
    }

    // Check if model exists
    if (!(prisma as any).legacyLead) {
      console.error("LegacyLead model not found in Prisma client. Please run: npx prisma generate");
      return res.status(500).json({ 
        message: "Database model not available. Please contact administrator." 
      });
    }

    // Handle archetype - convert array to string if needed
    let archetypeString: string | null = null;
    if (matchedPlayerArchetype) {
      if (Array.isArray(matchedPlayerArchetype)) {
        archetypeString = matchedPlayerArchetype.join(", ");
      } else {
        archetypeString = matchedPlayerArchetype;
      }
    }

    const lead = await (prisma as any).legacyLead.create({
      data: {
        source: "Find Your Legacy",
        name,
        phone,
        age,
        heightCmInput,
        weightKgInput,
        heightCmBucket: heightCmBucket || heightCmInput,
        weightKgBucket: weightKgBucket || weightKgInput,
        matchedPlayerId: matchedPlayerId || null,
        matchedPlayerName: matchedPlayerName || null,
        matchedPlayerPosition: matchedPlayerPosition || null,
        matchedPlayerArchetype: archetypeString,
        matchedPlayerLegacy: matchedPlayerLegacy ? JSON.parse(JSON.stringify(matchedPlayerLegacy)) : null,
        consent,
        status: "NEW",
      },
    });

    await upsertCrmLead({
      sourceType: "LEGACY",
      sourceId: lead.id,
      primaryName: lead.name,
      phone: lead.phone,
      email: null,
      preferredCentre: null,
      programmeInterest: null,
      statusHint: lead.status,
    });

    res.json(lead);
  } catch (error: any) {
    console.error("Error creating legacy lead:", error);
    res.status(500).json({ message: error.message || "Failed to create lead" });
  }
});

// Get all legacy leads (admin only)
router.get("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, fromDate, toDate, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate as string);
      if (toDate) where.createdAt.lte = new Date(toDate as string);
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { phone: { contains: search as string, mode: "insensitive" } },
        { matchedPlayerName: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const leads = await (prisma as any).legacyLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(leads);
  } catch (error: any) {
    console.error("Error fetching legacy leads:", error);
    res.status(500).json({ message: error.message || "Failed to fetch leads" });
  }
});

// Get single legacy lead (admin only)
router.get("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const lead = await (prisma as any).legacyLead.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error: any) {
    console.error("Error fetching legacy lead:", error);
    res.status(500).json({ message: error.message || "Failed to fetch lead" });
  }
});

// Update legacy lead (admin only)
router.put("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, notes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await (prisma as any).legacyLead.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });

    await upsertCrmLead({
      sourceType: "LEGACY",
      sourceId: lead.id,
      primaryName: lead.name,
      phone: lead.phone,
      email: null,
      preferredCentre: null,
      programmeInterest: null,
      statusHint: lead.status,
    });

    res.json(lead);
  } catch (error: any) {
    console.error("Error updating legacy lead:", error);
    res.status(500).json({ message: error.message || "Failed to update lead" });
  }
});

// Export legacy leads as CSV (admin only)
router.get("/export/csv", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate as string);
      if (toDate) where.createdAt.lte = new Date(toDate as string);
    }

    const leads = await (prisma as any).legacyLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "ID",
      "Name",
      "Phone",
      "Age",
      "Height (cm)",
      "Weight (kg)",
      "Matched Player",
      "Position",
      "Archetype",
      "Status",
      "Consent",
      "Created At",
    ];

    const rows = leads.map((lead: any) => [
      lead.id,
      lead.name,
      lead.phone,
      lead.age,
      lead.heightCmInput,
      lead.weightKgInput,
      lead.matchedPlayerName || "",
      lead.matchedPlayerPosition || "",
      lead.matchedPlayerArchetype || "",
      lead.status,
      lead.consent ? "Yes" : "No",
      new Date(lead.createdAt).toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row: any[]) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="legacy_leads.csv"');
    res.send(csv);
  } catch (error: any) {
    console.error("Error exporting legacy leads:", error);
    res.status(500).json({ message: error.message || "Failed to export leads" });
  }
});

export default router;


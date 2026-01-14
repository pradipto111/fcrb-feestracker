import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const router = Router();

// Create website lead (public endpoint)
router.post("/", async (req, res) => {
  try {
    const {
      playerName,
      playerDob,
      ageBracket,
      guardianName,
      phone,
      email,
      preferredCentre,
      programmeInterest,
      playingPosition,
      currentLevel,
      heardFrom,
      notes,
      skillsShowcaseLink,
    } = req.body;

    // Validate required fields
    if (!playerName || !guardianName || !phone || !email || !preferredCentre || !programmeInterest || !currentLevel || !heardFrom) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Try to create lead - will fail if model doesn't exist
    const lead = await (prisma as any).websiteLead.create({
      data: {
        source: "website_join",
        playerName,
        playerDob: playerDob ? new Date(playerDob) : null,
        ageBracket: ageBracket || null,
        guardianName,
        phone,
        email,
        preferredCentre,
        programmeInterest,
        playingPosition: playingPosition || null,
        currentLevel,
        heardFrom,
        notes: notes || null,
        skillsShowcaseLink: skillsShowcaseLink || null,
        status: "NEW",
      },
    });

    res.json(lead);
  } catch (error: any) {
    console.error("Error creating website lead:", error);
    if (error.message && error.message.includes("websiteLead")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_leads_and_shop && npx prisma generate" 
      });
    }
    res.status(500).json({ message: error.message || "Failed to create lead" });
  }
});

// Get all leads (admin only)
router.get("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    // Check if model exists by trying to access it
    if (!(prisma as any).websiteLead) {
      return res.status(500).json({ 
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_leads_and_shop && npx prisma generate" 
      });
    }

    const { status, centre, programme, fromDate, toDate } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (centre) where.preferredCentre = centre;
    if (programme) where.programmeInterest = programme;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate as string);
      if (toDate) where.createdAt.lte = new Date(toDate as string);
    }

    const leads = await (prisma as any).websiteLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(leads);
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    // Check for specific Prisma errors
    if (error.code === "P2001" || error.message?.includes("does not exist") || error.message?.includes("websiteLead")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_leads_and_shop && npx prisma generate" 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch leads" });
  }
});

// Get single lead (admin only)
router.get("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const lead = await (prisma as any).websiteLead.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error: any) {
    console.error("Error fetching lead:", error);
    if (error.message && error.message.includes("websiteLead")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run database migration." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch lead" });
  }
});

// Update lead (admin only)
router.put("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, assignedTo, internalNotes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes || null;

    const lead = await (prisma as any).websiteLead.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });

    res.json(lead);
  } catch (error: any) {
    console.error("Error updating lead:", error);
    if (error.message && error.message.includes("websiteLead")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run database migration." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to update lead" });
  }
});

// Convert lead to player (admin only)
router.post("/:id/convert", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const leadId = parseInt(req.params.id);
    const lead = await (prisma as any).websiteLead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (lead.convertedPlayerId) {
      return res.status(400).json({ message: "Lead already converted" });
    }

    // Find or create center by name
    let center = await prisma.center.findFirst({
      where: { name: { contains: lead.preferredCentre, mode: "insensitive" } },
    });

    if (!center) {
      // Create center if it doesn't exist
      center = await prisma.center.create({
        data: {
          name: lead.preferredCentre,
          location: "Bengaluru",
        },
      });
    }

    // Generate default password: "Name"123
    const defaultPassword = `${lead.playerName}123`;
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Create student from lead
    const student = await prisma.student.create({
      data: {
        fullName: lead.playerName,
        dateOfBirth: lead.playerDob,
        parentName: lead.guardianName,
        parentPhoneNumber: lead.phone,
        email: lead.email,
        centerId: center.id,
        programType: lead.ageBracket || lead.programmeInterest,
        joiningDate: new Date(),
        status: "TRIAL",
        passwordHash: passwordHash,
      },
    });

    // Update lead with converted player ID
    await (prisma as any).websiteLead.update({
      where: { id: leadId },
      data: {
        convertedPlayerId: student.id,
        status: "CONVERTED",
      },
    });

    res.json({ student, lead });
  } catch (error: any) {
    console.error("Error converting lead:", error);
    if (error.message && error.message.includes("websiteLead")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run database migration." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to convert lead" });
  }
});

export default router;


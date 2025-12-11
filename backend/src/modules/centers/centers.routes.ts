import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// PUBLIC: Get active centres for homepage map (no auth required)
router.get("/public", async (req, res) => {
  try {
    // Check if new fields exist, fallback to old fields if migration hasn't run
    const centers = await (prisma as any).center.findMany({
      where: { 
        // Use isActive if it exists, otherwise return all
        ...((prisma.center as any).fields?.isActive ? { isActive: true } : {}),
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        addressLine: true,
        locality: true,
        city: true,
        state: true,
        postalCode: true,
        latitude: true,
        longitude: true,
        googleMapsUrl: true,
        displayOrder: true,
        // Legacy fields fallback
        location: true,
        address: true,
      },
    });
    
    // Sort by displayOrder if available, otherwise by id
    const sortedCenters = centers.sort((a: any, b: any) => {
      if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
        return a.displayOrder - b.displayOrder;
      }
      return a.id - b.id;
    });
    
    // Filter active if isActive field exists
    const activeCenters = sortedCenters.filter((c: any) => {
      if (c.isActive !== undefined) {
        return c.isActive === true;
      }
      return true; // If field doesn't exist, return all
    });
    
    res.json(activeCenters);
  } catch (error: any) {
    console.error("Error fetching public centres:", error);
    // If error is about missing fields, provide helpful message
    if (error.message && error.message.includes("displayOrder") || error.message.includes("isActive")) {
      return res.status(500).json({ 
        message: "Database migration required. Please run: cd backend && npx prisma migrate dev --name add_centre_fields && npx prisma generate"
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch centres" });
  }
});

// List centers (admin sees all, coach sees their assigned centers)
router.get("/", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user!;
    
    if (role === "ADMIN") {
      // Admin sees all centers
      // Fetch without orderBy first to avoid migration errors
      const centers = await (prisma as any).center.findMany();
      // Sort by displayOrder if it exists, otherwise by id
      const sortedCenters = centers.sort((a: any, b: any) => {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        }
        return a.id - b.id;
      });
      return res.json(sortedCenters);
    }
    
    if (role === "COACH") {
      // Coach sees only their assigned centers
      const coachCenters = await prisma.coachCenter.findMany({
        where: { coachId: id },
        include: { center: true },
      });
      const centers = coachCenters.map(cc => cc.center).sort((a: any, b: any) => {
        if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
          return a.displayOrder - b.displayOrder;
        }
        return a.id - b.id;
      });
      return res.json(centers);
    }
    
    res.json([]);
  } catch (error: any) {
    console.error("Error fetching centres:", error);
    res.status(500).json({ message: error.message || "Failed to fetch centres" });
  }
});

// Admin only: create center
router.post("/", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const {
      name,
      shortName,
      addressLine,
      locality,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      googleMapsUrl,
      isActive = true,
      displayOrder = 0,
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    
    // shortName is required only if migration has been run
    // For now, we'll make it optional and generate one if not provided
    const finalShortName = shortName || name.toUpperCase().replace(/\s+/g, "").substring(0, 10);

    // Check if centre already exists
    try {
      // Try to check by shortName first (if field exists)
      const existing = await (prisma as any).center.findUnique({
        where: { shortName: finalShortName.toUpperCase() },
      });
      if (existing) {
        return res.status(400).json({ message: "Centre with this shortName already exists" });
      }
    } catch (err: any) {
      // If shortName field doesn't exist, check by name instead
      const existingByName = await prisma.center.findFirst({
        where: { name },
      });
      if (existingByName) {
        return res.status(400).json({ message: "Centre with this name already exists" });
      }
    }

    // Build data object - start with legacy fields that always exist
    const centerData: any = {
      name,
      location: locality || name, // Fallback to name if locality not provided
      address: addressLine || "",
      city: city || "Bengaluru",
    };

    // Try to add new fields - only include if migration has been run
    // We'll attempt to create with new fields, and if it fails, fall back to legacy only
    const newFields: any = {};
    if (finalShortName) newFields.shortName = finalShortName.toUpperCase();
    if (addressLine) newFields.addressLine = addressLine;
    if (locality) newFields.locality = locality;
    if (state) newFields.state = state;
    if (postalCode) newFields.postalCode = postalCode;
    if (latitude !== undefined && latitude !== null && latitude !== "") {
      newFields.latitude = parseFloat(latitude.toString());
    }
    if (longitude !== undefined && longitude !== null && longitude !== "") {
      newFields.longitude = parseFloat(longitude.toString());
    }
    if (googleMapsUrl) newFields.googleMapsUrl = googleMapsUrl;
    if (isActive !== undefined) newFields.isActive = isActive;
    if (displayOrder !== undefined) newFields.displayOrder = displayOrder;

    // Try to create with new fields first
    try {
      const center = await (prisma as any).center.create({
        data: {
          ...centerData,
          ...newFields,
        },
      });
      
      // Automatically assign ALL coaches to the new center
      const coaches = await prisma.coach.findMany({
        where: { role: "COACH" },
      });
      
      for (const coach of coaches) {
        await prisma.coachCenter.create({
          data: {
            coachId: coach.id,
            centerId: center.id,
          },
        }).catch(() => {
          // Ignore if already exists
        });
      }
      
      return res.status(201).json(center);
    } catch (createError: any) {
      // If creation fails due to missing fields, try with legacy fields only
      if (createError.message && (createError.message.includes("shortName") || 
          createError.message.includes("Unknown argument"))) {
        console.warn("New fields not available, using legacy fields only. Please run migration.");
        
        // Create with legacy fields only
        const center = await prisma.center.create({
          data: centerData,
        });
        
        // Automatically assign ALL coaches to the new center
        const coaches = await prisma.coach.findMany({
          where: { role: "COACH" },
        });
        
        for (const coach of coaches) {
          await prisma.coachCenter.create({
            data: {
              coachId: coach.id,
              centerId: center.id,
            },
          }).catch(() => {
            // Ignore if already exists
          });
        }
        
        return res.status(201).json({
          ...center,
          message: "Centre created with legacy fields. Please run migration to enable full features: npx prisma migrate dev --name add_centre_fields"
        });
      }
      
      // Re-throw if it's a different error
      throw createError;
    }
  } catch (error: any) {
    console.error("Error creating centre:", error);
    res.status(500).json({ message: error.message || "Failed to create centre" });
  }
});

// Admin only: update center
router.put("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const centerId = Number(req.params.id);
    const {
      name,
      shortName,
      addressLine,
      locality,
      city,
      state,
      postalCode,
      latitude,
      longitude,
      googleMapsUrl,
      isActive,
      displayOrder,
    } = req.body;

    // Check if centre exists
    const existing = await prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Centre not found" });
    }

    // If shortName is being changed, check for conflicts (only if field exists)
    if (shortName && existing.shortName && shortName.toUpperCase() !== existing.shortName) {
      try {
        const conflict = await (prisma as any).center.findUnique({
          where: { shortName: shortName.toUpperCase() },
        });
        if (conflict) {
          return res.status(400).json({ message: "Centre with this shortName already exists" });
        }
      } catch (e) {
        // Field doesn't exist, skip check
      }
    }

    // Build update data - start with legacy fields that always exist
    const legacyUpdateData: any = {};
    if (name) legacyUpdateData.name = name;
    if (locality !== undefined) legacyUpdateData.location = locality;
    if (addressLine !== undefined) legacyUpdateData.address = addressLine;
    if (city !== undefined) legacyUpdateData.city = city;

    // Build new fields object
    const newFields: any = {};
    if (shortName) newFields.shortName = shortName.toUpperCase();
    if (addressLine !== undefined) newFields.addressLine = addressLine;
    if (locality !== undefined) newFields.locality = locality;
    if (state !== undefined) newFields.state = state;
    if (postalCode !== undefined) newFields.postalCode = postalCode;
    if (latitude !== undefined && latitude !== null && latitude !== "") {
      newFields.latitude = parseFloat(latitude.toString());
    }
    if (longitude !== undefined && longitude !== null && longitude !== "") {
      newFields.longitude = parseFloat(longitude.toString());
    }
    if (googleMapsUrl !== undefined) newFields.googleMapsUrl = googleMapsUrl;
    if (isActive !== undefined && isActive !== null) {
      newFields.isActive = Boolean(isActive);
    }
    if (displayOrder !== undefined && displayOrder !== null) {
      newFields.displayOrder = Number(displayOrder);
    }

    // Try to update with new fields first
    try {
      const center = await (prisma as any).center.update({
        where: { id: centerId },
        data: {
          ...legacyUpdateData,
          ...newFields,
        },
      });
      return res.json(center);
    } catch (updateError: any) {
      console.error(`[Backend] Update error for centre ${centerId}:`, updateError.message);
      
      // If update fails due to missing fields
      if (updateError.message && (updateError.message.includes("isActive") || 
          updateError.message.includes("shortName") || 
          updateError.message.includes("Unknown argument") ||
          updateError.message.includes("displayOrder"))) {
        
        // If isActive was explicitly requested, return error instead of silently ignoring
        if (typeof isActive === "boolean") {
          console.error(`[Backend] isActive field requested (${isActive}) but not available in database. Migration required.`);
          return res.status(500).json({ 
            message: "Database migration required. The isActive field is not available. Please run: cd backend && npx prisma migrate dev --name add_centre_fields && npx prisma generate. Until then, you can only update name, location, address, and city fields.",
            requiresMigration: true,
            error: updateError.message
          });
        }
        
        console.warn("New fields not available, updating with legacy fields only. Please run migration.");
        
        // Update with legacy fields only (only if isActive wasn't requested)
        const center = await prisma.center.update({
          where: { id: centerId },
          data: legacyUpdateData,
        });
        
        return res.json({
          ...center,
          message: "Centre updated with legacy fields. New fields ignored. Please run migration: npx prisma migrate dev --name add_centre_fields"
        });
      }
      
      // Re-throw if it's a different error
      throw updateError;
    }
  } catch (error: any) {
    console.error("Error updating centre:", error);
    
    // Provide helpful error message if migration is needed
    if (error.message && (error.message.includes("isActive") || 
        error.message.includes("shortName") || 
        error.message.includes("Unknown argument"))) {
      return res.status(500).json({ 
        message: "Database migration required. The isActive field is not available. Please run: cd backend && npx prisma migrate dev --name add_centre_fields && npx prisma generate. Until then, you can only update name, location, address, and city fields."
      });
    }
    
    return res.status(500).json({ message: error.message || "Failed to update centre" });
  }
});

// Admin only: delete center (soft delete by setting isActive = false)
router.delete("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const centerId = Number(req.params.id);

    // Check if centre exists
    const existing = await prisma.center.findUnique({
      where: { id: centerId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Centre not found" });
    }

    // Check if centre has students
    const studentCount = await prisma.student.count({
      where: { centerId },
    });

    if (studentCount > 0) {
      // Soft delete: set isActive = false (if field exists)
      try {
        const center = await (prisma as any).center.update({
          where: { id: centerId },
          data: { isActive: false },
        });
        return res.json({ message: "Centre deactivated (has students)", center });
      } catch (e: any) {
        // If isActive field doesn't exist, can't soft delete
        return res.status(400).json({ 
          message: "Cannot delete centre with students. Please run migration first: npx prisma migrate dev --name add_centre_fields"
        });
      }
    }

    // Hard delete if no students
    await prisma.center.delete({
      where: { id: centerId },
    });

    res.json({ message: "Centre deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting centre:", error);
    res.status(500).json({ message: error.message || "Failed to delete centre" });
  }
});

// Admin only: get center details with stats
router.get("/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  const centerId = Number(req.params.id);
  
  const center = await prisma.center.findUnique({
    where: { id: centerId }
  });
  
  if (!center) {
    return res.status(404).json({ message: "Center not found" });
  }
  
  const students = await prisma.student.findMany({
    where: { centerId }
  });
  
  const payments = await prisma.payment.findMany({
    where: { centerId }
  });
  
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const activeStudents = students.filter(s => s.status === "ACTIVE").length;
  const totalRevenue = students.reduce((sum, s) => sum + s.monthlyFeeAmount, 0);
  
  res.json({
    center,
    students,
    stats: {
      totalStudents: students.length,
      activeStudents,
      trialStudents: students.filter(s => s.status === "TRIAL").length,
      inactiveStudents: students.filter(s => s.status === "INACTIVE").length,
      totalCollected,
      totalPayments: payments.length,
      monthlyRevenuePotential: totalRevenue
    }
  });
});

// Admin only: Get centre monthly metrics
router.get("/:centreId/metrics", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const centreId = Number(req.params.centreId);
    const { from, to } = req.query;

    // Validate centre exists
    const centre = await prisma.center.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    // Build date filter
    const where: any = { centreId };
    if (from && to) {
      const fromDate = new Date(from as string);
      const toDate = new Date(to as string);
      const fromYear = fromDate.getFullYear();
      const fromMonth = fromDate.getMonth() + 1;
      const toYear = toDate.getFullYear();
      const toMonth = toDate.getMonth() + 1;
      
      // Filter by year and month range
      where.AND = [
        {
          OR: [
            { year: { gt: fromYear } },
            {
              year: fromYear,
              month: { gte: fromMonth },
            },
          ],
        },
        {
          OR: [
            { year: { lt: toYear } },
            {
              year: toYear,
              month: { lte: toMonth },
            },
          ],
        },
      ];
    }

    // Use Prisma client - model name is camelCase in generated client
    // Prisma converts PascalCase model names to camelCase
    let metrics: any[] = [];
    try {
      // Check if the model exists in Prisma client
      const prismaClient = prisma as any;
      if (prismaClient.centreMonthlyMetrics && typeof prismaClient.centreMonthlyMetrics.findMany === 'function') {
        metrics = await prismaClient.centreMonthlyMetrics.findMany({
          where,
          orderBy: [
            { year: "asc" },
            { month: "asc" },
          ],
        });
      } else {
        // Model not found - Prisma client needs regeneration
        console.warn("CentreMonthlyMetrics model not found in Prisma client. Please run: npx prisma generate");
        return res.status(503).json({ 
          message: "Database model not available. Please run: cd backend && npx prisma generate && restart server",
          metrics: [] // Return empty array so frontend doesn't crash
        });
      }
    } catch (err: any) {
      console.error("Error fetching centre metrics:", err);
      // If it's a model not found error, return empty array
      if (err.message && (err.message.includes("centreMonthlyMetrics") || err.message.includes("Unknown argument"))) {
        return res.json({ metrics: [] });
      }
      throw err;
    }

    res.json(metrics);
  } catch (error: any) {
    console.error("Error fetching centre metrics:", error);
    res.status(500).json({ message: error.message || "Failed to fetch centre metrics" });
  }
});

// Admin only: Create or update centre monthly metrics
router.post("/:centreId/metrics", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const centreId = Number(req.params.centreId);
    const {
      year,
      month,
      totalPlayers,
      activePlayers,
      churnedPlayers,
      residential,
      nonResidential,
      totalRevenue,
      additionalRevenue,
      netRentalCharges,
      coachingCosts,
      otherExpenses,
    } = req.body;

    // Validate centre exists
    const centre = await prisma.center.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      return res.status(404).json({ message: "Centre not found" });
    }

    // Validate year and month
    if (!year || !month || month < 1 || month > 12) {
      return res.status(400).json({ message: "Valid year and month (1-12) are required" });
    }

    // Calculate net profit
    const revenueTotal = (totalRevenue || 0) + (additionalRevenue || 0);
    const costsTotal = (netRentalCharges || 0) + (coachingCosts || 0) + (otherExpenses || 0);
    const netProfit = revenueTotal - costsTotal;

    // Upsert metrics - check if model exists
    if (!(prisma as any).centreMonthlyMetrics) {
      return res.status(500).json({ 
        message: "CentreMonthlyMetrics model not available. Please run: npx prisma generate && restart server" 
      });
    }

    // Upsert metrics
    const metrics = await (prisma as any).centreMonthlyMetrics.upsert({
      where: {
        centreId_year_month: {
          centreId,
          year: Number(year),
          month: Number(month),
        },
      },
      update: {
        totalPlayers: totalPlayers !== undefined ? Number(totalPlayers) : null,
        activePlayers: activePlayers !== undefined ? Number(activePlayers) : null,
        churnedPlayers: churnedPlayers !== undefined ? Number(churnedPlayers) : null,
        residential: residential !== undefined ? Number(residential) : null,
        nonResidential: nonResidential !== undefined ? Number(nonResidential) : null,
        totalRevenue: totalRevenue !== undefined ? Number(totalRevenue) : null,
        additionalRevenue: additionalRevenue !== undefined ? Number(additionalRevenue) : null,
        netRentalCharges: netRentalCharges !== undefined ? Number(netRentalCharges) : null,
        coachingCosts: coachingCosts !== undefined ? Number(coachingCosts) : null,
        otherExpenses: otherExpenses !== undefined ? Number(otherExpenses) : null,
        netProfit: netProfit !== null && !isNaN(netProfit) ? netProfit : null,
      },
      create: {
        centreId,
        year: Number(year),
        month: Number(month),
        totalPlayers: totalPlayers !== undefined ? Number(totalPlayers) : null,
        activePlayers: activePlayers !== undefined ? Number(activePlayers) : null,
        churnedPlayers: churnedPlayers !== undefined ? Number(churnedPlayers) : null,
        residential: residential !== undefined ? Number(residential) : null,
        nonResidential: nonResidential !== undefined ? Number(nonResidential) : null,
        totalRevenue: totalRevenue !== undefined ? Number(totalRevenue) : null,
        additionalRevenue: additionalRevenue !== undefined ? Number(additionalRevenue) : null,
        netRentalCharges: netRentalCharges !== undefined ? Number(netRentalCharges) : null,
        coachingCosts: coachingCosts !== undefined ? Number(coachingCosts) : null,
        otherExpenses: otherExpenses !== undefined ? Number(otherExpenses) : null,
        netProfit: netProfit !== null && !isNaN(netProfit) ? netProfit : null,
      },
    });

    res.json(metrics);
  } catch (error: any) {
    console.error("Error saving centre metrics:", error);
    res.status(500).json({ message: error.message || "Failed to save centre metrics" });
  }
});

export default router;


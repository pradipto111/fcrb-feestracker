import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

// Get footer configuration (public endpoint)
router.get("/", async (req, res) => {
  try {
    const sections = await prisma.footerConfig.findMany({
      where: { isActive: true },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    res.json(sections);
  } catch (error: any) {
    console.error("Error fetching footer config:", error);
    res.status(500).json({ message: "Failed to fetch footer configuration" });
  }
});

// Get footer configuration for admin (includes inactive)
router.get("/admin", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const sections = await prisma.footerConfig.findMany({
      include: {
        links: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    res.json(sections);
  } catch (error: any) {
    console.error("Error fetching footer config:", error);
    res.status(500).json({ message: "Failed to fetch footer configuration" });
  }
});

// Create or update footer configuration (admin only)
router.post("/admin", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: "Sections must be an array" });
    }

    // Delete all existing sections and links (cascade will handle links)
    await prisma.footerLink.deleteMany({});
    await prisma.footerConfig.deleteMany({});

    // Create new sections with links
    const createdSections = await Promise.all(
      sections.map(async (section: any) => {
        const { links, ...sectionData } = section;
        const createdSection = await prisma.footerConfig.create({
          data: {
            ...sectionData,
            links: {
              create: links || [],
            },
          },
          include: {
            links: true,
          },
        });
        return createdSection;
      })
    );

    res.json(createdSections);
  } catch (error: any) {
    console.error("Error saving footer config:", error);
    res.status(500).json({ message: "Failed to save footer configuration" });
  }
});

// Create a new footer section (admin only)
router.post("/admin/sections", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { sectionTitle, displayOrder, isActive, links } = req.body;

    if (!sectionTitle) {
      return res.status(400).json({ message: "Section title is required" });
    }

    const section = await prisma.footerConfig.create({
      data: {
        sectionTitle,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        links: {
          create: links || [],
        },
      },
      include: {
        links: true,
      },
    });

    res.json(section);
  } catch (error: any) {
    console.error("Error creating footer section:", error);
    res.status(500).json({ message: "Failed to create footer section" });
  }
});

// Update a footer section (admin only)
router.put("/admin/sections/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const { sectionTitle, displayOrder, isActive, links } = req.body;

    // Update section
    const section = await prisma.footerConfig.update({
      where: { id: parseInt(id) },
      data: {
        ...(sectionTitle !== undefined && { sectionTitle }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Update links if provided
    if (links && Array.isArray(links)) {
      // Delete existing links
      await prisma.footerLink.deleteMany({
        where: { footerConfigId: parseInt(id) },
      });

      // Create new links
      await prisma.footerLink.createMany({
        data: links.map((link: any) => ({
          ...link,
          footerConfigId: parseInt(id),
        })),
      });
    }

    const updatedSection = await prisma.footerConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        links: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    res.json(updatedSection);
  } catch (error: any) {
    console.error("Error updating footer section:", error);
    res.status(500).json({ message: "Failed to update footer section" });
  }
});

// Delete a footer section (admin only)
router.delete("/admin/sections/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.footerConfig.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Footer section deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting footer section:", error);
    res.status(500).json({ message: "Failed to delete footer section" });
  }
});

export default router;

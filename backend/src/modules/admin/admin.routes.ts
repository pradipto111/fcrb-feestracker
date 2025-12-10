import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const prisma = new PrismaClient();
const router = Router();

// All routes require admin authentication
router.use(authRequired);
router.use(requireRole("ADMIN"));

// Get all products (admin - includes inactive)
router.get("/merch", async (req, res) => {
  try {
    // Check if model exists
    if (!(prisma as any).product) {
      return res.status(500).json({ 
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_merchandise_fields && npx prisma generate" 
      });
    }

    const { category, search } = req.query;
    const where: any = {};
    
    if (category) {
      where.category = category as string;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const products = await (prisma as any).product.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    res.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    if (error.code === "P2001" || error.message?.includes("does not exist") || error.message?.includes("product")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_merchandise_fields && npx prisma generate" 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch products" });
  }
});

// Get single product by ID (admin)
router.get("/merch/:id", async (req, res) => {
  try {
    const product = await (prisma as any).product?.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: error.message || "Failed to fetch product" });
  }
});

// Create new product
router.post("/merch", async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      images,
      price,
      currency,
      sizes,
      variants,
      stock,
      category,
      tags,
      displayOrder,
      isActive,
    } = req.body;

    // Validation
    if (!name || !slug || !price) {
      return res.status(400).json({ message: "Name, slug, and price are required" });
    }

    if (!images || images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    // Check if slug already exists
    const existing = await (prisma as any).product?.findUnique({
      where: { slug },
    });

    if (existing) {
      return res.status(400).json({ message: "Product with this slug already exists" });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ message: "Slug must contain only lowercase letters, numbers, and hyphens" });
    }

    const product = await (prisma as any).product?.create({
      data: {
        name,
        slug,
        description: description || null,
        images: images || [],
        price: Math.round(price * 100), // Convert to paise
        currency: currency || "INR",
        sizes: sizes || [],
        variants: variants || null,
        stock: stock !== undefined ? stock : null,
        category: category || null,
        tags: tags || [],
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: error.message || "Failed to create product" });
  }
});

// Update product
router.put("/merch/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      images,
      price,
      currency,
      sizes,
      variants,
      stock,
      category,
      tags,
      displayOrder,
      isActive,
    } = req.body;

    // Check if product exists
    const existing = await (prisma as any).product?.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If slug is being changed, check if new slug exists
    if (slug && slug !== existing.slug) {
      const slugExists = await (prisma as any).product?.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return res.status(400).json({ message: "Product with this slug already exists" });
      }

      // Validate slug format
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({ message: "Slug must contain only lowercase letters, numbers, and hyphens" });
      }
    }

    // Validate images if provided
    if (images !== undefined && (!Array.isArray(images) || images.length === 0)) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description || null;
    if (images !== undefined) updateData.images = images;
    if (price !== undefined) updateData.price = Math.round(price * 100); // Convert to paise
    if (currency !== undefined) updateData.currency = currency;
    if (sizes !== undefined) updateData.sizes = sizes;
    if (variants !== undefined) updateData.variants = variants || null;
    if (stock !== undefined) updateData.stock = stock !== null ? stock : null;
    if (category !== undefined) updateData.category = category || null;
    if (tags !== undefined) updateData.tags = tags;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await (prisma as any).product?.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(product);
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message || "Failed to update product" });
  }
});

// Delete product (soft delete by setting isActive to false, or hard delete if no orders)
router.delete("/merch/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await (prisma as any).product?.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If product has orders, soft delete (set isActive to false)
    if (product.orderItems && product.orderItems.length > 0) {
      await (prisma as any).product?.update({
        where: { id: parseInt(id) },
        data: { isActive: false },
      });
      return res.json({ message: "Product deactivated (has existing orders)", product });
    }

    // Otherwise, hard delete
    await (prisma as any).product?.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message || "Failed to delete product" });
  }
});

// Get product categories (for filter dropdowns)
router.get("/merch/categories", async (req, res) => {
  try {
    const products = await (prisma as any).product?.findMany({
      select: { category: true },
      distinct: ["category"],
    }) || [];

    const categories = products
      .map((p: any) => p.category)
      .filter((c: string | null) => c !== null)
      .sort();

    res.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: error.message || "Failed to fetch categories" });
  }
});

export default router;


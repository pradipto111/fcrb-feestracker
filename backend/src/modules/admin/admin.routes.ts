import { Router } from "express";
import prisma from "../../db/prisma";
import { authRequired, requireRole } from "../../auth/auth.middleware";

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

// Get shop analytics
router.get("/shop/analytics", async (req, res) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    
    // Date range filter
    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    // Get total orders count
    const totalOrders = await (prisma as any).order?.count({
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
    }) || 0;

    // Get orders by status
    const ordersByStatus = await (prisma as any).order?.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
    }) || [];

    const statusCounts: Record<string, number> = {};
    ordersByStatus.forEach((group: any) => {
      statusCounts[group.status] = group._count._all;
    });

    // Get revenue (only from PAID orders)
    const paidOrders = await (prisma as any).order?.findMany({
      where: {
        status: 'PAID',
        ...(dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}),
      },
      select: { total: true },
    }) || [];

    const totalRevenue = paidOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Get average order value
    const avgOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // Get pending revenue (PENDING_PAYMENT orders)
    const pendingOrders = await (prisma as any).order?.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        ...(dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}),
      },
      select: { total: true },
    }) || [];

    const pendingRevenue = pendingOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Get top selling products
    const orderItems = await (prisma as any).orderItem?.findMany({
      where: {
        order: {
          status: 'PAID',
          ...(dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {}),
        },
      },
      select: {
        productId: true,
        productName: true,
        quantity: true,
        totalPrice: true,
      },
    }) || [];

    const productStats: Record<number, { name: string; quantity: number; revenue: number }> = {};
    orderItems.forEach((item: any) => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productStats[item.productId].quantity += item.quantity;
      productStats[item.productId].revenue += item.totalPrice;
    });

    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({ productId: Number(id), ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get recent orders
    const recentOrders = await (prisma as any).order?.findMany({
      where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        orderNumber: true,
        customerName: true,
        email: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }) || [];

    // Get orders over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ordersOverTime = await (prisma as any).order?.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        total: true,
        status: true,
      },
    }) || [];

    // Group by day
    const dailyStats: Record<string, { orders: number; revenue: number }> = {};
    ordersOverTime.forEach((order: any) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { orders: 0, revenue: 0 };
      }
      dailyStats[date].orders += 1;
      if (order.status === 'PAID') {
        dailyStats[date].revenue += order.total;
      }
    });

    const ordersTimeseries = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalOrders,
      totalRevenue,
      pendingRevenue,
      avgOrderValue,
      ordersByStatus: statusCounts,
      topProducts,
      recentOrders,
      ordersTimeseries,
    });
  } catch (error: any) {
    console.error("Error fetching shop analytics:", error);
    res.status(500).json({ message: error.message || "Failed to fetch shop analytics" });
  }
});

// Get all orders (admin)
router.get("/orders", async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    const where: any = {};
    if (status) where.status = status;

    const orders = await (prisma as any).order?.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit as string) : 100,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }) || [];

    res.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: error.message || "Failed to fetch orders" });
  }
});

// Update order status
router.patch("/orders/:orderNumber/status", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ['PENDING_PAYMENT', 'PAID', 'FAILED', 'CANCELLED', 'SHIPPED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await (prisma as any).order?.update({
      where: { orderNumber },
      data: { status, updatedAt: new Date() },
    });

    res.json(order);
  } catch (error: any) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: error.message || "Failed to update order status" });
  }
});

export default router;


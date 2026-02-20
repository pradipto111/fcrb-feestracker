import { Router } from "express";
import prisma from "../../db/prisma";
import crypto from "crypto";
import { upsertCrmLead } from "../crm/crm-sync";
import { authRequired, requireRole } from "../../auth/auth.middleware";

const router = Router();

// Get all active products
router.get("/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    });
    res.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    if (error.message && error.message.includes("product")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_leads_and_shop && npx prisma generate" 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch products" });
  }
});

// Get single product by slug
router.get("/products/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error: any) {
    console.error("Error fetching product:", error);
    if (error.message && error.message.includes("product")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run database migration." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch product" });
  }
});

// Create Razorpay order
router.post("/orders/create", async (req, res) => {
  // Declare variables outside try block so they're accessible in catch
  let items, customerName, phone, email, shippingAddress, subtotal, shippingFee, total;
  
  try {
    ({ items, customerName, phone, email, shippingAddress } = req.body);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // Calculate totals
    subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Handle both numeric IDs (database products) and string IDs (local products)
      let product;
      let unitPrice: number;
      let productName: string;
      let productId: number | null = null;

      if (typeof item.productId === 'number') {
        // Try to find in database by numeric ID
        product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
      } else {
        // Try to find in database by slug (string ID)
        product = await prisma.product.findUnique({
          where: { slug: item.productId },
        });
      }

      if (product) {
        // Product exists in database - use database values
        if (!product.isActive) {
          // Save checkout lead before returning error
          try {
            const checkoutLead = await prisma.checkoutLead.create({
              data: {
                customerName: customerName || "Guest",
                phone: phone || "",
                email: email || "",
                shippingAddress: shippingAddress || {},
                items: items || [],
                subtotal: 0,
                shippingFee: 5000,
                total: 5000,
                errorMessage: `Product ${item.productId} is inactive.`,
                status: "NEW",
              },
            });
            await upsertCrmLead({
              sourceType: "CHECKOUT",
              sourceId: checkoutLead.id,
              primaryName: checkoutLead.customerName || "Guest",
              phone: checkoutLead.phone,
              email: checkoutLead.email,
              preferredCentre: null,
              programmeInterest: null,
              statusHint: checkoutLead.status,
              convertedOrderId: checkoutLead.convertedOrderId || null,
            });
          } catch (leadError: any) {
            console.error("Failed to save checkout lead:", leadError);
          }
          return res.status(400).json({ message: `Product ${item.productId} is inactive` });
        }
        productId = product.id;
        unitPrice = product.price;
        productName = product.name;
      } else {
        // Product not in database - this is a local product (frontend-only)
        // Use the item data directly from the request
        // The frontend should send productName and unitPrice for local products
        if (!item.productName || !item.unitPrice) {
          // Save checkout lead before returning error
          try {
            const checkoutLead = await prisma.checkoutLead.create({
              data: {
                customerName: customerName || "Guest",
                phone: phone || "",
                email: email || "",
                shippingAddress: shippingAddress || {},
                items: items || [],
                subtotal: 0,
                shippingFee: 5000,
                total: 5000,
                errorMessage: `Product ${item.productId} not found and missing product details.`,
                status: "NEW",
              },
            });
            await upsertCrmLead({
              sourceType: "CHECKOUT",
              sourceId: checkoutLead.id,
              primaryName: checkoutLead.customerName || "Guest",
              phone: checkoutLead.phone,
              email: checkoutLead.email,
              preferredCentre: null,
              programmeInterest: null,
              statusHint: checkoutLead.status,
              convertedOrderId: checkoutLead.convertedOrderId || null,
            });
          } catch (leadError: any) {
            console.error("Failed to save checkout lead:", leadError);
          }
          return res.status(400).json({ 
            message: `Product ${item.productId} not found. Please ensure product details are included.` 
          });
        }
        // Use provided values for local products
        productId = null; // Local products don't have database IDs
        unitPrice = item.unitPrice;
        productName = item.productName;
      }

      const quantity = item.quantity || 1;
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      orderItems.push({
        productId: productId || null, // null for local products (frontend-only)
        productName: productName,
        variant: item.variant || null,
        size: item.size || null,
        quantity,
        unitPrice,
        totalPrice: lineTotal,
      });
    }

    shippingFee = 5000; // ₹50.00 in paise (flat rate)
    total = subtotal + shippingFee;

    // Generate order number
    const orderNumber = `FCRB-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        subtotal,
        shippingFee,
        total,
        customerName: customerName || "Guest",
        phone: phone || "",
        email: email || "",
        shippingAddress: shippingAddress || {},
        status: "PENDING_PAYMENT",
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create Razorpay order (if keys are configured)
    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      try {
        const razorpay = require("razorpay");
        const razorpayInstance = new razorpay({
          key_id: RAZORPAY_KEY_ID,
          key_secret: RAZORPAY_KEY_SECRET,
        });

        const razorpayOrder = await razorpayInstance.orders.create({
          amount: total, // Amount in paise
          currency: "INR",
          receipt: orderNumber,
          notes: {
            orderId: order.id.toString(),
            customerName,
            email,
          },
        });

        res.json({
          order,
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: RAZORPAY_KEY_ID,
        });
      } catch (razorpayError: any) {
        console.error("Razorpay error:", razorpayError);
        // Return order even if Razorpay fails
        res.json({
          order,
          razorpayOrderId: null,
          razorpayKeyId: null,
          error: "Payment gateway not available",
        });
      }
    } else {
      // Test mode - return order without Razorpay
      res.json({
        order,
        razorpayOrderId: null,
        razorpayKeyId: null,
        testMode: true,
      });
    }
  } catch (error: any) {
    console.error("Error creating order:", error);
    
    // Save checkout lead even if order creation fails
    try {
      const checkoutLead = await prisma.checkoutLead.create({
        data: {
          customerName: customerName || "Guest",
          phone: phone || "",
          email: email || "",
          shippingAddress: shippingAddress || {},
          items: items || [],
          subtotal: subtotal || 0,
          shippingFee: shippingFee || 5000,
          total: total || ((subtotal || 0) + (shippingFee || 5000)),
          errorMessage: error.message || "Failed to create order",
          status: "NEW",
        },
      });
      await upsertCrmLead({
        sourceType: "CHECKOUT",
        sourceId: checkoutLead.id,
        primaryName: checkoutLead.customerName || "Guest",
        phone: checkoutLead.phone,
        email: checkoutLead.email,
        preferredCentre: null,
        programmeInterest: null,
        statusHint: checkoutLead.status,
        convertedOrderId: checkoutLead.convertedOrderId || null,
      });
    } catch (leadError: any) {
      console.error("Failed to save checkout lead:", leadError);
    }
    
    res.status(500).json({ message: error.message || "Failed to create order" });
  }
});

// Verify payment and update order
router.post("/orders/:orderId/verify", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId, signature, razorpayOrderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify Razorpay signature (if payment data provided)
    if (paymentId && signature && razorpayOrderId) {
      const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
      if (RAZORPAY_KEY_SECRET) {
        const text = `${razorpayOrderId}|${paymentId}`;
        const generatedSignature = crypto
          .createHmac("sha256", RAZORPAY_KEY_SECRET)
          .update(text)
          .digest("hex");

        if (generatedSignature !== signature) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "FAILED",
              paymentData: { error: "Invalid signature" },
            },
          });
          return res.status(400).json({ message: "Invalid payment signature" });
        }
      }
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: paymentId ? "PAID" : "FAILED",
        paymentProvider: "razorpay",
        paymentReference: paymentId || null,
        paymentData: {
          paymentId,
          razorpayOrderId,
          signature,
          verifiedAt: new Date().toISOString(),
        },
      },
    });

    res.json({ order: updatedOrder, success: true });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    if (error.message && error.message.includes("order")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run database migration." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to verify payment" });
  }
});

// Get order by order number (for confirmation page)
router.get("/orders/:orderNumber", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error: any) {
    console.error("Error fetching order:", error);
    if (error.message && error.message.includes("order")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run database migration." 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch order" });
  }
});

// Get checkout leads (admin only)
router.get("/checkout-leads", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate as string);
      if (toDate) where.createdAt.lte = new Date(toDate as string);
    }

    const leads = await prisma.checkoutLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(leads);
  } catch (error: any) {
    console.error("Error fetching checkout leads:", error);
    if (error.code === "P2001" || error.message?.includes("does not exist") || error.message?.includes("checkoutLead")) {
      return res.status(500).json({ 
        message: "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_checkout_leads && npx prisma generate" 
      });
    }
    res.status(500).json({ message: error.message || "Failed to fetch checkout leads" });
  }
});

// Get single checkout lead (admin only)
router.get("/checkout-leads/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const lead = await prisma.checkoutLead.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!lead) {
      return res.status(404).json({ message: "Checkout lead not found" });
    }

    res.json(lead);
  } catch (error: any) {
    console.error("Error fetching checkout lead:", error);
    res.status(500).json({ message: error.message || "Failed to fetch checkout lead" });
  }
});

// Update checkout lead (admin only)
router.put("/checkout-leads/:id", authRequired, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, assignedTo, internalNotes } = req.body;

    const lead = await prisma.checkoutLead.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(internalNotes !== undefined && { internalNotes }),
      },
    });

    await upsertCrmLead({
      sourceType: "CHECKOUT",
      sourceId: lead.id,
      primaryName: lead.customerName || "Guest",
      phone: lead.phone,
      email: lead.email,
      preferredCentre: null,
      programmeInterest: null,
      statusHint: lead.status,
      convertedOrderId: lead.convertedOrderId || null,
    });

    res.json(lead);
  } catch (error: any) {
    console.error("Error updating checkout lead:", error);
    res.status(500).json({ message: error.message || "Failed to update checkout lead" });
  }
});

export default router;


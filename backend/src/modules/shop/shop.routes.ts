import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const router = Router();

// Get all active products
router.get("/products", async (req, res) => {
  try {
    const products = await (prisma as any).product?.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
    }) || [];
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
    const product = await (prisma as any).product?.findUnique({
      where: { slug: req.params.slug },
    });

    if (!product) {
      return res.status(500).json({ 
        message: "Database model not available. Please run database migration." 
      });
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
  try {
    const { items, customerName, phone, email, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await (prisma as any).product?.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found. Database may need migration.` });
      }
      
      if (!product.isActive) {
        return res.status(400).json({ message: `Product ${item.productId} is inactive` });
      }

      const unitPrice = product.price;
      const quantity = item.quantity || 1;
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        variant: item.variant || null,
        size: item.size || null,
        quantity,
        unitPrice,
        totalPrice: lineTotal,
      });
    }

    const shippingFee = 5000; // ₹50.00 in paise (flat rate)
    const total = subtotal + shippingFee;

    // Generate order number
    const orderNumber = `FCRB-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Create order in database
    const order = await (prisma as any).order?.create({
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
    res.status(500).json({ message: error.message || "Failed to create order" });
  }
});

// Verify payment and update order
router.post("/orders/:orderId/verify", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId, signature, razorpayOrderId } = req.body;

    const order = await (prisma as any).order?.findUnique({
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
          await (prisma as any).order?.update({
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
    const updatedOrder = await (prisma as any).order?.update({
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
    const order = await (prisma as any).order?.findUnique({
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

export default router;


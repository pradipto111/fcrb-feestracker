import prisma from "../../db/prisma";

export async function seedProducts() {
  if (!prisma.product) {
    console.warn("⚠️  Product model not available in Prisma client");
    return;
  }
  
  const products = [
    {
      name: "FC Real Bengaluru Home Jersey 24/25",
      slug: "home-jersey-24-25",
      description: "Official home match jersey with club crest. Made from premium breathable fabric designed for performance.",
      images: ["/photo1.png"], // Using existing assets as placeholders
      price: 149900, // ₹1,499.00 in paise
      sizes: ["S", "M", "L", "XL"],
      isActive: true,
    },
    {
      name: "FC Real Bengaluru Training Tee – F-Series",
      slug: "training-tee-f-series",
      description: "Lightweight training tee designed for daily sessions. Moisture-wicking fabric keeps you comfortable during intense workouts.",
      images: ["/photo2.png"],
      price: 89900, // ₹899.00 in paise
      sizes: ["S", "M", "L", "XL"],
      isActive: true,
    },
    {
      name: "FC Real Bengaluru Cap",
      slug: "club-cap",
      description: "Adjustable club cap with embroidered crest. Perfect for training sessions and matchdays.",
      images: ["/photo3.png"],
      price: 59900, // ₹599.00 in paise
      sizes: ["Free Size"],
      isActive: true,
    },
    {
      name: "FC Real Bengaluru Hoodie",
      slug: "club-hoodie",
      description: "Warm hoodie for cool evening sessions and matchdays. Features club branding and comfortable fit.",
      images: ["/photo1.png"],
      price: 199900, // ₹1,999.00 in paise
      sizes: ["S", "M", "L", "XL"],
      isActive: true,
    },
    {
      name: "FC Real Bengaluru Training Shorts",
      slug: "training-shorts",
      description: "Performance training shorts with moisture-wicking technology. Ideal for practice sessions.",
      images: ["/photo2.png"],
      price: 79900, // ₹799.00 in paise
      sizes: ["S", "M", "L", "XL"],
      isActive: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("✅ Products seeded successfully");
}



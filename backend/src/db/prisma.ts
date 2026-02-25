/**
 * Centralized Prisma Client Instance
 * 
 * CRITICAL: Always import from this file instead of creating new PrismaClient instances.
 * Creating multiple instances causes connection pool exhaustion and timeouts.
 */

import { PrismaClient } from "@prisma/client";

// Parse DATABASE_URL to add connection pool parameters if not present
function getDatabaseUrlWithPool(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // If connection pool params already exist, return as-is
  if (dbUrl.includes("?") && (dbUrl.includes("connection_limit") || dbUrl.includes("pool_timeout"))) {
    return dbUrl;
  }

  // Add connection pool + connect_timeout (fail fast on Render if DB is unreachable/slow)
  const separator = dbUrl.includes("?") ? "&" : "?";
  return `${dbUrl}${separator}connection_limit=10&pool_timeout=20&connect_timeout=10`;
}

// Create a single shared instance with optimized connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn", "query"] : ["error"],
  errorFormat: "pretty",
  datasources: {
    db: {
      url: getDatabaseUrlWithPool(),
    },
  },
});

// Test database connection on startup
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection established");
    
    // Run a simple query to verify connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Connection test timeout after 5s")), 5000)
    );
    
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeoutPromise
    ]);
    console.log("✅ Database connection verified");
  } catch (error: any) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Please check your DATABASE_URL and ensure the database is running");
    // Don't throw - let the server start and fail on first query
    console.error("⚠️  Server will start but queries may fail until database is available");
  }
}

// Test connection immediately (but don't block if it fails in module load)
testConnection();

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Export the singleton instance
export default prisma;

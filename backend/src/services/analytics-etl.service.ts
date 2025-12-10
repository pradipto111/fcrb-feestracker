/**
 * Analytics ETL Service
 * 
 * Populates analytics views/materialized views from transactional data.
 * This runs periodically (e.g., daily/hourly) to refresh analytics.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Refresh materialized views
 * Call this periodically (e.g., via cron job or scheduled task)
 */
export async function refreshAnalyticsViews() {
  try {
    // Refresh the centre daily summary materialized view
    await prisma.$executeRawUnsafe(`
      REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_centre_daily_summary;
    `);
    console.log("✅ Refreshed analytics_centre_daily_summary");
  } catch (error: any) {
    console.error("❌ Error refreshing analytics views:", error);
    throw error;
  }
}

/**
 * Initialize analytics views (run once on setup)
 */
export async function initializeAnalyticsViews() {
  try {
    // The SQL migration should have created the views
    // This function can verify they exist and create them if needed
    const viewsExist = await prisma.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'analytics_dim_centre'
      );
    `);
    
    if (!viewsExist) {
      console.warn("⚠️  Analytics views not found. Please run the SQL migration.");
      return false;
    }
    
    console.log("✅ Analytics views initialized");
    return true;
  } catch (error: any) {
    console.error("❌ Error initializing analytics views:", error);
    return false;
  }
}


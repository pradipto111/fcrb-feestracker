# Analytics Layer Setup Guide

This document explains how to set up and use the analytics layer for RealVerse.

## Overview

The analytics layer provides:
- **Centre-wise analytics dashboards** for each academy centre
- **Global/club-wide analytics** on the homepage and dedicated Analytics page
- **Read-only analytics views** that don't modify transactional data
- **Performance-optimized queries** using views and materialized views

## Architecture

### 1. SQL Views (Read-Only)

Analytics views are created in PostgreSQL that read from existing transactional tables:

- `analytics_dim_centre` - Centre dimension
- `analytics_dim_player` - Player dimension  
- `analytics_dim_coach` - Coach dimension
- `analytics_dim_program` - Program dimension
- `analytics_dim_date` - Date dimension helper
- `analytics_fact_sessions` - Session facts
- `analytics_fact_attendance` - Attendance facts
- `analytics_fact_payments` - Payment facts
- `analytics_fact_trials` - Trial/Lead facts
- `analytics_fact_matches` - Match facts

### 2. Materialized View

- `analytics_centre_daily_summary` - Pre-aggregated daily metrics per centre

This materialized view should be refreshed periodically (daily/hourly) for performance.

### 3. Backend Services

- `analytics.service.ts` - Service layer for analytics queries
- `analytics-etl.service.ts` - ETL service for refreshing materialized views
- `analytics.routes.ts` - API endpoints for analytics

### 4. Frontend Pages

- `CentreAnalyticsPage.tsx` - Centre-specific analytics dashboard
- `GlobalAnalyticsPage.tsx` - Club-wide analytics overview
- Admin Dashboard - Club Snapshot widget

## Setup Instructions

### Step 1: Run SQL Migration

Execute the SQL migration to create analytics views:

```bash
cd backend
psql -U your_user -d your_database -f prisma/migrations/create_analytics_views.sql
```

Or if using Prisma migrations:

```bash
cd backend
# Create a new migration
npx prisma migrate dev --name create_analytics_views --create-only

# Then manually add the SQL from create_analytics_views.sql to the migration file
# Or run the SQL directly:
psql $DATABASE_URL -f prisma/migrations/create_analytics_views.sql
```

### Step 2: Refresh Materialized View (Initial)

After creating the views, refresh the materialized view:

```sql
REFRESH MATERIALIZED VIEW analytics_centre_daily_summary;
```

### Step 3: Set Up Periodic Refresh (Optional)

For production, set up a cron job or scheduled task to refresh the materialized view:

```bash
# Example cron job (runs daily at 2 AM)
0 2 * * * psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_centre_daily_summary;"
```

Or use the ETL service in your application:

```typescript
import { refreshAnalyticsViews } from './services/analytics-etl.service';

// Call this periodically (e.g., via cron or scheduled task)
await refreshAnalyticsViews();
```

### Step 4: Verify Setup

1. Check that views exist:
```sql
SELECT table_name FROM information_schema.views 
WHERE table_name LIKE 'analytics_%';
```

2. Test a query:
```sql
SELECT * FROM analytics_dim_centre LIMIT 5;
```

3. Test the API endpoint:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/analytics/overview
```

## API Endpoints

### Global Analytics

- `GET /analytics/overview` - Club-wide summary
- `GET /analytics/centres` - High-level metrics per centre

### Centre-Specific Analytics

- `GET /analytics/centres/:centreId` - Full analytics for a centre
- `GET /analytics/centres/:centreId/attendance-breakdown` - Attendance breakdown
- `GET /analytics/centres/:centreId/payments-breakdown` - Payments breakdown
- `GET /analytics/centres/:centreId/trials-breakdown` - Trials breakdown

All endpoints support query parameters:
- `from` - Start date (ISO string)
- `to` - End date (ISO string)
- `groupBy` - For attendance breakdown: "day", "week", or "month"

## Frontend Routes

- `/realverse/admin/analytics` - Global Analytics page
- `/realverse/admin/centres/:centreId/analytics` - Centre Analytics page

## Metrics Provided

### Centre Metrics

- Active players count
- New players joined
- Players dropped
- Total sessions
- Average sessions per player
- Average attendance rate
- Total revenue
- Outstanding dues
- Collection rate
- Total trials
- Trial conversion rate
- Program breakdown
- Coach load

### Global Metrics

- Total active players (all centres)
- Total centres
- Average club attendance
- Monthly revenue
- Total trials
- Centre comparison charts

## Performance Considerations

1. **Materialized View**: The `analytics_centre_daily_summary` view is materialized for performance. Refresh it periodically.

2. **Indexes**: Indexes are created on `(centre_id, date_key)` for all fact views.

3. **Date Range**: Always filter by date range to limit query scope.

4. **Caching**: Consider caching frequently-accessed analytics (e.g., daily summaries).

## Safety

✅ **Read-Only**: All analytics views are read-only and don't modify transactional data.

✅ **No Breaking Changes**: Analytics layer doesn't modify existing tables or APIs.

✅ **Graceful Degradation**: Frontend handles missing data gracefully.

## Troubleshooting

### Views Not Found

If you get errors about views not existing:
1. Check that the SQL migration ran successfully
2. Verify database connection
3. Check PostgreSQL logs

### Materialized View Out of Date

If data seems stale:
1. Refresh the materialized view manually
2. Check that the refresh cron job is running
3. Verify the refresh function has proper permissions

### Performance Issues

If queries are slow:
1. Ensure indexes are created
2. Refresh materialized view more frequently
3. Limit date ranges in queries
4. Consider adding more specific indexes

## Future Enhancements

- Add more dimension tables (e.g., age groups, competition types)
- Create additional materialized views for common queries
- Add analytics caching layer
- Implement real-time analytics updates
- Add export functionality (CSV/PDF)


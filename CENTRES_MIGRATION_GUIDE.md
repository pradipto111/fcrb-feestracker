# Centres Management System - Migration Guide

This guide explains how to set up the new Centres Management system with homepage map integration.

## Overview

The new system replaces hardcoded centres with a database-driven approach:
- **4 seeded centres** with proper geocoding
- **Homepage map** showing all active centres
- **Admin management** for CRUD operations
- **All students migrated** to 3LOK centre

## Step-by-Step Migration

### 1. Database Migration

Run Prisma migration to add new fields to Center model:

```bash
cd backend
npx prisma migrate dev --name add_centre_fields
npx prisma generate
```

This adds:
- `shortName` (unique identifier)
- `latitude` / `longitude` (for map pins)
- `googleMapsUrl` (direct links)
- `isActive` (visibility control)
- `displayOrder` (sorting)
- `addressLine`, `locality`, `state`, `postalCode` (detailed address)

### 2. Seed Centres

Seed the 4 initial centres:

```bash
cd backend
npx ts-node prisma/seed-centres.ts
```

This creates:
- **3LOK** - 3lok Football Fitness Hub (Seegehalli)
- **DEPOT18** - Depot18 - Sports (Jayamahal)
- **BLITZZ** - Blitzz Sports Arena (Haralur)
- **TRONICCITY** - Tronic City Turf (Parappana Agrahara)

### 3. Migrate Students to 3LOK

Move all existing students to the 3LOK centre:

```bash
cd backend
npx ts-node prisma/migrate-students-to-3lok.ts
```

This ensures:
- All students have a valid `centerId`
- No orphaned students
- Safe migration with validation

### 4. Restart Backend

```bash
cd backend
npm run dev
```

### 5. Restart Frontend

```bash
cd frontend
npm run dev
```

## Verification

### ✅ Homepage Map
1. Visit `http://localhost:5173`
2. Scroll to "Our Centres" section
3. Verify map shows 4 pins
4. Click centre cards to see details
5. Click "View on Google Maps" buttons

### ✅ Admin Centres Management
1. Login as admin
2. Navigate to **Admin → Centres**
3. Verify 4 centres listed
4. Test:
   - Edit a centre
   - Toggle active/inactive
   - Create new centre
   - Delete centre (soft delete if has students)

### ✅ Student Migration
1. Go to **Admin → Players**
2. Verify all students show centre = "3lok Football Fitness Hub"
3. Check no students have null/invalid centreId

## API Endpoints

### Public (No Auth)
- `GET /centers/public` - Get active centres for homepage map

### Admin Only
- `GET /centers` - List all centres
- `GET /centers/:id` - Get centre details
- `POST /centers` - Create new centre
- `PUT /centers/:id` - Update centre
- `DELETE /centers/:id` - Delete centre (soft delete if has students)

## Frontend Routes

- `/realverse/admin/centres` - Centres list (admin)
- `/realverse/admin/centres/new` - Create centre (admin)
- `/realverse/admin/centres/:id/edit` - Edit centre (admin)
- Homepage `/` - "Our Centres" section with map

## Important Notes

1. **Legacy Fields Preserved**: Old `location` and `address` fields are kept for backward compatibility during migration
2. **Soft Delete**: Centres with students are deactivated (isActive=false) instead of deleted
3. **Display Order**: Lower numbers appear first in lists
4. **Short Name**: Must be unique, uppercase, no spaces (e.g., "3LOK", "DEPOT18")
5. **Google Maps**: URLs should be full Google Maps links for "View on Google Maps" buttons

## Troubleshooting

### Map Not Showing
- Check browser console for errors
- Verify centres have `latitude` and `longitude` values
- Ensure `isActive = true` for centres to appear

### Students Not Migrated
- Run migration script again: `npx ts-node prisma/migrate-students-to-3lok.ts`
- Check 3LOK centre exists: `SELECT * FROM "Center" WHERE "shortName" = '3LOK'`
- Verify students table: `SELECT id, "fullName", "centerId" FROM "Student"`

### API Errors
- Ensure Prisma client is regenerated: `npx prisma generate`
- Check backend logs for detailed error messages
- Verify database connection in `.env`

## Next Steps

After migration:
1. ✅ Update centre coordinates if needed (use Google Maps to get exact lat/lng)
2. ✅ Add more centres via admin panel
3. ✅ Customize display order
4. ✅ Remove old hardcoded centre references (already done)

## Support

If you encounter issues:
1. Check backend logs: `cd backend && npm run dev`
2. Check frontend console: Browser DevTools
3. Verify database: `npx prisma studio` (opens Prisma Studio)


# Fix Database Errors - Quick Guide

## Issue 1: Website Leads Error

**Error Message:** "Database model not available. Please run: cd backend && npx prisma migrate dev --name add_leads_and_shop && npx prisma generate"

**Solution:**
```bash
cd backend
npx prisma migrate dev --name add_leads_and_shop
npx prisma generate
```

This creates the `WebsiteLead` table in your database.

## Issue 2: Merchandise 404 Error

**Error:** 404 Page Not Found when accessing Merchandise

**Solution:**
The routes have been added. If you still see 404, make sure:
1. You're logged in as an ADMIN user
2. The backend server is running
3. Run the merchandise migration:

```bash
cd backend
npx prisma migrate dev --name add_merchandise_fields
npx prisma generate
```

## Complete Migration (Run Both)

If you haven't run any migrations yet, run both:

```bash
cd backend

# Migration 1: Website Leads and Shop
npx prisma migrate dev --name add_leads_and_shop
npx prisma generate

# Migration 2: Merchandise fields
npx prisma migrate dev --name add_merchandise_fields
npx prisma generate
```

## After Running Migrations

1. **Restart your backend server** - The Prisma client is generated at build time
2. **Refresh your browser** - Clear cache if needed
3. **Test the pages:**
   - Website Leads: `/realverse/admin/leads`
   - Merchandise: `/realverse/admin/merch`

## Troubleshooting

### If migrations fail:
- Check that your database is running
- Verify `DATABASE_URL` in `backend/.env` is correct
- Check for existing migrations in `backend/prisma/migrations/`

### If you get "migration already exists" error:
- The migration might have been partially applied
- Check `backend/prisma/migrations/` folder
- You can continue with: `npx prisma migrate deploy`

### If models still don't work after migration:
- Make sure you ran `npx prisma generate` after migration
- Restart the backend server completely
- Check backend console for any Prisma errors



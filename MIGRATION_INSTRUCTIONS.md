# Database Migration Instructions

## Fix for "Cannot read properties of undefined" Errors

The errors you're seeing are because the Prisma client hasn't been regenerated after adding new models (`WebsiteLead`, `Product`, `Order`, etc.) to the schema.

## Quick Fix

Run these commands in the `backend` directory:

### On Windows (PowerShell or Command Prompt):
```bash
cd backend
npx prisma migrate dev --name add_leads_and_shop
npx prisma generate
```

### On Mac/Linux:
```bash
cd backend
npx prisma migrate dev --name add_leads_and_shop
npx prisma generate
```

### Or use the provided script:

**Windows:**
```bash
cd backend
.\run-migration.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x run-migration.sh
./run-migration.sh
```

## What This Does

1. **`npx prisma migrate dev`** - Creates a database migration file and applies it to your database
2. **`npx prisma generate`** - Regenerates the Prisma client with the new models

## After Running Migration

1. **Restart your backend server** - The Prisma client is generated at build time, so you need to restart
2. **Test the features:**
   - Try submitting the RealVerse Academy application form
   - Check the Website Leads page in admin dashboard

## If You Still See Errors

1. Make sure your database is running
2. Check that `DATABASE_URL` is correctly set in `backend/.env`
3. Verify the migration was successful by checking `backend/prisma/migrations/` folder
4. Restart the backend server completely

## Troubleshooting

If you get an error about the migration already existing:
- The migration might have been partially applied
- You can reset and reapply: `npx prisma migrate reset` (⚠️ This will delete all data!)
- Or continue with: `npx prisma migrate deploy`



# Migration Commands for Analytics Data

## Step 1: Navigate to Backend Folder
```powershell
cd backend
```

## Step 2: Generate Prisma Client (if needed)
```powershell
npx prisma generate
```

## Step 3: Create Migration File
```powershell
npx prisma migrate dev --name add_analytics_fields_and_relations --create-only
```

## Step 4: Apply Migration (if database is already synced via db push)
Since we used `db push` earlier, the database is already synced. You have two options:

### Option A: Mark migration as applied (if migration file was created)
```powershell
npx prisma migrate resolve --applied add_analytics_fields_and_relations
```

### Option B: Reset and create proper migration (WARNING: This will delete all data)
```powershell
npx prisma migrate reset
npx prisma migrate dev --name add_analytics_fields_and_relations
```

## Step 5: Seed Database with Mock Analytics Data
```powershell
npm run prisma:seed:analytics
```

## Alternative: One-Line Commands from Root Folder

### Full Reset + Migrate + Seed (from root folder)
```powershell
cd backend; npx prisma migrate reset --force; npx prisma migrate dev --name add_analytics_fields_and_relations; npm run prisma:seed:analytics
```

### Just Seed (if migrations already applied)
```powershell
cd backend; npm run prisma:seed:analytics
```

## Current Status
✅ Database schema is synced (via `db push`)
✅ Mock data has been seeded
⚠️ Migration file needs to be created to track changes in version control

## Recommended Approach
Since the database is already synced, create a baseline migration:

```powershell
cd backend
npx prisma migrate dev --name add_analytics_fields_and_relations --create-only
```

Then manually edit the migration file to be empty (since changes are already applied), or use:

```powershell
npx prisma migrate resolve --applied add_analytics_fields_and_relations
```


-- Step 1: Update all MANAGER users to AGENT
UPDATE "CrmUser" SET "role" = 'AGENT' WHERE "role" = 'MANAGER';

-- Step 2: Create new enum with only AGENT (idempotent for re-runs after partial failure)
DO $$ BEGIN
  CREATE TYPE "CrmUserRole_new" AS ENUM ('AGENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 3: Drop default so column type can be changed (PostgreSQL cannot cast default automatically)
ALTER TABLE "CrmUser" ALTER COLUMN "role" DROP DEFAULT;

-- Step 4: Update column to use new enum
ALTER TABLE "CrmUser" ALTER COLUMN "role" TYPE "CrmUserRole_new" USING ("role"::text::"CrmUserRole_new");

-- Step 5: Restore default
ALTER TABLE "CrmUser" ALTER COLUMN "role" SET DEFAULT 'AGENT'::"CrmUserRole_new";

-- Step 6: Drop old enum
DROP TYPE "CrmUserRole";

-- Step 7: Rename new enum to original name
ALTER TYPE "CrmUserRole_new" RENAME TO "CrmUserRole";

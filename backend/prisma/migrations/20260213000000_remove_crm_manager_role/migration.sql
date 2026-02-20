-- Step 1: Update all MANAGER users to AGENT
UPDATE "CrmUser" SET "role" = 'AGENT' WHERE "role" = 'MANAGER';

-- Step 2: Create new enum with only AGENT
CREATE TYPE "CrmUserRole_new" AS ENUM ('AGENT');

-- Step 3: Update column to use new enum
ALTER TABLE "CrmUser" ALTER COLUMN "role" TYPE "CrmUserRole_new" USING ("role"::text::"CrmUserRole_new");

-- Step 4: Drop old enum
DROP TYPE "CrmUserRole";

-- Step 5: Rename new enum to original name
ALTER TYPE "CrmUserRole_new" RENAME TO "CrmUserRole";

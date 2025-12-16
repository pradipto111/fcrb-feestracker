-- This script marks existing migrations as applied without running them
-- Use this if the deploy-migrations.sh script doesn't work

-- Create _prisma_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP,
    "started_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Mark old migrations as applied (only if they don't exist in the table)
INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "started_at", "applied_steps_count")
VALUES 
    ('00000000-0000-0000-0000-000000000001', '', NOW(), '20251125075812_init', 'Manually marked as applied - schema already exists', NOW(), 1),
    ('00000000-0000-0000-0000-000000000002', '', NOW(), '20251125081001_add_student_auth', 'Manually marked as applied - schema already exists', NOW(), 1),
    ('00000000-0000-0000-0000-000000000003', '', NOW(), '20251125081836_add_payment_frequency', 'Manually marked as applied - schema already exists', NOW(), 1),
    ('00000000-0000-0000-0000-000000000004', '', NOW(), '20251210204627_add_analytics_fields_and_relations', 'Manually marked as applied - schema already exists', NOW(), 1)
ON CONFLICT (migration_name) DO NOTHING;

-- After running this, prisma migrate deploy will only apply the new migration:
-- 20251211053654_add_center_shortname



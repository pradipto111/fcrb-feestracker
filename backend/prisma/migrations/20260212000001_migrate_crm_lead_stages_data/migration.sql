-- Migrate existing CrmLead data from old stage values to new ones.
-- Run after 20260212000000 (which adds the new enum values) so the new values are committed.
UPDATE "CrmLead" SET "stage" = 'FOLLOW_UP' WHERE "stage" = 'QUALIFIED';
UPDATE "CrmLead" SET "stage" = 'WILL_JOIN' WHERE "stage" = 'PROPOSAL';
UPDATE "CrmLead" SET "stage" = 'JOINED' WHERE "stage" = 'WON';
UPDATE "CrmLead" SET "stage" = 'UNINTERESTED_NO_RESPONSE' WHERE "stage" = 'LOST';

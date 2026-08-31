-- Admin role (promote only via SQL — never from the app UI)
-- Example: UPDATE users SET role = 'admin' WHERE email = 'you@example.com';

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'user' NOT NULL;

-- Ensure existing rows are regular users
UPDATE "users" SET "role" = 'user' WHERE "role" IS NULL OR "role" = '';

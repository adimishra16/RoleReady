-- Subscription / Razorpay fields on users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "plan" varchar(20) DEFAULT 'free' NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_status" varchar(30) DEFAULT 'none' NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "razorpay_customer_id" varchar(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "razorpay_subscription_id" varchar(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_current_period_end" timestamp;

CREATE TABLE IF NOT EXISTS "billing_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar(255),
  "event_type" varchar(100) NOT NULL,
  "razorpay_event_id" varchar(120),
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

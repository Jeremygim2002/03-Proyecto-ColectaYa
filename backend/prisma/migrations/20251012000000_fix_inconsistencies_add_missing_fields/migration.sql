-- Migration: Fix inconsistencies and add missing fields
-- Date: 2025-10-12
-- Purpose: Add imageUrl, ruleValue, name, avatar fields and fix naming inconsistencies

-- 1. Add new enum value for COMPLETED status (only ACTIVE and COMPLETED)
ALTER TYPE "CollectionStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

-- 2. Add missing fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- 3. Add missing fields to collections table
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "ruleValue" DECIMAL(5,2);
ALTER TABLE "collections" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT NOW();

-- 4. Migrate existing data from thresholdPct to ruleValue
UPDATE "collections" SET "ruleValue" = "thresholdPct" WHERE "thresholdPct" IS NOT NULL;

-- 5. Create new index for public collections queries
CREATE INDEX IF NOT EXISTS "collections_isPrivate_idx" ON "collections"("isPrivate");

-- 6. Update existing updatedAt values to createdAt for consistency
UPDATE "collections" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- 7. Make updatedAt NOT NULL after setting initial values
ALTER TABLE "collections" ALTER COLUMN "updatedAt" SET NOT NULL;
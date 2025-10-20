/*
  Warnings:

  - The values [THRESHOLD] on the enum `RuleType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."InvitationStatus" ADD VALUE 'PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."RuleType_new" AS ENUM ('GOAL_ONLY', 'ANYTIME');
ALTER TABLE "public"."collections" ALTER COLUMN "ruleType" TYPE "public"."RuleType_new" USING ("ruleType"::text::"public"."RuleType_new");
ALTER TYPE "public"."RuleType" RENAME TO "RuleType_old";
ALTER TYPE "public"."RuleType_new" RENAME TO "RuleType";
DROP TYPE "public"."RuleType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."invitations" ALTER COLUMN "status" SET DEFAULT 'PENDING';

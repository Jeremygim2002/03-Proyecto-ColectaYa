/*
  Warnings:

  - The values [CLOSED,HIDDEN] on the enum `CollectionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [REFUNDED] on the enum `ContributionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `thresholdPct` on the `collections` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CollectionStatus_new" AS ENUM ('ACTIVE', 'COMPLETED');
ALTER TABLE "public"."collections" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."collections" ALTER COLUMN "status" TYPE "public"."CollectionStatus_new" USING ("status"::text::"public"."CollectionStatus_new");
ALTER TYPE "public"."CollectionStatus" RENAME TO "CollectionStatus_old";
ALTER TYPE "public"."CollectionStatus_new" RENAME TO "CollectionStatus";
DROP TYPE "public"."CollectionStatus_old";
ALTER TABLE "public"."collections" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContributionStatus_new" AS ENUM ('PAID', 'FAILED');
ALTER TABLE "public"."contributions" ALTER COLUMN "status" TYPE "public"."ContributionStatus_new" USING ("status"::text::"public"."ContributionStatus_new");
ALTER TYPE "public"."ContributionStatus" RENAME TO "ContributionStatus_old";
ALTER TYPE "public"."ContributionStatus_new" RENAME TO "ContributionStatus";
DROP TYPE "public"."ContributionStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."collections" DROP COLUMN "thresholdPct",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."collection_stats" (
    "id" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "contributorsCount" INTEGER NOT NULL DEFAULT 0,
    "contributionsCount" INTEGER NOT NULL DEFAULT 0,
    "lastContribution" TIMESTAMPTZ,
    "lastUpdated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_stats_collectionId_key" ON "public"."collection_stats"("collectionId");

-- CreateIndex
CREATE INDEX "collection_stats_lastUpdated_idx" ON "public"."collection_stats"("lastUpdated");

-- AddForeignKey
ALTER TABLE "public"."collection_stats" ADD CONSTRAINT "collection_stats_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

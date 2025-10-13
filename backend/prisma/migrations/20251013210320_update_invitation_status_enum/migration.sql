-- AlterEnum
ALTER TYPE "public"."InvitationStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "public"."invitations" ALTER COLUMN "status" SET DEFAULT 'PENDING';

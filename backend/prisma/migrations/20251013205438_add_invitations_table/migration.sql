-- CreateEnum
CREATE TYPE "public"."InvitationStatus" AS ENUM ('ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."invitations" (
    "id" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "inviterId" UUID NOT NULL,
    "invitedId" UUID NOT NULL,
    "status" "public"."InvitationStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMPTZ,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invitations_invitedId_idx" ON "public"."invitations"("invitedId");

-- CreateIndex
CREATE INDEX "invitations_collectionId_idx" ON "public"."invitations"("collectionId");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "public"."invitations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_collectionId_invitedId_key" ON "public"."invitations"("collectionId", "invitedId");

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invitations" ADD CONSTRAINT "invitations_invitedId_fkey" FOREIGN KEY ("invitedId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

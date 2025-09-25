-- CreateEnum
CREATE TYPE "public"."FundStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ParticipantStatus" AS ENUM ('INVITED', 'JOINED', 'DECLINED', 'LEFT');

-- CreateEnum
CREATE TYPE "public"."ContributionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('FOOD', 'TRANSPORT', 'MEDICAL', 'EDUCATION', 'UTILITIES', 'EMERGENCY', 'EVENT', 'EQUIPMENT', 'OTHER');

-- CreateTable
CREATE TABLE "public"."funds" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goalAmount" DECIMAL(10,2) NOT NULL,
    "currentAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "status" "public"."FundStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "allowOpenJoin" BOOLEAN NOT NULL DEFAULT false,
    "maxParticipants" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participants" (
    "id" SERIAL NOT NULL,
    "status" "public"."ParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "canAddExpenses" BOOLEAN NOT NULL DEFAULT false,
    "canEditFund" BOOLEAN NOT NULL DEFAULT false,
    "canInviteOthers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "fundId" INTEGER NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contributions" (
    "id" SERIAL NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "status" "public"."ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "paymentId" TEXT,
    "paymentMethod" TEXT,
    "paymentDetails" JSONB,
    "contributedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "fundId" INTEGER NOT NULL,

    CONSTRAINT "contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" "public"."ExpenseCategory" NOT NULL,
    "receiptUrl" TEXT,
    "attachmentUrl" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "fundId" INTEGER NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "funds_creatorId_idx" ON "public"."funds"("creatorId");

-- CreateIndex
CREATE INDEX "funds_status_idx" ON "public"."funds"("status");

-- CreateIndex
CREATE INDEX "funds_isPublic_idx" ON "public"."funds"("isPublic");

-- CreateIndex
CREATE INDEX "funds_deadline_idx" ON "public"."funds"("deadline");

-- CreateIndex
CREATE INDEX "funds_createdAt_idx" ON "public"."funds"("createdAt");

-- CreateIndex
CREATE INDEX "funds_status_isPublic_idx" ON "public"."funds"("status", "isPublic");

-- CreateIndex
CREATE INDEX "participants_fundId_idx" ON "public"."participants"("fundId");

-- CreateIndex
CREATE INDEX "participants_userId_idx" ON "public"."participants"("userId");

-- CreateIndex
CREATE INDEX "participants_status_idx" ON "public"."participants"("status");

-- CreateIndex
CREATE INDEX "participants_joinedAt_idx" ON "public"."participants"("joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "participants_userId_fundId_key" ON "public"."participants"("userId", "fundId");

-- CreateIndex
CREATE INDEX "contributions_fundId_idx" ON "public"."contributions"("fundId");

-- CreateIndex
CREATE INDEX "contributions_userId_idx" ON "public"."contributions"("userId");

-- CreateIndex
CREATE INDEX "contributions_status_idx" ON "public"."contributions"("status");

-- CreateIndex
CREATE INDEX "contributions_contributedAt_idx" ON "public"."contributions"("contributedAt");

-- CreateIndex
CREATE INDEX "contributions_paymentId_idx" ON "public"."contributions"("paymentId");

-- CreateIndex
CREATE INDEX "expenses_fundId_idx" ON "public"."expenses"("fundId");

-- CreateIndex
CREATE INDEX "expenses_userId_idx" ON "public"."expenses"("userId");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "public"."expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_isApproved_idx" ON "public"."expenses"("isApproved");

-- CreateIndex
CREATE INDEX "expenses_expenseDate_idx" ON "public"."expenses"("expenseDate");

-- CreateIndex
CREATE INDEX "expenses_createdAt_idx" ON "public"."expenses"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."funds" ADD CONSTRAINT "funds_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participants" ADD CONSTRAINT "participants_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "public"."funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contributions" ADD CONSTRAINT "contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contributions" ADD CONSTRAINT "contributions_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "public"."funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "public"."funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

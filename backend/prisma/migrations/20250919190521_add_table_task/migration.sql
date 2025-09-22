-- CreateTable
CREATE TABLE "public"."task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

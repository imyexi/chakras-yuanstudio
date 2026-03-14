/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "TestResult" (
    "id" TEXT NOT NULL,
    "testDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rootScore" INTEGER NOT NULL,
    "solarPlexusScore" INTEGER NOT NULL,
    "sacralScore" INTEGER NOT NULL,
    "heartScore" INTEGER NOT NULL,
    "throatScore" INTEGER NOT NULL,
    "thirdEyeScore" INTEGER NOT NULL,
    "crownScore" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestResult_deviceId_idx" ON "TestResult"("deviceId");

-- CreateIndex
CREATE INDEX "TestResult_testDate_idx" ON "TestResult"("testDate");

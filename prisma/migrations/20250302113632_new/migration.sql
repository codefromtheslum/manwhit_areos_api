/*
  Warnings:

  - You are about to drop the column `recoveryCOdeExpiresIn` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "recoveryCOdeExpiresIn",
ADD COLUMN     "recoveryCodeExpiresIn" TEXT;

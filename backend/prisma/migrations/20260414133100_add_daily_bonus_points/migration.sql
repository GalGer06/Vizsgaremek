/*
  Warnings:

  - You are about to drop the column `history` on the `feladatok` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `feladatok` DROP COLUMN `history`;

-- AlterTable
ALTER TABLE `userdatas` ADD COLUMN `dailyBonusPoints` INTEGER NOT NULL DEFAULT 0;

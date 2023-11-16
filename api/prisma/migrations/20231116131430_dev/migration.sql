/*
  Warnings:

  - You are about to alter the column `started_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ended_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `ad_consume` ADD COLUMN `cpm_price` INTEGER NOT NULL DEFAULT 3000;

-- AlterTable
ALTER TABLE `ad_placements` MODIFY `started_at` DATETIME NOT NULL,
    MODIFY `ended_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3);

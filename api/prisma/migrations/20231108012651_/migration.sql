/*
  Warnings:

  - You are about to drop the column `position` on the `ad_materials` table. All the data in the column will be lost.
  - You are about to alter the column `started_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ended_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- DropIndex
DROP INDEX `position` ON `ad_materials`;

-- AlterTable
ALTER TABLE `ad_materials` DROP COLUMN `position`,
    ADD COLUMN `position_id` BIGINT UNSIGNED NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `ad_placements` MODIFY `started_at` DATETIME NOT NULL,
    MODIFY `ended_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `position_id` ON `ad_materials`(`position_id`);

/*
  Warnings:

  - You are about to drop the column `mediaType` on the `ad_placements` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `media_type` ON `ad_placements`;

-- AlterTable
ALTER TABLE `ad_placements` DROP COLUMN `mediaType`,
    ADD COLUMN `media_type` INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX `media_type` ON `ad_placements`(`media_type`);

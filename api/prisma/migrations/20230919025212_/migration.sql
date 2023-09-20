/*
  Warnings:

  - You are about to drop the column `placement_id` on the `ad_media_relation` table. All the data in the column will be lost.
  - Added the required column `mediarelation_id` to the `ad_placements` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `placement_id` ON `ad_media_relation`;

-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `ad_media_relation` DROP COLUMN `placement_id`;

-- AlterTable
ALTER TABLE `ad_placements` ADD COLUMN `mediarelation_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateIndex
CREATE INDEX `mediarelation_id` ON `ad_placements`(`mediarelation_id`);

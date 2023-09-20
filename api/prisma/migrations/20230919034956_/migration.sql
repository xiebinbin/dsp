/*
  Warnings:

  - You are about to drop the column `mediarelation_id` on the `ad_placements` table. All the data in the column will be lost.
  - Added the required column `placement_id` to the `ad_media_relation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `mediarelation_id` ON `ad_placements`;

-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `ad_media_relation` ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `placement_id` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `ad_placements` DROP COLUMN `mediarelation_id`;

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateIndex
CREATE INDEX `placement_id` ON `ad_media_relation`(`placement_id`);

-- CreateIndex
CREATE INDEX `enabled` ON `ad_media_relation`(`enabled`);

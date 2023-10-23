-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `report_daily` ADD COLUMN `ad_placement_id` BIGINT NULL,
    ADD COLUMN `ad_placement_name` VARCHAR(191) NULL,
    MODIFY `date` VARCHAR(191) NOT NULL DEFAULT '1999-01-01';

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateIndex
CREATE INDEX `ad_placement_id` ON `report_daily`(`ad_placement_id`);

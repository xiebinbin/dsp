/*
  Warnings:

  - Made the column `ad_placement_id` on table `report_daily` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ad_placement_name` on table `report_daily` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `report_daily` MODIFY `date` VARCHAR(191) NOT NULL DEFAULT '1999-01-01',
    MODIFY `ad_placement_id` BIGINT NOT NULL,
    MODIFY `ad_placement_name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

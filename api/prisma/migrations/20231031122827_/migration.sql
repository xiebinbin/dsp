/*
  Warnings:

  - You are about to drop the column `ad_count` on the `ad_consume` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `cpmPrice` INTEGER NOT NULL DEFAULT 3000;

-- AlterTable
ALTER TABLE `ad_consume` DROP COLUMN `ad_count`,
    ADD COLUMN `amount` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    ADD COLUMN `cpmPrice` INTEGER NOT NULL DEFAULT 3000;

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#',
    MODIFY `jumpurl` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `report_daily` MODIFY `date` VARCHAR(191) NOT NULL DEFAULT '1999-01-01';

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

/*
  Warnings:

  - Added the required column `filed` to the `Advertiser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Advertiser` ADD COLUMN `filed` INTEGER NOT NULL,
    MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `report_daily` MODIFY `date` VARCHAR(191) NOT NULL DEFAULT '1999-01-01';

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateTable
CREATE TABLE `ad_used_count` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ad_material_id` BIGINT NOT NULL,
    `placement_id` BIGINT NOT NULL,
    `ad_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `count_type` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ad_material_id`(`ad_material_id`),
    INDEX `placement_id`(`placement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

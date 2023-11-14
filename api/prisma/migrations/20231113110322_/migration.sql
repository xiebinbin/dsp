/*
  Warnings:

  - You are about to alter the column `started_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ended_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#',
    MODIFY `jump_url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `ad_medias` MODIFY `url` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `ad_placements` MODIFY `started_at` DATETIME NOT NULL,
    MODIFY `ended_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `advertisers` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateTable
CREATE TABLE `report_placement` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `agent_id` BIGINT NOT NULL,
    `agent_name` VARCHAR(191) NOT NULL,
    `advertiser_id` BIGINT NOT NULL,
    `advertiser_name` VARCHAR(191) NOT NULL,
    `ad_material_id` BIGINT NOT NULL,
    `ad_material_name` VARCHAR(191) NOT NULL,
    `ad_placement_id` BIGINT NOT NULL,
    `ad_placement_name` VARCHAR(191) NOT NULL,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `started_at` DATETIME NOT NULL,
    `ended_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `agent_id`(`agent_id`),
    INDEX `advertiser_id`(`advertiser_id`),
    INDEX `ad_material_id`(`ad_material_id`),
    INDEX `ad_placement_id`(`ad_placement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

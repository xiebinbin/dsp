-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateTable
CREATE TABLE `report_daily` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` INTEGER NOT NULL DEFAULT 19990101,
    `agent_id` BIGINT NOT NULL,
    `agent_name` VARCHAR(191) NOT NULL,
    `advertiser_id` BIGINT NOT NULL,
    `advertiser_name` VARCHAR(191) NOT NULL,
    `ad_material_id` BIGINT NOT NULL,
    `ad_material_name` VARCHAR(191) NOT NULL,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `date`(`date`),
    INDEX `agent_id`(`agent_id`),
    INDEX `advertiser_id`(`advertiser_id`),
    INDEX `ad_material_id`(`ad_material_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

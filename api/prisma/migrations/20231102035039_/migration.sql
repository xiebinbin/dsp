-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

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

-- CreateTable
CREATE TABLE `ad_report_byday` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` VARCHAR(191) NOT NULL DEFAULT '1999-01-01',
    `placement_id` BIGINT NOT NULL,
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `placement_id`(`placement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

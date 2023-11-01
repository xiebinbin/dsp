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
CREATE TABLE `ad_consume` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `advertiser_id` BIGINT NOT NULL,
    `ad_material_id` BIGINT NOT NULL,
    `placement_id` BIGINT NOT NULL,
    `ad_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ad_material_id`(`ad_material_id`),
    INDEX `placement_id`(`placement_id`),
    INDEX `advertiser_id`(`advertiser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

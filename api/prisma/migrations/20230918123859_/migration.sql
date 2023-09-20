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
CREATE TABLE `ad_media_relation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `media_id` BIGINT NOT NULL,
    `placement_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `media_id`(`media_id`),
    INDEX `placement_id`(`placement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

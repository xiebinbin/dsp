/*
  Warnings:

  - You are about to drop the `ad_report_byday` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `ad_report_byday`;

-- CreateTable
CREATE TABLE `ad_report_by_day` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `placement_id` BIGINT NOT NULL,
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `placement_id`(`placement_id`),
    INDEX `date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

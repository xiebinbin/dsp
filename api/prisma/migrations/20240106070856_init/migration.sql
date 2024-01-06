-- CreateTable
CREATE TABLE `time_curve_placement_by_days` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `placement_id` BIGINT NOT NULL,
    `curve_data` JSON NULL,

    INDEX `placement_id`(`placement_id`),
    INDEX `date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

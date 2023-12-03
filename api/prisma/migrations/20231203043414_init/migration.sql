-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL,
    `password` CHAR(64) NOT NULL DEFAULT 'default',
    `taxnumber` CHAR(64) NOT NULL DEFAULT 'none',
    `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `username`(`username`),
    INDEX `enabled`(`enabled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advertisers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL,
    `password` CHAR(64) NOT NULL DEFAULT 'default',
    `company_name` VARCHAR(191) NULL,
    `domain_name` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `user_id` BIGINT NOT NULL,
    `operator_id` BIGINT NULL DEFAULT 0,
    `filed` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `enabled`(`enabled`),
    INDEX `username`(`username`),
    INDEX `user_id`(`user_id`),
    INDEX `operator_id`(`operator_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `total_amount` BIGINT NOT NULL DEFAULT 0,
    `total_used` BIGINT NOT NULL DEFAULT 0,
    `balance` BIGINT NOT NULL DEFAULT 0,
    `advertiser_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `wallets_advertiser_id_key`(`advertiser_id`),
    INDEX `advertiser_id`(`advertiser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bills` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL DEFAULT 0,
    `advertiser_id` BIGINT UNSIGNED NOT NULL,
    `bill_date` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `remark` TEXT NULL DEFAULT '',

    INDEX `advertiser_id`(`advertiser_id`),
    INDEX `status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_materials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `media_type` INTEGER NOT NULL,
    `content_type` INTEGER NOT NULL DEFAULT 1,
    `position_id` BIGINT UNSIGNED NULL DEFAULT 0,
    `content` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL DEFAULT '#',
    `jump_url` VARCHAR(191) NULL DEFAULT '#',
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `advertiser_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `position_id`(`position_id`),
    INDEX `enabled`(`enabled`),
    INDEX `content_type`(`content_type`),
    INDEX `advertiser_id`(`advertiser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_medias` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `type` INTEGER NOT NULL DEFAULT 1,
    `url` VARCHAR(191) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `enabled`(`enabled`),
    INDEX `type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_media_relation` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `media_id` BIGINT NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `placement_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `placement_id`(`placement_id`),
    INDEX `media_id`(`media_id`),
    INDEX `enabled`(`enabled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_position` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `ad_spec_id` BIGINT NULL DEFAULT 0,
    `ad_media_id` BIGINT NULL DEFAULT 0,
    `type` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `media_id`(`ad_media_id`),
    INDEX `ad_spec_id`(`ad_spec_id`),
    INDEX `enabled`(`enabled`),
    INDEX `type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_spec` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `type` INTEGER NOT NULL DEFAULT 1,
    `size` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `enabled`(`enabled`),
    INDEX `type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_placements` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` INTEGER NOT NULL DEFAULT 1,
    `ad_material_id` BIGINT NOT NULL,
    `budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `media_type` INTEGER NOT NULL DEFAULT 1,
    `started_at` DATETIME NOT NULL,
    `ended_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3),
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `uv_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `advertiser_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `cpm_price` INTEGER NOT NULL DEFAULT 3000,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `available_time` JSON NULL,

    INDEX `ad_material_id`(`ad_material_id`),
    INDEX `enabled`(`enabled`),
    INDEX `media_type`(`media_type`),
    INDEX `started_at`(`started_at`),
    INDEX `ended_at`(`ended_at`),
    INDEX `advertiser_id`(`advertiser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_daily` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `agent_id` BIGINT NOT NULL,
    `agent_name` VARCHAR(191) NOT NULL,
    `advertiser_id` BIGINT NOT NULL,
    `advertiser_name` VARCHAR(191) NOT NULL,
    `ad_material_id` BIGINT NOT NULL,
    `ad_material_name` VARCHAR(191) NOT NULL,
    `ad_placement_id` BIGINT NOT NULL,
    `ad_placement_name` VARCHAR(191) NOT NULL,
    `uv_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `date`(`date`),
    INDEX `agent_id`(`agent_id`),
    INDEX `advertiser_id`(`advertiser_id`),
    INDEX `ad_material_id`(`ad_material_id`),
    INDEX `ad_placement_id`(`ad_placement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `ad_consume` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `advertiser_id` BIGINT NOT NULL,
    `ad_material_id` BIGINT NOT NULL,
    `placement_id` BIGINT NOT NULL,
    `amount` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `cpm_price` INTEGER NOT NULL DEFAULT 3000,
    `status` SMALLINT NOT NULL DEFAULT 0,
    `remark` TEXT NULL DEFAULT '',

    INDEX `status`(`status`),
    INDEX `ad_material_id`(`ad_material_id`),
    INDEX `placement_id`(`placement_id`),
    INDEX `advertiser_id`(`advertiser_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_report_by_day` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `placement_id` BIGINT NOT NULL,
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `uv_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `placement_id`(`placement_id`),
    INDEX `date`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `uv_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `display_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `click_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `used_budget` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `started_at` DATE NOT NULL,
    `ended_at` DATE NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `agent_id`(`agent_id`),
    INDEX `advertiser_id`(`advertiser_id`),
    INDEX `ad_material_id`(`ad_material_id`),
    INDEX `ad_placement_id`(`ad_placement_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

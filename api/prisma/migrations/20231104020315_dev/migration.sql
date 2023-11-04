/*
  Warnings:

  - You are about to alter the column `advertiser_id` on the `wallets` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `UnsignedBigInt`.
  - You are about to drop the `Advertiser` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `bills` ADD COLUMN `remark` TEXT NULL DEFAULT '',
    ADD COLUMN `status` SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN `type` SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `wallets` MODIFY `balance` BIGINT NOT NULL DEFAULT 0,
    MODIFY `advertiser_id` BIGINT UNSIGNED NOT NULL,
    MODIFY `total_amount` BIGINT NOT NULL DEFAULT 0,
    MODIFY `total_used` BIGINT NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `Advertiser`;

-- CreateTable
CREATE TABLE `advertisers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL,
    `password` CHAR(64) NOT NULL DEFAULT 'default',
    `company_name` VARCHAR(191) NULL,
    `tax_number` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `cpm_price` INTEGER NOT NULL DEFAULT 3000,
    `user_id` BIGINT NOT NULL,
    `filed` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `enabled`(`enabled`),
    INDEX `username`(`username`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `status` ON `bills`(`status`);

-- CreateIndex
CREATE INDEX `type` ON `bills`(`type`);

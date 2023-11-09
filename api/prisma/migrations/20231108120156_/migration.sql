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
ALTER TABLE `ad_position` ADD COLUMN `ad_spec_id` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `cpm_price` INTEGER NOT NULL DEFAULT 3000,
    ADD COLUMN `media_id` BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `advertisers` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateIndex
CREATE INDEX `media_id` ON `ad_position`(`media_id`);

-- CreateIndex
CREATE INDEX `ad_spec_id` ON `ad_position`(`ad_spec_id`);

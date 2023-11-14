/*
  Warnings:

  - You are about to alter the column `started_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ended_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `operation_id` on the `advertisers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `operation_id` ON `advertisers`;

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#',
    MODIFY `jump_url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `ad_medias` MODIFY `url` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `ad_placements` MODIFY `started_at` DATETIME NOT NULL,
    MODIFY `ended_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `advertisers` DROP COLUMN `operation_id`,
    ADD COLUMN `operator_id` BIGINT NOT NULL DEFAULT 0,
    MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

-- CreateIndex
CREATE INDEX `operator_id` ON `advertisers`(`operator_id`);

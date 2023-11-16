/*
  Warnings:

  - You are about to drop the column `cpm_price` on the `ad_consume` table. All the data in the column will be lost.
  - You are about to alter the column `started_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ended_at` on the `ad_placements` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to drop the column `cpm_price` on the `ad_position` table. All the data in the column will be lost.
  - You are about to drop the column `cpm_price` on the `advertisers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ad_consume` DROP COLUMN `cpm_price`;

-- AlterTable
ALTER TABLE `ad_placements` ADD COLUMN `cpm_price` INTEGER NOT NULL DEFAULT 3000,
    MODIFY `started_at` DATETIME NOT NULL,
    MODIFY `ended_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `ad_position` DROP COLUMN `cpm_price`,
    MODIFY `ad_spec_id` BIGINT NULL DEFAULT 0,
    MODIFY `ad_media_id` BIGINT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `advertisers` DROP COLUMN `cpm_price`;

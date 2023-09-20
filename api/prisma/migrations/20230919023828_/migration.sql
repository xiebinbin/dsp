/*
  Warnings:

  - You are about to drop the column `relation_id` on the `ad_placements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Advertiser` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default';

-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `ad_placements` DROP COLUMN `relation_id`;

-- AlterTable
ALTER TABLE `users` MODIFY `password` CHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root',
    MODIFY `nickname` VARCHAR(64) NOT NULL DEFAULT 'default',
    MODIFY `taxnumber` CHAR(64) NOT NULL DEFAULT 'none';

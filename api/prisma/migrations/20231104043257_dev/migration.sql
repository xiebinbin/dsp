/*
  Warnings:

  - You are about to drop the column `cpmPrice` on the `ad_consume` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `bills` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `type` ON `bills`;

-- AlterTable
ALTER TABLE `ad_consume` DROP COLUMN `cpmPrice`,
    ADD COLUMN `cpm_price` INTEGER NOT NULL DEFAULT 3000,
    ADD COLUMN `remark` TEXT NULL DEFAULT '',
    ADD COLUMN `status` SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `bills` DROP COLUMN `type`;

-- CreateIndex
CREATE INDEX `status` ON `ad_consume`(`status`);

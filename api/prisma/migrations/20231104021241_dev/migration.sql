/*
  Warnings:

  - You are about to drop the column `advertiserId` on the `bills` table. All the data in the column will be lost.
  - Added the required column `advertiser_id` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `advertiser_id` ON `bills`;

-- AlterTable
ALTER TABLE `bills` DROP COLUMN `advertiserId`,
    ADD COLUMN `advertiser_id` BIGINT UNSIGNED NOT NULL;

-- CreateIndex
CREATE INDEX `advertiser_id` ON `bills`(`advertiser_id`);

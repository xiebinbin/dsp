/*
  Warnings:

  - You are about to drop the column `contentType` on the `ad_materials` table. All the data in the column will be lost.
  - You are about to drop the column `jumpurl` on the `ad_materials` table. All the data in the column will be lost.
  - You are about to drop the column `mediaType` on the `ad_materials` table. All the data in the column will be lost.
  - Added the required column `media_type` to the `ad_materials` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `content_type` ON `ad_materials`;

-- AlterTable
ALTER TABLE `ad_materials` DROP COLUMN `contentType`,
    DROP COLUMN `jumpurl`,
    DROP COLUMN `mediaType`,
    ADD COLUMN `content_type` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `jump_url` VARCHAR(191) NULL DEFAULT '#',
    ADD COLUMN `media_type` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `content_type` ON `ad_materials`(`content_type`);

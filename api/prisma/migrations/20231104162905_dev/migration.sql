/*
  Warnings:

  - You are about to alter the column `date` on the `report_daily` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Date`.

*/
-- AlterTable
ALTER TABLE `report_daily` MODIFY `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE INDEX `date` ON `ad_report_byday`(`date`);

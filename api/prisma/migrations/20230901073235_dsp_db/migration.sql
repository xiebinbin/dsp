-- AlterTable
ALTER TABLE `ad_materials` MODIFY `url` VARCHAR(191) NULL DEFAULT '#';

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('Root', 'Operator', 'Agent') NOT NULL DEFAULT 'Root';

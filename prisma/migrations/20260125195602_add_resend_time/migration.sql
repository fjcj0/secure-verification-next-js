-- AlterTable
ALTER TABLE `StudentDevice` ADD COLUMN `resendExpiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `TeacherDevice` ADD COLUMN `resendExpiresAt` DATETIME(3) NULL;

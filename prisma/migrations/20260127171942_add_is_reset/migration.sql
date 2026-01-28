-- AlterTable
ALTER TABLE `StudentDevice` ADD COLUMN `isResetPassword` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `TeacherDevice` ADD COLUMN `isResetPassword` BOOLEAN NOT NULL DEFAULT false;

/*
  Warnings:

  - A unique constraint covering the columns `[resetPasswordPageToken]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resetPasswordPageToken]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Student` ADD COLUMN `resetPasswordPageToken` VARCHAR(191) NULL,
    ADD COLUMN `resetPasswordTokenExpiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Teacher` ADD COLUMN `resetPasswordPageToken` VARCHAR(191) NULL,
    ADD COLUMN `resetPasswordTokenExpiresAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_resetPasswordPageToken_key` ON `Student`(`resetPasswordPageToken`);

-- CreateIndex
CREATE UNIQUE INDEX `Teacher_resetPasswordPageToken_key` ON `Teacher`(`resetPasswordPageToken`);

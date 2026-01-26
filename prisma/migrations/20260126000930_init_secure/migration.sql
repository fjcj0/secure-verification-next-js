/*
  Warnings:

  - You are about to drop the column `resetPasswordPageToken` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordTokenExpiresAt` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordPageToken` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordTokenExpiresAt` on the `Teacher` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pageToken]` on the table `StudentDevice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pageToken]` on the table `TeacherDevice` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `StudentDevice` DROP FOREIGN KEY `StudentDevice_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `TeacherDevice` DROP FOREIGN KEY `TeacherDevice_teacherId_fkey`;

-- DropIndex
DROP INDEX `StudentDevice_studentId_fkey` ON `StudentDevice`;

-- DropIndex
DROP INDEX `TeacherDevice_teacherId_fkey` ON `TeacherDevice`;

-- AlterTable
ALTER TABLE `Student` DROP COLUMN `resetPasswordPageToken`,
    DROP COLUMN `resetPasswordTokenExpiresAt`,
    MODIFY `type` ENUM('Student', 'Teacher') NOT NULL DEFAULT 'Student';

-- AlterTable
ALTER TABLE `Teacher` DROP COLUMN `resetPasswordPageToken`,
    DROP COLUMN `resetPasswordTokenExpiresAt`,
    MODIFY `type` ENUM('Student', 'Teacher') NOT NULL DEFAULT 'Teacher';

-- CreateIndex
CREATE UNIQUE INDEX `StudentDevice_pageToken_key` ON `StudentDevice`(`pageToken`);

-- CreateIndex
CREATE UNIQUE INDEX `TeacherDevice_pageToken_key` ON `TeacherDevice`(`pageToken`);

-- AddForeignKey
ALTER TABLE `StudentDevice` ADD CONSTRAINT `StudentDevice_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherDevice` ADD CONSTRAINT `TeacherDevice_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `resetPasswordPageToken` VARCHAR(191) NULL,
    ADD COLUMN `resetPasswordTokenExpiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `StudentDevice` MODIFY `pageToken` VARCHAR(191) NULL,
    MODIFY `pageExpiresAt` DATETIME(3) NULL,
    MODIFY `code` VARCHAR(191) NULL,
    MODIFY `codeExpiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Teacher` ADD COLUMN `resetPasswordPageToken` VARCHAR(191) NULL,
    ADD COLUMN `resetPasswordTokenExpiresAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `TeacherDevice` MODIFY `pageToken` VARCHAR(191) NULL,
    MODIFY `pageExpiresAt` DATETIME(3) NULL,
    MODIFY `code` VARCHAR(191) NULL,
    MODIFY `codeExpiresAt` DATETIME(3) NULL;

/*
  Warnings:

  - Added the required column `type` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Student` ADD COLUMN `type` ENUM('Student', 'Teacher') NOT NULL;

-- AlterTable
ALTER TABLE `Teacher` ADD COLUMN `type` ENUM('Student', 'Teacher') NOT NULL;

-- AlterTable
ALTER TABLE `Doctor` ADD COLUMN `experience` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `qualifications` VARCHAR(191) NOT NULL DEFAULT '[]';

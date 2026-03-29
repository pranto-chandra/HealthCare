-- AlterTable
ALTER TABLE `LabTest` ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `pathologistId` VARCHAR(191) NULL,
    ADD COLUMN `recommendedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `reportNotes` TEXT NULL,
    ADD COLUMN `status` ENUM('RECOMMENDED', 'PENDING', 'COMPLETED', 'REPORT_ADDED') NOT NULL DEFAULT 'RECOMMENDED',
    MODIFY `testDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'PATIENT', 'DOCTOR', 'PATHOLOGIST') NOT NULL;

-- CreateTable
CREATE TABLE `PathologistProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `licenseNumber` VARCHAR(191) NOT NULL,
    `labName` VARCHAR(191) NULL,
    `qualification` VARCHAR(191) NULL,

    UNIQUE INDEX `PathologistProfile_userId_key`(`userId`),
    UNIQUE INDEX `PathologistProfile_licenseNumber_key`(`licenseNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PathologistProfile` ADD CONSTRAINT `PathologistProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LabTest` ADD CONSTRAINT `LabTest_pathologistId_fkey` FOREIGN KEY (`pathologistId`) REFERENCES `PathologistProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

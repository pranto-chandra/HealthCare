-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerificationOtp` VARCHAR(191) NULL,
    ADD COLUMN `emailVerificationOtpExpiry` DATETIME(3) NULL,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false;

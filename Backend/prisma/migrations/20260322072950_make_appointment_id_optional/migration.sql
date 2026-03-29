-- DropForeignKey
ALTER TABLE `Prescription` DROP FOREIGN KEY `Prescription_appointmentId_fkey`;

-- AlterTable
ALTER TABLE `Prescription` MODIFY `appointmentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

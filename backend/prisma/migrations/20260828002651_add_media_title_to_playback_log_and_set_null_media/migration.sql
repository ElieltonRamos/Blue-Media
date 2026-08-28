/*
  Warnings:

  - Added the required column `media_title` to the `playback_logs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `playback_logs` DROP FOREIGN KEY `playback_logs_media_id_fkey`;

-- DropIndex
DROP INDEX `playback_logs_media_id_fkey` ON `playback_logs`;

-- AlterTable
ALTER TABLE `playback_logs` ADD COLUMN `media_title` VARCHAR(255) NOT NULL,
    MODIFY `media_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `playback_logs` ADD CONSTRAINT `playback_logs_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

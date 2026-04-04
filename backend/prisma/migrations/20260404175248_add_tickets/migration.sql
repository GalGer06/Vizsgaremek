-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `type` ENUM('BUG', 'SUGGEST_QUESTION') NOT NULL,
    `description` TEXT NOT NULL,
    `attachment` JSON NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

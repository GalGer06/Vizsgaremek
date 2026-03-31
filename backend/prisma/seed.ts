import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "./seeders/admin.seeder";
import { seedUsers } from "./seeders/user.seeder";

config();

const prisma = new PrismaClient();

async function main() {
    console.log(`🌱 Start seeding ...`);

    // Clean up or handle relations might be needed depending on DB state if not reset.
    // However, the original script didn't delete everything, just upserted/added.

    // Seed Default Admin
    await seedAdmin(prisma);

    // Seed Random Users
    const randomUserCount = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
    await seedUsers(prisma, randomUserCount);

    console.log(`🌱 Seeding finished.`);
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e)
        process.exit(1)
    })
    .finally(() => {
        prisma.$disconnect()
});


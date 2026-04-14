import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { seedAdmin } from "./seeders/admin.seeder";
import { seedUsers } from "./seeders/user.seeder";
import { seedQuestions } from "./seeders/questions.seeder";
import { seedHomeButtons } from "./seeders/home.seeder";
import { seedTopics } from "./seeders/topic.seeder";

config();

const prisma = new PrismaClient();

async function main() {
    ;
    console.log(`đźŚ± Start seeding ...`);

    // Seed Home Buttons
    await seedHomeButtons(prisma);

    // Seed Topics
    await seedTopics(prisma);

    // Seed Default Admin
     await seedAdmin(prisma);

    // Seed Random Users
    const randomUserCount = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
    await seedUsers(prisma, randomUserCount);

    // Seed Questions
    await seedQuestions(prisma);

    console.log(`đźŚ± Seeding finished.`);
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e)
        process.exit(1)
    })
    .finally(() => {
        prisma.$disconnect()
});


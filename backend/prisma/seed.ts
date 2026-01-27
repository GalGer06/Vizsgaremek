import { config } from "dotenv";
import { PrismaClient } from "../generated/prisma/client";
import { faker } from "@faker-js/faker";

// Load environment variables
config();

//console.log("🚀 Seed script started");
//console.log("DATABASE_URL:", process.env.DATABASE_URL);
//console.log("Prisma Client importing...");

const prisma = new PrismaClient();
//console.log("✅ Prisma Client created successfully");

function daysBetween(date: Date) {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

function calculateLevel(totalPoints: number) {
    const MAX_LEVEL = 200;
    const MAX_POINTS = 3000;
    const level = Math.floor((totalPoints / MAX_POINTS) * MAX_LEVEL) + 1;
    return Math.min(level, MAX_LEVEL);
}

async function main() {
    console.log(`🌱 Start seeding ...`);

    const USER_COUNT = faker.number.int({ min: 10, max: 20 });

    for (let i = 0; i < USER_COUNT; i++) {
        const createdAt = faker.date.past({ years: 2 });
        const daysRegistered = daysBetween(createdAt);

        const streak = faker.number.int({ min: 0, max: Math.min(daysRegistered, 300) });

        const totalPoints = faker.number.int({ min: 0, max: 3000 });
        const level = calculateLevel(totalPoints);

        await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                username: faker.internet.username().toLowerCase() + faker.number.int({ min: 1, max: 600 }),
                email: faker.internet.email().toLowerCase(),
                password: faker.internet.password(),
                access: faker.datatype.boolean(),
                createdAt,

                userDatas: {
                    create: {
                        streak,
                        totalPoints,
                        level,
                    }
                },
            },
        });
    }
    console.log(`🌱 Seeding finished.`);
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
});
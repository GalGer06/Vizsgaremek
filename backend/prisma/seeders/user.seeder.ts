import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

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

export async function seedUsers(prisma: PrismaClient, count: number = 15) {
    console.log(`👥 Seeding ${count} fake users...`);

    for (let i = 0; i < count; i++) {
        const createdAt = faker.date.past({ years: 2 });
        const daysRegistered = daysBetween(createdAt);

        const streak = faker.number.int({ min: 0, max: Math.min(daysRegistered, 300) });
        const totalPoints = faker.number.int({ min: 0, max: 3000 });
        const level = calculateLevel(totalPoints);

        await prisma.user.create({
            data: {
                name: faker.person.fullName(),
                username: faker.internet.username().toLowerCase() + faker.number.int({ min: 1, max: 9999 }),
                email: faker.internet.email().toLowerCase(),
                password: faker.internet.password(),
                access: false,
                createdAt,

                userdatas: {
                    create: {
                        streak,
                        totalPoints,
                        level,
                    }
                },
            },
        });
    }
}

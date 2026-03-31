import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const DEFAULT_ADMIN = {
    name: "Tóth Patrik Péter",
    username: "Rikimik",
    email: "rikimik@vizsgaremek.local",
    password: "admin1234",
};

export async function seedAdmin(prisma: PrismaClient) {
    console.log("👤 Seeding admin user...");
    const hashedAdminPassword = await hash(DEFAULT_ADMIN.password, 10);

    await prisma.user.upsert({
        where: { username: DEFAULT_ADMIN.username },
        update: {
            name: DEFAULT_ADMIN.name,
            email: DEFAULT_ADMIN.email,
            password: hashedAdminPassword,
            access: true,
        },
        create: {
            name: DEFAULT_ADMIN.name,
            username: DEFAULT_ADMIN.username,
            email: DEFAULT_ADMIN.email,
            password: hashedAdminPassword,
            access: true,
        },
    });

    // Ensure only the default admin has access=true initially or resets others
    await prisma.user.updateMany({
        where: { username: { not: DEFAULT_ADMIN.username } },
        data: { access: false },
    });
}

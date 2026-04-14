import { PrismaClient } from "@prisma/client";

export async function seedHomeButtons(prisma: PrismaClient) {
    console.log("🔘 Seeding home menu buttons...");

    const buttons = [
        { label: 'Témák', link: '/topics', image: 'temak.jpg', order: 1 },
        { label: 'Teljesítmények', link: '/achievements', image: 'ranglista.jpg', order: 2 },
        { label: 'Napi Feladatok', link: '/daily-tasks', image: 'napi.jpg', order: 3 },
        { label: 'Barátok', link: '/friends', image: 'profil.jpg', order: 4 },
    ];

    for (const button of buttons) {
        await prisma.home_button.upsert({
            where: { id: buttons.indexOf(button) + 1 },
            update: {
                label: button.label,
                link: button.link,
                image: button.image,
                order: button.order
            },
            create: {
                id: buttons.indexOf(button) + 1,
                label: button.label,
                link: button.link,
                image: button.image,
                order: button.order
            }
        });
    }
}

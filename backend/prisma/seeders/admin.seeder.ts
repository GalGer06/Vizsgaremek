import { getBase64Image } from './image.utils';
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const DEFAULT_ADMIN = {
    name: "Tóth Patrik Péter",
    username: "Rikimik",
    email: "rikimik@vizsgaremek.local",
    password: "admin1234",
};

const ACHIEVEMENT_TEMPLATES = [
    { id: 1, title: 'Első lépések', description: 'Lépj be először az alkalmazásba.', completed: true, image: 'https://images.pexels.com/photos/4065876/pexels-photo-4065876.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 2, title: 'Kíváncsi felfedező', description: 'Nyiss meg legalább 1 témát.', completed: true, image: 'https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 3, title: 'Hulladékharcos', description: 'Olvass el 5 újrahasznosításhoz kapcsolódó kérdést.', completed: false, image: 'https://images.pexels.com/photos/761297/pexels-photo-761297.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 4, title: 'Vízőr', description: 'Nyisd meg a Vízvédelem témát 3 alkalommal.', completed: false, image: 'https://images.pexels.com/photos/1001633/pexels-photo-1001633.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 5, title: 'Erdőbarát', description: 'Olvass el 10 erdőkkel kapcsolatos kérdést.', completed: false, image: 'https://images.pexels.com/photos/2400594/pexels-photo-2400594.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 6, title: 'Kitartó tanuló', description: 'Lépj be 7 egymást követő napon.', completed: false, image: 'https://images.pexels.com/photos/4458554/pexels-photo-4458554.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 7, title: 'Napi hős', description: 'Teljesíts 3 napi feladatot.', completed: false, image: 'https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 8, title: 'Közösségi tag', description: 'Adj hozzá legalább 1 barátot.', completed: false, image: 'https://images.pexels.com/photos/461049/pexels-photo-461049.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 10, title: 'Öko mester', description: 'Nyisd meg az összes témát legalább egyszer.', completed: false, image: 'https://images.pexels.com/photos/1173777/pexels-photo-1173777.jpeg?auto=compress&cs=tinysrgb&w=300' },
    { id: 11, title: 'Föld Védelmezője', description: 'Olvass végig minden környezetvédelmi kategóriát.', completed: false, image: 'http://localhost:3000/images/achievement_saving_planet.jpg' },
    { id: 9, title: 'Pontgyűjtő', description: 'Gyűjts össze 500 pontot.', completed: false, image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

export async function seedAdmin(prisma: PrismaClient) {
    console.log("đź‘¤ Seeding admin user...");
    const hashedAdminPassword = await hash(DEFAULT_ADMIN.password, 10);

    const admin = await prisma.user.upsert({
        where: { username: DEFAULT_ADMIN.username },
        update: {
            name: DEFAULT_ADMIN.name,
            email: DEFAULT_ADMIN.email,
            password: hashedAdminPassword,
            access: true,
            profilePicture: getBase64Image('rikimik_profile.jpg'),},
        create: {
            name: DEFAULT_ADMIN.name,
            username: DEFAULT_ADMIN.username,
            email: DEFAULT_ADMIN.email,
            password: hashedAdminPassword,
            access: true,
            profilePicture: getBase64Image('rikimik_profile.jpg'),},
    });

    // Create achievements master data if they don't exist
    for (const template of ACHIEVEMENT_TEMPLATES) {
        await prisma.achievement.upsert({
            where: { id: template.id },
            update: {
                title: template.title,
                description: template.description,
                image: template.image
            },
            create: {
                id: template.id,
                title: template.title,
                description: template.description,
                image: template.image
            }
        });
    }

    // Check if userdatas exists for admin, if not create it
    let userDatas = await prisma.userdatas.findUnique({
        where: { userId: admin.id }
    });

    if (!userDatas) {
        userDatas = await prisma.userdatas.create({
            data: {
                userId: admin.id,
                totalPoints: 0,
                level: 1,
                streak: 0
            }
        });
    }

    // Connect achievements to admin
    for (const template of ACHIEVEMENT_TEMPLATES) {
        await prisma.user_achievement.upsert({
            where: {
                userDataId_achievementId: {
                    userDataId: userDatas.id,
                    achievementId: template.id
                }
            },
            update: {
                completed: template.completed
            },
            create: {
                userDataId: userDatas.id,
                achievementId: template.id,
                completed: template.completed
            }
        });
    }

    // Ensure only the default admin has access=true initially or resets others
    await prisma.user.updateMany({
        where: { username: { not: DEFAULT_ADMIN.username } },
        data: { access: false },
    });
}

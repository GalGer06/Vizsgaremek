import { getBase64Image } from './image.utils';
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const DEFAULT_ADMIN = {
    name: "Tóth Patrik Péter",
    username: "Rikimik",
    email: "rikimik@vizsgaremek.local",
    password: "admin1234",
};

const NEW_ADMIN = {
    name: "Galambos Gergő",
    username: "GalGer",
    email: "galger@vizsgaremek.local",
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
    console.log("đź‘¤ Seeding admin users...");
    const hashedAdminPassword = await hash(DEFAULT_ADMIN.password, 10);
    const hashedNewAdminPassword = await hash(NEW_ADMIN.password, 10);

    const admins = [
        {
            data: DEFAULT_ADMIN,
            hashedPassword: hashedAdminPassword,
            profile: 'rikimik_profile.jpg'
        },
        {
            data: NEW_ADMIN,
            hashedPassword: hashedNewAdminPassword,
            profile: 'galger_profile.jpg'
        }
    ];

    for (const adminData of admins) {
        const admin = await prisma.user.upsert({
            where: { username: adminData.data.username },
            update: {
                name: adminData.data.name,
                email: adminData.data.email,
                password: adminData.hashedPassword,
                access: true,
                profilePicture: adminData.profile ? getBase64Image(adminData.profile) : null,
            },
            create: {
                name: adminData.data.name,
                username: adminData.data.username,
                email: adminData.data.email,
                password: adminData.hashedPassword,
                access: true,
                profilePicture: adminData.profile ? getBase64Image(adminData.profile) : null,
            },
        });

        // Ensure userdatas exists
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

        // Connect/Reset achievements
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
    }

    // Create achievements master data
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

    // Ensure only the intended admins have access=true, reset others if needed
    // (Note: The loop already set access: true for DEFAULT_ADMIN and NEW_ADMIN)
    await prisma.user.updateMany({
        where: { 
            username: { 
                notIn: [DEFAULT_ADMIN.username, NEW_ADMIN.username] 
            } 
        },
        data: { access: false },
    });
}

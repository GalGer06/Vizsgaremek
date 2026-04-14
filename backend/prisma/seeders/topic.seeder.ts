import { PrismaClient } from "@prisma/client";

export async function seedTopics(prisma: PrismaClient) {
    console.log("📚 Seeding topics...");

    const topics = [
        { slug: 'alapfogalmak', title: 'Alapfogalmak', icon: '🌍', image: 'alapfogalmak.jpg' },
        { slug: 'ujrahasznositas', title: 'Újrahasznosítás', icon: '♻️', image: 'ujrahasznositas.jpg' },
        { slug: 'vizvedelem', title: 'Vízvédelem', icon: '💧', image: 'vizvedelem.jpg' },
        { slug: 'erdok', title: 'Erdők', icon: '🌳', image: 'erdok.jpg' },
    ];

    for (const topic of topics) {
        await prisma.topic.upsert({
            where: { slug: topic.slug },
            update: {
                title: topic.title,
                icon: topic.icon,
                image: topic.image
            },
            create: {
                slug: topic.slug,
                title: topic.title,
                icon: topic.icon,
                image: topic.image
            }
        });
    }
}

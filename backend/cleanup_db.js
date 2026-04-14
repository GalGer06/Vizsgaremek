const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Keresés a hibás barátkérelmek között...');
  
  // 1. Összes létező felhasználó ID lekérése
  const users = await prisma.user.findMany({ select: { id: true } });
  const userIds = users.map(u => u.id);

  // 2. Hibás kérelmek keresése (ahol a küldő vagy a fogadó nem létezik)
  const orphanded = await prisma.friendrequest.deleteMany({
    where: {
      OR: [
        { requesterId: { notIn: userIds } },
        { receiverId: { notIn: userIds } }
      ]
    }
  });

  console.log(`Sikeresen eltávolítva ${orphanded.count} árva barátkérelem.`);

  // 3. Ha még van bugos kérelem, akkor ezen a ponton az a Rikimik (1) -> andrew (26) kérelem lehet, ha az bugolt be
  const specific = await prisma.friendrequest.deleteMany({
    where: {
      OR: [
        { receiverId: 0 }, // Nem létező ID-k
        { requesterId: 26 }, // Ha andrew.ortiz bugolt be
        { receiverId: 26 }
      ]
    }
  });
  
  console.log(`Sikeresen eltávolítva ${specific.count} egyéb hibás kérelem.`);
}

main()
  .catch(e => {
    console.error('Hiba történt:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

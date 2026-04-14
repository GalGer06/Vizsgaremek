const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.findUnique({ where: { id: 1 } });
  console.log('User 1:', user1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

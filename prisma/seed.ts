import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "test@test.com";

  let user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    const hashedPassword = await bcrypt.hash("adminadmin", 10);

    user = await prisma.user.create({
      data: {
        email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
        role: Role.ADMIN,
      },
    });
  }

  await prisma.reservation.create({
    data: {
      userId: user.id,
      since: new Date("October 15, 2022 12:00:00").toISOString(),
      until: new Date("October 20, 2022 12:00:00").toISOString(),
      guests: ["Test Test", "Test2 Test2"],
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "test@test.com";
  const firstName = "Test";
  const lastName = "User";
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
        firstName,
        lastName,
      },
    });
  }

  await prisma.reservation.create({
    data: {
      userId: user.id,
      since: new Date("2022-07-01 10:00:00").toISOString(),
      until: new Date("2022-07-08 16:00:00").toISOString(),
      guests: ["Test", "Test2"],
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

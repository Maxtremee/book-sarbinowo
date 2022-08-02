import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import logger from "~/logger";

const prisma = new PrismaClient();

async function seed() {
  const email = "test@test.com";
  const name = "Test";
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
        name,
      },
    });
  }

  await prisma.reservation.create({
    data: {
      userId: user.id,
      since: new Date("2022-07-01 10:00:00").toISOString(),
      until: new Date("2022-07-08 16:00:00").toISOString(),
      guests: {
        createMany: {
          data: [
            { name: "Test 1", email: "test@test.com" },
            { name: "Test 2" },
          ],
        },
      },
    },
  });

  logger.info(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

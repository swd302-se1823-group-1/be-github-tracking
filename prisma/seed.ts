import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

async function main() {
  const admin = await prisma.user.findFirst({
    where: {
      role: UserRole.ADMIN,
    },
  });

  if (admin) {
    console.log('✅ Admin user already exists:', admin.email);
    throw new Error('Admin user already exists');
  }
  const adminUser = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || '',
      full_name: process.env.ADMIN_FULLNAME || '',
      role: UserRole.ADMIN,
    },
  });
  return {
    adminUser,
  };
}

main()
  .then(async ({ adminUser }) => {
    console.log(`✅ Admin user created: ${adminUser.email}`);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

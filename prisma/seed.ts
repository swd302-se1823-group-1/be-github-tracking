import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };

async function main() {
  const superAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPERADMIN,
    },
  });

  if (superAdmin) {
    console.log('✅ Super admin user already exists:', superAdmin.email);
    throw new Error('Super admin user already exists');
  }
  const superAdminUser = await prisma.user.create({
    data: {
      email: process.env.SUPER_ADMIN_EMAIL || '',
      full_name: process.env.SUPER_ADMIN_FULLNAME || '',
      role: UserRole.SUPERADMIN,
    },
  });
  return {
    superAdminUser,
  };
}

main()
  .then(async ({ superAdminUser }) => {
    console.log(`✅ Super admin user created: ${superAdminUser.email}`);
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

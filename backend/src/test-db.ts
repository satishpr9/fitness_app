import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }
  console.log('Testing connection to Database...');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected, NOW() as current_time;`;
    console.log('✅ Connection Successful!', result);
  } catch (error: any) {
    console.error('❌ Connection Failed:', error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

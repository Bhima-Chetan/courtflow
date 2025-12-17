import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import type { DriverAdapter } from '@prisma/driver-adapter-utils';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;
  // PrismaNeon takes PoolConfig (connection string object), not a Pool instance
  const neonAdapter = new PrismaNeon({ connectionString });
  
  return new PrismaClient({
    adapter: neonAdapter as unknown as DriverAdapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

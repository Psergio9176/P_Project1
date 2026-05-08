import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'test') {
  prisma.$connect().catch(() => {
    console.warn('Prisma connection will be established on first query');
  });
}

export default prisma;

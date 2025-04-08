import { PrismaClient } from '@prisma/client';
import { config } from '../config/config.js';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
});

if (config.env !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Handle Prisma Client errors
prisma.$on('error', (e) => {
    console.error('Prisma Client Error:', e);
});

// Handle Prisma Client connection
prisma.$connect()
    .then(() => {
        console.log('Prisma Client connected successfully');
    })
    .catch((error) => {
        console.error('Prisma Client connection error:', error);
        process.exit(1);
    });

// Handle process termination
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

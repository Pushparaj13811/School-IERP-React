import { PrismaClient } from '@prisma/client';
import { config } from '../config/config.js';

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting your database connection limit.
 * In production, we implement connection pooling for better performance.
 */

// Connection pooling configuration - will be used by external connection pooler
const poolConfig = {
  // Maximum number of connections in the pool
  max_connections: process.env.DB_POOL_MAX || 20,
  // Connection timeout in milliseconds
  connection_timeout: process.env.DB_POOL_TIMEOUT || 30000,
  // Minimum idle connections maintained in the pool
  min_idle: process.env.DB_POOL_MIN || 5
};

// Prisma singleton with connection management
class PrismaClientSingleton {
  constructor() {
    this.prismaClient = new PrismaClient({
      log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty'
      // NOTE: Connection pooling is handled by Prisma internally
      // and can be further enhanced using PgBouncer or similar tools
    });

    // Handle Prisma Client errors
    this.prismaClient.$on('error', (e) => {
      console.error('Prisma Client Error:', e);
    });

    // Connect to the database
    this.connect();

    // Handle process termination
    this.handleTermination();
  }

  async connect() {
    try {
      await this.prismaClient.$connect();
      console.log('Prisma Client connected successfully with connection pooling');
    } catch (error) {
      console.error('Prisma Client connection error:', error);
      process.exit(1);
    }
  }

  handleTermination() {
    process.on('beforeExit', async () => {
      await this.prismaClient.$disconnect();
      console.log('Prisma Client disconnected');
    });

    // Also handle other termination signals
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, async () => {
        console.log(`${signal} received, closing Prisma connection pool`);
        await this.prismaClient.$disconnect();
        process.exit(0);
      });
    });
  }

  getInstance() {
    return this.prismaClient;
  }
}

// Create a global singleton instance
const globalForPrisma = global;
globalForPrisma.prisma = globalForPrisma.prisma || new PrismaClientSingleton().getInstance();

// Export the Prisma client instance
export const prisma = globalForPrisma.prisma;

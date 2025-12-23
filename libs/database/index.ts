import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/ccardfinder'

// Configure PostgreSQL to use Central Time (GMT-6/GMT-5 with DST)
// For fixed GMT-6 without DST, use: 'Etc/GMT+6'
const TIMEZONE = process.env.TZ || 'America/Chicago'

// Create PostgreSQL connection pool with timezone setting
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
})

// Set timezone for all connections in the pool
pool.on('connect', (client) => {
  client.query(`SET timezone = '${TIMEZONE}'`)
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// This prevents multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
export * from '@prisma/client'
export * from './timezone'
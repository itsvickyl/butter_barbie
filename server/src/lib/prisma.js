const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Create a Prisma Postgres adapter using the DATABASE_URL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Create PrismaClient with the driver adapter
const prisma = new PrismaClient({ adapter });

module.exports = prisma;

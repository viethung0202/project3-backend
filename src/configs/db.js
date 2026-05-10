// src/config/db.js
import { PrismaClient } from '../generated/prisma/index.js';
import pkg from 'pg';

const { Pool } = pkg;

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Pool connected');
    client.release();

    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Prisma Client connected');
  } catch (error) {
    console.error('❌ DB Connection Error:', error.message);
    process.exit(1);
  }
};

export { prisma, pool, connectDB };

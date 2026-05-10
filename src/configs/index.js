// src/config/index.js
import { prisma, pool, connectDB } from './db.js';

export { prisma, pool, connectDB };
export default prisma; // export default là Prisma (dùng nhiều nhất)

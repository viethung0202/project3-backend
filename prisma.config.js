// prisma.config.js

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma', // Giữ nguyên hoặc dùng "./prisma"

  migrations: {
    path: 'prisma/migrations',
  },

  // Thêm dòng này để buộc Prisma dùng PostgreSQL
  datasource: {
    provider: 'postgresql',
    url: env('DATABASE_URL'),
  },
});

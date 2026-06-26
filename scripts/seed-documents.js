// Script seed documents qua API
// Run: node scripts/seed-documents.js
//
// 1. Tạo/find ACADEMIC_STAFF user
// 2. Login lấy cookie
// 3. Lấy danh sách course để gắn
// 4. Upload 6 file mẫu với setting khác nhau

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import FormData from 'form-data';
import bcrypt from 'bcryptjs';
import prisma from '../src/configs/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_DIR = path.join(__dirname, 'sample-files');
const API = 'http://localhost:3678/api';

const TEST_USER = {
  email: 'test-academic@example.com',
  password: '123456',
  fullName: 'Academic Staff Test',
  role: 'ACADEMIC_STAFF',
};

// Plan 6 document — setting khác nhau
const PLAN = [
  {
    file: 'toeic-vocab-unit1.txt',
    title: 'TOEIC Basic - Unit 1 Vocabulary',
    description: 'Từ vựng cơ bản unit 1 - 10 từ thường gặp trong bài thi TOEIC',
    isPublished: true,
    allowDownload: true,
    attachToCourse: true, // gắn course đầu tiên
  },
  {
    file: 'writing-tips.txt',
    title: 'Email Writing - Formal vs Informal',
    description: 'So sánh cách viết email formal và informal cho giáo viên tham khảo',
    isPublished: false, // NỘI BỘ - học sinh không thấy
    allowDownload: true,
    attachToCourse: false,
  },
  {
    file: 'listening-script-part1.md',
    title: 'TOEIC Listening Part 1 - Sample Script',
    description: 'Script luyện nghe Part 1 với đáp án',
    isPublished: true,
    allowDownload: false, // CHỈ XEM ONLINE
    attachToCourse: true,
  },
  {
    file: 'toeic-passing-scores.csv',
    title: 'TOEIC Passing Scores by Level',
    description: 'Bảng điểm pass theo trình độ cho 4 kỹ năng',
    isPublished: true,
    allowDownload: true,
    attachToCourse: false, // chung
  },
  {
    file: 'grammar-cheatsheet.md',
    title: 'English Grammar Cheatsheet for TOEIC',
    description: '12 thì tiếng Anh + những bẫy ngữ pháp thường gặp',
    isPublished: true,
    allowDownload: true,
    attachToCourse: true,
  },
  {
    file: 'teacher-only-answer-key.txt',
    title: '[INTERNAL] Answer Key - TOEIC Unit 1-5',
    description: 'Đáp án các unit 1-5 — CHỈ DÀNH CHO GIÁO VIÊN',
    isPublished: false, // NỘI BỘ
    allowDownload: false,
    attachToCourse: false,
  },
];

async function ensureUser() {
  let user = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user) {
    const hashed = await bcrypt.hash(TEST_USER.password, 10);
    user = await prisma.user.create({
      data: {
        email: TEST_USER.email,
        password: hashed,
        fullName: TEST_USER.fullName,
        role: TEST_USER.role,
        isActive: true,
      },
      select: { id: true, email: true, role: true, isActive: true },
    });
    console.log(`✓ Created user: ${user.email}`);
  } else {
    if (user.role !== 'ACADEMIC_STAFF') {
      throw new Error(
        `User ${user.email} exists but role = ${user.role}, expected ACADEMIC_STAFF`,
      );
    }
    if (!user.isActive) {
      throw new Error(`User ${user.email} bị khoá`);
    }
    console.log(`✓ User exists: ${user.email}`);
  }
  return user;
}

async function login() {
  const res = await axios.post(
    `${API}/auth/login`,
    { email: TEST_USER.email, password: TEST_USER.password },
    { withCredentials: true },
  );
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) throw new Error('Không nhận được cookie từ login');
  // cookie format: "token=...; Path=/; ..." — chỉ cần lấy phần "token=..."
  const tokenCookie = setCookie
    .map((c) => c.split(';')[0])
    .find((c) => c.startsWith('token='));
  if (!tokenCookie) throw new Error('Không tìm thấy cookie "token"');
  console.log(`✓ Logged in`);
  return tokenCookie;
}

async function listCourses(cookie) {
  const res = await axios.get(`${API}/courses`, {
    headers: { Cookie: cookie },
  });
  return res.data?.data || [];
}

async function uploadOne(cookie, item, courseId) {
  const filePath = path.join(SAMPLE_DIR, item.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Không tìm thấy file mẫu: ${filePath}`);
  }
  const form = new FormData();
  form.append('title', item.title);
  form.append('description', item.description);
  form.append('isPublished', String(item.isPublished));
  form.append('allowDownload', String(item.allowDownload));
  if (item.attachToCourse && courseId) form.append('courseId', courseId);
  form.append('file', fs.createReadStream(filePath));

  const res = await axios.post(`${API}/documents`, form, {
    headers: {
      ...form.getHeaders(),
      Cookie: cookie,
    },
    maxBodyLength: Infinity,
  });
  return res.data?.data;
}

async function main() {
  console.log('--- Seed Documents ---\n');

  await ensureUser();
  const cookie = await login();

  const courses = await listCourses(cookie);
  const targetCourseId = courses[0]?.id || null;
  console.log(
    `✓ Found ${courses.length} course(s).${
      targetCourseId
        ? ` Sẽ gắn 1 số doc vào: "${courses[0].title}"`
        : ' Không có course nào — sẽ upload tất cả dạng chung'
    }\n`,
  );

  let ok = 0;
  for (const item of PLAN) {
    try {
      const courseId = item.attachToCourse ? targetCourseId : null;
      const created = await uploadOne(cookie, item, courseId);
      console.log(
        `  ✓ ${item.file.padEnd(35)} → ${created.title} ${
          created.isPublished ? '[PUBLIC]' : '[INTERNAL]'
        }${created.allowDownload ? '' : ' [VIEW-ONLY]'}${
          created.courseId ? ' [in course]' : ''
        }`,
      );
      ok++;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error(`  ✗ ${item.file}: ${msg}`);
    }
  }

  console.log(`\n--- Done: ${ok}/${PLAN.length} uploaded ---`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('FATAL:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});

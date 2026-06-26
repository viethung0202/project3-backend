// Seed flashcard set cho Module 1 của course "Listening Beginner"
// Run: node scripts/seed-listening-beginner-flashcards.js

import axios from 'axios';
import FormData from 'form-data';

const API = 'http://localhost:3678/api';
const LOGIN = { email: 'test-academic@example.com', password: '123456' };

// Flashcard set cho Listening Part 1 (mô tả tranh)
const FLASHCARD_SET = {
  title: 'TOEIC Listening Part 1 - Action Verbs',
  description:
    'Từ vựng hành động thường gặp trong Part 1 (mô tả tranh) — dạng -ing',
};

const CARDS = [
  { front: 'sitting at a desk', back: 'đang ngồi ở bàn làm việc' },
  { front: 'standing in line', back: 'đang xếp hàng' },
  { front: 'reading a newspaper', back: 'đang đọc báo' },
  { front: 'typing on a laptop', back: 'đang gõ máy tính' },
  { front: 'pouring coffee', back: 'đang rót cà phê' },
  { front: 'shaking hands', back: 'đang bắt tay' },
  { front: 'waiting for a train', back: 'đang đợi tàu' },
  { front: 'crossing the street', back: 'đang băng qua đường' },
  { front: 'looking at a screen', back: 'đang nhìn vào màn hình' },
  { front: 'writing on a board', back: 'đang viết lên bảng' },
  { front: 'pushing a cart', back: 'đang đẩy xe đẩy' },
  { front: 'climbing stairs', back: 'đang leo cầu thang' },
  { front: 'opening a window', back: 'đang mở cửa sổ' },
  { front: 'carrying a box', back: 'đang xách thùng' },
  { front: 'pointing at a map', back: 'đang chỉ vào bản đồ' },
  { front: 'wearing a uniform', back: 'đang mặc đồng phục' },
  { front: 'cleaning the floor', back: 'đang lau sàn' },
  { front: 'arranging flowers', back: 'đang sắp xếp hoa' },
  { front: 'examining a document', back: 'đang xem xét tài liệu' },
  { front: 'taking notes', back: 'đang ghi chú' },
];

let COOKIE = '';

async function login() {
  const res = await axios.post(`${API}/auth/login`, LOGIN);
  const sc = res.headers['set-cookie'];
  COOKIE = sc.map((c) => c.split(';')[0]).find((c) => c.startsWith('token='));
  console.log(`✓ Logged in`);
}

const auth = () => ({ headers: { Cookie: COOKIE } });

async function findCourse() {
  const res = await axios.get(`${API}/courses`, auth());
  const courses = res.data?.data || [];
  const found = courses.find((c) => {
    const t = c.title.toLowerCase();
    return t.includes('listening') && t.includes('beginner');
  });
  if (!found) {
    console.error('Có các course sau:');
    courses.forEach((c) => console.error(`  - ${c.title}`));
    throw new Error('Không tìm thấy course "listening beginner"');
  }
  console.log(`✓ Found course: "${found.title}"`);
  return found;
}

async function getModule1(courseId) {
  // Lấy course detail có kèm modules
  const res = await axios.get(`${API}/courses/${courseId}`, auth());
  const modules = res.data?.data?.modules || [];
  if (modules.length === 0) {
    throw new Error('Course chưa có module nào — không thể seed flashcards');
  }
  const mod1 = modules.find((m) => m.order === 1) || modules[0];
  console.log(`✓ Module 1: "${mod1.title}"`);
  return mod1;
}

async function createFlashcardSet(moduleId, data) {
  const res = await axios.post(
    `${API}/modules/${moduleId}/flashcard-sets`,
    data,
    auth(),
  );
  return res.data?.data;
}

async function createFlashcard(setId, card) {
  const form = new FormData();
  form.append('front', card.front);
  form.append('back', card.back);
  const res = await axios.post(
    `${API}/flashcard-sets/${setId}/flashcards`,
    form,
    { headers: { ...form.getHeaders(), Cookie: COOKIE } },
  );
  return res.data?.data;
}

async function main() {
  console.log('--- Seed Listening Beginner Module 1 Flashcards ---\n');

  await login();
  const course = await findCourse();
  const module1 = await getModule1(course.id);

  console.log(`\nTạo flashcard set "${FLASHCARD_SET.title}"...`);
  const set = await createFlashcardSet(module1.id, FLASHCARD_SET);
  console.log(`✓ Set created: ${set.id}\n`);

  console.log(`Tạo ${CARDS.length} flashcards...`);
  let ok = 0;
  for (const card of CARDS) {
    try {
      await createFlashcard(set.id, card);
      console.log(`  ✓ ${card.front.padEnd(28)} → ${card.back}`);
      ok++;
    } catch (e) {
      console.error(
        `  ✗ ${card.front}:`,
        e.response?.data?.message || e.message,
      );
    }
  }

  console.log(`\n--- Done: ${ok}/${CARDS.length} cards added ---`);
}

main().catch((err) => {
  console.error('FATAL:', err.response?.data || err.message);
  process.exit(1);
});

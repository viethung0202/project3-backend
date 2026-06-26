// Seed nội dung cho course "Reading Beginner" qua API
// Run: node scripts/seed-reading-beginner.js
//
// 1. Login ACADEMIC_STAFF (test-academic@example.com / 123456)
// 2. Tìm course có title chứa "reading" và "beginner"
// 3. Tạo 3 module, mỗi module có lesson + flashcard set + quiz

import axios from 'axios';
import FormData from 'form-data';

const API = 'http://localhost:3678/api';
const LOGIN = { email: 'test-academic@example.com', password: '123456' };

// ============== PLAN ==============
const PLAN = [
  {
    module: {
      title: 'Module 1 - Reading Fundamentals',
      description: 'Các kỹ năng đọc cơ bản: skimming, scanning, tìm ý chính',
    },
    lessons: [
      {
        title: 'Lesson 1 - Skimming for Main Idea',
        content:
          'Skimming là kỹ thuật đọc nhanh để nắm ý chính của đoạn văn.\n\n' +
          'Cách làm:\n' +
          '1. Đọc tiêu đề và sub-heading\n' +
          '2. Đọc câu đầu và câu cuối của mỗi đoạn\n' +
          '3. Bỏ qua chi tiết, tập trung vào keywords\n' +
          '4. Mục tiêu: hiểu "what is this about?" trong 30 giây',
      },
      {
        title: 'Lesson 2 - Scanning for Specific Information',
        content:
          'Scanning là kỹ thuật tìm thông tin cụ thể (số, tên, ngày tháng) nhanh.\n\n' +
          'Cách làm:\n' +
          '1. Xác định loại thông tin cần tìm (number? name? date?)\n' +
          '2. Mắt lướt theo dòng tìm pattern (chữ in hoa = tên riêng, số = quantity...)\n' +
          '3. Không đọc từng chữ — chỉ "scan" toàn trang',
      },
      {
        title: 'Lesson 3 - Identifying Main vs Supporting Ideas',
        content:
          'Trong mỗi đoạn văn:\n\n' +
          '- Main idea (ý chính): thường ở câu đầu hoặc câu cuối\n' +
          '- Supporting ideas (ý phụ): ví dụ, dẫn chứng, giải thích chi tiết\n\n' +
          'Mẹo: hỏi "tác giả muốn nói gì nhất?" → đó là main idea.',
      },
    ],
    flashcardSet: {
      title: 'Reading Basics Vocabulary',
      description: '12 từ vựng quan trọng về kỹ năng đọc',
    },
    flashcards: [
      { front: 'skim', back: 'đọc lướt để nắm ý chính' },
      { front: 'scan', back: 'đọc lướt để tìm thông tin cụ thể' },
      { front: 'main idea', back: 'ý chính của đoạn văn' },
      { front: 'supporting detail', back: 'ý phụ hỗ trợ cho ý chính' },
      { front: 'context clue', back: 'manh mối ngữ cảnh để đoán nghĩa từ' },
      { front: 'infer', back: 'suy luận, suy ra' },
      { front: 'topic sentence', back: 'câu chủ đề của đoạn văn' },
      { front: 'paraphrase', back: 'diễn đạt lại bằng từ khác' },
      { front: 'summarize', back: 'tóm tắt' },
      { front: 'scan-read', back: 'đọc lướt nhanh để tìm keyword' },
      { front: 'comprehension', back: 'khả năng hiểu nội dung đọc' },
      { front: 'passage', back: 'đoạn văn / bài đọc' },
    ],
    quiz: {
      title: 'Quiz - Reading Basics',
      description: 'Kiểm tra kiến thức về kỹ năng đọc cơ bản',
      passingScore: 60,
      timeLimit: 10,
      questions: [
        {
          content: 'Skimming là kỹ thuật gì?',
          type: 'SINGLE_CHOICE',
          points: 1,
          answers: [
            { content: 'Đọc lướt để nắm ý chính', isCorrect: true },
            { content: 'Đọc kỹ từng từ', isCorrect: false },
            { content: 'Tra từ điển cho mọi từ mới', isCorrect: false },
            { content: 'Dịch sang tiếng Việt', isCorrect: false },
          ],
        },
        {
          content: 'Scanning được dùng khi bạn cần ___?',
          type: 'SINGLE_CHOICE',
          points: 1,
          answers: [
            { content: 'Tìm một thông tin cụ thể như số hoặc tên', isCorrect: true },
            { content: 'Hiểu tổng thể đoạn văn', isCorrect: false },
            { content: 'Luyện phát âm', isCorrect: false },
            { content: 'Học từ vựng mới', isCorrect: false },
          ],
        },
        {
          content: 'Trong một đoạn văn, main idea thường nằm ở đâu?',
          type: 'MULTIPLE_CHOICE',
          points: 2,
          answers: [
            { content: 'Câu đầu tiên', isCorrect: true },
            { content: 'Câu cuối cùng', isCorrect: true },
            { content: 'Giữa đoạn (luôn luôn)', isCorrect: false },
            { content: 'Trong supporting details', isCorrect: false },
          ],
        },
        {
          content: 'Đọc lướt nên mất khoảng 30 giây cho mỗi đoạn ngắn.',
          type: 'TRUE_FALSE',
          points: 1,
          answers: [
            { content: 'True', isCorrect: true },
            { content: 'False', isCorrect: false },
          ],
        },
        {
          content: '"Paraphrase" có nghĩa là gì?',
          type: 'SINGLE_CHOICE',
          points: 1,
          answers: [
            { content: 'Diễn đạt lại bằng từ khác', isCorrect: true },
            { content: 'Dịch nguyên văn', isCorrect: false },
            { content: 'Đọc to thành tiếng', isCorrect: false },
            { content: 'Viết hoa', isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    module: {
      title: 'Module 2 - Vocabulary in Context',
      description: 'Đoán nghĩa từ qua ngữ cảnh, synonym, antonym',
    },
    lessons: [
      {
        title: 'Lesson 1 - Context Clues',
        content:
          'Khi gặp từ mới, đừng tra từ điển ngay. Hãy dùng context clues:\n\n' +
          '1. Definition clue: từ đó được định nghĩa ngay trong câu\n' +
          '   VD: "A pediatrician — a doctor who treats children — examined her."\n\n' +
          '2. Synonym clue: từ đồng nghĩa xuất hiện gần đó\n' +
          '   VD: "He was reluctant, unwilling to make a decision."\n\n' +
          '3. Antonym clue: từ trái nghĩa\n' +
          '   VD: "Unlike his cheerful brother, he was morose."',
      },
      {
        title: 'Lesson 2 - Synonyms and Antonyms in TOEIC',
        content:
          'TOEIC thường test khả năng nhận biết synonyms (đồng nghĩa).\n\n' +
          'Một số cặp common:\n' +
          '- begin = commence = initiate\n' +
          '- end = conclude = terminate\n' +
          '- show = demonstrate = illustrate\n' +
          '- help = assist = aid\n' +
          '- big = large = enormous',
      },
    ],
    flashcardSet: {
      title: 'TOEIC Common Synonyms',
      description: 'Các cặp đồng nghĩa hay xuất hiện trong TOEIC Reading',
    },
    flashcards: [
      { front: 'commence', back: 'bắt đầu (= begin, start)' },
      { front: 'terminate', back: 'kết thúc (= end, conclude)' },
      { front: 'demonstrate', back: 'chứng minh, thể hiện (= show)' },
      { front: 'assist', back: 'giúp đỡ (= help, aid)' },
      { front: 'enormous', back: 'khổng lồ (= huge, very large)' },
      { front: 'diminish', back: 'giảm dần (= decrease, reduce)' },
      { front: 'enhance', back: 'nâng cao, cải thiện (= improve)' },
      { front: 'reluctant', back: 'miễn cưỡng (= unwilling, hesitant)' },
      { front: 'acquire', back: 'có được (= obtain, get)' },
      { front: 'sufficient', back: 'đủ (= enough, adequate)' },
    ],
    quiz: {
      title: 'Quiz - Vocabulary in Context',
      description: 'Kiểm tra từ vựng và context clues',
      passingScore: 70,
      timeLimit: 8,
      questions: [
        {
          content: 'Từ nào sau đây đồng nghĩa với "begin"?',
          type: 'MULTIPLE_CHOICE',
          points: 2,
          answers: [
            { content: 'commence', isCorrect: true },
            { content: 'initiate', isCorrect: true },
            { content: 'terminate', isCorrect: false },
            { content: 'finish', isCorrect: false },
          ],
        },
        {
          content: '"He was reluctant to sign the contract" — reluctant nghĩa là gì?',
          type: 'SINGLE_CHOICE',
          points: 1,
          answers: [
            { content: 'Miễn cưỡng, do dự', isCorrect: true },
            { content: 'Vui vẻ', isCorrect: false },
            { content: 'Tức giận', isCorrect: false },
            { content: 'Mệt mỏi', isCorrect: false },
          ],
        },
        {
          content: '"Diminish" và "enhance" là cặp từ ___?',
          type: 'SINGLE_CHOICE',
          points: 1,
          answers: [
            { content: 'Trái nghĩa (antonyms)', isCorrect: true },
            { content: 'Đồng nghĩa (synonyms)', isCorrect: false },
            { content: 'Đồng âm (homophones)', isCorrect: false },
            { content: 'Không liên quan', isCorrect: false },
          ],
        },
        {
          content: '"Sufficient" có nghĩa là "đủ".',
          type: 'TRUE_FALSE',
          points: 1,
          answers: [
            { content: 'True', isCorrect: true },
            { content: 'False', isCorrect: false },
          ],
        },
      ],
    },
  },
  {
    module: {
      title: 'Module 3 - Sentence Structure',
      description: 'Cấu trúc câu cơ bản trong TOEIC Reading',
    },
    lessons: [
      {
        title: 'Lesson 1 - Subject-Verb Agreement',
        content:
          'Quy tắc cơ bản: chủ ngữ số ít → động từ số ít; chủ ngữ số nhiều → động từ số nhiều.\n\n' +
          'Lưu ý các bẫy TOEIC:\n' +
          '- "Each of the students HAS" (không phải HAVE)\n' +
          '- "Neither A nor B IS" (không phải ARE)\n' +
          '- "The number of students IS" / "A number of students ARE"\n' +
          '- "Everyone HAS" (everyone = số ít)',
      },
      {
        title: 'Lesson 2 - Common Sentence Patterns',
        content:
          '5 patterns cơ bản nhất:\n\n' +
          '1. S + V (intransitive)\n' +
          '   "The price increased."\n\n' +
          '2. S + V + O\n' +
          '   "I bought a book."\n\n' +
          '3. S + V + IO + DO\n' +
          '   "He gave me a present."\n\n' +
          '4. S + V + O + OC (object complement)\n' +
          '   "We elected her president."\n\n' +
          '5. S + V + C (subject complement, with be/seem/become)\n' +
          '   "She is a teacher."',
      },
    ],
    flashcardSet: {
      title: 'Grammar Terms Glossary',
      description: 'Thuật ngữ ngữ pháp cơ bản',
    },
    flashcards: [
      { front: 'subject', back: 'chủ ngữ' },
      { front: 'verb', back: 'động từ' },
      { front: 'object', back: 'tân ngữ' },
      { front: 'complement', back: 'bổ ngữ' },
      { front: 'transitive verb', back: 'động từ có tân ngữ (need object)' },
      { front: 'intransitive verb', back: 'động từ không có tân ngữ' },
      { front: 'agreement', back: 'sự hoà hợp (chủ ngữ - động từ)' },
      { front: 'tense', back: 'thì (quá khứ, hiện tại, tương lai)' },
    ],
    quiz: {
      title: 'Quiz - Sentence Structure',
      description: 'Test ngữ pháp cơ bản',
      passingScore: 60,
      timeLimit: 10,
      questions: [
        {
          content: 'Câu nào sau đây ĐÚNG về subject-verb agreement?',
          type: 'SINGLE_CHOICE',
          points: 1,
          answers: [
            { content: 'Each of the students has a book.', isCorrect: true },
            { content: 'Each of the students have a book.', isCorrect: false },
            { content: 'Each of the students having a book.', isCorrect: false },
            { content: 'Each of the students are a book.', isCorrect: false },
          ],
        },
        {
          content: 'Với "Neither A nor B", động từ chia theo:',
          type: 'SINGLE_CHOICE',
          points: 1,
          answers: [
            { content: 'B (chủ ngữ gần nhất)', isCorrect: true },
            { content: 'A', isCorrect: false },
            { content: 'Luôn là số nhiều', isCorrect: false },
            { content: 'Luôn là số ít', isCorrect: false },
          ],
        },
        {
          content: 'Đâu là transitive verbs (cần object)?',
          type: 'MULTIPLE_CHOICE',
          points: 2,
          answers: [
            { content: 'buy', isCorrect: true },
            { content: 'send', isCorrect: true },
            { content: 'sleep', isCorrect: false },
            { content: 'arrive', isCorrect: false },
          ],
        },
        {
          content: '"She is a teacher" — "a teacher" là subject complement.',
          type: 'TRUE_FALSE',
          points: 1,
          answers: [
            { content: 'True', isCorrect: true },
            { content: 'False', isCorrect: false },
          ],
        },
      ],
    },
  },
];

// ============== HELPERS ==============
let COOKIE = '';

async function login() {
  const res = await axios.post(`${API}/auth/login`, LOGIN);
  const sc = res.headers['set-cookie'];
  if (!sc) throw new Error('No cookie from login');
  COOKIE = sc.map((c) => c.split(';')[0]).find((c) => c.startsWith('token='));
  if (!COOKIE) throw new Error('No token cookie');
  console.log(`✓ Logged in as ${LOGIN.email}`);
}

function authConfig() {
  return { headers: { Cookie: COOKIE } };
}

async function findCourse() {
  const res = await axios.get(`${API}/courses`, authConfig());
  const courses = res.data?.data || [];
  // Tìm course có title chứa cả "reading" và "beginner" (case-insensitive)
  const found = courses.find((c) => {
    const t = c.title.toLowerCase();
    return t.includes('reading') && t.includes('beginner');
  });
  if (!found) {
    console.error('Có các course sau:');
    courses.forEach((c) => console.error(`  - ${c.title}`));
    throw new Error('Không tìm thấy course chứa "reading" và "beginner"');
  }
  console.log(`✓ Found course: "${found.title}" (${found.id})`);
  return found;
}

async function createModule(courseId, data) {
  const res = await axios.post(
    `${API}/courses/${courseId}/modules`,
    data,
    authConfig(),
  );
  return res.data?.data;
}

async function createLesson(moduleId, data) {
  // Lesson endpoint dùng multer.fields → send as multipart form
  const form = new FormData();
  form.append('title', data.title);
  if (data.content) form.append('content', data.content);
  const res = await axios.post(
    `${API}/modules/${moduleId}/lessons`,
    form,
    {
      headers: { ...form.getHeaders(), Cookie: COOKIE },
    },
  );
  return res.data?.data;
}

async function createFlashcardSet(moduleId, data) {
  const res = await axios.post(
    `${API}/modules/${moduleId}/flashcard-sets`,
    data,
    authConfig(),
  );
  return res.data?.data;
}

async function createFlashcard(setId, data) {
  // Flashcard endpoint dùng upload.single('image') → multipart
  const form = new FormData();
  form.append('front', data.front);
  form.append('back', data.back);
  const res = await axios.post(
    `${API}/flashcard-sets/${setId}/flashcards`,
    form,
    {
      headers: { ...form.getHeaders(), Cookie: COOKIE },
    },
  );
  return res.data?.data;
}

async function createQuiz(moduleId, data) {
  const res = await axios.post(
    `${API}/modules/${moduleId}/quizzes`,
    {
      title: data.title,
      description: data.description,
      passingScore: data.passingScore,
      timeLimit: data.timeLimit,
    },
    authConfig(),
  );
  return res.data?.data;
}

async function createQuestion(quizId, data) {
  const res = await axios.post(
    `${API}/quizzes/${quizId}/questions`,
    {
      content: data.content,
      type: data.type,
      points: data.points,
    },
    authConfig(),
  );
  return res.data?.data;
}

async function createAnswer(questionId, data) {
  const res = await axios.post(
    `${API}/questions/${questionId}/answers`,
    { content: data.content, isCorrect: data.isCorrect },
    authConfig(),
  );
  return res.data?.data;
}

// ============== MAIN ==============
async function main() {
  console.log('--- Seed Reading Beginner ---\n');

  await login();
  const course = await findCourse();
  console.log('');

  let modCount = 0;
  let lessonCount = 0;
  let setCount = 0;
  let cardCount = 0;
  let quizCount = 0;
  let qCount = 0;

  for (const plan of PLAN) {
    try {
      const m = await createModule(course.id, plan.module);
      console.log(`✓ Module: ${m.title}`);
      modCount++;

      // Lessons
      for (const lesson of plan.lessons) {
        try {
          const l = await createLesson(m.id, lesson);
          console.log(`    + Lesson: ${l.title}`);
          lessonCount++;
        } catch (e) {
          console.error(
            `    ✗ Lesson "${lesson.title}":`,
            e.response?.data?.message || e.message,
          );
        }
      }

      // Flashcard set + cards
      try {
        const s = await createFlashcardSet(m.id, plan.flashcardSet);
        console.log(`    + Flashcard set: ${s.title}`);
        setCount++;
        for (const card of plan.flashcards) {
          try {
            await createFlashcard(s.id, card);
            cardCount++;
          } catch (e) {
            console.error(
              `      ✗ Card "${card.front}":`,
              e.response?.data?.message || e.message,
            );
          }
        }
        console.log(`      → ${plan.flashcards.length} cards`);
      } catch (e) {
        console.error(
          `    ✗ Flashcard set:`,
          e.response?.data?.message || e.message,
        );
      }

      // Quiz + questions + answers
      try {
        const q = await createQuiz(m.id, plan.quiz);
        console.log(`    + Quiz: ${q.title}`);
        quizCount++;
        for (const question of plan.quiz.questions) {
          try {
            const qst = await createQuestion(q.id, question);
            for (const ans of question.answers) {
              await createAnswer(qst.id, ans);
            }
            qCount++;
          } catch (e) {
            console.error(
              `      ✗ Question:`,
              e.response?.data?.message || e.message,
            );
          }
        }
        console.log(`      → ${plan.quiz.questions.length} questions`);
      } catch (e) {
        console.error(`    ✗ Quiz:`, e.response?.data?.message || e.message);
      }

      console.log('');
    } catch (e) {
      console.error(
        `✗ Module "${plan.module.title}":`,
        e.response?.data?.message || e.message,
      );
    }
  }

  console.log('--- Summary ---');
  console.log(`Modules:   ${modCount}`);
  console.log(`Lessons:   ${lessonCount}`);
  console.log(`Sets:      ${setCount}`);
  console.log(`Cards:     ${cardCount}`);
  console.log(`Quizzes:   ${quizCount}`);
  console.log(`Questions: ${qCount}`);
}

main().catch((err) => {
  console.error('FATAL:', err.response?.data || err.message);
  process.exit(1);
});

import prisma from '../configs/index.js';

// Cho phép xem: enrolled student, teacher dạy course, ACADEMIC_STAFF, ADMIN
const assertCanView = async (userId, role, courseId) => {
  if (role === 'ADMIN' || role === 'ACADEMIC_STAFF') return;

  if (role === 'TEACHER') {
    const teaching = await prisma.courseTeacher.findUnique({
      where: { courseId_teacherId: { courseId, teacherId: userId } },
    });
    if (!teaching) throw new Error('Bạn không phải giáo viên của khóa này');
    return;
  }

  if (role === 'STUDENT') {
    const enrolled = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: userId, courseId } },
    });
    if (!enrolled) throw new Error('Bạn chưa đăng ký khóa học này');
    return;
  }

  throw new Error('Không có quyền truy cập');
};

const computeLeaderboard = async (currentUserId, role, courseId) => {
  if (!courseId) throw new Error('Thiếu courseId');
  await assertCanView(currentUserId, role, courseId);

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
  });

  if (enrollments.length === 0) {
    return { totalQuizzes: 0, totalLessons: 0, items: [] };
  }

  const studentIds = enrollments.map((e) => e.studentId);

  // Tổng số quiz + lesson của khóa
  const [quizzes, totalLessons] = await Promise.all([
    prisma.quiz.findMany({
      where: { module: { courseId } },
      select: { id: true },
    }),
    prisma.lesson.count({ where: { module: { courseId } } }),
  ]);
  const quizIds = quizzes.map((q) => q.id);

  // Lấy best score mỗi quiz cho từng student
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: { in: studentIds },
      quizId: { in: quizIds },
      status: 'COMPLETED',
    },
    select: { studentId: true, quizId: true, score: true },
  });

  // Map: studentId → { quizId → bestScore }
  const bestByStudent = new Map();
  for (const a of attempts) {
    if (!bestByStudent.has(a.studentId)) bestByStudent.set(a.studentId, new Map());
    const inner = bestByStudent.get(a.studentId);
    const cur = inner.get(a.quizId);
    if (cur === undefined || (a.score ?? 0) > cur) {
      inner.set(a.quizId, a.score ?? 0);
    }
  }

  // Đếm lesson completion cho từng student
  const lessonCompletions = totalLessons
    ? await prisma.lessonCompletion.groupBy({
        by: ['studentId'],
        where: {
          studentId: { in: studentIds },
          lesson: { module: { courseId } },
        },
        _count: { _all: true },
      })
    : [];
  const lessonByStudent = new Map(
    lessonCompletions.map((c) => [c.studentId, c._count._all]),
  );

  const items = enrollments.map((e) => {
    const inner = bestByStudent.get(e.studentId) || new Map();
    const scoreValues = [...inner.values()];
    const sumBest = scoreValues.reduce((s, v) => s + v, 0);
    // Cách 2: avg trên TỔNG số quiz của khóa (quiz chưa làm = 0)
    // Nếu khóa không có quiz nào thì để null
    const avgScore =
      quizIds.length > 0
        ? Math.round((sumBest / quizIds.length) * 100) / 100
        : null;

    return {
      student: e.student,
      progress: Math.round(e.progress ?? 0),
      avgScore,
      quizzesDone: scoreValues.length,
      lessonsDone: lessonByStudent.get(e.studentId) || 0,
      isMe: e.studentId === currentUserId,
    };
  });

  // Sort: avg score DESC (null xuống cuối) → progress DESC → tên ASC
  items.sort((a, b) => {
    const aHas = a.avgScore !== null;
    const bHas = b.avgScore !== null;
    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    if (aHas && bHas && a.avgScore !== b.avgScore)
      return b.avgScore - a.avgScore;
    if (a.progress !== b.progress) return b.progress - a.progress;
    return a.student.fullName.localeCompare(b.student.fullName, 'vi');
  });

  // Gán rank (dense rank: tie không tăng)
  let lastKey = null;
  let rank = 0;
  for (const it of items) {
    const key = `${it.avgScore}_${it.progress}`;
    if (key !== lastKey) {
      rank += 1;
      lastKey = key;
    }
    it.rank = rank;
  }

  return {
    totalQuizzes: quizIds.length,
    totalLessons,
    totalStudents: items.length,
    items,
  };
};

export default { computeLeaderboard };

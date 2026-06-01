import prisma from '../configs/index.js';

const courseSummarySelect = {
  id: true,
  title: true,
  description: true,
  thumbnail: true,
  level: true,
  status: true,
  _count: {
    select: {
      modules: true,
    },
  },
};

const getMyCourses = async (studentId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    orderBy: { enrolledAt: 'desc' },
    select: {
      id: true,
      progress: true,
      enrolledAt: true,
      course: { select: courseSummarySelect },
    },
  });

  return enrollments.map((e) => ({
    enrollmentId: e.id,
    progress: e.progress,
    enrolledAt: e.enrolledAt,
    ...e.course,
  }));
};

const getStats = async (studentId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [enrollments, attempts, recentEnrollments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId },
      select: { progress: true, courseId: true },
    }),
    prisma.quizAttempt.findMany({
      where: { studentId },
      select: { id: true, status: true, score: true, quiz: { select: { passingScore: true } } },
    }),
    prisma.enrollment.findMany({
      where: { studentId },
      orderBy: { enrolledAt: 'desc' },
      take: 5,
      select: {
        id: true,
        progress: true,
        enrolledAt: true,
        course: {
          select: { id: true, title: true, thumbnail: true, level: true },
        },
      },
    }),
  ]);

  const totalCourses = enrollments.length;
  const avgProgress =
    totalCourses > 0
      ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalCourses
      : 0;

  const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');
  const passedAttempts = completedAttempts.filter(
    (a) => (a.score || 0) >= (a.quiz?.passingScore || 0),
  );

  return {
    totalCourses,
    avgProgress: Math.round(avgProgress * 10) / 10,
    totalAttempts: completedAttempts.length,
    passedAttempts: passedAttempts.length,
    recentEnrollments,
  };
};

const getQuizHistory = async (studentId) => {
  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId },
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
          module: {
            select: {
              id: true,
              title: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  });

  const byQuiz = new Map();
  for (const a of attempts) {
    const qid = a.quiz.id;
    if (!byQuiz.has(qid)) {
      byQuiz.set(qid, { quiz: a.quiz, attempts: [] });
    }
    byQuiz.get(qid).attempts.push({
      id: a.id,
      status: a.status,
      score: a.score,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    });
  }

  return Array.from(byQuiz.values()).map(({ quiz, attempts: atts }) => {
    const completed = atts.filter((a) => a.status === 'COMPLETED');
    const scores = completed.map((a) => a.score ?? 0);
    const bestScore = scores.length ? Math.max(...scores) : null;
    const avgScore =
      scores.length > 0
        ? Math.round(
            (scores.reduce((s, n) => s + n, 0) / scores.length) * 100,
          ) / 100
        : null;
    const passed = completed.some(
      (a) => (a.score ?? 0) >= quiz.passingScore,
    );
    const inProgress = atts.find((a) => a.status === 'IN_PROGRESS') || null;
    return {
      quiz,
      stats: {
        totalAttempts: atts.length,
        completedAttempts: completed.length,
        bestScore,
        avgScore,
        passed,
        lastAttemptAt: atts[0]?.startedAt || null,
        hasInProgress: !!inProgress,
      },
      attempts: atts,
    };
  });
};

export default { getMyCourses, getStats, getQuizHistory };

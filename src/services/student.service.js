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

export default { getMyCourses, getStats };

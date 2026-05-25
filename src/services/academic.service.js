import prisma from '../configs/index.js';

const getStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalCourses,
    coursesByStatusRaw,
    totalModules,
    totalLessons,
    totalQuizzes,
    newCoursesThisWeek,
    recentCourses,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.course.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.module.count(),
    prisma.lesson.count(),
    prisma.quiz.count(),
    prisma.course.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        thumbnail: true,
        level: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
        _count: {
          select: { modules: true, enrollments: true },
        },
      },
    }),
  ]);

  const coursesByStatus = {};
  for (const row of coursesByStatusRaw) {
    coursesByStatus[row.status] = row._count._all;
  }

  return {
    totalCourses,
    totalModules,
    totalLessons,
    totalQuizzes,
    newCoursesThisWeek,
    coursesByStatus,
    recentCourses,
  };
};

export default { getStats };

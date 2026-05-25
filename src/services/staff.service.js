import prisma from '../configs/index.js';

const getStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalTeachers,
    totalStudents,
    totalEnrollments,
    totalCourses,
    newStudentsThisWeek,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.enrollment.count(),
    prisma.course.count(),
    prisma.user.count({
      where: { role: 'STUDENT', createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.enrollment.findMany({
      orderBy: { enrolledAt: 'desc' },
      take: 5,
      include: {
        student: {
          select: { id: true, fullName: true, email: true, avatar: true },
        },
        course: { select: { id: true, title: true } },
      },
    }),
  ]);

  return {
    totalTeachers,
    totalStudents,
    totalEnrollments,
    totalCourses,
    newStudentsThisWeek,
    recentEnrollments,
  };
};

export default { getStats };

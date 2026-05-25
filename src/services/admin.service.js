import prisma from '../configs/index.js';

const getStats = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalUsers, totalCourses, usersByRoleRaw, newUsersThisWeek, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { _all: true },
      }),
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
        },
      }),
    ]);

  const usersByRole = {};
  for (const row of usersByRoleRaw) {
    usersByRole[row.role] = row._count._all;
  }

  return {
    totalUsers,
    totalCourses,
    totalTeachers: usersByRole.TEACHER || 0,
    totalStudents: usersByRole.STUDENT || 0,
    newUsersThisWeek,
    usersByRole,
    recentUsers,
  };
};

export default { getStats };

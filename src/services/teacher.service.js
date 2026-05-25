import prisma from '../configs/index.js';

const courseSummarySelect = {
  id: true,
  title: true,
  description: true,
  thumbnail: true,
  level: true,
  status: true,
  createdAt: true,
  _count: {
    select: {
      modules: true,
      enrollments: true,
    },
  },
};

const getMyCourses = async (teacherId) => {
  // Lấy các CourseTeacher record cho user này, kèm thông tin course
  const courseTeachers = await prisma.courseTeacher.findMany({
    where: { teacherId },
    orderBy: { assignedAt: 'desc' },
    select: {
      assignedAt: true,
      course: { select: courseSummarySelect },
    },
  });

  return courseTeachers.map((ct) => ({
    ...ct.course,
    assignedAt: ct.assignedAt,
  }));
};

const getStats = async (teacherId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. List course IDs teacher dạy
  const teaching = await prisma.courseTeacher.findMany({
    where: { teacherId },
    select: { courseId: true },
  });
  const courseIds = teaching.map((t) => t.courseId);

  // 2. Đếm song song
  const [
    totalCourses,
    enrollments,
    newEnrollmentsThisWeek,
    recentEnrollments,
  ] = await Promise.all([
    Promise.resolve(courseIds.length),
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { studentId: true },
    }),
    prisma.enrollment.count({
      where: {
        courseId: { in: courseIds },
        enrolledAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
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

  // Học sinh duy nhất (unique) cross-course
  const uniqueStudentIds = new Set(enrollments.map((e) => e.studentId));

  return {
    totalCourses,
    totalStudents: uniqueStudentIds.size,
    totalEnrollments: enrollments.length,
    newEnrollmentsThisWeek,
    recentEnrollments,
  };
};

const getCourseEnrollments = async (teacherId, courseId) => {
  // Verify teacher dạy course này
  const ct = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
    select: { id: true },
  });
  if (!ct) throw new Error('Bạn không phải giáo viên của khóa học này');

  return prisma.enrollment.findMany({
    where: { courseId },
    orderBy: { enrolledAt: 'desc' },
    include: {
      student: {
        select: { id: true, fullName: true, email: true, avatar: true },
      },
    },
  });
};

export default { getMyCourses, getStats, getCourseEnrollments };

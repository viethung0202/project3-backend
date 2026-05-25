import prisma from '../configs/index.js';

const enrollmentInclude = {
  student: {
    select: {
      id: true,
      fullName: true,
      email: true,
      avatar: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      level: true,
      status: true,
    },
  },
};

const list = async ({ courseId, studentId } = {}) => {
  const where = {};
  if (courseId) where.courseId = courseId;
  if (studentId) where.studentId = studentId;

  return prisma.enrollment.findMany({
    where,
    include: enrollmentInclude,
    orderBy: { enrolledAt: 'desc' },
  });
};

const create = async ({ studentId, courseId }) => {
  if (!studentId || !courseId) {
    throw new Error('Vui lòng chọn học sinh và khóa học');
  }

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, role: true, isActive: true },
  });
  if (!student) throw new Error('Không tìm thấy học sinh');
  if (student.role !== 'STUDENT')
    throw new Error('Chỉ học sinh mới có thể được enroll');
  if (!student.isActive) throw new Error('Học sinh đã bị khóa');

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) throw new Error('Không tìm thấy khóa học');

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing) throw new Error('Học sinh đã được enroll vào khóa học này');

  return prisma.enrollment.create({
    data: { studentId, courseId },
    include: enrollmentInclude,
  });
};

const remove = async (id) => {
  const existing = await prisma.enrollment.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error('Không tìm thấy enrollment');

  await prisma.enrollment.delete({ where: { id } });
  return { message: 'Đã gỡ học sinh khỏi khóa học' };
};

export default { list, create, remove };

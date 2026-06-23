import prisma from '../configs/index.js';

const VALID_GRADES = ['EXCELLENT', 'GOOD', 'AVERAGE', 'FAIR', 'POOR'];

const validateScore = (s, label) => {
  if (s === null || s === undefined || s === '') return null;
  const n = Number(s);
  if (Number.isNaN(n)) throw new Error(`Điểm ${label} không hợp lệ`);
  if (n < 0 || n > 100)
    throw new Error(`Điểm ${label} phải trong khoảng 0 - 100`);
  return Math.round(n * 100) / 100;
};

const assertTeacherOfCourse = async (teacherId, courseId) => {
  const teaching = await prisma.courseTeacher.findUnique({
    where: { courseId_teacherId: { courseId, teacherId } },
  });
  if (!teaching) throw new Error('Bạn không phải giáo viên của khóa học này');
};

const upsertEvaluation = async (teacherId, payload) => {
  const {
    studentId,
    courseId,
    overallGrade,
    listeningScore,
    speakingScore,
    readingScore,
    writingScore,
    strengths,
    weaknesses,
    recommendation,
  } = payload;

  if (!studentId) throw new Error('Thiếu studentId');
  if (!courseId) throw new Error('Thiếu courseId');
  if (!VALID_GRADES.includes(overallGrade)) {
    throw new Error('Xếp loại không hợp lệ');
  }

  await assertTeacherOfCourse(teacherId, courseId);

  // Đảm bảo học sinh đã enroll vào khóa
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (!enrollment) throw new Error('Học sinh chưa đăng ký khóa học này');

  const data = {
    overallGrade,
    listeningScore: validateScore(listeningScore, 'Nghe'),
    speakingScore: validateScore(speakingScore, 'Nói'),
    readingScore: validateScore(readingScore, 'Đọc'),
    writingScore: validateScore(writingScore, 'Viết'),
    strengths: strengths?.trim() || null,
    weaknesses: weaknesses?.trim() || null,
    recommendation: recommendation?.trim() || null,
  };

  return prisma.studentEvaluation.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    create: { ...data, studentId, courseId, evaluatedById: teacherId },
    update: { ...data, evaluatedById: teacherId },
  });
};

const listForCourse = async (teacherId, courseId) => {
  await assertTeacherOfCourse(teacherId, courseId);

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: { id: true, fullName: true, email: true, avatar: true },
      },
    },
    orderBy: { enrolledAt: 'asc' },
  });

  const evals = await prisma.studentEvaluation.findMany({
    where: { courseId },
  });
  const evalMap = new Map(evals.map((e) => [e.studentId, e]));

  return enrollments.map((e) => ({
    student: e.student,
    progress: e.progress,
    evaluation: evalMap.get(e.studentId) || null,
  }));
};

const deleteEvaluation = async (teacherId, evalId) => {
  const existing = await prisma.studentEvaluation.findUnique({
    where: { id: evalId },
  });
  if (!existing) throw new Error('Không tìm thấy đánh giá');
  await assertTeacherOfCourse(teacherId, existing.courseId);
  return prisma.studentEvaluation.delete({ where: { id: evalId } });
};

const getMineForCourse = async (studentId, courseId) => {
  return prisma.studentEvaluation.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    include: {
      evaluatedBy: { select: { fullName: true, avatar: true } },
      course: { select: { id: true, title: true } },
    },
  });
};

const listMine = async (studentId) => {
  return prisma.studentEvaluation.findMany({
    where: { studentId },
    orderBy: { updatedAt: 'desc' },
    include: {
      course: { select: { id: true, title: true, level: true } },
      evaluatedBy: { select: { fullName: true } },
    },
  });
};

export default {
  upsertEvaluation,
  listForCourse,
  deleteEvaluation,
  getMineForCourse,
  listMine,
};

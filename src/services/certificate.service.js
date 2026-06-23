import crypto from 'crypto';
import prisma from '../configs/index.js';

const generateCertNumber = () => {
  const year = new Date().getUTCFullYear();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ENG-${year}-${random}`;
};

const computeAverageScore = async (userId, courseId) => {
  const quizzes = await prisma.quiz.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });
  if (quizzes.length === 0) return null;

  const quizIds = quizzes.map((q) => q.id);

  // Lấy attempt có score cao nhất cho từng quiz
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentId: userId,
      quizId: { in: quizIds },
      status: 'COMPLETED',
    },
    select: { quizId: true, score: true },
  });
  if (attempts.length === 0) return null;

  const bestPerQuiz = new Map();
  for (const a of attempts) {
    const cur = bestPerQuiz.get(a.quizId);
    if (cur === undefined || (a.score ?? 0) > cur) {
      bestPerQuiz.set(a.quizId, a.score ?? 0);
    }
  }
  if (bestPerQuiz.size === 0) return null;

  const sum = [...bestPerQuiz.values()].reduce((s, v) => s + v, 0);
  return Math.round((sum / bestPerQuiz.size) * 100) / 100;
};

const claimCertificate = async (userId, courseId) => {
  if (!courseId) throw new Error('Thiếu courseId');

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId } },
    select: { progress: true },
  });

  if (!enrollment) throw new Error('Bạn chưa đăng ký khóa học này');
  if ((enrollment.progress ?? 0) < 100) {
    throw new Error('Bạn cần hoàn thành 100% khóa học để nhận chứng chỉ');
  }

  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;

  const score = await computeAverageScore(userId, courseId);

  // Sinh certNumber unique (retry 5 lần để chắc chắn)
  for (let i = 0; i < 5; i++) {
    const certNumber = generateCertNumber();
    const dup = await prisma.certificate.findUnique({ where: { certNumber } });
    if (dup) continue;

    return prisma.certificate.create({
      data: { userId, courseId, certNumber, score },
    });
  }
  throw new Error('Không thể sinh mã chứng chỉ, thử lại sau');
};

const listMyCertificates = async (userId) => {
  return prisma.certificate.findMany({
    where: { userId, status: 'ACTIVE' },
    orderBy: { issuedAt: 'desc' },
    include: {
      course: {
        select: { id: true, title: true, thumbnail: true, level: true },
      },
    },
  });
};

const getByCertNumber = async (certNumber) => {
  if (!certNumber?.trim()) throw new Error('Thiếu mã chứng chỉ');
  const cert = await prisma.certificate.findUnique({
    where: { certNumber: certNumber.trim() },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      course: {
        select: { id: true, title: true, level: true, thumbnail: true },
      },
    },
  });
  if (!cert) throw new Error('Không tìm thấy chứng chỉ');
  return cert;
};

const verifyByCertNumber = async (certNumber) => {
  const cert = await prisma.certificate.findUnique({
    where: { certNumber: certNumber?.trim() || '' },
    include: {
      user: { select: { fullName: true } },
      course: { select: { title: true, level: true } },
    },
  });
  if (!cert) return { valid: false };
  return {
    valid: cert.status === 'ACTIVE',
    status: cert.status,
    certNumber: cert.certNumber,
    issuedAt: cert.issuedAt,
    score: cert.score,
    studentName: cert.user.fullName,
    courseTitle: cert.course.title,
    courseLevel: cert.course.level,
  };
};

const revokeCertificate = async (id) => {
  return prisma.certificate.update({
    where: { id },
    data: { status: 'REVOKED' },
  });
};

const listAllCertificates = async ({ page = 1, pageSize = 20 } = {}) => {
  const skip = (Math.max(1, Number(page)) - 1) * Number(pageSize);
  const take = Math.min(100, Math.max(1, Number(pageSize)));
  const [items, total] = await Promise.all([
    prisma.certificate.findMany({
      orderBy: { issuedAt: 'desc' },
      skip,
      take,
      include: {
        user: { select: { fullName: true, email: true } },
        course: { select: { title: true, level: true } },
      },
    }),
    prisma.certificate.count(),
  ]);
  return { items, total, page: Number(page), pageSize: take };
};

export default {
  claimCertificate,
  listMyCertificates,
  getByCertNumber,
  verifyByCertNumber,
  revokeCertificate,
  listAllCertificates,
};

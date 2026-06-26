import prisma from '../configs/index.js';

const lessonSelect = {
  id: true,
  moduleId: true,
  title: true,
  content: true,
  videoUrl: true,
  pdfUrl: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  module: {
    select: {
      id: true,
      title: true,
      courseId: true,
    },
  },
  documents: {
    select: {
      id: true,
      order: true,
      document: {
        select: {
          id: true,
          title: true,
          description: true,
          fileUrl: true,
          fileType: true,
          isPublished: true,
          allowDownload: true,
          courseId: true,
        },
      },
    },
    orderBy: { order: 'asc' },
  },
};

const getLessonsByModuleId = async (moduleId) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      title: true,
      courseId: true,
    },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    select: lessonSelect,
    orderBy: { order: 'asc' },
  });

  return {
    module,
    lessons,
  };
};

const createLesson = async (moduleId, lessonData) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  const { title, content, videoUrl, pdfUrl, order } = lessonData;

  let nextOrder = order;
  if (nextOrder === undefined || nextOrder === null) {
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    nextOrder = lastLesson ? lastLesson.order + 1 : 1;
  }

  return prisma.lesson.create({
    data: {
      moduleId,
      title,
      content,
      videoUrl,
      pdfUrl,
      order: nextOrder,
    },
    select: lessonSelect,
  });
};

const getLessonById = async (id) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: lessonSelect,
  });

  if (!lesson) {
    throw new Error('Lesson not found');
  }

  return lesson;
};

const updateLesson = async (id, lessonData) => {
  const existingLesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingLesson) {
    throw new Error('Lesson not found');
  }

  const { title, content, videoUrl, pdfUrl, order } = lessonData;
  const data = {};

  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (videoUrl !== undefined) data.videoUrl = videoUrl;
  if (pdfUrl !== undefined) data.pdfUrl = pdfUrl;
  if (order !== undefined) data.order = order;

  return prisma.lesson.update({
    where: { id },
    data,
    select: lessonSelect,
  });
};

const deleteLesson = async (id) => {
  const existingLesson = await prisma.lesson.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingLesson) {
    throw new Error('Lesson not found');
  }

  await prisma.lesson.delete({
    where: { id },
  });

  return { message: 'Lesson deleted successfully' };
};

// Cập nhật enrollment.progress = % hoàn thành (lesson + quiz)
// progress = (completedLessons + passedQuizzes) / (totalLessons + totalQuizzes) * 100
// Một quiz coi như "passed" nếu best score qua mọi attempt ≥ passingScore của quiz đó
// Course không có quiz → chỉ tính lessons
const recomputeProgress = async (studentId, courseId) => {
  const [totalLessons, completedLessons, quizzes] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId } } }),
    prisma.lessonCompletion.count({
      where: { studentId, lesson: { module: { courseId } } },
    }),
    prisma.quiz.findMany({
      where: { module: { courseId } },
      select: { id: true, passingScore: true },
    }),
  ]);

  const totalQuizzes = quizzes.length;
  let passedQuizzes = 0;

  if (totalQuizzes > 0) {
    const quizIds = quizzes.map((q) => q.id);
    const bestScores = await prisma.quizAttempt.groupBy({
      by: ['quizId'],
      where: {
        studentId,
        quizId: { in: quizIds },
        status: 'COMPLETED',
      },
      _max: { score: true },
    });
    const bestByQuiz = new Map(
      bestScores.map((b) => [b.quizId, b._max.score ?? 0]),
    );
    passedQuizzes = quizzes.filter(
      (q) => (bestByQuiz.get(q.id) ?? 0) >= q.passingScore,
    ).length;
  }

  const totalUnits = totalLessons + totalQuizzes;
  const completedUnits = completedLessons + passedQuizzes;
  const progress = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0;

  await prisma.enrollment.updateMany({
    where: { studentId, courseId },
    data: { progress: Math.round(progress * 10) / 10 },
  });

  return {
    totalLessons,
    completedLessons,
    totalQuizzes,
    passedQuizzes,
    progress,
  };
};

const markComplete = async (studentId, lessonId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error('Lesson not found');

  const courseId = lesson.module.courseId;

  // Verify student đã enroll khóa học này
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  });
  if (!enrollment) {
    throw new Error('Bạn chưa được đăng ký vào khóa học này');
  }

  // Upsert — đánh dấu lần nữa không lỗi
  await prisma.lessonCompletion.upsert({
    where: { lessonId_studentId: { lessonId, studentId } },
    create: { lessonId, studentId },
    update: { completedAt: new Date() },
  });

  return recomputeProgress(studentId, courseId);
};

const unmarkComplete = async (studentId, lessonId) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error('Lesson not found');

  await prisma.lessonCompletion.deleteMany({
    where: { lessonId, studentId },
  });

  return recomputeProgress(studentId, lesson.module.courseId);
};

// ========== LESSON DOCUMENTS (many-to-many) ==========

const attachDocument = async (lessonId, documentId) => {
  const [lesson, doc] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    }),
    prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true },
    }),
  ]);
  if (!lesson) throw new Error('Lesson not found');
  if (!doc) throw new Error('Document not found');

  const existing = await prisma.lessonDocument.findUnique({
    where: { lessonId_documentId: { lessonId, documentId } },
    select: { id: true },
  });
  if (existing) throw new Error('Tài liệu đã được gắn vào lesson này');

  const maxOrder = await prisma.lessonDocument.aggregate({
    where: { lessonId },
    _max: { order: true },
  });

  return prisma.lessonDocument.create({
    data: {
      lessonId,
      documentId,
      order: (maxOrder._max.order || 0) + 1,
    },
    select: {
      id: true,
      order: true,
      document: {
        select: {
          id: true,
          title: true,
          fileUrl: true,
          fileType: true,
          isPublished: true,
          allowDownload: true,
        },
      },
    },
  });
};

const detachDocument = async (lessonId, documentId) => {
  const link = await prisma.lessonDocument.findUnique({
    where: { lessonId_documentId: { lessonId, documentId } },
    select: { id: true },
  });
  if (!link) throw new Error('Tài liệu không gắn với lesson này');

  await prisma.lessonDocument.delete({
    where: { lessonId_documentId: { lessonId, documentId } },
  });
  return { message: 'Đã gỡ tài liệu khỏi lesson' };
};

const reorderDocuments = async (lessonId, documentIds) => {
  if (!Array.isArray(documentIds)) {
    throw new Error('documentIds phải là mảng');
  }
  // Verify tất cả document đã gắn
  const links = await prisma.lessonDocument.findMany({
    where: { lessonId },
    select: { documentId: true },
  });
  const currentIds = new Set(links.map((l) => l.documentId));
  if (
    documentIds.length !== currentIds.size ||
    !documentIds.every((id) => currentIds.has(id))
  ) {
    throw new Error(
      'Danh sách documentIds không khớp với tài liệu hiện gắn lesson',
    );
  }

  await prisma.$transaction(
    documentIds.map((docId, idx) =>
      prisma.lessonDocument.update({
        where: { lessonId_documentId: { lessonId, documentId: docId } },
        data: { order: idx + 1 },
      }),
    ),
  );
  return { message: 'Đã cập nhật thứ tự' };
};

export default {
  getLessonsByModuleId,
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
  markComplete,
  unmarkComplete,
  attachDocument,
  detachDocument,
  reorderDocuments,
  recomputeProgress,
};

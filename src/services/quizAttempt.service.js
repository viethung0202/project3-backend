import prisma from '../configs/index.js';
import lessonService from './lesson.service.js';

const ensureEnrolled = async (studentId, courseId) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  });
  if (!enrollment) {
    throw new Error('Bạn chưa được đăng ký vào khóa học này');
  }
};

const loadQuizForAttempt = async (quizId) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      description: true,
      timeLimit: true,
      passingScore: true,
      module: { select: { id: true, title: true, courseId: true } },
      questions: {
        select: {
          id: true,
          content: true,
          type: true,
          points: true,
          order: true,
          audioUrl: true,
          imageUrl: true,
          answers: {
            select: { id: true, content: true }, // KHÔNG trả isCorrect
            orderBy: { id: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!quiz) throw new Error('Quiz not found');
  return quiz;
};

const startAttempt = async (studentId, quizId) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, module: { select: { courseId: true } } },
  });
  if (!quiz) throw new Error('Quiz not found');
  await ensureEnrolled(studentId, quiz.module.courseId);

  const existing = await prisma.quizAttempt.findFirst({
    where: { studentId, quizId, status: 'IN_PROGRESS' },
    select: { id: true },
  });

  const attempt = existing
    ? existing
    : await prisma.quizAttempt.create({
        data: { studentId, quizId, status: 'IN_PROGRESS' },
        select: { id: true },
      });

  return getAttempt(attempt.id, studentId);
};

const getAttempt = async (attemptId, studentId) => {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      quizId: true,
      studentId: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      answers: {
        select: { questionId: true, selectedAnswers: true },
      },
    },
  });
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.studentId !== studentId) {
    throw new Error('Bạn không có quyền xem attempt này');
  }

  const quiz = await loadQuizForAttempt(attempt.quizId);

  // Map đáp án đã lưu để FE có thể restore
  const selectedMap = {};
  for (const a of attempt.answers) selectedMap[a.questionId] = a.selectedAnswers;

  return {
    id: attempt.id,
    quizId: attempt.quizId,
    status: attempt.status,
    score: attempt.score,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    quiz,
    selectedByQuestion: selectedMap,
  };
};

const saveAnswer = async ({ attemptId, studentId, questionId, selectedAnswers }) => {
  if (!Array.isArray(selectedAnswers)) {
    throw new Error('selectedAnswers phải là mảng');
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: { id: true, studentId: true, status: true, quizId: true },
  });
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.studentId !== studentId) {
    throw new Error('Bạn không có quyền sửa attempt này');
  }
  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error('Attempt đã nộp, không thể sửa');
  }

  // Đảm bảo question thuộc về quiz của attempt
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true, quizId: true },
  });
  if (!question || question.quizId !== attempt.quizId) {
    throw new Error('Question không thuộc quiz này');
  }

  return prisma.quizAttemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { selectedAnswers, answeredAt: new Date() },
    create: { attemptId, questionId, selectedAnswers },
    select: { questionId: true, selectedAnswers: true },
  });
};

const gradeQuestion = (question, selectedIds) => {
  const correctIds = question.answers
    .filter((a) => a.isCorrect)
    .map((a) => a.id);
  const correctSet = new Set(correctIds);
  const selectedSet = new Set(selectedIds || []);

  if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
    // Chỉ tính đúng khi chọn đúng 1 đáp án và đó là đáp án đúng
    const isCorrect =
      selectedSet.size === 1 && correctSet.has([...selectedSet][0]);
    return {
      isCorrect,
      earned: isCorrect ? question.points : 0,
      correctAnswerIds: correctIds,
    };
  }

  // MULTIPLE_CHOICE — partial scoring
  if (correctIds.length === 0) {
    return { isCorrect: false, earned: 0, correctAnswerIds: [] };
  }
  let correctPicked = 0;
  let wrongPicked = 0;
  for (const id of selectedSet) {
    if (correctSet.has(id)) correctPicked += 1;
    else wrongPicked += 1;
  }
  const ratio = (correctPicked - wrongPicked) / correctIds.length;
  const clamped = Math.max(0, ratio);
  const earned = Math.round(question.points * clamped * 100) / 100;
  const isFullyCorrect =
    correctPicked === correctIds.length && wrongPicked === 0;
  return { isCorrect: isFullyCorrect, earned, correctAnswerIds: correctIds };
};

const submitAttempt = async (attemptId, studentId) => {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      quizId: true,
      answers: { select: { questionId: true, selectedAnswers: true } },
    },
  });
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.studentId !== studentId) {
    throw new Error('Bạn không có quyền nộp attempt này');
  }
  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error('Attempt đã được nộp trước đó');
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: attempt.quizId },
    select: {
      id: true,
      passingScore: true,
      module: { select: { courseId: true } },
      questions: {
        select: {
          id: true,
          type: true,
          points: true,
          answers: { select: { id: true, isCorrect: true } },
        },
      },
    },
  });

  const selectedByQ = {};
  for (const a of attempt.answers) selectedByQ[a.questionId] = a.selectedAnswers;

  const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0) || 0;
  let earnedTotal = 0;
  const perQuestion = [];

  for (const q of quiz.questions) {
    const sel = selectedByQ[q.id] || [];
    const { isCorrect, earned } = gradeQuestion(q, sel);
    earnedTotal += earned;
    perQuestion.push({ questionId: q.id, isCorrect });
  }

  const score =
    totalPoints > 0
      ? Math.round((earnedTotal / totalPoints) * 100 * 100) / 100
      : 0;

  // Update isCorrect cho từng QuizAttemptAnswer + attempt
  await prisma.$transaction([
    ...perQuestion.map((pq) =>
      prisma.quizAttemptAnswer.updateMany({
        where: { attemptId, questionId: pq.questionId },
        data: { isCorrect: pq.isCorrect },
      }),
    ),
    prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        score,
        submittedAt: new Date(),
      },
    }),
  ]);

  // Recompute course progress (vì pass quiz ảnh hưởng % hoàn thành)
  const courseId = quiz.module?.courseId;
  if (courseId) {
    try {
      await lessonService.recomputeProgress(studentId, courseId);
    } catch (err) {
      console.error('recomputeProgress error after submit:', err.message);
    }
  }

  return {
    attemptId,
    score,
    passingScore: quiz.passingScore,
    passed: score >= quiz.passingScore,
    totalQuestions: quiz.questions.length,
    correctCount: perQuestion.filter((p) => p.isCorrect).length,
  };
};

const getResult = async (attemptId, studentId) => {
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      quizId: true,
      answers: {
        select: { questionId: true, selectedAnswers: true, isCorrect: true },
      },
    },
  });
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.studentId !== studentId) {
    throw new Error('Bạn không có quyền xem kết quả này');
  }
  if (attempt.status !== 'COMPLETED') {
    throw new Error('Attempt chưa được nộp');
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: attempt.quizId },
    select: {
      id: true,
      title: true,
      passingScore: true,
      questions: {
        select: {
          id: true,
          content: true,
          type: true,
          points: true,
          order: true,
          audioUrl: true,
          imageUrl: true,
          answers: { select: { id: true, content: true, isCorrect: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  const answerByQ = {};
  for (const a of attempt.answers) answerByQ[a.questionId] = a;

  // Trả về tất cả câu (đúng + sai), kèm flag isCorrect
  const questions = quiz.questions.map((q) => ({
    id: q.id,
    content: q.content,
    type: q.type,
    points: q.points,
    order: q.order,
    audioUrl: q.audioUrl,
    imageUrl: q.imageUrl,
    selectedAnswerIds: answerByQ[q.id]?.selectedAnswers || [],
    isCorrect: answerByQ[q.id]?.isCorrect === true,
    answers: q.answers, // có isCorrect để FE highlight
  }));

  const correctCount = questions.filter((q) => q.isCorrect).length;

  return {
    attemptId: attempt.id,
    quiz: { id: quiz.id, title: quiz.title, passingScore: quiz.passingScore },
    score: attempt.score,
    passed: (attempt.score ?? 0) >= quiz.passingScore,
    totalQuestions: quiz.questions.length,
    correctCount,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    questions,
  };
};

const getMyAttempts = async (studentId, quizId) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      description: true,
      timeLimit: true,
      passingScore: true,
      module: { select: { id: true, title: true, courseId: true } },
    },
  });
  if (!quiz) throw new Error('Quiz not found');

  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId, quizId },
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
    },
  });

  return { quiz, attempts };
};

export default {
  startAttempt,
  getAttempt,
  saveAnswer,
  submitAttempt,
  getResult,
  getMyAttempts,
};

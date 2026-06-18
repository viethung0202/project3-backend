import prisma from '../configs/index.js';

const loadTestForAttempt = async (testId) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      skill: true,
      durationMinutes: true,
      totalQuestions: true,
      status: true,
      isGuestAllowed: true,
      parts: {
        select: {
          id: true,
          name: true,
          instruction: true,
          order: true,
          passages: {
            select: {
              id: true,
              title: true,
              content: true,
              audioUrl: true,
              imageUrl: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
          questions: {
            select: {
              id: true,
              passageId: true,
              content: true,
              type: true,
              points: true,
              order: true,
              audioUrl: true,
              imageUrl: true,
              answers: {
                select: {
                  id: true,
                  content: true,
                },
                orderBy: { id: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!test) throw new Error('Test not found');
  return test;
};

const startAttempt = async (studentId, testId) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!test) throw new Error('Test not found');
  if (test.status !== 'PUBLISHED') throw new Error('Test is not published');

  const existing = await prisma.testAttempt.findFirst({
    where: { studentId, testId, status: 'IN_PROGRESS' },
    select: { id: true },
  });

  const attempt = existing
    ? existing
    : await prisma.testAttempt.create({
        data: { studentId, testId, status: 'IN_PROGRESS' },
        select: { id: true },
      });

  return getAttempt(attempt.id, studentId);
};

const getAttempt = async (attemptId, studentId) => {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      testId: true,
      studentId: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      remainingSeconds: true,
      answers: {
        select: { questionId: true, selectedAnswers: true },
      },
    },
  });

  if (!attempt) throw new Error('Attempt not found');
  if (attempt.studentId !== studentId) {
    throw new Error('Bạn không có quyền xem attempt này');
  }

  const test = await loadTestForAttempt(attempt.testId);
  const selectedMap = {};

  for (const answer of attempt.answers) {
    selectedMap[answer.questionId] = answer.selectedAnswers;
  }

  return {
    id: attempt.id,
    testId: attempt.testId,
    status: attempt.status,
    score: attempt.score,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    remainingSeconds: attempt.remainingSeconds,
    test,
    selectedByQuestion: selectedMap,
  };
};

const saveAnswer = async ({
  attemptId,
  studentId,
  questionId,
  selectedAnswers,
}) => {
  if (!Array.isArray(selectedAnswers)) {
    throw new Error('selectedAnswers phải là mảng');
  }

  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      testId: true,
    },
  });

  if (!attempt) throw new Error('Attempt not found');
  if (attempt.studentId !== studentId) {
    throw new Error('Bạn không có quyền sửa attempt này');
  }
  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error('Attempt đã nộp, không thể sửa');
  }

  const question = await prisma.testQuestion.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      testPart: { select: { testId: true } },
    },
  });

  if (!question || question.testPart.testId !== attempt.testId) {
    throw new Error('Question không thuộc test này');
  }

  return prisma.testAttemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    update: { selectedAnswers, answeredAt: new Date() },
    create: { attemptId, questionId, selectedAnswers },
    select: { questionId: true, selectedAnswers: true },
  });
};

const gradeQuestion = (question, selectedIds) => {
  const correctIds = question.answers
    .filter((answer) => answer.isCorrect)
    .map((answer) => answer.id);
  const correctSet = new Set(correctIds);
  const selectedSet = new Set(selectedIds || []);

  if (question.type === 'SINGLE_CHOICE' || question.type === 'TRUE_FALSE') {
    const isCorrect =
      selectedSet.size === 1 && correctSet.has([...selectedSet][0]);

    return {
      isCorrect,
      earned: isCorrect ? question.points : 0,
    };
  }

  if (correctIds.length === 0) {
    return { isCorrect: false, earned: 0 };
  }

  let correctPicked = 0;
  let wrongPicked = 0;

  for (const id of selectedSet) {
    if (correctSet.has(id)) correctPicked += 1;
    else wrongPicked += 1;
  }

  const ratio = (correctPicked - wrongPicked) / correctIds.length;
  const earned = Math.round(question.points * Math.max(0, ratio) * 100) / 100;
  const isCorrect =
    correctPicked === correctIds.length && wrongPicked === 0;

  return { isCorrect, earned };
};

const submitAttempt = async (attemptId, studentId) => {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      testId: true,
      answers: {
        select: {
          questionId: true,
          selectedAnswers: true,
        },
      },
    },
  });

  if (!attempt) throw new Error('Attempt not found');
  if (attempt.studentId !== studentId) {
    throw new Error('Bạn không có quyền nộp attempt này');
  }
  if (attempt.status !== 'IN_PROGRESS') {
    throw new Error('Attempt đã được nộp trước đó');
  }

  const test = await prisma.test.findUnique({
    where: { id: attempt.testId },
    select: {
      id: true,
      parts: {
        select: {
          questions: {
            select: {
              id: true,
              type: true,
              points: true,
              answers: {
                select: {
                  id: true,
                  isCorrect: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const questions = test.parts.flatMap((part) => part.questions);
  const selectedByQuestion = {};

  for (const answer of attempt.answers) {
    selectedByQuestion[answer.questionId] = answer.selectedAnswers;
  }

  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  let earnedTotal = 0;
  const perQuestion = [];

  for (const question of questions) {
    const result = gradeQuestion(
      question,
      selectedByQuestion[question.id] || [],
    );
    earnedTotal += result.earned;
    perQuestion.push({ questionId: question.id, isCorrect: result.isCorrect });
  }

  const score =
    totalPoints > 0
      ? Math.round((earnedTotal / totalPoints) * 100 * 100) / 100
      : 0;

  await prisma.$transaction([
    ...perQuestion.map((item) =>
      prisma.testAttemptAnswer.updateMany({
        where: { attemptId, questionId: item.questionId },
        data: { isCorrect: item.isCorrect },
      }),
    ),
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'COMPLETED',
        score,
        submittedAt: new Date(),
        remainingSeconds: 0,
      },
    }),
  ]);

  const correctCount = perQuestion.filter((item) => item.isCorrect).length;

  return {
    attemptId,
    score,
    totalQuestions: questions.length,
    correctCount,
  };
};

const getResult = async (attemptId, studentId) => {
  const attempt = await prisma.testAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
      testId: true,
      answers: {
        select: {
          questionId: true,
          selectedAnswers: true,
          isCorrect: true,
        },
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

  const test = await prisma.test.findUnique({
    where: { id: attempt.testId },
    select: {
      id: true,
      title: true,
      type: true,
      skill: true,
      durationMinutes: true,
      totalQuestions: true,
      parts: {
        select: {
          id: true,
          name: true,
          order: true,
          passages: {
            select: {
              id: true,
              title: true,
              content: true,
              audioUrl: true,
              imageUrl: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
          questions: {
            select: {
              id: true,
              passageId: true,
              content: true,
              type: true,
              points: true,
              order: true,
              audioUrl: true,
              imageUrl: true,
              answers: {
                select: {
                  id: true,
                  content: true,
                  isCorrect: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  const answerByQuestion = {};
  for (const answer of attempt.answers) {
    answerByQuestion[answer.questionId] = answer;
  }

  const parts = test.parts.map((part) => ({
    id: part.id,
    name: part.name,
    order: part.order,
    passages: part.passages,
    questions: part.questions.map((question) => ({
      id: question.id,
      passageId: question.passageId,
      content: question.content,
      type: question.type,
      points: question.points,
      order: question.order,
      audioUrl: question.audioUrl,
      imageUrl: question.imageUrl,
      selectedAnswerIds: answerByQuestion[question.id]?.selectedAnswers || [],
      isCorrect: answerByQuestion[question.id]?.isCorrect === true,
      answers: question.answers,
    })),
  }));

  const questions = parts.flatMap((part) => part.questions);
  const correctCount = questions.filter((question) => question.isCorrect).length;

  return {
    attemptId: attempt.id,
    test: {
      id: test.id,
      title: test.title,
      type: test.type,
      skill: test.skill,
      durationMinutes: test.durationMinutes,
      totalQuestions: test.totalQuestions,
    },
    score: attempt.score,
    totalQuestions: questions.length,
    correctCount,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    parts,
  };
};

const getMyAttempts = async (studentId, testId) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      skill: true,
      durationMinutes: true,
      totalQuestions: true,
      status: true,
    },
  });

  if (!test) throw new Error('Test not found');

  const attempts = await prisma.testAttempt.findMany({
    where: { studentId, testId },
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      status: true,
      score: true,
      startedAt: true,
      submittedAt: true,
    },
  });

  return { test, attempts };
};

export default {
  startAttempt,
  getAttempt,
  saveAnswer,
  submitAttempt,
  getResult,
  getMyAttempts,
};

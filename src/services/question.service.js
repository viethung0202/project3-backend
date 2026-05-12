import prisma from '../configs/index.js';

const questionSelect = {
  id: true,
  quizId: true,
  content: true,
  type: true,
  points: true,
  order: true,
  quiz: {
    select: {
      id: true,
      title: true,
      moduleId: true,
    },
  },
  answers: {
    select: {
      id: true,
      content: true,
      isCorrect: true,
    },
  },
};

const createQuestion = async (quizId, questionData) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { id: true },
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  const { content, type, points, order } = questionData;

  let nextOrder = order;
  if (nextOrder === undefined || nextOrder === null) {
    const lastQuestion = await prisma.question.findFirst({
      where: { quizId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    nextOrder = lastQuestion ? lastQuestion.order + 1 : 1;
  }

  return prisma.question.create({
    data: {
      quizId,
      content,
      type,
      points,
      order: nextOrder,
    },
    select: questionSelect,
  });
};

const updateQuestion = async (id, questionData) => {
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingQuestion) {
    throw new Error('Question not found');
  }

  const { content, type, points, order } = questionData;
  const data = {};

  if (content !== undefined) data.content = content;
  if (type !== undefined) data.type = type;
  if (points !== undefined) data.points = points;
  if (order !== undefined) data.order = order;

  return prisma.question.update({
    where: { id },
    data,
    select: questionSelect,
  });
};

const deleteQuestion = async (id) => {
  const existingQuestion = await prisma.question.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingQuestion) {
    throw new Error('Question not found');
  }

  await prisma.question.delete({
    where: { id },
  });

  return { message: 'Question deleted successfully' };
};

export default {
  createQuestion,
  updateQuestion,
  deleteQuestion,
};

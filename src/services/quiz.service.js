import prisma from '../configs/index.js';

const quizSelect = {
  id: true,
  moduleId: true,
  title: true,
  description: true,
  timeLimit: true,
  passingScore: true,
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
};

const getQuizzesByModuleId = async (moduleId) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, title: true, courseId: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  const quizzes = await prisma.quiz.findMany({
    where: { moduleId },
    select: quizSelect,
    orderBy: { order: 'asc' },
  });

  return {
    module,
    quizzes,
  };
};

const createQuiz = async (moduleId, quizData) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  const { title, description, timeLimit, passingScore, order } = quizData;

  let nextOrder = order;
  if (nextOrder === undefined || nextOrder === null) {
    const lastQuiz = await prisma.quiz.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    nextOrder = lastQuiz ? lastQuiz.order + 1 : 1;
  }

  return prisma.quiz.create({
    data: {
      moduleId,
      title,
      description,
      timeLimit,
      passingScore,
      order: nextOrder,
    },
    select: quizSelect,
  });
};

const getQuizById = async (id) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: {
      ...quizSelect,
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
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  return quiz;
};

const updateQuiz = async (id, quizData) => {
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingQuiz) {
    throw new Error('Quiz not found');
  }

  const { title, description, timeLimit, passingScore, order } = quizData;
  const data = {};

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (timeLimit !== undefined) data.timeLimit = timeLimit;
  if (passingScore !== undefined) data.passingScore = passingScore;
  if (order !== undefined) data.order = order;

  return prisma.quiz.update({
    where: { id },
    data,
    select: quizSelect,
  });
};

const deleteQuiz = async (id) => {
  const existingQuiz = await prisma.quiz.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingQuiz) {
    throw new Error('Quiz not found');
  }

  await prisma.quiz.delete({
    where: { id },
  });

  return { message: 'Quiz deleted successfully' };
};

export default {
  getQuizzesByModuleId,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
};

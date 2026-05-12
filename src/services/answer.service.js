import prisma from '../configs/index.js';

const answerSelect = {
  id: true,
  questionId: true,
  content: true,
  isCorrect: true,
  question: {
    select: {
      id: true,
      content: true,
      quizId: true,
    },
  },
};

const createAnswer = async (questionId, answerData) => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!question) {
    throw new Error('Question not found');
  }

  const { content, isCorrect } = answerData;

  return prisma.answer.create({
    data: {
      questionId,
      content,
      isCorrect,
    },
    select: answerSelect,
  });
};

const updateAnswer = async (id, answerData) => {
  const existingAnswer = await prisma.answer.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingAnswer) {
    throw new Error('Answer not found');
  }

  const { content, isCorrect } = answerData;
  const data = {};

  if (content !== undefined) data.content = content;
  if (isCorrect !== undefined) data.isCorrect = isCorrect;

  return prisma.answer.update({
    where: { id },
    data,
    select: answerSelect,
  });
};

const deleteAnswer = async (id) => {
  const existingAnswer = await prisma.answer.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingAnswer) {
    throw new Error('Answer not found');
  }

  await prisma.answer.delete({
    where: { id },
  });

  return { message: 'Answer deleted successfully' };
};

export default {
  createAnswer,
  updateAnswer,
  deleteAnswer,
};

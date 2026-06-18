import prisma from '../configs/index.js';

const testListSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  skill: true,
  durationMinutes: true,
  totalQuestions: true,
  status: true,
  isGuestAllowed: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
  _count: {
    select: {
      parts: true,
      attempts: true,
    },
  },
};

const testSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  skill: true,
  durationMinutes: true,
  totalQuestions: true,
  status: true,
  isGuestAllowed: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },
  parts: {
    select: {
      id: true,
      name: true,
      instruction: true,
      order: true,
      createdAt: true,
      updatedAt: true,
      passages: {
        select: {
          id: true,
          title: true,
          content: true,
          audioUrl: true,
          imageUrl: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { order: 'asc' },
      },
      questions: {
        select: {
          id: true,
          content: true,
          type: true,
          points: true,
          order: true,
          audioUrl: true,
          imageUrl: true,
          passageId: true,
          createdAt: true,
          updatedAt: true,
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
};

const testPreviewSelect = {
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
          content: true,
          type: true,
          points: true,
          order: true,
          audioUrl: true,
          imageUrl: true,
          passageId: true,
          answers: {
            select: {
              id: true,
              content: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  },
};

const ensureTestExists = async (id) => {
  const existing = await prisma.test.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!existing) {
    throw new Error('Test not found');
  }

  return existing;
};

const ensurePartExists = async (id) => {
  const existing = await prisma.testPart.findUnique({
    where: { id },
    select: { id: true, testId: true },
  });

  if (!existing) {
    throw new Error('Test part not found');
  }

  return existing;
};

const ensurePassageExists = async (id) => {
  const existing = await prisma.testPassage.findUnique({
    where: { id },
    select: { id: true, testPartId: true },
  });

  if (!existing) {
    throw new Error('Test passage not found');
  }

  return existing;
};

const ensureQuestionExists = async (id) => {
  const existing = await prisma.testQuestion.findUnique({
    where: { id },
    select: { id: true, testPartId: true, passageId: true },
  });

  if (!existing) {
    throw new Error('Test question not found');
  }

  return existing;
};

const ensureAnswerExists = async (id) => {
  const existing = await prisma.testAnswer.findUnique({
    where: { id },
    select: { id: true, questionId: true },
  });

  if (!existing) {
    throw new Error('Test answer not found');
  }

  return existing;
};

const recalculateTotalQuestions = async (testId) => {
  const totalQuestions = await prisma.testQuestion.count({
    where: { testPart: { testId } },
  });

  await prisma.test.update({
    where: { id: testId },
    data: { totalQuestions },
  });
};

const createTest = async (testData, createdById) => {
  const {
    title,
    description,
    type,
    skill,
    durationMinutes,
    totalQuestions,
    status,
    isGuestAllowed,
  } = testData;

  return prisma.test.create({
    data: {
      title,
      description,
      type,
      skill,
      durationMinutes: Number(durationMinutes),
      ...(totalQuestions !== undefined && {
        totalQuestions: Number(totalQuestions),
      }),
      ...(status !== undefined && { status }),
      ...(isGuestAllowed !== undefined && { isGuestAllowed }),
      createdById,
    },
    select: testSelect,
  });
};

const getAllTests = async ({ status, type, skill, search } = {}) => {
  const where = {};

  where.status = status === 'PUBLISHED' ? status : 'PUBLISHED';
  if (type) where.type = type;
  if (skill) where.skill = skill;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.test.findMany({
    where,
    select: testListSelect,
    orderBy: { createdAt: 'desc' },
  });
};

const getTestById = async (id) => {
  const test = await prisma.test.findUnique({
    where: { id },
    select: testSelect,
  });

  if (!test) {
    throw new Error('Test not found');
  }

  return test;
};

const getTestPreviewById = async (id) => {
  const test = await prisma.test.findUnique({
    where: { id },
    select: testPreviewSelect,
  });

  if (!test) {
    throw new Error('Test not found');
  }

  if (test.status !== 'PUBLISHED') {
    throw new Error('Test is not published');
  }

  return test;
};

const updateTest = async (id, testData) => {
  await ensureTestExists(id);

  const {
    title,
    description,
    type,
    skill,
    durationMinutes,
    totalQuestions,
    status,
    isGuestAllowed,
  } = testData;
  const data = {};

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (type !== undefined) data.type = type;
  if (skill !== undefined) data.skill = skill;
  if (durationMinutes !== undefined)
    data.durationMinutes = Number(durationMinutes);
  if (totalQuestions !== undefined) data.totalQuestions = Number(totalQuestions);
  if (status !== undefined) data.status = status;
  if (isGuestAllowed !== undefined) data.isGuestAllowed = isGuestAllowed;

  return prisma.test.update({
    where: { id },
    data,
    select: testSelect,
  });
};

const deleteTest = async (id) => {
  await ensureTestExists(id);

  await prisma.test.delete({
    where: { id },
  });

  return { message: 'Test deleted successfully' };
};

const publishTest = async (id) => {
  const existing = await ensureTestExists(id);

  if (existing.status !== 'DRAFT') {
    throw new Error('Only draft tests can be published');
  }

  const questionCount = await prisma.testQuestion.count({
    where: { testPart: { testId: id } },
  });

  if (questionCount === 0) {
    throw new Error('Test must have at least one question before publishing');
  }

  await recalculateTotalQuestions(id);

  return prisma.test.update({
    where: { id },
    data: { status: 'PUBLISHED' },
    select: testSelect,
  });
};

const createPart = async (testId, partData) => {
  await ensureTestExists(testId);

  const { name, instruction, order } = partData;

  return prisma.testPart.create({
    data: {
      testId,
      name,
      instruction,
      order,
    },
    select: {
      id: true,
      testId: true,
      name: true,
      instruction: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updatePart = async (id, partData) => {
  await ensurePartExists(id);

  const { name, instruction, order } = partData;
  const data = {};

  if (name !== undefined) data.name = name;
  if (instruction !== undefined) data.instruction = instruction;
  if (order !== undefined) data.order = order;

  return prisma.testPart.update({
    where: { id },
    data,
    select: {
      id: true,
      testId: true,
      name: true,
      instruction: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deletePart = async (id) => {
  const existing = await ensurePartExists(id);

  await prisma.testPart.delete({
    where: { id },
  });

  await recalculateTotalQuestions(existing.testId);

  return { message: 'Test part deleted successfully' };
};

const createPassage = async (testPartId, passageData) => {
  await ensurePartExists(testPartId);

  const { title, content, audioUrl, imageUrl, order } = passageData;

  return prisma.testPassage.create({
    data: {
      testPartId,
      title,
      content,
      audioUrl: audioUrl || null,
      imageUrl: imageUrl || null,
      order,
    },
    select: {
      id: true,
      testPartId: true,
      title: true,
      content: true,
      audioUrl: true,
      imageUrl: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const updatePassage = async (id, passageData) => {
  await ensurePassageExists(id);

  const { title, content, audioUrl, imageUrl, order } = passageData;
  const data = {};

  if (title !== undefined) data.title = title;
  if (content !== undefined) data.content = content;
  if (audioUrl !== undefined) data.audioUrl = audioUrl || null;
  if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
  if (order !== undefined) data.order = order;

  return prisma.testPassage.update({
    where: { id },
    data,
    select: {
      id: true,
      testPartId: true,
      title: true,
      content: true,
      audioUrl: true,
      imageUrl: true,
      order: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deletePassage = async (id) => {
  await ensurePassageExists(id);

  await prisma.testPassage.delete({
    where: { id },
  });

  return { message: 'Test passage deleted successfully' };
};

const createQuestion = async (testPartId, questionData) => {
  await ensurePartExists(testPartId);

  const { passageId, content, type, points, order, audioUrl, imageUrl } =
    questionData;

  if (passageId) {
    const passage = await ensurePassageExists(passageId);
    if (passage.testPartId !== testPartId) {
      throw new Error('Passage does not belong to this test part');
    }
  }

  const question = await prisma.testQuestion.create({
    data: {
      testPartId,
      passageId: passageId || null,
      content,
      type,
      points: points !== undefined ? Number(points) : undefined,
      order,
      audioUrl: audioUrl || null,
      imageUrl: imageUrl || null,
    },
    select: {
      id: true,
      testPartId: true,
      passageId: true,
      content: true,
      type: true,
      points: true,
      order: true,
      audioUrl: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const part = await ensurePartExists(testPartId);
  await recalculateTotalQuestions(part.testId);

  return question;
};

const updateQuestion = async (id, questionData) => {
  const existing = await ensureQuestionExists(id);
  const {
    passageId,
    content,
    type,
    points,
    order,
    audioUrl,
    imageUrl,
  } = questionData;
  const data = {};

  if (passageId !== undefined) {
    if (passageId) {
      const passage = await ensurePassageExists(passageId);
      if (passage.testPartId !== existing.testPartId) {
        throw new Error('Passage does not belong to this test part');
      }
      data.passageId = passageId;
    } else {
      data.passageId = null;
    }
  }
  if (content !== undefined) data.content = content;
  if (type !== undefined) data.type = type;
  if (points !== undefined) data.points = Number(points);
  if (order !== undefined) data.order = order;
  if (audioUrl !== undefined) data.audioUrl = audioUrl || null;
  if (imageUrl !== undefined) data.imageUrl = imageUrl || null;

  return prisma.testQuestion.update({
    where: { id },
    data,
    select: {
      id: true,
      testPartId: true,
      passageId: true,
      content: true,
      type: true,
      points: true,
      order: true,
      audioUrl: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteQuestion = async (id) => {
  const existing = await ensureQuestionExists(id);
  const part = await ensurePartExists(existing.testPartId);

  await prisma.testQuestion.delete({
    where: { id },
  });

  await recalculateTotalQuestions(part.testId);

  return { message: 'Test question deleted successfully' };
};

const createAnswer = async (questionId, answerData) => {
  await ensureQuestionExists(questionId);
  const { content, isCorrect } = answerData;

  return prisma.testAnswer.create({
    data: {
      questionId,
      content,
      isCorrect,
    },
    select: {
      id: true,
      questionId: true,
      content: true,
      isCorrect: true,
    },
  });
};

const updateAnswer = async (id, answerData) => {
  await ensureAnswerExists(id);
  const { content, isCorrect } = answerData;
  const data = {};

  if (content !== undefined) data.content = content;
  if (isCorrect !== undefined) data.isCorrect = isCorrect;

  return prisma.testAnswer.update({
    where: { id },
    data,
    select: {
      id: true,
      questionId: true,
      content: true,
      isCorrect: true,
    },
  });
};

const deleteAnswer = async (id) => {
  await ensureAnswerExists(id);

  await prisma.testAnswer.delete({
    where: { id },
  });

  return { message: 'Test answer deleted successfully' };
};

export default {
  createTest,
  getAllTests,
  getTestById,
  getTestPreviewById,
  updateTest,
  deleteTest,
  publishTest,
  createPart,
  updatePart,
  deletePart,
  createPassage,
  updatePassage,
  deletePassage,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
};

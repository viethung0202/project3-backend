import prisma from '../configs/index.js';

const flashcardSelect = {
  id: true,
  flashcardSetId: true,
  front: true,
  back: true,
  example: true,
  pronunciation: true,
  audioUrl: true,
  imageUrl: true,
  order: true,
  createdAt: true,
  updatedAt: true,
};

const flashcardSetSelect = {
  id: true,
  moduleId: true,
  title: true,
  description: true,
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
  flashcards: {
    select: flashcardSelect,
    orderBy: { order: 'asc' },
  },
};

const getFlashcardSetsByModuleId = async (moduleId) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, title: true, courseId: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  const flashcardSets = await prisma.flashcardSet.findMany({
    where: { moduleId },
    select: flashcardSetSelect,
    orderBy: { order: 'asc' },
  });

  return {
    module,
    flashcardSets,
  };
};

const createFlashcardSet = async (moduleId, setData) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true },
  });

  if (!module) {
    throw new Error('Module not found');
  }

  const { title, description, order } = setData;

  let nextOrder = order;
  if (nextOrder === undefined || nextOrder === null) {
    const lastSet = await prisma.flashcardSet.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    nextOrder = lastSet ? lastSet.order + 1 : 1;
  }

  return prisma.flashcardSet.create({
    data: {
      moduleId,
      title,
      description,
      order: nextOrder,
    },
    select: flashcardSetSelect,
  });
};

const updateFlashcardSet = async (id, setData) => {
  const existingSet = await prisma.flashcardSet.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingSet) {
    throw new Error('Flashcard set not found');
  }

  const { title, description, order } = setData;
  const data = {};

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (order !== undefined) data.order = order;

  return prisma.flashcardSet.update({
    where: { id },
    data,
    select: flashcardSetSelect,
  });
};

const deleteFlashcardSet = async (id) => {
  const existingSet = await prisma.flashcardSet.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingSet) {
    throw new Error('Flashcard set not found');
  }

  await prisma.flashcardSet.delete({
    where: { id },
  });

  return { message: 'Flashcard set deleted successfully' };
};

const createFlashcard = async (setId, flashcardData) => {
  const flashcardSet = await prisma.flashcardSet.findUnique({
    where: { id: setId },
    select: { id: true },
  });

  if (!flashcardSet) {
    throw new Error('Flashcard set not found');
  }

  const { front, back, example, pronunciation, audioUrl, imageUrl, order } =
    flashcardData;

  let nextOrder = order;
  if (nextOrder === undefined || nextOrder === null) {
    const lastFlashcard = await prisma.flashcard.findFirst({
      where: { flashcardSetId: setId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    nextOrder = lastFlashcard ? lastFlashcard.order + 1 : 1;
  }

  return prisma.flashcard.create({
    data: {
      flashcardSetId: setId,
      front,
      back,
      example,
      pronunciation,
      audioUrl,
      imageUrl,
      order: nextOrder,
    },
    select: flashcardSelect,
  });
};

const updateFlashcard = async (id, flashcardData) => {
  const existingFlashcard = await prisma.flashcard.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingFlashcard) {
    throw new Error('Flashcard not found');
  }

  const { front, back, example, pronunciation, audioUrl, imageUrl, order } =
    flashcardData;
  const data = {};

  if (front !== undefined) data.front = front;
  if (back !== undefined) data.back = back;
  if (example !== undefined) data.example = example;
  if (pronunciation !== undefined) data.pronunciation = pronunciation;
  if (audioUrl !== undefined) data.audioUrl = audioUrl;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (order !== undefined) data.order = order;

  return prisma.flashcard.update({
    where: { id },
    data,
    select: flashcardSelect,
  });
};

const deleteFlashcard = async (id) => {
  const existingFlashcard = await prisma.flashcard.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingFlashcard) {
    throw new Error('Flashcard not found');
  }

  await prisma.flashcard.delete({
    where: { id },
  });

  return { message: 'Flashcard deleted successfully' };
};

export default {
  getFlashcardSetsByModuleId,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
};

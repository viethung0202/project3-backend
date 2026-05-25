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

export default {
  getLessonsByModuleId,
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
};

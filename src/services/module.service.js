import prisma from '../configs/index.js';

const moduleSelect = {
  id: true,
  courseId: true,
  title: true,
  description: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  course: {
    select: {
      id: true,
      title: true,
      status: true,
    },
  },
};

const getModulesByCourseId = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, status: true },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const modules = await prisma.module.findMany({
    where: { courseId },
    select: moduleSelect,
    orderBy: { order: 'asc' },
  });

  return {
    course,
    modules,
  };
};

const createModule = async (courseId, moduleData) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const { title, description, order } = moduleData;

  let nextOrder = order;
  if (nextOrder === undefined || nextOrder === null) {
    const lastModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    nextOrder = lastModule ? lastModule.order + 1 : 1;
  }

  return prisma.module.create({
    data: {
      courseId,
      title,
      description,
      order: nextOrder,
    },
    select: moduleSelect,
  });
};

const getModuleById = async (id) => {
  const module = await prisma.module.findUnique({
    where: { id },
    select: moduleSelect,
  });

  if (!module) {
    throw new Error('Module not found');
  }

  return module;
};

const updateModule = async (id, moduleData) => {
  const existingModule = await prisma.module.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingModule) {
    throw new Error('Module not found');
  }

  const { title, description, order } = moduleData;
  const data = {};

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (order !== undefined) data.order = order;

  return prisma.module.update({
    where: { id },
    data,
    select: moduleSelect,
  });
};

const deleteModule = async (id) => {
  const existingModule = await prisma.module.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingModule) {
    throw new Error('Module not found');
  }

  await prisma.module.delete({
    where: { id },
  });

  return { message: 'Module deleted successfully' };
};

const reorderModules = async (modules) => {
  if (!Array.isArray(modules) || modules.length === 0) {
    throw new Error('Modules array is required');
  }

  const firstModule = await prisma.module.findUnique({
    where: { id: modules[0].id },
    select: { courseId: true },
  });

  if (!firstModule) {
    throw new Error('Module not found');
  }

  const targetCourseId = firstModule.courseId;

  const existingModules = await prisma.module.findMany({
    where: {
      id: { in: modules.map((item) => item.id) },
    },
    select: { id: true, courseId: true },
  });

  if (existingModules.length !== modules.length) {
    throw new Error('One or more modules were not found');
  }

  const hasDifferentCourse = existingModules.some(
    (module) => module.courseId !== targetCourseId,
  );

  if (hasDifferentCourse) {
    throw new Error('All modules must belong to the same course');
  }

  await prisma.$transaction(
    modules.map((item) =>
      prisma.module.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );

  return prisma.module.findMany({
    where: { courseId: targetCourseId },
    select: moduleSelect,
    orderBy: { order: 'asc' },
  });
};

export default {
  getModulesByCourseId,
  createModule,
  getModuleById,
  updateModule,
  deleteModule,
  reorderModules,
};

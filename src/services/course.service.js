import prisma from '../configs/index.js';

const courseSelect = {
  id: true,
  title: true,
  description: true,
  thumbnail: true,
  level: true,
  status: true,
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
};

const createCourse = async (courseData, createdById) => {
  const { title, description, thumbnail, level } = courseData;

  return prisma.course.create({
    data: {
      title,
      description,
      thumbnail,
      level,
      createdById,
    },
    select: courseSelect,
  });
};

const getAllCourses = async () => {
  return prisma.course.findMany({
    select: courseSelect,
    orderBy: { createdAt: 'desc' },
  });
};

const getCourseById = async (id) => {
  const course = await prisma.course.findUnique({
    where: { id },
    select: courseSelect,
  });

  if (!course) {
    throw new Error('Course not found');
  }

  return course;
};

const updateCourse = async (id, courseData) => {
  const existingCourse = await prisma.course.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCourse) {
    throw new Error('Course not found');
  }

  const { title, description, thumbnail, level } = courseData;
  const data = {};

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (thumbnail !== undefined) data.thumbnail = thumbnail;
  if (level !== undefined) data.level = level;

  return prisma.course.update({
    where: { id },
    data,
    select: courseSelect,
  });
};

const deleteCourse = async (id) => {
  const existingCourse = await prisma.course.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingCourse) {
    throw new Error('Course not found');
  }

  await prisma.course.delete({
    where: { id },
  });

  return { message: 'Course deleted successfully' };
};

const publishCourse = async (id) => {
  const existingCourse = await prisma.course.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!existingCourse) {
    throw new Error('Course not found');
  }

  if (existingCourse.status !== 'DRAFT') {
    throw new Error('Only draft courses can be published');
  }

  return prisma.course.update({
    where: { id },
    data: { status: 'PUBLISHED' },
    select: courseSelect,
  });
};

const addTeacherToCourse = async (courseId, teacherId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!teacher) {
    throw new Error('Teacher not found');
  }

  if (teacher.role !== 'TEACHER') {
    throw new Error('User is not a teacher');
  }

  const existingAssignment = await prisma.courseTeacher.findUnique({
    where: {
      courseId_teacherId: {
        courseId,
        teacherId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error('Teacher already assigned to this course');
  }

  return prisma.courseTeacher.create({
    data: {
      courseId,
      teacherId,
    },
    select: {
      id: true,
      courseId: true,
      teacherId: true,
      assignedAt: true,
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

const removeTeacherFromCourse = async (courseId, teacherId) => {
  const assignment = await prisma.courseTeacher.findUnique({
    where: {
      courseId_teacherId: {
        courseId,
        teacherId,
      },
    },
    select: { id: true },
  });

  if (!assignment) {
    throw new Error('Teacher is not assigned to this course');
  }

  await prisma.courseTeacher.delete({
    where: {
      courseId_teacherId: {
        courseId,
        teacherId,
      },
    },
  });

  return { message: 'Teacher removed from course successfully' };
};

const getCourseTeachers = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, status: true },
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const teachers = await prisma.courseTeacher.findMany({
    where: { courseId },
    select: {
      id: true,
      assignedAt: true,
      teacher: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  return {
    course,
    teachers,
  };
};

export default {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  addTeacherToCourse,
  removeTeacherFromCourse,
  getCourseTeachers,
};

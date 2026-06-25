import prisma from '../configs/index.js';

const documentSelect = {
  id: true,
  title: true,
  description: true,
  fileUrl: true,
  fileType: true,
  courseId: true,
  uploadedById: true,
  isPublished: true,
  allowDownload: true,
  createdAt: true,
  updatedAt: true,
  course: { select: { id: true, title: true } },
  uploadedBy: {
    select: { id: true, fullName: true, email: true, role: true },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      teacher: { select: { id: true, fullName: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  },
};

const computeStats = (doc) => {
  const reviews = doc.reviews || [];
  if (reviews.length === 0) {
    return { ...doc, avgRating: null, reviewCount: 0 };
  }
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return {
    ...doc,
    avgRating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
};

const list = async ({ courseId, search, fileType, published } = {}) => {
  const where = {};
  if (courseId === 'null' || courseId === null) where.courseId = null;
  else if (courseId) where.courseId = courseId;
  if (fileType) where.fileType = fileType;
  if (published === 'true') where.isPublished = true;
  else if (published === 'false') where.isPublished = false;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const docs = await prisma.document.findMany({
    where,
    select: documentSelect,
    orderBy: { createdAt: 'desc' },
  });
  return docs.map(computeStats);
};

// Teacher: thấy tất cả document (cả unpublished), kèm rating
const listForTeacher = async ({ courseId, search } = {}) => {
  return list({ courseId, search });
};

// Cho student: chỉ thấy doc của course đã enroll + doc không gắn course (public-ish)
// VÀ chỉ document đã isPublished=true
const listForStudent = async (studentId, { search, courseId } = {}) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    select: { courseId: true },
  });
  const enrolledIds = enrollments.map((e) => e.courseId);

  const where = {
    isPublished: true,
    OR: [{ courseId: null }, { courseId: { in: enrolledIds } }],
  };

  if (courseId) {
    if (!enrolledIds.includes(courseId)) {
      throw new Error('Bạn chưa đăng ký khóa học này');
    }
    where.OR = undefined;
    where.courseId = courseId;
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const docs = await prisma.document.findMany({
    where,
    select: documentSelect,
    orderBy: { createdAt: 'desc' },
  });
  return docs.map(computeStats);
};

const getById = async (id, requester) => {
  const doc = await prisma.document.findUnique({
    where: { id },
    select: documentSelect,
  });
  if (!doc) throw new Error('Document not found');

  if (requester?.role === 'STUDENT') {
    if (!doc.isPublished) {
      throw new Error('Học liệu này chưa được công bố');
    }
    if (doc.courseId) {
      const enrolled = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: requester.id,
            courseId: doc.courseId,
          },
        },
        select: { id: true },
      });
      if (!enrolled) {
        throw new Error('Bạn không có quyền xem học liệu này');
      }
    }
  }

  return computeStats(doc);
};

const create = async (data, uploadedById) => {
  const {
    title,
    description,
    fileUrl,
    fileType,
    courseId,
    isPublished,
    allowDownload,
  } = data;
  if (!title || !fileUrl) {
    throw new Error('Thiếu tiêu đề hoặc file');
  }

  if (courseId) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) throw new Error('Khóa học không tồn tại');
  }

  const doc = await prisma.document.create({
    data: {
      title,
      description: description || null,
      fileUrl,
      fileType: fileType || null,
      courseId: courseId || null,
      uploadedById,
      isPublished: isPublished !== undefined ? !!isPublished : true,
      allowDownload: allowDownload !== undefined ? !!allowDownload : true,
    },
    select: documentSelect,
  });
  return computeStats(doc);
};

const update = async (id, data) => {
  const existing = await prisma.document.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error('Document not found');

  const {
    title,
    description,
    fileUrl,
    fileType,
    courseId,
    isPublished,
    allowDownload,
  } = data;
  const patch = {};
  if (title !== undefined) patch.title = title;
  if (description !== undefined) patch.description = description;
  if (fileUrl !== undefined) patch.fileUrl = fileUrl;
  if (fileType !== undefined) patch.fileType = fileType;
  if (isPublished !== undefined) patch.isPublished = !!isPublished;
  if (allowDownload !== undefined) patch.allowDownload = !!allowDownload;
  if (courseId !== undefined) {
    if (courseId === null || courseId === '') {
      patch.courseId = null;
    } else {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!course) throw new Error('Khóa học không tồn tại');
      patch.courseId = courseId;
    }
  }

  const doc = await prisma.document.update({
    where: { id },
    data: patch,
    select: documentSelect,
  });
  return computeStats(doc);
};

const remove = async (id) => {
  const existing = await prisma.document.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error('Document not found');

  await prisma.document.delete({ where: { id } });
  return { message: 'Đã xóa học liệu' };
};

// ========== REVIEWS (teacher) ==========

const upsertReview = async ({ documentId, teacherId, rating, comment }) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating phải từ 1 đến 5');
  }
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true },
  });
  if (!doc) throw new Error('Document not found');

  return prisma.documentReview.upsert({
    where: {
      documentId_teacherId: { documentId, teacherId },
    },
    update: { rating, comment: comment || null },
    create: { documentId, teacherId, rating, comment: comment || null },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      teacher: { select: { id: true, fullName: true, avatar: true } },
    },
  });
};

const deleteReview = async ({ documentId, teacherId }) => {
  const review = await prisma.documentReview.findUnique({
    where: { documentId_teacherId: { documentId, teacherId } },
    select: { id: true },
  });
  if (!review) throw new Error('Bạn chưa đánh giá học liệu này');
  await prisma.documentReview.delete({
    where: { documentId_teacherId: { documentId, teacherId } },
  });
  return { message: 'Đã xóa đánh giá' };
};

export default {
  list,
  listForTeacher,
  listForStudent,
  getById,
  create,
  update,
  remove,
  upsertReview,
  deleteReview,
};

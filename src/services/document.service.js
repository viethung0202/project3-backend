import prisma from '../configs/index.js';

const documentSelect = {
  id: true,
  title: true,
  description: true,
  source: true,
  fileUrl: true,
  fileType: true,
  courseId: true,
  uploadedById: true,
  isPublished: true,
  allowDownload: true,
  downloadCount: true,
  viewCount: true,
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
      student: { select: { id: true, fullName: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  },
  feedbacks: {
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      teacher: { select: { id: true, fullName: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  },
  lessons: {
    select: {
      id: true,
      order: true,
      lesson: {
        select: {
          id: true,
          title: true,
          module: {
            select: {
              id: true,
              title: true,
              courseId: true,
              course: { select: { id: true, title: true } },
            },
          },
        },
      },
    },
  },
};

const computeStats = (doc) => {
  const reviews = doc.reviews || [];
  const feedbacks = doc.feedbacks || [];
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10,
        ) / 10
      : null;
  return {
    ...doc,
    avgRating,
    reviewCount: reviews.length,
    feedbackCount: feedbacks.length,
  };
};

// sort: newest (default) | downloads | views | title
const buildOrderBy = (sort) => {
  switch (sort) {
    case 'downloads':
      return [{ downloadCount: 'desc' }, { createdAt: 'desc' }];
    case 'views':
      return [{ viewCount: 'desc' }, { createdAt: 'desc' }];
    case 'title':
      return [{ title: 'asc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }];
  }
};

const sortByRating = (items) =>
  [...items].sort((a, b) => {
    const ra = a.avgRating ?? -1;
    const rb = b.avgRating ?? -1;
    if (rb !== ra) return rb - ra;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

const list = async ({
  courseId,
  search,
  fileType,
  published,
  source,
  sort,
} = {}) => {
  const where = {};
  if (courseId === 'null' || courseId === null) where.courseId = null;
  else if (courseId) where.courseId = courseId;
  if (fileType) where.fileType = fileType;
  if (published === 'true') where.isPublished = true;
  else if (published === 'false') where.isPublished = false;
  if (source) where.source = source;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ];
  }

  const docs = await prisma.document.findMany({
    where,
    select: documentSelect,
    orderBy: sort === 'rating' ? { createdAt: 'desc' } : buildOrderBy(sort),
  });
  const result = docs.map(computeStats);
  return sort === 'rating' ? sortByRating(result) : result;
};

// Teacher: thấy tất cả document (cả unpublished), kèm rating
const listForTeacher = async ({ courseId, search, sort, source } = {}) => {
  return list({ courseId, search, sort, source });
};

// Cho student: chỉ thấy doc của course đã enroll + doc không gắn course (public-ish)
// VÀ chỉ document đã isPublished=true
const listForStudent = async (
  studentId,
  { search, courseId, sort, source } = {},
) => {
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

  if (source) where.source = source;

  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { source: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const docs = await prisma.document.findMany({
    where,
    select: documentSelect,
    orderBy: sort === 'rating' ? { createdAt: 'desc' } : buildOrderBy(sort),
  });
  const result = docs.map(computeStats);
  return sort === 'rating' ? sortByRating(result) : result;
};

// Lấy danh sách distinct sources để render filter dropdown
const distinctSources = async ({ forStudent, studentId } = {}) => {
  const where = { source: { not: null } };

  if (forStudent && studentId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      select: { courseId: true },
    });
    where.isPublished = true;
    where.OR = [
      { courseId: null },
      { courseId: { in: enrollments.map((e) => e.courseId) } },
    ];
  }

  const rows = await prisma.document.findMany({
    where,
    select: { source: true },
    distinct: ['source'],
    orderBy: { source: 'asc' },
  });
  return rows.map((r) => r.source).filter(Boolean);
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
    source,
    fileUrl,
    fileType,
    courseId,
    isPublished,
    allowDownload,
  } = data;
  if (!title || !fileUrl) {
    throw new Error('Thiếu tiêu đề hoặc file');
  }
  if (!source?.trim()) {
    throw new Error('Vui lòng nhập nguồn tài liệu');
  }
  if (source.trim().length > 300) {
    throw new Error('Nguồn tài liệu quá dài (tối đa 300 ký tự)');
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
      source: source.trim(),
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
    source,
    fileUrl,
    fileType,
    courseId,
    isPublished,
    allowDownload,
  } = data;
  const patch = {};
  if (title !== undefined) patch.title = title;
  if (description !== undefined) patch.description = description;
  if (source !== undefined) {
    const trimmed = (source || '').trim();
    if (!trimmed) throw new Error('Vui lòng nhập nguồn tài liệu');
    if (trimmed.length > 300)
      throw new Error('Nguồn tài liệu quá dài (tối đa 300 ký tự)');
    patch.source = trimmed;
  }
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

// ========== METRICS ==========

const trackDownload = async (id, requester) => {
  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, isPublished: true, allowDownload: true, courseId: true },
  });
  if (!doc) throw new Error('Document not found');

  if (requester?.role === 'STUDENT') {
    if (!doc.isPublished) throw new Error('Học liệu này chưa được công bố');
    if (!doc.allowDownload) throw new Error('Học liệu này không cho phép tải');
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
      if (!enrolled) throw new Error('Bạn không có quyền tải học liệu này');
    }
  }

  await prisma.document.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  });
  return { success: true };
};

const trackView = async (id, requester) => {
  const doc = await prisma.document.findUnique({
    where: { id },
    select: { id: true, isPublished: true, courseId: true },
  });
  if (!doc) throw new Error('Document not found');

  if (requester?.role === 'STUDENT') {
    if (!doc.isPublished) throw new Error('Học liệu này chưa được công bố');
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
      if (!enrolled) throw new Error('Bạn không có quyền xem học liệu này');
    }
  }

  await prisma.document.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
  return { success: true };
};

// ========== REVIEWS (student) — rating + comment ==========

const REVIEW_COOLDOWN_MS = 30 * 1000; // 30s giữa 2 lần update review của cùng student/doc

const upsertReview = async ({ documentId, studentId, rating, comment }) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating phải từ 1 đến 5');
  }
  if (comment && comment.length > 1000) {
    throw new Error('Bình luận quá dài (tối đa 1000 ký tự)');
  }
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, isPublished: true, courseId: true },
  });
  if (!doc) throw new Error('Document not found');

  // Rate limit: chống spam update liên tục
  const existing = await prisma.documentReview.findUnique({
    where: { documentId_studentId: { documentId, studentId } },
    select: { updatedAt: true },
  });
  if (existing) {
    const elapsed = Date.now() - new Date(existing.updatedAt).getTime();
    if (elapsed < REVIEW_COOLDOWN_MS) {
      const wait = Math.ceil((REVIEW_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Vui lòng đợi ${wait}s trước khi cập nhật đánh giá`);
    }
  }
  if (!doc.isPublished) {
    throw new Error('Học liệu này chưa được công bố');
  }
  // Nếu doc gắn course → student phải đã enroll
  if (doc.courseId) {
    const enrolled = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: doc.courseId } },
      select: { id: true },
    });
    if (!enrolled) {
      throw new Error('Bạn phải đăng ký khóa học mới được đánh giá');
    }
  }

  return prisma.documentReview.upsert({
    where: { documentId_studentId: { documentId, studentId } },
    update: { rating, comment: comment || null },
    create: { documentId, studentId, rating, comment: comment || null },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      student: { select: { id: true, fullName: true, avatar: true } },
    },
  });
};

const deleteReview = async ({ documentId, studentId }) => {
  const review = await prisma.documentReview.findUnique({
    where: { documentId_studentId: { documentId, studentId } },
    select: { id: true },
  });
  if (!review) throw new Error('Bạn chưa đánh giá học liệu này');
  await prisma.documentReview.delete({
    where: { documentId_studentId: { documentId, studentId } },
  });
  return { message: 'Đã xóa đánh giá' };
};

// ========== FEEDBACKS (teacher) — chỉ nội dung text ==========

const FEEDBACK_COOLDOWN_MS = 30 * 1000;

const upsertFeedback = async ({ documentId, teacherId, content }) => {
  const text = (content || '').trim();
  if (!text) throw new Error('Nội dung góp ý không được để trống');
  if (text.length > 2000) {
    throw new Error('Góp ý quá dài (tối đa 2000 ký tự)');
  }
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true },
  });
  if (!doc) throw new Error('Document not found');

  const existing = await prisma.documentFeedback.findUnique({
    where: { documentId_teacherId: { documentId, teacherId } },
    select: { updatedAt: true },
  });
  if (existing) {
    const elapsed = Date.now() - new Date(existing.updatedAt).getTime();
    if (elapsed < FEEDBACK_COOLDOWN_MS) {
      const wait = Math.ceil((FEEDBACK_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`Vui lòng đợi ${wait}s trước khi cập nhật góp ý`);
    }
  }

  return prisma.documentFeedback.upsert({
    where: { documentId_teacherId: { documentId, teacherId } },
    update: { content: text },
    create: { documentId, teacherId, content: text },
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      teacher: { select: { id: true, fullName: true, avatar: true } },
    },
  });
};

const deleteFeedback = async ({ documentId, teacherId }) => {
  const fb = await prisma.documentFeedback.findUnique({
    where: { documentId_teacherId: { documentId, teacherId } },
    select: { id: true },
  });
  if (!fb) throw new Error('Bạn chưa góp ý cho học liệu này');
  await prisma.documentFeedback.delete({
    where: { documentId_teacherId: { documentId, teacherId } },
  });
  return { message: 'Đã xóa góp ý' };
};

export default {
  list,
  listForTeacher,
  listForStudent,
  distinctSources,
  getById,
  create,
  update,
  remove,
  trackDownload,
  trackView,
  upsertReview,
  deleteReview,
  upsertFeedback,
  deleteFeedback,
};

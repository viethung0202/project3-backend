import documentService from '../services/document.service.js';
import cloudinaryService from '../configs/cloudinary.js';

const mapStatus = (err) => {
  const msg = err.message || '';
  if (msg === 'Document not found') return 404;
  if (msg.includes('không có quyền') || msg.includes('chưa đăng ký'))
    return 403;
  return 400;
};

const list = async (req, res) => {
  try {
    const { courseId, search, fileType, published } = req.query;
    let data;
    if (req.user.role === 'STUDENT') {
      data = await documentService.listForStudent(req.user.id, {
        courseId,
        search,
      });
    } else if (req.user.role === 'TEACHER') {
      data = await documentService.listForTeacher({ courseId, search });
    } else {
      data = await documentService.list({
        courseId,
        search,
        fileType,
        published,
      });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không thể lấy danh sách học liệu',
    });
  }
};

const getById = async (req, res) => {
  try {
    const data = await documentService.getById(req.params.id, req.user);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không tìm thấy học liệu',
    });
  }
};

const parseBool = (v) => {
  if (v === undefined) return undefined;
  if (typeof v === 'boolean') return v;
  return v === 'true' || v === '1' || v === 'on';
};

const create = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'Vui lòng chọn file' });
    }

    const { url } = await cloudinaryService.uploadDocument(req.file);
    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || null;

    const data = await documentService.create(
      {
        title: req.body.title,
        description: req.body.description,
        courseId: req.body.courseId || null,
        fileUrl: url,
        fileType: ext,
        isPublished: parseBool(req.body.isPublished),
        allowDownload: parseBool(req.body.allowDownload),
      },
      req.user.id,
    );

    res.status(201).json({
      success: true,
      message: 'Tải lên học liệu thành công',
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Tải lên thất bại',
    });
  }
};

const update = async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.isPublished !== undefined)
      body.isPublished = parseBool(body.isPublished);
    if (body.allowDownload !== undefined)
      body.allowDownload = parseBool(body.allowDownload);
    if (req.file) {
      const { url } = await cloudinaryService.uploadDocument(req.file);
      body.fileUrl = url;
      body.fileType =
        req.file.originalname.split('.').pop()?.toLowerCase() || null;
    }
    const data = await documentService.update(req.params.id, body);
    res.status(200).json({
      success: true,
      message: 'Cập nhật học liệu thành công',
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Cập nhật thất bại',
    });
  }
};

const remove = async (req, res) => {
  try {
    const result = await documentService.remove(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Xóa thất bại',
    });
  }
};

// ===== STUDENT REVIEW =====
const upsertReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const data = await documentService.upsertReview({
      documentId: req.params.id,
      studentId: req.user.id,
      rating: Number(rating),
      comment,
    });
    res.status(200).json({
      success: true,
      message: 'Đã lưu đánh giá',
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Lưu đánh giá thất bại',
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const result = await documentService.deleteReview({
      documentId: req.params.id,
      studentId: req.user.id,
    });
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Xóa đánh giá thất bại',
    });
  }
};

// ===== TEACHER FEEDBACK =====
const upsertFeedback = async (req, res) => {
  try {
    const { content } = req.body;
    const data = await documentService.upsertFeedback({
      documentId: req.params.id,
      teacherId: req.user.id,
      content,
    });
    res.status(200).json({
      success: true,
      message: 'Đã lưu góp ý',
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Lưu góp ý thất bại',
    });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const result = await documentService.deleteFeedback({
      documentId: req.params.id,
      teacherId: req.user.id,
    });
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Xóa góp ý thất bại',
    });
  }
};

export default {
  list,
  getById,
  create,
  update,
  remove,
  upsertReview,
  deleteReview,
  upsertFeedback,
  deleteFeedback,
};

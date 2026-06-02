import lessonService from '../services/lesson.service.js';
import cloudinaryService from '../configs/cloudinary.js';

const getLessonsByModuleId = async (req, res) => {
  try {
    const result = await lessonService.getLessonsByModuleId(req.params.moduleId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get lessons',
    });
  }
};

const createLesson = async (req, res) => {
  try {
    // Multer .fields() đặt files vào req.files thay vì req.file
    if (req.files?.video?.[0]) {
      req.body.videoUrl = await cloudinaryService.uploadVideo(req.files.video[0]);
    }
    if (req.files?.pdf?.[0]) {
      req.body.pdfUrl = await cloudinaryService.uploadPdf(req.files.pdf[0]);
    }

    const lesson = await lessonService.createLesson(req.params.moduleId, req.body);

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create lesson',
    });
  }
};

const getLessonById = async (req, res) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);

    res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(error.message === 'Lesson not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get lesson',
    });
  }
};

const updateLesson = async (req, res) => {
  try {
    if (req.files?.video?.[0]) {
      req.body.videoUrl = await cloudinaryService.uploadVideo(req.files.video[0]);
    }
    if (req.files?.pdf?.[0]) {
      req.body.pdfUrl = await cloudinaryService.uploadPdf(req.files.pdf[0]);
    }

    const lesson = await lessonService.updateLesson(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson,
    });
  } catch (error) {
    res.status(error.message === 'Lesson not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update lesson',
    });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const result = await lessonService.deleteLesson(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Lesson not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete lesson',
    });
  }
};

const markComplete = async (req, res) => {
  try {
    const data = await lessonService.markComplete(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu hoàn thành',
      data,
    });
  } catch (error) {
    const msg = error.message || '';
    res
      .status(
        msg === 'Lesson not found'
          ? 404
          : msg.includes('chưa được đăng ký')
            ? 403
            : 400,
      )
      .json({ success: false, message: msg || 'Đánh dấu thất bại' });
  }
};

const unmarkComplete = async (req, res) => {
  try {
    const data = await lessonService.unmarkComplete(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Đã bỏ đánh dấu',
      data,
    });
  } catch (error) {
    res.status(error.message === 'Lesson not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Bỏ đánh dấu thất bại',
    });
  }
};

export default {
  getLessonsByModuleId,
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
  markComplete,
  unmarkComplete,
};

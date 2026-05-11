import lessonService from '../services/lesson.service.js';

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

export default {
  getLessonsByModuleId,
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson,
};

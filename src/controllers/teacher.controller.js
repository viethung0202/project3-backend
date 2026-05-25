import teacherService from '../services/teacher.service.js';

const getMyCourses = async (req, res) => {
  try {
    const courses = await teacherService.getMyCourses(req.user.id);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get courses',
    });
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await teacherService.getStats(req.user.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stats',
    });
  }
};

const getCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await teacherService.getCourseEnrollments(
      req.user.id,
      req.params.courseId,
    );
    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    res
      .status(error.message?.includes('không phải giáo viên') ? 403 : 500)
      .json({
        success: false,
        message: error.message || 'Failed to get enrollments',
      });
  }
};

export default { getMyCourses, getStats, getCourseEnrollments };

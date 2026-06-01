import studentService from '../services/student.service.js';

const getMyCourses = async (req, res) => {
  try {
    const courses = await studentService.getMyCourses(req.user.id);
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
    const stats = await studentService.getStats(req.user.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stats',
    });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const data = await studentService.getQuizHistory(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get quiz history',
    });
  }
};

export default { getMyCourses, getStats, getQuizHistory };

import enrollmentService from '../services/enrollment.service.js';

const list = async (req, res) => {
  try {
    const { courseId, studentId } = req.query;
    const data = await enrollmentService.list({ courseId, studentId });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get enrollments',
    });
  }
};

const create = async (req, res) => {
  try {
    const enrollment = await enrollmentService.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Đã enroll học sinh vào khóa học',
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Enroll thất bại',
    });
  }
};

const remove = async (req, res) => {
  try {
    const result = await enrollmentService.remove(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res
      .status(error.message === 'Không tìm thấy enrollment' ? 404 : 400)
      .json({
        success: false,
        message: error.message || 'Gỡ enrollment thất bại',
      });
  }
};

export default { list, create, remove };

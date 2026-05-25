import enrollmentService from '../services/enrollment.service.js';
import prisma from '../configs/index.js';

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
    // STUDENT chỉ được enroll cho chính mình (bỏ qua studentId trong body, dùng req.user.id)
    const studentId =
      req.user.role === 'STUDENT' ? req.user.id : req.body.studentId;

    const enrollment = await enrollmentService.create({
      studentId,
      courseId: req.body.courseId,
    });
    res.status(201).json({
      success: true,
      message:
        req.user.role === 'STUDENT'
          ? 'Đăng ký khóa học thành công'
          : 'Đã enroll học sinh vào khóa học',
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
    // STUDENT chỉ được hủy enrollment của chính mình
    if (req.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: req.params.id },
        select: { studentId: true },
      });
      if (!enrollment) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy enrollment' });
      }
      if (enrollment.studentId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có thể hủy đăng ký của chính mình',
        });
      }
    }

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

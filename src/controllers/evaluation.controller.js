import evaluationService from '../services/evaluation.service.js';

const upsert = async (req, res) => {
  try {
    const data = await evaluationService.upsertEvaluation(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Lưu đánh giá thành công',
      data,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const listForCourse = async (req, res) => {
  try {
    const data = await evaluationService.listForCourse(
      req.user.id,
      req.params.courseId,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await evaluationService.deleteEvaluation(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getMineForCourse = async (req, res) => {
  try {
    const data = await evaluationService.getMineForCourse(
      req.user.id,
      req.params.courseId,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const listMine = async (req, res) => {
  try {
    const data = await evaluationService.listMine(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export default { upsert, listForCourse, remove, getMineForCourse, listMine };

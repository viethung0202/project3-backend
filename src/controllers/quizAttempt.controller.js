import quizAttemptService from '../services/quizAttempt.service.js';

const mapStatus = (err) => {
  const msg = err.message || '';
  if (msg === 'Quiz not found' || msg === 'Attempt not found') return 404;
  if (msg.includes('không có quyền') || msg.includes('chưa được đăng ký'))
    return 403;
  return 400;
};

const startAttempt = async (req, res) => {
  try {
    const data = await quizAttemptService.startAttempt(
      req.user.id,
      req.params.id,
    );
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không thể bắt đầu bài làm',
    });
  }
};

const getAttempt = async (req, res) => {
  try {
    const data = await quizAttemptService.getAttempt(
      req.params.id,
      req.user.id,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không thể lấy attempt',
    });
  }
};

const saveAnswer = async (req, res) => {
  try {
    const { questionId, selectedAnswers } = req.body;
    const data = await quizAttemptService.saveAnswer({
      attemptId: req.params.id,
      studentId: req.user.id,
      questionId,
      selectedAnswers,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Lưu đáp án thất bại',
    });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const data = await quizAttemptService.submitAttempt(
      req.params.id,
      req.user.id,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Nộp bài thất bại',
    });
  }
};

const getResult = async (req, res) => {
  try {
    const data = await quizAttemptService.getResult(
      req.params.id,
      req.user.id,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không thể lấy kết quả',
    });
  }
};

const getMyAttempts = async (req, res) => {
  try {
    const data = await quizAttemptService.getMyAttempts(
      req.user.id,
      req.params.id,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Không thể lấy lịch sử',
    });
  }
};

export default {
  startAttempt,
  getAttempt,
  saveAnswer,
  submitAttempt,
  getResult,
  getMyAttempts,
};

import testAttemptService from '../services/testAttempt.service.js';

const mapStatus = (error) => {
  const msg = error.message || '';
  if (msg === 'Test not found' || msg === 'Attempt not found') return 404;
  if (msg.includes('không có quyền')) return 403;
  return 400;
};

const startAttempt = async (req, res) => {
  try {
    const data = await testAttemptService.startAttempt(req.user.id, req.params.id);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không thể bắt đầu bài làm',
    });
  }
};

const getAttempt = async (req, res) => {
  try {
    const data = await testAttemptService.getAttempt(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không thể lấy attempt',
    });
  }
};

const saveAnswer = async (req, res) => {
  try {
    const data = await testAttemptService.saveAnswer({
      attemptId: req.params.id,
      studentId: req.user.id,
      questionId: req.body.questionId,
      selectedAnswers: req.body.selectedAnswers,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Lưu đáp án thất bại',
    });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const data = await testAttemptService.submitAttempt(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Nộp bài thất bại',
    });
  }
};

const getResult = async (req, res) => {
  try {
    const data = await testAttemptService.getResult(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Không thể lấy kết quả',
    });
  }
};

const getMyAttempts = async (req, res) => {
  try {
    const data = await testAttemptService.getMyAttempts(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
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

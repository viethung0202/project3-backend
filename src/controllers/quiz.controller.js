import quizService from '../services/quiz.service.js';

const getQuizzesByModuleId = async (req, res) => {
  try {
    const result = await quizService.getQuizzesByModuleId(req.params.moduleId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get quizzes',
    });
  }
};

const createQuiz = async (req, res) => {
  try {
    const quiz = await quizService.createQuiz(req.params.moduleId, req.body);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create quiz',
    });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(req.params.id);

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    res.status(error.message === 'Quiz not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get quiz',
    });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const quiz = await quizService.updateQuiz(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz,
    });
  } catch (error) {
    res.status(error.message === 'Quiz not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update quiz',
    });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const result = await quizService.deleteQuiz(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Quiz not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete quiz',
    });
  }
};

export default {
  getQuizzesByModuleId,
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
};

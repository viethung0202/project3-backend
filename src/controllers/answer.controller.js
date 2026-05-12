import answerService from '../services/answer.service.js';

const createAnswer = async (req, res) => {
  try {
    const answer = await answerService.createAnswer(
      req.params.questionId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      data: answer,
    });
  } catch (error) {
    res.status(error.message === 'Question not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create answer',
    });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const answer = await answerService.updateAnswer(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Answer updated successfully',
      data: answer,
    });
  } catch (error) {
    res.status(error.message === 'Answer not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update answer',
    });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const result = await answerService.deleteAnswer(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Answer not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete answer',
    });
  }
};

export default {
  createAnswer,
  updateAnswer,
  deleteAnswer,
};

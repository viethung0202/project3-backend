import testService from '../services/test.service.js';

const updateAnswer = async (req, res) => {
  try {
    const answer = await testService.updateAnswer(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Test answer updated successfully',
      data: answer,
    });
  } catch (error) {
    res.status(error.message === 'Test answer not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update test answer',
    });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const result = await testService.deleteAnswer(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Test answer not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete test answer',
    });
  }
};

export default {
  updateAnswer,
  deleteAnswer,
};

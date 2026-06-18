import cloudinaryService from '../configs/cloudinary.js';
import testService from '../services/test.service.js';

const uploadMedia = async (req) => {
  if (req.files?.audio?.[0]) {
    req.body.audioUrl = await cloudinaryService.uploadAudio(req.files.audio[0]);
  }
  if (req.files?.image?.[0]) {
    req.body.imageUrl = await cloudinaryService.uploadImage(req.files.image[0]);
  }
};

const updateQuestion = async (req, res) => {
  try {
    await uploadMedia(req);
    const question = await testService.updateQuestion(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Test question updated successfully',
      data: question,
    });
  } catch (error) {
    res.status(error.message === 'Test question not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update test question',
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const result = await testService.deleteQuestion(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Test question not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete test question',
    });
  }
};

const createAnswer = async (req, res) => {
  try {
    const answer = await testService.createAnswer(req.params.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Test answer created successfully',
      data: answer,
    });
  } catch (error) {
    res.status(error.message === 'Test question not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create test answer',
    });
  }
};

export default {
  updateQuestion,
  deleteQuestion,
  createAnswer,
};

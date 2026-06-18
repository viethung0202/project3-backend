import questionService from '../services/question.service.js';
import cloudinaryService from '../configs/cloudinary.js';

// Multer .fields() đặt files vào req.files. Upload audio/image lên Cloudinary
// và ghi đè url tương ứng vào req.body để service lưu DB.
const uploadMedia = async (req) => {
  if (req.files?.audio?.[0]) {
    req.body.audioUrl = await cloudinaryService.uploadAudio(req.files.audio[0]);
  }
  if (req.files?.image?.[0]) {
    req.body.imageUrl = await cloudinaryService.uploadImage(req.files.image[0]);
  }
};

const createQuestion = async (req, res) => {
  try {
    await uploadMedia(req);

    const question = await questionService.createQuestion(
      req.params.quizId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question,
    });
  } catch (error) {
    res.status(error.message === 'Quiz not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create question',
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    await uploadMedia(req);

    const question = await questionService.updateQuestion(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question,
    });
  } catch (error) {
    res.status(error.message === 'Question not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update question',
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const result = await questionService.deleteQuestion(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Question not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete question',
    });
  }
};

export default {
  createQuestion,
  updateQuestion,
  deleteQuestion,
};

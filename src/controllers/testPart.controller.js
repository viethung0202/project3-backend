import cloudinaryService from '../configs/cloudinary.js';
import testService from '../services/test.service.js';

const mapStatus = (error) => {
  const msg = error.message || '';
  if (
    msg === 'Test part not found' ||
    msg === 'Test passage not found' ||
    msg === 'Test question not found'
  ) {
    return 404;
  }
  return 400;
};

const uploadMedia = async (req) => {
  if (req.files?.audio?.[0]) {
    req.body.audioUrl = await cloudinaryService.uploadAudio(req.files.audio[0]);
  }
  if (req.files?.image?.[0]) {
    req.body.imageUrl = await cloudinaryService.uploadImage(req.files.image[0]);
  }
};

const updatePart = async (req, res) => {
  try {
    const part = await testService.updatePart(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Test part updated successfully',
      data: part,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to update test part',
    });
  }
};

const deletePart = async (req, res) => {
  try {
    const result = await testService.deletePart(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to delete test part',
    });
  }
};

const createPassage = async (req, res) => {
  try {
    await uploadMedia(req);
    const passage = await testService.createPassage(req.params.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Test passage created successfully',
      data: passage,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to create test passage',
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    await uploadMedia(req);
    const question = await testService.createQuestion(req.params.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Test question created successfully',
      data: question,
    });
  } catch (error) {
    res.status(mapStatus(error)).json({
      success: false,
      message: error.message || 'Failed to create test question',
    });
  }
};

export default {
  updatePart,
  deletePart,
  createPassage,
  createQuestion,
};

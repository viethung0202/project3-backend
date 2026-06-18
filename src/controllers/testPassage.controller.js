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

const updatePassage = async (req, res) => {
  try {
    await uploadMedia(req);
    const passage = await testService.updatePassage(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Test passage updated successfully',
      data: passage,
    });
  } catch (error) {
    res.status(error.message === 'Test passage not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update test passage',
    });
  }
};

const deletePassage = async (req, res) => {
  try {
    const result = await testService.deletePassage(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Test passage not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete test passage',
    });
  }
};

export default {
  updatePassage,
  deletePassage,
};

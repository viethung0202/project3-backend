import flashcardService from '../services/flashcard.service.js';
import cloudinaryService from '../configs/cloudinary.js';

const getFlashcardSetsByModuleId = async (req, res) => {
  try {
    const result = await flashcardService.getFlashcardSetsByModuleId(
      req.params.moduleId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to get flashcard sets',
    });
  }
};

const createFlashcardSet = async (req, res) => {
  try {
    const flashcardSet = await flashcardService.createFlashcardSet(
      req.params.moduleId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: 'Flashcard set created successfully',
      data: flashcardSet,
    });
  } catch (error) {
    res.status(error.message === 'Module not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create flashcard set',
    });
  }
};

const updateFlashcardSet = async (req, res) => {
  try {
    const flashcardSet = await flashcardService.updateFlashcardSet(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Flashcard set updated successfully',
      data: flashcardSet,
    });
  } catch (error) {
    res.status(error.message === 'Flashcard set not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update flashcard set',
    });
  }
};

const deleteFlashcardSet = async (req, res) => {
  try {
    const result = await flashcardService.deleteFlashcardSet(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Flashcard set not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete flashcard set',
    });
  }
};

const createFlashcard = async (req, res) => {
  try {
    if (req.file) {
      req.body.imageUrl = await cloudinaryService.uploadImage(req.file);
    }

    const flashcard = await flashcardService.createFlashcard(
      req.params.setId,
      req.body,
    );

    res.status(201).json({
      success: true,
      message: 'Flashcard created successfully',
      data: flashcard,
    });
  } catch (error) {
    res.status(error.message === 'Flashcard set not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to create flashcard',
    });
  }
};

const updateFlashcard = async (req, res) => {
  try {
    if (req.file) {
      req.body.imageUrl = await cloudinaryService.uploadImage(req.file);
    }

    const flashcard = await flashcardService.updateFlashcard(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Flashcard updated successfully',
      data: flashcard,
    });
  } catch (error) {
    res.status(error.message === 'Flashcard not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to update flashcard',
    });
  }
};

const deleteFlashcard = async (req, res) => {
  try {
    const result = await flashcardService.deleteFlashcard(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error.message === 'Flashcard not found' ? 404 : 400).json({
      success: false,
      message: error.message || 'Failed to delete flashcard',
    });
  }
};

export default {
  getFlashcardSetsByModuleId,
  createFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
};
